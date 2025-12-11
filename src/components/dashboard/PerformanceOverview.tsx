
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useStudents } from '@/hooks/useStudents';
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const performanceData = [
  { name: 'JUNIOR HIGH 1', performance: 78 },
  { name: 'JUNIOR HIGH 2', performance: 85 },
  { name: 'JUNIOR HIGH 3', performance: 92 },
  { name: 'SENIOR HIGH 1', performance: 88 },
  { name: 'SENIOR HIGH 2', performance: 95 },
  { name: 'SENIOR HIGH 3', performance: 91 },
];

const GENDER_COLORS = {
  male: 'hsl(var(--primary))',
  female: 'hsl(var(--secondary))',
  unknown: 'hsl(var(--muted-foreground))',
};

const dummyGenderData = [{ name: 'male', value: 100 },
{ name: 'female', value: 50 }];

export const PerformanceOverview = () => {
  const { data: students = [], isLoading: isLoadingStudents } = useStudents();

  const genderData = useMemo(() => {
    if (students.length === 0) return [];

    const genderCounts = students.reduce((acc, student) => {
      const gender = student.gender || 'unknown';
      acc[gender] = (acc[gender] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(genderCounts).map(([name, value]) => ({ name, value }));
  }, [students]);

  const isGenderDataEmpty = genderData.length === 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Class Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted))' }}
                  contentStyle={{
                    background: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)'
                  }}
                />
                <Bar dataKey="performance" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Student Gender Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingStudents ? (
            <div className="h-80 flex items-center justify-center">
              <Skeleton className="w-48 h-48 rounded-full" />
            </div>
          ) : (
            <div className="h-80 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={isGenderDataEmpty ? dummyGenderData : genderData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    dataKey="value"
                    nameKey="name"
                    label={!isGenderDataEmpty ? ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                      const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                      const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                      return (
                        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                          {`${(percent * 100).toFixed(0)}%`}
                        </text>
                      );
                    } : undefined}
                  >
                    {(isGenderDataEmpty ? dummyGenderData : genderData).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={GENDER_COLORS[entry.name as keyof typeof GENDER_COLORS] || GENDER_COLORS.unknown} />
                    ))}
                  </Pie>
                  {!isGenderDataEmpty && <Legend iconSize={10} verticalAlign="bottom" align="center" />}
                  {!isGenderDataEmpty &&
                    <Tooltip
                      cursor={{ fill: 'hsl(var(--muted))' }}
                      contentStyle={{
                        background: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 'var(--radius)'
                      }}
                    />
                  }
                </PieChart>
              </ResponsiveContainer>
              {isGenderDataEmpty && (
                <div className="absolute inset-0 flex  pointer-events-none">
                  <p className="text-muted-foreground text-sm">No student data</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
