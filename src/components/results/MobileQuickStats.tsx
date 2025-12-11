import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, TrendingUp, Users } from "lucide-react";

interface MobileQuickStatsProps {
  daysPresent?: number;
  daysSchoolOpened?: number;
  promotedToClass?: string;
  conduct?: string;
  attitude?: string;
  interest?: string;
}

export const MobileQuickStats = ({
  daysPresent,
  daysSchoolOpened,
  promotedToClass,
  conduct,
  attitude,
  interest
}: MobileQuickStatsProps) => {
  const attendancePercentage = daysPresent && daysSchoolOpened 
    ? Math.round((daysPresent / daysSchoolOpened) * 100)
    : 0;

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="grid grid-cols-1 gap-3">
      {/* Attendance Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CalendarDays className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-muted-foreground">Attendance</div>
              <div className="font-semibold">
                {daysPresent && daysSchoolOpened ? (
                  <>
                    <span className={getAttendanceColor(attendancePercentage)}>
                      {daysPresent} / {daysSchoolOpened}
                    </span>
                    <span className="text-muted-foreground ml-2">
                      ({attendancePercentage}%)
                    </span>
                  </>
                ) : (
                  <span className="text-muted-foreground">Not recorded</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Promotion Card */}
      {promotedToClass && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">Promoted To</div>
                <div className="font-semibold text-foreground">{promotedToClass}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Behavioral Summary */}
      {(conduct || attitude || interest) && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div className="text-sm font-semibold text-foreground">Behavioral Assessment</div>
            </div>
            
            <div className="space-y-2 text-sm">
              {conduct && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Conduct:</span>
                  <span className="font-medium">{conduct}</span>
                </div>
              )}
              {attitude && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Attitude:</span>
                  <span className="font-medium">{attitude}</span>
                </div>
              )}
              {interest && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Interest:</span>
                  <span className="font-medium">{interest}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};