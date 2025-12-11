import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SubjectWithDepartment } from "@/hooks/useSubjects";
import { BookOpen, Layers, Building2, TrendingUp } from "lucide-react";

interface SubjectsStatsProps {
  subjects: SubjectWithDepartment[];
}

export function SubjectsStats({ subjects }: SubjectsStatsProps) {
  // Calculate statistics
  const totalSubjects = subjects.length;

  // Group by department
  const departmentCounts = subjects.reduce((acc, subject) => {
    const deptName = subject.department?.name || 'Unassigned';
    acc[deptName] = (acc[deptName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const uniqueDepartments = Object.keys(departmentCounts).length;

  // Subjects with codes
  const subjectsWithCodes = subjects.filter(s => s.code && s.code.trim() !== '').length;

  // Recently added (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentlyAdded = subjects.filter(s => new Date(s.created_at) > thirtyDaysAgo).length;

  const stats = [
    {
      label: "Total Subjects",
      value: totalSubjects,
      icon: BookOpen,
      color: "bg-blue-100 text-blue-800",
    },
    {
      label: "Departments",
      value: uniqueDepartments,
      icon: Building2,
      color: "bg-purple-100 text-purple-800",
    },
    {
      label: "With Code",
      value: subjectsWithCodes,
      icon: Layers,
      color: "bg-green-100 text-green-800",
    },
    {
      label: "Added This Month",
      value: recentlyAdded,
      icon: TrendingUp,
      color: "bg-orange-100 text-orange-800",
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Subject Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stats.map((stat) => (
            <div key={stat.label} className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <stat.icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </div>
              <Badge variant="secondary" className={stat.color}>
                {stat.value}
              </Badge>
            </div>
          ))}
        </div>

        {/* Department Breakdown */}
        {uniqueDepartments > 0 && (
          <div className="mt-6 pt-4 border-t">
            <h4 className="text-sm font-medium mb-3">By Department</h4>
            <div className="space-y-2">
              {Object.entries(departmentCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([dept, count]) => (
                  <div key={dept} className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground truncate max-w-[140px]" title={dept}>
                      {dept}
                    </span>
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
