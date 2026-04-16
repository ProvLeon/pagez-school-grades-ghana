import { cn } from "@/lib/utils";

interface BrowserMockupProps {
  dark?: boolean;
}

const BrowserMockup = ({ dark = false }: BrowserMockupProps) => {
  return (
    <div
      className={cn(
        "w-full max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl border",
        dark ? "border-slate-700" : "border-gray-200"
      )}
    >
      {/* Browser chrome top bar */}
      <div
        className={cn(
          "flex items-center gap-2 px-4 py-3",
          dark ? "bg-slate-800" : "bg-gray-100"
        )}
      >
        <div className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0" />
        <div className="w-3 h-3 rounded-full bg-yellow-400 flex-shrink-0" />
        <div className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0" />
        <div
          className={cn(
            "ml-4 flex-1 max-w-xs h-5 rounded-full",
            dark ? "bg-slate-700" : "bg-gray-200"
          )}
        />
      </div>

      {/* Dashboard Preview */}
      <div
        className={cn(
          "flex h-64 md:h-72",
          dark ? "bg-slate-950" : "bg-gray-50"
        )}
      >
        {/* Sidebar */}
        <div
          className={cn(
            "w-36 md:w-44 flex-shrink-0 border-r p-3 space-y-1",
            dark
              ? "bg-slate-900 border-slate-700"
              : "bg-white border-gray-100"
          )}
        >
          <div
            className={cn(
              "text-[10px] font-bold mb-3 tracking-wider uppercase",
              dark ? "text-slate-500" : "text-gray-400"
            )}
          >
            e-Results GH
          </div>
          {["Dashboard", "Students", "Classes", "Results", "Reports", "Settings"].map(
            (item, i) => (
              <div
                key={item}
                className={cn(
                  "text-[11px] px-2.5 py-1.5 rounded-md font-medium cursor-default select-none",
                  i === 0
                    ? "bg-[#2563EB] text-white"
                    : dark
                      ? "text-slate-500 hover:text-slate-300"
                      : "text-gray-400 hover:text-gray-600"
                )}
              >
                {item}
              </div>
            )
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-4 md:p-5 space-y-3 overflow-hidden min-w-0">
          {/* Welcome row */}
          <div className="flex items-center justify-between">
            <div
              className={cn(
                "text-xs font-bold",
                dark ? "text-white" : "text-gray-800"
              )}
            >
              Welcome back, Admin
            </div>
            <div
              className={cn(
                "text-[10px] px-2 py-0.5 rounded-full font-medium",
                dark
                  ? "bg-slate-800 text-slate-400"
                  : "bg-blue-50 text-blue-600"
              )}
            >
              Term 2 · 2025
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Total Students", value: "1,247" },
              { label: "Classes", value: "24" },
              { label: "Reports Generated", value: "389" },
            ].map((stat) => (
              <div
                key={stat.label}
                className={cn(
                  "rounded-lg p-2.5",
                  dark
                    ? "bg-slate-800 border border-slate-700"
                    : "bg-white border border-gray-100 shadow-sm"
                )}
              >
                <div
                  className={cn(
                    "text-base md:text-lg font-extrabold leading-none",
                    dark ? "text-white" : "text-gray-900"
                  )}
                >
                  {stat.value}
                </div>
                <div
                  className={cn(
                    "text-[9px] md:text-[10px] mt-1 leading-tight",
                    dark ? "text-slate-500" : "text-gray-400"
                  )}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Recent Results Table */}
          <div
            className={cn(
              "rounded-lg p-3",
              dark
                ? "bg-slate-800 border border-slate-700"
                : "bg-white border border-gray-100 shadow-sm"
            )}
          >
            <div
              className={cn(
                "text-[11px] font-semibold mb-2.5",
                dark ? "text-white" : "text-gray-800"
              )}
            >
              Recent Results
            </div>
            <div className="space-y-2">
              {[
                { label: "JHS 3A — Mid-Term Results", status: "Published", color: "text-green-500" },
                { label: "JHS 2B — Mock Exam", status: "Draft", color: "text-yellow-500" },
                { label: "Primary 6C — Term Report", status: "Published", color: "text-green-500" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#2563EB] flex-shrink-0" />
                    <span
                      className={cn(
                        "text-[10px] truncate",
                        dark ? "text-slate-300" : "text-gray-600"
                      )}
                    >
                      {item.label}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "text-[9px] font-semibold flex-shrink-0",
                      item.color
                    )}
                  >
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowserMockup;
