
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useClasses } from "@/hooks/useClasses";
import { useDepartments } from "@/hooks/useDepartments";
import { useUpdateStudent, useDeleteStudent } from "@/hooks/useStudents";
import { Badge } from "@/components/ui/badge";
import { Trash2, Users, UserCheck } from "lucide-react";

interface BulkStudentOperationsDialogProps {
  selectedStudents: string[];
  studentNames: { [key: string]: string };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClearSelection: () => void;
}

export const BulkStudentOperationsDialog = ({ 
  selectedStudents, 
  studentNames, 
  open, 
  onOpenChange,
  onClearSelection 
}: BulkStudentOperationsDialogProps) => {
  const [operation, setOperation] = useState<"transfer" | "status" | "delete" | "">("");
  const [newClassId, setNewClassId] = useState("");
  const [newStatus, setNewStatus] = useState<"active" | "left" | "">("");
  
  const { data: classes = [] } = useClasses();
  const { data: departments = [] } = useDepartments();
  const updateStudent = useUpdateStudent();
  const deleteStudent = useDeleteStudent();

  const handleBulkTransfer = async () => {
    if (!newClassId) return;
    
    try {
      for (const studentId of selectedStudents) {
        await updateStudent.mutateAsync({ id: studentId, class_id: newClassId });
      }
      onOpenChange(false);
      onClearSelection();
    } catch (error) {
      console.error("Bulk transfer failed:", error);
    }
  };

  const handleBulkStatusUpdate = async () => {
    if (!newStatus) return;
    
    try {
      for (const studentId of selectedStudents) {
        await updateStudent.mutateAsync({ 
          id: studentId, 
          has_left: newStatus === "left" 
        });
      }
      onOpenChange(false);
      onClearSelection();
    } catch (error) {
      console.error("Bulk status update failed:", error);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedStudents.length} students? This action cannot be undone.`)) {
      return;
    }
    
    try {
      for (const studentId of selectedStudents) {
        await deleteStudent.mutateAsync(studentId);
      }
      onOpenChange(false);
      onClearSelection();
    } catch (error) {
      console.error("Bulk delete failed:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bulk Operations ({selectedStudents.length} students selected)</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Selected students preview */}
          <div>
            <Label>Selected Students:</Label>
            <div className="flex flex-wrap gap-2 mt-2 max-h-32 overflow-y-auto">
              {selectedStudents.slice(0, 10).map((studentId) => (
                <Badge key={studentId} variant="secondary" className="text-xs">
                  {studentNames[studentId] || studentId}
                </Badge>
              ))}
              {selectedStudents.length > 10 && (
                <Badge variant="outline" className="text-xs">
                  +{selectedStudents.length - 10} more
                </Badge>
              )}
            </div>
          </div>

          {/* Operation selection */}
          <div>
            <Label htmlFor="operation">Select Operation</Label>
            <Select value={operation} onValueChange={(value: any) => setOperation(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an operation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="transfer">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Transfer to Class
                  </div>
                </SelectItem>
                <SelectItem value="status">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4" />
                    Update Status
                  </div>
                </SelectItem>
                <SelectItem value="delete">
                  <div className="flex items-center gap-2">
                    <Trash2 className="w-4 h-4" />
                    Delete Students
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Transfer operation */}
          {operation === "transfer" && (
            <div>
              <Label htmlFor="newClass">New Class</Label>
              <Select value={newClassId} onValueChange={setNewClassId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select new class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name} - {cls.department?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Status operation */}
          {operation === "status" && (
            <div>
              <Label htmlFor="newStatus">New Status</Label>
              <Select value={newStatus} onValueChange={(value: any) => setNewStatus(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="left">Has Left</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Delete confirmation */}
          {operation === "delete" && (
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
              <p className="text-red-800 dark:text-red-200 text-sm">
                ⚠️ This will permanently delete {selectedStudents.length} students. This action cannot be undone.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            {operation === "transfer" && (
              <Button 
                onClick={handleBulkTransfer} 
                disabled={!newClassId || updateStudent.isPending}
              >
                Transfer Students
              </Button>
            )}
            {operation === "status" && (
              <Button 
                onClick={handleBulkStatusUpdate} 
                disabled={!newStatus || updateStudent.isPending}
              >
                Update Status
              </Button>
            )}
            {operation === "delete" && (
              <Button 
                variant="destructive"
                onClick={handleBulkDelete} 
                disabled={deleteStudent.isPending}
              >
                Delete Students
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
