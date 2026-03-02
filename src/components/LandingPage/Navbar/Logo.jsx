import { cn } from "../../../lib/utils";

const Logo = ({ variant = "light", className, showIcon = true }) => {
  const variants = {
    light: "text-gray-900",
    dark: "text-white",
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {showIcon && (
        <div className="relative">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center transform hover:scale-110 transition-transform">
            <span className="text-white font-bold text-lg">AI</span>
          </div>
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        </div>
      )}
      <span className={cn("font-bold text-xl tracking-tight", variants[variant])}>
        Clinic<span className="text-blue-600">AI</span>
      </span>
    </div>
  );
};

export default Logo;