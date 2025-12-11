import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { WalkthroughProvider } from "@/contexts/WalkthroughContext";
import { WalkthroughOverlay, FloatingHelpButton } from "@/components/walkthrough";
import ErrorBoundary from "@/components/ErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";
import TeacherProtectedRoute from "@/components/TeacherProtectedRoute";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Classes from "./pages/Classes";
import Subjects from "./pages/Subjects";
import Students from "./pages/Students";
import Results from "./pages/Results";
import ManageSheets from "./pages/ManageSheets";
import ManageTransfers from "./pages/ManageTransfers";
import ManageTeacher from "./pages/ManageTeacher";
import Settings from "./pages/Settings";
import ManageProfile from "./pages/ManageProfile";
import NotFound from "./pages/NotFound";
import PublicReports from "./pages/PublicReports";
import MockExams from "./pages/MockExams";

// Subject pages
import ManageSubjects from "./pages/subjects/ManageSubjects";
import ManageDepartments from "./pages/subjects/ManageDepartments";
import ManageCombinations from "./pages/subjects/ManageCombinations";

// Student pages
import AddStudents from "./pages/students/AddStudents";
import ManageStudents from "./pages/students/ManageStudents";

// Result pages
import AddResults from "./pages/results/AddResults";
import ManageResults from "./pages/results/ManageResults";
import ViewResult from "./pages/results/ViewResult";
import EditResult from "./pages/results/EditResult";
import GradingSettings from "./pages/results/GradingSettings";
import ResultsAnalytics from "./pages/results/ResultsAnalytics";

// Teacher pages
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherManageResults from "./pages/teacher/TeacherManageResults";

// Mock pages
import AddMockScores from "./pages/mock/AddMockScores";
import { useEffect, useState } from "react";

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

// Protected route wrapper with layout
const ProtectedAppRoute = ({
  children,
  requireAdmin = false
}: {
  children: React.ReactNode;
  requireAdmin?: boolean;
}) => (
  <ProtectedRoute requireAdmin={requireAdmin}>
    <AppLayout>
      {children}
    </AppLayout>
  </ProtectedRoute>
);

const ForceRedirect = ({ to }: { to: string }) => {
  useEffect(() => {
    window.location.replace(to);
  }, [to]);
  return null; // This component doesn't render anything itself
};

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
          <ThemeProvider>
            <AuthProvider>
              <BrowserRouter>
                <WalkthroughProvider>
                  <WalkthroughOverlay />
                  <FloatingHelpButton />
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={disableAuth ? <ForceRedirect to="/" /> : <Login />} />
                    <Route path="/student-reports" element={<PublicReports />} />

                    {/* Protected Routes */}
                    <Route
                      path="/"
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

                    {/* Teacher Dashboard */}
                    <Route
                      path="/teacher-dashboard"
                      element={
                        <ProtectedRoute>
                          <TeacherProtectedRoute>
                            <AppLayout>
                              <TeacherDashboard />
                            </AppLayout>
                          </TeacherProtectedRoute>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/teacher/manage-results"
                      element={
                        <ProtectedRoute>
                          <TeacherProtectedRoute>
                            <AppLayout>
                              <TeacherManageResults />
                            </AppLayout>
                          </TeacherProtectedRoute>
                        </ProtectedRoute>
                      }
                    />

                    {/* Redirects */}
                    <Route path="/dashboard" element={<Navigate to="/" replace />} />

                    {/* 404 - Keep this last */}
                    <Route path="*" element={disableAuth ? <ForceRedirect to="/" /> : <NotFound />} />
                  </Routes>
                </WalkthroughProvider>
              </BrowserRouter>
            </AuthProvider>
          </ThemeProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
