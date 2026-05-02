import { useNavigate } from "react-router-dom";
import BrowserMockup from "./BrowserMockup";
import { motion } from "framer-motion";

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-[#0f172a] py-20 md:py-28 relative overflow-hidden">
      {/* Subtle background glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 left-1/4 w-96 h-96 bg-blue-700/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 right-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Pill badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-50px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex justify-center mb-6"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border border-blue-500/30 bg-blue-500/10 text-blue-400">
            Get Started Today
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight max-w-3xl mx-auto"
        >
          Ready to Streamline Your School's
          <br className="hidden sm:block" />
          Results Management?
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          className="mt-5 text-base md:text-lg text-slate-400 max-w-xl mx-auto leading-relaxed"
        >
          Join schools across Ghana managing their results the smart way. Your
          14-day free trial is waiting — no setup fees, no complexity.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={() => navigate("/signup")}
            className="inline-flex items-center justify-center bg-white hover:bg-gray-100 text-[#0f172a] font-bold px-8 py-4 rounded-xl text-base shadow-2xl shadow-black/30 hover:shadow-white/10 hover:-translate-y-0.5 transition-all duration-200 w-full sm:w-auto"
          >
            Start Free Trial
          </button>
          <button
            onClick={() => navigate("/login")}
            className="inline-flex items-center justify-center border border-slate-600 hover:border-slate-400 hover:bg-white/5 text-slate-300 hover:text-white font-semibold px-8 py-4 rounded-xl text-base transition-all duration-200 w-full sm:w-auto"
          >
            Login to Dashboard
          </button>
        </motion.div>

        {/* Fine print */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-4 text-sm text-slate-500"
        >
          No payment required. No credit card needed. Cancel anytime.
        </motion.p>

        {/* Trust indicators */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1, delayChildren: 0.4 },
            },
          }}
          className="mt-8 flex flex-wrap items-center justify-center gap-6"
        >
          {[
            "14-Day Free Trial",
            "BECE-Standard Grading",
            "Secure Cloud Storage",
            "MTN MoMo Payments",
          ].map((item) => (
            <motion.div
              key={item}
              variants={{
                hidden: { opacity: 0, scale: 0.9 },
                visible: { opacity: 1, scale: 1 },
              }}
              className="flex items-center gap-2"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
              <span className="text-xs text-slate-400 font-medium">{item}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Browser Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98], delay: 0.2 }}
          className="mt-16 md:mt-20"
        >
          <BrowserMockup dark />
        </motion.div >
      </div>
    </section >
  );
};

export default CTASection;
