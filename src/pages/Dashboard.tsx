import { useState, useEffect } from "react";
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
  UserCheck
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

// Teacher-specific dashboard content
const TeacherDashboardContent = () => {
  const { teacherRecord } = useAuth();
  const { getAssignedClasses } = useCanAccessClass();
  const { data: teacherResults = [] } = useTeacherResults();

  const assignedClasses = getAssignedClasses();
  const totalResults = teacherResults.length;

  // Get unique students from results
  const uniqueStudents = new Set(teacherResults.map(r => r.student_id)).size;

  // Get current term results (assume current academic year)
  const currentYear = new Date().getFullYear();
  const academicYear = `${currentYear}/${currentYear + 1}`;
  const currentYearResults = teacherResults.filter(r => r.academic_year === academicYear).length;

  const teacherStats = [
    {
      title: "Assigned Classes",
      value: assignedClasses.length.toString(),
      icon: GraduationCap,
      description: "Classes you teach"
    },
    {
      title: "Results Submitted",
      value: totalResults.toString(),
      icon: FileText,
      description: "Total results entered"
    },
    {
      title: "Students Graded",
      value: uniqueStudents.toString(),
      icon: Users,
      description: "Unique students"
    },
    {
      title: "This Year",
      value: currentYearResults.toString(),
      icon: TrendingUp,
      description: academicYear
    }
  ];

  return (
    <div className="space-y-6">
      {/* Teacher Welcome - Elevated */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-[#0f172a] to-[#1e3a8a] p-8 shadow-lg shadow-blue-900/20">
        <div className="absolute -right-20 -top-20 z-0 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute inset-0 z-0 bg-[url('/grid-pattern.svg')] opacity-10 mix-blend-overlay" />
        
        <div className="relative z-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">{teacherRecord?.full_name || 'Teacher'}</span>!
          </h2>
          <p className="text-slate-300/80 max-w-xl text-sm">
            Here's your operational dashboard. Manage your classes, view pending assignments, and submit grades seamlessy.
          </p>
        </div>
      </div>

      {/* Elevated Teacher Stats */}
      <DashboardStats stats={teacherStats} />

      {/* Quick Actions for Teachers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-card p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 dark:border-border flex flex-col">
          <div className="mb-4 flex items-center gap-2 border-b border-slate-100 dark:border-border pb-4">
            <ClipboardList className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-card-foreground">Quick Actions</h3>
          </div>
          <div className="space-y-3 flex-1">
            <Link to="/results/add-results">
              <Button className="w-full justify-start mb-2 h-12 bg-blue-50/50 dark:bg-blue-500/10 hover:bg-blue-100/50 dark:hover:bg-blue-500/20 text-blue-900 dark:text-blue-100 border-none shadow-none transition-colors" variant="outline">
                <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-white dark:bg-slate-800 shadow-sm">
                  <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                Add New Results
              </Button>
            </Link>
            <Link to="/results/manage-results">
              <Button className="w-full justify-start mb-2 h-12 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border-none shadow-none transition-colors" variant="outline">
                <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-white dark:bg-slate-800 shadow-sm">
                  <TrendingUp className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                </div>
                View My Results
              </Button>
            </Link>
            <Link to="/profile">
              <Button className="w-full justify-start h-12 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border-none shadow-none transition-colors" variant="outline">
                <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-white dark:bg-slate-800 shadow-sm">
                  <Users className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                </div>
                My Profile
              </Button>
            </Link>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-card p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 dark:border-border flex flex-col">
          <div className="mb-4 flex items-center gap-2 border-b border-slate-100 dark:border-border pb-4 justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-card-foreground">My Classes</h3>
            </div>
          </div>
          <div className="flex-1">
            {assignedClasses.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center space-y-3 rounded-xl border border-dashed border-slate-200 dark:border-border bg-slate-50/50 dark:bg-background/50 p-6 text-center">
                <div className="rounded-full bg-slate-100 dark:bg-muted p-3">
                  <GraduationCap className="h-6 w-6 text-slate-400 dark:text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-slate-500 dark:text-muted-foreground">
                  No classes assigned yet. <br /> Contact your administrator.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {assignedClasses.slice(0, 5).map((cls) => (
                  <div
                    key={cls.id}
                    className="flex items-center justify-between p-3 bg-slate-50/80 dark:bg-muted/50 hover:bg-slate-100 dark:hover:bg-muted transition-colors rounded-xl border border-slate-100 dark:border-border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 font-bold text-xs">
                        {cls.name.charAt(0)}
                      </div>
                      <span className="font-semibold text-sm text-slate-800 dark:text-card-foreground">{cls.name}</span>
                    </div>
                    <span className="text-xs font-medium text-slate-500 dark:text-muted-foreground bg-white dark:bg-background px-2 py-1 rounded-md shadow-sm border border-slate-100 dark:border-border">
                      {cls.department?.name || 'No department'}
                    </span>
                  </div>
                ))}
                {assignedClasses.length > 5 && (
                  <p className="text-xs font-medium text-slate-400 dark:text-muted-foreground text-center mt-3 pt-2 border-t border-slate-50 dark:border-border">
                    +{assignedClasses.length - 5} more classes available
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

// Admin dashboard content
const AdminDashboardContent = () => {
  const { data: students = [] } = useStudents();
  const { data: classes = [] } = useClasses();
  const { data: departments = [] } = useDepartments();
  const { data: notifications = [] } = useNotifications();
  const { data: results = [] } = useResults();
  const { data: teachers = [] } = useTeachers();

  // Calculate real statistics
  const activeStudents = students.filter(s => !s.has_left).length;
  const activeTeachers = teachers.filter(t => t.is_active !== false).length;

  // Get unique students with results
  const studentsWithResults = new Set(results.map(r => r.student_id)).size;

  // Calculate term breakdown
  const termCounts = results.reduce((acc, r) => {
    acc[r.term] = (acc[r.term] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const termSummary = Object.entries(termCounts)
    .map(([term, count]) => `${term}: ${count}`)
    .join(', ') || 'No results yet';

  const stats = [
    {
      title: "Total Students",
      value: activeStudents.toString(),
      icon: Users,
      description: `${students.length - activeStudents} inactive`
    },
    {
      title: "Active Classes",
      value: classes.length.toString(),
      icon: GraduationCap,
      description: `Across ${departments.length} departments`
    },
    {
      title: "Teachers",
      value: activeTeachers.toString(),
      icon: UserCheck,
      description: `${teachers.length} total registered`
    },
    {
      title: "Results",
      value: results.length.toString(),
      icon: FileText,
      description: `${studentsWithResults} students graded`
    }
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
      <div className="xl:col-span-3 space-y-6">
        <WelcomeSection />
        <DashboardStats stats={stats} />
        <PerformanceOverview />
      </div>
      <div className="xl:col-span-1 space-y-6 flex flex-col">
        <QuickActions />
        <RecentActivity notifications={notifications} />
        <UpcomingEvents />
      </div>
    </div>
  );
};

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
    <div className="min-h-screen bg-slate-50/50 dark:bg-background">
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
