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
import { useGradingSettings, useGradingScales } from "@/hooks/useGradingSettings";
import { useSchoolSettings } from "@/hooks/useSchoolSettings";
import { cn } from "@/lib/utils";

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

  // Get grading settings
  const { data: gradingSettings } = useGradingSettings();

  // Get school settings for school name
  const { settings: schoolSettings } = useSchoolSettings();

  // State
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  // Fetch grading scales - will be used in PDF export
  const selectedDept = mockDepartments.find(d => d.id === selectedDepartmentId);
  const { data: gradingScalesData = [] } = useGradingScales(
    selectedDept?.name,
    gradingSettings?.academic_year,
    gradingSettings?.term
  );
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
    // If teacher has no assignments, they see nothing
    if (isTeacher && !isAdmin) {
      filtered = filtered.filter((r) => r.class_id && accessibleClassIds.includes(r.class_id));
    }

    // Filter by search term
    const query = searchTerm.trim().toLowerCase();
    if (query) {
      filtered = filtered.filter((r) => r.student_name.toLowerCase().includes(query));
    }

    // Calculate actual total score from subject scores and sort by total score (descending - higher is better)
    const withCalculatedTotals = filtered.map((r) => ({
      ...r,
      calculatedTotal: (r.subject_scores || []).reduce((sum, s) => sum + (s.total_score || 0), 0),
    }));

    return withCalculatedTotals.sort((a, b) => (b.calculatedTotal || 0) - (a.calculatedTotal || 0));
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
        gradeBySubject: {},
        bestAggregate: 54,
        worstAggregate: 6,
      };
    }

    const totalStudents = filteredResults.length;
    const avgScore = Math.round(
      filteredResults.reduce((sum, r) => sum + ((r as any).calculatedTotal || 0), 0) / totalStudents
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

    // Grade distribution by subject - using grading scales from database
    // Helper function to calculate grade from score using grading scales
    const getGradeFromScore = (score: number | null | undefined): string => {
      if (score === null || score === undefined) return '9';

      // Use grading scales from database if available
      if (gradingScalesData && gradingScalesData.length > 0) {
        // Sort by from_percentage descending to check from highest to lowest
        const sorted = [...gradingScalesData].sort((a, b) => b.from_percentage - a.from_percentage);
        for (const scale of sorted) {
          if (score >= scale.from_percentage && score <= scale.to_percentage) {
            return scale.grade || '9';
          }
        }
        return '9';
      }

      // Fallback to default grading if no scales found
      if (score >= 80) return '1';
      if (score >= 70) return '2';
      if (score >= 60) return '3';
      if (score >= 50) return '4';
      if (score >= 40) return '5';
      if (score >= 30) return '6';
      if (score >= 20) return '7';
      if (score >= 10) return '8';
      return '9';
    };

    // Get all unique subjects from filtered results
    const allSubjectsSet = new Set<string>();
    filteredResults.forEach(r => {
      r.subject_scores?.forEach(s => allSubjectsSet.add(s.subject_name));
    });
    const allSubjectsInResults = Array.from(allSubjectsSet).sort();

    // Initialize grade tracking with all possible grades from grading scales
    const allPossibleGrades = new Set<string>();
    if (gradingScalesData && gradingScalesData.length > 0) {
      gradingScalesData.forEach(scale => allPossibleGrades.add(scale.grade));
    } else {
      ['1', '2', '3', '4', '5', '6', '7', '8', '9'].forEach(g => allPossibleGrades.add(g));
    }

    const gradeBySubject: Record<string, Record<string, number>> = {};

    // Pre-initialize all subjects with all possible grades (matching PDF export)
    allSubjectsInResults.forEach(subject => {
      gradeBySubject[subject] = {};
      allPossibleGrades.forEach(g => {
        gradeBySubject[subject][g] = 0;
      });
    });

    // Now populate the grades from actual results (ensuring every student is counted for every subject)
    filteredResults.forEach((r) => {
      allSubjectsInResults.forEach(subjectName => {
        const score = r.subject_scores?.find(s => s.subject_name === subjectName);
        const scoreValue = score ? (Number(score.total_score) || 0) : 0;

        // Calculate grade from score using grading scales (0 or missing = Grade 9)
        const grade = getGradeFromScore(scoreValue);

        if (gradeBySubject[subjectName]) {
          gradeBySubject[subjectName][grade] = (gradeBySubject[subjectName][grade] || 0) + 1;
        }
      });
    });

    // Class performance
    const classStats = new Map<string, { total: number; count: number; name: string }>();
    filteredResults.forEach((r) => {
      if (!r.class_id) return;
      const className = allClasses.find((c) => c.id === r.class_id)?.name || "Unknown";
      const existing = classStats.get(r.class_id);
      const score = (r as any).calculatedTotal || 0;
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

    // Get best and worst aggregates
    const aggregates = filteredResults.map((r) => r.position || 54).sort((a, b) => a - b);
    const bestAggregate = aggregates[0] || 54;
    const worstAggregate = aggregates[aggregates.length - 1] || 6;

    return {
      totalStudents,
      avgScore,
      avgAggregate,
      passRate,
      gradeDistribution,
      classPerformance,
      subjectPerformance,
      gradeBySubject,
      bestAggregate,
      worstAggregate,
    };
  }, [filteredResults, allClasses, gradingScalesData]);

  const currentSession = sessions.find((s) => s.id === selectedSessionId);

  // Export PDF with detailed student results and subject scores
  const handleExportPDF = () => {
    if (!currentSession || filteredResults.length === 0) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;
    const primaryColor: [number, number, number] = [59, 130, 246];
    const headerColor: [number, number, number] = [30, 64, 175];

    // Get all unique subjects from the results
    const allSubjects = new Set<string>();
    filteredResults.forEach(r => {
      r.subject_scores?.forEach(s => allSubjects.add(s.subject_name));
    });
    const subjectList = Array.from(allSubjects).sort();

    // Function to get grade based on score using grading scales from settings
    const getGrade = (score: number | null | undefined): string => {
      if (score === null || score === undefined) return '9';

      // Use grading scales from database if available
      if (gradingScalesData && gradingScalesData.length > 0) {
        // Sort by from_percentage descending to check from highest to lowest
        const sorted = [...gradingScalesData].sort((a, b) => b.from_percentage - a.from_percentage);
        for (const scale of sorted) {
          if (score >= scale.from_percentage && score <= scale.to_percentage) {
            return scale.grade || '9';
          }
        }
        return '9';
      }

      // Fallback to default grading if no scales found
      if (score >= 80) return '1';
      if (score >= 70) return '2';
      if (score >= 60) return '3';
      if (score >= 50) return '4';
      if (score >= 40) return '5';
      if (score >= 30) return '6';
      if (score >= 20) return '7';
      if (score >= 10) return '8';
      return '9';
    };

    // Calculate grade distribution for each subject
    const gradeDistribution: { [key: string]: { [key: string]: number } } = {};
    subjectList.forEach(subject => {
      gradeDistribution[subject] = {};

      // Initialize all possible grades
      if (gradingScalesData && gradingScalesData.length > 0) {
        gradingScalesData.forEach(scale => {
          gradeDistribution[subject][scale.grade] = 0;
        });
      } else {
        ['1', '2', '3', '4', '5', '6', '7', '8', '9'].forEach(g => {
          gradeDistribution[subject][g] = 0;
        });
      }

      filteredResults.forEach(student => {
        const subjectScore = student.subject_scores?.find(s => s.subject_name === subject);
        // Count every student for every subject (missing scores = Grade 9)
        const scoreValue = subjectScore ? (Number(subjectScore.total_score) || 0) : 0;
        const grade = getGrade(scoreValue);
        gradeDistribution[subject][grade] = (gradeDistribution[subject][grade] || 0) + 1;
      });
    });

    // Calculate best and worst grades per subject
    const bestGradePerSubject: { [key: string]: string } = {};
    const worstGradePerSubject: { [key: string]: string } = {};

    subjectList.forEach(subject => {
      const gradesInOrder = Object.keys(gradeDistribution[subject]).sort();

      for (const grade of gradesInOrder) {
        if (gradeDistribution[subject][grade] > 0) {
          bestGradePerSubject[subject] = grade;
          break;
        }
      }

      for (let i = gradesInOrder.length - 1; i >= 0; i--) {
        const grade = gradesInOrder[i];
        if (gradeDistribution[subject][grade] > 0) {
          worstGradePerSubject[subject] = grade;
          break;
        }
      }
    });

    // Get school name from settings or use default
    const schoolName = schoolSettings?.school_name || 'SCHOOL NAME';

    // === PAGE 1: Summary Statistics ===
    let currentY = 15;

    // Header with border
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin - 4, 8, pageWidth - (margin * 2) + 8, 30, 2, 2);

    // School info
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...headerColor);
    doc.text(schoolName, pageWidth / 2, currentY + 2, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text('MOCK EXAMINATION SUMMARY', pageWidth / 2, currentY + 8, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text(currentSession.name, pageWidth / 2, currentY + 13, { align: 'center' });

    doc.setFontSize(9);
    doc.text(`Academic Year: ${currentSession.academic_year} | Term: ${currentSession.term}`, pageWidth / 2, currentY + 18, { align: 'center' });
    doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, pageWidth / 2, currentY + 22, { align: 'center' });

    currentY = 50;

    // Summary statistics boxes
    const avgTotal = Math.round(
      filteredResults.reduce((sum, r) => sum + ((r as any).calculatedTotal || 0), 0) / filteredResults.length
    );
    const passCount = filteredResults.filter(r => ((r as any).calculatedTotal || 0) >= 50).length;
    const passRate = Math.round((passCount / filteredResults.length) * 100);

    // Box 1: Total Students
    doc.setFillColor(240, 249, 255);
    doc.roundedRect(margin, currentY, (pageWidth - margin * 2) / 3 - 3, 20, 2, 2, 'F');
    doc.setDrawColor(...primaryColor);
    doc.roundedRect(margin, currentY, (pageWidth - margin * 2) / 3 - 3, 20, 2, 2);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...headerColor);
    doc.text('Total Students', margin + 5, currentY + 7);
    doc.setFontSize(16);
    doc.text(String(filteredResults.length), margin + 5, currentY + 16);

    // Box 2: Average Score
    const boxX = margin + (pageWidth - margin * 2) / 3;
    doc.setFillColor(240, 249, 255);
    doc.roundedRect(boxX, currentY, (pageWidth - margin * 2) / 3 - 3, 20, 2, 2, 'F');
    doc.setDrawColor(...primaryColor);
    doc.roundedRect(boxX, currentY, (pageWidth - margin * 2) / 3 - 3, 20, 2, 2);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...headerColor);
    doc.text('Average Score', boxX + 5, currentY + 7);
    doc.setFontSize(16);
    doc.text(String(avgTotal), boxX + 5, currentY + 16);

    // Box 3: Pass Rate
    const boxX3 = boxX + (pageWidth - margin * 2) / 3;
    doc.setFillColor(240, 249, 255);
    doc.roundedRect(boxX3, currentY, (pageWidth - margin * 2) / 3 - 3, 20, 2, 2, 'F');
    doc.setDrawColor(...primaryColor);
    doc.roundedRect(boxX3, currentY, (pageWidth - margin * 2) / 3 - 3, 20, 2, 2);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...headerColor);
    doc.text('Pass Rate', boxX3 + 5, currentY + 7);
    doc.setFontSize(16);
    doc.text(`${passRate}%`, boxX3 + 5, currentY + 16);

    currentY += 28;

    // Key Statistics Table
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...headerColor);
    doc.text('Performance Overview', margin, currentY);
    currentY += 6;

    const statsTableHeaders = ['Metric', 'Value'];
    const highestScore = Math.max(...filteredResults.map(r => (r as any).calculatedTotal || 0));
    const lowestScore = Math.min(...filteredResults.map(r => (r as any).calculatedTotal || 0));
    const sorted = [...filteredResults].sort((a, b) => ((b as any).calculatedTotal || 0) - ((a as any).calculatedTotal || 0));
    const mid = Math.floor(sorted.length / 2);
    const medianScore = sorted.length % 2
      ? sorted[mid].calculatedTotal || 0
      : (((sorted[mid - 1] as any).calculatedTotal || 0) + ((sorted[mid] as any).calculatedTotal || 0)) / 2;

    const statsTableBody = [
      ['Highest Score', String(highestScore)],
      ['Lowest Score', String(lowestScore)],
      ['Median Score', String(Math.round(medianScore as number))],
      ['Students Passed (≥50)', `${passCount} / ${filteredResults.length}`],
    ];

    autoTable(doc, {
      startY: currentY,
      head: [statsTableHeaders],
      body: statsTableBody,
      theme: 'grid',
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { cellWidth: 80, halign: 'left' },
        1: { cellWidth: 50, halign: 'center' },
      },
      margin: { left: margin, right: margin },
    });

    currentY = (doc as any).lastAutoTable?.finalY + 15 || currentY + 50;

    // Top Performers
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...headerColor);
    doc.text('Top 5 Performers', margin, currentY);
    currentY += 6;

    const topPerformers = [...filteredResults]
      .sort((a, b) => ((b as any).calculatedTotal || 0) - ((a as any).calculatedTotal || 0))
      .slice(0, 5);

    const topPerformersHeaders = ['Rank', 'Student Name', 'Score'];
    const topPerformersBody = topPerformers.map((student, idx) => [
      String(idx + 1),
      student.student_name,
      String((student as any).calculatedTotal || 0),
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [topPerformersHeaders],
      body: topPerformersBody,
      theme: 'grid',
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { cellWidth: 20, halign: 'center' },
        1: { cellWidth: 110, halign: 'left' },
        2: { cellWidth: 40, halign: 'center' },
      },
      margin: { left: margin, right: margin },
    });

    // === PAGE 2: Detailed Results ===
    doc.addPage();
    currentY = 15;

    // Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(schoolName, pageWidth / 2, currentY, { align: 'center' });

    currentY += 8;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60, 60, 60);
    doc.text(`Mock Results – ${currentSession.name}`, pageWidth / 2, currentY, { align: 'center' });

    currentY += 6;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(`Academic Year: ${currentSession.academic_year} | Term: ${currentSession.term}`, pageWidth / 2, currentY, { align: 'center' });

    currentY += 4;
    doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, pageWidth / 2, currentY, { align: 'center' });

    currentY += 4;
    doc.text(`Total Students: ${filteredResults.length} | Average Score: ${avgTotal}%`, pageWidth / 2, currentY, { align: 'center' });

    currentY += 10;

    // Detailed results table
    const detailedHeaders = ['Student Name', ...subjectList, 'Raw Score', 'Agg.', 'Pos.'];

    const detailedTableBody = filteredResults.map((r, index) => {
      const rank = index + 1;
      const row: (string | number)[] = [r.student_name];

      subjectList.forEach(subjectName => {
        const subjectScore = r.subject_scores?.find(s => s.subject_name === subjectName);
        row.push(subjectScore?.total_score ?? '-');
      });

      row.push((r as any).calculatedTotal || 0);
      row.push(r.position || '-');
      row.push(rank);

      return row;
    });

    // Calculate column widths
    const studentNameWidth = 35;
    const rawScoreWidth = 18;
    const aggWidth = 15;
    const posWidth = 15;
    const fixedColumnsWidth = studentNameWidth + rawScoreWidth + aggWidth + posWidth;
    const availableWidth = pageWidth - margin * 2 - fixedColumnsWidth;
    const subjectColWidth = Math.max(11, availableWidth / subjectList.length);

    const detailedColumnStyles: { [key: number]: { cellWidth: number; halign?: 'center' | 'left' | 'right' } } = {
      0: { cellWidth: studentNameWidth, halign: 'left' },
    };

    for (let i = 1; i <= subjectList.length; i++) {
      detailedColumnStyles[i] = { cellWidth: subjectColWidth, halign: 'center' };
    }

    const rawScoreIdx = subjectList.length + 1;
    detailedColumnStyles[rawScoreIdx] = { cellWidth: rawScoreWidth, halign: 'center' };
    detailedColumnStyles[rawScoreIdx + 1] = { cellWidth: aggWidth, halign: 'center' };
    detailedColumnStyles[rawScoreIdx + 2] = { cellWidth: posWidth, halign: 'center' };

    autoTable(doc, {
      startY: currentY,
      head: [detailedHeaders],
      body: detailedTableBody,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: detailedColumnStyles,
      margin: { left: margin, right: margin },
    });

    // === PAGE 3: Grade Distribution Analysis ===
    doc.addPage();
    currentY = 15;

    // Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(schoolName, pageWidth / 2, currentY, { align: 'center' });

    currentY += 8;
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(`${currentSession.name} - Mock Examination`, pageWidth / 2, currentY, { align: 'center' });

    currentY += 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...headerColor);
    doc.text('ANALYSIS', pageWidth / 2, currentY, { align: 'center' });

    currentY += 10;

    // Create grade analysis table
    const analysisHeaders = ['GRADE', ...subjectList];
    const analysisBody: (string | number)[][] = [];

    // Get all unique grades from grading scales or use defaults
    let allGrades: string[] = [];
    if (gradingScalesData && gradingScalesData.length > 0) {
      // Use grades from database (sorted by from_percentage descending)
      const gradeSet = new Set<string>();
      [...gradingScalesData]
        .sort((a, b) => b.from_percentage - a.from_percentage)
        .forEach(scale => gradeSet.add(scale.grade));
      allGrades = Array.from(gradeSet);
    } else {
      // Use default grades
      allGrades = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
    }

    // Add rows for each grade
    allGrades.forEach(grade => {
      const row: (string | number)[] = [`GRADE ${grade}`];
      subjectList.forEach(subject => {
        row.push(gradeDistribution[subject][grade] || 0);
      });
      analysisBody.push(row);
    });

    // Add total row (total count of students in the filtered set)
    const totalRow: (string | number)[] = ['TOTAL NO. OF STUDENTS'];
    subjectList.forEach(subject => {
      totalRow.push(filteredResults.length);
    });
    analysisBody.push(totalRow);

    // Add best grade row
    const bestGradeRow: (string | number)[] = ['BEST GRADE'];
    subjectList.forEach(subject => {
      bestGradeRow.push(bestGradePerSubject[subject] || '-');
    });
    analysisBody.push(bestGradeRow);

    // Add worst grade row
    const worstGradeRow: (string | number)[] = ['WORST GRADE'];
    subjectList.forEach(subject => {
      worstGradeRow.push(worstGradePerSubject[subject] || '-');
    });
    analysisBody.push(worstGradeRow);

    // Add best and worst aggregate
    const bestAggregate = Math.min(...filteredResults.map(r => r.position || 999));
    const worstAggregate = Math.max(...filteredResults.map(r => r.position || 0));

    // Create rows with correct number of columns matching the subjects
    const bestAggRow = ['BEST AGGREGATE', bestAggregate];
    const worstAggRow = ['WORST AGGREGATE', worstAggregate];

    // Fill remaining columns with empty strings to maintain table structure
    for (let i = 0; i < subjectList.length - 1; i++) {
      bestAggRow.push('');
      worstAggRow.push('');
    }

    analysisBody.push(bestAggRow);
    analysisBody.push(worstAggRow);

    autoTable(doc, {
      startY: currentY,
      head: [analysisHeaders],
      body: analysisBody,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 3,
        halign: 'center',
      },
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8,
      },
      bodyStyles: {
        fillColor: [255, 255, 255],
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240],
      },
      margin: { left: margin, right: margin },
    });

    // Add footer to all pages
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(120, 120, 120);
      doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 8, { align: 'center' });

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...primaryColor);
      doc.text('© e-Result System', pageWidth - margin, pageHeight - 8, { align: 'right' });

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(120, 120, 120);
      doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, margin, pageHeight - 8);
    }

    doc.save(`mock-results-${currentSession.name.replace(/\s+/g, "-").toLowerCase()}.pdf`);
    toast({ title: "PDF Exported", description: "Mock exam report (3 pages) has been exported successfully." });
  };

  // Helper to convert image URL to base64 for PDF
  const getImageAsBase64 = async (url: string): Promise<string | null> => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting image to base64:', error);
      return null;
    }
  };

  // Helper methods for color management
  const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 }; // Default black
  };

  // Export individual student PDF
  const handleExportStudentPDF = async (result: EnrichedMockExamResult, rank?: number) => {
    if (!currentSession) return;

    toast({ title: "Generating PDF...", description: `Preparing result for ${result.student_name}.` });

    // Calculate rank if not provided (find the position in filtered results)
    const studentRank = rank !== undefined ? rank : filteredResults.findIndex(r => r.id === result.id) + 1;

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 12;
    
    const primaryColorHex = schoolSettings?.primary_color || '#000000';
    const primaryRGB = hexToRgb(primaryColorHex);
    // Use primary color for borders to respect school theme while maintaining formal look
    const borderColor: [number, number, number] = [primaryRGB.r, primaryRGB.g, primaryRGB.b];

    let currentY = 15;

    // 1. Draw Page Border (Double line)
    doc.setDrawColor(...borderColor);
    doc.setLineWidth(1.5);
    doc.rect(margin, margin, pageWidth - (margin * 2), pageHeight - (margin * 2));
    
    doc.setLineWidth(0.4);
    doc.rect(margin + 2, margin + 2, pageWidth - (margin * 2) - 4, pageHeight - (margin * 2) - 4);

    // 2. Header Section
    currentY = margin + 8;
    
    if (schoolSettings?.logo_url) {
      const logoBase64 = await getImageAsBase64(schoolSettings.logo_url);
      if (logoBase64) {
        doc.addImage(logoBase64, 'JPEG', margin + 6, currentY, 22, 22);
      }
    }

    doc.setTextColor(0, 0, 0);
    const schoolNameText = (schoolSettings?.school_name || "SCHOOL NAME").toUpperCase();
    
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(schoolNameText, pageWidth / 2, currentY + 8, { align: 'center' });
    
    doc.setFontSize(14);
    doc.text(`(${currentSession.name.toUpperCase()}) MOCK RESULTS`, pageWidth / 2, currentY + 16, { align: 'center' });

    currentY += 30;

    // 3. Student Info Grid
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.2);
    
    doc.line(margin + 2, currentY, pageWidth - margin - 2, currentY);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    doc.text(`NAME: `, margin + 4, currentY + 5);
    doc.setFont('helvetica', 'bold');
    doc.text(`${result.student_name}`, margin + 20, currentY + 5);
    
    doc.line(pageWidth / 2, currentY, pageWidth / 2, currentY + 21);
    
    doc.setFont('helvetica', 'normal');
    doc.text(`MOCK: `, (pageWidth / 2) + 4, currentY + 5);
    doc.setFont('helvetica', 'bold');
    doc.text(`${currentSession.name}`, (pageWidth / 2) + 18, currentY + 5);
    
    currentY += 7;
    doc.line(margin + 2, currentY, pageWidth - margin - 2, currentY);
    
    doc.setFont('helvetica', 'normal');
    doc.text(`YEAR: `, margin + 4, currentY + 5);
    doc.setFont('helvetica', 'bold');
    doc.text(`${currentSession.academic_year}`, margin + 18, currentY + 5);
    
    doc.setFont('helvetica', 'normal');
    doc.text(`DATE: `, (pageWidth / 2) + 4, currentY + 5);
    doc.setFont('helvetica', 'bold');
    const today = new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    doc.text(`${today.toUpperCase()}`, (pageWidth / 2) + 18, currentY + 5);
    
    currentY += 7;
    doc.line(margin + 2, currentY, pageWidth - margin - 2, currentY);
    
    // Calculate Raw Score and Aggregate based on instructions:
    // Aggregate = Core Subjects Plus Two Best Subjects
    // Raw Score = Total Raw Score (Four Core Subjects)
    let aggregateStr = '-';
    let rawScoreStr = '-';

    if (result.subject_scores && result.subject_scores.length > 0) {
      // Define core subjects (usually by name or code)
      const coreSubjects = ['english language', 'mathematics', 'science', 'social studies'];
      
      let coreScoreSum = 0;
      let coreGradesSum = 0;
      let coreSubjectCount = 0;
      
      const otherGrades: number[] = [];

      // We need getGradeForScore here to calculate the aggregate
      const getGrade = (score: number | null | undefined): number => {
        if (score === null || score === undefined) return 9; // Worst grade
        if (gradingScalesData && gradingScalesData.length > 0) {
          const sorted = [...gradingScalesData].sort((a, b) => b.from_percentage - a.from_percentage);
          for (const scale of sorted) {
            if (score >= scale.from_percentage && score <= scale.to_percentage) {
              return parseInt(scale.grade) || 9;
            }
          }
        }
        if (score >= 80) return 1;
        if (score >= 70) return 2;
        if (score >= 60) return 3;
        if (score >= 55) return 4;
        if (score >= 50) return 5;
        if (score >= 45) return 6;
        if (score >= 40) return 7;
        if (score >= 35) return 8;
        return 9;
      };

      result.subject_scores.forEach(s => {
        const subName = s.subject_name.toLowerCase();
        const score = Number(s.total_score || 0);
        const grade = getGrade(score);

        const isCore = coreSubjects.some(core => subName.includes(core) || core.includes(subName));
        
        if (isCore) {
          coreScoreSum += score;
          coreGradesSum += grade;
          coreSubjectCount++;
        } else {
          otherGrades.push(grade);
        }
      });

      // Raw Score: Sum of ONLY the 4 core subjects
      if (coreSubjectCount > 0) {
        rawScoreStr = coreScoreSum.toString();
      }

      // Aggregate: 4 core subjects + best 2 other subjects
      // "Best" grade is visually lowest number (1 is best, 9 is worst)
      if (coreSubjectCount > 0) {
        const sortedOtherGrades = otherGrades.sort((a, b) => a - b);
        const bestTwoOtherGradesSum = (sortedOtherGrades[0] || 0) + (sortedOtherGrades[1] || 0);
        const totalAggregate = coreGradesSum + bestTwoOtherGradesSum;
        aggregateStr = totalAggregate.toString();
      }
    }

    doc.setFont('helvetica', 'normal');
    doc.text(`AGGREGATE: `, margin + 4, currentY + 5);
    doc.setFont('helvetica', 'bold');
    doc.text(`${aggregateStr}`, margin + 30, currentY + 5);
    
    doc.setFont('helvetica', 'normal');
    doc.text(`RAW SCORE: `, (pageWidth / 2) + 4, currentY + 5);
    doc.setFont('helvetica', 'bold');
    doc.text(`${rawScoreStr}`, (pageWidth / 2) + 30, currentY + 5);
    
    currentY += 7;
    doc.line(margin + 2, currentY, pageWidth - margin - 2, currentY);
    
    doc.setFillColor(235, 235, 235);
    doc.rect(margin + 2.1, currentY + 0.1, pageWidth - (margin * 2) - 4.2, 5.8, 'F');
    doc.line(pageWidth / 2, currentY, pageWidth / 2, currentY + 6);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(50, 50, 50);
    doc.text(`NB: Core Subjects Plus Two Best Subjects = Aggregate`, margin + 4, currentY + 4);
    doc.text(`Total Raw Score`, (pageWidth / 2) + 4, currentY + 4);
    
    currentY += 6;
    doc.line(margin + 2, currentY, pageWidth - margin - 2, currentY);
    
    currentY += 6;

    // 4. Subjects Table
    if (result.subject_scores && result.subject_scores.length > 0) {
      const getGradeForScore = (score: number | null | undefined): string => {
        if (score === null || score === undefined) return '-';
        if (gradingScalesData && gradingScalesData.length > 0) {
          const sorted = [...gradingScalesData].sort((a, b) => b.from_percentage - a.from_percentage);
          for (const scale of sorted) {
            if (score >= scale.from_percentage && score <= scale.to_percentage) {
              return scale.grade || '-';
            }
          }
        }
        if (score >= 80) return '1';
        if (score >= 70) return '2';
        if (score >= 60) return '3';
        if (score >= 55) return '4';
        if (score >= 50) return '5';
        if (score >= 45) return '6';
        if (score >= 40) return '7';
        if (score >= 35) return '8';
        return '9';
      };

      const getRemarkForScore = (score: number | null | undefined): string => {
        if (score === null || score === undefined) return '';
        if (gradingScalesData && gradingScalesData.length > 0) {
          const sorted = [...gradingScalesData].sort((a, b) => b.from_percentage - a.from_percentage);
          for (const scale of sorted) {
            if (score >= scale.from_percentage && score <= scale.to_percentage) {
              return scale.remark || '';
            }
          }
        }
        const grade = parseInt(getGradeForScore(score));
        switch(grade) {
          case 1: return 'Excellent';
          case 2: return 'Very Good';
          case 3: return 'Good';
          case 4: return 'Credit';
          case 5: return 'Credit';
          case 6: return 'Credit';
          case 7: return 'Pass';
          case 8: return 'Pass';
          case 9: return 'Fail';
          default: return '';
        }
      };

      const subjectTableHeaders = ['SUBJECT', 'SCORE\n(100 %)', 'GRADE IN\nSUBJECT', 'REMARKS'];
      
      const subjectTableBody = result.subject_scores.map((s) => [
        s.subject_name.toUpperCase(),
        s.total_score ?? '-',
        getGradeForScore(Number(s.total_score)),
        getRemarkForScore(Number(s.total_score)).toUpperCase(),
      ]);

      while (subjectTableBody.length < 9) {
        subjectTableBody.push(['', '', '', '']);
      }

      autoTable(doc, {
        startY: currentY,
        head: [subjectTableHeaders],
        body: subjectTableBody,
        theme: 'grid',
        styles: {
          fontSize: 10,
          cellPadding: 4,
          lineWidth: 0.2,
          lineColor: [0, 0, 0],
          textColor: [0, 0, 0]
        },
        headStyles: {
          fillColor: [240, 240, 240],
          textColor: [0, 0, 0],
          fontStyle: 'bold',
          halign: 'center',
          valign: 'middle',
          lineWidth: 0.2,
          lineColor: [0,0,0]
        },
        columnStyles: {
          0: { cellWidth: 65, halign: 'left' },
          1: { cellWidth: 25, halign: 'center', valign: 'middle' },
          2: { cellWidth: 25, halign: 'center', valign: 'middle' },
          3: { cellWidth: 67, halign: 'left', valign: 'middle' }
        },
        margin: { left: margin + 2, right: margin + 2 },
      });

      currentY = (doc as any).lastAutoTable?.finalY + 12 || currentY + 100;
    } else {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.text('No subject scores available', margin + 5, currentY + 10);
      currentY += 20;
    }

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    currentY += 8;
    doc.text(`Class Teacher's Remarks`, margin + 6, currentY);
    doc.setLineDashPattern([1, 2], 0);
    doc.line(margin + 48, currentY, pageWidth - margin - 6, currentY);
    doc.setLineDashPattern([], 0); 
    
    currentY += 10;
    doc.setLineDashPattern([1, 2], 0);
    doc.line(margin + 6, currentY, pageWidth - margin - 6, currentY);
    currentY += 10;
    doc.line(margin + 6, currentY, pageWidth - margin - 6, currentY);
    
    currentY += 15;
    doc.setLineDashPattern([], 0); 
    doc.text(`Headteacher's Signature`, margin + 6, currentY);
    doc.setLineDashPattern([1, 2], 0);
    
    // Attempt to load and embed the headteacher's signature
    if (schoolSettings?.headteacher_signature_url) {
      const signatureBase64 = await getImageAsBase64(schoolSettings.headteacher_signature_url);
      if (signatureBase64) {
        // Position signature above the dotted line
        doc.addImage(signatureBase64, 'PNG', margin + 48, currentY - 12, 40, 15);
      }
    }
    
    doc.line(margin + 48, currentY, pageWidth - margin - 6, currentY);
    doc.setLineDashPattern([], 0); 

    const fileName = `${result.student_name.replace(/\s+/g, '-')}-mock-result-${currentSession.name.replace(/\s+/g, '-')}.pdf`.toLowerCase();
    doc.save(fileName);
    toast({ title: "PDF Downloaded", description: `Result for ${result.student_name} downloaded successfully.` });
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
                  title="Average Total Score"
                  value={stats.avgScore}
                  icon={TrendingUp}
                  description="Sum of all subject scores"
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
                                <TableHead className="w-16">Rank</TableHead>
                                <TableHead>Student Name</TableHead>
                                <TableHead>Class</TableHead>
                                <TableHead className="text-right">Total Score</TableHead>
                                <TableHead className="text-right">Position</TableHead>
                                <TableHead className="text-center w-20">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filteredResults.map((result, index) => {
                                const rank = index + 1;
                                const className =
                                  allClasses.find((c) => c.id === result.class_id)?.name || "-";

                                return (
                                  <TableRow key={result.id}>
                                    <TableCell className="font-medium">{rank}</TableCell>
                                    <TableCell className="font-medium">
                                      {result.student_name}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                      {className}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      {(result as any).calculatedTotal || 0}
                                    </TableCell>
                                    <TableCell className="text-right font-semibold">
                                      {rank}
                                    </TableCell>
                                    <TableCell className="text-center">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleExportStudentPDF(result, rank)}
                                        title={`Download result for ${result.student_name}`}
                                      >
                                        <Download className="h-4 w-4" />
                                      </Button>
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
                    <div className="space-y-6">
                      {/* Grade Distribution by Subject Table */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Grade Distribution by Subject</CardTitle>
                          <CardDescription>
                            Count of students by grade for each subject
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm border-collapse">
                              <thead>
                                <tr className="bg-slate-200">
                                  <th className="border px-3 py-2 text-left font-semibold">Grade</th>
                                  {Object.keys(stats.gradeBySubject).map((subject) => (
                                    <th key={subject} className="border px-3 py-2 text-center font-semibold">
                                      {subject}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {(() => {
                                  // Always show all possible grades (from grading scales or 1-9)
                                  let allPossibleGrades: string[] = [];
                                  if (gradingScalesData && gradingScalesData.length > 0) {
                                    const gradeSet = new Set<string>();
                                    [...gradingScalesData]
                                      .sort((a, b) => b.from_percentage - a.from_percentage)
                                      .forEach(scale => gradeSet.add(scale.grade));
                                    allPossibleGrades = Array.from(gradeSet);
                                  } else {
                                    allPossibleGrades = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
                                  }

                                  // Make allPossibleGrades available for summary rows
                                  window.__allPossibleGrades = allPossibleGrades;

                                  return allPossibleGrades.map((grade, index) => (
                                    <tr key={`grade-${grade}`} className={index % 2 === 0 ? 'bg-slate-50' : ''}>
                                      <td className="border px-3 py-2 font-semibold">Grade {String(grade)}</td>
                                      {Object.keys(stats.gradeBySubject).map((subject) => (
                                        <td key={`${subject}-${grade}`} className="border px-3 py-2 text-center">
                                          {stats.gradeBySubject[subject][grade] || 0}
                                        </td>
                                      ))}
                                    </tr>
                                  ));
                                })()}
                                {/* Total No. of Students row */}
                                <tr className="bg-blue-100 font-semibold">
                                  <td className="border px-3 py-2">Total No. of Students</td>
                                  {Object.keys(stats.gradeBySubject).map((subject) => (
                                    <td key={`total-${subject}`} className="border px-3 py-2 text-center">
                                      {stats.totalStudents}
                                    </td>
                                  ))}
                                </tr>
                                {/* Best Grade row (lowest grade number with count > 0) */}
                                <tr className="bg-blue-100 font-semibold">
                                  <td className="border px-3 py-2">Best Grade</td>
                                  {Object.keys(stats.gradeBySubject).map((subject) => {
                                    // Find best grade (first one with count > 0 in sorted order)
                                    const allGradesForSubject = Object.keys(stats.gradeBySubject[subject]).sort((a, b) => {
                                      const aNum = parseInt(a);
                                      const bNum = parseInt(b);
                                      if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
                                      return a.localeCompare(b);
                                    });
                                    const bestGrade = allGradesForSubject.find(g => (stats.gradeBySubject[subject][g] || 0) > 0);
                                    return (
                                      <td key={`best-${subject}`} className="border px-3 py-2 text-center">
                                        {bestGrade || '-'}
                                      </td>
                                    );
                                  })}
                                </tr>
                                {/* Worst Grade row (highest grade number with count > 0) */}
                                <tr className="bg-blue-100 font-semibold">
                                  <td className="border px-3 py-2">Worst Grade</td>
                                  {Object.keys(stats.gradeBySubject).map((subject) => {
                                    // Find worst grade (last one with count > 0 in sorted order)
                                    const allGradesForSubject = Object.keys(stats.gradeBySubject[subject]).sort((a, b) => {
                                      const aNum = parseInt(a);
                                      const bNum = parseInt(b);
                                      if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
                                      return a.localeCompare(b);
                                    }).reverse();
                                    const worstGrade = allGradesForSubject.find(g => (stats.gradeBySubject[subject][g] || 0) > 0);
                                    return (
                                      <td key={`worst-${subject}`} className="border px-3 py-2 text-center">
                                        {worstGrade || '-'}
                                      </td>
                                    );
                                  })}
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </CardContent>
                      </Card>
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
    </div >
  );
}
