import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ArrowLeft,
  Lock,
  Shield,
  Eye,
  FileCheck,
  AlertCircle,
  Lightbulb,
  ExternalLink,
  Search,
  BookOpen,
  UserCheck,
  Globe,
  Database,
  ShieldCheck,
  Mail,
  Smartphone,
  Info
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import LandingNav from "@/components/landing/LandingNav";
import LandingFooter from "@/components/landing/LandingFooter";

import { Button, buttonVariants } from "@/components/ui/button";

interface PrivacySection {
  number: string;
  title: string;
  content: string | string[];
  id: string;
  icon: React.ReactNode;
}

interface PrivacyPolicyProps {
  isModal?: boolean;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ isModal = false }) => {
  const [activeSection, setActiveSection] = useState<string>("privacy-rights");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const privacySections: PrivacySection[] = [
    {
      number: "01",
      title: "Your Privacy Rights",
      id: "privacy-rights",
      icon: <UserCheck className="w-5 h-5" />,
      content: [
        "Right to access your personal data at any time",
        "Right to correct or update inaccurate information",
        "Right to request deletion of your data where applicable",
        "Right to opt-out of non-essential communications",
        "Right to data portability in a structured format",
        "Right to withdraw consent at any time",
      ],
    },
    {
      number: "02",
      title: "Information We Collect",
      id: "information-collect",
      icon: <Database className="w-5 h-5" />,
      content:
        "We collect personal information (name, email, phone), technical information (IP address, browser type, usage data), and academic records necessary to provide our educational services. Collection is always transparent and purposeful.",
    },
    {
      number: "03",
      title: "How We Use Information",
      id: "use-information",
      icon: <BookOpen className="w-5 h-5" />,
      content: [
        "Provide and improve our services",
        "Process examination results and academic records",
        "Improve platform performance and user experience",
        "Prevent fraud and security threats",
        "Comply with legal and regulatory obligations",
        "Communicate important platform updates",
      ],
    },
    {
      number: "04",
      title: "Data Protection & Security",
      id: "data-protection",
      icon: <ShieldCheck className="w-5 h-5" />,
      content:
        "We implement industry-standard technical and administrative measures to protect user data, including AES-256 encryption, secure TLS connections, regular security audits, and restricted access controls. Your data is stored on secure, certified servers.",
    },
    {
      number: "05",
      title: "Data Sharing Policy",
      id: "sharing-information",
      icon: <ExternalLink className="w-5 h-5" />,
      content:
        "We do not sell users' personal information. We may share data only with: (1) trusted service providers bound by confidentiality agreements, (2) legal authorities when legally required, (3) school administrators for educational purposes with proper authorization, and (4) payment processors for transaction processing.",
    },
    {
      number: "06",
      title: "Cookies and Tracking",
      id: "cookies",
      icon: <Smartphone className="w-5 h-5" />,
      content:
        "Cookies and similar technologies may be used to improve user experience, remember preferences, and analyze website traffic. You can control cookie preferences through your browser settings. We do not use tracking for advertising purposes.",
    },
    {
      number: "07",
      title: "Data Retention",
      id: "data-retention",
      icon: <Database className="w-5 h-5" />,
      content:
        "Data may be retained as necessary to provide educational services, comply with legal obligations, and maintain platform security. Academic records are retained according to Ghanaian education regulations. You can request deletion subject to legal requirements.",
    },
    {
      number: "08",
      title: "Children's Privacy",
      id: "children-privacy",
      icon: <Shield className="w-5 h-5" />,
      content:
        "Student-related information may be processed for educational purposes with proper authorization from parents/guardians and school officials. We maintain special safeguards for educational records and limit processing to what is necessary for educational delivery.",
    },
    {
      number: "09",
      title: "GDPR & International Compliance",
      id: "gdpr-compliance",
      icon: <Globe className="w-5 h-5" />,
      content: [
        "While based in Ghana, we respect GDPR principles and international privacy standards",
        "EU residents have additional rights including specific withdrawal of consent mechanisms",
        "We provide data processing agreements for organizations subject to GDPR",
        "Transfers of EU data are conducted with appropriate safeguards",
        "You may submit privacy inquiries in accordance with GDPR Article 15-22",
      ],
    },
    {
      number: "10",
      title: "Third-Party Services",
      id: "third-party",
      icon: <ExternalLink className="w-5 h-5" />,
      content:
        "eResults GH is not responsible for the privacy practices of external websites or third-party services linked from our platform. We recommend reviewing their privacy policies independently. We use analytics providers (Google Analytics) and CDN services - these are bound by data processing agreements.",
    },
    {
      number: "11",
      title: "Your Data Rights Requests",
      id: "data-rights",
      icon: <Lock className="w-5 h-5" />,
      content: [
        "Access Request: Submit a request to receive a copy of your personal data",
        "Correction Request: Ask us to update inaccurate information",
        "Deletion Request: Request removal of your data (subject to legal holds)",
        "Portability Request: Receive your data in a machine-readable format",
        "Withdrawal of Consent: Stop processing of data you previously consented to",
        "All requests processed within 30 days; response timeframes may vary by jurisdiction",
      ],
    },
    {
      number: "12",
      title: "Policy Changes",
      id: "changes-policy",
      icon: <AlertCircle className="w-5 h-5" />,
      content:
        "This policy may be updated periodically to reflect legal changes or operational improvements. Material changes will be notified via email or prominent notice on our platform. Your continued use constitutes acceptance of updated terms.",
    },
    {
      number: "13",
      title: "Contact Our Privacy Team",
      id: "contact",
      icon: <Mail className="w-5 h-5" />,
      content: [
        "Privacy Officer: privacy@eresultsgh.com",
        "Website: https://eresultsgh.com",
        "Phone: +233 248 639 158",
        "Mailing Address: Accra, Ghana",
        "Response time: 5-7 business days for privacy inquiries",
      ],
    },
  ];

  const filteredSections = privacySections.filter(
    (section) =>
      section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (Array.isArray(section.content)
        ? section.content.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()))
        : section.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  useEffect(() => {
    const handleScroll = () => {
      const sections = privacySections.map((s) => ({
        id: s.id,
        element: document.getElementById(s.id),
      }));

      let currentActive = privacySections[0].id;
      for (const section of sections) {
        if (section.element) {
          const rect = section.element.getBoundingClientRect();
          if (rect.top <= 120) {
            currentActive = section.id;
          }
        }
      }
      setActiveSection(currentActive);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
      setActiveSection(id);
      setIsMobileMenuOpen(false);
    }
  };

  const lastUpdated = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  if (isModal) {
    return (
      <div className="bg-background text-foreground font-sans">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 mb-4">
            <Shield className="w-3 h-3 text-blue-600" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">Privacy & Security</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Last updated: {lastUpdated}
          </p>
        </div>

        <div className="space-y-12">
          <div className="p-6 bg-muted/30 rounded-2xl border border-border/50">
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              Our Privacy Commitment
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              At e-Results GH, privacy is foundational to everything we do. We are transparent about our practices and committed to giving you control over your data. By using our platform, you trust us with your information, and we take that responsibility seriously.
            </p>
          </div>

          <div className="space-y-12">
            {privacySections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    {section.icon}
                  </div>
                  <h2 className="text-xl font-bold">{section.title}</h2>
                </div>
                <div className="pl-11 space-y-4">
                  {Array.isArray(section.content) ? (
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {section.content.map((item, idx) => (
                        <li key={idx} className="flex gap-3 p-3 rounded-xl bg-muted/20 border border-border/50 text-sm text-muted-foreground">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500/30 mt-1.5 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {section.content}
                    </p>
                  )}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#1A1A1A] font-sans selection:bg-blue-100 selection:text-blue-900">
      {!isModal && <LandingNav />}

      {/* Scroll Progress Bar */}
      {!isModal && (
        <motion.div
          className="fixed top-[60px] left-0 right-0 h-1 bg-blue-600 z-[60] origin-left"
          style={{ scaleX }}
        />
      )}

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-white border-b border-gray-100">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-blue-50/50 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[400px] h-[400px] bg-indigo-50/30 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 mb-6">
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">Privacy & Security</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-6 leading-[1.1]">
              Privacy Policy
            </h1>

            <p className="text-lg md:text-xl text-gray-500 leading-relaxed max-w-2xl mb-8">
              We value your trust and are committed to protecting your personal data with the highest standards of transparency and security.
            </p>

            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span>Last updated: {lastUpdated}</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>~8 min read</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span>International Standards</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

          {/* Navigation Sidebar */}
          <aside className="lg:col-span-4 xl:col-span-3 lg:sticky lg:top-32 self-start space-y-8">
            {/* Search */}
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Search policy..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Desktop TOC */}
            <nav className="hidden lg:block">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-6">Contents</p>
              <ul className="space-y-1">
                {privacySections.map((section) => (
                  <li key={section.id}>
                    <button
                      onClick={() => scrollToSection(section.id)}
                      className={cn(
                        "w-full flex items-start gap-3 px-4 py-3 rounded-xl text-left text-[13.5px] font-semibold transition-all duration-200 group",
                        activeSection === section.id
                          ? "bg-blue-50 text-blue-700 shadow-sm shadow-blue-500/5"
                          : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                      )}
                    >
                      <span className={cn(
                        "mt-0.5 transition-colors",
                        activeSection === section.id ? "text-blue-600" : "text-gray-300 group-hover:text-gray-500"
                      )}>
                        {section.number}
                      </span>
                      <span className="flex-1 leading-snug">{section.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Support Box */}
            <div className="p-6 bg-[#0F172A] rounded-2xl text-white overflow-hidden relative group">
              <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl group-hover:bg-blue-500/30 transition-colors" />
              <div className="relative z-10">
                <h4 className="font-bold text-sm mb-2">Have questions?</h4>
                <p className="text-xs text-gray-400 leading-relaxed mb-4">Our privacy team is here to help you understand your rights.</p>
                <a
                  href="mailto:privacy@eresultsgh.com"
                  className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Contact Privacy Officer
                  <ArrowLeft className="w-3 h-3 rotate-180" />
                </a>
              </div>
            </div>
          </aside>

          {/* Policy Content */}
          <main className="lg:col-span-8 xl:col-span-9">
            <div className="prose prose-blue max-w-none">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-20 p-10 bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] relative overflow-hidden group"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-600" />
                <Info className="absolute -bottom-6 -right-6 w-40 h-40 text-gray-50 opacity-[0.03] rotate-12 group-hover:scale-110 group-hover:rotate-0 transition-all duration-700" />
                <div className="relative z-10">
                  <h3 className="text-2xl font-extrabold text-gray-900 mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5 text-blue-600" />
                    </div>
                    Our Privacy Commitment
                  </h3>
                  <p className="text-gray-500 text-lg leading-relaxed mb-0 font-medium">
                    At e-Results GH, privacy is not an afterthought—it's foundational to everything we do. We are transparent about our practices and committed to giving you control over your data. By using our platform, you trust us with your information, and we take that responsibility seriously.
                  </p>
                </div>
              </motion.div>

              <div className="space-y-24">
                {(searchQuery ? filteredSections : privacySections).map((section, index) => (
                  <motion.section
                    key={section.id}
                    id={section.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    className="scroll-mt-32 group"
                  >
                    <div className="flex flex-col md:flex-row md:items-start gap-10">
                      <div className="shrink-0 md:sticky md:top-32">
                        <div className="w-14 h-14 rounded-2xl bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 flex items-center justify-center text-gray-400 group-hover:text-blue-600 group-hover:border-blue-100 group-hover:scale-110 transition-all duration-500">
                          {section.icon}
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-5">
                          <span className="text-[11px] font-bold text-blue-600/50 uppercase tracking-[0.3em]">Section {section.number}</span>
                          <div className="h-px flex-1 bg-gray-100" />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-8 group-hover:translate-x-1 transition-transform duration-500">
                          {section.title}
                        </h2>

                        <div className="space-y-4">
                          {Array.isArray(section.content) ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {section.content.map((item, idx) => (
                                <div key={idx} className="flex gap-4 p-5 rounded-2xl bg-white border border-gray-100 hover:border-blue-100 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 group/item">
                                  <div className="w-2 h-2 rounded-full bg-gray-200 mt-2 shrink-0 group-hover/item:bg-blue-500 transition-colors duration-300" />
                                  <span className="text-[15px] text-gray-500 font-medium leading-relaxed">{item}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-8 rounded-[2rem] bg-gray-50/30 border border-gray-100/50 text-[17px] text-gray-500 font-medium leading-[1.8]">
                              {section.content}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.section>
                ))}

                {searchQuery && filteredSections.length === 0 && (
                  <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                    <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No sections found matching "{searchQuery}"</p>
                  </div>
                )}
              </div>
            </div>

            {/* Final Info Section */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mt-32 pt-16 border-t border-gray-100 space-y-12"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* GDPR Card */}
                <div className="group p-10 rounded-[2.5rem] bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 transition-all duration-500 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10 flex flex-col gap-8">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-[#2563EB] group-hover:scale-110 group-hover:bg-[#2563EB] group-hover:text-white transition-all duration-500">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-extrabold text-gray-900 mb-4">GDPR Compliance</h3>
                      <p className="text-[15px] text-gray-500 leading-relaxed">
                        While based in Ghana, we respect GDPR principles and international privacy standards for all our global users. Your data is handled with the utmost care regardless of your location.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Data Protection Card */}
                <div className="group p-10 rounded-[2.5rem] bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 transition-all duration-500 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10 flex flex-col gap-8">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-[#2563EB] group-hover:scale-110 group-hover:bg-[#2563EB] group-hover:text-white transition-all duration-500">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-extrabold text-gray-900 mb-4">Data Protection</h3>
                      <p className="text-[15px] text-gray-500 leading-relaxed">
                        Your data is encrypted with AES-256 standards both in transit and at rest. We utilize world-class infrastructure to ensure your academic records remain secure and private.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-10 rounded-[2.5rem] bg-gray-900 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/20 rounded-full blur-[100px] group-hover:bg-blue-500/30 transition-colors duration-700" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
                  <div className="max-w-lg">
                    <h3 className="text-3xl font-extrabold mb-4 tracking-tight">Ready to get started?</h3>
                    <p className="text-gray-400 text-[16px] leading-relaxed">
                      Experience the most secure and transparent academic reporting platform in Ghana. Join hundreds of schools already delivering professional results.
                    </p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <Link
                      to="/login"
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "px-8 py-6 rounded-2xl text-sm font-bold border-white/10 !no-underline hover:bg-white/5 hover:text-white transition-all"
                      )}
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/signup"
                      className={cn(
                        buttonVariants({ variant: "default" }),
                        "px-8 py-6 rounded-2xl text-sm font-bold text-white !text-white !no-underline hover:-translate-y-1 transition-all"
                      )}
                    >
                      Start Free Trial
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </main>
        </div>
      </div>

      {!isModal && <LandingFooter />}

      {/* Mobile Floating Menu Button */}
      {!isModal && (
        <Button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden fixed bottom-8 right-8 z-[70] w-14 h-14 rounded-full bg-blue-600 text-white shadow-2xl shadow-blue-500/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all p-0"
        >
          <AnimatePresence mode="wait">
            {isMobileMenuOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
              >
                <ChevronDown className="w-6 h-6 rotate-180" />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
              >
                <BookOpen className="w-6 h-6" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      )}

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && !isModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-[65]"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="lg:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-[32px] z-[66] max-h-[80vh] overflow-hidden flex flex-col shadow-[0_-20px_50px_rgba(0,0,0,0.1)]"
            >
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mt-4 mb-2 shrink-0" />
              <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100 shrink-0">
                <h3 className="font-bold text-gray-900">Contents</h3>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{privacySections.length} Sections</span>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                {privacySections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={cn(
                      "w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-left text-sm font-semibold transition-all",
                      activeSection === section.id
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-500 hover:bg-gray-50"
                    )}
                  >
                    <span className={cn(
                      "text-[10px] font-bold tracking-wider",
                      activeSection === section.id ? "text-blue-600" : "text-gray-300"
                    )}>
                      {section.number}
                    </span>
                    {section.title}
                  </button>
                ))}
              </div>
              <div className="p-6 bg-gray-50 shrink-0">
                <Button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-7 bg-gray-900 text-white rounded-2xl font-bold text-sm shadow-xl shadow-gray-900/10 active:scale-[0.98] transition-all hover:bg-gray-800"
                >
                  Dismiss
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PrivacyPolicy;
