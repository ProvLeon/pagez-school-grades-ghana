import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, ArrowLeft, Lock, Shield, Eye, FileCheck, AlertCircle, Lightbulb } from "lucide-react";
import { Link } from "react-router-dom";

interface PrivacySection {
  number: string;
  title: string;
  content: string | string[];
  id: string;
  icon?: React.ReactNode;
}

const PrivacyPolicy: React.FC = () => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [activeSection, setActiveSection] = useState<string>("information-collect");
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
      const sections = privacySections.map((s) => ({
        id: s.id,
        element: document.getElementById(s.id),
      }));

      let currentActive = privacySections[0].id;
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

  const privacySections: PrivacySection[] = [
    {
      number: "1",
      title: "Your Privacy Rights",
      id: "privacy-rights",
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
      number: "2",
      title: "Information We Collect",
      id: "information-collect",
      content:
        "We collect personal information (name, email, phone), technical information (IP address, browser type, usage data), and academic records necessary to provide our educational services. Collection is always transparent and purposeful.",
    },
    {
      number: "3",
      title: "How We Use Information",
      id: "use-information",
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
      number: "4",
      title: "Data Protection and Security",
      id: "data-protection",
      content:
        "We implement industry-standard technical and administrative measures to protect user data, including AES-256 encryption, secure TLS connections, regular security audits, and restricted access controls. Your data is stored on secure, certified servers.",
    },
    {
      number: "5",
      title: "Data Sharing Policy",
      id: "sharing-information",
      content:
        "We do not sell users' personal information. We may share data only with: (1) trusted service providers bound by confidentiality agreements, (2) legal authorities when legally required, (3) school administrators for educational purposes with proper authorization, and (4) payment processors for transaction processing.",
    },
    {
      number: "6",
      title: "Cookies and Tracking",
      id: "cookies",
      content:
        "Cookies and similar technologies may be used to improve user experience, remember preferences, and analyze website traffic. You can control cookie preferences through your browser settings. We do not use tracking for advertising purposes.",
    },
    {
      number: "7",
      title: "Data Retention",
      id: "data-retention",
      content:
        "Data may be retained as necessary to provide educational services, comply with legal obligations, and maintain platform security. Academic records are retained according to Ghanaian education regulations. You can request deletion subject to legal requirements.",
    },
    {
      number: "8",
      title: "Children's Privacy",
      id: "children-privacy",
      content:
        "Student-related information may be processed for educational purposes with proper authorization from parents/guardians and school officials. We maintain special safeguards for educational records and limit processing to what is necessary for educational delivery.",
    },
    {
      number: "9",
      title: "GDPR & International Compliance",
      id: "gdpr-compliance",
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
      content:
        "eResults GH is not responsible for the privacy practices of external websites or third-party services linked from our platform. We recommend reviewing their privacy policies independently. We use analytics providers (Google Analytics) and CDN services - these are bound by data processing agreements.",
    },
    {
      number: "11",
      title: "Your Data Rights Requests",
      id: "data-rights",
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
      content:
        "This policy may be updated periodically to reflect legal changes or operational improvements. Material changes will be notified via email or prominent notice on our platform. Your continued use constitutes acceptance of updated terms.",
    },
    {
      number: "13",
      title: "Contact Our Privacy Team",
      id: "contact",
      content: [
        "Privacy Officer: privacy@eresultsgh.com",
        "Website: https://eresultsgh.com",
        "Phone: +233 248 639 158",
        "Mailing Address: Accra, Ghana",
        "Response time: 5-7 business days for privacy inquiries",
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
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-tight">
                  Privacy Policy
                </h1>
                <p className="text-base text-muted-foreground mt-3 max-w-2xl leading-relaxed">
                  Your data privacy is paramount. We're committed to protecting your information and providing transparency about how we collect, use, and safeguard your data.
                </p>
              </div>
            </div>

            {/* Metadata */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm text-muted-foreground print:text-gray-600 pt-4 border-t border-border/30 print:border-gray-300">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" />
                <span>Data Protection Certified</span>
              </div>
              <span className="hidden sm:inline text-border/50 print:text-gray-400">•</span>
              <span>Last updated: {lastUpdated}</span>
              <span className="hidden sm:inline text-border/50 print:text-gray-400">•</span>
              <span>{privacySections.length} Comprehensive Sections</span>
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
                In This Policy
              </h3>
              <ul className="space-y-0.5">
                {privacySections.map((section) => (
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
                {privacySections.map((section) => (
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
            {/* Data Protection Highlight Cards */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 print:hidden">
              <div className="p-5 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <Lock className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-sm text-foreground">Secure & Encrypted</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  AES-256 encryption protects your data in transit and at rest
                </p>
              </div>
              <div className="p-5 bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <FileCheck className="w-5 h-5 text-secondary" />
                  <h3 className="font-semibold text-sm text-foreground">Never Sold</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your personal data is never sold or shared with third parties
                </p>
              </div>
              <div className="p-5 bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <Eye className="w-5 h-5 text-accent" />
                  <h3 className="font-semibold text-sm text-foreground">Your Control</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Full transparency and control over your personal information
                </p>
              </div>
            </section>

            {/* Introductory Section */}
            <section className="p-6 bg-card border border-border/50 rounded-xl print:bg-white print:border-gray-300 print:p-0 print:border-0">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground">Our Privacy Commitment</h2>
                <p className="text-sm leading-relaxed text-muted-foreground print:text-gray-700">
                  At e-Results GH, privacy is not an afterthought—it's foundational to everything we do. This Privacy Policy explains how we collect, process, use, and protect your personal information. We are transparent about our practices and committed to giving you control over your data. By using our platform, you trust us with your information, and we take that responsibility seriously.
                </p>
              </div>
            </section>

            {/* Privacy Sections */}
            <section className="space-y-3">
              {privacySections.map((section) => {
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

            {/* GDPR & Compliance Notice */}
            <section className="mt-8 p-6 bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20 rounded-xl print:bg-white print:border-gray-300">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5 print:hidden" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2 print:text-black">
                    International Privacy Standards
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed print:text-gray-700 mb-3">
                    While e-Results GH is based in Ghana and complies with Ghanaian data protection laws, we respect and adhere to international privacy standards. For users in the EU, we comply with GDPR principles including lawful basis for processing, data minimization, storage limitation, and your specific rights.
                  </p>
                  <p className="text-sm text-muted-foreground print:text-gray-700">
                    <strong>EU Residents:</strong> You have the right to lodge a complaint with your local Data Protection Authority if you believe your rights have been violated.
                  </p>
                </div>
              </div>
            </section>

            {/* CTA Section - Contact & Resources */}
            <section className="mt-12 pt-8 border-t border-border/50 print:border-gray-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Privacy Rights Card */}
                <div className="p-6 bg-gradient-to-br from-primary/10 to-accent/5 border border-primary/20 rounded-xl print:bg-white print:border-gray-300">
                  <h3 className="font-semibold text-foreground mb-2">Exercise Your Rights</h3>
                  <p className="text-sm text-muted-foreground mb-4 print:text-gray-700">
                    You have full control over your personal data. Request access, correction, deletion, or portability.
                  </p>
                  <a
                    href="mailto:privacy@eresultsgh.com"
                    className={cn(
                      "inline-flex items-center gap-2 px-4 py-2.5 font-medium text-sm",
                      "bg-primary text-primary-foreground hover:bg-primary/90",
                      "rounded-lg transition-all duration-200",
                      "print:bg-blue-600 print:text-white print:no-underline"
                    )}
                  >
                    Contact Privacy Officer
                  </a>
                </div>

                {/* Terms of Service Card */}
                <div className="p-6 bg-gradient-to-br from-secondary/10 to-accent/5 border border-secondary/20 rounded-xl print:bg-white print:border-gray-300">
                  <h3 className="font-semibold text-foreground mb-2">Terms & Conditions</h3>
                  <p className="text-sm text-muted-foreground mb-4 print:text-gray-700">
                    Review our complete Terms and Conditions governing your use of the e-Results GH platform.
                  </p>
                  <Link
                    to="/terms"
                    className={cn(
                      "inline-flex items-center gap-2 px-4 py-2.5 font-medium text-sm",
                      "bg-secondary text-secondary-foreground hover:bg-secondary/90",
                      "rounded-lg transition-all duration-200",
                      "print:bg-gray-600 print:text-white print:no-underline"
                    )}
                  >
                    Read Terms
                  </Link>
                </div>
              </div>
            </section>

            {/* Footer Info */}
            <div className="mt-8 pt-6 border-t border-border/30 print:border-gray-300 print:text-gray-700">
              <p className="text-xs text-muted-foreground print:text-gray-600">
                <strong>Version:</strong> 2.0 | <strong>Last Updated:</strong> {lastUpdated}
              </p>
              <p className="text-xs text-muted-foreground mt-2 print:text-gray-600">
                This Privacy Policy is governed by the laws of the Republic of Ghana. For privacy-related inquiries or to exercise your data rights, contact our Privacy Officer at privacy@eresultsgh.com. Responses are typically provided within 5-7 business days.
              </p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
