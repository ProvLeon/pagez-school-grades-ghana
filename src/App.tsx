import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { WalkthroughProvider } from "@/contexts/WalkthroughContext";
import { WalkthroughOverlay, FloatingHelpButton } from "@/components/walkthrough";
import ErrorBoundary from "@/components/ErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";
import { SubscriptionOverlay } from "@/components/billing/SubscriptionOverlay";
import { TrialBanner } from "@/components/billing/TrialBanner";
import LoadingComp from "@/components/ui/loading";
import { getUserOrganizationId } from "@/utils/organizationHelper";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState, lazy, Suspense } from "react";

// ✅ LAZY LOAD all pages instead of static imports
const Index = lazy(() => import("./pages/Index"));
const NoOrganization = lazy(() => import("./pages/NoOrganization"));
const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Classes = lazy(() => import("./pages/Classes"));
const Subjects = lazy(() => import("./pages/Subjects"));
const Students = lazy(() => import("./pages/Students"));
const Results = lazy(() => import("./pages/Results"));
const ManageSheets = lazy(() => import("./pages/ManageSheets"));
const ManageTransfers = lazy(() => import("./pages/ManageTransfers"));
const ManageTeacher = lazy(() => import("./pages/ManageTeacher"));
const Settings = lazy(() => import("./pages/Settings"));
const ManageProfile = lazy(() => import("./pages/ManageProfile"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PublicReports = lazy(() => import("./pages/PublicReports"));
const PublicMockResults = lazy(() => import("./pages/PublicMockResults"));
const MockExams = lazy(() => import("./pages/MockExams"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const SignUp = lazy(() => import("./pages/SignUp"));

// Subject pages
const ManageSubjects = lazy(() => import("./pages/subjects/ManageSubjects"));
const ManageDepartments = lazy(() => import("./pages/subjects/ManageDepartments"));
const ManageCombinations = lazy(() => import("./pages/subjects/ManageCombinations"));

// Student pages
const AddStudents = lazy(() => import("./pages/students/AddStudents"));
const ManageStudents = lazy(() => import("./pages/students/ManageStudents"));

// Result pages
const AddResults = lazy(() => import("./pages/results/AddResults"));
const ManageResults = lazy(() => import("./pages/results/ManageResults"));
const ViewResult = lazy(() => import("./pages/results/ViewResult"));
const EditResult = lazy(() => import("./pages/results/EditResult"));
const GradingSettings = lazy(() => import("./pages/results/GradingSettings"));
const ResultsAnalytics = lazy(() => import("./pages/results/ResultsAnalytics"));

// Teacher pages - no longer needed, using unified Dashboard and Results pages
// import TeacherDashboard from "./pages/teacher/TeacherDashboard";
// import TeacherManageResults from "./pages/teacher/TeacherManageResults";

// Mock pages
const AddMockScores = lazy(() => import("./pages/mock/AddMockScores"));

// Create QueryClient with enhanced configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: Error | unknown) => {
        // Don't retry on 4xx errors except for 429 (rate limit)
        const httpError = error as { status?: number };
        if (httpError?.status >= 400 && httpError?.status < 500 && httpError?.status !== 429) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

// Layout wrapper component for protected routes
const AppLayout = ({ children }: { children: React.ReactNode }) => (
  <SidebarProvider>
    <div className="min-h-screen flex w-full max-w-none bg-background">
      <AppSidebar />
      <main className="flex-1 min-w-0 w-full">
        {children}
      </main>
    </div>
  </SidebarProvider>
);

// Protected route wrapper with layout and organization check
const ProtectedAppRoute = ({
  children,
  requireAdmin = false
}: {
  children: React.ReactNode;
  requireAdmin?: boolean;
}) => {
  const [checking, setChecking] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkOrg = async () => {
      // Skip check for settings page to avoid infinite loop for admins creating org
      if (location.pathname === '/settings') {
        setChecking(false);
        return;
      }

      try {
        const orgId = await getUserOrganizationId();

        if (!orgId) {
          // No organization found. Check user type.
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('user_type')
              .eq('user_id', user.id)
              .single();

            if (profile?.user_type === 'admin') {
              // Admin needs to create organization - redirect to settings
              // Use window.location to ensure fresh state
              window.location.href = '/settings?setup=required';
              return;
            } else {
              // Other users cannot fix this themselves - redirect to no-org page
              window.location.href = '/no-organization';
              return;
            }
          }
        }
      } catch (error) {
        console.error('Error checking organization:', error);
      } finally {
        setChecking(false);
      }
    };

    checkOrg();
  }, [location.pathname]);

  if (checking) {
    return <LoadingComp message="Loading Organization..." subtext="Please wait while we fetch your details" />;
  }

  return (
    <ProtectedRoute requireAdmin={requireAdmin}>
      <AppLayout>
        <TrialBanner />
        <SubscriptionOverlay />
        {children}
      </AppLayout>
    </ProtectedRoute>
  );
};

const ForceRedirect = ({ to }: { to: string }) => {
  useEffect(() => {
    window.location.replace(to);
  }, [to]);
  return null; // This component doesn't render anything itself
};

const RouteAwareHelpButton = () => {
  const location = useLocation();
  if (location.pathname === '/') return null;
  return <FloatingHelpButton />;
};

const PageLoader = () => (
  <LoadingComp message="Loading..." subtext="Please wait" />
);

const App = () => {
  const [hideAuthBanner, setHideAuthBanner] = useState<boolean>(() => {
    try {
      return localStorage.getItem("pagez_hide_auth_banner") === "1";
    } catch {
      return false;
    }
  });

  const disableAuth = false;

  useEffect(() => {
    // no-op: ensure client-side hydration before banner checks if needed
  }, []);
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Enhanced error logging
        console.error('Application Error:', { error, errorInfo });

        // You can send to monitoring service here
        if (import.meta.env.VITE_ENABLE_ANALYTICS === 'true') {
          // Example: sendToAnalytics('app_error', { error: error.message, stack: error.stack });
        }
      }}
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner
            position="top-right"
            expand={false}
            richColors
            closeButton
          />
          {disableAuth && !hideAuthBanner && (
            <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-400 text-black text-sm px-3 py-2 text-center shadow flex items-center justify-center gap-2">
              <span>Authentication is disabled (VITE_DISABLE_AUTH=true) — all routes are accessible</span>
              <button
                className="ml-2 rounded px-2 py-0.5 text-xs bg-black/10 hover:bg-black/20"
                onClick={() => {
                  try {
                    localStorage.setItem("pagez_hide_auth_banner", "1");
                  } catch {
                    // Ignore localStorage errors (e.g., in private browsing mode)
                  }
                  setHideAuthBanner(true);
                }}
                aria-label="Dismiss authentication disabled banner"
              >
                Close
              </button>
            </div>
          )}
          <BrowserRouter>
            <ThemeProvider>
              <AuthProvider>
                <WalkthroughProvider>
                  <WalkthroughOverlay />
                  <RouteAwareHelpButton />
                  <Suspense fallback={<PageLoader />}>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Index />} />
                    <Route path="/login" element={disableAuth ? <ForceRedirect to="/dashboard" /> : <Login />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/student-reports" element={<PublicReports />} />
                    <Route path="/mock-results" element={<PublicMockResults />} />
                    <Route path="/mock-results/:sessionId" element={<PublicMockResults />} />

                    {/* No Organization Route - Protected but no sidebar layout */}
                    <Route
                      path="/no-organization"
                      element={
                        <ProtectedRoute>
                          <NoOrganization />
                        </ProtectedRoute>
                      }
                    />

                    {/* Protected Routes */}
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedAppRoute>
                          <Dashboard />
                        </ProtectedAppRoute>
                      }
                    />

                    {/* Classes */}
                    <Route
                      path="/classes"
                      element={
                        <ProtectedAppRoute>
                          <Classes />
                        </ProtectedAppRoute>
                      }
                    />

                    {/* Subjects */}
                    <Route
                      path="/subjects"
                      element={
                        <ProtectedAppRoute>
                          <Subjects />
                        </ProtectedAppRoute>
                      }
                    />
                    <Route
                      path="/subjects/manage-subjects"
                      element={
                        <ProtectedAppRoute>
                          <ManageSubjects />
                        </ProtectedAppRoute>
                      }
                    />
                    <Route
                      path="/subjects/manage-departments"
                      element={
                        <ProtectedAppRoute requireAdmin>
                          <ManageDepartments />
                        </ProtectedAppRoute>
                      }
                    />
                    <Route
                      path="/subjects/manage-combinations"
                      element={
                        <ProtectedAppRoute>
                          <ManageCombinations />
                        </ProtectedAppRoute>
                      }
                    />

                    {/* Students */}
                    <Route
                      path="/students"
                      element={
                        <ProtectedAppRoute>
                          <Students />
                        </ProtectedAppRoute>
                      }
                    />
                    <Route
                      path="/students/add-students"
                      element={
                        <ProtectedAppRoute>
                          <AddStudents />
                        </ProtectedAppRoute>
                      }
                    />
                    <Route
                      path="/students/manage-students"
                      element={
                        <ProtectedAppRoute>
                          <ManageStudents />
                        </ProtectedAppRoute>
                      }
                    />

                    {/* Results */}
                    <Route
                      path="/results"
                      element={
                        <ProtectedAppRoute>
                          <Results />
                        </ProtectedAppRoute>
                      }
                    />
                    <Route
                      path="/results/add-results"
                      element={
                        <ProtectedAppRoute>
                          <AddResults />
                        </ProtectedAppRoute>
                      }
                    />
                    <Route
                      path="/results/manage-results"
                      element={
                        <ProtectedAppRoute>
                          <ManageResults />
                        </ProtectedAppRoute>
                      }
                    />
                    <Route
                      path="/results/view/:id"
                      element={
                        <ProtectedAppRoute>
                          <ViewResult />
                        </ProtectedAppRoute>
                      }
                    />
                    <Route
                      path="/results/edit/:id"
                      element={
                        <ProtectedAppRoute>
                          <EditResult />
                        </ProtectedAppRoute>
                      }
                    />
                    <Route
                      path="/results/grading-settings"
                      element={
                        <ProtectedAppRoute requireAdmin>
                          <GradingSettings />
                        </ProtectedAppRoute>
                      }
                    />
                    <Route
                      path="/results/analytics"
                      element={
                        <ProtectedAppRoute>
                          <ResultsAnalytics />
                        </ProtectedAppRoute>
                      }
                    />

                    {/* Mock Exams */}
                    <Route
                      path="/mock-exams"
                      element={
                        <ProtectedAppRoute>
                          <MockExams />
                        </ProtectedAppRoute>
                      }
                    />
                    <Route
                      path="/mock/add-scores"
                      element={
                        <ProtectedAppRoute>
                          <AddMockScores />
                        </ProtectedAppRoute>
                      }
                    />

                    {/* Management */}
                    <Route
                      path="/manage-sheets"
                      element={
                        <ProtectedAppRoute requireAdmin>
                          <ManageSheets />
                        </ProtectedAppRoute>
                      }
                    />
                    <Route
                      path="/manage-transfers"
                      element={
                        <ProtectedAppRoute requireAdmin>
                          <ManageTransfers />
                        </ProtectedAppRoute>
                      }
                    />
                    <Route
                      path="/manage-teacher"
                      element={
                        <ProtectedAppRoute requireAdmin>
                          <ManageTeacher />
                        </ProtectedAppRoute>
                      }
                    />

                    {/* Settings & Profile */}
                    <Route
                      path="/settings"
                      element={
                        <ProtectedAppRoute requireAdmin>
                          <Settings />
                        </ProtectedAppRoute>
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <ProtectedAppRoute>
                          <ManageProfile />
                        </ProtectedAppRoute>
                      }
                    />

                    {/* Legacy routes - redirect to unified routes */}
                    <Route path="/teacher/dashboard" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/teacher-dashboard" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/teacher/results/add" element={<Navigate to="/results/add-results" replace />} />
                    <Route path="/teacher/results/manage" element={<Navigate to="/results/manage-results" replace />} />
                    <Route path="/teacher/manage-results" element={<Navigate to="/results/manage-results" replace />} />

                    {/* Redirects */}
                    <Route path="/manage-profile" element={<Navigate to="/profile" replace />} />

                    {/* 404 - Keep this last */}
                    <Route path="*" element={disableAuth ? <ForceRedirect to="/dashboard" /> : <NotFound />} />
                  </Routes>
                    </Suspense>
                </WalkthroughProvider>
              </AuthProvider>
            </ThemeProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
