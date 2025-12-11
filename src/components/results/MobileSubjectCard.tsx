import { Card, CardContent } from "@/components/ui/card";

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
}

interface MobileSubjectCardProps {
  mark: SubjectMark;
  caTypeConfig?: {
    ca1?: number;
    ca2?: number;
    ca3?: number;
    ca4?: number;
    ca?: number;
    exam?: number;
  };
}

export const MobileSubjectCard = ({ mark, caTypeConfig }: MobileSubjectCardProps) => {
  // Calculate weighted scores consistent with calculations
  const calculateWeightedScores = () => {
    const clamp = (val?: number, max: number = 100) => {
      const n = typeof val === 'number' ? val : 0;
      if (Number.isNaN(n)) return 0;
      return Math.min(Math.max(n, 0), max);
    };

    const caPercentage = (caTypeConfig?.ca ?? ((caTypeConfig?.ca1 || 0) + (caTypeConfig?.ca2 || 0) + (caTypeConfig?.ca3 || 0) + (caTypeConfig?.ca4 || 0)));
    const examPercentage = (caTypeConfig?.exam ?? (100 - caPercentage));

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

  const getGradeColor = (grade?: string) => {
    switch (grade) {
      case 'A': return 'text-green-600 bg-green-50';
      case 'B': return 'text-blue-600 bg-blue-50';
      case 'C': return 'text-yellow-600 bg-yellow-50';
      case 'D': return 'text-orange-600 bg-orange-50';
      case 'E': return 'text-red-600 bg-red-50';
      case 'F': return 'text-red-700 bg-red-100';
      default: return 'text-gray-600 bg-gray-50';
    }
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

  const { weightedCaScore, weightedExamScore } = calculateWeightedScores();

  return (
    <Card className="bg-gradient-to-br from-card to-card/80 border border-border/50 hover-scale transition-all duration-200 hover:shadow-lg hover:border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm text-foreground truncate flex-1 pr-2">
            {mark.subject?.name || `Subject ID: ${mark.subject_id || 'Missing'}`}
          </h3>
          <div className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${getGradeColor(mark.grade)}`}>
            {mark.grade || 'F'}
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-3 text-xs mb-3">
          <div className="text-center bg-muted/30 rounded-lg p-2">
            <div className="text-muted-foreground mb-1 font-medium">CLASS</div>
            <div className="font-bold text-base text-foreground">
              {weightedCaScore}
            </div>
          </div>
          <div className="text-center bg-muted/30 rounded-lg p-2">
            <div className="text-muted-foreground mb-1 font-medium">EXAM</div>
            <div className="font-bold text-base text-foreground">{weightedExamScore}</div>
          </div>
          <div className="text-center bg-primary/10 rounded-lg p-2">
            <div className="text-primary/70 mb-1 font-medium">TOTAL</div>
            <div className="font-bold text-xl text-primary">{Math.round(mark.total_score || 0)}</div>
          </div>
        </div>
        
        <div className="text-center">
          <span className="text-xs font-medium text-muted-foreground bg-muted/20 px-2 py-1 rounded-full">
            {getRemarkForGrade(mark.grade)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};