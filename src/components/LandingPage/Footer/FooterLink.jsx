import { cn } from "../../../lib/utils";

const FooterLink = ({ href, children, className, ...props }) => {
  return (
    <a
      href={href}
      className={cn(
        "inline-block text-sm text-gray-300 transition-all duration-200 hover:translate-x-1 hover:text-white",
        className
      )}
      {...props}
    >
      {children}
    </a>
  );
};

export default FooterLink;
