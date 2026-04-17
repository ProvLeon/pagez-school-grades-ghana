import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useStudents } from '@/hooks/useStudents';
import { useClasses } from '@/hooks/useClasses';
import { useResults } from '@/hooks/useResults';
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, Users } from "lucide-react";

const GENDER_COLORS = {
  male: 'hsl(var(--primary))',
  female: 'hsl(var(--secondary))',
  unknown: 'hsl(var(--muted-foreground))',
};

export const PerformanceOverview = () => {
  const { data: students = [], isLoading: isLoadingStudents } = useStudents();
  const { data: classes = [], isLoading: isLoadingClasses } = useClasses();
  const { data: results = [], isLoading: isLoadingResults } = useResults();

  // Calculate real class performance from results data
  const classPerformanceData = useMemo(() => {
    if (classes.length === 0 || results.length === 0) return [];

    // Group results by class and calculate average scores
    const classStats = new Map<string, { total: number; count: number; name: string }>();

    results.forEach(result => {
      if (!result.class_id) return;

      // Calculate total score from subject_marks if available
      let totalScore = 0;
      if (result.subject_marks && result.subject_marks.length > 0) {
        totalScore = result.subject_marks.reduce((sum, mark) => sum + (mark.total_score || 0), 0);
      } else if (result.total_score !== null && result.total_score !== undefined) {
        // Fallback to total_score if subject_marks not available
        totalScore = result.total_score;
      } else {
        // Skip if no score data available
        return;
      }

      const className = result.class?.name || 'Unknown';
      const existing = classStats.get(result.class_id);

      if (existing) {
        existing.total += totalScore;
        existing.count += 1;
      } else {
        classStats.set(result.class_id, {
          total: totalScore,
          count: 1,
          name: className
        });
      }
    });

    // Convert to array and calculate averages
    const performanceData = Array.from(classStats.entries())
      .map(([_, stats]) => ({
        name: stats.name,
        performance: Math.round(stats.total / stats.count),
        count: stats.count
      }))
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, 8); // Limit to 8 classes for readability

    return performanceData;
  }, [classes, results]);

  // Calculate gender distribution from students
  const genderData = useMemo(() => {
    if (students.length === 0) return [];

    const genderCounts = students.reduce((acc, student) => {
      const gender = student.gender || 'unknown';
      acc[gender] = (acc[gender] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(genderCounts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      key: name
    }));
  }, [students]);

  const isGenderDataEmpty = genderData.length === 0;
  const isPerformanceDataEmpty = classPerformanceData.length === 0;
  const isLoading = isLoadingStudents || isLoadingClasses || isLoadingResults;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-card p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 dark:border-border flex flex-col">
          <div className="mb-5 flex items-center gap-2 border-b border-slate-100 dark:border-border pb-3">
            <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-card-foreground">Class Performance Overview</h3>
          </div>
          <div className="flex-1">
          {isLoading ? (
            <div className="h-80 flex items-center justify-center">
              <Skeleton className="w-full h-64" />
            </div>
          ) : isPerformanceDataEmpty ? (
            <div className="h-80 flex flex-col items-center justify-center text-muted-foreground">
              <BarChart3 className="w-16 h-16 mb-4 opacity-30" />
              <p className="text-sm font-medium">No Performance Data</p>
              <p className="text-xs mt-1">Results need to be entered to see class performance</p>
            </div>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classPerformanceData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip
                    cursor={{ fill: 'hsl(var(--muted))' }}
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 'var(--radius)',
                      color: 'hsl(var(--card-foreground))'
                    }}
                    itemStyle={{ color: 'hsl(var(--card-foreground))' }}
                    formatter={(value: number, name: string) => [`${value}%`, 'Avg Score']}
                    labelFormatter={(label) => `Class: ${label}`}
                  />
                  <Bar
                    dataKey="performance"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={50}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          {!isLoading && !isPerformanceDataEmpty && (
            <p className="text-xs text-muted-foreground text-center mt-2">
              Based on {results.length} result{results.length !== 1 ? 's' : ''} across {classPerformanceData.length} class{classPerformanceData.length !== 1 ? 'es' : ''}
            </p>
          )}
          </div>
      </div>

      <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-card p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 dark:border-border flex flex-col">
          <div className="mb-5 flex items-center gap-2 border-b border-slate-100 dark:border-border pb-3">
            <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-card-foreground">Student Gender Distribution</h3>
          </div>
          <div className="flex-1">
          {isLoadingStudents ? (
            <div className="h-80 flex items-center justify-center">
              <Skeleton className="w-48 h-48 rounded-full" />
            </div>
          ) : isGenderDataEmpty ? (
            <div className="h-80 flex flex-col items-center justify-center text-muted-foreground">
              <Users className="w-16 h-16 mb-4 opacity-30" />
              <p className="text-sm font-medium">No Student Data</p>
              <p className="text-xs mt-1">Add students to see gender distribution</p>
            </div>
          ) : (
            <div className="h-80 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                    nameKey="name"
                    stroke="none"
                    label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
                      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                      const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                      const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                      return (
                        <text
                          x={x}
                          y={y}
                          fill="white"
                          textAnchor="middle"
                          dominantBaseline="central"
                          fontSize={11}
                          fontWeight="bold"
                        >
                          {percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''}
                        </text>
                      );
                    }}
                  >
                    {genderData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={GENDER_COLORS[entry.key as keyof typeof GENDER_COLORS] || GENDER_COLORS.unknown}
                        className="stroke-background stroke-[2px] transition-all duration-300 hover:opacity-80"
                      />
                    ))}
                  </Pie>
                  <Legend
                    iconSize={10}
                    verticalAlign="bottom"
                    align="center"
                    formatter={(value, entry) => {
                      const item = genderData.find(d => d.name === value);
                      return <span className="text-slate-700 dark:text-slate-300">{`${value} (${item?.value || 0})`}</span>;
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 'var(--radius)',
                      color: 'hsl(var(--card-foreground))'
                    }}
                    itemStyle={{ color: 'hsl(var(--card-foreground))' }}
                    formatter={(value: number) => [`${value} students`, 'Count']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          {!isLoadingStudents && !isGenderDataEmpty && (
            <p className="text-xs text-muted-foreground text-center mt-2">
              Total: {students.length} student{students.length !== 1 ? 's' : ''}
            </p>
          )}
          </div>
      </div>
    </div>
  );
};
