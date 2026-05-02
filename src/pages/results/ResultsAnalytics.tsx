import { useMemo, useState } from "react";
import { useResults, Result } from "@/hooks/useResults";
import { useTeacherResults } from "@/hooks/useTeacherResults";
import { useClasses } from "@/hooks/useClasses";
import { useDepartments } from "@/hooks/useDepartments";
import { useAuth } from "@/contexts/AuthContext";
import { useCanAccessClass } from "@/hooks/useTeacherClassAccess";
import { Header } from "@/components/Header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
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
  Legend,
  RadialBarChart,
  RadialBar,
  AreaChart,
  Area,
} from "recharts";
import {
  GraduationCap,
  TrendingUp,
  Users,
  BookOpen,
  Info,
  AlertCircle,
  ArrowLeft,
  Award,
  Target,
  Flame,
  BarChart3,
  PieChart as PieChartIcon,
  Layers,
  ChevronRight,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const calculateSubjectMarkScore = (mark: {
  ca1_score?: number | null;
  ca2_score?: number | null;
  ca3_score?: number | null;
  ca4_score?: number | null;
  exam_score?: number | null;
  total_score?: number | null;
}): number => {
  if (mark.total_score !== null && mark.total_score !== undefined && mark.total_score > 0) {
    return mark.total_score;
  }
  const ca1 = mark.ca1_score || 0;
  const ca2 = mark.ca2_score || 0;
  const ca3 = mark.ca3_score || 0;
  const ca4 = mark.ca4_score || 0;
  const exam = mark.exam_score || 0;
  return ca1 + ca2 + ca3 + ca4 + exam;
};

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

// ─── Shared Color Palette ─────────────────────────────────────────────────────

const GRADE_COLORS = {
  A: '#10B981',
  B: '#3B82F6',
  C: '#F59E0B',
  D: '#F97316',
  F: '#EF4444',
};

const CHART_GRADIENT_COLORS = [
  '#6366F1', '#8B5CF6', '#A78BFA', '#C4B5FD',
];

// ─── Premium Custom Tooltip ───────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl px-4 py-3 backdrop-blur-sm">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">{label}</p>
      {payload.map((entry: any, index: number) => (
        <p key={index} className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          {entry.name}: <span style={{ color: entry.color }}>{entry.value}%</span>
        </p>
      ))}
    </div>
  );
};

const CustomPieTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const data = payload[0];
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl px-4 py-3 backdrop-blur-sm">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">{data.name}</p>
      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
        Count: <span style={{ color: data.payload.color }}>{data.value}</span>
      </p>
    </div>
  );
};

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

const AnalyticsSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="rounded-2xl bg-white dark:bg-card border border-slate-100 dark:border-border p-5">
          <Skeleton className="h-3 w-20 mb-3" />
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[1, 2].map(i => (
        <div key={i} className="rounded-2xl bg-white dark:bg-card border border-slate-100 dark:border-border p-6">
          <Skeleton className="h-5 w-40 mb-2" />
          <Skeleton className="h-3 w-60 mb-6" />
          <Skeleton className="h-[280px] w-full rounded-xl" />
        </div>
      ))}
    </div>
  </div>
);

// ─── Metric Tile ──────────────────────────────────────────────────────────────

interface MetricTileProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  suffix?: string;
  accentClass: string;
  glowClass: string;
}

const MetricTile = ({ icon, label, value, suffix, accentClass, glowClass }: MetricTileProps) => (
  <div className={`relative overflow-hidden rounded-2xl bg-white dark:bg-card border border-slate-100 dark:border-border shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] p-5 flex flex-col justify-center group transition-all duration-300 ${accentClass}`}>
    <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl transition-colors ${glowClass}`} />
    <span className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-muted-foreground mb-1">
      {icon}
      {label}
    </span>
    <span className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
      {value}{suffix && <span className="text-xl text-slate-400 font-bold ml-0.5">{suffix}</span>}
    </span>
  </div>
);

// ─── Chart Section Wrapper ────────────────────────────────────────────────────

interface ChartSectionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}

const ChartSection = ({ icon, title, description, children, className = '' }: ChartSectionProps) => (
  <div className={`relative overflow-hidden rounded-2xl bg-white dark:bg-card border border-slate-100 dark:border-border shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] transition-all duration-300 ${className}`}>
    {/* Subtle accent blob */}
    <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50/30 dark:bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
    <div className="relative z-10 p-6">
      <div className="flex items-center gap-3 mb-1">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
          {icon}
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight">{title}</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500">{description}</p>
        </div>
      </div>
      <div className="mt-5">
        {children}
      </div>
    </div>
  </div>
);

// ─── Top Performers Table ─────────────────────────────────────────────────────

interface TopPerformer {
  name: string;
  className: string;
  score: number;
  photoUrl?: string;
}

const TopPerformersSection = ({ performers }: { performers: TopPerformer[] }) => {
  if (performers.length === 0) return null;

  return (
    <ChartSection
      icon={<Flame className="w-4 h-4 text-orange-500" />}
      title="Top Performers"
      description="Highest scoring students this period"
    >
      <div className="space-y-3">
        {performers.slice(0, 5).map((student, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 group hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all"
          >
            <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-500/20 dark:to-orange-500/20 text-amber-700 dark:text-amber-400 text-xs font-black">
              {idx + 1}
            </div>
            <div className="shrink-0 w-9 h-9 rounded-full overflow-hidden bg-indigo-50 dark:bg-indigo-500/10 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
              {student.photoUrl ? (
                <img src={student.photoUrl} alt={student.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-indigo-600 dark:text-indigo-400 font-bold text-sm uppercase">{student.name.charAt(0)}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{student.name}</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{student.className}</p>
            </div>
            <div className="shrink-0 text-right">
              <span className="text-lg font-black text-slate-800 dark:text-slate-100">{student.score}</span>
              <span className="text-xs text-slate-400 ml-0.5">%</span>
            </div>
          </div>
        ))}
      </div>
    </ChartSection>
  );
};

// ─── Shared Analytics Content ─────────────────────────────────────────────────

interface AnalyticsContentProps {
  analyticsData: {
    gradeDistribution: Array<{ name: string; value: number; color: string }>;
    classPerformance: Array<{ name: string; averageScore: number }>;
    subjectPerformance?: Array<{ name: string; averageScore: number }>;
    departmentStats?: Array<{ name: string; averageScore: number; count: number }>;
    totalResults: number;
    uniqueStudents: number;
    uniqueClasses: number;
    averageOverallScore: number;
    topPerformers: TopPerformer[];
    passRate: number;
  };
  showClassComparison?: boolean;
  showDepartments?: boolean;
}

const AnalyticsContent = ({ analyticsData, showClassComparison = true, showDepartments = false }: AnalyticsContentProps) => (
  <div className="space-y-6">
    {/* ── Metric Tiles ────────────────────────────────────────────────── */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      <MetricTile
        icon={<GraduationCap className="w-3.5 h-3.5 text-blue-500" />}
        label="Total Results"
        value={analyticsData.totalResults}
        accentClass="hover:border-blue-200 dark:hover:border-blue-500/30"
        glowClass="bg-blue-50 dark:bg-blue-500/5 group-hover:bg-blue-100 dark:group-hover:bg-blue-500/10"
      />
      <MetricTile
        icon={<Users className="w-3.5 h-3.5 text-emerald-500" />}
        label="Students Graded"
        value={analyticsData.uniqueStudents}
        accentClass="hover:border-emerald-200 dark:hover:border-emerald-500/30"
        glowClass="bg-emerald-50 dark:bg-emerald-500/5 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/10"
      />
      <MetricTile
        icon={<Target className="w-3.5 h-3.5 text-purple-500" />}
        label="Pass Rate"
        value={analyticsData.passRate}
        suffix="%"
        accentClass="hover:border-purple-200 dark:hover:border-purple-500/30"
        glowClass="bg-purple-50 dark:bg-purple-500/5 group-hover:bg-purple-100 dark:group-hover:bg-purple-500/10"
      />
      <MetricTile
        icon={<TrendingUp className="w-3.5 h-3.5 text-orange-500" />}
        label="Avg. Score"
        value={analyticsData.averageOverallScore}
        suffix="%"
        accentClass="hover:border-orange-200 dark:hover:border-orange-500/30"
        glowClass="bg-orange-50 dark:bg-orange-500/5 group-hover:bg-orange-100 dark:group-hover:bg-orange-500/10"
      />
    </div>

    {/* ── Primary Charts Row ──────────────────────────────────────────── */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Grade Distribution — Donut */}
      <ChartSection
        icon={<PieChartIcon className="w-4 h-4 text-indigo-500" />}
        title="Grade Distribution"
        description="Breakdown of grades across all results"
      >
        {analyticsData.gradeDistribution.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData.gradeDistribution}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={110}
                paddingAngle={3}
                strokeWidth={0}
                animationBegin={0}
                animationDuration={900}
                animationEasing="ease-out"
              >
                {analyticsData.gradeDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value: string) => (
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-sm text-slate-400">
            No grade data available
          </div>
        )}
      </ChartSection>

      {/* Top Performers */}
      <TopPerformersSection performers={analyticsData.topPerformers} />
    </div>

    {/* ── Department Performance (Admin only) ────────────────────────── */}
    {showDepartments && analyticsData.departmentStats && analyticsData.departmentStats.length > 0 && (
      <ChartSection
        icon={<Layers className="w-4 h-4 text-violet-500" />}
        title="Department Performance"
        description="Average scores compared across departments"
      >
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={analyticsData.departmentStats} barGap={8}>
            <defs>
              <linearGradient id="deptGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#6366F1" stopOpacity={0.7} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.5} />
            <XAxis
              dataKey="name"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }} />
            <Bar
              dataKey="averageScore"
              name="Avg Score"
              fill="url(#deptGrad)"
              radius={[8, 8, 0, 0]}
              maxBarSize={60}
              animationBegin={0}
              animationDuration={900}
              animationEasing="ease-out"
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartSection>
    )}

    {/* ── Subject Performance (Teacher) or Class Performance (Admin) ── */}
    {analyticsData.subjectPerformance && analyticsData.subjectPerformance.length > 0 && (
      <ChartSection
        icon={<BookOpen className="w-4 h-4 text-blue-500" />}
        title="Subject Performance"
        description="Average scores ranked by subject"
      >
        <ResponsiveContainer width="100%" height={Math.max(280, analyticsData.subjectPerformance.length * 48)}>
          <BarChart data={analyticsData.subjectPerformance} layout="vertical" barGap={4}>
            <defs>
              <linearGradient id="subjectGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#6366F1" stopOpacity={0.9} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" strokeOpacity={0.5} />
            <XAxis
              type="number"
              domain={[0, 100]}
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis
              type="category"
              dataKey="name"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              width={110}
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }} />
            <Bar
              dataKey="averageScore"
              name="Avg Score"
              fill="url(#subjectGrad)"
              radius={[0, 8, 8, 0]}
              maxBarSize={32}
              animationBegin={0}
              animationDuration={900}
              animationEasing="ease-out"
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartSection>
    )}

    {/* ── Class Comparison ────────────────────────────────────────────── */}
    {showClassComparison && analyticsData.classPerformance.length > 0 && (
      <ChartSection
        icon={<BarChart3 className="w-4 h-4 text-emerald-500" />}
        title="Class Comparison"
        description="Average performance across classes"
      >
        <ResponsiveContainer width="100%" height={Math.max(300, analyticsData.classPerformance.length * 46)}>
          <BarChart data={analyticsData.classPerformance} layout="vertical" barGap={4}>
            <defs>
              <linearGradient id="classGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#10B981" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#059669" stopOpacity={0.9} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" strokeOpacity={0.5} />
            <XAxis
              type="number"
              domain={[0, 100]}
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis
              type="category"
              dataKey="name"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              width={100}
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }} />
            <Bar
              dataKey="averageScore"
              name="Avg Score"
              fill="url(#classGrad)"
              radius={[0, 8, 8, 0]}
              maxBarSize={32}
              animationBegin={0}
              animationDuration={900}
              animationEasing="ease-out"
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartSection>
    )}
  </div>
);

// ─── Teacher Analytics ────────────────────────────────────────────────────────

const TeacherAnalytics = () => {
  const navigate = useNavigate();
  const { teacherRecord } = useAuth();
  const { getAssignedClasses, isLoading: accessLoading, hasLoaded, teacherId } = useCanAccessClass();
  const { data: teacherResults = [], isLoading: resultsLoading } = useTeacherResults();
  const [selectedClassId, setSelectedClassId] = useState<string>("all");

  const assignedClasses = getAssignedClasses();
  const isLoading = accessLoading || resultsLoading || !hasLoaded;

  const filteredResults = useMemo(() => {
    if (selectedClassId === "all") return teacherResults;
    return teacherResults.filter(r => r.class_id === selectedClassId);
  }, [teacherResults, selectedClassId]);

  const analyticsData = useMemo(() => {
    const resultsWithScores = filteredResults.map(result => ({
      ...result,
      calculatedScore: calculateResultAverageScore(result)
    }));

    const gradeDistribution = [
      { name: 'A (80-100)', value: 0, color: GRADE_COLORS.A },
      { name: 'B (70-79)', value: 0, color: GRADE_COLORS.B },
      { name: 'C (60-69)', value: 0, color: GRADE_COLORS.C },
      { name: 'D (50-59)', value: 0, color: GRADE_COLORS.D },
      { name: 'F (0-49)', value: 0, color: GRADE_COLORS.F },
    ];

    resultsWithScores.forEach(result => {
      const score = result.calculatedScore;
      if (score >= 80) gradeDistribution[0].value++;
      else if (score >= 70) gradeDistribution[1].value++;
      else if (score >= 60) gradeDistribution[2].value++;
      else if (score >= 50) gradeDistribution[3].value++;
      else gradeDistribution[4].value++;
    });

    // Subject performance
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
      .map(stat => ({ name: stat.name, averageScore: Math.round(stat.total / stat.count) }))
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
      .map(stat => ({ name: stat.name, averageScore: Math.round(stat.total / stat.count) }))
      .filter(c => c.averageScore > 0);

    // Top performers
    const topPerformers: TopPerformer[] = resultsWithScores
      .filter(r => r.calculatedScore > 0)
      .sort((a, b) => b.calculatedScore - a.calculatedScore)
      .slice(0, 5)
      .map(r => ({
        name: r.student?.full_name || 'Unknown',
        className: r.class?.name || '',
        score: Math.round(r.calculatedScore),
        photoUrl: r.student?.photo_url,
      }));

    // Pass rate
    const passed = resultsWithScores.filter(r => r.calculatedScore >= 50).length;
    const passRate = resultsWithScores.length > 0 ? Math.round((passed / resultsWithScores.length) * 100) : 0;

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
      averageOverallScore: overallAverage,
      topPerformers,
      passRate,
    };
  }, [filteredResults]);

  // No teacher record linked
  if (hasLoaded && !teacherId) {
    return (
      <div className="min-h-screen bg-transparent">
        <Header title="My Analytics" subtitle="View performance analytics for your classes" />
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
      <div className="min-h-screen bg-transparent">
        <Header title="My Analytics" subtitle="View performance analytics for your classes" />
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
    <div className="min-h-screen bg-transparent pb-12">
      <Header
        title="My Analytics"
        subtitle={`Performance analytics for ${teacherRecord?.full_name || 'Teacher'}`}
      />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Actions bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Button
            variant="outline"
            onClick={() => {
              if (window.history.state && window.history.state.idx > 0) {
                navigate(-1);
              } else {
                navigate('/results/manage-results');
              }
            }}
            className="rounded-xl border-slate-200 dark:border-border hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-medium text-slate-600 dark:text-slate-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Results
          </Button>

          {/* Class Filter */}
          {assignedClasses.length > 1 && (
            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
              <SelectTrigger className="w-full sm:w-[260px] rounded-xl border-slate-200 dark:border-border">
                <SelectValue placeholder="Filter by class" />
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
          )}
        </div>

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
          <AnalyticsContent
            analyticsData={analyticsData}
            showClassComparison={selectedClassId === "all" && analyticsData.classPerformance.length > 1}
          />
        )}
      </main>
    </div>
  );
};

// ─── Admin Analytics ──────────────────────────────────────────────────────────

const AdminAnalytics = () => {
  const navigate = useNavigate();
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
      return { name: dept.name, averageScore: Math.round(avgScore), count: deptResults.length };
    }).filter(d => d.count > 0);

    const gradeDistribution = [
      { name: 'A (80-100)', value: 0, color: GRADE_COLORS.A },
      { name: 'B (70-79)', value: 0, color: GRADE_COLORS.B },
      { name: 'C (60-69)', value: 0, color: GRADE_COLORS.C },
      { name: 'D (50-59)', value: 0, color: GRADE_COLORS.D },
      { name: 'F (0-49)', value: 0, color: GRADE_COLORS.F },
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
      return { name: cls.name, averageScore: Math.round(avgScore) };
    }).filter(c => c.averageScore > 0);

    // Top performers
    const topPerformers: TopPerformer[] = resultsWithScores
      .filter(r => r.calculatedScore > 0)
      .sort((a, b) => b.calculatedScore - a.calculatedScore)
      .slice(0, 5)
      .map(r => ({
        name: r.student?.full_name || 'Unknown',
        className: r.class?.name || '',
        score: Math.round(r.calculatedScore),
        photoUrl: r.student?.photo_url,
      }));

    // Pass rate
    const passed = resultsWithScores.filter(r => r.calculatedScore >= 50).length;
    const passRate = resultsWithScores.length > 0 ? Math.round((passed / resultsWithScores.length) * 100) : 0;

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
      averageOverallScore: overallAverage,
      topPerformers,
      passRate,
    };
  }, [results, classes, departments]);

  return (
    <div className="min-h-screen bg-transparent pb-12">
      <Header
        title="Results Analytics"
        subtitle="Comprehensive insights into student performance and academic trends"
      />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Action Bar */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => {
              if (window.history.state && window.history.state.idx > 0) {
                navigate(-1);
              } else {
                navigate('/results/manage-results');
              }
            }}
            className="rounded-xl border-slate-200 dark:border-border hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-medium text-slate-600 dark:text-slate-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Results
          </Button>
        </div>

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
          <AnalyticsContent
            analyticsData={analyticsData}
            showClassComparison
            showDepartments
          />
        )}
      </main>
    </div>
  );
};

// ─── Main Router ──────────────────────────────────────────────────────────────

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
