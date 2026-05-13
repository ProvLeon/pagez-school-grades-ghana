import { Check } from "lucide-react";
import { motion } from "framer-motion";

/* ─── Premium Image Composition ───────────────────────────────────────────── */
const PremiumImageMockup = ({ src, alt, align }: { src: string; alt: string; align: 'left' | 'right' }) => (
  <div className="relative w-full max-w-2xl mx-auto group pt-6">
    {/* Ambient Glow */}
    <div
      className={`absolute top-1/2 -translate-y-1/2 w-full h-[120%] bg-gradient-to-tr from-blue-600/30 blur-3xl opacity-30 rounded-full transition-all duration-700 ease-out group-hover:opacity-70 group-hover:scale-105
      ${align === 'left' ? '-left-10  to-green-500/30' : '-right-10 to-orange-500/30'}`}
    />

    {/* Cinematic Mask Container */}
    <div
      className="relative z-10 transition-transform duration-700 ease-out group-hover:-translate-y-4"
    >
      {/* Masked image surface */}
      <div
        style={{
          WebkitMaskImage: align === 'left'
            ? 'linear-gradient(to right, black 10%, transparent 100%)'
            : 'linear-gradient(to left, black 60%, transparent 100%)',
          maskImage: align === 'left'
            ? 'linear-gradient(to right, black 10%, transparent 100%)'
            : 'linear-gradient(to left, black 60%, transparent 100%)',
        }}
      >
        <div
          className={`relative overflow-hidden rounded-2xl bg-white shadow-[0_8px_40px_-8px_rgba(0,0,0,0.12)]
          ${align === 'left' ? 'pl-2 pt-2 border-l border-t border-gray-200/40' : 'pr-2 pt-2 border-r border-t border-gray-200/40'}`}
        >
          <img
            src={src}
            alt={alt}
            className="w-full h-auto md:max-h-[500px] object-cover object-left-top rounded-xl"
          />
        </div>
      </div>
    </div>
  </div>
);

/* ─── Feature Bullet ──────────────────────────────────────────────────────── */
const Bullet = ({ text }: { text: string }) => (
  <li className="flex items-start gap-3">
    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
      <Check className="w-3 h-3 text-[#2563EB]" />
    </div>
    <span className="text-sm text-gray-600 leading-relaxed">{text}</span>
  </li>
);

/* ─── Section ─────────────────────────────────────────────────────────────── */
const WhyChooseSection = () => {
  return (
    <section id="why-choose" className="py-20 md:py-28 bg-gray-50/60 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border border-blue-200 bg-blue-50 text-blue-700 mb-4"
          >
            Why Choose Us
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
            className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight"
          >
            Why Choose e-Results GH?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="mt-4 text-base text-gray-500 max-w-xl mx-auto"
          >
            Every feature is designed around the realities of Ghanaian school administration — no bloat, no guesswork.
          </motion.p>
        </div>

        {/* ── Feature A: Visual Left · Text Right ── */}
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20 mb-24">
          {/* Visual */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="flex-1 w-full flex justify-center px-4 sm:px-0"
          >
            <PremiumImageMockup src="/images/report.png" alt="Automated Report Sheet Generator" align="left" />
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98], delay: 0.1 }}
            className="flex-1 space-y-6"
          >
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border border-emerald-200 bg-emerald-50 text-emerald-700">
              Report Generation
            </div>
            <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-snug tracking-tight">
              Instant, Professional
              <br />
              Report Sheets
            </h3>
            <p className="text-gray-500 text-base leading-relaxed">
              Generate beautifully formatted, Ghana Education Service-aligned
              report sheets for every student, class, and term — in seconds,
              not hours. No manual calculations, no formatting errors.
            </p>
            <ul className="space-y-3.5">
              {[
                "BECE & SBA grading systems supported",
                "Automated remarks & grade computation",
                "One-click PDF download for all classes",
              ].map((f) => (
                <Bullet key={f} text={f} />
              ))}
            </ul>
          </motion.div>
        </div>

        {/* ── Feature B: Text Left · Visual Right ── */}
        <div className="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-20">
          {/* Visual */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="flex-1 w-full flex justify-center px-4 sm:px-0"
          >
            <PremiumImageMockup src="/images/bulk transfer.png" alt="Student Bulk Management Interface" align="right" />
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98], delay: 0.1 }}
            className="flex-1 space-y-6"
          >
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border border-orange-200 bg-orange-50 text-orange-700">
              Student Management
            </div>
            <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-snug tracking-tight">
              Complete Student
              <br />
              Lifecycle Management
            </h3>
            <p className="text-gray-500 text-base leading-relaxed">
              From first enrolment to graduation, manage every stage of a
              student's journey with complete data integrity — no spreadsheets,
              no duplicates, no manual errors.
            </p>
            <ul className="space-y-3.5">
              {[
                "Bulk upload via Excel template",
                "Track promotions, transfers & graduations",
                "Linked across classes, subjects, and results",
              ].map((f) => (
                <Bullet key={f} text={f} />
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseSection;
