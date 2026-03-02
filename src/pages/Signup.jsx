import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Calendar, Lock, Mail, Phone, User } from "lucide-react";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { auth } from "../Firebase/config";
import { createUserProfile, getUserProfile } from "../services/clinicFirestoreService";
import { getSelectedRole, setSelectedRole } from "../utils/roleStorage";
import { getDashboardPathByRole, normalizeRole, ROLES } from "../constants/roles";
import AuthContainer from "../components/Auth/AuthContainer";
import AuthHeader from "../components/Auth/AuthHeader";
import AuthInput from "../components/Auth/AuthInput";
import AuthButton from "../components/Auth/AuthButton";
import AuthDivider from "../components/Auth/AuthDivider";
import AuthSocialButton from "../components/Auth/AuthSocialButton";
import AuthCheckbox from "../components/Auth/AuthCheckbox";
import AuthPasswordStrength from "../components/Auth/AuthPasswordStrength";
import AuthError from "../components/Auth/AuthError";
import AuthSuccess from "../components/Auth/AuthSuccess";
import AuthFooter from "../components/Auth/AuthFooter";
import Swal from "../utils/swal";

const Signup = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    dob: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
    acceptMarketing: false,
  });
  const [touched, setTouched] = useState({});

  const validateForm = () => {
    if (!formData.fullName) return "Full name is required";
    if (!formData.email) return "Email is required";
    if (!/\S+@\S+\.\S+/.test(formData.email)) return "Please enter a valid email";
    if (!formData.phone) return "Phone number is required";
    if (!formData.password) return "Password is required";
    if (formData.password.length < 8) return "Password must be at least 8 characters";
    if (formData.password !== formData.confirmPassword) return "Passwords do not match";
    if (!formData.acceptTerms) return "You must accept the terms and conditions";
    return "";
  };

  const finalizePostSignup = async (selectedRole) => {
    if (selectedRole !== ROLES.PATIENT) {
      await signOut(auth);
      setSuccess("Signup request submitted. Waiting for admin verification.");
      await Swal.info("Request Submitted", "You are not verified by admin yet.");
      navigate("/login?error=unverified");
      return;
    }

    setSelectedRole(selectedRole);
    setSuccess("Account created successfully! Redirecting...");
    await Swal.success("Account Created", "Your patient account is ready.");
    navigate(getDashboardPathByRole(selectedRole));
  };

  const handleEmailSignup = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      await Swal.error("Validation Error", validationError);
      return;
    }

    const selectedRole = normalizeRole(getSelectedRole()) || ROLES.PATIENT;
    if (selectedRole === ROLES.ADMIN) {
      await Swal.warning("Access Required", "Admin cant signup without access.");
      navigate("/select-role?next=signup");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      await createUserProfile(userCredential.user.uid, {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        dob: formData.dob || null,
        role: selectedRole,
        isVerified: selectedRole === ROLES.PATIENT,
        photoURL: null,
      });

      await finalizePostSignup(selectedRole);
    } catch (err) {
      console.error(err);
      let message = "Failed to create account. Please try again.";
      if (err.code === "auth/email-already-in-use") {
        message = "Email already in use. Please login instead.";
      }
      setError(message);
      await Swal.error("Signup Failed", message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const selectedRole = normalizeRole(getSelectedRole()) || ROLES.PATIENT;
      if (selectedRole === ROLES.ADMIN) {
        await Swal.warning("Access Required", "Admin cant signup without access.");
        navigate("/select-role?next=signup");
        return;
      }

      const googleProvider = new GoogleAuthProvider();
      const credential = await signInWithPopup(auth, googleProvider);
      const existingProfile = await getUserProfile(credential.user.uid);

      if (existingProfile) {
        const existingRole = normalizeRole(existingProfile.role);
        if (existingRole !== selectedRole) {
          await signOut(auth);
          await Swal.warning(
            "Role Mismatch",
            "Selected role does not match your account role."
          );
          return;
        }
        await finalizePostSignup(existingRole);
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

      await finalizePostSignup(selectedRole);
    } catch (err) {
      console.error(err);
      let message = "Google signup failed. Please try again.";
      if (err.code === "auth/popup-closed-by-user") {
        message = "Google popup was closed before authentication.";
      } else if (err.code === "auth/cancelled-popup-request") {
        message = "Google signup request was cancelled.";
      }
      setError(message);
      await Swal.error("Google Signup Failed", message);
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

  const getFieldError = (field) => {
    if (!touched[field]) return "";
    if (field === "fullName") return !formData.fullName ? "Full name is required" : "";
    if (field === "email") {
      if (!formData.email) return "Email is required";
      return !/\S+@\S+\.\S+/.test(formData.email) ? "Invalid email format" : "";
    }
    if (field === "phone") return !formData.phone ? "Phone number is required" : "";
    if (field === "password") {
      if (!formData.password) return "Password is required";
      return formData.password.length < 8 ? "Password too short" : "";
    }
    if (field === "confirmPassword") {
      if (!formData.confirmPassword) return "Please confirm password";
      return formData.password !== formData.confirmPassword ? "Passwords do not match" : "";
    }
    return "";
  };

  return (
    <AuthContainer size="lg">
      <AuthHeader
        type="signup"
        title="Create Account"
        subtitle="Join clinics using AI-powered management"
      />

      {error ? (
        <AuthError
          message={error}
          onDismiss={() => setError("")}
          className="mb-6"
        />
      ) : null}

      {success ? <AuthSuccess message={success} className="mb-6" /> : null}

      <form onSubmit={handleEmailSignup} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <AuthInput
            label="Full Name"
            icon={User}
            value={formData.fullName}
            onChange={handleInputChange("fullName")}
            onBlur={handleBlur("fullName")}
            placeholder="Dr. John Smith"
            required
            error={getFieldError("fullName")}
          />
          <AuthInput
            label="Email Address"
            type="email"
            icon={Mail}
            value={formData.email}
            onChange={handleInputChange("email")}
            onBlur={handleBlur("email")}
            placeholder="doctor@clinic.com"
            required
            error={getFieldError("email")}
          />
          <AuthInput
            label="Phone Number"
            type="tel"
            icon={Phone}
            value={formData.phone}
            onChange={handleInputChange("phone")}
            onBlur={handleBlur("phone")}
            placeholder="+1 (555) 000-0000"
            required
            error={getFieldError("phone")}
          />
          <AuthInput
            label="Date of Birth"
            type="date"
            icon={Calendar}
            value={formData.dob}
            onChange={handleInputChange("dob")}
            onBlur={handleBlur("dob")}
          />
        </div>

        <AuthInput
          label="Password"
          type="password"
          icon={Lock}
          value={formData.password}
          onChange={handleInputChange("password")}
          onBlur={handleBlur("password")}
          placeholder="Create a strong password"
          required
          showPasswordToggle
          error={getFieldError("password")}
          success={formData.password.length >= 8}
        />

        {formData.password ? <AuthPasswordStrength password={formData.password} /> : null}

        <AuthInput
          label="Confirm Password"
          type="password"
          icon={Lock}
          value={formData.confirmPassword}
          onChange={handleInputChange("confirmPassword")}
          onBlur={handleBlur("confirmPassword")}
          placeholder="Re-enter your password"
          required
          showPasswordToggle
          error={getFieldError("confirmPassword")}
          success={Boolean(formData.password && formData.password === formData.confirmPassword)}
        />

        <div className="space-y-3">
          <AuthCheckbox
            label="I agree to the Terms of Service and Privacy Policy"
            checked={formData.acceptTerms}
            onChange={handleInputChange("acceptTerms")}
            required
            error={touched.acceptTerms && !formData.acceptTerms}
          />
          <AuthCheckbox
            label="I want to receive updates about new features and promotions"
            checked={formData.acceptMarketing}
            onChange={handleInputChange("acceptMarketing")}
          />
        </div>

        <AuthButton
          type="submit"
          isLoading={isLoading}
          rightIcon={<ArrowRight className="h-5 w-5" />}
        >
          Create Account
        </AuthButton>
      </form>

      <AuthDivider />

      <div className="space-y-3">
        <AuthSocialButton provider="google" onClick={handleGoogleSignup} />
      </div>

      <AuthFooter
        text="Already have an account?"
        linkText="Sign in"
        onLinkClick={() => navigate("/login")}
      />
    </AuthContainer>
  );
};

export default Signup;
