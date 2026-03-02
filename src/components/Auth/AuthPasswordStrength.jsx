
import { cn } from "../../lib/utils";
import { Shield, ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";

const strengthConfig = {
  0: { label: "Too weak", color: "bg-red-500", icon: ShieldX, textColor: "text-red-500" },
  1: { label: "Weak", color: "bg-orange-500", icon: ShieldAlert, textColor: "text-orange-500" },
  2: { label: "Medium", color: "bg-yellow-500", icon: Shield, textColor: "text-yellow-500" },
  3: { label: "Strong", color: "bg-green-500", icon: ShieldCheck, textColor: "text-green-500" },
  4: { label: "Very Strong", color: "bg-green-600", icon: ShieldCheck, textColor: "text-green-600" },
};

const AuthPasswordStrength = ({ password = "", className }) => {
  const calculateStrength = (pass) => {
    let score = 0;
    if (!pass) return 0;
    
    if (pass.length >= 8) score++;
    if (pass.length >= 12) score++;
    
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    
    return Math.min(score, 4);
  };

  const strength = calculateStrength(password);
  const config = strengthConfig[strength];
  const Icon = config?.icon;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={cn("w-4 h-4", config?.textColor)} />
          <span className={cn("text-sm font-medium", config?.textColor)}>
            Password Strength: {config?.label}
          </span>
        </div>
      </div>

      <div className="flex gap-1 h-1.5">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "flex-1 rounded-full transition-all duration-300",
              i < strength ? config.color : "bg-gray-200"
            )}
          />
        ))}
      </div>

      <ul className="text-xs text-gray-500 space-y-1 mt-3">
        <li className={cn(password.length >= 8 ? "text-green-600" : "")}>
          • At least 8 characters
        </li>
        <li className={cn(/[A-Z]/.test(password) ? "text-green-600" : "")}>
          • One uppercase letter
        </li>
        <li className={cn(/[0-9]/.test(password) ? "text-green-600" : "")}>
          • One number
        </li>
        <li className={cn(/[^A-Za-z0-9]/.test(password) ? "text-green-600" : "")}>
          • One special character
        </li>
      </ul>
    </div>
  );
};

export default AuthPasswordStrength;
