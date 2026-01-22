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

    // Grade distribution by subject (Grade 1-9)
    const gradeBySubject: Record<string, Record<number, number>> = {};
    filteredResults.forEach((r) => {
      r.subject_scores?.forEach((score) => {
        const subjectName = score.subject_name;
        const scoreValue = Number(score.total_score) || 0;

        // Calculate grade from score (1-9)
        let grade = 9;
        if (scoreValue >= 80) grade = 1;
        else if (scoreValue >= 70) grade = 2;
        else if (scoreValue >= 65) grade = 3;
        else if (scoreValue >= 60) grade = 4;
        else if (scoreValue >= 55) grade = 5;
        else if (scoreValue >= 50) grade = 6;
        else if (scoreValue >= 45) grade = 7;
        else if (scoreValue >= 35) grade = 8;

        if (!gradeBySubject[subjectName]) {
          gradeBySubject[subjectName] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
        }
        gradeBySubject[subjectName][grade]++;
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
  }, [filteredResults, allClasses]);

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

    // === PAGE 1: Summary Report ===
    let currentY = 15;

    // Header with border
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin - 4, 8, pageWidth - (margin * 2) + 8, 30, 2, 2);

    // School info (get from session or use default)
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...headerColor);
    doc.text('MOCK RESULTS', pageWidth / 2, currentY + 2, { align: 'center' });

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text(currentSession.name, pageWidth / 2, currentY + 8, { align: 'center' });

    doc.setFontSize(9);
    doc.text(`Academic Year: ${currentSession.academic_year} | Term: ${currentSession.term}`, pageWidth / 2, currentY + 13, { align: 'center' });
    doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, pageWidth / 2, currentY + 17, { align: 'center' });

    currentY = 40;

    // Summary info line
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    const avgTotal = Math.round(
      filteredResults.reduce((sum, r) => sum + ((r as any).calculatedTotal || 0), 0) / filteredResults.length
    );
    doc.text(`Total Students: ${stats.totalStudents} | Average Score: ${avgTotal}`, margin, currentY, { align: 'left' });

    currentY = 50;

    // Summary Table Header
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...headerColor);
    doc.text('RESULTS SUMMARY', margin, currentY);
    currentY += 5;

    // Main Results Table with all subject scores
    const tableHeaders = ['Student Name', ...subjectList, 'Raw Score', 'Agg.', 'Pos.'];
    const tableBody = filteredResults.map((r, index) => {
      const row: (string | number)[] = [r.student_name];

      // Add subject scores
      subjectList.forEach(subject => {
        const score = r.subject_scores?.find(s => s.subject_name === subject);
        row.push(score?.total_score || '-');
      });

      // Add summary columns
      row.push((r as any).calculatedTotal || 0); // Raw Score (total)
      row.push(r.position || '-'); // Aggregate
      row.push(index + 1); // Position (rank)

      return row;
    });

    autoTable(doc, {
      startY: currentY,
      head: [tableHeaders],
      body: tableBody,
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
      margin: { left: margin, right: margin },
    });

    // === PAGE 2: Detailed Results with All Subjects ===
    if (subjectList.length > 0) {
      doc.addPage();
      currentY = 15;

      // Header - School name and title
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...headerColor);
      doc.text('KOKOMLEMLE 2 BASIC SCHOOL', pageWidth / 2, currentY, { align: 'center' });

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(60, 60, 60);
      doc.text(`Mock Results – ${currentSession.name}`, pageWidth / 2, currentY + 6, { align: 'center' });

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.text(`Academic Year: ${currentSession.academic_year} | Term: ${currentSession.term}`, pageWidth / 2, currentY + 11, { align: 'center' });
      doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, pageWidth / 2, currentY + 15, { align: 'center' });

      const avgTotal = Math.round(
        filteredResults.reduce((sum, r) => sum + ((r as any).calculatedTotal || 0), 0) / filteredResults.length
      );
      doc.text(`Total Students: ${filteredResults.length} | Average Score: ${avgTotal}`, pageWidth / 2, currentY + 19, { align: 'center' });

      currentY = 38;

      // Create detailed results table with ALL subjects
      // Create detailed results table with all subjects - matching the screenshot format
      const detailedHeaders = ['Student Name', ...subjectList, 'Raw Score', 'Agg.', 'Pos.'];

      const detailedTableBody = filteredResults.map((r, index) => {
        const rank = index + 1;
        const row: (string | number)[] = [r.student_name];

        // Add ALL subject scores
        subjectList.forEach(subjectName => {
          const subjectScore = r.subject_scores?.find(s => s.subject_name === subjectName);
          row.push(subjectScore?.total_score ?? '-');
        });

        // Add summary columns
        row.push((r as any).calculatedTotal || 0); // Raw Score
        row.push(r.position || '-'); // Aggregate
        row.push(rank); // Position

        return row;
      });

      // Calculate column widths
      const numColumns = detailedHeaders.length;
      const studentNameWidth = 35;
      const rawScoreWidth = 18;
      const aggWidth = 15;
      const posWidth = 15;
      const fixedColumnsWidth = studentNameWidth + rawScoreWidth + aggWidth + posWidth;
      const availableWidth = pageWidth - margin * 2 - fixedColumnsWidth;
      const subjectColWidth = Math.max(11, availableWidth / subjectList.length);

      const detailedColumnStyles: { [key: number]: { cellWidth: number; halign?: 'center' | 'left' | 'right' } } = {
        0: { cellWidth: studentNameWidth, halign: 'left' }, // Student Name
      };

      // Add column styles for each subject
      for (let i = 1; i <= subjectList.length; i++) {
        detailedColumnStyles[i] = { cellWidth: subjectColWidth, halign: 'center' };
      }

      // Add column styles for summary columns
      const rawScoreIdx = subjectList.length + 1;
      detailedColumnStyles[rawScoreIdx] = { cellWidth: rawScoreWidth, halign: 'center' }; // Raw Score
      detailedColumnStyles[rawScoreIdx + 1] = { cellWidth: aggWidth, halign: 'center' }; // Agg
      detailedColumnStyles[rawScoreIdx + 2] = { cellWidth: posWidth, halign: 'center' }; // Pos

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
    }

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
    toast({ title: "PDF Exported", description: "Detailed results have been exported successfully." });
  };

  // Export individual student PDF
  const handleExportStudentPDF = (result: EnrichedMockExamResult, rank?: number) => {
    if (!currentSession) return;

    // Calculate rank if not provided (find the position in filtered results)
    const studentRank = rank !== undefined ? rank : filteredResults.findIndex(r => r.id === result.id) + 1;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;
    const primaryColor: [number, number, number] = [59, 130, 246];
    const headerColor: [number, number, number] = [30, 64, 175];

    let currentY = 15;

    // Header border
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.8);
    doc.roundedRect(margin - 4, 8, pageWidth - (margin * 2) + 8, 35, 2, 2);

    // Title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...headerColor);
    doc.text('MOCK EXAMINATION RESULT', pageWidth / 2, currentY + 5, { align: 'center' });

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text(currentSession.name, pageWidth / 2, currentY + 12, { align: 'center' });

    doc.setFontSize(9);
    doc.text(`Academic Year: ${currentSession.academic_year} | Term: ${currentSession.term}`, pageWidth / 2, currentY + 18, { align: 'center' });

    currentY = 50;

    // Student Info Card
    doc.setFillColor(240, 249, 255);
    doc.roundedRect(margin, currentY, pageWidth - margin * 2, 25, 2, 2, 'F');
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, currentY, pageWidth - margin * 2, 25, 2, 2);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text(result.student_name, margin + 5, currentY + 8);

    const studentClass = allClasses.find((c) => c.id === result.class_id)?.name || '-';
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(`Class: ${studentClass}`, margin + 5, currentY + 15);

    // Summary stats on right side of card
    const aggregate = result.position || 54;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...headerColor);
    doc.text(`Score: ${(result as any).calculatedTotal || 0}`, pageWidth - margin - 60, currentY + 10);
    doc.text(`Position: ${studentRank}`, pageWidth - margin - 60, currentY + 17);

    // Color badge based on rank
    const isGood = studentRank <= 3;
    const isAverage = studentRank <= Math.ceil(filteredResults.length / 2);
    doc.setFillColor(isGood ? 34 : isAverage ? 59 : 239, isGood ? 197 : isAverage ? 168 : 68, isGood ? 94 : isAverage ? 68 : 68);
    doc.roundedRect(pageWidth - margin - 25, currentY + 5, 20, 15, 2, 2, 'F');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text(String(studentRank), pageWidth - margin - 15, currentY + 15, { align: 'center' });

    currentY = 82;

    // Subject Scores Header
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...headerColor);
    doc.text('SUBJECT SCORES', margin, currentY);
    currentY += 5;

    // Subject Scores Table
    if (result.subject_scores && result.subject_scores.length > 0) {
      const subjectTableHeaders = ['No.', 'Subject', 'Exam Score', 'Total Score'];
      const subjectTableBody = result.subject_scores.map((s, idx) => [
        idx + 1,
        s.subject_name,
        s.exam_score ?? '-',
        s.total_score ?? '-',
      ]);

      autoTable(doc, {
        startY: currentY,
        head: [subjectTableHeaders],
        body: subjectTableBody,
        theme: 'grid',
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [45, 85, 170],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 8,
        },
        alternateRowStyles: {
          fillColor: [240, 240, 240],
        },
        margin: { left: margin, right: margin },
      });

      currentY = (doc as any).lastAutoTable?.finalY + 10 || currentY + 60;
    } else {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(120, 120, 120);
      doc.text('No subject scores available', margin, currentY + 10);
      currentY += 20;
    }

    // Summary Box
    doc.setFillColor(240, 249, 255);
    doc.roundedRect(margin, currentY, pageWidth - margin * 2, 30, 2, 2, 'F');
    doc.setDrawColor(...primaryColor);
    doc.roundedRect(margin, currentY, pageWidth - margin * 2, 30, 2, 2);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...headerColor);
    doc.text('OVERALL PERFORMANCE', margin + 5, currentY + 8);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text(`Total Score: ${(result as any).calculatedTotal || 0}`, margin + 5, currentY + 16);
    doc.text(`Aggregate: ${aggregate}`, margin + 5, currentY + 23);
    doc.text(`Status: ${studentRank <= 3 ? 'EXCELLENT' : studentRank <= Math.ceil(filteredResults.length / 2) ? 'GOOD' : 'NEEDS IMPROVEMENT'}`, margin + 80, currentY + 16);

    // Footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 120, 120);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, margin, pageHeight - 10);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('© e-Result System', pageWidth / 2, pageHeight - 10, { align: 'center' });

    const fileName = `${result.student_name.replace(/\s+/g, '-')}-mock-result-${currentSession.name.replace(/\s+/g, '-')}.pdf`.toLowerCase();
    doc.save(fileName);
    toast({ title: "PDF Downloaded", description: `Result for ${result.student_name} downloaded.` });
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
                            Count of students by grade (1-9) for each subject
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
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((grade) => (
                                  <tr key={`grade-${grade}`} className={grade % 2 === 0 ? 'bg-slate-50' : ''}>
                                    <td className="border px-3 py-2 font-semibold">Grade {String(grade)}</td>
                                    {Object.keys(stats.gradeBySubject).map((subject) => (
                                      <td key={`${subject}-${grade}`} className="border px-3 py-2 text-center">
                                        {stats.gradeBySubject[subject][grade as keyof typeof stats.gradeBySubject] || 0}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                                <tr className="bg-blue-100 font-semibold">
                                  <td className="border px-3 py-2">Total No. of Students</td>
                                  {Object.keys(stats.gradeBySubject).map((subject) => {
                                    const total = Object.values(stats.gradeBySubject[subject]).reduce((a, b) => a + b, 0);
                                    return (
                                      <td key={`total-${subject}`} className="border px-3 py-2 text-center">
                                        {total}
                                      </td>
                                    );
                                  })}
                                </tr>
                                <tr className="bg-blue-100 font-semibold">
                                  <td className="border px-3 py-2">Best Grade</td>
                                  {Object.keys(stats.gradeBySubject).map((subject) => {
                                    for (let g = 1; g <= 9; g++) {
                                      if ((stats.gradeBySubject[subject][g as keyof typeof stats.gradeBySubject] || 0) > 0) {
                                        return (
                                          <td key={`best-${subject}`} className="border px-3 py-2 text-center">
                                            {String(g)}
                                          </td>
                                        );
                                      }
                                    }
                                    return (
                                      <td key={`best-${subject}`} className="border px-3 py-2 text-center">
                                        -
                                      </td>
                                    );
                                  })}
                                </tr>
                                <tr className="bg-blue-100 font-semibold">
                                  <td className="border px-3 py-2">Worst Grade</td>
                                  {Object.keys(stats.gradeBySubject).map((subject) => {
                                    for (let g = 9; g >= 1; g--) {
                                      if ((stats.gradeBySubject[subject][g as keyof typeof stats.gradeBySubject] || 0) > 0) {
                                        return (
                                          <td key={`worst-${subject}`} className="border px-3 py-2 text-center">
                                            {String(g)}
                                          </td>
                                        );
                                      }
                                    }
                                    return (
                                      <td key={`worst-${subject}`} className="border px-3 py-2 text-center">
                                        -
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
    </div>
  );
}
