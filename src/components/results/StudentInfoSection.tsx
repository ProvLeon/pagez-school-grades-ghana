import { User, CalendarDays, Hash, Trophy, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

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
  photoUrl?: string;
}

export const StudentInfoSection = ({
  studentName,
  className,
  academicYear,
  term,
  noOnRoll,
  date,
  overallPosition,
  isLoadingPosition = false,
  photoUrl
}: StudentInfoSectionProps) => {

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-card border border-slate-100 dark:border-border shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
      {/* Subtle Background Accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/20 dark:bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-rose-50 dark:bg-rose-500/5 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

      <div className="relative flex flex-col md:flex-row md:items-center justify-between p-6 sm:p-8 gap-6 z-10">

        {/* Left: Identity */}
        <div className="flex items-center gap-5">
          <div className="relative shrink-0 flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-indigo-500/20 dark:to-blue-500/20 border border-white dark:border-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400 overflow-hidden">
            {photoUrl ? (
              <img src={photoUrl} alt={studentName} className="w-full h-full object-cover" />
            ) : studentName ? (
              <span className="text-2xl sm:text-3xl font-black uppercase tracking-wider">{studentName.charAt(0)}</span>
            ) : (
              <User className="w-8 h-8" />
            )}
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-card-foreground tracking-tight mb-2">
              {studentName || "Unknown Student"}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20">
                <GraduationCap className="w-4 h-4" />
                {className || "Unassigned Class"}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Meta Badges */}
        <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-row sm:items-center sm:gap-4 lg:gap-6 mt-4 md:mt-0">
          <div className="flex flex-col items-start md:items-end">
            <span className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-muted-foreground mb-1">
              <CalendarDays className="w-3.5 h-3.5" />
              Academic Term
            </span>
            <span className="text-sm sm:text-base font-semibold text-slate-700 dark:text-foreground">
              {term ? `${term.charAt(0).toUpperCase() + term.slice(1)} Term` : "—"}{" "}
              <span className="text-slate-400 dark:text-muted-foreground font-medium">({academicYear || "—"})</span>
            </span>
          </div>

          <div className="hidden sm:block w-px h-10 bg-slate-100 dark:bg-border" />

          <div className="flex flex-col items-start md:items-end">
            <span className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-muted-foreground mb-1">
              <Hash className="w-3.5 h-3.5" />
              Roll No.
            </span>
            <span className="text-sm sm:text-base font-semibold text-slate-700 dark:text-foreground">
              {noOnRoll || "—"}
            </span>
          </div>

          <div className="hidden sm:block w-px h-10 bg-slate-100 dark:bg-border" />

          <div className="flex flex-col items-start md:items-end col-span-2 sm:col-span-1 border-t border-slate-100 dark:border-border sm:border-0 pt-3 sm:pt-0 mt-2 sm:mt-0">
            <span className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-rose-500 dark:text-rose-400 mb-1">
              <Trophy className="w-3.5 h-3.5" />
              Class Ranking
            </span>
            <span className="text-lg sm:text-xl font-bold text-rose-600 dark:text-rose-400">
              {isLoadingPosition ? "..." : overallPosition || "Not Ranked"}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};