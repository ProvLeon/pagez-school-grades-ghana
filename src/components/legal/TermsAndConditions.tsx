import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, ArrowLeft, FileText, Lightbulb, Clipboard } from "lucide-react";
import { Link } from "react-router-dom";

interface TermsSection {
  number: string;
  title: string;
  content: string | string[];
  id: string;
}

const TermsAndConditions: React.FC = () => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [activeSection, setActiveSection] = useState<string>("acceptance");
  const [isMobileTooltipOpen, setIsMobileTooltipOpen] = useState(false);

  const toggleSection = (sectionNumber: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionNumber)) {
      newExpanded.delete(sectionNumber);
    } else {
      newExpanded.add(sectionNumber);
    }
    setExpandedSections(newExpanded);
  };

  // Track active section on scroll
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
          if (rect.top <= 200) {
            currentActive = section.id;
          }
        }
      }
      setActiveSection(currentActive);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const termsSections: TermsSection[] = [
    {
      number: "1",
      title: "Acceptance of Terms",
      id: "acceptance",
      content:
        "By accessing, browsing, or using this website, users agree to comply with and be bound by these Terms and Conditions and the Privacy Policy of eResults GH.",
    },
    {
      number: "2",
      title: "Purpose of the Platform",
      id: "purpose",
      content:
        "eResults GH provides digital educational services including examination result checking, academic records access, student performance management, educational reporting services, and online result verification.",
    },
    {
      number: "3",
      title: "User Responsibilities",
      id: "responsibilities",
      content:
        "Users agree to provide accurate information, maintain confidentiality of credentials, and avoid unauthorized access or harmful activities on the platform.",
    },
    {
      number: "4",
      title: "Account Security",
      id: "security",
      content:
        "Users are responsible for maintaining the confidentiality of passwords and account details.",
    },
    {
      number: "5",
      title: "Payment and Billing",
      id: "payment",
      content:
        "Payments made on the platform are non-refundable unless otherwise stated.",
    },
    {
      number: "6",
      title: "Intellectual Property Rights",
      id: "intellectual-property",
      content:
        "All website content including logos, software, graphics, layouts, and text remains the intellectual property of eResults GH.",
    },
    {
      number: "7",
      title: "Data Accuracy",
      id: "data-accuracy",
      content:
        "eResults GH strives to ensure accuracy but does not guarantee all records will always be error-free.",
    },
    {
      number: "8",
      title: "Prohibited Activities",
      id: "prohibited-activities",
      content:
        "Users shall not attempt to hack, reverse engineer, manipulate records, or misuse the platform.",
    },
    {
      number: "9",
      title: "Limitation of Liability",
      id: "liability",
      content:
        "eResults GH shall not be liable for downtime, technical failures, or unauthorized access caused by user negligence.",
    },
    {
      number: "10",
      title: "Third-Party Services",
      id: "third-party",
      content:
        "The website may integrate with third-party services such as payment gateways and analytics providers.",
    },
    {
      number: "11",
      title: "Suspension or Termination",
      id: "termination",
      content:
        "eResults GH reserves the right to suspend or terminate accounts for misuse or policy violations.",
    },
    {
      number: "12",
      title: "Modifications to Terms",
      id: "modifications",
      content:
        "These terms may be updated periodically without prior notice.",
    },
    {
      number: "13",
      title: "Governing Law",
      id: "governing-law",
      content:
        "These Terms and Conditions are governed by the laws of the Republic of Ghana.",
    },
    {
      number: "14",
      title: "Contact Information",
      id: "contact",
      content: [
        "Website: https://eresultsgh.com",
        "Email: support@eresultsgh.com",
        "Phone: +233 248 639 158",
      ],
    },
  ];

  const lastUpdated = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection(id);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground print:bg-white print:text-black">
      {/* Professional Header with Logo Integration */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-sm print:static print:border-gray-300 print:bg-white">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Logo & Brand */}
            <Link
              to="/"
              className="flex items-center gap-3 hover:opacity-75 transition-opacity duration-200 print:no-underline group"
            >
              <div className="relative">
                <img
                  src="/ERESULTS_LOGO.png"
                  alt="e-Results GH"
                  className="w-8 h-8 print:hidden"
                />
              </div>
              <div className="hidden sm:flex flex-col gap-0.5">
                <span className="font-bold text-sm text-foreground group-hover:text-primary/80 transition-colors">
                  e-Results GH
                </span>
                <span className="text-xs text-muted-foreground">Ghana's Educational Platform</span>
              </div>
            </Link>

            {/* Back Button */}
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary font-medium text-sm transition-colors duration-200 print:hidden"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section with Title & Metadata */}
      <section className="relative overflow-hidden border-b border-border/50 print:border-gray-300">
        {/* Gradient Background (subtle) */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none print:hidden" />

        <div className="relative px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 rounded-xl bg-primary/10 print:hidden">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-tight">
                  Terms and Conditions
                </h1>
                <p className="text-base text-muted-foreground mt-3 max-w-2xl leading-relaxed">
                  Please review these terms governing your use of eResults GH. By accessing our platform, you acknowledge and agree to be bound by these terms.
                </p>
              </div>
            </div>

            {/* Metadata */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm text-muted-foreground print:text-gray-600 pt-4 border-t border-border/30 print:border-gray-300">
              <span className="flex items-center gap-2">
                <Clipboard className="w-4 h-4 text-primary/70" />
                Version 1.0
              </span>
              <span className="hidden sm:inline text-border/50 print:text-gray-400">•</span>
              <span>Last updated: {lastUpdated}</span>
              <span className="hidden sm:inline text-border/50 print:text-gray-400">•</span>
              <span>{termsSections.length} Sections</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area - Two Column Layout */}
      <div className="px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Table of Contents (Sticky on Desktop) */}
          <aside className="lg:col-span-1">
            {/* Mobile Collapsible TOC */}
            <div className="lg:hidden mb-6">
              <button
                onClick={() => setIsMobileTooltipOpen(!isMobileTooltipOpen)}
                className={cn(
                  "w-full px-4 py-3 flex items-center justify-between",
                  "bg-card border border-border/50 rounded-lg",
                  "font-semibold text-sm transition-all duration-200",
                  "hover:border-primary/50",
                  isMobileTooltipOpen && "border-primary/50 bg-primary/5"
                )}
              >
                <span className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-primary" />
                  Quick Navigation
                </span>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 transition-transform duration-200",
                    isMobileTooltipOpen && "rotate-180"
                  )}
                />
              </button>
            </div>

            {/* Desktop Sticky TOC */}
            <nav
              className={cn(
                "hidden lg:block",
                "lg:sticky lg:top-24",
                "space-y-1.5"
              )}
            >
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 px-3 print:text-gray-600">
                In This Page
              </h3>
              <ul className="space-y-0.5">
                {termsSections.map((section) => (
                  <li key={section.id}>
                    <button
                      onClick={() => scrollToSection(section.id)}
                      className={cn(
                        "w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium",
                        "transition-all duration-200 ease-out",
                        "flex items-start gap-2.5",
                        activeSection === section.id
                          ? "bg-primary/10 text-primary border-l-2 border-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border-l-2 border-transparent"
                      )}
                    >
                      <span className="text-xs font-bold text-primary/70 mt-0.5 min-w-fit">
                        {section.number}
                      </span>
                      <span className="flex-1 line-clamp-2">{section.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Mobile TOC Dropdown Content */}
            {isMobileTooltipOpen && (
              <div className="lg:hidden mb-8 p-3 bg-card border border-border/50 rounded-lg space-y-2">
                {termsSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => {
                      scrollToSection(section.id);
                      setIsMobileTooltipOpen(false);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded text-sm",
                      "transition-colors duration-200",
                      activeSection === section.id
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <span className="font-bold">{section.number}.</span> {section.title}
                  </button>
                ))}
              </div>
            )}
          </aside>

          {/* Right Column - Main Content */}
          <main className="lg:col-span-3 space-y-6">
            {/* Introductory Section */}
            <section className="p-6 bg-card border border-border/50 rounded-xl print:bg-white print:border-gray-300 print:p-0 print:border-0">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground">Welcome to e-Results GH</h2>
                <p className="text-sm leading-relaxed text-muted-foreground print:text-gray-700">
                  These Terms and Conditions ("Terms") establish the legal framework for your use of the e-Results GH platform and our digital educational services. By accessing or using our platform, you enter into a binding agreement with e-Results GH. We encourage you to read these terms carefully and contact our support team if you have any questions.
                </p>
              </div>
            </section>

            {/* Terms Sections */}
            <section className="space-y-3">
              {termsSections.map((section) => {
                const isExpanded = expandedSections.has(section.number);
                const isCurrent = activeSection === section.id;

                return (
                  <article
                    key={section.id}
                    id={section.id}
                    className={cn(
                      "group transition-all duration-200 print:page-break-inside-avoid",
                      isCurrent && "lg:ring-2 lg:ring-primary/30 lg:rounded-lg"
                    )}
                  >
                    {/* Section Header */}
                    <button
                      onClick={() => toggleSection(section.number)}
                      className={cn(
                        "w-full px-5 py-4 flex items-start justify-between",
                        "bg-card border border-border/50 rounded-lg",
                        "hover:border-primary/30 hover:bg-accent/5",
                        "transition-all duration-200",
                        "print:bg-white print:border-gray-300 print:cursor-default",
                        isExpanded && "border-primary/30 bg-primary/5",
                        isCurrent && "ring-2 ring-primary/30 border-primary/30"
                      )}
                    >
                      <div className="flex items-start gap-4 text-left flex-1">
                        {/* Section Number Badge */}
                        <div
                          className={cn(
                            "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
                            "text-sm font-bold",
                            "bg-gradient-to-br from-primary/20 to-primary/10 text-primary",
                            "border border-primary/20",
                            "print:bg-white print:border print:border-gray-400 print:text-black"
                          )}
                        >
                          {section.number}
                        </div>

                        {/* Title */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base text-foreground leading-snug">
                            {section.title}
                          </h3>
                        </div>
                      </div>

                      {/* Expand Icon */}
                      <ChevronDown
                        className={cn(
                          "w-5 h-5 text-muted-foreground flex-shrink-0 ml-3 transition-transform duration-300 ease-out print:hidden",
                          "group-hover:text-primary",
                          isExpanded && "rotate-180 text-primary"
                        )}
                      />
                    </button>

                    {/* Expandable Content */}
                    <div
                      className={cn(
                        "overflow-hidden transition-all duration-300 ease-in-out print:max-h-none print:overflow-visible",
                        isExpanded ? "max-h-96 visible" : "max-h-0 invisible"
                      )}
                    >
                      <div
                        className={cn(
                          "px-5 py-4 border border-t-0 border-border/50 rounded-b-lg",
                          "bg-muted/30 text-sm leading-relaxed text-foreground",
                          "print:bg-white print:border-gray-300 print:border-t print:border-t-gray-300 print:rounded-none"
                        )}
                      >
                        {Array.isArray(section.content) ? (
                          <ul className="space-y-2.5">
                            {section.content.map((item, idx) => (
                              <li key={idx} className="flex gap-3 print:text-gray-800">
                                <span className="text-primary font-bold mt-0.5">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="print:text-gray-800">{section.content}</p>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>

            {/* CTA Section - Contact & Resources */}
            <section className="mt-12 pt-8 border-t border-border/50 print:border-gray-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Support Card */}
                <div className="p-6 bg-gradient-to-br from-primary/10 to-accent/5 border border-primary/20 rounded-xl print:bg-white print:border-gray-300">
                  <h3 className="font-semibold text-foreground mb-2">Need Clarification?</h3>
                  <p className="text-sm text-muted-foreground mb-4 print:text-gray-700">
                    Our support team is available to answer any questions about these terms.
                  </p>
                  <a
                    href="mailto:support@eresultsgh.com"
                    className={cn(
                      "inline-flex items-center gap-2 px-4 py-2.5 font-medium text-sm",
                      "bg-primary text-primary-foreground hover:bg-primary/90",
                      "rounded-lg transition-all duration-200",
                      "print:bg-blue-600 print:text-white print:no-underline"
                    )}
                  >
                    Contact Support
                  </a>
                </div>

                {/* Privacy Policy Card */}
                <div className="p-6 bg-gradient-to-br from-secondary/10 to-accent/5 border border-secondary/20 rounded-xl print:bg-white print:border-gray-300">
                  <h3 className="font-semibold text-foreground mb-2">Privacy Matters?</h3>
                  <p className="text-sm text-muted-foreground mb-4 print:text-gray-700">
                    Review our comprehensive Privacy Policy to understand how we protect your data.
                  </p>
                  <Link
                    to="/privacy"
                    className={cn(
                      "inline-flex items-center gap-2 px-4 py-2.5 font-medium text-sm",
                      "bg-secondary text-secondary-foreground hover:bg-secondary/90",
                      "rounded-lg transition-all duration-200",
                      "print:bg-gray-600 print:text-white print:no-underline"
                    )}
                  >
                    Read Policy
                  </Link>
                </div>
              </div>
            </section>

            {/* Footer Info */}
            <div className="mt-8 pt-6 border-t border-border/30 print:border-gray-300 print:text-gray-700">
              <p className="text-xs text-muted-foreground print:text-gray-600">
                <strong>Version:</strong> 1.0 | <strong>Last Updated:</strong> {lastUpdated}
              </p>
              <p className="text-xs text-muted-foreground mt-2 print:text-gray-600">
                These terms are governed by the laws of the Republic of Ghana. For legal inquiries, contact our legal team at support@eresultsgh.com.
              </p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
