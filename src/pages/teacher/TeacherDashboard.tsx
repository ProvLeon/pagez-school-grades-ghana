import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { useCanAccessClass } from "@/hooks/useTeacherClassAccess";
import { useTeacherResults } from "@/hooks/useTeacherResults";
import { FileText, GraduationCap, Users, TrendingUp, User, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { teacherRecord } = useAuth();
  const { getAssignedClasses, assignments } = useCanAccessClass();
  const { data: teacherResults = [] } = useTeacherResults();
  
  const assignedClasses = getAssignedClasses();
  const totalStudents = 0; // Will be calculated from actual student data
  const approvedResults = teacherResults.filter(r => r.admin_approved).length;
  const pendingResults = teacherResults.filter(r => !r.admin_approved).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-blue-200">
      <Header 
        title="Teacher Dashboard" 
        subtitle="Manage your assigned classes and student results"
      />
      
      <div className="p-3 sm:p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
          {/* My Profile Section */}
          <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-3 text-lg sm:text-xl">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block font-semibold truncate">Welcome, {teacherRecord?.full_name}</span>
                  <p className="text-blue-100 text-xs sm:text-sm font-normal mt-0.5">Teacher Profile</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div className="space-y-1 min-w-0 flex-1">
                  <p className="text-blue-100 text-xs sm:text-sm truncate">
                    Email: {teacherRecord?.email || 'Not provided'}
                  </p>
                  <p className="text-blue-100 text-xs sm:text-sm truncate">
                    Phone: {teacherRecord?.phone || 'Not provided'}
                  </p>
                </div>
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => navigate('/teacher/profile')}
                  className="bg-blue-500 hover:bg-blue-400 text-white border-0 flex-shrink-0 min-h-[44px] px-4 sm:px-3"
                >
                  <Settings className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline ml-2 sm:ml-0">Edit Profile</span>
                  <span className="sm:hidden ml-2">Edit</span>
                </Button>
              </div>
            </CardContent>
          </Card>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4 sm:px-6 sm:pt-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-blue-800 leading-tight">
                  Assigned Classes
                </CardTitle>
                <GraduationCap className="h-4 w-4 text-blue-600 flex-shrink-0" />
              </CardHeader>
              <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
                <div className="text-xl sm:text-2xl font-bold text-blue-900">{assignedClasses.length}</div>
                <p className="text-xs text-blue-600">
                  Classes you teach
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4 sm:px-6 sm:pt-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-blue-800 leading-tight">
                  Total Students
                </CardTitle>
                <Users className="h-4 w-4 text-blue-600 flex-shrink-0" />
              </CardHeader>
              <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
                <div className="text-xl sm:text-2xl font-bold text-blue-900">{totalStudents}</div>
                <p className="text-xs text-blue-600">
                  Students in your classes
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4 sm:px-6 sm:pt-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-blue-800 leading-tight">
                  Results Submitted
                </CardTitle>
                <FileText className="h-4 w-4 text-blue-600 flex-shrink-0" />
              </CardHeader>
              <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
                <div className="text-xl sm:text-2xl font-bold text-blue-900">{teacherResults.length}</div>
                <p className="text-xs text-blue-600">
                  Total results created
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4 sm:px-6 sm:pt-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-blue-800 leading-tight">
                  Approved Results
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-600 flex-shrink-0" />
              </CardHeader>
              <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
                <div className="text-xl sm:text-2xl font-bold text-blue-900">{approvedResults}</div>
                <p className="text-xs text-blue-600">
                  {pendingResults} pending approval
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader className="px-4 py-4 sm:px-6 sm:py-6">
                <CardTitle className="text-blue-800 text-base sm:text-lg">Quick Actions</CardTitle>
                <CardDescription className="text-blue-600 text-sm">
                  Common tasks for managing your classes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 px-4 pb-4 sm:px-6 sm:pb-6">
                <Button 
                  onClick={() => navigate('/teacher/results/add')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white min-h-[48px] text-sm sm:text-base font-medium"
                  size="lg"
                >
                  Add Student Results
                </Button>
                <Button 
                  onClick={() => navigate('/teacher/results/manage')}
                  variant="outline"
                  className="w-full border-blue-300 text-blue-700 hover:bg-blue-100 min-h-[48px] text-sm sm:text-base font-medium"
                  size="lg"
                >
                  Manage My Results
                </Button>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50">
              <CardHeader className="px-4 py-4 sm:px-6 sm:py-6">
                <CardTitle className="text-blue-800 text-base sm:text-lg">Assigned Classes</CardTitle>
                <CardDescription className="text-blue-600 text-sm">
                  Classes and subjects you are assigned to
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
                <div className="space-y-2">
                  {assignedClasses.length > 0 ? (
                    assignedClasses.map((cls) => (
                      <div key={cls?.id} className="p-3 sm:p-4 border border-blue-300 bg-blue-100 rounded-lg">
                        <div className="font-medium text-blue-900 text-sm sm:text-base truncate">
                          {cls?.name}
                        </div>
                        <div className="text-xs sm:text-sm text-blue-600 mt-1">
                          {cls?.department?.name} Department
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-blue-600 text-center py-4">
                      No classes assigned yet. Contact your administrator.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;