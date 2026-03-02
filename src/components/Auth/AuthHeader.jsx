import { cn } from "../../lib/utils";
import { LogIn, UserPlus } from "lucide-react";

const AuthHeader = ({ 
  title, 
  subtitle, 
  type = "login",
  className 
}) => {
  const icons = {
    login: LogIn,
    signup: UserPlus,
  };

  const Icon = icons[type];

  return (
    <div className={cn("text-center mb-8", className)}>
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white mb-4 transform hover:scale-110 hover:rotate-3 transition-all duration-300">
        <Icon className="w-8 h-8" />
      </div>
      
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
        {title}
      </h1>
      
      <p className="text-gray-600">
        {subtitle}
      </p>

      <div className="flex items-center justify-center gap-2 mt-4">
        <div className="w-12 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full" />
        <div className="w-2 h-1 bg-gray-300 rounded-full" />
        <div className="w-2 h-1 bg-gray-300 rounded-full" />
      </div>
    </div>
  );
};

export default AuthHeader;