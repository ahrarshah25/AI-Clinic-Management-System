import { cn } from "../../lib/utils";
import { Loader2 } from "lucide-react";

const AuthButton = ({
  children,
  type = "submit",
  variant = "primary",
  size = "lg",
  isLoading = false,
  disabled = false,
  fullWidth = true,
  leftIcon,
  rightIcon,
  className,
  onClick,
  ...props
}) => {
  const variants = {
    primary: "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-600/25",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-200",
    outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-50",
    ghost: "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-2.5 text-sm",
    lg: "px-8 py-3.5 text-base",
    xl: "px-10 py-4 text-lg",
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={cn(
        "relative rounded-xl font-medium transition-all duration-200",
        "inline-flex items-center justify-center gap-2",
        "focus:outline-none focus:ring-2 focus:ring-blue-600/50 focus:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        "group overflow-hidden",
        className
      )}
      {...props}
    >
      <span className="absolute inset-0 overflow-hidden rounded-xl">
        <span className="absolute -top-[30%] -left-[30%] w-[60%] h-[200%] bg-gradient-to-r from-transparent via-white/20 to-transparent rotate-12 opacity-0 group-hover:opacity-100 transition-opacity animate-shimmer" />
      </span>

      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Please wait...</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="transition-transform group-hover:-translate-x-1">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="transition-transform group-hover:translate-x-1">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};

export default AuthButton;