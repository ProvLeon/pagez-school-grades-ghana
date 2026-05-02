import { Header } from "@/components/Header";
import AddResultsFormContent from "@/components/results/AddResultsFormContent";
import { AddResultsFormProvider } from "@/components/results/AddResultsFormProvider";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, ClipboardList, Info, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCanAccessClass } from "@/hooks/useTeacherClassAccess";

const AddResults = () => {
  const navigate = useNavigate();
  const { isTeacher, isAdmin } = useAuth();
  const {
    getAccessibleClassIds,
    isLoading: teacherAccessLoading,
    hasLoaded: teacherAccessLoaded,
    teacherId
  } = useCanAccessClass();

  // Get teacher's accessible class IDs
  const teacherClassIds = isTeacher &&
    teacherAccessLoaded ? getAccessibleClassIds() : [];

  // Check if teacher record is missing (user_id not linked in teachers table)
  const teacherRecordMissing = isTeacher && teacherAccessLoaded && !teacherId;

  // Check if teacher has no assignments
  const teacherHasNoAssignments = isTeacher && teacherAccessLoaded && !!teacherId && teacherClassIds.length === 0;

  // Show loading state while checking teacher access
  if (isTeacher && !teacherAccessLoaded) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          title="Add New Result"
          subtitle="Create a comprehensive student result record"
        />
        <main className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => navigate('/results')}
              className="gap-2 hover:bg-white"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Results
            </Button>
          </div>
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground">Loading your class assignments...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Show empty state if teacher has no class assignments or account not linked
  if (teacherRecordMissing || teacherHasNoAssignments) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          title="Add New Result"
          subtitle="Create a comprehensive student result record"
        />
        <main className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => navigate('/results')}
              className="gap-2 hover:bg-white"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Results
            </Button>
          </div>

          <Alert variant="destructive" className="mb-6">
            <Info className="h-4 w-4" />
            <AlertDescription>
              You don't have any class assignments yet. Please contact your administrator to be assigned to classes before you can add results.
            </AlertDescription>
          </Alert>

          <div className="text-center py-20">
            <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No Class Assignments</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              You need to be assigned to at least one class to add results.<br />
              Please contact your administrator.
            </p>
          </div>
        </main>
      </div>
    );
  }

  // Normal flow - teacher has assignments or user is admin
  return (
    <AddResultsFormProvider>
      <div className="min-h-screen bg-background">
        <Header
          title="Add New Result"
          subtitle="Create a comprehensive student result record"
        />

        <main className="container mx-auto px-4 py-6">
          {/* Back Navigation */}
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => navigate('/results')}
              className="gap-2 hover:bg-white"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Results
            </Button>
          </div>

          {/* Page Header Card */}
          <div className="bg-background rounded-2xl p-6 text-primary shadow-xl">
            <div className="flex items-start gap-2">
              <p className="text-muted-foreground text-sm max-w-2xl">
                Complete the form below to add a new result. Select the student, configure assessments,
                enter subject marks, and add term information. All fields marked with an asterisk (*) are required.
              </p>
            </div>

            {/* Quick Stats/Info */}
            <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-white/20">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-primary/40" />
                <span>Select Class & Student</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-primary/40" />
                <span>Configure Assessment</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-primary/40" />
                <span>Enter Subject Marks</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-primary/40" />
                <span>Add Term Info</span>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <AddResultsFormContent />
        </main>
      </div>
    </AddResultsFormProvider>
  )
}
export default AddResults;
