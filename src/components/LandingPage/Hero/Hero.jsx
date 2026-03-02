import { ArrowRight, PlayCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../Navbar/Button";
import HeroBadge from "./HeroBadge";
import HeroTitle from "./HeroTitle";
import HeroStats from "./HeroStats";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50" />

      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
      <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
        <div className="space-y-8">
          <HeroBadge className="mx-auto">AI-Powered Healthcare Management</HeroBadge>

          <HeroTitle className="max-w-4xl mx-auto leading-tight">
            Revolutionize Your Clinic with
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Intelligent Automation
            </span>
          </HeroTitle>

          <p className="max-w-2xl mx-auto text-xl text-gray-600 leading-relaxed">
            Experience the future of healthcare management with AI-powered scheduling,
            patient care, and analytics. Boost efficiency with one integrated platform.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              size="lg"
              variant="primary"
              rightIcon={<ArrowRight className="w-5 h-5" />}
              className="group"
              onClick={() => navigate("/select-role?next=signup")}
            >
              Get Started
            </Button>

            <Button
              size="lg"
              variant="ghost"
              leftIcon={<PlayCircle className="w-5 h-5" />}
              onClick={() => navigate("/login")}
            >
              Sign In
            </Button>
          </div>

          <HeroStats className="justify-center pt-12" />
        </div>

        <div className="relative mt-20 group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity" />
          <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 shadow-2xl overflow-hidden">
            <img
              src="/api/placeholder/1200/600"
              alt="Dashboard Preview"
              className="w-full h-auto"
            />

            <div className="absolute top-4 right-4 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-gray-200">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              <span className="text-xs font-medium text-gray-700">Live Demo Ready</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;