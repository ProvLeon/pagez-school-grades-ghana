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
      if (!result.class_id || result.total_score === null || result.total_score === undefined) return;

      const className = result.class?.name || 'Unknown';
      const existing = classStats.get(result.class_id);

      if (existing) {
        existing.total += result.total_score;
        existing.count += 1;
      } else {
        classStats.set(result.class_id, {
          total: result.total_score,
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-muted-foreground" />
            Class Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
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
                      background: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 'var(--radius)'
                    }}
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-muted-foreground" />
            Student Gender Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
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
                    outerRadius={80}
                    dataKey="value"
                    nameKey="name"
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
                          fontSize={12}
                          fontWeight="bold"
                        >
                          {`${(percent * 100).toFixed(0)}%`}
                        </text>
                      );
                    }}
                  >
                    {genderData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={GENDER_COLORS[entry.key as keyof typeof GENDER_COLORS] || GENDER_COLORS.unknown}
                      />
                    ))}
                  </Pie>
                  <Legend
                    iconSize={10}
                    verticalAlign="bottom"
                    align="center"
                    formatter={(value, entry) => {
                      const item = genderData.find(d => d.name === value);
                      return `${value} (${item?.value || 0})`;
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 'var(--radius)'
                    }}
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
        </CardContent>
      </Card>
    </div>
  );
};
