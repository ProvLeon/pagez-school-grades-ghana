import React, { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Download,
  Search,
  Trash2,
  Plus,
  TrendingUp,
  Calendar,
  Award,
  FileText,
  Users,
  BarChart3,
  Info,
  AlertCircle,
  GraduationCap,
  Filter,
  BookOpen,
  Copy,
  ExternalLink,
  Check,
} from "lucide-react";
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
import { CreateMockSessionDialog } from "@/components/mock/CreateMockSessionDialog";
import { AddScoresDialog } from "@/components/mock/AddScoresDialog";
import { DeleteMockSessionDialog } from "@/components/mock/DeleteMockSessionDialog";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { useMockExamSessions, useDeleteMockExamSession } from "@/hooks/useMockExams";
import { useMockExamResults, useDeleteAllMockResults, EnrichedMockExamResult } from "@/hooks/useMockExamResults";
import {
  useMockExamDepartments,
  useMockExamClasses,
  getExamTypeName,
} from "@/hooks/useMockExamDepartments";
import { useAuth } from "@/contexts/AuthContext";
import { useCanAccessClass } from "@/hooks/useTeacherClassAccess";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { calculateMockGrade } from "@/utils/mockGradeCalculations";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Stats Card Component
const StatCard = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
  trend?: { value: number; label: string };
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <Icon className="h-5 w-5 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      {trend && (
        <p className={cn("text-xs mt-1", trend.value >= 0 ? "text-green-600" : "text-red-600")}>
          {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}% {trend.label}
        </p>
      )}
    </CardContent>
  </Card>
);

// Empty State Component
const EmptyState = ({
  title,
  message,
  icon: Icon = BarChart3,
  action,
}: {
  title: string;
  message: string;
  icon?: React.ElementType;
  action?: React.ReactNode;
}) => (
  <div className="text-center py-16">
    <Icon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
    <h3 className="text-lg font-semibold">{title}</h3>
    <p className="text-sm text-muted-foreground mb-4">{message}</p>
    {action}
  </div>
);

// Loading Skeleton
const LoadingSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
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
    <Card>
      <CardContent className="py-8">
        <Skeleton className="h-64 w-full" />
      </CardContent>
    </Card>
  </div>
);

// Grade Distribution Colors
const GRADE_COLORS = [
  "hsl(142, 76%, 36%)", // Grade 1 - Green
  "hsl(142, 76%, 46%)",
  "hsl(48, 96%, 53%)", // Yellow
  "hsl(38, 92%, 50%)",
  "hsl(25, 95%, 53%)", // Orange
  "hsl(15, 90%, 50%)",
  "hsl(0, 84%, 60%)", // Red
  "hsl(0, 84%, 50%)",
  "hsl(0, 84%, 40%)", // Grade 9 - Dark Red
];

export default function MockExams() {
  const { toast } = useToast();
  const { isTeacher, isAdmin } = useAuth();
  const { getAccessibleClassIds, getAssignedClasses, hasLoaded: teacherAccessLoaded, teacherId } = useCanAccessClass();

  // Data hooks
  const { data: sessions = [], isLoading: sessionsLoading } = useMockExamSessions();
  // Only JHS and SHS departments/classes for mock exams
  const { departments: mockDepartments, isLoading: departmentsLoading } = useMockExamDepartments();
  const { classes: allClasses, isLoading: classesLoading } = useMockExamClasses();

  // State
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("all");
  const [selectedClassId, setSelectedClassId] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"results" | "analytics">("results");
  const [linkCopied, setLinkCopied] = useState(false);

  // Results for selected session
  const {
    data: results = [],
    isLoading: resultsLoading,
    refetch: refetchResults,
  } = useMockExamResults(selectedSessionId);
  const deleteAll = useDeleteAllMockResults();

  // Auto-select first session
  React.useEffect(() => {
    if (!selectedSessionId && sessions.length > 0) {
      setSelectedSessionId(sessions[0].id);
    }
  }, [sessions, selectedSessionId]);

  // Get accessible classes for teachers - memoized to avoid dependency issues
  const accessibleClassIds = useMemo(() => {
    return isTeacher && !isAdmin ? getAccessibleClassIds() : [];
  }, [isTeacher, isAdmin, getAccessibleClassIds]);

  const assignedClasses = useMemo(() => {
    return isTeacher && !isAdmin ? getAssignedClasses() : [];
  }, [isTeacher, isAdmin, getAssignedClasses]);

  // Filter classes by department and teacher access
  const availableClasses = useMemo(() => {
    let classes = allClasses;

    // For teachers, only show their assigned classes that are also JHS/SHS
    if (isTeacher && !isAdmin) {
      classes = classes.filter((c) => accessibleClassIds.includes(c.id));
    }

    // Filter by department
    if (selectedDepartmentId && selectedDepartmentId !== "all") {
      classes = classes.filter((c) => c.department_id === selectedDepartmentId);
    }

    return classes;
  }, [allClasses, selectedDepartmentId, isTeacher, isAdmin, accessibleClassIds]);

  // Get class exam type for display
  const getClassExamType = (classId: string) => {
    const cls = allClasses.find((c) => c.id === classId);
    if (!cls?.department_id) return null;
    const dept = mockDepartments.find((d) => d.id === cls.department_id);
    return dept?.examType || null;
  };

  // Filter results by class and search term
  const filteredResults = useMemo(() => {
    let filtered = results;

    // Filter by class
    if (selectedClassId && selectedClassId !== "all") {
      filtered = filtered.filter((r) => r.class_id === selectedClassId);
    }

    // For teachers, only show results for their assigned classes
    if (isTeacher && !isAdmin && accessibleClassIds.length > 0) {
      filtered = filtered.filter((r) => r.class_id && accessibleClassIds.includes(r.class_id));
    }

    // Filter by search term
    const query = searchTerm.trim().toLowerCase();
    if (query) {
      filtered = filtered.filter((r) => r.student_name.toLowerCase().includes(query));
    }

    // Sort by position (aggregate)
    return filtered.sort((a, b) => (a.position || 999) - (b.position || 999));
  }, [results, selectedClassId, searchTerm, isTeacher, isAdmin, accessibleClassIds]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (filteredResults.length === 0) {
      return {
        totalStudents: 0,
        avgScore: 0,
        avgAggregate: 0,
        passRate: 0,
        gradeDistribution: [],
        classPerformance: [],
        subjectPerformance: [],
      };
    }

    const totalStudents = filteredResults.length;
    const avgScore = Math.round(
      filteredResults.reduce((sum, r) => sum + (Number(r.total_score) || 0), 0) / totalStudents
    );
    const avgAggregate = Math.round(
      filteredResults.reduce((sum, r) => sum + (Number(r.position) || 54), 0) / totalStudents
    );

    // Pass rate (aggregate <= 24 is pass for BECE)
    const passCount = filteredResults.filter((r) => (r.position || 54) <= 24).length;
    const passRate = Math.round((passCount / totalStudents) * 100);

    // Grade distribution based on aggregates
    const gradeRanges = [
      { label: "6-10", min: 6, max: 10 },
      { label: "11-15", min: 11, max: 15 },
      { label: "16-20", min: 16, max: 20 },
      { label: "21-24", min: 21, max: 24 },
      { label: "25-30", min: 25, max: 30 },
      { label: "31-40", min: 31, max: 40 },
      { label: "41-54", min: 41, max: 54 },
    ];

    const gradeDistribution = gradeRanges.map((range, index) => ({
      name: range.label,
      value: filteredResults.filter((r) => {
        const agg = r.position || 54;
        return agg >= range.min && agg <= range.max;
      }).length,
      color: GRADE_COLORS[index] || GRADE_COLORS[6],
    })).filter((g) => g.value > 0);

    // Class performance
    const classStats = new Map<string, { total: number; count: number; name: string }>();
    filteredResults.forEach((r) => {
      if (!r.class_id) return;
      const className = allClasses.find((c) => c.id === r.class_id)?.name || "Unknown";
      const existing = classStats.get(r.class_id);
      const score = Number(r.total_score) || 0;
      if (existing) {
        existing.total += score;
        existing.count += 1;
      } else {
        classStats.set(r.class_id, { total: score, count: 1, name: className });
      }
    });

    const classPerformance = Array.from(classStats.values())
      .map((stat) => ({
        name: stat.name,
        averageScore: Math.round(stat.total / stat.count),
        students: stat.count,
      }))
      .sort((a, b) => b.averageScore - a.averageScore);

    // Subject performance from subject_scores
    const subjectStats = new Map<string, { total: number; count: number }>();
    filteredResults.forEach((r) => {
      r.subject_scores?.forEach((score) => {
        const name = score.subject_name;
        const value = Number(score.total_score) || 0;
        if (value > 0) {
          const existing = subjectStats.get(name);
          if (existing) {
            existing.total += value;
            existing.count += 1;
          } else {
            subjectStats.set(name, { total: value, count: 1 });
          }
        }
      });
    });

    const subjectPerformance = Array.from(subjectStats.entries())
      .map(([name, stat]) => ({
        name,
        averageScore: Math.round(stat.total / stat.count),
      }))
      .sort((a, b) => b.averageScore - a.averageScore);

    return {
      totalStudents,
      avgScore,
      avgAggregate,
      passRate,
      gradeDistribution,
      classPerformance,
      subjectPerformance,
    };
  }, [filteredResults, allClasses]);

  const currentSession = sessions.find((s) => s.id === selectedSessionId);

  // Export PDF
  const handleExportPDF = () => {
    if (!currentSession || filteredResults.length === 0) return;

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Mock Exam Results - ${currentSession.name}`, 14, 20);
    doc.setFontSize(10);
    doc.text(`Academic Year: ${currentSession.academic_year} | Term: ${currentSession.term}`, 14, 28);
    doc.text(`Total Students: ${stats.totalStudents} | Average Score: ${stats.avgScore}%`, 14, 34);

    autoTable(doc, {
      startY: 42,
      head: [["Pos", "Student Name", "Raw Score", "Aggregate", "Grade"]],
      body: filteredResults.map((r, index) => [
        index + 1,
        r.student_name,
        `${r.total_score || 0}%`,
        r.position || "-",
        calculateMockGrade(Number(r.position) || 54),
      ]),
      theme: "grid",
      headStyles: { fillColor: [59, 130, 246] },
    });

    doc.save(`mock-results-${currentSession.name.replace(/\s+/g, "-").toLowerCase()}.pdf`);
    toast({ title: "PDF Exported", description: "Results have been exported successfully." });
  };

  // Delete all results
  const handleDeleteAllResults = () => {
    if (!selectedSessionId) return;
    deleteAll.mutate(
      { sessionId: selectedSessionId },
      {
        onSuccess: () => {
          toast({ title: "Results Deleted" });
          setShowDeleteAllModal(false);
          refetchResults();
        },
        onError: (error: Error) =>
          toast({ title: "Delete Failed", description: error.message, variant: "destructive" }),
      }
    );
  };

  // Teacher with no classes assigned
  if (isTeacher && !isAdmin && teacherAccessLoaded && accessibleClassIds.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="Mock Examinations" subtitle="Manage mock exam sessions and scores" />
        <main className="container mx-auto px-4 py-6">
          {!teacherId ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Account Not Linked</AlertTitle>
              <AlertDescription>
                Your account is not linked to a teacher profile. Please contact an administrator.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>No Classes Assigned</AlertTitle>
              <AlertDescription>
                You haven't been assigned to any classes yet. Please contact an administrator to assign
                you to classes before you can view mock exam results.
              </AlertDescription>
            </Alert>
          )}
        </main>
      </div>
    );
  }

  const isLoading = sessionsLoading || classesLoading || departmentsLoading || (isTeacher && !teacherAccessLoaded);

  return (
    <div className="min-h-screen bg-background">
      <Header
        title="Mock Examinations"
        subtitle={
          isTeacher && !isAdmin
            ? `View BECE/WASSCE mock results for your assigned JHS/SHS classes`
            : "Manage BECE & WASSCE mock exam sessions for JHS and SHS students"
        }
      />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {isLoading ? (
          <LoadingSkeleton />
        ) : sessions.length === 0 ? (
          // No sessions created yet
          <Card>
            <CardContent className="py-16">
              <EmptyState
                title="No Mock Exam Sessions"
                message="Create your first mock exam session to start adding student scores."
                icon={GraduationCap}
                action={
                  isAdmin && (
                    <CreateMockSessionDialog
                      trigger={
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Create First Session
                        </Button>
                      }
                    />
                  )
                }
              />
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Session Selection and Actions */}
            <Card>
              <CardHeader className="border-b pb-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Session Selector */}
                  <div className="flex flex-col sm:flex-row gap-3 flex-1">
                    <Select
                      value={selectedSessionId || ""}
                      onValueChange={setSelectedSessionId}
                      disabled={sessionsLoading}
                    >
                      <SelectTrigger className="w-full sm:w-72">
                        <SelectValue placeholder="Select a session..." />
                      </SelectTrigger>
                      <SelectContent>
                        {sessions.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                            {s.is_published && (
                              <Badge variant="secondary" className="ml-2">
                                Published
                              </Badge>
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {currentSession && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{currentSession.academic_year}</span>
                        <span>•</span>
                        <span>{currentSession.term}</span>
                        {currentSession.is_published && (
                          <>
                            <span>•</span>
                            <Badge variant="default" className="bg-green-600">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Published
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => {
                                const publicUrl = `${window.location.origin}/mock-results/${currentSession.id}`;
                                navigator.clipboard.writeText(publicUrl);
                                setLinkCopied(true);
                                toast({
                                  title: "Link copied!",
                                  description: "Public results link has been copied to clipboard.",
                                });
                                setTimeout(() => setLinkCopied(false), 2000);
                              }}
                            >
                              {linkCopied ? (
                                <>
                                  <Check className="h-3 w-3 mr-1" />
                                  Copied!
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3 w-3 mr-1" />
                                  Copy Link
                                </>
                              )}
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    {isAdmin && (
                      <>
                        <CreateMockSessionDialog
                          trigger={
                            <Button size="sm">
                              <Plus className="h-4 w-4 mr-2" />
                              New Session
                            </Button>
                          }
                        />
                        <AddScoresDialog sessionId={selectedSessionId} onSuccess={refetchResults}>
                          <Button variant="outline" size="sm" disabled={!selectedSessionId}>
                            <BookOpen className="h-4 w-4 mr-2" />
                            Add Scores
                          </Button>
                        </AddScoresDialog>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Stats Cards */}
            {currentSession && filteredResults.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Total Students"
                  value={stats.totalStudents}
                  icon={Users}
                  description={
                    selectedClassId !== "all"
                      ? `In selected class`
                      : `Across all classes`
                  }
                />
                <StatCard
                  title="Average Score"
                  value={`${stats.avgScore}%`}
                  icon={TrendingUp}
                  description="Average percentage"
                />
                <StatCard
                  title="Average Aggregate"
                  value={stats.avgAggregate}
                  icon={Award}
                  description="Lower is better (6 = best)"
                />
                <StatCard
                  title="Pass Rate"
                  value={`${stats.passRate}%`}
                  icon={GraduationCap}
                  description="Aggregate ≤ 24"
                />
              </div>
            )}

            {/* Main Content */}
            {selectedSessionId && (
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "results" | "analytics")}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  <TabsList>
                    <TabsTrigger value="results" className="gap-2">
                      <FileText className="h-4 w-4" />
                      Results
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Analytics
                    </TabsTrigger>
                  </TabsList>

                  {/* Filters */}
                  <div className="flex flex-wrap items-center gap-2">
                    {isAdmin && (
                      <Select
                        value={selectedDepartmentId}
                        onValueChange={(value) => {
                          setSelectedDepartmentId(value);
                          setSelectedClassId("all");
                        }}
                      >
                        <SelectTrigger className="w-48">
                          <Filter className="h-4 w-4 mr-2" />
                          <SelectValue placeholder="JHS / SHS" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All JHS & SHS</SelectItem>
                          {mockDepartments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id}>
                              {dept.name}
                              <Badge variant="outline" className="ml-2 text-xs">
                                {getExamTypeName(dept.examType)}
                              </Badge>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          All Classes ({availableClasses.length})
                        </SelectItem>
                        {availableClasses.map((cls) => {
                          const clsExamType = getClassExamType(cls.id);
                          return (
                            <SelectItem key={cls.id} value={cls.id}>
                              {cls.name}
                              {clsExamType && (
                                <Badge variant="outline" className="ml-2 text-xs">
                                  {getExamTypeName(clsExamType)}
                                </Badge>
                              )}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Results Tab */}
                <TabsContent value="results">
                  <Card>
                    <CardHeader className="border-b">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="relative flex-1 max-w-sm">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search by student name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleExportPDF}
                            disabled={filteredResults.length === 0}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Export PDF
                          </Button>
                          {isAdmin && currentSession && (
                            <DeleteMockSessionDialog
                              sessionId={currentSession.id}
                              sessionName={currentSession.name}
                              onSuccess={() => setSelectedSessionId(null)}
                              trigger={
                                <Button variant="destructive" size="sm">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Session
                                </Button>
                              }
                            />
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      {resultsLoading ? (
                        <div className="p-8">
                          <Skeleton className="h-64 w-full" />
                        </div>
                      ) : filteredResults.length === 0 ? (
                        <div className="p-8">
                          <EmptyState
                            title="No Results Found"
                            message={
                              results.length === 0
                                ? "No scores have been added to this session yet."
                                : "No results match your current filters."
                            }
                            icon={FileText}
                            action={
                              results.length === 0 &&
                              isAdmin && (
                                <AddScoresDialog
                                  sessionId={selectedSessionId}
                                  onSuccess={refetchResults}
                                >
                                  <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add First Score
                                  </Button>
                                </AddScoresDialog>
                              )
                            }
                          />
                        </div>
                      ) : (
                        <ScrollArea className="max-h-[600px]">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-16">Pos</TableHead>
                                <TableHead>Student Name</TableHead>
                                <TableHead>Class</TableHead>
                                <TableHead className="text-right">Avg Score</TableHead>
                                <TableHead className="text-right">Aggregate</TableHead>
                                <TableHead className="text-center">Grade</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filteredResults.map((result, index) => {
                                const aggregate = result.position || 54;
                                const grade = calculateMockGrade(aggregate);
                                const isPassing = aggregate <= 24;
                                const className =
                                  allClasses.find((c) => c.id === result.class_id)?.name || "-";

                                return (
                                  <TableRow key={result.id}>
                                    <TableCell className="font-medium">{index + 1}</TableCell>
                                    <TableCell className="font-medium">
                                      {result.student_name}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                      {className}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      {result.total_score || 0}%
                                    </TableCell>
                                    <TableCell className="text-right font-semibold">
                                      {aggregate}
                                    </TableCell>
                                    <TableCell className="text-center">
                                      <Badge
                                        variant={isPassing ? "default" : "destructive"}
                                        className={cn(
                                          isPassing && "bg-green-600 hover:bg-green-700"
                                        )}
                                      >
                                        {grade}
                                      </Badge>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </ScrollArea>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Analytics Tab */}
                <TabsContent value="analytics">
                  {filteredResults.length === 0 ? (
                    <Card>
                      <CardContent className="py-16">
                        <EmptyState
                          title="No Data for Analytics"
                          message="Add student scores to see performance analytics."
                          icon={BarChart3}
                        />
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Aggregate Distribution */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Aggregate Distribution</CardTitle>
                          <CardDescription>
                            Distribution of student aggregates (lower is better)
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {stats.gradeDistribution.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                              <PieChart>
                                <Pie
                                  data={stats.gradeDistribution}
                                  dataKey="value"
                                  nameKey="name"
                                  cx="50%"
                                  cy="50%"
                                  outerRadius={100}
                                  label={({ name, value }) => `${name}: ${value}`}
                                >
                                  {stats.gradeDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Pie>
                                <Tooltip />
                              </PieChart>
                            </ResponsiveContainer>
                          ) : (
                            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                              No data available
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
                          {stats.subjectPerformance.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                              <BarChart
                                data={stats.subjectPerformance}
                                layout="vertical"
                                margin={{ left: 20 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" domain={[0, 100]} />
                                <YAxis
                                  type="category"
                                  dataKey="name"
                                  width={120}
                                  fontSize={12}
                                />
                                <Tooltip />
                                <Bar
                                  dataKey="averageScore"
                                  fill="hsl(var(--primary))"
                                  radius={[0, 4, 4, 0]}
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          ) : (
                            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                              No subject data available
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Class Comparison (Admin only or if viewing all classes) */}
                      {stats.classPerformance.length > 1 && (
                        <Card className="lg:col-span-2">
                          <CardHeader>
                            <CardTitle>Class Comparison</CardTitle>
                            <CardDescription>
                              Average raw scores by class
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                              <BarChart data={stats.classPerformance}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" fontSize={12} />
                                <YAxis domain={[0, 100]} />
                                <Tooltip
                                  formatter={(value: number, name: string) => [
                                    `${value}%`,
                                    name === "averageScore" ? "Average Score" : name,
                                  ]}
                                />
                                <Bar
                                  dataKey="averageScore"
                                  fill="hsl(var(--primary))"
                                  radius={[4, 4, 0, 0]}
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </>
        )}
      </main>

      {/* Delete All Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteAllModal}
        onOpenChange={setShowDeleteAllModal}
        onConfirm={handleDeleteAllResults}
        title="Delete All Results?"
        description="This will permanently delete all results for this session. This action cannot be undone."
        type="danger"
        confirmText="Delete All"
        isLoading={deleteAll.isPending}
      />
    </div>
  );
}
