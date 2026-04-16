import { useNavigate } from "react-router-dom";
import BrowserMockup from "./BrowserMockup";

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
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border border-blue-500/30 bg-blue-500/10 text-blue-400">
            Get Started Today
          </div>
        </div>

        {/* Headline */}
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight max-w-3xl mx-auto">
          Ready to Streamline Your School's
          <br className="hidden sm:block" />
          Results Management?
        </h2>

        {/* Subtitle */}
        <p className="mt-5 text-base md:text-lg text-slate-400 max-w-xl mx-auto leading-relaxed">
          Join schools across Ghana managing their results the smart way. Your
          14-day free trial is waiting — no setup fees, no complexity.
        </p>

        {/* CTA Button */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate("/signup")}
            className="inline-flex items-center justify-center bg-white hover:bg-gray-100 text-[#0f172a] font-bold px-8 py-4 rounded-xl text-base shadow-2xl shadow-black/30 hover:shadow-black/40 transition-all duration-200 w-full sm:w-auto"
          >
            Start Free Trial
          </button>
          <button
            onClick={() => navigate("/login")}
            className="inline-flex items-center justify-center border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white font-semibold px-8 py-4 rounded-xl text-base transition-all duration-200 w-full sm:w-auto"
          >
            Login to Dashboard
          </button>
        </div>

        {/* Fine print */}
        <p className="mt-4 text-sm text-slate-500">
          No payment required. No credit card needed. Cancel anytime.
        </p>

        {/* Trust indicators */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
          {[
            "14-Day Free Trial",
            "BECE-Standard Grading",
            "Secure Cloud Storage",
            "MTN MoMo Payments",
          ].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span className="text-xs text-slate-500 font-medium">{item}</span>
            </div>
          ))}
        </div>

        {/* Browser Mockup */}
        <div className="mt-16 md:mt-20">
          <BrowserMockup dark />
        </div>
      </div>
    </section>
  );
};

export default CTASection;
