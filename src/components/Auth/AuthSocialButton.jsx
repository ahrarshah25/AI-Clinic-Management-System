import { cn } from "../../lib/utils";
import { Chrome } from "lucide-react";

const providers = {
  google: { icon: Chrome, label: "Google", color: "hover:bg-red-50 hover:text-red-600" },
};

const AuthSocialButton = ({
  provider = "google",
  onClick,
  className,
  showLabel = true,
}) => {
  const selectedProvider = providers[provider] ? provider : "google";
  const ProviderIcon = providers[selectedProvider].icon;

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center justify-center gap-3 px-4 py-3",
        "bg-white border-2 border-gray-200 rounded-xl",
        "hover:border-gray-300 hover:shadow-lg",
        "transition-all duration-200 group",
        providers[selectedProvider].color,
        className
      )}
    >
      <ProviderIcon className={cn(
        "w-5 h-5 transition-transform group-hover:scale-110"
      )} />
      
      {showLabel && (
        <span className="text-sm font-medium text-gray-700 group-hover:text-inherit">
          Continue with {providers[selectedProvider].label}
        </span>
      )}
    </button>
  );
};

export default AuthSocialButton;
