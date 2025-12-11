
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";

interface StudentSelectionCardProps {
  formData: {
    class_id: string;
    student_id: string;
    term: "first" | "second" | "third" | "";
  };
  setFormData: (data: any) => void;
  classes: any[];
  studentsInClass: any[];
  selectedStudent: any;
}

const StudentSelectionCard = ({
  formData,
  setFormData,
  classes,
  studentsInClass,
  selectedStudent,
}: StudentSelectionCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Student & Term Selection</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="class_id">Class *</Label>
            <Select value={formData.class_id} onValueChange={(value) => setFormData({...formData, class_id: value, student_id: ""})}>
              <SelectTrigger id="class_id"><SelectValue placeholder="Select Class" /></SelectTrigger>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="student_id">Student *</Label>
            <Select value={formData.student_id} onValueChange={(value) => setFormData({...formData, student_id: value})} disabled={!formData.class_id}>
              <SelectTrigger id="student_id"><SelectValue placeholder="Select Student" /></SelectTrigger>
              <SelectContent>
                {studentsInClass.map((student) => (
                  <SelectItem key={student.id} value={student.id}>{student.full_name} ({student.student_id})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="term">Term *</Label>
            <Select value={formData.term} onValueChange={(value: "first" | "second" | "third") => setFormData({...formData, term: value})}>
              <SelectTrigger id="term"><SelectValue placeholder="Select Term" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="first">First Term</SelectItem>
                <SelectItem value="second">Second Term</SelectItem>
                <SelectItem value="third">Third Term</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectedStudent && (
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarImage src={selectedStudent.photo_url} />
                <AvatarFallback><User /></AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{selectedStudent.full_name}</h3>
                <p className="text-sm text-muted-foreground">ID: {selectedStudent.student_id}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentSelectionCard;
