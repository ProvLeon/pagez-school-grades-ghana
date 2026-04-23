import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Menu, X, FileText, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

const reportLinks = [
  { label: "Term Reports", href: "/student-reports", icon: FileText },
  { label: "Mock Results", href: "/mock-results", icon: GraduationCap },
];

const LandingNav = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    if (href.startsWith("#")) {
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate(href);
    }
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a
            href="#home"
            onClick={(e) => { e.preventDefault(); handleNavClick("#home"); }}
            className="flex items-center gap-2.5 group"
          >
            <div className="rounded-lg flex items-center justify-center transition-transform">
              <img src="/ERESULTS_LOGO.png" alt="Logo" className="w-8 h-8" />
            </div>
            <span
              className={cn(
                "font-bold text-lg tracking-tight transition-colors",
                scrolled ? "text-gray-900" : "text-gray-900"
              )}
            >
              e-Results GH
            </span>
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => { e.preventDefault(); handleNavClick(link.href); }}
                className="text-sm font-medium text-gray-600 hover:text-[#2563EB] transition-colors relative group"
              >
                {link.label}
                <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-[#2563EB] rounded-full transition-all duration-300 group-hover:w-full" />
              </a>
            ))}

            {/* Divider */}
            <span className="w-px h-4 bg-gray-200 shrink-0" />

            {/* Report Links */}
            {reportLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => { e.preventDefault(); handleNavClick(link.href); }}
                className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors relative group"
              >
                <link.icon className="w-3.5 h-3.5 shrink-0" />
                {link.label}
                <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-blue-500 rounded-full transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => navigate("/login")}
              className="text-sm font-semibold text-gray-700 hover:text-[#2563EB] px-4 py-2 rounded-lg border border-gray-200 hover:border-blue-300 bg-white hover:bg-blue-50/50 transition-all"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="text-sm font-semibold bg-[#2563EB] hover:bg-[#1d4ed8] text-white px-5 py-2.5 rounded-lg shadow-md shadow-blue-500/25 hover:shadow-blue-500/40 transition-all"
            >
              Start Free Trial
            </button>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 text-gray-700 hover:text-[#2563EB] transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "md:hidden bg-white border-t border-gray-100 shadow-lg overflow-hidden transition-all duration-300",
          mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-4 py-4 space-y-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => { e.preventDefault(); handleNavClick(link.href); }}
              className="block text-sm font-medium text-gray-700 hover:text-[#2563EB] hover:bg-blue-50 px-3 py-2.5 rounded-lg transition-all"
            >
              {link.label}
            </a>
          ))}

          {/* Report Links — for students & parents */}
          <div className="pt-2 mt-1 border-t border-gray-100">
            <p className="px-3 pt-2 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              For Students & Parents
            </p>
            {reportLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => { e.preventDefault(); handleNavClick(link.href); }}
                className="flex items-center gap-2.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-2.5 rounded-lg transition-all"
              >
                <link.icon className="w-4 h-4 shrink-0" />
                {link.label}
              </a>
            ))}
          </div>

          <div className="pt-3 mt-2 border-t border-gray-100 flex flex-col gap-2">
            <button
              onClick={() => { navigate("/login"); setMobileOpen(false); }}
              className="w-full text-sm font-semibold text-gray-700 border border-gray-200 px-4 py-2.5 rounded-lg hover:border-blue-300 hover:text-[#2563EB] hover:bg-blue-50/50 transition-all"
            >
              Login
            </button>
            <button
              onClick={() => { navigate("/signup"); setMobileOpen(false); }}
              className="w-full text-sm font-semibold bg-[#2563EB] text-white px-4 py-2.5 rounded-lg hover:bg-[#1d4ed8] shadow-md shadow-blue-500/20 transition-all"
            >
              Start Free Trial
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default LandingNav;
