import { useAuth } from "@/contexts/AuthContext";
import { useLocation, Navigate } from "react-router-dom";
import { AlertCircle, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

// Define which routes each role can access
// If a route is not listed, it's accessible to all authenticated users
const ADMIN_ONLY_ROUTES = [
  '/classes',
  '/subjects',
  '/students/add-students', // Teachers can view students but not add them
  '/mock-exams',
  '/manage-sheets',
  '/manage-transfers',
  '/manage-teacher',
  '/settings',
  '/results/grading-settings',
];

// Check if a route requires admin access
const requiresAdminAccess = (pathname: string): boolean => {
  return ADMIN_ONLY_ROUTES.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  );
};

const ProtectedRoute = ({
  children,
  requireAdmin = false,
}: ProtectedRouteProps) => {
  const { userProfile, loading, profileLoading, isAdmin, isTeacher, isAuthenticated } = useAuth();
  const location = useLocation();

  const disableAuth = import.meta.env.VITE_DISABLE_AUTH === "true";

  if (disableAuth) {
    return <>{children}</>;
  }

  // Show loading while auth is initializing OR while profile is loading for authenticated users
  if (loading || (isAuthenticated && profileLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center space-y-6">
          {/* Logo with circular pulse animation */}
          <div className="relative flex justify-center">
            {/* Outer pulse rings */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-28 h-28 rounded-full border-2 border-blue-400/30 animate-ping" style={{ animationDuration: '2s' }} />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full border border-blue-300/20 animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} />
            </div>

            {/* Rotating ring around logo */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="w-24 h-24 rounded-full border-2 border-transparent border-t-blue-500 border-r-blue-400 animate-spin"
                style={{ animationDuration: '1.5s' }}
              />
            </div>

            {/* Logo container */}
            <div className="relative w-20 h-20 rounded-full overflow-hidden shadow-xl ring-4 ring-white dark:ring-gray-800 z-10">
              <img
                src="/ERESULTS_LOGO.png"
                alt="PB Pagez"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Text content */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Authenticating
              <span className="inline-flex ml-1">
                <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
              </span>
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Verifying your credentials
            </p>
          </div>

          {/* Version badge */}
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400">
            PB Pagez v{import.meta.env.VITE_APP_VERSION || "1.0.0"}
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if route requires admin and user is not admin
  const routeRequiresAdmin = requireAdmin || requiresAdminAccess(location.pathname);

  if (routeRequiresAdmin && !isAdmin) {
    // For teachers trying to access admin routes, show access denied
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <Card className="w-full max-w-lg shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                <AlertCircle className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Access Denied
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              You don't have permission to access this page
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="border-red-200 bg-red-50">
              <Shield className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-600">
                This page requires administrator privileges. Please contact your system administrator if you believe this is an error.
              </AlertDescription>
            </Alert>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Your Current Access Level:</h4>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                  {userProfile?.user_type || "Standard User"}
                </span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={() => window.history.back()} variant="outline" className="flex-1">
                Go Back
              </Button>
              <Button onClick={() => (window.location.href = "/")} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                Go to Dashboard
              </Button>
            </div>
            <div className="text-center text-xs text-gray-500 dark:text-gray-400">
              <p>Need access? Contact your administrator at</p>
              <a href={`mailto:${import.meta.env.VITE_ADMIN_EMAIL || "admin@pbpagez.com"}`} className="text-blue-600 hover:text-blue-700 underline">
                {import.meta.env.VITE_ADMIN_EMAIL || "admin@pbpagez.com"}
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
