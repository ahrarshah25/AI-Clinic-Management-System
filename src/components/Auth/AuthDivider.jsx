import { cn } from "../../lib/utils";

const AuthDivider = ({ text = "Or continue with", className }) => {
  return (
    <div className={cn("relative my-6", className)}>
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-200" />
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="px-4 bg-white/80 backdrop-blur-sm text-gray-500">
          {text}
        </span>
      </div>
    </div>
  );
};

export default AuthDivider;