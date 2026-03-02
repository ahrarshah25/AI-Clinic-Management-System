import { cn } from "../../../lib/utils";

const ActionButton = ({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  onClick,
  disabled = false,
  className,
  ...props
}) => {
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-600/50",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500/50",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-600/50",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-600/50",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-600/50",
    ghost: "text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-500/50",
  };

  const sizes = {
    sm: "px-2.5 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {Icon && <Icon className={cn(iconSizes[size], children ? "mr-1" : "")} />}
      {children}
    </button>
  );
};

export default ActionButton;