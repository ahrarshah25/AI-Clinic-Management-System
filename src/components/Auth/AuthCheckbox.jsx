import { cn } from "../../lib/utils";
import { Check } from "lucide-react";

const AuthCheckbox = ({
  label,
  checked,
  onChange,
  error,
  required = false,
  className,
  ...props
}) => {
  return (
    <label className={cn("flex items-start gap-3 cursor-pointer group", className)}>
      <div className="relative flex-shrink-0 mt-0.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only"
          {...props}
        />
        
        <div className={cn(
          "w-5 h-5 rounded-md border-2",
          "transition-all duration-200",
          "group-hover:border-blue-600",
          "flex items-center justify-center",
          checked 
            ? "bg-gradient-to-r from-blue-600 to-purple-600 border-transparent" 
            : "bg-white border-gray-300",
          error && "border-red-500"
        )}>
          {checked && <Check className="w-3 h-3 text-white" />}
        </div>
      </div>
      
      <span className="text-sm text-gray-600 group-hover:text-gray-900">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </span>
    </label>
  );
};

export default AuthCheckbox;