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

const ProtectedRoute = ({
  children,
  requireAdmin = false,
}: ProtectedRouteProps) => {
  const { user, userProfile, loading, isAdmin, isAuthenticated } = useAuth();
  const location = useLocation();

  const disableAuth = import.meta.env.VITE_DISABLE_AUTH === "true";

  if (disableAuth) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Shield className="w-8 h-8 text-white animate-pulse" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Authenticating...
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Verifying your credentials and permissions
                </p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: "60%" }}></div>
              </div>
              <div className="text-xs text-gray-500">
                PB Pagez v{import.meta.env.VITE_APP_VERSION || "1.0.0"}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
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