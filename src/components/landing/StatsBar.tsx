import { Award, FileOutput, CalendarCheck, ShieldCheck } from "lucide-react";

const stats = [
  { icon: Award, label: "BECE-Standard Grading" },
  { icon: FileOutput, label: "Instant PDF Reports" },
  { icon: CalendarCheck, label: "30-Day Free Trial" },
  { icon: ShieldCheck, label: "Secure Cloud Storage" },
];

const StatsBar = () => {
  return (
    <section className="border-y border-gray-200 bg-gray-50/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-stretch divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
          {stats.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center justify-center gap-3 py-4 px-6 flex-1 group"
            >
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition-colors">
                <Icon className="w-4 h-4 text-[#2563EB]" />
              </div>
              <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsBar;
