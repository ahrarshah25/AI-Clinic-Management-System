import { cn } from "../../../lib/utils";
import { Loader2 } from "lucide-react";

const Button = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled = false,
  className,
  leftIcon,
  rightIcon,
  fullWidth = false,
  ...props
}) => {
  const variants = {
    primary: "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-600/25",
    secondary: "bg-white text-gray-900 border border-gray-200 hover:border-gray-300 hover:bg-gray-50",
    outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-50",
    ghost: "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
    xl: "px-8 py-4 text-lg",
  };

  return (
    <button
      className={cn(
        "relative rounded-xl font-medium transition-all duration-200 inline-flex items-center justify-center gap-2",
        "focus:outline-none focus:ring-2 focus:ring-blue-600/50 focus:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-opacity-100",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      {!isLoading && leftIcon && <span className="inline-block">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="inline-block">{rightIcon}</span>}
      
      <span className="absolute inset-0 rounded-xl overflow-hidden">
        <span className="absolute -top-[30%] -left-[30%] w-[60%] h-[200%] bg-gradient-to-r from-transparent via-white/20 to-transparent rotate-12 opacity-0 group-hover:opacity-100 transition-opacity animate-shimmer" />
      </span>
    </button>
  );
};

export default Button;