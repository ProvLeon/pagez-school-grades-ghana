
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Student } from "@/hooks/useStudents";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Phone, MapPin, Calendar, Users, GraduationCap } from "lucide-react";

interface StudentDetailsDialogProps {
  student: Student | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const StudentDetailsDialog = ({ student, open, onOpenChange }: StudentDetailsDialogProps) => {
  if (!student) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Student Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header with photo and basic info */}
          <div className="flex items-start gap-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={student.photo_url || undefined} alt={student.full_name} />
              <AvatarFallback className="bg-yellow-400 text-black text-lg font-semibold">
                {getInitials(student.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-xl font-semibold">{student.full_name}</h3>
              <p className="text-red-600 font-medium">ID: {student.student_id}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={student.has_left ? "destructive" : "default"}>
                  {student.has_left ? "Has Left" : "Active"}
                </Badge>
                {student.gender && (
                  <Badge variant="outline">{student.gender}</Badge>
                )}
                {student.date_of_birth && (
                  <Badge variant="outline">
                    DOB: {new Date(student.date_of_birth).toLocaleDateString()}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Guardian Information and Academic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Guardian Information</h4>
              <div className="space-y-2">
                {student.guardian_name && (
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span>{student.guardian_name}</span>
                  </div>
                )}
                {student.guardian_phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span>{student.guardian_phone}</span>
                  </div>
                )}
                {student.guardian_email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span>{student.guardian_email}</span>
                  </div>
                )}
                {student.address && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                    <span>{student.address}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Academic Information</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span>Class: {student.class?.name || 'Not assigned'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <GraduationCap className="w-4 h-4 text-gray-500" />
                  <span>Department: {student.department?.name || 'Not assigned'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span>Academic Year: {student.academic_year}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information (if no guardian info available) */}
          {!student.guardian_name && !student.guardian_phone && !student.guardian_email && (student.email || student.phone) && (
            <div>
              <h4 className="font-semibold mb-3">Contact Information</h4>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="space-y-2">
                  {student.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span>{student.email}</span>
                    </div>
                  )}
                  {student.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span>{student.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="text-xs text-gray-500 border-t pt-4">
            <div>Created: {new Date(student.created_at).toLocaleString()}</div>
            <div>Updated: {new Date(student.updated_at).toLocaleString()}</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
