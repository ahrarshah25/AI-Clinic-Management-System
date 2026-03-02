import {
  Facebook,
  Globe,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Twitter,
} from "lucide-react";
import Logo from "../Navbar/Logo";
import FooterSection from "./FooterSection";
import FooterLink from "./FooterLink";
import FooterSocial from "./FooterSocial";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.2),transparent_28%),radial-gradient(circle_at_80%_70%,rgba(16,185,129,0.18),transparent_30%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#64748b1f_1px,transparent_1px),linear-gradient(to_bottom,#64748b1f_1px,transparent_1px)] bg-[size:26px_26px]" />

      <div className="relative mx-auto max-w-7xl px-4 pb-8 pt-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Logo variant="dark" showIcon />
            <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-300">
              AI Clinic Management is built for modern clinics to handle appointments, prescriptions,
              reception approvals, analytics, and secure patient workflows in one place.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <FooterSocial icon={Facebook} href="#" label="Facebook" />
              <FooterSocial icon={Twitter} href="#" label="Twitter" />
              <FooterSocial icon={Linkedin} href="#" label="LinkedIn" />
              <FooterSocial icon={Instagram} href="#" label="Instagram" />
            </div>

            <div className="mt-6 space-y-2 text-sm text-slate-300">
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-emerald-300" />
                support@clinicai.com
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-emerald-300" />
                +1 (800) 123-4567
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-emerald-300" />
                San Francisco, California
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 lg:col-span-7">
            <FooterSection title="Navigation">
              <FooterLink href="/">Home</FooterLink>
              <FooterLink href="/pricing">Pricing</FooterLink>
              <FooterLink href="/login">Sign In</FooterLink>
              <FooterLink href="/select-role?next=signup">Get Started</FooterLink>
            </FooterSection>

            <FooterSection title="Platform">
              <FooterLink href="#">Patient Management</FooterLink>
              <FooterLink href="#">Appointment Flow</FooterLink>
              <FooterLink href="#">AI Diagnosis Tools</FooterLink>
              <FooterLink href="#">Prescription PDF</FooterLink>
            </FooterSection>

            <FooterSection title="Legal">
              <FooterLink href="#">Privacy Policy</FooterLink>
              <FooterLink href="#">Terms of Service</FooterLink>
              <FooterLink href="#">Data Processing</FooterLink>
              <FooterLink href="#">Security</FooterLink>
            </FooterSection>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-slate-800 pt-5 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {currentYear} ClinicAI. All rights reserved.</p>
          <p className="inline-flex items-center gap-1">
            <Globe className="h-4 w-4" />
            Built for scalable clinic SaaS workflows
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
