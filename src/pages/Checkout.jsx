import { useEffect, useMemo, useState } from "react";
import { CreditCard, LoaderCircle, Lock, ShieldCheck } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/LandingPage/Navbar/Navbar";
import Footer from "../components/LandingPage/Footer/Footer";
import Button from "../components/LandingPage/Navbar/Button";
import { useAuth } from "../hooks/useAuth";
import { getDashboardPathByRole } from "../constants/roles";
import { normalizePlan, PLANS } from "../constants/subscription";
import Swal from "../utils/swal";
import {
  createNotification,
  createPaymentRecord,
  getSubscriptionPlanById,
  updateUserProfile,
} from "../services/clinicFirestoreService";

const initialForm = {
  cardHolder: "",
  cardNumber: "",
  expiry: "",
  cvv: "",
  country: "",
};

const normalizeCardNumber = (value) =>
  value
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, "$1 ")
    .trim();

const formatExpiry = (value) => {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
};

const Checkout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, loading: authLoading, userData, refreshProfile } = useAuth();
  const [plan, setPlan] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(initialForm);

  const planId = searchParams.get("plan") || "";

  useEffect(() => {
    const loadPlan = async () => {
      if (!planId) {
        setError("Plan is missing. Please select a plan from pricing page.");
        setLoadingPlan(false);
        return;
      }

      setLoadingPlan(true);
      setError("");
      try {
        const row = await getSubscriptionPlanById(planId);
        if (!row || row.isActive === false) {
          setError("Selected plan is unavailable.");
          setPlan(null);
        } else {
          setPlan(row);
        }
      } catch {
        setError("Failed to load selected plan.");
      } finally {
        setLoadingPlan(false);
      }
    };

    loadPlan();
  }, [planId]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(`/checkout?plan=${planId}`)}`);
    }
  }, [authLoading, isAuthenticated, navigate, planId]);

  const resolvedPlanType = useMemo(
    () => normalizePlan(plan?.planType || PLANS.PRO),
    [plan?.planType]
  );

  const isCurrentPlan = useMemo(
    () =>
      userData?.subscriptionPlanId
        ? userData.subscriptionPlanId === plan?.id
        : normalizePlan(userData?.subscriptionPlan || PLANS.FREE) === resolvedPlanType,
    [plan?.id, resolvedPlanType, userData?.subscriptionPlan, userData?.subscriptionPlanId]
  );

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    if (field === "cardNumber") {
      setForm((prev) => ({ ...prev, cardNumber: normalizeCardNumber(value) }));
      return;
    }
    if (field === "expiry") {
      setForm((prev) => ({ ...prev, expiry: formatExpiry(value) }));
      return;
    }
    if (field === "cvv") {
      setForm((prev) => ({ ...prev, cvv: value.replace(/\D/g, "").slice(0, 4) }));
      return;
    }
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!form.cardHolder.trim()) return "Card holder name is required.";
    if (form.cardNumber.replace(/\s/g, "").length < 16) return "Card number must be 16 digits.";
    if (!/^\d{2}\/\d{2}$/.test(form.expiry)) return "Expiry must be in MM/YY format.";
    if (form.cvv.length < 3) return "CVV is required.";
    if (!form.country.trim()) return "Country is required.";
    return "";
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!plan || !userData?.id) return;

    if (isCurrentPlan) {
      await Swal.info("Already Active", "You already have this plan.");
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      await Swal.warning("Validation Error", validationError);
      return;
    }

    setProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1300));

      const maskedCard = `**** **** **** ${form.cardNumber.replace(/\s/g, "").slice(-4)}`;

      await createPaymentRecord({
        userId: userData.id,
        userEmail: userData.email || "",
        planId: plan.id,
        planName: plan.name || resolvedPlanType.toUpperCase(),
        planType: resolvedPlanType,
        amount: Number(plan.price || 0),
        currency: "USD",
        billingCycle: plan.billingCycle || "monthly",
        status: "paid",
        provider: "Visa / Card",
        maskedCard,
      });

      await updateUserProfile(userData.id, {
        subscriptionPlan: resolvedPlanType,
        subscriptionPlanId: plan.id,
        subscriptionPlanName: plan.name || resolvedPlanType.toUpperCase(),
        subscriptionBillingCycle: plan.billingCycle || "monthly",
        subscriptionUpdatedAt: new Date().toISOString(),
      });

      await createNotification({
        recipientId: userData.id,
        type: "subscription_updated",
        title: "Subscription Updated",
        message: `Your plan is now ${plan.name || resolvedPlanType.toUpperCase()}.`,
        link: getDashboardPathByRole(userData.role),
      });

      await refreshProfile?.();
      await Swal.success(
        "Payment Successful",
        `Your plan has been upgraded to ${plan.name || resolvedPlanType.toUpperCase()}.`
      );
      navigate(getDashboardPathByRole(userData.role));
    } catch {
      await Swal.error("Payment Failed", "Could not complete checkout. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="relative overflow-hidden pt-28">
        <div className="absolute inset-0 bg-gradient-to-b from-sky-50 via-white to-emerald-50/50" />
        <div className="relative mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Secure Checkout</h1>
            <p className="mt-2 text-gray-600">
              Complete your upgrade using card payment. Visa, Mastercard and debit cards supported.
            </p>
          </div>

          {loadingPlan || authLoading ? (
            <div className="flex items-center gap-2 text-gray-600">
              <LoaderCircle className="h-5 w-5 animate-spin" />
              Loading checkout...
            </div>
          ) : error ? (
            <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>
          ) : !plan ? (
            <p className="rounded-xl bg-yellow-50 p-4 text-sm text-yellow-700">
              Plan not available.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-lg lg:col-span-2">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Payment Details</h2>
                    <p className="text-sm text-gray-500">All transactions are securely encrypted.</p>
                  </div>
                  <div className="flex gap-2 text-xs font-semibold">
                    <span className="rounded-md bg-blue-50 px-2 py-1 text-blue-700">VISA</span>
                    <span className="rounded-md bg-orange-50 px-2 py-1 text-orange-700">Mastercard</span>
                  </div>
                </div>

                <form onSubmit={handlePayment} className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Card Holder</label>
                    <input
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm"
                      placeholder="Dr. John Doe"
                      value={form.cardHolder}
                      onChange={handleChange("cardHolder")}
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Card Number</label>
                    <div className="relative">
                      <CreditCard className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm"
                        placeholder="4242 4242 4242 4242"
                        value={form.cardNumber}
                        onChange={handleChange("cardNumber")}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">Expiry</label>
                      <input
                        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm"
                        placeholder="MM/YY"
                        value={form.expiry}
                        onChange={handleChange("expiry")}
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">CVV</label>
                      <input
                        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm"
                        placeholder="123"
                        value={form.cvv}
                        onChange={handleChange("cvv")}
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">Country</label>
                      <input
                        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm"
                        placeholder="United States"
                        value={form.country}
                        onChange={handleChange("country")}
                        required
                      />
                    </div>
                  </div>

                  <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-xs text-emerald-700">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4" />
                      256-bit SSL encryption enabled for secure transaction processing.
                    </div>
                  </div>

                  <Button type="submit" className="w-full" isLoading={processing} disabled={isCurrentPlan}>
                    {isCurrentPlan ? "Current Plan Active" : `Pay $${Number(plan.price || 0)}`}
                  </Button>
                </form>
              </div>

              <aside className="rounded-3xl border border-gray-200 bg-white p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900">Order Summary</h3>
                <div className="mt-4 space-y-2 text-sm text-gray-600">
                  <p className="font-medium text-gray-900">{plan.name || "Subscription Plan"}</p>
                  <p>Type: {resolvedPlanType.toUpperCase()}</p>
                  <p>Billing: {plan.billingCycle || "monthly"}</p>
                  <p className="text-xs">{plan.description || "Clinic subscription plan"}</p>
                </div>
                <div className="mt-5 border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-gray-900">${Number(plan.price || 0)}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium text-gray-900">$0.00</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 text-base font-semibold text-gray-900">
                    <span>Total</span>
                    <span>${Number(plan.price || 0)}</span>
                  </div>
                </div>
                <p className="mt-4 flex items-center gap-1 text-xs text-gray-500">
                  <Lock className="h-3.5 w-3.5" />
                  Payment is simulated for demo/hackathon flow.
                </p>
              </aside>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
