import { FileText, GraduationCap, Users, ClipboardList, UserCog, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: FileText,
    title: "Results & Report Sheets",
    description:
      "Generate professional, BECE-compliant report sheets for individual students or entire classes in seconds. Designed meticulously for Ghana Education Service standards, ready for instant print or secure PDF download.",
    highlight: true,
    large: true,
    gridClass: "md:col-span-2 lg:col-span-2 lg:row-span-2",
  },
  {
    icon: GraduationCap,
    title: "BECE-Standard Grading",
    description:
      "Automated grading mathematically aligned to Ghana Education Service standards. SBA, exam scores, aggregates, and overall class positions are computed instantly with absolute accuracy.",
    highlight: false,
    large: false,
    gridClass: "md:col-span-2 lg:col-span-2 lg:row-span-1",
  },
  {
    icon: Users,
    title: "Student Management",
    description:
      "Manage enrolments, track promotions, and handle transcripts effortlessly.",
    highlight: false,
    large: false,
    gridClass: "md:col-span-1 lg:col-span-1 lg:row-span-1",
  },
  {
    icon: UserCog,
    title: "Teacher Portals",
    description:
      "Role-based access for teachers to securely enter subject scores.",
    highlight: false,
    large: false,
    gridClass: "md:col-span-1 lg:col-span-1 lg:row-span-1",
  },
  {
    icon: ClipboardList,
    title: "Mock Exam Management",
    description:
      "Deploy and publish custom mock exam results with subject comparisons and deeply analytical performance insights.",
    highlight: false,
    large: false,
    gridClass: "md:col-span-1 lg:col-span-2 lg:row-span-1",
  },
  {
    icon: BarChart3,
    title: "Analytics & Insights",
    description:
      "Visualise class performance trends and school-wide aggregates to make truly informed, data-driven academic decisions.",
    highlight: false,
    large: false,
    gridClass: "md:col-span-1 lg:col-span-2 lg:row-span-1",
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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-fr"
        >
          {features.map(({ icon: Icon, title, description, highlight, large, gridClass }) => (
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
                  "group relative h-full w-full rounded-3xl p-8 md:p-10 flex flex-col justify-between overflow-hidden transition-all duration-500",
                  highlight
                    ? "bg-gradient-to-br from-[#2563EB] to-indigo-700 text-white shadow-2xl shadow-blue-900/20"
                    : "bg-white text-gray-900 border border-gray-200/60 shadow-lg shadow-gray-200/20 hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1"
                )}
              >
                {/* Optional ambient inner glow for highlights */}
                {highlight && (
                  <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3" />
                )}

                <div className="relative z-10 flex flex-col h-full gap-6">
                  {/* Icon Container */}
                  <div
                    className={cn(
                      "rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-500 group-hover:scale-110",
                      highlight ? "bg-white/20 backdrop-blur-md shadow-inner" : "bg-blue-50 border border-blue-100/50",
                      large ? "w-16 h-16 md:w-20 md:h-20" : "w-12 h-12"
                    )}
                  >
                    <Icon
                      className={cn(
                        highlight ? "text-white" : "text-[#2563EB]",
                        large ? "w-8 h-8 md:w-10 md:h-10" : "w-6 h-6"
                      )}
                    />
                  </div>

                  {/* Text Container */}
                  <div className={cn("space-y-3 mt-auto", large && "space-y-4 pt-12")}>
                    <h3
                      className={cn(
                        "font-black tracking-tight",
                        highlight ? "text-white" : "text-gray-900",
                        large ? "text-2xl md:text-4xl" : "text-lg md:text-xl"
                      )}
                    >
                      {title}
                    </h3>
                    <p
                      className={cn(
                        "leading-relaxed font-medium",
                        highlight ? "text-blue-100" : "text-gray-500",
                        large ? "text-base md:text-xl max-w-md" : "text-sm md:text-base"
                      )}
                    >
                      {description}
                    </p>
                  </div>
                </div>

                {/* Accent line for highlighted card */}
                {highlight && large && (
                  <div className="relative z-10 mt-8 pt-6 border-t border-blue-400/30">
                    <span className="text-xs font-bold text-blue-200 uppercase tracking-widest">
                      Flagship Engine
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
