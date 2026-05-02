import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubjectMark {
  id: string;
  subject_id?: string;
  subject?: {
    name: string;
  };
  ca1_score?: number;
  ca2_score?: number;
  ca3_score?: number;
  ca4_score?: number;
  exam_score?: number;
  total_score?: number;
  grade?: string;
  subject_teacher_remarks?: string;
}

interface SubjectsTableSectionProps {
  subjectMarks: SubjectMark[];
  caTypeConfig?: {
    ca1?: number;
    ca2?: number;
    ca3?: number;
    ca4?: number;
    ca?: number;
    exam?: number;
  };
}

export const SubjectsTableSection = ({
  subjectMarks,
  caTypeConfig
}: SubjectsTableSectionProps) => {
  const caPercentage = (caTypeConfig?.ca ?? ((caTypeConfig?.ca1 || 0) + (caTypeConfig?.ca2 || 0) + (caTypeConfig?.ca3 || 0) + (caTypeConfig?.ca4 || 0)));
  const examPercentage = (caTypeConfig?.exam ?? (100 - caPercentage));

  const calculateWeightedScores = (mark: SubjectMark) => {
    const clamp = (val?: number, max: number = 100) => {
      const n = typeof val === 'number' ? val : 0;
      if (Number.isNaN(n)) return 0;
      return Math.min(Math.max(n, 0), max);
    };

    let weightedCaScore = 0;
    if (caTypeConfig?.ca) {
      const caRaw = clamp(mark.ca1_score, caTypeConfig.ca);
      weightedCaScore = Math.round(caRaw);
    } else {
      const parts = [
        { key: 'ca1_score' as const, max: caTypeConfig?.ca1 || 0 },
        { key: 'ca2_score' as const, max: caTypeConfig?.ca2 || 0 },
        { key: 'ca3_score' as const, max: caTypeConfig?.ca3 || 0 },
        { key: 'ca4_score' as const, max: caTypeConfig?.ca4 || 0 },
      ];
      const caSum = parts.reduce((sum, p) => sum + (p.max ? clamp((mark as any)[p.key], p.max) : 0), 0);
      weightedCaScore = Math.round(caSum);
    }

    const weightedExamScore = Math.round((clamp(mark.exam_score, 100) * examPercentage) / 100);
    return { weightedCaScore, weightedExamScore };
  };

  const getRemarkForGrade = (grade?: string) => {
    switch (grade) {
      case 'A': return 'Excellent';
      case 'B': return 'Very Good';
      case 'C': return 'Good';
      case 'D': return 'Satisfactory';
      case 'E': return 'Weak';
      case 'F': return 'Very Weak';
      default: return '';
    }
  };

  const getGradeStyle = (grade?: string) => {
    switch (grade) {
      case 'A': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20';
      case 'B': return 'bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-500/20';
      case 'C': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/10 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20';
      case 'D': return 'bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20';
      case 'E': return 'bg-orange-100 text-orange-800 dark:bg-orange-500/10 dark:text-orange-400 border-orange-200 dark:border-orange-500/20';
      case 'F': return 'bg-rose-100 text-rose-800 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200 dark:border-rose-500/20';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="rounded-2xl border border-slate-100 dark:border-border bg-white dark:bg-card shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] overflow-hidden flex flex-col">
      <div className="px-6 py-5 flex items-center gap-3 border-b border-slate-100 dark:border-border bg-slate-50/50 dark:bg-slate-900/50">
        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
          <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-card-foreground line-clamp-1">
            Academic Performance
          </h3>
          <p className="text-xs text-slate-500 dark:text-muted-foreground">
            Subject-level grade breakdowns
          </p>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="border-b border-slate-100 dark:border-border bg-transparent hover:bg-transparent">
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-slate-500 dark:text-muted-foreground py-4 px-6 h-auto">
                Subject
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-slate-500 dark:text-muted-foreground py-4 text-center h-auto">
                CA ({caPercentage}%)
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-slate-500 dark:text-muted-foreground py-4 text-center h-auto">
                Exam ({examPercentage}%)
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-slate-500 dark:text-muted-foreground py-4 text-center h-auto">
                Total
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-slate-500 dark:text-muted-foreground py-4 text-center h-auto">
                Grade
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-slate-500 dark:text-muted-foreground py-4 text-right pr-6 h-auto">
                Remarks
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subjectMarks.length === 0 ? (
              <TableRow className="hover:bg-transparent border-0">
                <TableCell colSpan={6} className="text-center py-12">
                  <span className="text-slate-400 dark:text-muted-foreground font-medium">No subjects found for this result</span>
                </TableCell>
              </TableRow>
            ) : (
              subjectMarks.map((mark, index) => {
                const { weightedCaScore, weightedExamScore } = calculateWeightedScores(mark);
                return (
                  <TableRow
                    key={mark.id}
                    className={cn(
                      "border-b border-slate-50 dark:border-border/50 text-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50",
                      index === subjectMarks.length - 1 ? "border-0" : ""
                    )}
                  >
                    <TableCell className="font-semibold text-slate-900 dark:text-slate-200 py-4 px-6 max-w-[200px] truncate">
                      {mark.subject?.name || `Subject ID: ${mark.subject_id || 'Missing'}`}
                    </TableCell>
                    <TableCell className="text-center py-4">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium text-xs">
                        {weightedCaScore}
                      </span>
                    </TableCell>
                    <TableCell className="text-center py-4">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium text-xs">
                        {weightedExamScore}
                      </span>
                    </TableCell>
                    <TableCell className="text-center py-4">
                      <span className="text-base font-bold text-slate-900 dark:text-slate-100">
                        {Math.round(mark.total_score || 0)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center py-4">
                      <div className="flex justify-center">
                        <span className={cn(
                          "inline-flex items-center justify-center w-8 h-8 rounded-lg border font-bold text-sm",
                          getGradeStyle(mark.grade)
                        )}>
                          {mark.grade || 'F'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right py-4 pr-6">
                      <span className="text-slate-500 dark:text-slate-400 font-medium text-xs uppercase tracking-wide">
                        {getRemarkForGrade(mark.grade)}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
            
            {/* Pad with empty rows to maintain minimum height if under 5 rows for aesthetics */}
            {subjectMarks.length > 0 && subjectMarks.length < 5 && Array.from({ length: 5 - subjectMarks.length }).map((_, i) => (
              <TableRow key={`empty-${i}`} className="border-b border-slate-50 dark:border-border/50 hover:bg-transparent">
                <TableCell className="py-4 px-6 text-slate-300 dark:text-slate-700/50">—</TableCell>
                <TableCell className="py-4 text-center text-slate-300 dark:text-slate-700/50">—</TableCell>
                <TableCell className="py-4 text-center text-slate-300 dark:text-slate-700/50">—</TableCell>
                <TableCell className="py-4 text-center text-slate-300 dark:text-slate-700/50">—</TableCell>
                <TableCell className="py-4 text-center text-slate-300 dark:text-slate-700/50">—</TableCell>
                <TableCell className="py-4 pr-6 text-right text-slate-300 dark:text-slate-700/50">—</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};