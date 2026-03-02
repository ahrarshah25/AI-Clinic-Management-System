import { cn } from "../../../lib/utils";
import { Sparkles } from "lucide-react";

const HeroBadge = ({ children, className }) => {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2 rounded-full",
        "bg-gradient-to-r from-blue-600/10 to-purple-600/10",
        "border border-blue-600/20",
        "text-sm font-medium text-blue-700",
        "backdrop-blur-sm",
        className
      )}
    >
      <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
      {children}
    </div>
  );
};

export default HeroBadge;