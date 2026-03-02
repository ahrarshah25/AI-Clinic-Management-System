import { cn } from "../../lib/utils";
import { ArrowRight } from "lucide-react";

const AuthFooter = ({
  text,
  linkText,
  onLinkClick,
  className,
}) => {
  return (
    <div
      className={cn(
        "mt-8 pt-6 border-t border-gray-200",
        "text-center",
        className
      )}
    >
      <p className="text-gray-600">
        {text}{" "}
        <button
          onClick={onLinkClick}
          className="inline-flex items-center gap-1 text-blue-600 font-medium hover:text-purple-600 transition-colors group"
        >
          {linkText}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </p>

      <p className="text-xs text-gray-500 mt-4">
        By continuing, you agree to our{" "}
        <a href="/terms" className="text-blue-600 hover:underline">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="/privacy" className="text-blue-600 hover:underline">
          Privacy Policy
        </a>
      </p>
    </div>
  );
};

export default AuthFooter;