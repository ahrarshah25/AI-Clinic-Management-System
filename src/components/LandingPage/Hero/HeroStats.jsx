import { cn } from "../../../lib/utils";
import { Users, Clock, Award } from "lucide-react";

const stats = [
  { icon: Users, value: "50K+", label: "Patients" },
  { icon: Clock, value: "99.9%", label: "Uptime" },
  { icon: Award, value: "150+", label: "Clinics" },
];

const HeroStats = ({ className }) => {
  return (
    <div className={cn("flex items-center gap-8 md:gap-12", className)}>
      {stats.map((stat, index) => (
        <div key={index} className="text-center">
          <div className="flex items-center gap-2 mb-1">
            <stat.icon className="w-5 h-5 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
          </div>
          <p className="text-sm text-gray-600">{stat.label}</p>
        </div>
      ))}
    </div>
  );
};

export default HeroStats;