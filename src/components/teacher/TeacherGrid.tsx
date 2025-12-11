
import { Card, CardContent } from "@/components/ui/card";
import { User } from "lucide-react";
import { ExtendedTeacher } from "@/hooks/useTeachers";
import { TeacherAssignment } from "@/hooks/useTeacherAssignments";
import TeacherCard from "./TeacherCard";

interface TeacherGridProps {
  teachers: ExtendedTeacher[];
  assignments: TeacherAssignment[];
  onEditTeacher: (teacher: ExtendedTeacher) => void;
  onResetPassword: (teacher: ExtendedTeacher) => void;
  onToggleStatus: (teacher: ExtendedTeacher) => void;
  onDeleteTeacher: (teacher: ExtendedTeacher) => void;
  searchTerm: string;
  selectedDepartment: string;
}

const TeacherGrid = ({
  teachers,
  assignments,
  onEditTeacher,
  onResetPassword,
  onToggleStatus,
  onDeleteTeacher,
  searchTerm,
  selectedDepartment
}: TeacherGridProps) => {
  const getTeacherAssignments = (teacherId: string) => {
    return assignments.filter(assignment => assignment.teacher_id === teacherId);
  };

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = !searchTerm ||
      teacher.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.username?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment = selectedDepartment === "all" ||
      teacher.department_id === selectedDepartment;

    return matchesSearch && matchesDepartment;
  });

  if (filteredTeachers.length === 0) {
    return (
      <div className="text-center py-16">
        <User className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">No Teachers Found</h3>
        <p className="text-sm text-muted-foreground">No teachers match your current filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {filteredTeachers.map((teacher) => (
        <TeacherCard
          key={teacher.id}
          teacher={teacher}
          assignments={getTeacherAssignments(teacher.id)}
          onEditTeacher={onEditTeacher}
          onResetPassword={onResetPassword}
          onToggleStatus={onToggleStatus}
          onDeleteTeacher={onDeleteTeacher}
        />
      ))}
    </div>
  );
};

export default TeacherGrid;
