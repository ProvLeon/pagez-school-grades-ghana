import { useAuth } from "@/contexts/AuthContext";

interface TeacherProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * TeacherProtectedRoute - Ensures only teachers and admins can access teacher-specific routes
 *
 * This component is used to protect teacher-only routes like:
 * - /teacher/dashboard
 * - /teacher/results/add
 * - /teacher/results/manage
 *
 * Unlike ProtectedRoute which allows all authenticated users,
 * this component specifically checks for teacher or admin role.
 */
const TeacherProtectedRoute = ({ children }: TeacherProtectedRouteProps) => {
  const { isTeacher, isAdmin, loading, profileLoading, isAuthenticated } = useAuth();
  const disableAuth = import.meta.env.VITE_DISABLE_AUTH === "true";

  // If authentication is disabled, bypass all checks
  if (disableAuth) {
    return <>{children}</>;
  }

  // Show loading state while checking authentication or loading profile
  // This prevents showing "Access Denied" while the profile is still being fetched
  if (loading || (isAuthenticated && profileLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Verifying permissions...</p>
        </div>
      </div>
    );
  }

  // Allow access for teachers and admins
  // ProtectedRoute already handles authentication, so we only check roles here
  if (isTeacher || isAdmin) {
    return <>{children}</>;
  }

  // If user is neither teacher nor admin, show access denied
  // In practice, this shouldn't happen because ProtectedRoute catches unauthenticated users
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mb-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600 mb-6">
          This page is only accessible to teachers and administrators.
        </p>
        <button
          onClick={() => window.location.href = "/"}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default TeacherProtectedRoute;
