import { useMemo } from "react";
import { useResults } from "@/hooks/useResults";
import { useClasses } from "@/hooks/useClasses";
import { useDepartments } from "@/hooks/useDepartments";
import { useSubjects } from "@/hooks/useSubjects";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import { GraduationCap, TrendingUp, Users, Award } from "lucide-react";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

const ResultsAnalytics = () => {
  const { data: results = [] } = useResults();
  const { data: classes = [] } = useClasses();
  const { data: departments = [] } = useDepartments();

  const analyticsData = useMemo(() => {
    const departmentStats = departments.map(dept => {
      const deptResults = results.filter(r => r.class?.department_id === dept.id);
      const avgScore = deptResults.length > 0
        ? deptResults.reduce((sum, r) => sum + (r.total_score || 0), 0) / deptResults.length
        : 0;

      return {
        name: dept.name,
        averageScore: Math.round(avgScore),
      };
    });

    const gradeDistribution = [
      { name: 'A', value: 0, color: 'hsl(var(--primary))' },
      { name: 'B', value: 0, color: 'hsl(var(--primary) / 0.8)' },
      { name: 'C', value: 0, color: 'hsl(var(--primary) / 0.6)' },
      { name: 'D', value: 0, color: 'hsl(var(--primary) / 0.4)' },
      { name: 'F', value: 0, color: 'hsl(var(--destructive))' }
    ];

    results.forEach(result => {
      const score = result.total_score || 0;
      if (score >= 80) gradeDistribution[0].value++;
      else if (score >= 70) gradeDistribution[1].value++;
      else if (score >= 60) gradeDistribution[2].value++;
      else if (score >= 50) gradeDistribution[3].value++;
      else gradeDistribution[4].value++;
    });

    const classPerformance = classes.map(cls => {
      const classResults = results.filter(r => r.class_id === cls.id);
      const avgScore = classResults.length > 0
        ? classResults.reduce((sum, r) => sum + (r.total_score || 0), 0) / classResults.length
        : 0;

      return {
        name: cls.name,
        averageScore: Math.round(avgScore),
      };
    }).filter(c => c.averageScore > 0);

    const monthlyTrend = [
      { month: 'Jan', averageScore: 72 },
      { month: 'Feb', averageScore: 75 },
      { month: 'Mar', averageScore: 73 },
      { month: 'Apr', averageScore: 78 },
      { month: 'May', averageScore: 76 },
      { month: 'Jun', averageScore: 80 }
    ];

    return {
      departmentStats,
      gradeDistribution: gradeDistribution.filter(g => g.value > 0),
      classPerformance,
      monthlyTrend,
      totalResults: results.length,
      approvedResults: results.filter(r => r.admin_approved).length,
      pendingResults: results.filter(r => !r.admin_approved).length,
      averageOverallScore: results.length > 0
        ? Math.round(results.reduce((sum, r) => sum + (r.total_score || 0), 0) / results.length)
        : 0
    };
  }, [results, classes, departments]);

  return (
    <div className="min-h-screen bg-background">
      <Header
        title="Results Analytics"
        subtitle="Comprehensive insights into student performance and academic trends"
      />

      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Results</CardTitle>
              <GraduationCap className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.totalResults}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
              <Award className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.approvedResults}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.pendingResults}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Average Score</CardTitle>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.averageOverallScore}%</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Department Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.departmentStats}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                  <Bar dataKey="averageScore" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Grade Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={analyticsData.gradeDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {analyticsData.gradeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Class Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={analyticsData.classPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" fontSize={12} tickLine={false} axisLine={false} width={80} />
                <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                <Bar dataKey="averageScore" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default ResultsAnalytics;
