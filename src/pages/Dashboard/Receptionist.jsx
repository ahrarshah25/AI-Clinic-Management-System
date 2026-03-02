import { useCallback, useEffect, useMemo, useState } from "react";
import { Calendar, Clock, UserPlus, Users } from "lucide-react";
import DashboardLayout from "../../components/Dashboard/Layout/DashboardLayout";
import StatCard from "../../components/Dashboard/Common/StatCard";
import DataTable from "../../components/Dashboard/Common/DataTable";
import StatusBadge from "../../components/Dashboard/Common/StatusBadge";
import ActionButton from "../../components/Dashboard/Common/ActionButton";
import ProfileManagementCard from "../../components/Dashboard/Common/ProfileManagementCard";
import PatientModal from "../../components/Dashboard/Modals/PatientModal";
import AppointmentModal from "../../components/Dashboard/Modals/AppointmentModal";
import { ROLES } from "../../constants/roles";
import {
  getPatientLimitForPlan,
  normalizePlan,
  PLANS,
} from "../../constants/subscription";
import { useAuth } from "../../hooks/useAuth";
import Swal from "../../utils/swal";
import {
  createAppointment,
  createNotification,
  getCreatedPatientsByUser,
  createPatientRecord,
  getAllAppointments,
  getDoctors,
  getPatients,
  updateAppointment,
  updateUserProfile,
} from "../../services/clinicFirestoreService";

const ReceptionistDashboard = () => {
  const { userData } = useAuth();
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [createdPatients, setCreatedPatients] = useState([]);

  const refreshData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [patientList, doctorList, appointmentList, createdByMe] = await Promise.all([
        getPatients(),
        getDoctors(),
        getAllAppointments(),
        getCreatedPatientsByUser(userData?.id),
      ]);
      setPatients(patientList || []);
      setDoctors((doctorList || []).filter((item) => item.isVerified));
      setAppointments(appointmentList || []);
      setCreatedPatients(createdByMe || []);
    } catch {
      setError("Failed to load receptionist data.");
    } finally {
      setLoading(false);
    }
  }, [userData?.id]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const todayAppointments = useMemo(() => {
    const today = new Date().toDateString();
    return appointments.filter((item) => new Date(item.date).toDateString() === today);
  }, [appointments]);

  const pendingAppointments = useMemo(
    () => appointments.filter((item) => item.status === "pending_reception"),
    [appointments]
  );

  const stats = [
    { title: "Total Patients", value: patients.length, icon: Users, color: "blue" },
    { title: "Appointments Today", value: todayAppointments.length, icon: Calendar, color: "purple" },
    { title: "Pending Requests", value: pendingAppointments.length, icon: Clock, color: "orange" },
    { title: "Available Doctors", value: doctors.length, icon: UserPlus, color: "green" },
  ];

  const handleSavePatient = async (payload) => {
    try {
      if (selectedPatient?.id) {
        await updateUserProfile(selectedPatient.id, payload);
        await Swal.success("Patient Updated", "Patient profile updated successfully.");
      } else {
        const currentPlan = normalizePlan(userData?.subscriptionPlan || PLANS.FREE);
        const patientLimit = getPatientLimitForPlan(currentPlan);
        if (createdPatients.length >= patientLimit) {
          await Swal.warning(
            "Plan Limit Reached",
            `Free plan allows ${patientLimit} patients. Upgrade to Pro for unlimited patient records.`
          );
          return;
        }
        await createPatientRecord(payload, userData?.id || null);
        await Swal.success("Patient Registered", "New patient added successfully.");
      }
      setIsPatientModalOpen(false);
      setSelectedPatient(null);
      await refreshData();
    } catch {
      setError("Failed to save patient profile.");
      await Swal.error("Save Failed", "Could not save patient profile.");
    }
  };

  const notifyBooking = async (appointment, isApprovedFlow = false) => {
    const notifications = [];

    if (appointment.doctorId) {
      notifications.push(
        createNotification({
          recipientId: appointment.doctorId,
          recipientRole: ROLES.DOCTOR,
          type: isApprovedFlow ? "appointment_approved" : "appointment_booked",
          title: isApprovedFlow ? "New Approved Appointment" : "New Appointment Assigned",
          message: `Appointment for ${appointment.patientName} is ready for review.`,
          link: "/dashboard/doctor",
          appointmentId: appointment.id,
          patientId: appointment.patientId || null,
          doctorId: appointment.doctorId,
        })
      );
    }

    if (appointment.patientId) {
      notifications.push(
        createNotification({
          recipientId: appointment.patientId,
          recipientRole: ROLES.PATIENT,
          type: isApprovedFlow ? "appointment_approved" : "appointment_booked",
          title: isApprovedFlow ? "Appointment Approved" : "Appointment Scheduled",
          message: isApprovedFlow
            ? `Reception approved your appointment with Dr. ${appointment.doctorName || "Doctor"}.`
            : `Your appointment with Dr. ${appointment.doctorName || "Doctor"} has been scheduled.`,
          link: "/dashboard/patient",
          appointmentId: appointment.id,
          patientId: appointment.patientId,
          doctorId: appointment.doctorId || null,
        })
      );
    }

    await Promise.all(notifications);
  };

  const handleSaveAppointment = async (payload) => {
    try {
      if (selectedAppointment?.id) {
        await updateAppointment(selectedAppointment.id, {
          ...payload,
          status:
            payload.status && payload.status !== "pending_reception"
              ? payload.status
              : selectedAppointment.status,
        });
        await Swal.success("Appointment Updated", "Appointment updated successfully.");
      } else {
        const status =
          payload.status && payload.status !== "pending_reception"
            ? payload.status
            : "pending_doctor";

        const appointmentId = await createAppointment({
          ...payload,
          status,
          bookedBy: userData?.id || null,
          bookedByRole: ROLES.RECEPTIONIST,
        });

        await notifyBooking(
          {
            id: appointmentId,
            ...payload,
            status,
          },
          false
        );

        await Swal.success("Appointment Booked", "Appointment created successfully.");
      }
      setIsAppointmentModalOpen(false);
      setSelectedAppointment(null);
      await refreshData();
    } catch {
      setError("Failed to save appointment.");
      await Swal.error("Save Failed", "Could not save appointment.");
    }
  };

  const handleQuickStatusUpdate = async (appointment, status) => {
    const labelMap = {
      pending_doctor: "approved and forwarded to doctor",
      rejected_reception: "rejected",
      confirmed: "confirmed",
      completed: "completed",
    };

    const confirmation = await Swal.confirm(
      "Confirm Status Update",
      `Do you want to mark this appointment as ${labelMap[status] || status}?`
    );
    if (!confirmation.isConfirmed) return;

    try {
      await updateAppointment(appointment.id, {
        status,
        reviewedByReceptionistId: userData?.id || null,
      });

      if (status === "pending_doctor") {
        await notifyBooking(
          {
            ...appointment,
            status,
          },
          true
        );
      }

      if (status === "rejected_reception" && appointment.patientId) {
        await createNotification({
          recipientId: appointment.patientId,
          recipientRole: ROLES.PATIENT,
          type: "appointment_rejected",
          title: "Appointment Rejected",
          message: `Reception could not approve your appointment with Dr. ${appointment.doctorName || "Doctor"}. Please rebook.`,
          link: "/dashboard/patient",
          appointmentId: appointment.id,
          patientId: appointment.patientId,
          doctorId: appointment.doctorId || null,
        });
      }

      setAppointments((prev) =>
        prev.map((item) => (item.id === appointment.id ? { ...item, status } : item))
      );
      await Swal.success("Status Updated", "Appointment status updated successfully.");
    } catch {
      setError("Failed to update appointment status.");
      await Swal.error("Update Failed", "Could not update appointment status.");
    }
  };

  const patientColumns = [
    { key: "fullName", label: "Patient" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    {
      key: "medicalHistory",
      label: "Medical Notes",
      render: (val) => (val ? `${String(val).slice(0, 30)}...` : "Not added"),
    },
  ];

  const appointmentColumns = [
    { key: "patientName", label: "Patient" },
    { key: "doctorName", label: "Doctor", render: (val) => `Dr. ${val || "-"}` },
    { key: "date", label: "Date", render: (val) => new Date(val).toLocaleDateString() },
    { key: "time", label: "Time" },
    { key: "status", label: "Status", render: (val) => <StatusBadge status={val} /> },
  ];

  const patientActions = (row) => (
    <ActionButton
      size="sm"
      variant="outline"
      onClick={() => {
        setSelectedPatient(row);
        setIsPatientModalOpen(true);
      }}
    >
      Edit
    </ActionButton>
  );

  const appointmentActions = (row) => (
    <div className="flex flex-wrap justify-end gap-2">
      <ActionButton
        size="sm"
        variant="outline"
        onClick={() => {
          setSelectedAppointment(row);
          setIsAppointmentModalOpen(true);
        }}
      >
        Edit
      </ActionButton>
      {row.status === "pending_reception" ? (
        <>
          <ActionButton
            size="sm"
            variant="success"
            onClick={() => handleQuickStatusUpdate(row, "pending_doctor")}
          >
            Approve
          </ActionButton>
          <ActionButton
            size="sm"
            variant="danger"
            onClick={() => handleQuickStatusUpdate(row, "rejected_reception")}
          >
            Reject
          </ActionButton>
        </>
      ) : null}
      {["pending", "pending_doctor"].includes(row.status) ? (
        <ActionButton size="sm" variant="success" onClick={() => handleQuickStatusUpdate(row, "confirmed")}>
          Confirm
        </ActionButton>
      ) : null}
      {row.status === "confirmed" ? (
        <ActionButton size="sm" variant="secondary" onClick={() => handleQuickStatusUpdate(row, "completed")}>
          Complete
        </ActionButton>
      ) : null}
    </div>
  );

  return (
    <DashboardLayout role={ROLES.RECEPTIONIST}>
      <div className="space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Receptionist Dashboard</h1>
            <p className="text-gray-600">Register patients, book appointments, and manage daily schedule.</p>
            <p className="mt-1 text-xs text-gray-500">
              Current Plan: {normalizePlan(userData?.subscriptionPlan || PLANS.FREE).toUpperCase()} | Patient limit:
              {" "}
              {Number.isFinite(getPatientLimitForPlan(userData?.subscriptionPlan || PLANS.FREE))
                ? getPatientLimitForPlan(userData?.subscriptionPlan || PLANS.FREE)
                : "Unlimited"}
            </p>
            {error ? <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
          </div>
          <div className="flex gap-2">
            <ActionButton
              onClick={() => {
                setSelectedPatient(null);
                setIsPatientModalOpen(true);
              }}
            >
              Register Patient
            </ActionButton>
            <ActionButton
              variant="outline"
              onClick={() => {
                setSelectedAppointment(null);
                setIsAppointmentModalOpen(true);
              }}
            >
              Book Appointment
            </ActionButton>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <ProfileManagementCard user={userData} onUpdated={refreshData} />
          </div>
          <div className="rounded-xl bg-white p-6 shadow-lg lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900">Reception Desk Access</h2>
            <div className="mt-3 grid grid-cols-1 gap-3 text-sm text-gray-600 md:grid-cols-2">
              <p className="rounded-lg bg-gray-50 p-3">
                Role: <span className="font-semibold capitalize text-gray-900">{userData?.role || "receptionist"}</span>
              </p>
              <p className="rounded-lg bg-gray-50 p-3">
                Verification: <span className="font-semibold text-gray-900">{userData?.isVerified ? "Verified" : "Pending"}</span>
              </p>
              <p className="rounded-lg bg-gray-50 p-3">
                Plan: <span className="font-semibold uppercase text-gray-900">{normalizePlan(userData?.subscriptionPlan || PLANS.FREE)}</span>
              </p>
              <p className="rounded-lg bg-gray-50 p-3">
                Managed Patients: <span className="font-semibold text-gray-900">{createdPatients.length}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
          <div className="rounded-xl bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Patients</h2>
            <DataTable
              columns={patientColumns}
              data={patients}
              loading={loading}
              actions={patientActions}
              pageSize={6}
            />
          </div>

          <div className="rounded-xl bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Daily Schedule</h2>
            <DataTable
              columns={appointmentColumns}
              data={appointments}
              loading={loading}
              actions={appointmentActions}
              pageSize={6}
            />
          </div>
        </div>
      </div>

      <PatientModal
        key={`patient-modal-${selectedPatient?.id || "new"}-${isPatientModalOpen ? "open" : "closed"}`}
        isOpen={isPatientModalOpen}
        onClose={() => {
          setIsPatientModalOpen(false);
          setSelectedPatient(null);
        }}
        onSubmit={handleSavePatient}
        patient={selectedPatient}
      />

      <AppointmentModal
        key={`appointment-modal-${selectedAppointment?.id || "new"}-${isAppointmentModalOpen ? "open" : "closed"}`}
        isOpen={isAppointmentModalOpen}
        onClose={() => {
          setIsAppointmentModalOpen(false);
          setSelectedAppointment(null);
        }}
        onSubmit={handleSaveAppointment}
        appointment={selectedAppointment}
        patients={patients}
        doctors={doctors}
        showStatus={false}
      />
    </DashboardLayout>
  );
};

export default ReceptionistDashboard;
