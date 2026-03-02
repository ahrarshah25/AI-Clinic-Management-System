import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { getDashboardPathByRole, isValidRole, normalizeRole, ROLES } from "../../constants/roles";
import { getSelectedRole } from "../../utils/roleStorage";

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="mx-auto mb-3 h-10 w-10 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
      <p className="text-sm text-gray-600">Loading...</p>
    </div>
  </div>
);


export const AuthRoute = ({ children, mode = "login" }) => {
  const { isAuthenticated, isLoading, profile } = useAuth();
  const selectedRole = normalizeRole(getSelectedRole());

  if (isLoading) return <PageLoader />;

  if (isAuthenticated) {
    const resolvedRole = normalizeRole(profile?.role || selectedRole);
    const isUnverifiedStaff = resolvedRole && resolvedRole !== ROLES.PATIENT && !profile?.isVerified;
    if (isUnverifiedStaff) {
      return children;
    }
    if (!isValidRole(resolvedRole)) {
      return <Navigate to={`/select-role?next=${mode}`} replace />;
    }
    return <Navigate to={getDashboardPathByRole(resolvedRole)} replace />;
  }

  if (!isValidRole(selectedRole)) {
    return <Navigate to={`/select-role?next=${mode}`} replace />;
  }

  return children;
};

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const location = useLocation();
  const { isAuthenticated, isLoading, profile } = useAuth();
  const selectedRole = normalizeRole(getSelectedRole());

  if (isLoading) return <PageLoader />;

  if (!isAuthenticated) {
    const redirectTo = `${location.pathname}${location.search || ""}`;
    return <Navigate to={`/login?redirect=${encodeURIComponent(redirectTo)}`} replace />;
  }

  const resolvedRole = normalizeRole(profile?.role || selectedRole);

  if (!isValidRole(resolvedRole)) {
    return <Navigate to="/select-role?next=login" replace />;
  }

  if (resolvedRole !== ROLES.PATIENT && !profile?.isVerified) {
    return <Navigate to="/login?error=unverified" replace />;
  }

  if (allowedRoles.length && !allowedRoles.includes(resolvedRole)) {
    return <Navigate to={getDashboardPathByRole(resolvedRole)} replace />;
  }

  return children;
};
