
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, Search } from "lucide-react";
import { useStudents } from "@/hooks/useStudents";
import { useClasses, useUpdateClass } from "@/hooks/useClasses";
import { useToast } from "@/hooks/use-toast";

interface AssignStudentsDialogProps {
  trigger?: React.ReactNode;
}

export const AssignStudentsDialog = ({ trigger }: AssignStudentsDialogProps) => {
  const [open, setOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const { toast } = useToast();
  const { data: students = [] } = useStudents();
  const { data: classes = [] } = useClasses();
  const updateClass = useUpdateClass();

  // Filter students without a class and by search term
  const availableStudents = students.filter(student =>
    !student.class_id &&
    student.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAssignStudents = async () => {
    if (!selectedClassId || selectedStudents.length === 0) {
      toast({
        title: "Error",
        description: "Please select a class and at least one student",
        variant: "destructive",
      });
      return;
    }

    try {
      // Update student count for the selected class
      const currentClass = classes.find(cls => cls.id === selectedClassId);
      const newStudentCount = (currentClass?.student_count || 0) + selectedStudents.length;

      await updateClass.mutateAsync({
        id: selectedClassId,
        student_count: newStudentCount,
      });

      toast({
        title: "Success",
        description: `Assigned ${selectedStudents.length} students to class successfully`,
      });

      setOpen(false);
      setSelectedClassId("");
      setSelectedStudents([]);
      setSearchTerm("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign students",
        variant: "destructive",
      });
    }
  };

  const handleStudentToggle = (studentId: string) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="w-full justify-start">
            <Users className="w-4 h-4 mr-2" />
            Assign Students
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assign Students to Class</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="class">Select Class *</Label>
            <Select value={selectedClassId} onValueChange={setSelectedClassId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name} - {cls.department?.name} ({cls.student_count || 0} students)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Search Students</Label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search unassigned students..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label>Available Students ({availableStudents.length})</Label>
            <div className="max-h-64 overflow-y-auto border rounded-md p-4 space-y-2">
              {availableStudents.length === 0 ? (
                <div className="text-center text-gray-500 py-4">
                  No unassigned students found
                </div>
              ) : (
                availableStudents.map((student) => (
                  <div key={student.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={student.id}
                      checked={selectedStudents.includes(student.id)}
                      onCheckedChange={() => handleStudentToggle(student.id)}
                    />
                    <Label htmlFor={student.id} className="flex-1 cursor-pointer">
                      {student.full_name} - {student.student_id}
                    </Label>
                  </div>
                ))
              )}
            </div>
          </div>

          {selectedStudents.length > 0 && (
            <div className="bg-blue-50 p-3 rounded-md">
              <p className="text-sm text-blue-700">
                {selectedStudents.length} student(s) selected for assignment
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-gray-200 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignStudents}
              disabled={updateClass.isPending || selectedStudents.length === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {updateClass.isPending ? "Assigning..." : `Assign ${selectedStudents.length} Students`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
