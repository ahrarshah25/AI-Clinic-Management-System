import { cn } from "../../../lib/utils";
import { ArrowRight } from "lucide-react";
import FeatureIcon from "./FeatureIcon";
import FeatureTitle from "./FeatureTitle";

const FeatureCard = ({ 
  icon, 
  title, 
  description, 
  color = "blue",
  className,
  delay = 0,
  titleSize = "default",
  titleGradient = false,
  showArrow = true
}) => {
  return (
    <div
      className={cn(
        "group relative p-8 rounded-3xl",
        "bg-white/80 backdrop-blur-sm",
        "border border-gray-200/50",
        "hover:border-blue-600/50",
        "transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-600/20",
        "animate-fade-in-up",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <FeatureIcon icon={icon} color={color} />
      
      <FeatureTitle 
        size={titleSize} 
        gradient={titleGradient}
        className="mt-6 mb-3"
      >
        {title}
      </FeatureTitle>
      
      <p className="text-gray-600 leading-relaxed mb-6">
        {description}
      </p>
      
      {showArrow && (
        <div className="flex items-center text-blue-600 font-medium group-hover:gap-2 transition-all">
          Learn More
          <ArrowRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 group-hover:ml-2 transition-all" />
        </div>
      )}

      <div className="absolute bottom-0 left-8 right-8 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
    </div>
  );
};

export default FeatureCard;