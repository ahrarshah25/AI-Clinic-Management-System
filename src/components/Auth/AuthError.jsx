import { cn } from "../../lib/utils";
import { AlertCircle, X } from "lucide-react";

const AuthError = ({ 
  message, 
  onDismiss,
  className 
}) => {
  if (!message) return null;

  return (
    <div className={cn(
      "relative p-4 rounded-xl",
      "bg-red-50 border border-red-200",
      "animate-fade-in",
      className
    )}>
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        
        <div className="flex-1">
          <p className="text-sm font-medium text-red-800">
            {message}
          </p>
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-red-500 hover:text-red-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="absolute bottom-0 left-0 h-1 bg-red-200 rounded-b-xl overflow-hidden">
        <div className="h-full bg-red-500 animate-progress" />
      </div>
    </div>
  );
};

export default AuthError;