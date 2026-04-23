import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";

const LandingFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0f172a] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 py-16 border-b border-white/10">
          {/* Brand Column */}
          <div className="md:col-span-1 space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="rounded-lg flex items-center justify-center">
                <img src="/ERESULTS_LOGO.png" alt="Logo" className="w-8 h-8" />
              </div>
              <span className="text-lg font-bold">e-Results GH</span>
            </div>
            <p className="text-sm text-white/50 leading-relaxed max-w-[280px]">
              The advanced academic reporting platform trusted by schools across Ghana to deliver accurate, professional results.
            </p>
            <div className="flex gap-4 pt-2">
              {[
                { name: "Facebook", href: "https://web.facebook.com/pbpagez" },
                { name: "Twitter", href: "https://x.com/pbpagez_ltd" },
                { name: "LinkedIn", href: "https://www.linkedin.com/company/pb-pagez-limited/" },
                { name: "TikTok", href: "https://www.tiktok.com/@pbpagez_ltd" },
                { name: "Threads", href: "https://www.threads.com/@Pbpagez_ltd" },
                { name: "Telegram", href: "https://t.me/pbpagez_gh" }
              ].map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="text-white/30 hover:text-white/70 transition-colors text-xs font-medium"
                >
                  {social.name}
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-4">
            <h4 className="font-bold text-sm tracking-wider uppercase text-white/70">
              Product
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/signup"
                  className="text-white/50 hover:text-white transition-colors"
                >
                  Start Free Trial
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="text-white/50 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="text-white/50 hover:text-white transition-colors"
                >
                  Pricing
                </a>
              </li>
              <li>
                <Link
                  to="/student-reports"
                  className="text-white/50 hover:text-white transition-colors"
                >
                  Verify Results
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="space-y-4">
            <h4 className="font-bold text-sm tracking-wider uppercase text-white/70">
              Company
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="#features"
                  className="text-white/50 hover:text-white transition-colors"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#why-choose"
                  className="text-white/50 hover:text-white transition-colors"
                >
                  Why e-Results?
                </a>
              </li>
              <li>
                <a
                  href="#faq"
                  className="text-white/50 hover:text-white transition-colors"
                >
                  FAQ
                </a>
              </li>
              <li>
                <a
                  href="mailto:support@eresultsgh.com"
                  className="text-white/50 hover:text-white transition-colors"
                >
                  Support
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-bold text-sm tracking-wider uppercase text-white/70">
              Contact
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2.5 text-white/50">
                <Mail className="w-4 h-4 flex-shrink-0 text-[#2563EB]" />
                <a
                  href="mailto:support@eresultsgh.com"
                  className="hover:text-white transition-colors"
                >
                  support@eresultsgh.com
                </a>
              </li>
              <li className="flex items-center gap-2.5 text-white/50">
                <Phone className="w-4 h-4 flex-shrink-0 text-[#2563EB]" />
                <span>+233 248 639 158</span>
              </li>
              <li className="flex items-start gap-2.5 text-white/50">
                <MapPin className="w-4 h-4 flex-shrink-0 text-[#2563EB] mt-0.5" />
                <span>Accra, Ghana</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright Bar */}
        <div className="py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40">
            &copy; {currentYear} PB Pagez LTD. All Rights Reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-white/40">
            <a href="#" className="hover:text-white/60 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white/60 transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-white/60 transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
