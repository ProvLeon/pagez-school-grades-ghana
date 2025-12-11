
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Class } from "@/lib/supabase";

interface ClassesRecentUpdatesProps {
  classes: Class[];
}

export const ClassesRecentUpdates = ({ classes }: ClassesRecentUpdatesProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Updates</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {classes.slice(0, 3).map((cls, index) => (
            <div key={cls.id} className="text-sm">
              <p className="font-medium text-foreground/70">{cls.name} updated</p>
              <p className="text-muted-foreground/70 text-sm">{index === 0 ? '2 hours ago' : index === 1 ? '1 day ago' : '3 days ago'}</p>
            </div>
          ))}
          {classes.length === 0 && (
            <div className="text-sm text-gray-500">No recent updates</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
