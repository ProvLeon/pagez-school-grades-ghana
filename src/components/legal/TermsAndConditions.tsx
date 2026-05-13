import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ArrowLeft,
  FileText,
  Lightbulb,
  Clipboard,
  Shield,
  Search,
  BookOpen,
  Scale,
  CreditCard,
  UserCheck,
  Lock,
  Zap,
  HelpCircle,
  AlertTriangle,
  FileCheck,
  Globe,
  Mail,
  Smartphone
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import LandingNav from "@/components/landing/LandingNav";
import LandingFooter from "@/components/landing/LandingFooter";

import { Button, buttonVariants } from "@/components/ui/button";

interface TermsSection {
  number: string;
  title: string;
  content: string | string[];
  id: string;
  icon: React.ReactNode;
}

interface TermsAndConditionsProps {
  isModal?: boolean;
}

const TermsAndConditions: React.FC<TermsAndConditionsProps> = ({ isModal = false }) => {
  const [activeSection, setActiveSection] = useState<string>("acceptance");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const termsSections: TermsSection[] = [
    {
      number: "01",
      title: "Acceptance of Terms",
      id: "acceptance",
      icon: <UserCheck className="w-5 h-5" />,
      content:
        "By accessing, browsing, or using this website, users agree to comply with and be bound by these Terms and Conditions and the Privacy Policy of eResults GH. These terms constitute a legally binding agreement between you and PB Pagez LTD.",
    },
    {
      number: "02",
      title: "Purpose of the Platform",
      id: "purpose",
      icon: <Zap className="w-5 h-5" />,
      content:
        "eResults GH provides digital educational services including examination result checking, academic records access, student performance management, educational reporting services, and online result verification. We aim to modernize academic administration for Ghanaian schools.",
    },
    {
      number: "03",
      title: "User Responsibilities",
      id: "responsibilities",
      icon: <FileCheck className="w-5 h-5" />,
      content: [
        "Provide accurate and truthful information during registration",
        "Maintain the confidentiality of account credentials",
        "Avoid unauthorized access to system resources",
        "Abstain from any activities that could harm platform integrity",
        "Ensure all uploaded data complies with local educational regulations",
      ],
    },
    {
      number: "04",
      title: "Account Security",
      id: "security",
      icon: <Lock className="w-5 h-5" />,
      content:
        "Users are responsible for maintaining the confidentiality of passwords and account details. eResults GH uses advanced encryption but cannot be held liable for security breaches resulting from user negligence or shared credentials.",
    },
    {
      number: "05",
      title: "Payment and Billing",
      id: "payment",
      icon: <CreditCard className="w-5 h-5" />,
      content:
        "Payments made on the platform for subscription tiers or result checking services are non-refundable unless otherwise stated by our billing department. We use secure third-party payment processors to ensure transaction safety.",
    },
    {
      number: "06",
      title: "Intellectual Property Rights",
      id: "intellectual-property",
      icon: <Shield className="w-5 h-5" />,
      content:
        "All website content including logos, software code, graphics, layouts, and text remains the exclusive intellectual property of PB Pagez LTD. Unauthorized reproduction or distribution is strictly prohibited.",
    },
    {
      number: "07",
      title: "Data Accuracy",
      id: "data-accuracy",
      icon: <Smartphone className="w-5 h-5" />,
      content:
        "eResults GH strives to ensure the highest level of accuracy in report generation but does not guarantee that all records will always be error-free. We rely on the data provided by educational institutions.",
    },
    {
      number: "08",
      title: "Prohibited Activities",
      id: "prohibited-activities",
      icon: <AlertTriangle className="w-5 h-5" />,
      content: [
        "Attempting to hack or breach platform security",
        "Reverse engineering any part of the software",
        "Manipulating academic records or results",
        "Using the platform for spam or unauthorized marketing",
        "Impersonating school officials or other users",
      ],
    },
    {
      number: "09",
      title: "Limitation of Liability",
      id: "liability",
      icon: <Scale className="w-5 h-5" />,
      content:
        "To the maximum extent permitted by law, eResults GH shall not be liable for platform downtime, technical failures, loss of data, or unauthorized access caused by factors beyond our reasonable control.",
    },
    {
      number: "10",
      title: "Third-Party Services",
      id: "third-party",
      icon: <Globe className="w-5 h-5" />,
      content:
        "The website may integrate with third-party services such as payment gateways (Hubtel/Paystack) and analytics providers. Your use of these services is governed by their respective terms and privacy policies.",
    },
    {
      number: "11",
      title: "Suspension or Termination",
      id: "termination",
      icon: <AlertTriangle className="w-5 h-5" />,
      content:
        "eResults GH reserves the right to suspend or terminate user accounts without prior notice for misuse, policy violations, or non-payment of subscription fees.",
    },
    {
      number: "12",
      title: "Modifications to Terms",
      id: "modifications",
      icon: <Clipboard className="w-5 h-5" />,
      content:
        "These terms may be updated periodically. While we aim to notify users of material changes, your continued use of the platform constitutes acceptance of the most recent version of these Terms and Conditions.",
    },
    {
      number: "13",
      title: "Governing Law",
      id: "governing-law",
      icon: <Scale className="w-5 h-5" />,
      content:
        "These Terms and Conditions are governed by and construed in accordance with the laws of the Republic of Ghana. Any disputes shall be subject to the exclusive jurisdiction of the courts of Ghana.",
    },
    {
      number: "14",
      title: "Contact Information",
      id: "contact",
      icon: <Mail className="w-5 h-5" />,
      content: [
        "Website: https://eresultsgh.com",
        "Email: support@eresultsgh.com",
        "Phone: +233 248 639 158",
        "Address: Accra, Ghana",
      ],
    },
  ];

  const filteredSections = termsSections.filter(
    (section) =>
      section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (Array.isArray(section.content)
        ? section.content.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()))
        : section.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  useEffect(() => {
    const handleScroll = () => {
      const sections = termsSections.map((s) => ({
        id: s.id,
        element: document.getElementById(s.id),
      }));

      let currentActive = termsSections[0].id;
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
            <Scale className="w-3 h-3 text-blue-600" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">Legal Agreement</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Terms & Conditions</h1>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Last updated: {lastUpdated}
          </p>
        </div>

        <div className="space-y-12">
          <div className="p-6 bg-muted/30 rounded-2xl border border-border/50">
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              <Scale className="w-5 h-5 text-blue-600" />
              Understanding Our Terms
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              These Terms and Conditions establish the legal framework for your use of the e-Results GH platform. By accessing or using our platform, you enter into a binding agreement with PB Pagez LTD. We encourage you to read these terms carefully and contact our support team if you have any questions.
            </p>
          </div>

          <div className="space-y-12">
            {termsSections.map((section) => (
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
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[400px] h-[400px] bg-blue-50/30 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 mb-6">
              <Scale className="w-3.5 h-3.5 text-[#2563EB]" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#2563EB]">Legal Agreement</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-6 leading-[1.1]">
              Terms & Conditions
            </h1>

            <p className="text-lg md:text-xl text-gray-500 leading-relaxed max-w-2xl mb-8">
              Welcome to eResults GH. These terms govern your use of our platform and the services we provide to educational institutions in Ghana.
            </p>

            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                <span>Last updated: {lastUpdated}</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>~10 min read</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>Secure & Binding</span>
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
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#2563EB] transition-colors" />
              <input
                type="text"
                placeholder="Search terms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-[#2563EB] transition-all"
              />
            </div>

            {/* Desktop TOC */}
            <nav className="hidden lg:block">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-6">Contents</p>
              <ul className="space-y-1">
                {termsSections.map((section) => (
                  <li key={section.id}>
                    <button
                      onClick={() => scrollToSection(section.id)}
                      className={cn(
                        "w-full flex items-start gap-3 px-4 py-3 rounded-xl text-left text-[13.5px] font-semibold transition-all duration-200 group",
                        activeSection === section.id
                          ? "bg-blue-50 text-[#2563EB] shadow-sm shadow-blue-500/5"
                          : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                      )}
                    >
                      <span className={cn(
                        "mt-0.5 transition-colors",
                        activeSection === section.id ? "text-[#2563EB]" : "text-gray-300 group-hover:text-gray-500"
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
              <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl group-hover:bg-indigo-500/30 transition-colors" />
              <div className="relative z-10">
                <h4 className="font-bold text-sm mb-2">Need clarification?</h4>
                <p className="text-xs text-gray-400 leading-relaxed mb-4">Our legal team is here to help you understand these terms.</p>
                <a
                  href="mailto:support@eresultsgh.com"
                  className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Contact Support
                  <ArrowLeft className="w-3 h-3 rotate-180" />
                </a>
              </div>
            </div>
          </aside>

          {/* Terms Content */}
          <main className="lg:col-span-8 xl:col-span-9">
            <div className="prose prose-blue max-w-none">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-20 p-10 bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] relative overflow-hidden group"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-[#2563EB]" />
                <HelpCircle className="absolute -bottom-6 -right-6 w-40 h-40 text-gray-50 opacity-[0.03] rotate-12 group-hover:scale-110 group-hover:rotate-0 transition-all duration-700" />
                <div className="relative z-10">
                  <h3 className="text-2xl font-extrabold text-gray-900 mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                      <Scale className="w-5 h-5 text-[#2563EB]" />
                    </div>
                    Understanding Our Terms
                  </h3>
                  <p className="text-gray-500 text-lg leading-relaxed mb-0 font-medium">
                    These Terms and Conditions establish the legal framework for your use of the e-Results GH platform. By accessing or using our platform, you enter into a binding agreement with PB Pagez LTD. We encourage you to read these terms carefully and contact our support team if you have any questions.
                  </p>
                </div>
              </motion.div>

              <div className="space-y-24">
                {(searchQuery ? filteredSections : termsSections).map((section, index) => (
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
                        <div className="w-14 h-14 rounded-2xl bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 flex items-center justify-center text-gray-400 group-hover:text-[#2563EB] group-hover:border-blue-100 group-hover:scale-110 transition-all duration-500">
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
                                  <div className="w-2 h-2 rounded-full bg-gray-200 mt-2 shrink-0 group-hover/item:bg-[#2563EB] transition-colors duration-300" />
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
                {/* Platform Integrity Card */}
                <div className="group p-10 rounded-[2.5rem] bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 transition-all duration-500 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10 flex flex-col gap-8">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-[#2563EB] group-hover:scale-110 group-hover:bg-[#2563EB] group-hover:text-white transition-all duration-500">
                      <Shield className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-extrabold text-gray-900 mb-4">Platform Integrity</h3>
                      <p className="text-[15px] text-gray-500 leading-relaxed">
                        We maintain strict standards for data integrity and system security to ensure the most reliable reporting engine. Every result generated is backed by our commitment to precision.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Legal Compliance Card */}
                <div className="group p-10 rounded-[2.5rem] bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 transition-all duration-500 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10 flex flex-col gap-8">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-[#2563EB] group-hover:scale-110 group-hover:bg-[#2563EB] group-hover:text-white transition-all duration-500">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-extrabold text-gray-900 mb-4">Legal Compliance</h3>
                      <p className="text-[15px] text-gray-500 leading-relaxed">
                        Our terms are fully compliant with Ghanaian educational regulations and digital commerce laws. we work closely with authorities to ensure a legally robust platform.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-10 rounded-[2.5rem] bg-gray-900 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/20 rounded-full blur-[100px] group-hover:bg-blue-500/30 transition-colors duration-700" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
                  <div className="max-w-lg">
                    <h3 className="text-3xl font-extrabold mb-4 tracking-tight">Questions about these terms?</h3>
                    <p className="text-gray-400 text-[16px] leading-relaxed">
                      Our support team is ready to assist you with any inquiries regarding our policies and service agreements. We're here to help you navigate.
                    </p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <a
                      href="mailto:support@eresultsgh.com"
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "px-8 py-6 rounded-2xl text-sm font-bold border-white/10 !no-underline hover:bg-white/5 hover:text-white transition-all"
                      )}
                    >
                      Contact Support
                    </a>
                    <Link
                      to="/privacy"
                      className={cn(
                        buttonVariants({ variant: "default" }),
                        "px-8 py-6 rounded-2xl text-sm font-bold text-white bg-[#2563EB] !text-white !no-underline hover:bg-blue-500 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-1 transition-all"
                      )}
                    >
                      View Privacy Policy
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
          className="lg:hidden fixed bottom-8 right-8 z-[70] w-14 h-14 rounded-full bg-[#2563EB] text-white shadow-2xl shadow-blue-500/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all p-0"
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
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{termsSections.length} Sections</span>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                {termsSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={cn(
                      "w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-left text-sm font-semibold transition-all",
                      activeSection === section.id
                        ? "bg-blue-50 text-[#2563EB]"
                        : "text-gray-500 hover:bg-gray-50"
                    )}
                  >
                    <span className={cn(
                      "text-[10px] font-bold tracking-wider",
                      activeSection === section.id ? "text-[#2563EB]" : "text-gray-300"
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

export default TermsAndConditions;
