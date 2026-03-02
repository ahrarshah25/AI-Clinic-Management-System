import { isValidRole, normalizeRole } from "../constants/roles";

const ROLE_STORAGE_KEY = "clinic_user_role";

export const getSelectedRole = () => {
  const role = normalizeRole(localStorage.getItem(ROLE_STORAGE_KEY));
  return isValidRole(role) ? role : "";
};

export const setSelectedRole = (role) => {
  const normalizedRole = normalizeRole(role);
  if (!isValidRole(normalizedRole)) return;
  localStorage.setItem(ROLE_STORAGE_KEY, normalizedRole);
};

export const clearSelectedRole = () => {
  localStorage.removeItem(ROLE_STORAGE_KEY);
};
