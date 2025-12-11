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
    <Card className="mb-6 bg-gradient-to-r from-card to-card/80 border-primary/10 shadow-sm">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-primary/10">
        <CardTitle className="text-lg font-semibold text-primary flex items-center gap-2">
          <div className="w-2 h-6 bg-primary rounded-full"></div>
          Student Information
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-sm">
          {/* Left Column */}
          <div className="space-y-6">
            <div className="group">
              <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide mb-2 block">
                Student's Name
              </span>
              <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
                <span className="font-semibold text-foreground">
                  {studentName || "Not specified"}
                </span>
              </div>
            </div>
            
            <div className="group">
              <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide mb-2 block">
                Class
              </span>
              <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
                <span className="font-semibold text-foreground">
                  {className || "Not specified"}
                </span>
              </div>
            </div>
            
            <div className="group">
              <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide mb-2 block">
                Academic Year
              </span>
              <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
                <span className="font-semibold text-foreground">
                  {academicYear || "Not specified"}
                </span>
              </div>
            </div>
            
            <div className="group">
              <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide mb-2 block">
                Overall Position
              </span>
              <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
                <span className="font-bold text-primary text-lg">
                  {isLoadingPosition ? "Calculating..." : overallPosition || "Not ranked"}
                </span>
              </div>
            </div>
          </div>
          
          {/* Right Column */}
          <div className="space-y-6">
            <div className="group">
              <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide mb-2 block">
                Term
              </span>
              <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
                <span className="font-semibold text-foreground">
                  {term ? `${term.charAt(0).toUpperCase() + term.slice(1)} Term` : "Not specified"}
                </span>
              </div>
            </div>
            
          </div>
        </div>
      </CardContent>
    </Card>
  );
};