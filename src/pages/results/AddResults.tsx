import { Header } from "@/components/Header";
import AddResultsFormContent from "@/components/results/AddResultsFormContent";
import { AddResultsFormProvider } from "@/components/results/AddResultsFormProvider";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ClipboardList } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AddResults = () => {
  const navigate = useNavigate();

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
              {/*<div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <ClipboardList className="w-6 h-6" />
              </div>*/}
              {/*<div className="flex-1">*/}
              {/*<h1 className="text-2xl font-bold mb-1">Student Result Entry</h1>*/}
              <p className="text-muted-foreground text-sm max-w-2xl">
                Complete the form below to add a new result. Select the student, configure assessments,
                enter subject marks, and add term information. All fields marked with an asterisk (*) are required.
              </p>
              {/*</div>*/}
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
