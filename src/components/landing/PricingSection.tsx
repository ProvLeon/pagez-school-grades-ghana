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
          className="relative max-w-xl mx-auto group"
        >
          {/* Ambient Glow behind the card */}
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/0 via-blue-500/20 to-blue-500/0 rounded-[3rem] blur-2xl pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-700" />

          {/* Fading Border Container */}
          <div className="relative p-[1.5px] rounded-[32px] bg-gradient-to-r from-transparent via-blue-500/70 to-transparent shadow-2xl shadow-blue-500/10 text-center transition-all duration-500 group-hover:shadow-blue-500/30">

            {/* Inner Glassmorphic Surface */}
            <div className="relative bg-white/90 backdrop-blur-2xl rounded-[30px] p-8 md:p-12 overflow-hidden border-y border-white flex flex-col items-center">
              {/* Internal ambient glow */}
              <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-50/50 rounded-full blur-[80px] pointer-events-none" />
              <div className="absolute -bottom-32 -left-40 w-96 h-96 bg-purple-50/50 rounded-full blur-[80px] pointer-events-none" />

              <div className="relative z-10 w-full">
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
          </div>
        </motion.div>

        {/* Trust & Payment Logos */}
        <div className="mt-16 sm:mt-20 flex flex-col items-center">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] text-center mb-6">
            Secure Localised Payments Supported
          </p>

          {/* Glassmorphic Pill Container */}
          <div className="inline-flex flex-wrap items-center justify-center gap-6 md:gap-10 bg-white border border-gray-100 rounded-2xl px-8 py-5 shadow-sm shadow-blue-900/5">

            {/* MTN MoMo */}
            <div className="group relative cursor-pointer flex items-center justify-center">
              <img
                src="/images/payment/momo_mtnb.png"
                alt="MTN Mobile Money"
                className="h-7 md:h-9 object-contain filter grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
              />
            </div>

            <div className="w-[1px] h-6 bg-gray-100 hidden sm:block" />

            {/* Telecel */}
            <div className="group relative cursor-pointer flex items-center justify-center">
              <img
                src="/images/payment/telecel-cash.webp"
                alt="Telecel Cash"
                className="h-7 md:h-9 object-contain filter grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
              />
            </div>

            <div className="w-[1px] h-6 bg-gray-100 hidden sm:block" />

            {/* Card Payments */}
            <div className="group relative cursor-pointer flex items-center justify-center">
              <img
                src="/images/payment/ATM-Logo-01.png"
                alt="Card Payments"
                className="h-6 md:h-8 object-contain filter grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
              />
            </div>

          </div>
        </div>

        {/* Footer notes */}
        <div className="mt-12 text-center border-t border-gray-200/60 pt-8">
          <p className="text-sm text-gray-500">
            Need a custom arrangement for multiple schools or districts?{" "}
            <a
              href="mailto:support@eresultsgh.com"
              className="text-[#2563EB] font-bold hover:underline transition-colors"
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
