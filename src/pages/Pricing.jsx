import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, LoaderCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/LandingPage/Navbar/Navbar";
import Footer from "../components/LandingPage/Footer/Footer";
import Button from "../components/LandingPage/Navbar/Button";
import { useAuth } from "../hooks/useAuth";
import { normalizePlan, PLANS } from "../constants/subscription";
import { getSubscriptionPlans } from "../services/clinicFirestoreService";
import Swal from "../utils/swal";

const fallbackFeatures = {
  [PLANS.FREE]: [
    "Limited patients and basic appointments",
    "Prescription management",
    "Reception workflow",
    "Basic dashboard analytics",
  ],
  [PLANS.PRO]: [
    "Unlimited patients and full scheduling",
    "AI symptom checker + risk flags",
    "AI prescription explanation",
    "Advanced analytics and performance trends",
  ],
};

const Pricing = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading, userData } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPlans = async () => {
      setLoading(true);
      setError("");
      try {
        const rows = await getSubscriptionPlans();
        const activePlans = (rows || []).filter((item) => item.isActive !== false);

        const normalized = activePlans.map((item) => {
          const planType = normalizePlan(item.planType || item.code || item.slug || PLANS.PRO);
          const fallback = fallbackFeatures[planType];
          return {
            ...item,
            planType,
            features:
              Array.isArray(item.features) && item.features.length
                ? item.features
                : fallback,
          };
        });

        const sorted = normalized.sort((a, b) => {
          const orderA = Number(a.sortOrder || 0);
          const orderB = Number(b.sortOrder || 0);
          if (orderA !== orderB) return orderA - orderB;
          return Number(a.price || 0) - Number(b.price || 0);
        });

        setPlans(sorted);
      } catch {
        setError("Could not load pricing plans.");
      } finally {
        setLoading(false);
      }
    };

    loadPlans();
  }, []);

  const currentPlanType = useMemo(
    () => normalizePlan(userData?.subscriptionPlan || PLANS.FREE),
    [userData?.subscriptionPlan]
  );
  const currentPlanId = userData?.subscriptionPlanId || "";

  const handlePlanAction = async (plan) => {
    if (authLoading) return;

    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(`/checkout?plan=${plan.id}`)}`);
      return;
    }

    if (userData?.role === "admin") {
      await Swal.info(
        "Admin Access",
        "Admin plans are managed from dashboard. Please use staff account for subscriptions."
      );
      return;
    }

    if (!plan?.id) {
      await Swal.error("Plan Error", "Selected plan is invalid.");
      return;
    }

    if (currentPlanType === plan.planType) {
      await Swal.info("Current Plan", "You are already using this plan.");
      return;
    }

    navigate(`/checkout?plan=${plan.id}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="relative overflow-hidden pt-28">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/70 via-white to-emerald-50/40" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#94a3b814_1px,transparent_1px),linear-gradient(to_bottom,#94a3b814_1px,transparent_1px)] bg-[size:24px_24px]" />

        <section className="relative mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-4 py-1 text-xs font-semibold tracking-wide text-blue-700">
              PRICING FOR CLINICS
            </p>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Flexible subscriptions managed by admin
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Choose a plan and upgrade securely through checkout after login.
            </p>
          </div>

          {error ? (
            <p className="mx-auto mt-8 max-w-xl rounded-xl bg-red-50 p-4 text-center text-sm text-red-700">
              {error}
            </p>
          ) : null}

          {loading ? (
            <div className="mt-14 flex items-center justify-center gap-2 text-gray-600">
              <LoaderCircle className="h-5 w-5 animate-spin" />
              Loading subscription plans...
            </div>
          ) : plans.length ? (
            <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
              {plans.map((plan) => {
                const isCurrent = isAuthenticated
                  ? (currentPlanId ? currentPlanId === plan.id : currentPlanType === plan.planType)
                  : false;
                return (
                  <div
                    key={plan.id}
                    className={`rounded-3xl border bg-white p-7 shadow-lg transition-all ${
                      plan.isPopular
                        ? "border-blue-300 shadow-blue-100"
                        : "border-gray-200 shadow-gray-100"
                    }`}
                  >
                    {plan.isPopular ? (
                      <p className="mb-4 inline-flex rounded-full bg-gradient-to-r from-blue-600 to-emerald-600 px-3 py-1 text-xs font-semibold text-white">
                        Most Popular
                      </p>
                    ) : null}

                    <div className="flex items-center justify-between gap-2">
                      <h2 className="text-2xl font-bold text-gray-900">{plan.name || "Subscription"}</h2>
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold uppercase text-gray-700">
                        {plan.planType}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      {plan.description || "Clinic subscription plan"}
                    </p>

                    <div className="mt-6 flex items-end gap-1">
                      <p className="text-4xl font-bold text-gray-900">${Number(plan.price || 0)}</p>
                      <p className="pb-1 text-sm text-gray-500">/{plan.billingCycle || "monthly"}</p>
                    </div>

                    <ul className="mt-6 space-y-3">
                      {(plan.features || []).map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm text-gray-700">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <Button
                      className="mt-8 w-full"
                      variant={plan.isPopular ? "primary" : "secondary"}
                      onClick={() => handlePlanAction(plan)}
                      disabled={isCurrent}
                    >
                      {isCurrent
                        ? "Current Plan"
                        : isAuthenticated
                          ? plan.ctaText || "Upgrade Now"
                          : "Sign In to Subscribe"}
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-10 rounded-2xl border border-yellow-200 bg-yellow-50 p-6 text-center text-sm text-yellow-700">
              No active plans available yet. Admin can create plans from dashboard.
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;
