import { cn } from "../../../lib/utils";

const FooterSocial = ({ icon: Icon, href, label }) => {
  return (
    <a
      href={href}
      aria-label={label}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-xl",
        "bg-white/10 text-gray-200 hover:bg-gradient-to-r hover:from-blue-600 hover:to-emerald-600 hover:text-white",
        "transition-all duration-300 hover:scale-110",
        "group"
      )}
    >
      <Icon className="h-5 w-5 transition-transform group-hover:rotate-12" />
    </a>
  );
};

export default FooterSocial;
