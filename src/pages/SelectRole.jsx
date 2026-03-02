import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Shield, Stethoscope, UserRound, Users } from "lucide-react";
import AuthContainer from "../components/Auth/AuthContainer";
import AuthButton from "../components/Auth/AuthButton";
import AuthHeader from "../components/Auth/AuthHeader";
import { ROLE_OPTIONS, ROLES } from "../constants/roles";
import { setSelectedRole } from "../utils/roleStorage";
import Swal from "../utils/swal";

const ROLE_ICONS = {
  [ROLES.ADMIN]: Shield,
  [ROLES.DOCTOR]: Stethoscope,
  [ROLES.RECEPTIONIST]: Users,
  [ROLES.PATIENT]: UserRound,
};

const SelectRole = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedRole, setRole] = useState("");
  const [error, setError] = useState("");

  const next = useMemo(() => {
    const nextParam = searchParams.get("next");
    return nextParam === "signup" ? "signup" : "login";
  }, [searchParams]);

  const goNext = (target) => {
    if (!selectedRole) {
      setError("Please select a role to continue.");
      Swal.warning("Role Required", "Please select a role to continue.");
      return;
    }
    if (target === "signup" && selectedRole === ROLES.ADMIN) {
      Swal.warning("Access Required", "Admin cant signup without access.");
      navigate("/select-role?next=signup");
      return;
    }
    setSelectedRole(selectedRole);
    navigate(`/${target}`);
  };

  return (
    <AuthContainer size="lg">
      <AuthHeader
        type="signup"
        title="Select Your Role"
        subtitle="Choose the role you want to use in the clinic system"
      />

      {error ? (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {ROLE_OPTIONS.map((role) => {
          const Icon = ROLE_ICONS[role.value];
          const isActive = selectedRole === role.value;

          return (
            <button
              key={role.value}
              type="button"
              onClick={() => {
                setRole(role.value);
                setError("");
              }}
              className={`rounded-2xl border p-5 text-left transition-all ${
                isActive
                  ? "border-blue-600 bg-blue-50 shadow-md"
                  : "border-gray-200 bg-white hover:border-blue-300"
              }`}
            >
              <div className="mb-3 inline-flex rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 p-2 text-white">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{role.label}</h3>
              <p className="mt-2 text-sm text-gray-600">{role.description}</p>
            </button>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <AuthButton
          type="button"
          variant={next === "login" ? "primary" : "secondary"}
          rightIcon={<ArrowRight className="h-5 w-5" />}
          onClick={() => goNext("login")}
        >
          Continue to Login
        </AuthButton>
        <AuthButton
          type="button"
          variant={next === "signup" ? "primary" : "secondary"}
          rightIcon={<ArrowRight className="h-5 w-5" />}
          onClick={() => goNext("signup")}
        >
          Continue to Signup
        </AuthButton>
      </div>
    </AuthContainer>
  );
};

export default SelectRole;
