import React from 'react';
import { Navigate, Route, Routes } from "react-router-dom";
import { AuthRoute, ProtectedRoute } from "./components/routing/RouteGuards";
import Landing from "./pages/Landing";
import Pricing from "./pages/Pricing";
import Checkout from "./pages/Checkout";
import SelectRole from "./pages/SelectRole";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PatientDashboard from "./pages/Dashboard/Patient";
import DoctorDashboard from "./pages/Dashboard/Doctor";
import ReceptionistDashboard from "./pages/Dashboard/Receptionist";
import AdminDashboard from "./pages/Dashboard/Admin";

import { getDashboardPathByRole, isValidRole, normalizeRole } from "./constants/roles";
import { getSelectedRole } from "./utils/roleStorage";
import { ROLES } from "./constants/roles";
import { useAuth } from "./context/useAuth";

const DashboardRedirect = () => {
  const { profile, isLoading } = useAuth();
  if (isLoading) return null;

  const role = normalizeRole(profile?.role || getSelectedRole());
  if (!isValidRole(role)) return <Navigate to="/select-role?next=login" replace />;
  return <Navigate to={getDashboardPathByRole(role)} replace />;
};

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        }
      />
      <Route path="/select-role" element={<SelectRole />} />

      <Route
        path="/login"
        element={
          <AuthRoute mode="login">
            <Login />
          </AuthRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <AuthRoute mode="signup">
            <Signup />
          </AuthRoute>
        }
      />

      <Route
        path="/dashboard/patient"
        element={
          <ProtectedRoute allowedRoles={[ROLES.PATIENT]}>
            <PatientDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/doctor"
        element={
          <ProtectedRoute allowedRoles={[ROLES.DOCTOR]}>
            <DoctorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/receptionist"
        element={
          <ProtectedRoute allowedRoles={[ROLES.RECEPTIONIST]}>
            <ReceptionistDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/admin"
        element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="/dashboard" element={<DashboardRedirect />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
