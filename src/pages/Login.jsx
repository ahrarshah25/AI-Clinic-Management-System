import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Lock, Mail } from "lucide-react";
import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { auth } from "../Firebase/config";
import AuthContainer from "../components/Auth/AuthContainer";
import AuthHeader from "../components/Auth/AuthHeader";
import AuthInput from "../components/Auth/AuthInput";
import AuthButton from "../components/Auth/AuthButton";
import AuthDivider from "../components/Auth/AuthDivider";
import AuthSocialButton from "../components/Auth/AuthSocialButton";
import AuthCheckbox from "../components/Auth/AuthCheckbox";
import AuthError from "../components/Auth/AuthError";
import AuthFooter from "../components/Auth/AuthFooter";
import { getSelectedRole, setSelectedRole } from "../utils/roleStorage";
import { getDashboardPathByRole, isValidRole, normalizeRole, ROLES } from "../constants/roles";
import { createUserProfile, getUserProfile } from "../services/clinicFirestoreService";
import Swal from "../utils/swal";

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(() => {
    if (searchParams.get("error") === "unverified") {
      return "You are not verified by admin.";
    }
    return "";
  });
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [touched, setTouched] = useState({});

  const redirectPath = searchParams.get("redirect");
  const safeRedirectPath =
    redirectPath && redirectPath.startsWith("/") ? redirectPath : "";

  const validateForm = () => {
    if (!formData.email) return "Email is required";
    if (!/\S+@\S+\.\S+/.test(formData.email)) return "Please enter a valid email";
    if (!formData.password) return "Password is required";
    if (formData.password.length < 6) return "Password must be at least 6 characters";
    return "";
  };

  const resolveRoleAndAccess = async (profile, selectedRole) => {
    const profileRole = normalizeRole(profile?.role);
    const resolvedRole = normalizeRole(selectedRole || profileRole);

    if (!profile || !isValidRole(profileRole)) {
      await signOut(auth);
      const message = "Invalid user profile. Please contact support.";
      setError(message);
      await Swal.error("Login Failed", message);
      return null;
    }

    if (selectedRole && selectedRole !== profileRole) {
      await signOut(auth);
      const message = "Selected role does not match your account. Please select the correct role.";
      setError(message);
      await Swal.warning("Role Mismatch", message);
      return null;
    }

    if (profileRole !== ROLES.PATIENT && !profile.isVerified) {
      await signOut(auth);
      const message = "You are not verified by admin.";
      setError(message);
      await Swal.warning("Access Pending", message);
      navigate("/login?error=unverified");
      return null;
    }

    setSelectedRole(profileRole);
    return resolvedRole;
  };

  const handleEmailPasswordLogin = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      await Swal.error("Validation Error", validationError);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const selectedRole = normalizeRole(getSelectedRole());
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const profile = await getUserProfile(userCredential.user.uid);
      const resolvedRole = await resolveRoleAndAccess(profile, selectedRole);
      if (!resolvedRole) return;

      navigate(safeRedirectPath || getDashboardPathByRole(resolvedRole));
    } catch (err) {
      console.error(err);
      let message = "Failed to login. Please try again.";
      if (err.code === "auth/user-not-found") message = "No account found with this email";
      else if (err.code === "auth/wrong-password") message = "Incorrect password";
      else if (err.code === "auth/invalid-credential") message = "Invalid email or password";
      setError(message);
      await Swal.error("Login Failed", message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError("");

    try {
      const selectedRole = normalizeRole(getSelectedRole()) || ROLES.PATIENT;
      const googleProvider = new GoogleAuthProvider();
      const credential = await signInWithPopup(auth, googleProvider);
      let profile = await getUserProfile(credential.user.uid);

      if (!profile) {
        if (selectedRole === ROLES.ADMIN) {
          await signOut(auth);
          await Swal.warning("Access Required", "Admin cant signup without access.");
          navigate("/select-role?next=signup");
          return;
        }
        await createUserProfile(credential.user.uid, {
          fullName: credential.user.displayName || "Google User",
          email: credential.user.email || "",
          phone: "",
          dob: null,
          role: selectedRole,
          isVerified: selectedRole === ROLES.PATIENT,
          photoURL: credential.user.photoURL || null,
        });
        profile = await getUserProfile(credential.user.uid);
      }

      const resolvedRole = await resolveRoleAndAccess(profile, selectedRole);
      if (!resolvedRole) return;

      await Swal.success("Welcome Back", "Google login successful.");
      navigate(safeRedirectPath || getDashboardPathByRole(resolvedRole));
    } catch (err) {
      console.error(err);
      let message = "Google login failed. Please try again.";
      if (err.code === "auth/popup-closed-by-user") {
        message = "Google popup was closed before login.";
      } else if (err.code === "auth/cancelled-popup-request") {
        message = "Google login request was cancelled.";
      }
      setError(message);
      await Swal.error("Google Login Failed", message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field) => (e) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));
    setError("");
  };

  const handleBlur = (field) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  return (
    <AuthContainer size="md">
      <AuthHeader
        type="login"
        title="Welcome Back!"
        subtitle="Sign in to continue to your clinic dashboard"
      />

      {error ? (
        <AuthError
          message={error}
          onDismiss={() => setError("")}
          className="mb-6"
        />
      ) : null}

      <form onSubmit={handleEmailPasswordLogin} className="space-y-6">
        <AuthInput
          label="Email Address"
          type="email"
          icon={Mail}
          value={formData.email}
          onChange={handleInputChange("email")}
          onBlur={handleBlur("email")}
          placeholder="doctor@clinic.com"
          required
          error={
            touched.email && !formData.email
              ? "Email is required"
              : touched.email && !/\S+@\S+\.\S+/.test(formData.email)
                ? "Invalid email format"
                : ""
          }
        />

        <AuthInput
          label="Password"
          type="password"
          icon={Lock}
          value={formData.password}
          onChange={handleInputChange("password")}
          onBlur={handleBlur("password")}
          placeholder="••••••••"
          required
          showPasswordToggle
          error={
            touched.password && !formData.password
              ? "Password is required"
              : touched.password && formData.password.length < 6
                ? "Password too short"
                : ""
          }
        />

        <div className="flex items-center justify-between">
          <AuthCheckbox
            label="Remember me"
            checked={formData.rememberMe}
            onChange={handleInputChange("rememberMe")}
          />
          <button
            type="button"
            onClick={() => Swal.info("Coming Soon", "Forgot password flow will be available soon.")}
            className="text-sm font-medium text-blue-600 transition-colors hover:text-purple-600"
          >
            Forgot password?
          </button>
        </div>

        <AuthButton
          type="submit"
          isLoading={isLoading}
          rightIcon={<ArrowRight className="h-5 w-5" />}
        >
          Sign In
        </AuthButton>
      </form>

      <AuthDivider />

      <div className="space-y-3">
        <AuthSocialButton provider="google" onClick={handleGoogleLogin} />
      </div>

      <AuthFooter
        text="Don't have an account?"
        linkText="Sign up for free"
        onLinkClick={() => navigate("/signup")}
      />
    </AuthContainer>
  );
};

export default Login;
