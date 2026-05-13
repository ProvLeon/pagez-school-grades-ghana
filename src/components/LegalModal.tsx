import React, { useEffect, useCallback, useState, lazy, Suspense } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const PrivacyPolicy = lazy(() => import("./legal/PrivacyPolicy").then(m => ({ default: m.default })));
const TermsAndConditions = lazy(() => import("./legal/TermsAndConditions").then(m => ({ default: m.default })));

interface LegalModalProps {
  isOpen: boolean;
  type: "privacy" | "terms" | null;
  onClose: () => void;
}

export function LegalModal({ isOpen, type, onClose }: LegalModalProps) {
  const [isRendering, setIsRendering] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
      setIsRendering(true);
    }

    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  if (!isRendering || !isOpen || !type) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleBackdropClick}
            className="fixed inset-0 bg-black/50 z-40"
            aria-hidden="true"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="w-full max-w-3xl max-h-[85vh] bg-background rounded-xl shadow-2xl flex flex-col pointer-events-auto overflow-hidden border border-border/50"
              role="dialog"
              aria-modal="true"
              aria-labelledby="legal-modal-title"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-gradient-to-r from-background to-muted/30">
                <h2
                  id="legal-modal-title"
                  className="text-lg font-semibold text-foreground"
                >
                  {type === "privacy" ? "Privacy Policy" : "Terms of Service"}
                </h2>
                <button
                  onClick={onClose}
                  className={cn(
                    "p-1.5 rounded-lg hover:bg-muted transition-colors",
                    "text-muted-foreground hover:text-foreground",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  )}
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto legal-modal-scroll">
                <div className="p-6 lg:p-8">
                  <style>{`
                    /* Clean content styling */
                    .legal-modal-content {
                      color: var(--foreground);
                      font-family: inherit;
                    }

                    /* Hide navigation, footer, and complex layouts */
                    .legal-modal-content .landing-nav,
                    .legal-modal-content .landing-footer,
                    .legal-modal-content header,
                    .legal-modal-content nav,
                    .legal-modal-content footer,
                    .legal-modal-content [data-tour],
                    .legal-modal-content button[class*="menu"],
                    .legal-modal-content button[class*="float"],
                    .legal-modal-content .floating-button,
                    .legal-modal-content [class*="mobile-menu"],
                    .legal-modal-content .scroll-progress,
                    .legal-modal-content .mobileMenu,
                    .legal-modal-content [class*="drawer"] {
                      display: none !important;
                    }

                    /* Hide only background decorative divs, NOT inline SVGs */
                    .legal-modal-content > div[class*="absolute"],
                    .legal-modal-content > div[class*="fixed"],
                    .legal-modal-content > div[class*="blur"],
                    .legal-modal-content > div[class*="gradient"],
                    .legal-modal-content div[style*="position: absolute"],
                    .legal-modal-content div[style*="position: fixed"] {
                      display: none !important;
                    }

                    /* Reset container styling but keep text/icons */
                    .legal-modal-content > div {
                      background: transparent !important;
                      padding: 0 !important;
                      margin: 0 !important;
                      min-height: auto !important;
                      border: none !important;
                    }

                    /* Clean sections */
                    .legal-modal-content section {
                      padding: 0 !important;
                      margin: 0 0 2rem 0 !important;
                      border: none !important;
                      background: transparent !important;
                    }

                    .legal-modal-content section::before,
                    .legal-modal-content section::after {
                      display: none !important;
                    }

                    /* Typography */
                    .legal-modal-content h1 {
                      font-size: 1.875rem;
                      font-weight: 700;
                      line-height: 1.3;
                      margin: 0 0 1.5rem 0;
                      color: var(--foreground);
                      padding: 0;
                    }

                    .legal-modal-content h2 {
                      font-size: 1.25rem;
                      font-weight: 600;
                      line-height: 1.4;
                      margin: 2rem 0 1rem 0;
                      color: var(--foreground);
                      padding: 0;
                    }

                    .legal-modal-content h3 {
                      font-size: 1.125rem;
                      font-weight: 600;
                      line-height: 1.4;
                      margin: 1.5rem 0 0.75rem 0;
                      color: var(--foreground);
                      padding: 0;
                    }

                    .legal-modal-content h4,
                    .legal-modal-content h5,
                    .legal-modal-content h6 {
                      font-weight: 600;
                      line-height: 1.4;
                      margin: 1rem 0 0.5rem 0;
                      color: var(--foreground);
                      padding: 0;
                    }

                    /* Body text */
                    .legal-modal-content p {
                      font-size: 0.95rem;
                      line-height: 1.65;
                      margin: 0 0 1rem 0;
                      color: var(--foreground);
                      padding: 0;
                      text-align: left;
                    }

                    /* Lists */
                    .legal-modal-content ul,
                    .legal-modal-content ol {
                      margin: 1rem 0 1rem 1.5rem;
                      padding: 0;
                      color: var(--foreground);
                    }

                    .legal-modal-content li {
                      margin: 0.5rem 0;
                      line-height: 1.65;
                      color: var(--foreground);
                      padding: 0;
                    }

                    /* Icons - IMPORTANT: Display all icon SVGs */
                    .legal-modal-content svg {
                      display: inline-block !important;
                      vertical-align: middle;
                      color: inherit;
                    }

                    .legal-modal-content svg.w-5,
                    .legal-modal-content svg.h-5 {
                      width: 1.25rem;
                      height: 1.25rem;
                    }

                    .legal-modal-content svg.w-4,
                    .legal-modal-content svg.h-4 {
                      width: 1rem;
                      height: 1rem;
                    }

                    .legal-modal-content svg.w-6,
                    .legal-modal-content svg.h-6 {
                      width: 1.5rem;
                      height: 1.5rem;
                    }

                    /* Blockquotes */
                    .legal-modal-content blockquote {
                      border-left: 3px solid hsl(var(--primary));
                      padding: 1rem;
                      padding-left: 1rem;
                      margin: 1.5rem 0;
                      background: hsl(var(--muted));
                      border-radius: 0.25rem;
                      color: var(--muted-foreground);
                      font-style: italic;
                    }

                    /* Links - Only target links within prose/text blocks to avoid affecting buttons */
                    .legal-modal-content p a,
                    .legal-modal-content li a,
                    .legal-modal-content .prose a {
                      color: hsl(var(--primary));
                      text-decoration: underline;
                      cursor: pointer;
                      transition: all 0.2s ease;
                    }

                    .legal-modal-content p a:hover,
                    .legal-modal-content li a:hover,
                    .legal-modal-content .prose a:hover {
                      opacity: 0.8;
                    }

                    .legal-modal-content p a:active,
                    .legal-modal-content li a:active,
                    .legal-modal-content .prose a:active {
                      opacity: 0.6;
                    }

                    /* Ensure all links styled as buttons never have underlines */
                    .legal-modal-content a {
                      text-decoration: none;
                    }

                    /* Hide sidebars and TOC */
                    .legal-modal-content [class*="sidebar"],
                    .legal-modal-content [class*="toc"],
                    .legal-modal-content [class*="contents"],
                    .legal-modal-content [class*="search"],
                    .legal-modal-content aside {
                      display: none !important;
                    }

                    /* Tables */
                    .legal-modal-content table {
                      width: 100%;
                      border-collapse: collapse;
                      margin: 1.5rem 0;
                      font-size: 0.95rem;
                    }

                    .legal-modal-content th,
                    .legal-modal-content td {
                      border: 1px solid hsl(var(--border));
                      padding: 0.75rem;
                      text-align: left;
                      color: var(--foreground);
                    }

                    .legal-modal-content th {
                      background: hsl(var(--muted));
                      font-weight: 600;
                    }

                    /* Code blocks */
                    .legal-modal-content code,
                    .legal-modal-content pre {
                      background: hsl(var(--muted));
                      color: var(--foreground);
                      font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
                      font-size: 0.85rem;
                      border-radius: 0.25rem;
                    }

                    .legal-modal-content code {
                      padding: 0.25rem 0.5rem;
                    }

                    .legal-modal-content pre {
                      padding: 1rem;
                      overflow-x: auto;
                      margin: 1.5rem 0;
                      line-height: 1.5;
                    }

                    .legal-modal-content pre code {
                      padding: 0;
                      background: transparent;
                    }

                    /* Images */
                    .legal-modal-content img {
                      max-width: 100%;
                      height: auto;
                      display: block;
                      margin: 1.5rem 0;
                      border-radius: 0.5rem;
                      border: 1px solid hsl(var(--border));
                    }

                    /* HR */
                    .legal-modal-content hr {
                      border: none;
                      border-top: 1px solid hsl(var(--border));
                      margin: 2rem 0;
                    }

                    /* Small text */
                    .legal-modal-content small {
                      font-size: 0.85rem;
                      color: var(--muted-foreground);
                    }

                    /* Strong and em */
                    .legal-modal-content strong,
                    .legal-modal-content b {
                      font-weight: 600;
                      color: var(--foreground);
                    }

                    .legal-modal-content em,
                    .legal-modal-content i {
                      font-style: italic;
                    }

                    /* Scrollbar styling */
                    .legal-modal-scroll::-webkit-scrollbar {
                      width: 8px;
                    }

                    .legal-modal-scroll::-webkit-scrollbar-track {
                      background: transparent;
                    }

                    .legal-modal-scroll::-webkit-scrollbar-thumb {
                      background: hsl(var(--border));
                      border-radius: 4px;
                      transition: background 0.2s;
                    }

                    .legal-modal-scroll::-webkit-scrollbar-thumb:hover {
                      background: hsl(var(--muted-foreground));
                    }

                    .legal-modal-scroll {
                      scrollbar-color: hsl(var(--border)) transparent;
                      scrollbar-width: thin;
                    }

                    /* Flex containers for icon + text */
                    .legal-modal-content .flex {
                      display: flex;
                      align-items: center;
                      gap: 0.5rem;
                    }
                  `}</style>

                  <div className="legal-modal-content text-foreground">
                    <Suspense
                      fallback={
                        <div className="flex flex-col items-center justify-center py-16">
                          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent mb-4" />
                          <p className="text-sm text-muted-foreground">Loading document...</p>
                        </div>
                      }
                    >
                      {type === "privacy" && <PrivacyPolicy isModal={true} />}
                      {type === "terms" && <TermsAndConditions isModal={true} />}
                    </Suspense>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 px-6 py-3 border-t border-border/50 bg-muted/20">
                <button
                  onClick={onClose}
                  className={cn(
                    "px-5 py-2 rounded-lg font-medium text-sm transition-all",
                    "bg-primary text-primary-foreground hover:bg-primary/90",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  )}
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
