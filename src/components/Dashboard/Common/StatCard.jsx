import { cn } from "../../../lib/utils";

const StatCard = ({ title, value, icon: Icon, trend, color = "blue" }) => {
  const colors = {
    blue: "from-blue-600 to-blue-400",
    purple: "from-purple-600 to-purple-400",
    green: "from-green-600 to-green-400",
    orange: "from-orange-600 to-orange-400",
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {trend && (
            <p className="text-sm text-green-600 mt-2">
              ↑ {trend}% from last month
            </p>
          )}
        </div>
        <div
          className={cn(
            "w-12 h-12 rounded-xl bg-gradient-to-br",
            colors[color],
            "flex items-center justify-center text-white shadow-lg"
          )}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
    </div>
  );
};

export default StatCard;