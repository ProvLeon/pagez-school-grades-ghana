
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import {
  Users,
  GraduationCap,
  BookOpen,
  FileText
} from "lucide-react";
import { useStudents } from "@/hooks/useStudents";
import { useClasses } from "@/hooks/useClasses";
import { useDepartments } from "@/hooks/useDepartments";
import { useNotifications } from "@/hooks/useNotifications";
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
import { Navigate } from "react-router-dom";
import { hasCompletedWalkthrough } from "@/data/walkthroughSteps";

const Dashboard = () => {
  const { isTeacher, isAdmin, loading, user } = useAuth();
  const { hasCompleted } = useWalkthrough();
  const { data: students = [] } = useStudents();
  const { data: classes = [] } = useClasses();
  const { data: departments = [] } = useDepartments();
  const { data: notifications = [] } = useNotifications();

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

  // Redirect teachers to their dedicated dashboard (after all hooks)
  if (!loading && isTeacher && !isAdmin) {
    return <Navigate to="/teacher-dashboard" replace />;
  }

  const stats = [
    {
      title: "Total Students",
      value: students.length.toString(),
      icon: Users,
      trend: { value: "12%", isPositive: true }
    },
    {
      title: "Active Classes",
      value: classes.length.toString(),
      icon: GraduationCap,
      trend: { value: "3%", isPositive: true }
    },
    {
      title: "Departments",
      value: departments.length.toString(),
      icon: BookOpen
    },
    {
      title: "Results Processed",
      value: "0",
      icon: FileText,
      trend: { value: "8%", isPositive: true }
    }
  ];

  // Get user's first name for welcome modal (extract from email or metadata)
  const userName = user?.user_metadata?.full_name?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "there";

  return (
    <div className="min-h-screen bg-background">
      {/* Welcome Modal for first-time users */}
      <WelcomeModal
        open={showWelcome}
        onOpenChange={setShowWelcome}
        userName={userName}
      />

      <Header title="Dashboard" subtitle="Welcome to your Academic Command Center" />
      <main className="container mx-auto px-4 py-6 md:py-8 space-y-6">
        {/* Main Content Grid */}
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
      </main>
    </div>
  );
};

export default Dashboard;
