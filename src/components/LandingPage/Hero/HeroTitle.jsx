import { cn } from "../../../lib/utils";

const HeroTitle = ({ children, className, gradient = true }) => {
  return (
    <h1
      className={cn(
        "text-5xl md:text-7xl font-bold tracking-tight",
        gradient && "bg-gradient-to-r from-gray-900 via-blue-800 to-purple-900 bg-clip-text text-transparent",
        className
      )}
    >
      {children}
    </h1>
  );
};

export default HeroTitle;