
import { useAddResultsForm } from "@/contexts/AddResultsFormContext";
import StudentSelectionCard from "./StudentSelectionCard";
import AssessmentConfigCard from "./AssessmentConfigCard";
import TermInformationCard from "./TermInformationCard";
import SubjectMarksCard from "./SubjectMarksCard";
import AddResultsActions from "./AddResultsActions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AddResultsFormContentProps {
  isEditMode?: boolean;
  resultId?: string;
}

const AddResultsFormContent = ({ isEditMode = false, resultId }: AddResultsFormContentProps) => {
  const {
    formData,
    setFormData,
    subjectMarks,
    setSubjectMarks,
    classes,
    allStudents,
    subjects,
    caTypes,
    teachers,
    studentsInClass,
    selectedStudent,
    selectedClass,
    selectedSBAType,
    classSubjects,
    isFormValid,
    existingResultError,
    gradingSettings,
    gradingScales,
    conductOptions,
    attitudeOptions,
    interestOptions,
    teacherCommentOptions
  } = useAddResultsForm();

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Academic Year & Term Information */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Current Session</p>
                <div className="flex gap-2 items-center">
                  <Badge variant="outline" className="text-base">{formData.academic_year}</Badge>
                  <Badge variant="secondary" className="text-base">{formData.term && formData.term.charAt(0).toUpperCase() + formData.term.slice(1)} Term</Badge>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                <p>These are automatically set from your Grading Settings.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Validation Errors */}
        {existingResultError && !isEditMode && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-red-800 mb-2">Error:</h3>
            <p className="text-sm text-red-700">{existingResultError}</p>
          </div>
        )}

        {/* Student Selection */}
        <StudentSelectionCard
          formData={formData}
          setFormData={setFormData}
          classes={classes}
          studentsInClass={studentsInClass}
          selectedStudent={selectedStudent}
          selectedClass={selectedClass}
        />

        {/* Assessment Configuration */}
        <AssessmentConfigCard
          formData={formData}
          setFormData={setFormData}
          caTypes={caTypes}
          teachers={teachers}
          selectedSBAType={selectedSBAType}
          assessmentConfig={null}
          gradingSettings={gradingSettings}
          selectedClass={selectedClass}
        />

        {/* Subject Marks - moved after Assessment Configuration */}
        <SubjectMarksCard
          subjects={classSubjects}
          subjectMarks={subjectMarks}
          setSubjectMarks={setSubjectMarks}
          selectedCAType={selectedSBAType}
          gradingScales={gradingScales}
        />

        {/* Term Information */}
        <TermInformationCard
          formData={formData}
          setFormData={setFormData}
          conductOptions={conductOptions}
          attitudeOptions={attitudeOptions}
          interestOptions={interestOptions}
          teacherCommentOptions={teacherCommentOptions}
          gradingSettings={gradingSettings}
        />

        {/* Action Buttons */}
        <AddResultsActions isEditMode={isEditMode} resultId={resultId} />
      </div>
    </div>
  );
};

export default AddResultsFormContent;
