
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, User, Phone, Mail, Key, Trash2, MoreVertical } from "lucide-react";
import { ExtendedTeacher } from "@/hooks/useTeachers";
import { TeacherAssignment } from "@/hooks/useTeacherAssignments";
import TeacherAssignmentDialog from "./TeacherAssignmentDialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface TeacherCardProps {
  teacher: ExtendedTeacher;
  assignments: TeacherAssignment[];
  onEditTeacher: (teacher: ExtendedTeacher) => void;
  onResetPassword: (teacher: ExtendedTeacher) => void;
  onToggleStatus: (teacher: ExtendedTeacher) => void;
  onDeleteTeacher: (teacher: ExtendedTeacher) => void;
}

const TeacherCard = ({
  teacher,
  assignments,
  onEditTeacher,
  onResetPassword,
  onToggleStatus,
  onDeleteTeacher
}: TeacherCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
          <User className="w-6 h-6 text-muted-foreground" />
        </div>
        <div>
          <CardTitle className="text-base">{teacher.full_name}</CardTitle>
          <p className="text-sm text-muted-foreground">{teacher.department?.name || "No Department"}</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm text-muted-foreground space-y-1">
          <p>Email: {teacher.email || 'N/A'}</p>
          <p>Phone: {teacher.phone || 'N/A'}</p>
        </div>
        <div className="flex items-center justify-between pt-3 border-t">
          <Badge variant={teacher.is_active !== false ? "default" : "outline"}>
            {teacher.is_active !== false ? "Active" : "Inactive"}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <TeacherAssignmentDialog teacherId={teacher.id} teacherName={teacher.full_name} trigger={<DropdownMenuItem onSelect={(e) => e.preventDefault()}>Assignments</DropdownMenuItem>} />
              <DropdownMenuItem onClick={() => onEditTeacher(teacher)}>Edit</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onResetPassword(teacher)} disabled={!teacher.user_id}>Reset Password</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleStatus(teacher)}>{teacher.is_active !== false ? "Deactivate" : "Activate"}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDeleteTeacher(teacher)} className="text-destructive">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeacherCard;
