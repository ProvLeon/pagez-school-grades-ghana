import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface MobileStudentSummaryProps {
  studentName: string;
  studentPhoto?: string;
  className: string;
  term: string;
  academicYear: string;
  totalScore?: number;
  overallPosition?: string;
  subjectCount: number;
  isLoadingPosition?: boolean;
}

export const MobileStudentSummary = ({
  studentName,
  studentPhoto,
  className,
  term,
  academicYear,
  totalScore,
  overallPosition,
  subjectCount,
  isLoadingPosition = false
}: MobileStudentSummaryProps) => {

  return (
    <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 border-2 border-primary/20">
            <AvatarImage src={studentPhoto} alt={studentName} />
            <AvatarFallback className="text-lg font-semibold">
              {studentName.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-lg text-foreground truncate mb-1">
              {studentName}
            </h2>
            
            <div className="flex flex-wrap gap-1 mb-3">
              <Badge variant="secondary" className="text-xs">
                {className}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {term.charAt(0).toUpperCase() + term.slice(1)} Term
              </Badge>
              <Badge variant="outline" className="text-xs">
                {academicYear}
              </Badge>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center bg-background/50 rounded p-2">
                <div className="text-muted-foreground">Total Score</div>
                <div className="font-bold text-lg text-primary">
                  {totalScore ? Math.round(totalScore) : 0}
                </div>
              </div>
              
              <div className="text-center bg-background/50 rounded p-2">
                <div className="text-muted-foreground">Position</div>
                <div className="font-bold text-lg text-primary">
                  {isLoadingPosition ? '...' : overallPosition || 'N/A'}
                </div>
              </div>
              
              <div className="text-center bg-background/50 rounded p-2">
                <div className="text-muted-foreground">Subjects</div>
                <div className="font-bold text-lg text-primary">
                  {subjectCount}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};