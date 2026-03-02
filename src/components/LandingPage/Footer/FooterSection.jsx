import { cn } from "../../../lib/utils";

const FooterSection = ({ title, children, className }) => {
  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-100">
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
};

export default FooterSection;
