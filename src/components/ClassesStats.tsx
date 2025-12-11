
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Class } from "@/lib/supabase";

interface ClassesStatsProps {
  classes: Class[];
}

export const ClassesStats = ({ classes }: ClassesStatsProps) => {
  const totalStudents = classes.reduce((sum, cls) => sum + (cls.student_count || 0), 0);
  const averageStudents = classes.length > 0 ? Math.round(totalStudents / classes.length) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Class Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total Classes</span>
            <Badge variant="secondary" className="bg-primary/20 text-foreground">{classes.length}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total Students</span>
            <Badge variant="secondary" className="bg-primary/20 text-foreground">{totalStudents}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Average per Class</span>
            <Badge variant="secondary" className="bg-primary/20 text-foreground">{averageStudents}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
