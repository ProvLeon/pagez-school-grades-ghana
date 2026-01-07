
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Search, UserPlus, ArrowRightLeft } from "lucide-react";
import { useStudents } from "@/hooks/useStudents";
import { useClasses } from "@/hooks/useClasses";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AssignStudentsDialogProps {
  trigger?: React.ReactNode;
}

export const AssignStudentsDialog = ({ trigger }: AssignStudentsDialogProps) => {
  const [open, setOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("unassigned");

  const { toast } = useToast();
  const { data: students = [], refetch: refetchStudents } = useStudents();
  const { data: classes = [], refetch: refetchClasses } = useClasses();
  const [isAssigning, setIsAssigning] = useState(false);

  // Filter students without a class (unassigned)
  const unassignedStudents = students.filter(student =>
    !student.class_id &&
    student.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter students from OTHER classes (for reassignment)
  const studentsFromOtherClasses = students.filter(student =>
    student.class_id &&
    student.class_id !== selectedClassId &&
    student.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get the current list based on active tab
  const availableStudents = activeTab === "unassigned" ? unassignedStudents : studentsFromOtherClasses;

  const handleAssignStudents = async () => {
    if (!selectedClassId || selectedStudents.length === 0) {
      toast({
        title: "Error",
        description: "Please select a class and at least one student",
        variant: "destructive",
      });
      return;
    }

    setIsAssigning(true);

    try {
      // Get the selected class to also get the department_id
      const currentClass = classes.find(cls => cls.id === selectedClassId);

      // Update each student's class_id (and department_id if available)
      const updatePromises = selectedStudents.map(studentId =>
        supabase
          .from('students')
          .update({
            class_id: selectedClassId,
            department_id: currentClass?.department_id || undefined
          })
          .eq('id', studentId)
      );

      const results = await Promise.all(updatePromises);

      // Check for errors
      const errors = results.filter(r => r.error);
      if (errors.length > 0) {
        console.error('Some students failed to update:', errors);
        throw new Error(`Failed to assign ${errors.length} student(s)`);
      }

      // Refetch data to update the UI
      await refetchStudents();
      await refetchClasses();

      toast({
        title: "Success",
        description: `Assigned ${selectedStudents.length} students to class successfully`,
      });

      setOpen(false);
      setSelectedClassId("");
      setSelectedStudents([]);
      setSearchTerm("");
      setActiveTab("unassigned");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to assign students";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
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
            <Label htmlFor="class">Select Destination Class *</Label>
            <Select value={selectedClassId} onValueChange={(value) => {
              setSelectedClassId(value);
              setSelectedStudents([]); // Clear selection when class changes
            }} required>
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

          <Tabs value={activeTab} onValueChange={(value) => {
            setActiveTab(value);
            setSelectedStudents([]); // Clear selection when switching tabs
          }}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="unassigned" className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Unassigned ({unassignedStudents.length})
              </TabsTrigger>
              <TabsTrigger value="reassign" className="flex items-center gap-2" disabled={!selectedClassId}>
                <ArrowRightLeft className="w-4 h-4" />
                From Other Classes ({selectedClassId ? studentsFromOtherClasses.length : 0})
              </TabsTrigger>
            </TabsList>

            <div className="mt-4">
              <Label>Search Students</Label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder={activeTab === "unassigned" ? "Search unassigned students..." : "Search students to reassign..."}
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <TabsContent value="unassigned" className="mt-4">
              <Label>Available Students ({unassignedStudents.length})</Label>
              <div className="max-h-64 overflow-y-auto border rounded-md p-4 space-y-2 mt-2">
                {unassignedStudents.length === 0 ? (
                  <div className="text-center text-gray-500 py-4">
                    <p>No unassigned students found</p>
                    <p className="text-xs mt-1">All students are already assigned to classes</p>
                  </div>
                ) : (
                  unassignedStudents.map((student) => (
                    <div key={student.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`unassigned-${student.id}`}
                        checked={selectedStudents.includes(student.id)}
                        onCheckedChange={() => handleStudentToggle(student.id)}
                      />
                      <Label htmlFor={`unassigned-${student.id}`} className="flex-1 cursor-pointer">
                        {student.full_name} - {student.student_id}
                      </Label>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="reassign" className="mt-4">
              <Label>Students from Other Classes ({studentsFromOtherClasses.length})</Label>
              <div className="max-h-64 overflow-y-auto border rounded-md p-4 space-y-2 mt-2">
                {!selectedClassId ? (
                  <div className="text-center text-gray-500 py-4">
                    <p>Please select a destination class first</p>
                  </div>
                ) : studentsFromOtherClasses.length === 0 ? (
                  <div className="text-center text-gray-500 py-4">
                    <p>No students in other classes</p>
                    <p className="text-xs mt-1">There are no students to reassign</p>
                  </div>
                ) : (
                  studentsFromOtherClasses.map((student) => {
                    const currentClass = classes.find(c => c.id === student.class_id);
                    return (
                      <div key={student.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`reassign-${student.id}`}
                          checked={selectedStudents.includes(student.id)}
                          onCheckedChange={() => handleStudentToggle(student.id)}
                        />
                        <Label htmlFor={`reassign-${student.id}`} className="flex-1 cursor-pointer">
                          <span>{student.full_name} - {student.student_id}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            (Currently in {currentClass?.name || 'Unknown'})
                          </span>
                        </Label>
                      </div>
                    );
                  })
                )}
              </div>
            </TabsContent>
          </Tabs>

          {selectedStudents.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-md">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {selectedStudents.length} student(s) selected for {activeTab === "reassign" ? "reassignment" : "assignment"}
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
              disabled={isAssigning || selectedStudents.length === 0 || !selectedClassId}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isAssigning
                ? (activeTab === "reassign" ? "Reassigning..." : "Assigning...")
                : `${activeTab === "reassign" ? "Reassign" : "Assign"} ${selectedStudents.length} Students`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
