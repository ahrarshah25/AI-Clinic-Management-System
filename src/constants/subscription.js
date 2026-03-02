export const PLANS = {
  FREE: "free",
  PRO: "pro",
};

const PLAN_CONFIG = {
  [PLANS.FREE]: {
    label: "Free",
    patientLimit: 50,
    aiEnabled: false,
    advancedAnalytics: false,
    description: "Limited patients, no AI features, basic analytics only.",
  },
  [PLANS.PRO]: {
    label: "Pro",
    patientLimit: Number.POSITIVE_INFINITY,
    aiEnabled: true,
    advancedAnalytics: true,
    description: "Unlimited patients, AI enabled, advanced analytics.",
  },
};

export const normalizePlan = (plan) =>
  plan === PLANS.PRO ? PLANS.PRO : PLANS.FREE;

export const getPlanConfig = (plan) => PLAN_CONFIG[normalizePlan(plan)];

export const isAiEnabledForPlan = (plan) =>
  Boolean(getPlanConfig(plan)?.aiEnabled);

export const hasAdvancedAnalytics = (plan) =>
  Boolean(getPlanConfig(plan)?.advancedAnalytics);

export const getPatientLimitForPlan = (plan) =>
  getPlanConfig(plan)?.patientLimit ?? PLAN_CONFIG[PLANS.FREE].patientLimit;
