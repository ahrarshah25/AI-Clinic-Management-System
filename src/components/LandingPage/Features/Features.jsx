import { 
  Brain, 
  Calendar, 
  Shield, 
  Zap, 
  Users, 
  BarChart3,
  Clock,
  Phone,
  FileText
} from "lucide-react";
import FeatureCard from "./FeatureCard";
import Button from "../Navbar/Button";
import { useNavigate } from "react-router-dom";

const features = [
  {
    icon: Brain,
    title: "AI Diagnosis Assistant",
    description: "Get intelligent diagnosis suggestions and treatment plans powered by advanced machine learning algorithms.",
    color: "blue"
  },
  {
    icon: Calendar,
    title: "Smart Scheduling",
    description: "Optimize appointments with AI that predicts no-shows and suggests ideal time slots automatically.",
    color: "purple"
  },
  {
    icon: Shield,
    title: "HIPAA Compliant",
    description: "Enterprise-grade security with end-to-end encryption and compliance with healthcare regulations.",
    color: "green"
  },
  {
    icon: Zap,
    title: "Instant Analytics",
    description: "Real-time insights into clinic performance, patient flow, and revenue optimization.",
    color: "orange"
  },
  {
    icon: Users,
    title: "Patient Portal",
    description: "24/7 access to medical records, prescriptions, and direct messaging with healthcare providers.",
    color: "blue"
  },
  {
    icon: BarChart3,
    title: "Revenue Analytics",
    description: "Track financial performance with detailed reports and predictive revenue forecasting.",
    color: "purple"
  },
  {
    icon: Clock,
    title: "Wait Time Prediction",
    description: "AI-powered wait time estimates to improve patient experience and clinic efficiency.",
    color: "green"
  },
  {
    icon: Phone,
    title: "Telemedicine Ready",
    description: "Integrated video consultations with automatic prescription generation and follow-ups.",
    color: "orange"
  },
  {
    icon: FileText,
    title: "Smart Documentation",
    description: "Voice-to-text medical notes and automatic coding for insurance claims.",
    color: "blue"
  }
];

const Features = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-32 overflow-hidden">
     
      <div className="absolute inset-0 bg-gradient-to-b from-white via-blue-50/30 to-purple-50/30" />
      
      <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:32px_32px] opacity-20" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
     
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 border border-blue-600/20 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
            </span>
            <span className="text-sm font-medium text-blue-700">Powerful Features</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Everything you need to
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              run a modern clinic
            </span>
          </h2>
          
          <p className="text-xl text-gray-600">
            Our AI-powered platform streamlines every aspect of clinic management, 
            from patient scheduling to billing and analytics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              {...feature}
              delay={index * 100}
            />
          ))}
        </div>

        <div className="mt-20 text-center">
          <div className="inline-flex items-center gap-4 p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full">
            <span className="px-4 text-white font-medium">
              🎯 Ready to transform your clinic?
            </span>
            <Button 
              variant="secondary" 
              size="sm"
              className="bg-white text-blue-600 hover:bg-blue-50"
              onClick={() => navigate("/pricing")}
            >
              See Pricing
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
