import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface PricingPlan {
  name: string;
  badge?: string;
  students: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  popular: boolean;
}

const plans: PricingPlan[] = [
  {
    name: "Starter",
    students: "1–250 students",
    price: "GHS 2.50",
    period: "/student/year",
    description: "Perfect for smaller schools getting started with digital results management.",
    features: [
      "All core modules included",
      "Up to 250 student registrations",
      "PDF Report Sheets",
      "BECE-standard grading",
      "Mock exam management",
      "Email support",
    ],
    popular: false,
  },
  {
    name: "Standard",
    badge: "Most Popular",
    students: "251–600 students",
    price: "GHS 2.00",
    period: "/student/year",
    description: "The go-to plan for growing schools that need more capacity and advanced tools.",
    features: [
      "Everything in Starter",
      "Up to 600 student registrations",
      "Bulk student upload via Excel",
      "Results analytics dashboard",
      "Class performance comparisons",
      "Priority support",
    ],
    popular: true,
  },
  {
    name: "Growth",
    students: "601–1,200 students",
    price: "GHS 1.75",
    period: "/student/year",
    description: "Built for large schools that need full-scale management and teacher access.",
    features: [
      "Everything in Standard",
      "Up to 1,200 student registrations",
      "Teacher portal access",
      "Advanced report configuration",
      "Multi-class subject management",
      "Dedicated onboarding support",
    ],
    popular: false,
  },
];

const PricingSection = () => {
  const navigate = useNavigate();

  return (
    <section id="pricing" className="py-20 md:py-28 bg-gray-50/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border border-blue-200 bg-blue-50 text-blue-700 mb-4">
            Pricing
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-4 text-base text-gray-500 max-w-xl mx-auto leading-relaxed">
            Pay annually per enrolled student. The more students, the lower the
            per-student rate. Every plan includes your 30-day free trial.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {plans.map(({ name, badge, students, price, period, description, features, popular }) => (
            <div
              key={name}
              className={cn(
                "relative rounded-2xl p-8 flex flex-col bg-white transition-all duration-200",
                popular
                  ? "border-2 border-[#2563EB] shadow-2xl shadow-blue-500/15 ring-1 ring-[#2563EB]/10"
                  : "border border-gray-200 hover:shadow-lg hover:border-gray-300"
              )}
            >
              {/* Most Popular Badge */}
              {popular && badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <span className="inline-flex items-center bg-[#2563EB] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-blue-500/30 tracking-wide">
                    {badge}
                  </span>
                </div>
              )}

              {/* Plan name & student range */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xl font-extrabold text-gray-900">{name}</h3>
                  {popular && (
                    <span className="text-[10px] font-bold bg-blue-50 text-[#2563EB] px-2 py-0.5 rounded-full border border-blue-100">
                      ⭐ Best Value
                    </span>
                  )}
                </div>
                <p className="text-xs font-medium text-gray-400">{students}</p>
              </div>

              {/* Price */}
              <div className="mb-5 pb-5 border-b border-gray-100">
                <div className="flex items-end gap-1.5">
                  <span className="text-4xl font-extrabold text-gray-900 leading-none">
                    {price}
                  </span>
                  <span className="text-sm text-gray-400 mb-1 leading-tight">{period}</span>
                </div>
                <p className="mt-3 text-xs text-gray-500 leading-relaxed">{description}</p>
              </div>

              {/* Feature List */}
              <ul className="space-y-3 flex-1 mb-8">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <div
                      className={cn(
                        "w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                        popular ? "bg-blue-100" : "bg-gray-100"
                      )}
                    >
                      <Check
                        className={cn(
                          "w-2.5 h-2.5",
                          popular ? "text-[#2563EB]" : "text-gray-500"
                        )}
                      />
                    </div>
                    <span className="text-sm text-gray-600 leading-relaxed">{f}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                onClick={() => navigate("/signup")}
                className={cn(
                  "w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-200",
                  popular
                    ? "bg-[#2563EB] hover:bg-[#1d4ed8] text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
                    : "border border-gray-300 text-gray-700 hover:border-[#2563EB] hover:text-[#2563EB] hover:bg-blue-50/50"
                )}
              >
                Start Free Trial
              </button>
            </div>
          ))}
        </div>

        {/* Footer notes */}
        <div className="mt-10 text-center space-y-3">
          <p className="text-sm text-gray-500 max-w-2xl mx-auto">
            All plans include a 30-day free trial. No payment required to start.
            Payable annually via{" "}
            <span className="font-medium text-gray-700">MTN MoMo</span>,{" "}
            <span className="font-medium text-gray-700">AirtelTigo</span>,{" "}
            <span className="font-medium text-gray-700">Telecel Cash</span>, or bank card.
          </p>
          <p className="text-sm text-gray-500">
            Need more than 1,200 students?{" "}
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
