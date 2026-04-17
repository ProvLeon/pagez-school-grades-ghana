import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const features = [
  "All core modules included",
  "Unlimited teachers & staff accounts",
  "BECE-standard grading engine",
  "Automated PDF report sheets",
  "Mock exam management",
  "Bulk student upload via CSV/Excel",
  "Results analytics dashboard",
  "Online result verification portal",
  "Bank-level data security",
  "Priority support",
];

const PricingSection = () => {
  const navigate = useNavigate();

  return (
    <section id="pricing" className="py-20 md:py-28 bg-gray-50/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center mb-14">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-50px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border border-blue-200 bg-blue-50 text-blue-700 mb-4"
          >
            Pricing
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight"
          >
            Simple, Transparent Pricing
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            className="mt-4 text-base text-gray-500 max-w-xl mx-auto leading-relaxed"
          >
            One plan. One price. Full access. Pay only for the students you
            register — billed annually.
          </motion.p>
        </div>

        {/* Single Pricing Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: false, margin: "-50px" }}
          transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="relative max-w-xl mx-auto"
        >
          {/* Glow ring */}
          <div className="absolute -inset-1 bg-gradient-to-b from-blue-500/20 via-blue-500/5 to-transparent rounded-[32px] blur-sm pointer-events-none" />

          <div className="relative bg-white border-2 border-[#2563EB] rounded-3xl p-8 md:p-12 shadow-2xl shadow-blue-500/10 text-center overflow-hidden transition-all duration-300 hover:shadow-blue-500/25">
            {/* Ambient glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/40 rounded-full blur-[80px] pointer-events-none" />

            <div className="relative z-10">
              {/* Badge */}
              <span className="inline-block py-1.5 px-5 rounded-full bg-blue-50 text-[#2563EB] font-bold text-xs tracking-wide uppercase mb-8 border border-blue-100">
                Annual Plan
              </span>

              {/* Price */}
              <div className="flex items-end justify-center gap-1 mb-2">
                <span className="text-xl md:text-2xl font-bold text-gray-400 self-start mt-3">
                  GHS
                </span>
                <span className="text-7xl md:text-8xl font-black text-gray-900 leading-none tracking-tighter">
                  2
                </span>
                <span className="text-3xl md:text-4xl font-extrabold text-gray-400 self-end mb-2">
                  .00
                </span>
              </div>
              <p className="text-base text-gray-500 font-semibold mb-10">
                per student, billed annually
              </p>

              {/* Feature list */}
              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false }}
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.05, delayChildren: 0.3 },
                  },
                }}
                className="grid sm:grid-cols-2 gap-y-3.5 gap-x-8 max-w-md mx-auto mb-10 text-left"
              >
                {features.map((f) => (
                  <motion.div 
                    key={f} 
                    variants={{
                      hidden: { opacity: 0, x: -10 },
                      visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
                    }}
                    className="flex items-center gap-2.5"
                  >
                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 transition-transform duration-300 hover:scale-110 hover:bg-blue-200">
                      <Check className="w-3 h-3 text-[#2563EB]" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {f}
                    </span>
                  </motion.div>
                ))}
              </motion.div>

              {/* CTA */}
              <button
                onClick={() => navigate("/signup")}
                className="w-full sm:w-auto min-w-[300px] bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-bold py-4 px-10 rounded-xl text-base shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-200"
              >
                Start your 14-day Free Trial
              </button>

              <p className="mt-5 text-xs text-gray-400">
                Test the full platform with up to 10 students. No credit card
                required.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Footer notes */}
        <div className="mt-10 text-center space-y-3">
          <p className="text-sm text-gray-500 max-w-2xl mx-auto">
            Payable annually via{" "}
            <span className="font-medium text-gray-700">MTN MoMo</span>,{" "}
            <span className="font-medium text-gray-700">AirtelTigo</span>,{" "}
            <span className="font-medium text-gray-700">Telecel Cash</span>, or
            bank card.
          </p>
          <p className="text-sm text-gray-500">
            Need a custom arrangement?{" "}
            <a
              href="mailto:support@eresultsgh.com"
              className="text-[#2563EB] font-semibold hover:underline"
            >
              Contact us for Enterprise pricing.
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
