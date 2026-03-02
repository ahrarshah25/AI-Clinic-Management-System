import { cn } from "../../../lib/utils";

const FeatureIcon = ({ icon: Icon, color = "blue", className }) => {
  const colors = {
    blue: "from-blue-600 to-blue-400",
    purple: "from-purple-600 to-purple-400",
    green: "from-green-600 to-green-400",
    orange: "from-orange-600 to-orange-400",
  };

  return (
    <div className={cn(
      "w-14 h-14 rounded-2xl bg-gradient-to-br",
      colors[color],
      "flex items-center justify-center",
      "shadow-lg shadow-blue-600/25",
      "transform hover:scale-110 hover:rotate-3 transition-all duration-300",
      className
    )}>
      <Icon className="w-7 h-7 text-white" />
    </div>
  );
};

export default FeatureIcon;