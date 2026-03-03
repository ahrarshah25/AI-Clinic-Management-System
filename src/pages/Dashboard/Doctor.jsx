import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, Clock, FileText, ShieldAlert, Stethoscope } from "lucide-react";
import DashboardLayout from "../../components/Dashboard/Layout/DashboardLayout";
import StatCard from "../../components/Dashboard/Common/StatCard";
import DataTable from "../../components/Dashboard/Common/DataTable";
import StatusBadge from "../../components/Dashboard/Common/StatusBadge";
import ActionButton from "../../components/Dashboard/Common/ActionButton";
import ProfileManagementCard from "../../components/Dashboard/Common/ProfileManagementCard";
import PrescriptionModal from "../../components/Dashboard/Modals/PrescriptionModal";
import { ROLES } from "../../constants/roles";
import {
  hasAdvancedAnalytics,
  isAiEnabledForPlan,
  normalizePlan,
  PLANS,
} from "../../constants/subscription";
import { useAuth } from "../../hooks/useAuth";
import {
  detectRiskFlags,
  generatePrescriptionExplanation,
  runSmartSymptomChecker,
} from "../../utils/aiAssistant";
import Swal from "../../utils/swal";
import {
  createDiagnosis,
  createNotification,
  createPrescription,
  getDoctorAppointments,
  getPatientDiagnoses,
  getPatientTimeline,
  getPatients,
  updateAppointment,
} from "../../services/clinicFirestoreService";

const DoctorDashboard = () => {
  const { userData, loading: authLoading } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [selectedPatientDiagnoses, setSelectedPatientDiagnoses] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [diagnosisTitle, setDiagnosisTitle] = useState("");
  const [diagnosisNotes, setDiagnosisNotes] = useState("");
  const [symptomForm, setSymptomForm] = useState({
    symptoms: "",
    age: "",
    gender: "male",
    history: "",
  });
  const [checkerResult, setCheckerResult] = useState(null);
  const [riskFlags, setRiskFlags] = useState([]);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const currentPlan = normalizePlan(userData?.subscriptionPlan || PLANS.FREE);
  const aiEnabled = isAiEnabledForPlan(currentPlan);
  const advancedAnalyticsEnabled = hasAdvancedAnalytics(currentPlan);

  const refreshData = useCallback(async () => {
    if (!userData?.id) return;
    setLoading(true);
    setError("");
    try {
      const [doctorAppointments, allPatients] = await Promise.all([
        getDoctorAppointments(userData.id),
        getPatients(),
      ]);
      setAppointments(doctorAppointments || []);
      setPatients(allPatients || []);
      setSelectedPatientId((prev) => prev || doctorAppointments?.[0]?.patientId || "");
    } catch {
      setError("Failed to load doctor data.");
    } finally {
      setLoading(false);
    }
  }, [userData?.id]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  useEffect(() => {
    const loadPatientData = async () => {
      if (!selectedPatientId) {
        setTimeline([]);
        setRiskFlags([]);
        setSelectedPatientDiagnoses([]);
        return;
      }
      try {
        const [events, diagnosisRows] = await Promise.all([
          getPatientTimeline(selectedPatientId),
          getPatientDiagnoses(selectedPatientId),
        ]);
        setTimeline(events || []);
        setSelectedPatientDiagnoses(diagnosisRows || []);
        const flags = await detectRiskFlags(
          { diagnoses: diagnosisRows || [], symptoms: symptomForm.symptoms },
          userData?.role || ROLES.DOCTOR
        );
        setRiskFlags(flags);
      } catch {
        setTimeline([]);
        setRiskFlags([]);
      }
    };
    loadPatientData();
  }, [selectedPatientId, symptomForm.symptoms, userData?.role]);

  const doctorPatients = useMemo(() => {
    const linkedIds = new Set(appointments.map((item) => item.patientId).filter(Boolean));
    return patients.filter((item) => linkedIds.has(item.id));
  }, [appointments, patients]);

  const pendingAppointments = useMemo(
    () => appointments.filter((item) => ["pending", "pending_doctor"].includes(item.status)),
    [appointments]
  );
  const completedAppointments = useMemo(
    () => appointments.filter((item) => item.status === "completed"),
    [appointments]
  );

  const thisMonthAppointments = useMemo(() => {
    const now = new Date();
    return appointments.filter((item) => {
      const date = new Date(item.date || item.createdAt || 0);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length;
  }, [appointments]);

  const stats = [
    { title: "My Appointments", value: appointments.length, icon: Stethoscope, color: "blue" },
    { title: "Pending", value: pendingAppointments.length, icon: Clock, color: "orange" },
    { title: "Completed", value: completedAppointments.length, icon: Activity, color: "green" },
    { title: "Patients", value: doctorPatients.length, icon: FileText, color: "purple" },
  ];

  const appointmentColumns = [
    { key: "patientName", label: "Patient" },
    { key: "date", label: "Date", render: (val) => new Date(val).toLocaleDateString() },
    { key: "time", label: "Time" },
    { key: "type", label: "Type" },
    { key: "status", label: "Status", render: (val) => <StatusBadge status={val} /> },
  ];

  const handleAppointmentStatus = async (row, status) => {
    const confirmation = await Swal.confirm(
      "Confirm Status Update",
      `Mark this appointment as ${status}?`
    );
    if (!confirmation.isConfirmed) return;

    try {
      await updateAppointment(row.id, { status });
      if (row.patientId) {
        await createNotification({
          recipientId: row.patientId,
          recipientRole: ROLES.PATIENT,
          type: "appointment_status",
          title: "Appointment Status Updated",
          message: `Dr. ${userData?.fullName || "Doctor"} marked your appointment as ${status}.`,
          link: "/dashboard/patient",
          appointmentId: row.id,
          patientId: row.patientId,
          doctorId: row.doctorId || userData?.id || null,
        });
      }
      setAppointments((prev) => prev.map((item) => (item.id === row.id ? { ...item, status } : item)));
      await Swal.success("Status Updated", "Appointment status updated.");
    } catch {
      await Swal.error("Update Failed", "Could not update appointment status.");
    }
  };

  const appointmentActions = (row) => (
    <div className="flex flex-wrap justify-end gap-2">
      {["pending", "pending_doctor"].includes(row.status) ? (
        <ActionButton size="sm" variant="success" onClick={() => handleAppointmentStatus(row, "confirmed")}>
          Confirm
        </ActionButton>
      ) : null}
      {row.status === "confirmed" ? (
        <ActionButton size="sm" variant="secondary" onClick={() => handleAppointmentStatus(row, "completed")}>
          Complete
        </ActionButton>
      ) : null}
    </div>
  );

  const handleSaveDiagnosis = async () => {
    if (!selectedPatientId || !diagnosisTitle || !diagnosisNotes) return;
    try {
      await createDiagnosis({
        patientId: selectedPatientId,
        patientName: doctorPatients.find((item) => item.id === selectedPatientId)?.fullName || "",
        doctorId: userData?.id || null,
        doctorName: userData?.fullName || "",
        title: diagnosisTitle,
        notes: diagnosisNotes,
        symptoms: symptomForm.symptoms || "",
        aiResponse: checkerResult || null,
        riskLevel: checkerResult?.riskLevel || "unknown",
        date: new Date().toISOString(),
      });
      setDiagnosisTitle("");
      setDiagnosisNotes("");
      const [updatedEvents, diagnosisRows] = await Promise.all([
        getPatientTimeline(selectedPatientId),
        getPatientDiagnoses(selectedPatientId),
      ]);
      setTimeline(updatedEvents || []);
      setSelectedPatientDiagnoses(diagnosisRows || []);
      const flags = await detectRiskFlags(
        { diagnoses: diagnosisRows || [], symptoms: symptomForm.symptoms },
        userData?.role || ROLES.DOCTOR
      );
      setRiskFlags(flags);
      await Swal.success("Diagnosis Saved", "Patient diagnosis has been recorded.");
    } catch {
      await Swal.error("Save Failed", "Could not save diagnosis.");
    }
  };

  const handleCreatePrescription = async (payload) => {
    try {
      const aiExplanation = aiEnabled
        ? await generatePrescriptionExplanation({
            patientName:
              doctorPatients.find((item) => item.id === payload.patientId)?.fullName ||
              payload.patientName,
            medications: payload.medications,
            instructions: payload.instructions,
            language: "en",
          }, userData?.role || ROLES.DOCTOR)
        : null;

      await createPrescription({
        ...payload,
        doctorId: userData?.id || payload.doctorId,
        doctorName: userData?.fullName || payload.doctorName,
        aiExplanation: aiExplanation?.explanation || "",
        aiExplanationUrdu: aiExplanation?.explanationUrdu || "",
        lifestyleRecommendations: aiExplanation?.lifestyleRecommendations || [],
        preventiveAdvice: aiExplanation?.preventiveAdvice || [],
      });
      setIsPrescriptionModalOpen(false);
      if (selectedPatientId) {
        const updated = await getPatientTimeline(selectedPatientId);
        setTimeline(updated || []);
      }
      await Swal.success("Prescription Saved", "Prescription has been generated.");
    } catch {
      await Swal.error("Save Failed", "Could not save prescription.");
    }
  };

  const handleSmartChecker = async () => {
    if (!aiEnabled) {
      await Swal.warning(
        "AI Not Available",
        "AI features are disabled on Free plan. Upgrade to Pro."
      );
      return;
    }
    if (!symptomForm.symptoms.trim()) {
      await Swal.warning("Symptoms Required", "Please enter symptoms to run AI checker.");
      return;
    }
    const result = await runSmartSymptomChecker(
      symptomForm,
      userData?.role || ROLES.DOCTOR
    );
    setCheckerResult(result);
    const flags = await detectRiskFlags(
      { diagnoses: selectedPatientDiagnoses, symptoms: symptomForm.symptoms },
      userData?.role || ROLES.DOCTOR
    );
    setRiskFlags(flags);
    await Swal.success("AI Analysis Ready", "Smart symptom checker results generated.");
  };

  if (authLoading) {
    return <div className="p-6">Authenticating...</div>;
  }

  return (
    <DashboardLayout role={ROLES.DOCTOR}>
      <div className="space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h1>
            <p className="text-gray-600">Appointments, diagnosis, prescriptions, and patient history.</p>
            <p className="mt-1 text-xs text-gray-500">
              Current Plan: {currentPlan.toUpperCase()} | AI Features: {aiEnabled ? "Enabled" : "Disabled"}
            </p>
            {error ? <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
          </div>
          <ActionButton onClick={() => setIsPrescriptionModalOpen(true)}>Write Prescription</ActionButton>
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
            <h2 className="text-lg font-semibold text-gray-900">Profile Access Overview</h2>
            <div className="mt-3 grid grid-cols-1 gap-3 text-sm text-gray-600 md:grid-cols-2">
              <p className="rounded-lg bg-gray-50 p-3">
                Role: <span className="font-semibold capitalize text-gray-900">{userData?.role || "doctor"}</span>
              </p>
              <p className="rounded-lg bg-gray-50 p-3">
                Verification: <span className="font-semibold text-gray-900">{userData?.isVerified ? "Verified" : "Pending"}</span>
              </p>
              <p className="rounded-lg bg-gray-50 p-3">
                Plan: <span className="font-semibold uppercase text-gray-900">{currentPlan}</span>
              </p>
              <p className="rounded-lg bg-gray-50 p-3">
                Last Update: <span className="font-semibold text-gray-900">{new Date(userData?.updatedAt || Date.now()).toLocaleDateString()}</span>
              </p>
            </div>
          </div>
        </div>

        {advancedAnalyticsEnabled ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-white p-4 shadow-lg">
              <p className="text-sm text-gray-500">Monthly Appointments</p>
              <p className="text-2xl font-bold text-gray-900">{thisMonthAppointments}</p>
            </div>
            <div className="rounded-xl bg-white p-4 shadow-lg">
              <p className="text-sm text-gray-500">Prescription Count</p>
              <p className="text-2xl font-bold text-gray-900">{timeline.filter((item) => item.type === "prescription").length}</p>
            </div>
            <div className="rounded-xl bg-white p-4 shadow-lg">
              <p className="text-sm text-gray-500">Risk Flags</p>
              <p className="text-2xl font-bold text-gray-900">{riskFlags.length}</p>
            </div>
          </div>
        ) : null}

        <div className="rounded-xl bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">My Appointments</h2>
          <DataTable
            columns={appointmentColumns}
            data={appointments}
            loading={loading}
            actions={appointmentActions}
            pageSize={8}
          />
        </div>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
          <div className="rounded-xl bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Add Diagnosis</h2>
            <select
              className="mb-3 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
            >
              <option value="">Select patient</option>
              {doctorPatients.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.fullName}
                </option>
              ))}
            </select>
            <input
              className="mb-3 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              placeholder="Diagnosis title"
              value={diagnosisTitle}
              onChange={(e) => setDiagnosisTitle(e.target.value)}
            />
            <textarea
              className="mb-3 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              rows={4}
              placeholder="Clinical notes and diagnosis details"
              value={diagnosisNotes}
              onChange={(e) => setDiagnosisNotes(e.target.value)}
            />
            <ActionButton onClick={handleSaveDiagnosis} disabled={!selectedPatientId || !diagnosisTitle || !diagnosisNotes}>
              Save Diagnosis
            </ActionButton>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Smart Symptom Checker</h2>
            <textarea
              className="mb-3 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              rows={3}
              placeholder="Enter symptoms"
              value={symptomForm.symptoms}
              onChange={(e) => setSymptomForm((prev) => ({ ...prev, symptoms: e.target.value }))}
            />
            <div className="mb-3 grid grid-cols-1 gap-2 md:grid-cols-3">
              <input
                type="number"
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                placeholder="Age"
                value={symptomForm.age}
                onChange={(e) => setSymptomForm((prev) => ({ ...prev, age: e.target.value }))}
              />
              <select
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={symptomForm.gender}
                onChange={(e) => setSymptomForm((prev) => ({ ...prev, gender: e.target.value }))}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <input
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                placeholder="History (e.g. chronic diabetes)"
                value={symptomForm.history}
                onChange={(e) => setSymptomForm((prev) => ({ ...prev, history: e.target.value }))}
              />
            </div>
            <ActionButton variant="outline" onClick={handleSmartChecker}>
              Run AI Checker
            </ActionButton>

            {checkerResult ? (
              <div className="mt-4 space-y-2 rounded-lg bg-blue-50 p-3 text-sm text-gray-700">
                <p className="font-semibold">Risk Level: {checkerResult.riskLevel.toUpperCase()}</p>
                <p>Possible Conditions: {checkerResult.possibleConditions.join(", ")}</p>
                <p>Suggested Tests: {checkerResult.suggestedTests.join(", ")}</p>
              </div>
            ) : null}
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-lg">
          <div className="mb-4 flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-orange-600" />
            <h2 className="text-lg font-semibold text-gray-900">Risk Flagging</h2>
          </div>
          <div className="space-y-2 text-sm">
            {riskFlags.length ? (
              riskFlags.map((flag) => (
                <p key={flag} className="rounded-lg bg-orange-50 p-3 text-orange-700">
                  {flag}
                </p>
              ))
            ) : (
              <p className="text-gray-500">No risk data yet.</p>
            )}
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Patient History Timeline</h2>
          {!timeline.length ? (
            <p className="text-sm text-gray-500">Select a patient to view timeline events.</p>
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

      <PrescriptionModal
        key={`doctor-rx-${isPrescriptionModalOpen ? "open" : "closed"}`}
        isOpen={isPrescriptionModalOpen}
        onClose={() => setIsPrescriptionModalOpen(false)}
        onSubmit={handleCreatePrescription}
        patients={doctorPatients}
        doctors={[userData].filter(Boolean)}
      />
    </DashboardLayout>
  );
};

export default DoctorDashboard;
