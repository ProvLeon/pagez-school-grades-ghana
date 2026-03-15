import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StudentInfoSectionProps {
  studentName: string;
  className: string;
  academicYear: string;
  term: string;
  noOnRoll?: string;
  date?: string;
  overallPosition?: string;
  nextTermBegins?: string;
  isLoadingPosition?: boolean;
}

export const StudentInfoSection = ({
  studentName,
  className,
  academicYear,
  term,
  noOnRoll,
  date,
  overallPosition,
  nextTermBegins,
  isLoadingPosition = false
}: StudentInfoSectionProps) => {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "___________";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  return (
    <div className="mb-6 rounded-2xl border border-primary/20 bg-card text-card-foreground shadow-sm overflow-hidden">
      {/* Top Banner / Name Section */}
      <div className="px-6 py-6 sm:px-8 sm:py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-primary/10 bg-primary/5 relative overflow-hidden">
        {/* Decorative Background Element */}
        <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full blur-3xl opacity-20 bg-primary pointer-events-none" />

        <div className="flex items-center gap-5 z-10">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold shadow-sm border-2 border-primary/20 bg-white text-primary">
            {studentName ? studentName.charAt(0).toUpperCase() : '?'}
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight mb-1">
              {studentName || "Unknown Student"}
            </h2>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-sm font-semibold border border-primary/20 bg-primary/10 text-primary">
                {className || "Unassigned Class"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x border-border/50 bg-background/50">
        <div className="p-5 flex flex-col justify-center">
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">Academic Year</span>
          <span className="text-base font-medium text-foreground">{academicYear || "—"}</span>
        </div>
        
        <div className="p-5 flex flex-col justify-center">
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">Term</span>
          <span className="text-base font-medium text-foreground">
            {term ? `${term.charAt(0).toUpperCase() + term.slice(1)} Term` : "—"}
          </span>
        </div>

        <div className="p-5 flex flex-col justify-center">
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">No. on Roll</span>
          <span className="text-base font-medium text-foreground">{noOnRoll || "—"}</span>
        </div>

        <div className="p-5 flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-primary/5" />
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1 z-10 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Overall Position
          </span>
          <span className="text-xl sm:text-2xl font-bold z-10 text-primary">
            {isLoadingPosition ? "..." : overallPosition || "Not ranked"}
          </span>
        </div>
      </div>
    </div>
  );
};