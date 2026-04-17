import { useState, useEffect, useMemo } from "react";
import { Header } from "@/components/Header";
import {
  Users,
  GraduationCap,
  BookOpen,
  FileText,
  ClipboardList,
  TrendingUp,
  Clock,
  CheckCircle,
  UserCheck,
  ArrowUpRight,
  CalendarDays,
  Sparkles,
  Award,
  BarChart3,
  Layers,
} from "lucide-react";
import { useStudents } from "@/hooks/useStudents";
import { useClasses } from "@/hooks/useClasses";
import { useDepartments } from "@/hooks/useDepartments";
import { useNotifications } from "@/hooks/useNotifications";
import { useResults } from "@/hooks/useResults";
import { useTeachers } from "@/hooks/useTeachers";
import { WelcomeSection } from "@/components/dashboard/WelcomeSection";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { PerformanceOverview } from "@/components/dashboard/PerformanceOverview";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { UpcomingEvents } from "@/components/dashboard/UpcomingEvents";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { useAuth } from "@/contexts/AuthContext";
import { useWalkthrough } from "@/contexts/WalkthroughContext";
import { WelcomeModal } from "@/components/walkthrough";
import { hasCompletedWalkthrough } from "@/data/walkthroughSteps";
import { useCanAccessClass } from "@/hooks/useTeacherClassAccess";
import { useTeacherResults } from "@/hooks/useTeacherResults";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";

// ─── Greeting Helper ──────────────────────────────────────────────────────────

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

// ─── Hero Welcome Banner ──────────────────────────────────────────────────────

const HeroWelcome = ({ name, subtitle }: { name: string; subtitle: string }) => {
  const currentDate = format(new Date(), "EEEE, MMMM d, yyyy");

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:via-[#0f172a] dark:to-[#1e3a8a] border border-slate-100 dark:border-transparent p-7 sm:p-8 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] dark:shadow-xl dark:shadow-blue-900/10">
      {/* Ambient glow blobs */}
      <div className="absolute -right-16 -top-16 w-56 h-56 bg-indigo-50 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-12 -bottom-12 w-40 h-40 bg-blue-50 dark:bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03] dark:opacity-[0.06] mix-blend-multiply dark:mix-blend-overlay pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs sm:text-sm font-medium text-indigo-400/80 dark:text-blue-300/70 tracking-wide mb-1 flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5" />
            {currentDate}
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            {getGreeting()},{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-blue-200 dark:to-white">
              {name}
            </span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-lg text-sm mt-1.5">{subtitle}</p>
        </div>

        <Link
          to="/results/analytics"
          className="shrink-0 flex items-center gap-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-white/10 dark:hover:bg-white/[0.15] backdrop-blur-sm border border-indigo-100 dark:border-white/10 px-4 py-2.5 text-sm font-semibold text-indigo-700 dark:text-white transition-all duration-200"
        >
          <BarChart3 className="w-4 h-4" />
          View Analytics
          <ArrowUpRight className="w-3.5 h-3.5 opacity-50" />
        </Link>
      </div>
    </div>
  );
};

// ─── Metric Tile (shared) ─────────────────────────────────────────────────────

interface MetricTileProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  footnote?: string;
  accentColor: string;
  glowBg: string;
}

const MetricTile = ({ icon, label, value, footnote, accentColor, glowBg }: MetricTileProps) => (
  <div className={`relative overflow-hidden rounded-2xl bg-white dark:bg-card border border-slate-100 dark:border-border shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] p-5 sm:p-6 flex flex-col justify-between group transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${accentColor}`}>
    <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl transition-colors pointer-events-none ${glowBg}`} />
    <div className="relative z-10">
      <span className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-muted-foreground mb-1.5">
        {icon}
        {label}
      </span>
      <span className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight leading-none">
        {value}
      </span>
      {footnote && (
        <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-2">{footnote}</p>
      )}
    </div>
  </div>
);

// ─── Teacher Dashboard ────────────────────────────────────────────────────────

const TeacherDashboardContent = () => {
  const navigate = useNavigate();
  const { teacherRecord } = useAuth();
  const { getAssignedClasses } = useCanAccessClass();
  const { data: teacherResults = [] } = useTeacherResults();

  const assignedClasses = getAssignedClasses();
  const totalResults = teacherResults.length;
  const uniqueStudents = new Set(teacherResults.map(r => r.student_id)).size;
  const currentYear = new Date().getFullYear();
  const academicYear = `${currentYear}/${currentYear + 1}`;
  const currentYearResults = teacherResults.filter(r => r.academic_year === academicYear).length;

  const teacherName = teacherRecord?.full_name?.split(" ")[0] || "Teacher";

  return (
    <div className="space-y-6">
      {/* Hero Welcome */}
      <HeroWelcome
        name={teacherName}
        subtitle="Here's your operational dashboard. Manage your classes, view pending assignments, and submit grades."
      />

      {/* Metric Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <MetricTile
          icon={<GraduationCap className="w-3.5 h-3.5 text-blue-500" />}
          label="Assigned Classes"
          value={assignedClasses.length.toString()}
          footnote="Classes you teach"
          accentColor="hover:border-blue-200 dark:hover:border-blue-500/30"
          glowBg="bg-blue-50 dark:bg-blue-500/5 group-hover:bg-blue-100 dark:group-hover:bg-blue-500/10"
        />
        <MetricTile
          icon={<FileText className="w-3.5 h-3.5 text-emerald-500" />}
          label="Results Submitted"
          value={totalResults.toString()}
          footnote="Total results entered"
          accentColor="hover:border-emerald-200 dark:hover:border-emerald-500/30"
          glowBg="bg-emerald-50 dark:bg-emerald-500/5 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/10"
        />
        <MetricTile
          icon={<Users className="w-3.5 h-3.5 text-purple-500" />}
          label="Students Graded"
          value={uniqueStudents.toString()}
          footnote="Unique students"
          accentColor="hover:border-purple-200 dark:hover:border-purple-500/30"
          glowBg="bg-purple-50 dark:bg-purple-500/5 group-hover:bg-purple-100 dark:group-hover:bg-purple-500/10"
        />
        <MetricTile
          icon={<TrendingUp className="w-3.5 h-3.5 text-orange-500" />}
          label="This Year"
          value={currentYearResults.toString()}
          footnote={academicYear}
          accentColor="hover:border-orange-200 dark:hover:border-orange-500/30"
          glowBg="bg-orange-50 dark:bg-orange-500/5 group-hover:bg-orange-100 dark:group-hover:bg-orange-500/10"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-card p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 dark:border-border">
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-50/30 dark:bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="relative z-10">
            <div className="mb-5 flex items-center gap-2 border-b border-slate-100 dark:border-border pb-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10">
                <ClipboardList className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-card-foreground">Quick Actions</h3>
            </div>
            <div className="space-y-2.5">
              {[
                { to: '/results/add-results', icon: FileText, label: 'Add New Results', desc: 'Record student marks', color: 'blue' },
                { to: '/results/manage-results', icon: TrendingUp, label: 'View My Results', desc: 'Manage & download', color: 'indigo' },
                { to: '/profile', icon: Users, label: 'My Profile', desc: 'Account settings', color: 'slate' },
              ].map((action) => (
                <Link key={action.to} to={action.to}>
                  <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-700/50 transition-all text-left group/btn hover:-translate-y-0.5 hover:shadow-md">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-${action.color}-50 dark:bg-${action.color}-500/10 transition-transform group-hover/btn:scale-110`}>
                      <action.icon className={`h-4 w-4 text-${action.color}-600 dark:text-${action.color}-400`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="block font-semibold text-sm text-slate-800 dark:text-slate-100">{action.label}</span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">{action.desc}</span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-300 dark:text-slate-600 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                  </button>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Assigned Classes */}
        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-card p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 dark:border-border">
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-50/30 dark:bg-indigo-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />
          <div className="relative z-10">
            <div className="mb-5 flex items-center gap-2 border-b border-slate-100 dark:border-border pb-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10">
                <GraduationCap className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-card-foreground">My Classes</h3>
            </div>

            {assignedClasses.length === 0 ? (
              <div className="flex flex-col items-center justify-center space-y-3 rounded-xl border border-dashed border-slate-200 dark:border-border bg-slate-50/50 dark:bg-background/50 p-8 text-center">
                <div className="rounded-full bg-slate-100 dark:bg-muted p-3">
                  <GraduationCap className="h-6 w-6 text-slate-400 dark:text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-slate-500 dark:text-muted-foreground">
                  No classes assigned yet. <br /> Contact your administrator.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {assignedClasses.slice(0, 5).map((cls) => (
                  <div
                    key={cls.id}
                    className="flex items-center justify-between p-3 bg-slate-50/80 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all rounded-xl border border-slate-100 dark:border-slate-700/50 group/cls hover:-translate-y-0.5 hover:shadow-sm cursor-pointer"
                    onClick={() => navigate(`/results/manage-results?class=${cls.id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-bold text-xs transition-transform group-hover/cls:scale-110">
                        {cls.name.charAt(0)}
                      </div>
                      <span className="font-semibold text-sm text-slate-800 dark:text-card-foreground">{cls.name}</span>
                    </div>
                    <span className="text-[11px] font-medium text-slate-400 dark:text-muted-foreground bg-white dark:bg-background px-2 py-1 rounded-md border border-slate-100 dark:border-border shadow-sm">
                      {cls.department?.name || 'No dept'}
                    </span>
                  </div>
                ))}
                {assignedClasses.length > 5 && (
                  <p className="text-xs font-medium text-slate-400 dark:text-muted-foreground text-center mt-3 pt-2 border-t border-slate-100 dark:border-border">
                    +{assignedClasses.length - 5} more classes
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Admin Dashboard ──────────────────────────────────────────────────────────

const AdminDashboardContent = () => {
  const { user, userProfile } = useAuth();
  const { data: students = [] } = useStudents();
  const { data: classes = [] } = useClasses();
  const { data: departments = [] } = useDepartments();
  const { data: notifications = [] } = useNotifications();
  const { data: results = [] } = useResults();
  const { data: teachers = [] } = useTeachers();

  // Calculate real statistics
  const activeStudents = students.filter(s => !s.has_left).length;
  const activeTeachers = teachers.filter(t => t.is_active !== false).length;
  const studentsWithResults = new Set(results.map(r => r.student_id)).size;

  const adminName = (() => {
    if (userProfile?.full_name) return userProfile.full_name.split(" ")[0];
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name.split(" ")[0];
    if (user?.email) return user.email.split('@')[0];
    return "Admin";
  })();

  return (
    <div className="space-y-6">
      {/* Hero Welcome */}
      <HeroWelcome
        name={adminName}
        subtitle="Here's a comprehensive overview of your school's academic operations and performance."
      />

      {/* Metric Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <MetricTile
          icon={<Users className="w-3.5 h-3.5 text-blue-500" />}
          label="Total Students"
          value={activeStudents.toString()}
          footnote={`${students.length - activeStudents} inactive`}
          accentColor="hover:border-blue-200 dark:hover:border-blue-500/30"
          glowBg="bg-blue-50 dark:bg-blue-500/5 group-hover:bg-blue-100 dark:group-hover:bg-blue-500/10"
        />
        <MetricTile
          icon={<GraduationCap className="w-3.5 h-3.5 text-emerald-500" />}
          label="Active Classes"
          value={classes.length.toString()}
          footnote={`Across ${departments.length} departments`}
          accentColor="hover:border-emerald-200 dark:hover:border-emerald-500/30"
          glowBg="bg-emerald-50 dark:bg-emerald-500/5 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/10"
        />
        <MetricTile
          icon={<UserCheck className="w-3.5 h-3.5 text-purple-500" />}
          label="Teachers"
          value={activeTeachers.toString()}
          footnote={`${teachers.length} total registered`}
          accentColor="hover:border-purple-200 dark:hover:border-purple-500/30"
          glowBg="bg-purple-50 dark:bg-purple-500/5 group-hover:bg-purple-100 dark:group-hover:bg-purple-500/10"
        />
        <MetricTile
          icon={<FileText className="w-3.5 h-3.5 text-orange-500" />}
          label="Results"
          value={results.length.toString()}
          footnote={`${studentsWithResults} students graded`}
          accentColor="hover:border-orange-200 dark:hover:border-orange-500/30"
          glowBg="bg-orange-50 dark:bg-orange-500/5 group-hover:bg-orange-100 dark:group-hover:bg-orange-500/10"
        />
      </div>

      {/* Quick Actions — Compact horizontal row */}
      <QuickActions />

      {/* Analytical Grid — Asymmetric Bento */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Charts */}
        <div className="xl:col-span-2 space-y-6">
          <PerformanceOverview />
        </div>

        {/* Right Column: Activity + Events */}
        <div className="xl:col-span-1 space-y-6">
          <RecentActivity notifications={notifications} />
          <UpcomingEvents />
        </div>
      </div>
    </div>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────

const Dashboard = () => {
  const { isTeacher, isAdmin, loading, user, userProfile } = useAuth();
  const { hasCompleted } = useWalkthrough();

  // Show welcome modal for first-time users
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    // Check if user should see the welcome modal - only show once per session
    // and only if the walkthrough has never been completed
    if (!loading && !hasCompletedWalkthrough() && !hasCompleted && !sessionStorage.getItem('welcome_shown')) {
      // Small delay to let the dashboard render first
      const timer = setTimeout(() => {
        setShowWelcome(true);
        sessionStorage.setItem('welcome_shown', 'true');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [loading, hasCompleted]);

  // Get user's first name for welcome modal
  const userName = user?.user_metadata?.full_name?.split(" ")[0] ||
    userProfile?.user_id?.split("@")[0] ||
    user?.email?.split("@")[0] ||
    "there";

  // Determine dashboard subtitle based on role
  const getSubtitle = () => {
    if (isAdmin) return "Welcome to your Academic Command Center";
    if (isTeacher) return "Manage your classes and student results";
    return "Welcome to your dashboard";
  };

  return (
    <div className="min-h-screen bg-transparent pb-12">
      {/* Welcome Modal for first-time users */}
      <WelcomeModal
        open={showWelcome}
        onOpenChange={setShowWelcome}
        userName={userName}
      />

      <Header
        title="Dashboard"
        subtitle={getSubtitle()}
      />

      <main className="container mx-auto px-4 py-6 md:py-8 space-y-6">
        {/* Show role-appropriate content */}
        {isTeacher && !isAdmin ? (
          <TeacherDashboardContent />
        ) : (
          <AdminDashboardContent />
        )}
      </main>
    </div>
  );
};

export default Dashboard;
