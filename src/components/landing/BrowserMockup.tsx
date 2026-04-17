import { cn } from "@/lib/utils";

interface BrowserMockupProps {
  dark?: boolean;
  variant?: "dashboard" | "classes";
}

const BrowserMockup = ({ dark = false, variant = "dashboard" }: BrowserMockupProps) => {
  const screenshotMap = {
    dashboard: "/images/dashboard.png",
    classes: "/images/classes.png",
  };

  const screenshotUrl = screenshotMap[variant];
  const title = variant === "dashboard" ? "Dashboard" : "Manage Classes";

  return (
    <div
      className={cn(
        "w-full max-w-5xl mx-auto rounded-xl overflow-hidden shadow-2xl border",
        dark ? "border-slate-700" : "border-gray-200"
      )}
    >
      {/* Browser chrome top bar */}
      <div
        className={cn(
          "flex items-center gap-2.5 px-4 py-3 border-b",
          dark ? "bg-slate-800 border-slate-700" : "bg-gray-100 border-gray-200"
        )}
      >
        {/* Traffic lights */}
        <div className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0" />
        <div className="w-3 h-3 rounded-full bg-yellow-400 flex-shrink-0" />
        <div className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0" />

        {/* Address bar */}
        <div className="ml-4 flex-1 max-w-sm">
          <div
            className={cn(
              "flex items-center gap-2 h-6 px-3 rounded-md text-xs",
              dark
                ? "bg-slate-700 text-slate-300"
                : "bg-gray-200 text-gray-600"
            )}
          >
            <span className="truncate">pagez.example.com/{variant}</span>
          </div>
        </div>
      </div>

      {/* Screenshot Container */}
      <div className={cn(dark ? "bg-slate-950" : "bg-gray-50")}>
        <img
          src={screenshotUrl}
          alt={title}
          className="w-full h-auto block"
        />
      </div>
    </div>
  );
};

// Export a gallery component that shows multiple variants
export const BrowserMockupGallery = ({ dark = false }: { dark?: boolean }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <h3 className={cn("text-sm font-semibold mb-3", dark ? "text-white" : "text-gray-900")}>
          Dashboard Overview
        </h3>
        <BrowserMockup variant="dashboard" dark={dark} />
      </div>
      <div>
        <h3 className={cn("text-sm font-semibold mb-3", dark ? "text-white" : "text-gray-900")}>
          Class Management
        </h3>
        <BrowserMockup variant="classes" dark={dark} />
      </div>
    </div>
  );
};

export default BrowserMockup;
