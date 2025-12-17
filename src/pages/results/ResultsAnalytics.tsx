import { useMemo, useState } from "react";
import { useResults, Result } from "@/hooks/useResults";
import { useTeacherResults } from "@/hooks/useTeacherResults";
import { useClasses } from "@/hooks/useClasses";
import { useDepartments } from "@/hooks/useDepartments";
import { useAuth } from "@/contexts/AuthContext";
import { useCanAccessClass } from "@/hooks/useTeacherClassAccess";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
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
} from "recharts";
import { GraduationCap, TrendingUp, Users, BookOpen, Info, AlertCircle } from "lucide-react";

// Helper function to calculate a single subject mark's score from individual CA/exam scores
const calculateSubjectMarkScore = (mark: {
  ca1_score?: number | null;
  ca2_score?: number | null;
  ca3_score?: number | null;
  ca4_score?: number | null;
  exam_score?: number | null;
  total_score?: number | null;
}): number => {
  // If total_score is already set, use it
  if (mark.total_score !== null && mark.total_score !== undefined && mark.total_score > 0) {
    return mark.total_score;
  }

  // Otherwise calculate from individual scores
  const ca1 = mark.ca1_score || 0;
  const ca2 = mark.ca2_score || 0;
  const ca3 = mark.ca3_score || 0;
  const ca4 = mark.ca4_score || 0;
  const exam = mark.exam_score || 0;

  const totalFromScores = ca1 + ca2 + ca3 + ca4 + exam;
  return totalFromScores;
};

// Helper function to calculate average score from subject marks
const calculateResultAverageScore = (result: Result): number => {
  if (!result.subject_marks || result.subject_marks.length === 0) {
    return result.total_score || 0;
  }

  const scores = result.subject_marks.map(mark => calculateSubjectMarkScore(mark));
  const validScores = scores.filter(score => score > 0);

  if (validScores.length === 0) return result.total_score || 0;

  const totalScore = validScores.reduce((sum, score) => sum + score, 0);
  return totalScore / validScores.length;
};

// Loading skeleton component
const AnalyticsSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    </div>
  </div>
);

// Stats cards component
interface StatsCardsProps {
  totalResults: number;
  uniqueStudents: number;
  uniqueClasses: number;
  averageScore: number;
}

const StatsCards = ({ totalResults, uniqueStudents, uniqueClasses, averageScore }: StatsCardsProps) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Total Results</CardTitle>
        <GraduationCap className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{totalResults}</div>
      </CardContent>
    </Card>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Students Graded</CardTitle>
        <Users className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{uniqueStudents}</div>
      </CardContent>
    </Card>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Classes</CardTitle>
        <BookOpen className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{uniqueClasses}</div>
      </CardContent>
    </Card>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Average Score</CardTitle>
        <TrendingUp className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{averageScore}%</div>
      </CardContent>
    </Card>
  </div>
);

// Teacher Analytics Component
const TeacherAnalytics = () => {
  const { teacherRecord } = useAuth();
  const { getAssignedClasses, isLoading: accessLoading, hasLoaded, teacherId } = useCanAccessClass();
  const { data: teacherResults = [], isLoading: resultsLoading } = useTeacherResults();
  const [selectedClassId, setSelectedClassId] = useState<string>("all");

  const assignedClasses = getAssignedClasses();
  const isLoading = accessLoading || resultsLoading || !hasLoaded;

  // Filter results by selected class
  const filteredResults = useMemo(() => {
    if (selectedClassId === "all") return teacherResults;
    return teacherResults.filter(r => r.class_id === selectedClassId);
  }, [teacherResults, selectedClassId]);

  const analyticsData = useMemo(() => {
    const resultsWithScores = filteredResults.map(result => ({
      ...result,
      calculatedScore: calculateResultAverageScore(result)
    }));

    // Grade distribution
    const gradeDistribution = [
      { name: 'A (80-100)', value: 0, color: 'hsl(142, 76%, 36%)' },
      { name: 'B (70-79)', value: 0, color: 'hsl(142, 76%, 46%)' },
      { name: 'C (60-69)', value: 0, color: 'hsl(48, 96%, 53%)' },
      { name: 'D (50-59)', value: 0, color: 'hsl(25, 95%, 53%)' },
      { name: 'F (0-49)', value: 0, color: 'hsl(0, 84%, 60%)' }
    ];

    resultsWithScores.forEach(result => {
      const score = result.calculatedScore;
      if (score >= 80) gradeDistribution[0].value++;
      else if (score >= 70) gradeDistribution[1].value++;
      else if (score >= 60) gradeDistribution[2].value++;
      else if (score >= 50) gradeDistribution[3].value++;
      else gradeDistribution[4].value++;
    });

    // Subject performance (for teacher's classes)
    const subjectStats = new Map<string, { total: number; count: number; name: string }>();
    filteredResults.forEach(result => {
      result.subject_marks?.forEach(mark => {
        const subjectName = mark.subject?.name || 'Unknown';
        const score = calculateSubjectMarkScore(mark);
        if (score > 0) {
          const existing = subjectStats.get(mark.subject_id);
          if (existing) {
            existing.total += score;
            existing.count += 1;
          } else {
            subjectStats.set(mark.subject_id, { total: score, count: 1, name: subjectName });
          }
        }
      });
    });

    const subjectPerformance = Array.from(subjectStats.values())
      .map(stat => ({
        name: stat.name,
        averageScore: Math.round(stat.total / stat.count)
      }))
      .sort((a, b) => b.averageScore - a.averageScore);

    // Per-class performance
    const classStats = new Map<string, { total: number; count: number; name: string }>();
    resultsWithScores.forEach(result => {
      const className = result.class?.name || 'Unknown';
      const existing = classStats.get(result.class_id);
      if (existing) {
        existing.total += result.calculatedScore;
        existing.count += 1;
      } else {
        classStats.set(result.class_id, { total: result.calculatedScore, count: 1, name: className });
      }
    });

    const classPerformance = Array.from(classStats.values())
      .map(stat => ({
        name: stat.name,
        averageScore: Math.round(stat.total / stat.count)
      }))
      .filter(c => c.averageScore > 0);

    const uniqueStudents = new Set(filteredResults.map(r => r.student_id)).size;
    const uniqueClasses = new Set(filteredResults.map(r => r.class_id)).size;
    const overallAverage = resultsWithScores.length > 0
      ? Math.round(resultsWithScores.reduce((sum, r) => sum + r.calculatedScore, 0) / resultsWithScores.length)
      : 0;

    return {
      gradeDistribution: gradeDistribution.filter(g => g.value > 0),
      subjectPerformance,
      classPerformance,
      totalResults: filteredResults.length,
      uniqueStudents,
      uniqueClasses,
      averageOverallScore: overallAverage
    };
  }, [filteredResults]);

  // No teacher record linked
  if (hasLoaded && !teacherId) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          title="My Analytics"
          subtitle="View performance analytics for your classes"
        />
        <main className="container mx-auto px-4 py-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Account Not Linked</AlertTitle>
            <AlertDescription>
              Your account is not linked to a teacher profile. Please contact an administrator to set up your teacher profile.
            </AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

  // No classes assigned
  if (hasLoaded && assignedClasses.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          title="My Analytics"
          subtitle="View performance analytics for your classes"
        />
        <main className="container mx-auto px-4 py-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>No Classes Assigned</AlertTitle>
            <AlertDescription>
              You haven't been assigned to any classes yet. Please contact an administrator to assign you to classes.
            </AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        title="My Analytics"
        subtitle={`Performance analytics for ${teacherRecord?.full_name || 'Teacher'}`}
      />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Class Filter - only show if teacher has multiple classes */}
        {assignedClasses.length > 1 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Filter by Class</CardTitle>
              <CardDescription>Select a class to view specific analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                <SelectTrigger className="w-full md:w-[300px]">
                  <SelectValue placeholder="Select a class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All My Classes ({assignedClasses.length})</SelectItem>
                  {assignedClasses.map(cls => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name} {cls.department?.name ? `(${cls.department.name})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <AnalyticsSkeleton />
        ) : filteredResults.length === 0 ? (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>No Results Yet</AlertTitle>
            <AlertDescription>
              {selectedClassId === "all"
                ? "You haven't added any results for your assigned classes yet. Start by adding results for your students."
                : "No results found for the selected class. Add results to see analytics."}
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <StatsCards
              totalResults={analyticsData.totalResults}
              uniqueStudents={analyticsData.uniqueStudents}
              uniqueClasses={analyticsData.uniqueClasses}
              averageScore={analyticsData.averageOverallScore}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Grade Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Grade Distribution</CardTitle>
                  <CardDescription>Distribution of grades across all results</CardDescription>
                </CardHeader>
                <CardContent>
                  {analyticsData.gradeDistribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={analyticsData.gradeDistribution}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={({ name, value }) => `${name.split(' ')[0]}: ${value}`}
                        >
                          {analyticsData.gradeDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                      No grade data available
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Subject Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Subject Performance</CardTitle>
                  <CardDescription>Average scores by subject</CardDescription>
                </CardHeader>
                <CardContent>
                  {analyticsData.subjectPerformance.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analyticsData.subjectPerformance} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" domain={[0, 100]} fontSize={12} />
                        <YAxis type="category" dataKey="name" fontSize={12} width={100} />
                        <Tooltip />
                        <Bar dataKey="averageScore" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                      No subject data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Class Performance - only show if viewing all classes and has multiple */}
            {selectedClassId === "all" && analyticsData.classPerformance.length > 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Class Comparison</CardTitle>
                  <CardDescription>Compare average performance across your classes</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analyticsData.classPerformance}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" fontSize={12} />
                      <YAxis domain={[0, 100]} fontSize={12} />
                      <Tooltip />
                      <Bar dataKey="averageScore" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  );
};

// Admin Analytics Component
const AdminAnalytics = () => {
  const { data: results = [], isLoading: resultsLoading } = useResults();
  const { data: classes = [], isLoading: classesLoading } = useClasses();
  const { data: departments = [], isLoading: departmentsLoading } = useDepartments();

  const isLoading = resultsLoading || classesLoading || departmentsLoading;

  const analyticsData = useMemo(() => {
    const resultsWithScores = results.map(result => ({
      ...result,
      calculatedScore: calculateResultAverageScore(result)
    }));

    const departmentStats = departments.map(dept => {
      const deptResults = resultsWithScores.filter(r => r.class?.department_id === dept.id);
      const avgScore = deptResults.length > 0
        ? deptResults.reduce((sum, r) => sum + r.calculatedScore, 0) / deptResults.length
        : 0;

      return {
        name: dept.name,
        averageScore: Math.round(avgScore),
        count: deptResults.length
      };
    }).filter(d => d.count > 0);

    const gradeDistribution = [
      { name: 'A (80-100)', value: 0, color: 'hsl(142, 76%, 36%)' },
      { name: 'B (70-79)', value: 0, color: 'hsl(142, 76%, 46%)' },
      { name: 'C (60-69)', value: 0, color: 'hsl(48, 96%, 53%)' },
      { name: 'D (50-59)', value: 0, color: 'hsl(25, 95%, 53%)' },
      { name: 'F (0-49)', value: 0, color: 'hsl(0, 84%, 60%)' }
    ];

    resultsWithScores.forEach(result => {
      const score = result.calculatedScore;
      if (score >= 80) gradeDistribution[0].value++;
      else if (score >= 70) gradeDistribution[1].value++;
      else if (score >= 60) gradeDistribution[2].value++;
      else if (score >= 50) gradeDistribution[3].value++;
      else gradeDistribution[4].value++;
    });

    const classPerformance = classes.map(cls => {
      const classResults = resultsWithScores.filter(r => r.class_id === cls.id);
      const avgScore = classResults.length > 0
        ? classResults.reduce((sum, r) => sum + r.calculatedScore, 0) / classResults.length
        : 0;

      return {
        name: cls.name,
        averageScore: Math.round(avgScore),
      };
    }).filter(c => c.averageScore > 0);

    const uniqueStudents = new Set(results.map(r => r.student_id)).size;
    const uniqueClasses = new Set(results.map(r => r.class_id)).size;
    const overallAverage = resultsWithScores.length > 0
      ? Math.round(resultsWithScores.reduce((sum, r) => sum + r.calculatedScore, 0) / resultsWithScores.length)
      : 0;

    return {
      departmentStats,
      gradeDistribution: gradeDistribution.filter(g => g.value > 0),
      classPerformance,
      totalResults: results.length,
      uniqueStudents,
      uniqueClasses,
      averageOverallScore: overallAverage
    };
  }, [results, classes, departments]);

  return (
    <div className="min-h-screen bg-background">
      <Header
        title="Results Analytics"
        subtitle="Comprehensive insights into student performance and academic trends"
      />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {isLoading ? (
          <AnalyticsSkeleton />
        ) : results.length === 0 ? (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>No Results Yet</AlertTitle>
            <AlertDescription>
              No results have been added yet. Start by adding student results to see analytics.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <StatsCards
              totalResults={analyticsData.totalResults}
              uniqueStudents={analyticsData.uniqueStudents}
              uniqueClasses={analyticsData.uniqueClasses}
              averageScore={analyticsData.averageOverallScore}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Department Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Department Performance</CardTitle>
                  <CardDescription>Average scores by department</CardDescription>
                </CardHeader>
                <CardContent>
                  {analyticsData.departmentStats.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analyticsData.departmentStats}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                        <Tooltip />
                        <Bar dataKey="averageScore" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                      No department data available. Ensure classes are assigned to departments.
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Grade Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Grade Distribution</CardTitle>
                  <CardDescription>Distribution of grades across all results</CardDescription>
                </CardHeader>
                <CardContent>
                  {analyticsData.gradeDistribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={analyticsData.gradeDistribution}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={({ name, value }) => `${name.split(' ')[0]}: ${value}`}
                        >
                          {analyticsData.gradeDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                      No grade data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Class Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Class Performance</CardTitle>
                <CardDescription>Average scores by class</CardDescription>
              </CardHeader>
              <CardContent>
                {analyticsData.classPerformance.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={analyticsData.classPerformance} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                      <YAxis type="category" dataKey="name" fontSize={12} tickLine={false} axisLine={false} width={80} />
                      <Tooltip />
                      <Bar dataKey="averageScore" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                    No class performance data available yet. Add results with subject scores to see analytics.
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
};

// Main component that routes to appropriate view
const ResultsAnalytics = () => {
  const { isTeacher, isAdmin } = useAuth();

  // Teachers see their own analytics
  if (isTeacher && !isAdmin) {
    return <TeacherAnalytics />;
  }

  // Admins see full school analytics
  return <AdminAnalytics />;
};

export default ResultsAnalytics;
