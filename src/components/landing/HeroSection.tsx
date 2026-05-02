import { useNavigate } from "react-router-dom";
import { GraduationCap, ArrowRight, BookOpen, Users, FileText, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import BrowserMockup from "./BrowserMockup";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section
      id="home"
      className="relative pt-28 pb-20 md:pt-36 md:pb-28 bg-gradient-to-b from-blue-50/70 via-white/80 to-white overflow-hidden"
    >
      {/* Background decorative blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-16 -left-16 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl" />
        <div className="absolute top-32 -right-24 w-80 h-80 bg-purple-100/40 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-blue-50/60 rounded-full blur-2xl" />
      </div>

      <motion.div 
        initial="hidden" 
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
          }
        }}
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        {/* Pill Badge */}
        <motion.div 
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
          }}
          className="flex justify-center mb-7"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border border-blue-200 bg-blue-50 text-blue-700 shadow-sm">
            <GraduationCap className="w-4 h-4" />
            Purpose-Built for Ghanaian Schools
          </div>
        </motion.div>

        {/* Headline area with floating icons */}
        <div className="relative text-center">
          {/* Floating icon — top left */}
          <motion.div 
            animate={{ y: [0, -15, 0], rotate: [12, 16, 12] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-10 top-10 hidden lg:flex items-center justify-center w-11 h-11 bg-blue-100/90 rounded-xl opacity-75 shadow-sm"
          >
            <BookOpen className="w-5 h-5 text-blue-600" />
          </motion.div>

          {/* Floating icon — top right */}
          <motion.div 
            animate={{ y: [0, -10, 0], rotate: [-12, -8, -12] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute right-10 top-10 hidden lg:flex items-center justify-center w-11 h-11 bg-purple-100/90 rounded-xl opacity-75 shadow-sm"
          >
            <Users className="w-5 h-5 text-purple-600" />
          </motion.div>

          {/* Floating icon — mid left */}
          <motion.div 
            animate={{ y: [0, -12, 0], rotate: [12, 10, 12] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute left-52 top-60 hidden lg:flex items-center justify-center w-9 h-9 bg-emerald-100/90 rounded-lg opacity-65 shadow-sm"
          >
            <FileText className="w-4 h-4 text-emerald-600" />
          </motion.div>

          {/* Floating icon — mid right */}
          <motion.div 
            animate={{ y: [0, -8, 0], rotate: [-12, -15, -12] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            className="absolute right-60 top-52 hidden lg:flex items-center justify-center w-9 h-9 bg-orange-100/90 rounded-lg opacity-65 shadow-sm"
          >
            <BarChart3 className="w-4 h-4 text-orange-500" />
          </motion.div>

          {/* H1 */}
          <motion.h1 
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
            }}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-[1.12] tracking-tight relative z-10"
          >
            The Smarter Way to Manage
            <br />
            <span className="text-[#2563EB]">School Results in Ghana</span>
          </motion.h1>
        </div>

        {/* Subtitle */}
        <motion.p 
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
          }}
          className="mt-6 text-lg md:text-xl text-gray-500 max-w-2xl mx-auto text-center leading-relaxed relative z-10"
        >
          Purpose-built for Ghanaian schools — BECE-standard grading, instant
          report sheets, mock exam management, and more. All in one platform.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div 
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
          }}
          className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10"
        >
          <button
            onClick={() => navigate("/signup")}
            className="inline-flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-[#1d4ed8] text-white px-7 py-3.5 rounded-xl font-semibold text-base shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all duration-200 w-full sm:w-auto"
          >
            Start Free Trial
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate("/login")}
            className="inline-flex items-center justify-center gap-2 border border-gray-300 bg-white text-gray-700 hover:border-[#2563EB] hover:text-[#2563EB] hover:bg-blue-50/50 px-7 py-3.5 rounded-xl font-semibold text-base transition-all duration-200 w-full sm:w-auto"
          >
            Login to Dashboard
          </button>
        </motion.div>

        {/* Social proof hint */}
        <motion.p 
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { duration: 0.5, delay: 0.5 } }
          }}
          className="mt-4 text-xs text-gray-400 text-center"
        >
          14-day free trial · 10 student cap · No credit card required
        </motion.p>

        {/* Browser Mockup */}
        <motion.div 
          variants={{
            hidden: { opacity: 0, y: 40 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] } }
          }}
          className="mt-16 md:mt-20"
        >
          <BrowserMockup />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
