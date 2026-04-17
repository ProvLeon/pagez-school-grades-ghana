import { FileText, GraduationCap, Users, ClipboardList, UserCog, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const features = [
  {
    title: "Results & Report Sheets",
    description: "Generate professional, BECE-compliant report sheets for individual students or entire classes in seconds. Designed meticulously for Ghana Education Service standards.",
    highlight: true,
    large: true,
    gridClass: "md:col-span-2 lg:col-span-2 lg:row-span-2",
    image: "/images/report.png",
    imageClass: "absolute -bottom-8 -right-8 w-[85%] h-auto max-h-[80%] rounded-tl-3xl shadow-2xl ring-1 ring-black/10 object-cover object-left-top transition-transform duration-700 group-hover:-translate-y-2 group-hover:-translate-x-2",
    overlayClass: "absolute inset-0 pointer-events-none bg-gradient-to-br from-[#1E3A8B] via-[#2563EB]/95 via-[#2563EB]/90 to-transparent",
    textPosition: "top"
  },
  {
    title: "BECE-Standard Grading",
    description: "Automated grading mathematically aligned to Ghana Education Service standards. SBA, exam scores, aggregates, and positions computed instantly.",
    highlight: false,
    large: false,
    gridClass: "md:col-span-2 lg:col-span-2 lg:row-span-1",
    image: "/images/bece-settings.png",
    imageClass: "absolute top-8 -right-12 w-3/5 h-auto rounded-l-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] ring-1 ring-white object-cover object-left transition-transform duration-700 group-hover:translate-x-[-12px]",
    textPosition: "left"
  },
  {
    title: "Student Lifecycle",
    description: "Manage enrolments, track promotions, and handle transcripts effortlessly.",
    highlight: false,
    large: false,
    gridClass: "md:col-span-1 lg:col-span-1 lg:row-span-1",
    image: "/images/bulk transfer.png",
    imageClass: "absolute -bottom-10 -right-10 w-[95%] h-auto rounded-tl-2xl shadow-xl border-t border-l border-white/50 transition-transform duration-700 group-hover:-translate-y-2",
    textPosition: "top"
  },
  {
    title: "Teacher Portals",
    description: "Role-based access for teachers to securely enter subject scores.",
    highlight: false,
    large: false,
    gridClass: "md:col-span-1 lg:col-span-1 lg:row-span-1",
    image: "/images/Screenshot 2026-04-16 at 07.24.00.png",
    imageClass: "absolute -bottom-8 -right-8 w-[95%] h-auto rounded-tl-2xl shadow-xl transition-transform duration-700 group-hover:-translate-y-2",
    textPosition: "top"
  },
  {
    title: "Mock Exam Management",
    description: "Deploy and publish custom mock exam results with subject comparisons and deeply analytical performance insights.",
    highlight: false,
    large: false,
    gridClass: "md:col-span-1 lg:col-span-2 lg:row-span-1",
    image: "/images/Screenshot 2026-04-16 at 07.26.48.png",
    imageClass: "absolute top-8 -right-10 w-3/5 h-auto rounded-l-2xl shadow-2xl transition-transform duration-700 group-hover:-translate-x-2",
    textPosition: "left"
  },
  {
    title: "Analytics & Insights",
    description: "Visualise class performance trends to make truly informed, data-driven decisions.",
    highlight: false,
    large: false,
    gridClass: "md:col-span-1 lg:col-span-2 lg:row-span-1",
    image: "/images/analytics.png",
    imageClass: "absolute top-8 -right-10 w-3/5 h-[120%] rounded-l-xl shadow-xl object-cover object-left-bottom transition-transform duration-700 group-hover:-translate-x-2",
    textPosition: "left"
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 md:py-32 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-50px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border border-blue-200 bg-blue-50 text-blue-700 mb-4"
          >
            Capabilities
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight"
          >
            Engineered for Effortless
            <br className="hidden sm:block" />
            School Administration
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            className="mt-5 text-base md:text-lg text-gray-500 max-w-2xl mx-auto"
          >
            Everything your school needs to manage results, navigate data, and automate reporting — forged into a single, cohesive premium platform.
          </motion.p>
        </div>

        {/* Bento Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, margin: "-50px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1 },
            },
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-[minmax(300px,_auto)]"
        >
          {features.map(({ title, description, highlight, large, gridClass, image, imageClass, overlayClass, textPosition }) => (
            <motion.div
              key={title}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] } },
              }}
              className={gridClass}
            >
              <div
                className={cn(
                  "group relative h-full w-full rounded-[30px] overflow-hidden transition-all duration-500",
                  highlight
                    ? "bg-gradient-to-br from-primary to-[#1E3A8A] text-white shadow-2xl shadow-blue-900/20"
                    : "bg-white text-gray-900 border border-gray-200/50 shadow-lg shadow-gray-200/30 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1"
                )}
              >
                {/* Floating Image Asset */}
                {image && (
                  <>
                    <img src={image} alt={title} className={imageClass} />
                    {/* Per-card custom overlay OR shared default gradient mask */}
                    {overlayClass ? (
                      <div className={overlayClass} />
                    ) : (
                      <div className={cn(
                        "absolute inset-0 pointer-events-none transition-opacity duration-500",
                        highlight
                          ? "bg-gradient-to-t from-transparent via-primary to-primary opacity-50"
                          : "bg-gradient-to-t from-white/90 via-white/50 to-transparent lg:bg-gradient-to-r lg:from-white lg:via-white/90 lg:to-transparent"
                      )} />
                    )}
                  </>
                )}

                {/* Inner Content Block */}
                <div className={cn(
                  "relative z-10 flex flex-col h-full gap-4 p-8 md:p-10 pointer-events-none",
                  textPosition === "left" && !highlight ? "w-full md:w-3/5 lg:w-1/2 justify-center" : "justify-start"
                )}>

                  {/* Subtle Text Tagging */}
                  {highlight && large && (
                    <div className="mb-2">
                      <span className="inline-block py-1 px-3 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-white uppercase tracking-widest border border-white/20">
                        Flagship Engine
                      </span>
                    </div>
                  )}

                  <div className={cn("space-y-4", textPosition === "top" && !large && "max-w-[70%]")}>
                    <h3
                      className={cn(
                        "font-extrabold tracking-tight leading-tight",
                        highlight ? "text-white drop-shadow-md" : "text-gray-900",
                        large ? "text-3xl md:text-4xl pr-8" : "text-xl md:text-2xl"
                      )}
                    >
                      {title}
                    </h3>
                    <p
                      className={cn(
                        "leading-relaxed font-medium",
                        highlight ? "text-white/90 drop-shadow-sm font-semibold" : "text-gray-600",
                        large ? "text-lg max-w-md pr-6" : "text-sm md:text-base",
                        !highlight && textPosition === "top" && "bg-white/80 backdrop-blur-md px-1 py-0.5 rounded shadow-sm inline-block"
                      )}
                    >
                      {description}
                    </p>
                  </div>
                </div>

              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
