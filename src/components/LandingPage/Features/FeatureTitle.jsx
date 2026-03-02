import { cn } from "../../../lib/utils";

const FeatureTitle = ({ 
  children, 
  as: Component = "h3", 
  size = "default",
  gradient = false,
  className,
  ...props 
}) => {
  const sizes = {
    sm: "text-lg",
    default: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl",
  };

  const gradientStyles = gradient 
    ? "bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent" 
    : "text-gray-900";

  return (
    <Component
      className={cn(
        "font-bold",
        sizes[size],
        gradientStyles,
        "group-hover:text-blue-600 transition-colors duration-300",
        className
      )}
      {...props}
    >
      {children}
      
      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300" />
    </Component>
  );
};

export default FeatureTitle;