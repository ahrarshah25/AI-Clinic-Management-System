import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, CalendarDays, FileText, ImagePlus, User } from "lucide-react";
import DashboardLayout from "../../components/Dashboard/Layout/DashboardLayout";
import StatCard from "../../components/Dashboard/Common/StatCard";
import ProfileCard from "../../components/Dashboard/Common/ProfileCard";
import DataTable from "../../components/Dashboard/Common/DataTable";
import StatusBadge from "../../components/Dashboard/Common/StatusBadge";
import ActionButton from "../../components/Dashboard/Common/ActionButton";
import AppointmentModal from "../../components/Dashboard/Modals/AppointmentModal";
import { ROLES } from "../../constants/roles";
import { isAiEnabledForPlan, normalizePlan, PLANS } from "../../constants/subscription";
import { useAuth } from "../../hooks/useAuth";
import { downloadPrescriptionPdf } from "../../utils/prescriptionPdf";
import { uploadImageToCloudinary } from "../../utils/cloudinary";
import Swal from "../../utils/swal";
import {
  createAppointment,
  createNotification,
  getDoctors,
  getPatientAppointments,
  getPatientPrescriptions,
  getPatientTimeline,
  getReceptionists,
  updateAppointment,
  updateUserProfile,
} from "../../services/clinicFirestoreService";

const PatientDashboard = () => {
  const { userData, loading: authLoading, refreshProfile } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [showUrduExplanation, setShowUrduExplanation] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [profileDraft, setProfileDraft] = useState({
    fullName: "",
    phone: "",
    address: "",
    photoURL: "",
  });

  const currentPlan = normalizePlan(userData?.subscriptionPlan || PLANS.FREE);
  const aiEnabled = isAiEnabledForPlan(currentPlan);

  const refreshData = useCallback(async () => {
    if (!userData?.id) return;
    setLoading(true);
    setError("");
    try {
      const [appointmentsData, prescriptionsData, timelineData, doctorList] = await Promise.all([
        getPatientAppointments(userData.id),
        getPatientPrescriptions(userData.id),
        getPatientTimeline(userData.id),
        getDoctors(),
      ]);
      setAppointments(appointmentsData || []);
      setPrescriptions(prescriptionsData || []);
      setTimeline(timelineData || []);
      setDoctors((doctorList || []).filter((item) => item.isVerified));
    } catch {
      setError("Failed to load patient data.");
    } finally {
      setLoading(false);
    }
  }, [userData?.id]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  useEffect(() => {
    setProfileDraft({
      fullName: userData?.fullName || "",
      phone: userData?.phone || "",
      address: userData?.address || "",
      photoURL: userData?.photoURL || "",
    });
  }, [userData]);

  const profileView = useMemo(
    () => ({
      ...userData,
      ...profileDraft,
      photoURL: profileDraft.photoURL || userData?.photoURL || "",
    }),
    [profileDraft, userData]
  );

  const upcomingAppointments = useMemo(
    () =>
      appointments.filter(
        (item) =>
          new Date(item.date) >= new Date() &&
          !["cancelled", "rejected_reception"].includes(item.status)
      ),
    [appointments]
  );

  const stats = [
    { title: "Upcoming Appointments", value: upcomingAppointments.length, icon: CalendarDays, color: "blue" },
    { title: "Total Appointments", value: appointments.length, icon: Activity, color: "purple" },
    { title: "Prescriptions", value: prescriptions.length, icon: FileText, color: "green" },
    { title: "Profile Completion", value: profileDraft.address ? "100%" : "80%", icon: User, color: "orange" },
  ];

  const handleBookAppointment = async (payload) => {
    if (!userData?.id) return;

    try {
      const selectedDoctor = doctors.find((item) => item.id === payload.doctorId);
      const appointmentId = await createAppointment({
        ...payload,
        patientId: userData.id,
        patientName: userData.fullName,
        doctorName: selectedDoctor?.fullName || payload.doctorName || "",
        status: "pending_reception",
        bookedBy: userData.id,
        bookedByRole: ROLES.PATIENT,
      });

      const receptionists = await getReceptionists();
      const activeReceptionists = (receptionists || []).filter(
        (item) => item.isVerified && item.status !== "inactive"
      );

      await Promise.all(
        activeReceptionists.map((recipient) =>
          createNotification({
            recipientId: recipient.id,
            recipientRole: ROLES.RECEPTIONIST,
            type: "appointment_review",
            title: "New Appointment Request",
            message: `${userData.fullName} requested an appointment with Dr. ${selectedDoctor?.fullName || "Doctor"}.`,
            link: "/dashboard/receptionist",
            appointmentId,
            patientId: userData.id,
            doctorId: payload.doctorId || null,
          })
        )
      );

      setShowAppointmentModal(false);
      await refreshData();
      await Swal.success(
        "Request Submitted",
        "Your appointment request is sent to receptionist for approval."
      );
    } catch {
      await Swal.error("Booking Failed", "Could not book appointment.");
    }
  };

  const handleCancelAppointment = async (appointment) => {
    const confirmation = await Swal.confirm(
      "Cancel Appointment",
      "Are you sure you want to cancel this appointment?"
    );
    if (!confirmation.isConfirmed) return;

    try {
      await updateAppointment(appointment.id, { status: "cancelled" });
      setAppointments((prev) =>
        prev.map((item) => (item.id === appointment.id ? { ...item, status: "cancelled" } : item))
      );
      await Swal.success("Cancelled", "Appointment has been cancelled.");
    } catch {
      await Swal.error("Cancel Failed", "Could not cancel appointment.");
    }
  };

  const handleUpdateProfile = async () => {
    if (!userData?.id) return;
    try {
      await updateUserProfile(userData.id, {
        fullName: profileDraft.fullName,
        phone: profileDraft.phone,
        address: profileDraft.address,
        photoURL: profileDraft.photoURL || null,
      });
      setEditingProfile(false);
      await Promise.all([refreshData(), refreshProfile?.()]);
      await Swal.success("Profile Updated", "Your profile has been updated.");
    } catch {
      setError("Failed to update profile.");
      await Swal.error("Update Failed", "Could not update profile.");
    }
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !userData?.id) return;

    if (!file.type.startsWith("image/")) {
      await Swal.warning("Invalid File", "Please select a valid image file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      await Swal.warning("File Too Large", "Please upload an image up to 2MB.");
      return;
    }

    setUploadingPhoto(true);
    try {
      const secureUrl = await uploadImageToCloudinary(file);
      await updateUserProfile(userData.id, { photoURL: secureUrl });
      setProfileDraft((prev) => ({ ...prev, photoURL: secureUrl }));
      await Promise.all([refreshData(), refreshProfile?.()]);
      await Swal.success("Photo Updated", "Profile photo uploaded successfully.");
    } catch {
      await Swal.error("Upload Failed", "Could not upload profile photo.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const appointmentColumns = [
    { key: "doctorName", label: "Doctor", render: (val) => `Dr. ${val || "-"}` },
    { key: "date", label: "Date", render: (val) => new Date(val).toLocaleDateString() },
    { key: "time", label: "Time" },
    { key: "type", label: "Type" },
    { key: "status", label: "Status", render: (val) => <StatusBadge status={val} /> },
  ];

  const prescriptionColumns = [
    { key: "doctorName", label: "Doctor", render: (val) => `Dr. ${val || "-"}` },
    { key: "date", label: "Date", render: (val) => new Date(val).toLocaleDateString() },
    {
      key: "medications",
      label: "Medicines",
      render: (val) => (Array.isArray(val) ? val.map((item) => item.name).join(", ") : "-"),
    },
    { key: "instructions", label: "Notes" },
    {
      key: "aiExplanation",
      label: "AI Explanation",
      render: (_, row) => {
        if (!aiEnabled) return "Pro plan required";
        return showUrduExplanation
          ? row.aiExplanationUrdu || "Urdu explanation not available"
          : row.aiExplanation || "Not generated";
      },
    },
  ];

  const appointmentActions = (row) => (
    ["pending_reception", "pending_doctor", "pending", "confirmed"].includes(row.status) ? (
      <ActionButton size="sm" variant="danger" onClick={() => handleCancelAppointment(row)}>
        Cancel
      </ActionButton>
    ) : null
  );

  const prescriptionActions = (row) => (
    <ActionButton
      size="sm"
      variant="outline"
      onClick={() => {
        downloadPrescriptionPdf(row);
        Swal.success("Download Started", "Use print dialog to save as PDF.");
      }}
    >
      Download PDF
    </ActionButton>
  );

  if (authLoading) {
    return <div className="flex justify-center py-8">Loading...</div>;
  }

  return (
    <DashboardLayout role={ROLES.PATIENT}>
      <div className="space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Patient Dashboard</h1>
            <p className="text-gray-600">Profile, appointments, prescriptions, and medical timeline.</p>
            <p className="mt-1 text-xs text-gray-500">
              Current Plan: {currentPlan.toUpperCase()} | AI Explanation: {aiEnabled ? "Enabled" : "Disabled"}
            </p>
            {error ? <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
          </div>
          <ActionButton onClick={() => setShowAppointmentModal(true)}>Book Appointment</ActionButton>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <ProfileCard user={profileView} />
            <div className="mt-4 rounded-xl bg-white p-4 shadow-lg">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Edit Profile</h3>
                <ActionButton size="sm" variant="ghost" onClick={() => setEditingProfile((prev) => !prev)}>
                  {editingProfile ? "Close" : "Edit"}
                </ActionButton>
              </div>
              {editingProfile ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-2">
                    <img
                      src={profileDraft.photoURL || `https://ui-avatars.com/api/?name=${profileDraft.fullName || "Patient"}&background=random`}
                      alt="Profile"
                      className="h-14 w-14 rounded-full object-cover"
                    />
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:border-blue-300">
                      <ImagePlus className="h-4 w-4" />
                      {uploadingPhoto ? "Uploading..." : "Upload Photo"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoUpload}
                        disabled={uploadingPhoto}
                      />
                    </label>
                  </div>
                  <input
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    placeholder="Full name"
                    value={profileDraft.fullName}
                    onChange={(e) => setProfileDraft((prev) => ({ ...prev, fullName: e.target.value }))}
                  />
                  <input
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    placeholder="Phone"
                    value={profileDraft.phone}
                    onChange={(e) => setProfileDraft((prev) => ({ ...prev, phone: e.target.value }))}
                  />
                  <input
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    placeholder="Address"
                    value={profileDraft.address}
                    onChange={(e) => setProfileDraft((prev) => ({ ...prev, address: e.target.value }))}
                  />
                  <ActionButton size="sm" onClick={handleUpdateProfile}>
                    Save Changes
                  </ActionButton>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Use edit to update your profile details.</p>
              )}
            </div>
          </div>

          <div className="space-y-8 lg:col-span-2">
            <div className="rounded-xl bg-white p-6 shadow-lg">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Appointment History</h2>
              <DataTable
                columns={appointmentColumns}
                data={appointments}
                loading={loading}
                actions={appointmentActions}
                pageSize={6}
              />
            </div>

            <div className="rounded-xl bg-white p-6 shadow-lg">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Prescriptions</h2>
                {aiEnabled ? (
                  <label className="flex items-center gap-2 text-xs text-gray-600">
                    <input
                      type="checkbox"
                      checked={showUrduExplanation}
                      onChange={(e) => setShowUrduExplanation(e.target.checked)}
                    />
                    Urdu explanation
                  </label>
                ) : null}
              </div>
              <DataTable
                columns={prescriptionColumns}
                data={prescriptions}
                loading={loading}
                actions={prescriptionActions}
                pageSize={6}
              />
              {!aiEnabled ? (
                <p className="mt-3 rounded-lg bg-yellow-50 p-3 text-xs text-yellow-700">
                  AI-generated prescription explanation is available on Pro plan.
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Medical History Timeline</h2>
          {!timeline.length ? (
            <p className="text-sm text-gray-500">No timeline events available yet.</p>
          ) : (
            <div className="space-y-3">
              {timeline.map((event) => (
                <div key={event.id} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900">{event.title}</p>
                    <p className="text-xs text-gray-500">{new Date(event.timestamp).toLocaleString()}</p>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{event.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AppointmentModal
        key={`patient-booking-${showAppointmentModal ? "open" : "closed"}`}
        isOpen={showAppointmentModal}
        onClose={() => setShowAppointmentModal(false)}
        onSubmit={handleBookAppointment}
        patients={[userData].filter(Boolean)}
        doctors={doctors}
        showStatus={false}
      />
    </DashboardLayout>
  );
};

export default PatientDashboard;
