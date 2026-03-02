import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Activity, LogOut, Menu, User, X } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "../../../Firebase/config";
import { useAuth } from "../../../hooks/useAuth";
import { getDashboardPathByRole } from "../../../constants/roles";
import { clearSelectedRole } from "../../../utils/roleStorage";
import Swal from "../../../utils/swal";
import Logo from "./Logo";
import Button from "./Button";
import { cn } from "../../../lib/utils";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Pricing", href: "/pricing" },
];

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading: authLoading, userData } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const goTo = (href) => {
    navigate(href);
    setIsMobileMenuOpen(false);
  };

  const openDashboard = () => {
    if (!isAuthenticated || !userData?.role) {
      navigate("/login");
      return;
    }
    navigate(getDashboardPathByRole(userData.role));
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      clearSelectedRole();
      setIsMobileMenuOpen(false);
      await Swal.success("Logged Out", "You have been logged out.");
      navigate("/");
    } catch {
      await Swal.error("Logout Failed", "Could not log out. Please try again.");
    }
  };

  return (
    <nav
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-500",
        isScrolled
          ? "border-b border-gray-200/70 bg-white/85 shadow-lg shadow-gray-200/30 backdrop-blur-xl"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <button type="button" onClick={() => navigate("/")}>
            <Logo variant="light" />
          </button>

          <div className="hidden items-center gap-8 md:flex">
            <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white/80 p-1 backdrop-blur-sm">
              {navItems.map((item) => {
                const active = location.pathname === item.href;
                return (
                  <button
                    key={item.href}
                    type="button"
                    onClick={() => goTo(item.href)}
                    className={cn(
                      "rounded-xl px-4 py-2 text-sm font-medium transition-all",
                      active
                        ? "bg-gradient-to-r from-blue-600 to-emerald-600 text-white shadow-lg shadow-blue-500/30"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    )}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            {authLoading ? null : isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<User className="h-4 w-4" />}
                  onClick={openDashboard}
                >
                  {userData?.fullName || "Dashboard"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<LogOut className="h-4 w-4" />}
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
                  Sign In
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  rightIcon={<Activity className="h-4 w-4" />}
                  onClick={() => navigate("/select-role?next=signup")}
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="rounded-xl p-2 transition-colors hover:bg-gray-100 md:hidden"
            type="button"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-600" />
            ) : (
              <Menu className="h-6 w-6 text-gray-600" />
            )}
          </button>
        </div>

        <div
          className={cn(
            "fixed left-0 right-0 border-b border-gray-200 bg-white/95 shadow-xl backdrop-blur-xl transition-all duration-300 ease-in-out md:hidden",
            isMobileMenuOpen ? "top-20 opacity-100" : "-top-[500px] opacity-0"
          )}
        >
          <div className="space-y-4 p-6">
            <div className="space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => goTo(item.href)}
                  className={cn(
                    "w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition-all",
                    location.pathname === item.href
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {authLoading ? null : isAuthenticated ? (
              <div className="flex flex-col gap-3 border-t border-gray-100 pt-4">
                <Button
                  variant="secondary"
                  size="lg"
                  fullWidth
                  leftIcon={<User className="h-4 w-4" />}
                  onClick={openDashboard}
                >
                  {userData?.fullName || "Open Dashboard"}
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  fullWidth
                  leftIcon={<LogOut className="h-4 w-4" />}
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-3 border-t border-gray-100 pt-4">
                <Button variant="ghost" size="lg" fullWidth onClick={() => goTo("/login")}>
                  Sign In
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={() => goTo("/select-role?next=signup")}
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
