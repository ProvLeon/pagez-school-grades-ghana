import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
  // Calculate CA percentage and Exam percentage
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
      const caRaw = clamp(mark.ca1_score, 100);
      weightedCaScore = Math.round((caRaw * caPercentage) / 100);
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

  const getGradeColor = (grade?: string) => {
    switch (grade) {
      case 'A': return 'text-green-700 bg-green-100 border-green-200';
      case 'B': return 'text-blue-700 bg-blue-100 border-blue-200';
      case 'C': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'D': return 'text-orange-700 bg-orange-100 border-orange-200';
      case 'E': return 'text-red-700 bg-red-100 border-red-200';
      case 'F': return 'text-red-800 bg-red-200 border-red-300';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  return (
    <Card className="mb-6 bg-gradient-to-r from-card to-card/80 border-primary/10 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-primary/10">
        <CardTitle className="text-lg font-semibold text-primary flex items-center gap-2">
          <div className="w-2 h-6 bg-primary rounded-full"></div>
          Academic Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="overflow-x-auto">
          <Table className="text-sm">
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-muted/50 to-muted/30">
                <TableHead className="border border-border font-bold text-foreground text-center py-4">
                  SUBJECT
                </TableHead>
                <TableHead className="border border-border font-bold text-foreground text-center py-4">
                  CLASS SCORE ({caPercentage}%)
                </TableHead>
                <TableHead className="border border-border font-bold text-foreground text-center py-4">
                  EXAMS SCORE ({examPercentage}%)
                </TableHead>
                <TableHead className="border border-border font-bold text-foreground text-center py-4">
                  TOTAL SCORE (100%)
                </TableHead>
                <TableHead className="border border-border font-bold text-foreground text-center py-4">
                  GRADE
                </TableHead>
                <TableHead className="border border-border font-bold text-foreground text-center py-4">
                  REMARKS
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subjectMarks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="border border-border text-center py-8 text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                        📚
                      </div>
                      <span>No subjects found for this result</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                subjectMarks.map((mark, index) => (
                  <TableRow key={mark.id} className={`hover:bg-muted/20 transition-colors ${index % 2 === 0 ? 'bg-background' : 'bg-muted/10'}`}>
                    <TableCell className="border border-border font-semibold text-foreground py-4">
                      {mark.subject?.name || `Subject ID: ${mark.subject_id || 'Missing'}`}
                    </TableCell>
                    <TableCell className="border border-border text-center py-4">
                      <span className="font-semibold bg-muted/30 px-3 py-1 rounded-full">
                        {calculateWeightedScores(mark).weightedCaScore}
                      </span>
                    </TableCell>
                    <TableCell className="border border-border text-center py-4">
                      <span className="font-semibold bg-muted/30 px-3 py-1 rounded-full">
                        {calculateWeightedScores(mark).weightedExamScore}
                      </span>
                    </TableCell>
                    <TableCell className="border border-border text-center py-4">
                      <span className="font-bold text-lg bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">
                        {Math.round(mark.total_score || 0)}
                      </span>
                    </TableCell>
                    <TableCell className="border border-border text-center py-4">
                      <span className={`font-bold px-3 py-1 rounded-full border ${getGradeColor(mark.grade)}`}>
                        {mark.grade || 'F'}
                      </span>
                    </TableCell>
                    <TableCell className="border border-border text-center py-4">
                      <span className="text-muted-foreground font-medium">
                        {getRemarkForGrade(mark.grade)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
              {/* Add empty rows if less than 10 subjects */}
              {subjectMarks.length > 0 && Array.from({ length: Math.max(0, 10 - subjectMarks.length) }).map((_, index) => (
                <TableRow key={`empty-${index}`} className={`${(subjectMarks.length + index) % 2 === 0 ? 'bg-background' : 'bg-muted/10'}`}>
                  <TableCell className="border border-border h-12 text-center text-muted-foreground/50">—</TableCell>
                  <TableCell className="border border-border text-center text-muted-foreground/50">—</TableCell>
                  <TableCell className="border border-border text-center text-muted-foreground/50">—</TableCell>
                  <TableCell className="border border-border text-center text-muted-foreground/50">—</TableCell>
                  <TableCell className="border border-border text-center text-muted-foreground/50">—</TableCell>
                  <TableCell className="border border-border text-center text-muted-foreground/50">—</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};