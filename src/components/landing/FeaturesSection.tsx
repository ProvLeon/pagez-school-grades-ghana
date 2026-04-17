import { FileText, GraduationCap, Users, ClipboardList, UserCog, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: FileText,
    title: "Results & Report Sheets",
    description:
      "Generate professional, BECE-compliant report sheets for individual students or entire classes in seconds — ready for print or PDF download.",
    highlight: true,
  },
  {
    icon: GraduationCap,
    title: "BECE-Standard Grading",
    description:
      "Automated grading aligned to Ghana Education Service standards — SBA, exam scores, aggregates, and class position computed instantly.",
    highlight: false,
  },
  {
    icon: Users,
    title: "Student Management",
    description:
      "Manage registrations, track promotions, transfers, and the full student lifecycle with complete data integrity and no manual errors.",
    highlight: false,
  },
  {
    icon: ClipboardList,
    title: "Mock Exam Management",
    description:
      "Set up, administer, and publish mock exam results with class-level analytics, subject comparisons, and performance insights.",
    highlight: false,
  },
  {
    icon: UserCog,
    title: "Teacher Portals",
    description:
      "Role-based access for teachers to enter and review subject scores for their assigned classes — without touching other school data.",
    highlight: false,
  },
  {
    icon: BarChart3,
    title: "Analytics & Insights",
    description:
      "Visualise class performance trends, subject pass rates, and school-wide result summaries to make informed academic decisions.",
    highlight: false,
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-14">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-50px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border border-blue-200 bg-blue-50 text-blue-700 mb-4"
          >
            Features
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight"
          >
            Powerful Features for Effortless
            <br className="hidden sm:block" />
            School Administration
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            className="mt-4 text-base text-gray-500 max-w-xl mx-auto"
          >
            Everything your school needs to manage results, students, and reporting — in one cohesive platform built for Ghana.
          </motion.p>
        </div>

        {/* Feature Cards Grid */}
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
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map(({ icon: Icon, title, description, highlight }) => (
            <motion.div
              key={title}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
              }}
            >
              <div
                className={cn(
                  "h-full rounded-2xl p-8 flex flex-col gap-5 transition-all duration-300",
                  highlight
                    ? "bg-[#2563EB] text-white shadow-2xl shadow-blue-500/25 scale-[1.01]"
                    : "bg-gray-50 text-gray-900 border border-gray-100 hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-100 hover:-translate-y-1"
                )}
              >
                {/* Icon Container */}
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110",
                    highlight ? "bg-white/20" : "bg-blue-100"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-6 h-6",
                      highlight ? "text-white" : "text-[#2563EB]"
                    )}
                  />
                </div>

                {/* Text */}
                <div className="space-y-2">
                  <h3
                    className={cn(
                      "text-lg font-bold leading-snug",
                      highlight ? "text-white" : "text-gray-900"
                    )}
                  >
                    {title}
                  </h3>
                  <p
                    className={cn(
                      "text-sm leading-relaxed",
                      highlight ? "text-blue-100" : "text-gray-500"
                    )}
                  >
                    {description}
                  </p>
                </div>

                {/* Bottom accent line for highlighted card */}
                {highlight && (
                  <div className="mt-auto pt-4 border-t border-white/20">
                    <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider">
                      Core Module
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
