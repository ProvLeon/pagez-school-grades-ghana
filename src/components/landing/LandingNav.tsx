import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FileText, GraduationCap, Menu, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// ─── Nav data ─────────────────────────────────────────────────────────────────
const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

const reportLinks = [
  { label: "Term Reports", href: "/student-reports", icon: FileText, desc: "Download student report cards" },
  { label: "Mock Results", href: "/mock-results", icon: GraduationCap, desc: "Check mock exam results" },
];



// ─── Component ────────────────────────────────────────────────────────────────
const LandingNav = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileRef = useRef<HTMLDivElement>(null);

  // ── Scroll detection ────────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Active section via IntersectionObserver ─────────────────────────────────
  useEffect(() => {
    const sections = navLinks.map(l => l.href.replace("#", ""));
    const observers: IntersectionObserver[] = [];

    sections.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { rootMargin: "-40% 0px -55% 0px" }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach(o => o.disconnect());
  }, [location.pathname]); // Re-run when path changes

  // ── Click outside to close dropdown & mobile menu ───────────────────────────
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const handle = (e: MouseEvent) => {
      if (mobileRef.current && !mobileRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [mobileOpen]);

  // ── Navigation handler ──────────────────────────────────────────────────────
  const go = (href: string) => {
    setMobileOpen(false);
    setDropdownOpen(false);

    if (href.startsWith("#")) {
      if (location.pathname === "/") {
        const el = document.querySelector(href);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
          return;
        }
      }
      navigate(`/${href}`);
    } else {
      navigate(href);
    }
  };

  const isActive = (href: string) => activeSection === href.replace("#", "");

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/95 backdrop-blur-xl border-b border-gray-100/80 shadow-[0_2px_20px_rgba(0,0,0,0.06)]"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[60px]">

          {/* ── Logo ─────────────────────────────────────────────────────────── */}
          <a
            href="/"
            onClick={(e) => { e.preventDefault(); go("/"); }}
            className="flex items-center gap-2.5 group shrink-0"
            aria-label="e-Results GH — back to top"
          >
            <div className="relative">
              <img
                src="/ERESULTS_LOGO.png"
                alt="e-Results GH logo"
                className="w-8 h-8 rounded-lg transition-transform duration-200 group-hover:scale-105"
              />
            </div>
            <span className="font-extrabold text-[17px] tracking-tight text-gray-900 transition-colors duration-200 group-hover:text-[#2563EB]">
              e-Results <span className="text-[#2563EB]">GH</span>
            </span>
          </a>

          {/* ── Desktop nav ──────────────────────────────────────────────────── */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">

            {/* Section links */}
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => { e.preventDefault(); go(link.href); }}
                className={cn(
                  "relative px-3.5 py-2 text-[13.5px] font-semibold rounded-lg transition-all duration-200",
                  isActive(link.href)
                    ? "text-[#2563EB] bg-blue-50/70"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/70"
                )}
              >
                {link.label}
                {isActive(link.href) && (
                  <motion.span
                    layoutId="nav-active-pill"
                    className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#2563EB]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </a>
            ))}

            {/* Divider */}
            <span className="mx-2 w-px h-4 bg-gray-200 shrink-0" aria-hidden="true" />

            {/* Reports dropdown */}
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setDropdownOpen(p => !p)}
                aria-expanded={dropdownOpen}
                aria-haspopup="menu"
                className={cn(
                  "flex items-center gap-1.5 px-3.5 py-2 text-[13.5px] font-semibold rounded-lg transition-all duration-200",
                  dropdownOpen
                    ? "text-[#2563EB] bg-blue-50/70"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/70"
                )}
              >
                View Results
                <motion.span
                  animate={{ rotate: dropdownOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </motion.span>
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    role="menu"
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.18 } }}
                    exit={{ opacity: 0, y: -6, scale: 0.97, transition: { duration: 0.15 } }}
                    className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl border border-gray-100 shadow-xl shadow-gray-200/60 overflow-hidden"
                  >
                    <div className="p-1.5 space-y-0.5">
                      {reportLinks.map((link) => (
                        <button
                          key={link.href}
                          role="menuitem"
                          onClick={() => go(link.href)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-blue-50 transition-colors group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-blue-100/60 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                            <link.icon className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-[13px] font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">
                              {link.label}
                            </p>
                            <p className="text-[11px] text-gray-400 leading-snug">
                              {link.desc}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="px-3 py-2 border-t border-gray-100 bg-gray-50/60">
                      <p className="text-[10.5px] text-gray-400 text-center leading-tight">
                        Results are published by your school
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* ── Desktop CTAs ─────────────────────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => navigate("/login")}
              className="text-[13.5px] font-semibold text-gray-700 hover:text-[#2563EB] px-4 py-2 rounded-lg border border-gray-200 hover:border-blue-200 bg-white hover:bg-blue-50/50 transition-all duration-200"
            >
              Log in
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="text-[13.5px] font-semibold bg-[#2563EB] hover:bg-[#1d4ed8] text-white px-5 py-2 rounded-lg shadow-md shadow-blue-500/20 hover:shadow-blue-500/35 hover:-translate-y-px transition-all duration-200"
            >
              Start Free Trial
            </button>
          </div>

          {/* ── Mobile hamburger ─────────────────────────────────────────────── */}
          <button
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all"
            onClick={() => setMobileOpen(p => !p)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            <AnimatePresence mode="wait" initial={false}>
              {mobileOpen ? (
                <motion.span
                  key="x"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <X className="w-5 h-5" />
                </motion.span>
              ) : (
                <motion.span
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Menu className="w-5 h-5" />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* ── Mobile menu ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            ref={mobileRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto", transition: { duration: 0.28 } }}
            exit={{ opacity: 0, height: 0, transition: { duration: 0.22 } }}
            className="md:hidden bg-white border-t border-gray-100 shadow-lg overflow-hidden"
          >
            <div className="px-4 pt-3 pb-5 space-y-0.5">

              {/* Section links */}
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.href}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0, transition: { delay: i * 0.05, duration: 0.22 } }}
                  href={link.href}
                  onClick={(e) => { e.preventDefault(); go(link.href); }}
                  className={cn(
                    "flex items-center px-3 py-2.5 rounded-lg text-[14px] font-semibold transition-all",
                    isActive(link.href)
                      ? "text-[#2563EB] bg-blue-50"
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  )}
                >
                  {isActive(link.href) && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] mr-2 shrink-0" />
                  )}
                  {link.label}
                </motion.a>
              ))}

              {/* Report links */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0, transition: { delay: navLinks.length * 0.05, duration: 0.22 } }}
                className="pt-2 mt-1 border-t border-gray-100"
              >
                <p className="px-3 pt-2 pb-1.5 text-[10.5px] font-bold text-gray-400 uppercase tracking-widest">
                  For Students & Parents
                </p>
                {reportLinks.map((link, i) => (
                  <motion.a
                    key={link.href}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0, transition: { delay: (navLinks.length + i + 1) * 0.05, duration: 0.22 } }}
                    href={link.href}
                    onClick={(e) => { e.preventDefault(); go(link.href); }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-blue-50 transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-100/60 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                      <link.icon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-[13.5px] font-semibold text-blue-700">{link.label}</p>
                      <p className="text-[11px] text-gray-400">{link.desc}</p>
                    </div>
                  </motion.a>
                ))}
              </motion.div>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0, transition: { delay: (navLinks.length + reportLinks.length + 1) * 0.05, duration: 0.22 } }}
                className="pt-3 mt-2 border-t border-gray-100 flex flex-col gap-2"
              >
                <button
                  onClick={() => { navigate("/login"); setMobileOpen(false); }}
                  className="w-full text-[14px] font-semibold text-gray-700 border border-gray-200 px-4 py-2.5 rounded-xl hover:border-blue-200 hover:text-[#2563EB] hover:bg-blue-50/50 transition-all"
                >
                  Log in
                </button>
                <button
                  onClick={() => { navigate("/signup"); setMobileOpen(false); }}
                  className="w-full text-[14px] font-semibold bg-[#2563EB] text-white px-4 py-2.5 rounded-xl hover:bg-[#1d4ed8] shadow-md shadow-blue-500/20 transition-all"
                >
                  Start Free Trial
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default LandingNav;
