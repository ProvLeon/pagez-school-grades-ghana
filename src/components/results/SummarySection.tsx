import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SummarySectionProps {
  totalMarks?: number;
  totalScore?: number;
  daysPresent?: number;
  daysSchoolOpened?: number;
  promotedToClass?: string;
}

export const SummarySection = ({
  totalMarks,
  totalScore,
  daysPresent,
  daysSchoolOpened,
  promotedToClass
}: SummarySectionProps) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-base">Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-6 text-sm">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Removed TOTAL MARKS and SCORE sections */}
          </div>
          
          {/* Right Column */}
          <div className="space-y-4">
            <div className="flex items-center">
              <span className="font-medium w-32">ATTENDANCE:</span>
              <span className="border-b border-gray-400 flex-1 pb-1">
                {daysPresent && daysSchoolOpened ? 
                  `${daysPresent} OUT OF ${daysSchoolOpened}` : 
                  "___ OUT OF ___"
                }
              </span>
            </div>
            
            <div className="flex items-center">
              <span className="font-medium w-32">PROMOTED TO:</span>
              <span className="border-b border-gray-400 flex-1 pb-1">
                {promotedToClass || "___________"}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};