
import { cn } from "../../lib/utils";
import { CheckCircle } from "lucide-react";

const AuthSuccess = ({ message, className }) => {
  if (!message) return null;

  return (
    <div className={cn(
      "p-4 rounded-xl",
      "bg-green-50 border border-green-200",
      "flex items-center gap-3",
      "animate-fade-in",
      className
    )}>
      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
        <CheckCircle className="w-5 h-5 text-green-600" />
      </div>
      
      <p className="text-sm font-medium text-green-800">
        {message}
      </p>
    </div>
  );
};

export default AuthSuccess;
