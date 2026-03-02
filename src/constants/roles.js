export const ROLES = {
  ADMIN: "admin",
  DOCTOR: "doctor",
  RECEPTIONIST: "receptionist",
  PATIENT: "patient",
};

const ROLE_ALIASES = {
  reception: ROLES.RECEPTIONIST,
};

export const ROLE_OPTIONS = [
  {
    value: ROLES.ADMIN,
    label: "Admin",
    description: "Manage staff, system settings, reports, and billing controls.",
  },
  {
    value: ROLES.DOCTOR,
    label: "Doctor",
    description: "Review patient records, appointments, prescriptions, and notes.",
  },
  {
    value: ROLES.RECEPTIONIST,
    label: "Reception",
    description: "Handle front desk flow, bookings, check-ins, and queue management.",
  },
  {
    value: ROLES.PATIENT,
    label: "Patient",
    description: "View appointments, prescriptions, records, and care reminders.",
  },
];

export const ROLE_SET = new Set(ROLE_OPTIONS.map((role) => role.value));

export const normalizeRole = (role) => ROLE_ALIASES[role] || role || "";

export const isValidRole = (role) => ROLE_SET.has(normalizeRole(role));

export const getRoleMeta = (role) =>
  ROLE_OPTIONS.find((item) => item.value === normalizeRole(role)) ?? null;

export const getDashboardPathByRole = (role) => {
  const normalizedRole = normalizeRole(role);
  if (!isValidRole(normalizedRole)) return "/dashboard";
  return `/dashboard/${normalizedRole}`;
};
