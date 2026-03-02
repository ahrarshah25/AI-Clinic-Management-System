import { useState } from "react";
import { cn } from "../../lib/utils";
import { Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";

const AuthInput = ({
  label,
  type = "text",
  value,
  onChange,
  error,
  success,
  icon: Icon,
  required = false,
  disabled = false,
  placeholder,
  className,
  showPasswordToggle = false,
  onBlur,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputType = showPasswordToggle 
    ? (showPassword ? "text" : "password")
    : type;

  const hasIcon = Icon !== undefined;
  const hasError = error !== undefined && error !== "";
  const hasSuccess = success === true;

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {/* Icon */}
        {hasIcon && (
          <div className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2",
            "text-gray-400 transition-colors duration-200",
            isFocused && "text-blue-600",
            hasError && "text-red-500",
            hasSuccess && "text-green-500"
          )}>
            <Icon className="w-5 h-5" />
          </div>
        )}

        {/* Input */}
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          disabled={disabled}
          placeholder={placeholder}
          className={cn(
            "w-full px-4 py-3 rounded-xl",
            "bg-white border-2",
            "transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-offset-2",
            hasIcon && "pl-10",
            showPasswordToggle && "pr-12",
            isFocused && !hasError && !hasSuccess && "border-blue-600 ring-blue-600/20",
            hasError && "border-red-500 focus:ring-red-500/20",
            hasSuccess && "border-green-500 focus:ring-green-500/20",
            !isFocused && !hasError && !hasSuccess && "border-gray-200 hover:border-gray-300",
            disabled && "bg-gray-50 cursor-not-allowed",
            className
          )}
          {...props}
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
     
          {showPasswordToggle && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              tabIndex="-1"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          )}

          {hasError && (
            <AlertCircle className="w-5 h-5 text-red-500 animate-pulse" />
          )}
          {hasSuccess && (
            <CheckCircle className="w-5 h-5 text-green-500" />
          )}
        </div>
      </div>

      {hasError && (
        <p className="text-sm text-red-600 mt-1 animate-fade-in">
          {error}
        </p>
      )}
    </div>
  );
};

export default AuthInput;