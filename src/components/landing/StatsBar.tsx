const stats = [
  { imgUrl: "/logos Statsbar/WAEC-Logo2.png", label: "WAEC-BECE Standard Grading" },
  { imgUrl: "/logos Statsbar/PDF_file_icon.png", label: "Instant PDF Reports" },
  { imgUrl: "/logos Statsbar/day-free-trial-rubber-stamp-days.png", label: "14-Day Free Trial" },
  { imgUrl: "/logos Statsbar/Cloudflare.png", label: "Secure Cloud Storage" },
];

const StatsBar = () => {
  return (
    <section className="border-y border-gray-200 bg-gray-50/80 backdrop-blur-sm shadow-[inset_0_1px_rgba(255,255,255,0.6)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-stretch divide-y sm:divide-y-0 sm:divide-x divide-gray-200/50">
          {stats.map(({ imgUrl, label }) => (
            <div
              key={label}
              className="flex items-center justify-center gap-4 py-4 md:py-6 px-6 flex-1 group cursor-default"
            >
              <div className={`${label === "WAEC-BECE Standard Grading" ? "w-16 h-16" : "w-12 h-12"} flex items-center justify-center flex-shrink-0`}>
                <img
                  src={imgUrl}
                  alt={label}
                  className="w-full h-full object-contain filter grayscale sepia brightness-90 hue-rotate-[#1a56db] opacity-70 transition-all duration-500 ease-out 
                  group-hover:grayscale-0 group-hover:sepia-0 group-hover:brightness-100 group-hover:hue-rotate-0 group-hover:saturate-110 group-hover:opacity-100"
                  style={{
                    // Fallback explicit filter chain for the precise blue tint
                    filter: "grayscale(100%) sepia(100%) hue-rotate(185deg) saturate(350%) brightness(0.8) contrast(1.1)",
                  }}
                  // Using an inline script to remove the static style on hover via Tailwind
                  onMouseEnter={(e) => (e.currentTarget.style.filter = "none")}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.filter = "grayscale(100%) sepia(100%) hue-rotate(185deg) saturate(350%) brightness(0.8) contrast(1.1)")
                  }
                />
              </div>
              <span className="text-sm font-bold text-gray-600 transition-colors duration-300 group-hover:text-blue-700 whitespace-nowrap tracking-tight">
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
