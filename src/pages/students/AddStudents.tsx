
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, UserPlus, Sparkles } from "lucide-react";
import { useCreateStudent } from "@/hooks/useStudents";
import { useNavigate } from "react-router-dom";
import { StudentFormProvider, useStudentForm } from "@/components/students/StudentFormProvider";
import { StudentPhotoSection } from "@/components/students/StudentPhotoSection";
import { StudentBasicInfoSection } from "@/components/students/StudentBasicInfoSection";
import { StudentAcademicInfoSection } from "@/components/students/StudentAcademicInfoSection";
import { StudentGuardianInfoSection } from "@/components/students/StudentGuardianInfoSection";
import { StudentFormActions } from "@/components/students/StudentFormActions";
import { useState } from "react";

const AddStudentsForm = () => {
  const navigate = useNavigate();
  const { formData, generateStudentId } = useStudentForm();
  const createStudent = useCreateStudent();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || createStudent.isPending) return;
    if (!formData.full_name || !formData.department_id || !formData.class_id) return;

    setIsSubmitting(true);
    try {
      const finalStudentId = formData.auto_generate_id ? generateStudentId() : formData.student_id;
      const studentData = {
        full_name: formData.full_name,
        gender: formData.gender,
        date_of_birth: formData.date_of_birth || undefined,
        class_id: formData.class_id,
        department_id: formData.department_id,
        academic_year: formData.academic_year,
        student_id: finalStudentId,
        photo_url: formData.photo_url,
        guardian_name: formData.guardian_name || undefined,
        guardian_phone: formData.guardian_phone || undefined,
        guardian_email: formData.guardian_email || undefined,
        address: formData.address || undefined,
        has_left: false,
      };

      createStudent.mutate(studentData, {
        onSuccess: () => navigate('/students/manage-students'),
        onSettled: () => setIsSubmitting(false),
      });
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header title="Add Student" subtitle="Create a new student profile" />

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/students/manage-students')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Students
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1">
                  <StudentPhotoSection />
                </div>
                <div className="lg:col-span-3">
                  <StudentBasicInfoSection />
                </div>
              </div>
            </CardContent>
          </Card>

          <StudentAcademicInfoSection />
          <StudentGuardianInfoSection />

          <StudentFormActions
            isSubmitting={isSubmitting || createStudent.isPending}
          />
        </form>
      </main>
    </div>
  );
};

const AddStudents = () => {
  return (
    <StudentFormProvider>
      <AddStudentsForm />
    </StudentFormProvider>
  );
};

export default AddStudents;
