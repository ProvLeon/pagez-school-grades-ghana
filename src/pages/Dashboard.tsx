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
import { SystemStatus } from "@/components/dashboard/SystemStatus";
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
      {/* Teacher Welcome */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="text-xl">
            Welcome back, {teacherRecord?.full_name || 'Teacher'}!
          </CardTitle>
          <CardDescription>
            Here's an overview of your classes and results
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Teacher Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {teacherStats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions for Teachers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/results/add-results">
              <Button className="w-full justify-start" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Add New Results
              </Button>
            </Link>
            <Link to="/results/manage-results">
              <Button className="w-full justify-start" variant="outline">
                <TrendingUp className="h-4 w-4 mr-2" />
                View My Results
              </Button>
            </Link>
            <Link to="/profile">
              <Button className="w-full justify-start" variant="outline">
                <Users className="h-4 w-4 mr-2" />
                My Profile
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              My Classes
            </CardTitle>
            <CardDescription>Classes assigned to you</CardDescription>
          </CardHeader>
          <CardContent>
            {assignedClasses.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No classes assigned yet. Contact your administrator.
              </p>
            ) : (
              <div className="space-y-2">
                {assignedClasses.slice(0, 5).map((cls) => (
                  <div
                    key={cls.id}
                    className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
                  >
                    <span className="font-medium text-sm">{cls.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {cls.department?.name || 'No department'}
                    </span>
                  </div>
                ))}
                {assignedClasses.length > 5 && (
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    +{assignedClasses.length - 5} more classes
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
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
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3 space-y-6">
        <WelcomeSection />
        <DashboardStats stats={stats} />
        <PerformanceOverview />
      </div>
      <div className="lg:col-span-1 space-y-6">
        <QuickActions />
        <RecentActivity notifications={notifications} />
        <UpcomingEvents />
        <SystemStatus />
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
    // Check if user should see the welcome modal
    if (!loading && !hasCompletedWalkthrough() && !hasCompleted) {
      // Small delay to let the dashboard render first
      const timer = setTimeout(() => {
        setShowWelcome(true);
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
    <div className="min-h-screen bg-background">
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
