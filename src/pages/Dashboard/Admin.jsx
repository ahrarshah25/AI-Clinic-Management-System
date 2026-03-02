import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  CreditCard,
  ShieldCheck,
  UserCheck,
  UserCog,
  UserX,
} from "lucide-react";
import DashboardLayout from "../../components/Dashboard/Layout/DashboardLayout";
import StatCard from "../../components/Dashboard/Common/StatCard";
import DataTable from "../../components/Dashboard/Common/DataTable";
import StatusBadge from "../../components/Dashboard/Common/StatusBadge";
import ActionButton from "../../components/Dashboard/Common/ActionButton";
import ProfileManagementCard from "../../components/Dashboard/Common/ProfileManagementCard";
import { ROLES } from "../../constants/roles";
import {
  hasAdvancedAnalytics,
  normalizePlan,
  PLANS,
} from "../../constants/subscription";
import { useAuth } from "../../hooks/useAuth";
import Swal from "../../utils/swal";
import {
  getAllAppointments,
  getAllDiagnoses,
  getAllPrescriptions,
  getAllUsers,
  getSubscriptionPlans,
  saveSubscriptionPlan,
  updateUserProfile,
} from "../../services/clinicFirestoreService";

const DEFAULT_PLAN = {
  name: "",
  planType: PLANS.PRO,
  price: "",
  billingCycle: "monthly",
  description: "",
  featuresText: "",
  patientLimit: "",
  maxDoctors: "",
  maxReceptionists: "",
  aiEnabled: true,
  advancedAnalytics: true,
  ctaText: "Upgrade Now",
  isPopular: false,
  sortOrder: "",
  isActive: true,
};

const PRO_DEFAULT_PRICE = 49;

const AdminDashboard = () => {
  const { userData } = useAuth();
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [diagnoses, setDiagnoses] = useState([]);
  const [plans, setPlans] = useState([]);
  const [planForm, setPlanForm] = useState(DEFAULT_PLAN);
  const [loading, setLoading] = useState(true);
  const [savingPlan, setSavingPlan] = useState(false);
  const [error, setError] = useState("");

  const adminPlan = normalizePlan(userData?.subscriptionPlan || PLANS.FREE);
  const advancedEnabled = hasAdvancedAnalytics(adminPlan);

  const refreshData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [allUsers, allAppointments, allPrescriptions, allDiagnoses, subscriptionPlans] =
        await Promise.all([
          getAllUsers(),
          getAllAppointments(),
          getAllPrescriptions(),
          getAllDiagnoses(),
          getSubscriptionPlans(),
        ]);
      setUsers(allUsers || []);
      setAppointments(allAppointments || []);
      setPrescriptions(allPrescriptions || []);
      setDiagnoses(allDiagnoses || []);
      setPlans(subscriptionPlans || []);
    } catch {
      setError("Failed to load admin data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const doctors = useMemo(() => users.filter((item) => item.role === ROLES.DOCTOR), [users]);
  const receptionists = useMemo(
    () => users.filter((item) => item.role === ROLES.RECEPTIONIST),
    [users]
  );
  const patients = useMemo(() => users.filter((item) => item.role === ROLES.PATIENT), [users]);
  const pendingStaff = useMemo(
    () =>
      users.filter(
        (item) =>
          [ROLES.DOCTOR, ROLES.RECEPTIONIST].includes(item.role) &&
          !item.isVerified
      ),
    [users]
  );

  const todayCount = useMemo(() => {
    const today = new Date().toDateString();
    return appointments.filter((item) => new Date(item.date).toDateString() === today).length;
  }, [appointments]);

  const monthlyAppointments = useMemo(() => {
    const now = new Date();
    return appointments.filter((item) => {
      const date = new Date(item.date || item.createdAt || 0);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length;
  }, [appointments]);

  const activeStaff = useMemo(
    () =>
      users.filter(
        (item) =>
          [ROLES.DOCTOR, ROLES.RECEPTIONIST].includes(item.role) &&
          item.status !== "inactive"
      ),
    [users]
  );

  const simulatedRevenue = useMemo(() => {
    const proUsers = activeStaff.filter(
      (item) => normalizePlan(item.subscriptionPlan) === PLANS.PRO
    ).length;
    return proUsers * PRO_DEFAULT_PRICE;
  }, [activeStaff]);

  const mostCommonDiagnosis = useMemo(() => {
    const now = new Date();
    const monthly = diagnoses.filter((item) => {
      const date = new Date(item.createdAt || item.date || 0);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    });
    if (!monthly.length) return "N/A";

    const counts = monthly.reduce((acc, item) => {
      const key = (item.title || "Unknown diagnosis").trim();
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
  }, [diagnoses]);

  const patientLoadForecast = useMemo(() => {
    const now = Date.now();
    const twoWeeksAgo = now - 14 * 24 * 60 * 60 * 1000;
    const recentAppointments = appointments.filter(
      (item) => new Date(item.createdAt || item.date || 0).getTime() >= twoWeeksAgo
    );
    const dailyAverage = recentAppointments.length / 14;
    return Math.max(0, Math.round(dailyAverage * 7));
  }, [appointments]);

  const doctorPerformance = useMemo(
    () =>
      doctors.map((doctor) => {
        const doctorAppointments = appointments.filter((item) => item.doctorId === doctor.id);
        const completed = doctorAppointments.filter((item) => item.status === "completed").length;
        const doctorPrescriptions = prescriptions.filter((item) => item.doctorId === doctor.id).length;
        const completionRate = doctorAppointments.length
          ? Math.round((completed / doctorAppointments.length) * 100)
          : 0;
        return {
          id: doctor.id,
          doctor: doctor.fullName || doctor.email || "Doctor",
          appointments: doctorAppointments.length,
          completed,
          prescriptions: doctorPrescriptions,
          completionRate: `${completionRate}%`,
        };
      }),
    [appointments, doctors, prescriptions]
  );

  const stats = [
    { title: "Total Patients", value: patients.length, icon: UserCog, color: "blue" },
    { title: "Total Doctors", value: doctors.length, icon: UserCheck, color: "purple" },
    { title: "Monthly Appointments", value: monthlyAppointments, icon: Activity, color: "orange" },
    { title: "Revenue (Simulated)", value: `$${simulatedRevenue}`, icon: CreditCard, color: "green" },
  ];

  const handleVerifyUser = async (targetUser) => {
    try {
      await updateUserProfile(targetUser.id, {
        isVerified: true,
        status: "active",
      });
      setUsers((prev) =>
        prev.map((item) =>
          item.id === targetUser.id ? { ...item, isVerified: true, status: "active" } : item
        )
      );
      await Swal.success("User Verified", `${targetUser.fullName} is now verified.`);
    } catch {
      await Swal.error("Update Failed", "Could not verify user. Please try again.");
    }
  };

  const handleToggleUserStatus = async (targetUser) => {
    const nextStatus = targetUser.status === "inactive" ? "active" : "inactive";
    const confirmation = await Swal.confirm(
      "Confirm Action",
      `Do you want to mark this user as ${nextStatus}?`
    );
    if (!confirmation.isConfirmed) return;

    try {
      await updateUserProfile(targetUser.id, { status: nextStatus });
      setUsers((prev) =>
        prev.map((item) => (item.id === targetUser.id ? { ...item, status: nextStatus } : item))
      );
      await Swal.success("Status Updated", `User status changed to ${nextStatus}.`);
    } catch {
      await Swal.error("Update Failed", "Could not update user status.");
    }
  };

  const handleAssignPlan = async (targetUser, plan) => {
    const normalized = normalizePlan(plan);
    try {
      await updateUserProfile(targetUser.id, { subscriptionPlan: normalized });
      setUsers((prev) =>
        prev.map((item) =>
          item.id === targetUser.id ? { ...item, subscriptionPlan: normalized } : item
        )
      );
      await Swal.success("Plan Updated", `${targetUser.fullName} moved to ${normalized.toUpperCase()} plan.`);
    } catch {
      await Swal.error("Update Failed", "Could not update subscription plan.");
    }
  };

  const handlePlanSubmit = async (e) => {
    e.preventDefault();
    if (!planForm.name || !planForm.price) {
      setError("Plan name and price are required.");
      return;
    }

    setSavingPlan(true);
    setError("");
    try {
      const parsedFeatures = String(planForm.featuresText || "")
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);

      await saveSubscriptionPlan(planForm.id || null, {
        name: planForm.name,
        planType: normalizePlan(planForm.planType || PLANS.PRO),
        price: Number(planForm.price),
        billingCycle: planForm.billingCycle,
        description: planForm.description || "",
        features: parsedFeatures,
        patientLimit: Number(planForm.patientLimit || 0),
        maxDoctors: Number(planForm.maxDoctors || 0),
        maxReceptionists: Number(planForm.maxReceptionists || 0),
        aiEnabled: Boolean(planForm.aiEnabled),
        advancedAnalytics: Boolean(planForm.advancedAnalytics),
        ctaText: planForm.ctaText || "Upgrade Now",
        isPopular: Boolean(planForm.isPopular),
        sortOrder: Number(planForm.sortOrder || 0),
        isActive: Boolean(planForm.isActive),
      });
      setPlanForm(DEFAULT_PLAN);
      const updatedPlans = await getSubscriptionPlans();
      setPlans(updatedPlans || []);
      await Swal.success("Plan Saved", "Subscription plan updated successfully.");
    } catch {
      setError("Failed to save subscription plan.");
      await Swal.error("Save Failed", "Could not save subscription plan.");
    } finally {
      setSavingPlan(false);
    }
  };

  const staffColumns = [
    { key: "fullName", label: "Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    {
      key: "subscriptionPlan",
      label: "Plan",
      render: (val) => <StatusBadge status={normalizePlan(val)} />,
    },
    {
      key: "isVerified",
      label: "Verified",
      render: (val) => <StatusBadge status={val ? "verified" : "unverified"} />,
    },
    {
      key: "status",
      label: "Status",
      render: (val) => <StatusBadge status={val || "active"} />,
    },
  ];

  const performanceColumns = [
    { key: "doctor", label: "Doctor" },
    { key: "appointments", label: "Appointments" },
    { key: "completed", label: "Completed" },
    { key: "prescriptions", label: "Prescriptions" },
    { key: "completionRate", label: "Completion Rate" },
  ];

  const planColumns = [
    { key: "name", label: "Plan" },
    { key: "planType", label: "Type", render: (val) => <StatusBadge status={normalizePlan(val)} /> },
    {
      key: "price",
      label: "Price",
      render: (val, row) => `$${val}/${row.billingCycle || "monthly"}`,
    },
    { key: "features", label: "Features", render: (val) => (Array.isArray(val) ? val.length : 0) },
    { key: "patientLimit", label: "Patient Limit", render: (val) => (val ? val : "Unlimited") },
    { key: "maxDoctors", label: "Doctors" },
    { key: "maxReceptionists", label: "Receptionists" },
    {
      key: "isActive",
      label: "Active",
      render: (val) => <StatusBadge status={val ? "active" : "inactive"} />,
    },
  ];

  const staffActions = (row) => (
    <div className="flex flex-wrap justify-end gap-2">
      {!row.isVerified ? (
        <ActionButton size="sm" variant="success" onClick={() => handleVerifyUser(row)}>
          Verify
        </ActionButton>
      ) : null}
      <ActionButton size="sm" variant="outline" onClick={() => handleToggleUserStatus(row)}>
        {row.status === "inactive" ? "Activate" : "Deactivate"}
      </ActionButton>
      {normalizePlan(row.subscriptionPlan) !== PLANS.PRO ? (
        <ActionButton size="sm" variant="secondary" onClick={() => handleAssignPlan(row, PLANS.PRO)}>
          Upgrade Pro
        </ActionButton>
      ) : (
        <ActionButton size="sm" variant="ghost" onClick={() => handleAssignPlan(row, PLANS.FREE)}>
          Set Free
        </ActionButton>
      )}
    </div>
  );

  const planActions = (row) => (
    <ActionButton
      size="sm"
      variant="outline"
      onClick={() =>
        setPlanForm({
          ...row,
          planType: normalizePlan(row.planType || PLANS.PRO),
          price: String(row.price || ""),
          description: row.description || "",
          featuresText: Array.isArray(row.features) ? row.features.join("\n") : "",
          patientLimit: String(row.patientLimit || ""),
          maxDoctors: String(row.maxDoctors || ""),
          maxReceptionists: String(row.maxReceptionists || ""),
          aiEnabled: Boolean(row.aiEnabled),
          advancedAnalytics: Boolean(row.advancedAnalytics),
          ctaText: row.ctaText || "Upgrade Now",
          isPopular: Boolean(row.isPopular),
          sortOrder: String(row.sortOrder || ""),
        })
      }
    >
      Edit
    </ActionButton>
  );

  return (
    <DashboardLayout role={ROLES.ADMIN}>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">
            Manage staff, subscriptions, system usage, and predictive analytics.
          </p>
          {error ? <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
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
            <h2 className="text-lg font-semibold text-gray-900">Admin Access Overview</h2>
            <div className="mt-3 grid grid-cols-1 gap-3 text-sm text-gray-600 md:grid-cols-2">
              <p className="rounded-lg bg-gray-50 p-3">
                Role: <span className="font-semibold capitalize text-gray-900">{userData?.role || "admin"}</span>
              </p>
              <p className="rounded-lg bg-gray-50 p-3">
                Verification: <span className="font-semibold text-gray-900">{userData?.isVerified ? "Verified" : "Pending"}</span>
              </p>
              <p className="rounded-lg bg-gray-50 p-3">
                Total Staff: <span className="font-semibold text-gray-900">{doctors.length + receptionists.length}</span>
              </p>
              <p className="rounded-lg bg-gray-50 p-3">
                Pending Verifications: <span className="font-semibold text-gray-900">{pendingStaff.length}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
          <div className="rounded-xl bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Doctors</h2>
            <DataTable
              columns={staffColumns}
              data={doctors}
              loading={loading}
              actions={staffActions}
              pageSize={5}
            />
          </div>

          <div className="rounded-xl bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Receptionists</h2>
            <DataTable
              columns={staffColumns}
              data={receptionists}
              loading={loading}
              actions={staffActions}
              pageSize={5}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow-lg xl:col-span-2">
            <div className="mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Subscription Plans (Simulation)
              </h2>
            </div>
            <DataTable
              columns={planColumns}
              data={plans}
              loading={loading}
              actions={planActions}
              pageSize={5}
            />
          </div>

          <div className="rounded-xl bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Create / Update Plan</h2>
            <form onSubmit={handlePlanSubmit} className="space-y-3">
              <input
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                placeholder="Plan Name"
                value={planForm.name}
                onChange={(e) => setPlanForm((prev) => ({ ...prev, name: e.target.value }))}
              />
              <select
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={planForm.planType}
                onChange={(e) => {
                  const nextType = normalizePlan(e.target.value);
                  setPlanForm((prev) => ({
                    ...prev,
                    planType: nextType,
                    aiEnabled: nextType === PLANS.PRO ? prev.aiEnabled : false,
                    advancedAnalytics: nextType === PLANS.PRO ? prev.advancedAnalytics : false,
                  }));
                }}
              >
                <option value={PLANS.FREE}>Free</option>
                <option value={PLANS.PRO}>Pro</option>
              </select>
              <input
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                placeholder="Price"
                type="number"
                min="0"
                value={planForm.price}
                onChange={(e) => setPlanForm((prev) => ({ ...prev, price: e.target.value }))}
              />
              <textarea
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                rows={2}
                placeholder="Short description"
                value={planForm.description}
                onChange={(e) => setPlanForm((prev) => ({ ...prev, description: e.target.value }))}
              />
              <textarea
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                rows={4}
                placeholder="Plan features (one per line)"
                value={planForm.featuresText}
                onChange={(e) => setPlanForm((prev) => ({ ...prev, featuresText: e.target.value }))}
              />
              <select
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={planForm.billingCycle}
                onChange={(e) => setPlanForm((prev) => ({ ...prev, billingCycle: e.target.value }))}
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
              <input
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                placeholder="Patient Limit (0 = unlimited)"
                type="number"
                min="0"
                value={planForm.patientLimit}
                onChange={(e) => setPlanForm((prev) => ({ ...prev, patientLimit: e.target.value }))}
              />
              <input
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                placeholder="Max Doctors"
                type="number"
                min="0"
                value={planForm.maxDoctors}
                onChange={(e) => setPlanForm((prev) => ({ ...prev, maxDoctors: e.target.value }))}
              />
              <input
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                placeholder="Max Receptionists"
                type="number"
                min="0"
                value={planForm.maxReceptionists}
                onChange={(e) => setPlanForm((prev) => ({ ...prev, maxReceptionists: e.target.value }))}
              />
              <input
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                placeholder="CTA Button Text"
                value={planForm.ctaText}
                onChange={(e) => setPlanForm((prev) => ({ ...prev, ctaText: e.target.value }))}
              />
              <input
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                placeholder="Sort Order"
                type="number"
                min="0"
                value={planForm.sortOrder}
                onChange={(e) => setPlanForm((prev) => ({ ...prev, sortOrder: e.target.value }))}
              />
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={Boolean(planForm.aiEnabled)}
                  onChange={(e) => setPlanForm((prev) => ({ ...prev, aiEnabled: e.target.checked }))}
                />
                AI Enabled
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={Boolean(planForm.advancedAnalytics)}
                  onChange={(e) => setPlanForm((prev) => ({ ...prev, advancedAnalytics: e.target.checked }))}
                />
                Advanced Analytics
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={Boolean(planForm.isPopular)}
                  onChange={(e) => setPlanForm((prev) => ({ ...prev, isPopular: e.target.checked }))}
                />
                Mark as Popular
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={Boolean(planForm.isActive)}
                  onChange={(e) => setPlanForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                />
                Mark as active
              </label>
              <ActionButton type="submit" disabled={savingPlan}>
                {savingPlan ? "Saving..." : "Save Plan"}
              </ActionButton>
            </form>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-lg">
          <div className="mb-4 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">System Usage Snapshot</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Pending Verifications</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{pendingStaff.length}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Appointments Today</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{todayCount}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Prescriptions</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{prescriptions.length}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-lg">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Predictive Analytics</h2>
          </div>
          {!advancedEnabled ? (
            <p className="rounded-lg bg-yellow-50 p-3 text-sm text-yellow-700">
              Advanced analytics are available on Pro plan. Upgrade admin plan to unlock full
              predictive insights.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">Most Common Disease (Monthly)</p>
                  <p className="mt-1 text-lg font-semibold text-gray-900">{mostCommonDiagnosis}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">Patient Load Forecast (Next 7 Days)</p>
                  <p className="mt-1 text-lg font-semibold text-gray-900">{patientLoadForecast} visits</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">Doctor Trend Entries</p>
                  <p className="mt-1 text-lg font-semibold text-gray-900">{doctorPerformance.length}</p>
                </div>
              </div>
              <div className="mt-6">
                <h3 className="mb-3 text-sm font-semibold text-gray-700">Doctor Performance Trends</h3>
                <DataTable
                  columns={performanceColumns}
                  data={doctorPerformance}
                  loading={loading}
                  pageSize={6}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
