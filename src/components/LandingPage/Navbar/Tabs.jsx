import { cn } from "../../../lib/utils";
import { useState } from "react";

const Tabs = ({ 
  items = [], 
  variant = "default", 
  className,
  onTabChange,
  activeItem: controlledActiveItem 
}) => {
  const [internalActive, setInternalActive] = useState(items[0]?.id || "");

  const activeItem = controlledActiveItem ?? internalActive;

  const variants = {
    default: "bg-white/80 backdrop-blur-md border border-gray-200/50 rounded-2xl p-1",
    underline: "border-b border-gray-200",
    pills: "gap-2",
  };

  const tabVariants = {
    default: (isActive) => cn(
      "px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200",
      isActive 
        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-600/25" 
        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/50"
    ),
    underline: (isActive) => cn(
      "px-4 py-2 text-sm font-medium border-b-2 transition-all duration-200 -mb-px",
      isActive 
        ? "border-blue-600 text-blue-600" 
        : "border-transparent text-gray-600 hover:text-gray-900"
    ),
    pills: (isActive) => cn(
      "px-4 py-2 text-sm font-medium rounded-full transition-all duration-200",
      isActive 
        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-600/25" 
        : "text-gray-600 hover:text-gray-900 bg-gray-100/50 hover:bg-gray-200/50"
    ),
  };

  const handleClick = (item) => {
    if (controlledActiveItem === undefined) {
      setInternalActive(item.id);
    }
    onTabChange?.(item);
  };

  return (
    <div className={cn("flex", variants[variant], className)}>
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => handleClick(item)}
          className={cn(
            tabVariants[variant](activeItem === item.id),
            item.disabled && "opacity-50 cursor-not-allowed"
          )}
          disabled={item.disabled}
        >
          {item.icon && <span className="mr-2 inline-block">{item.icon}</span>}
          {item.label}
        </button>
      ))}
    </div>
  );
};

export default Tabs;