
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useDeleteSubject, SubjectWithDepartment } from "@/hooks/useSubjects";

interface DeleteSubjectDialogProps {
  subject: SubjectWithDepartment;
  trigger?: React.ReactNode;
}

export function DeleteSubjectDialog({ subject, trigger }: DeleteSubjectDialogProps) {
  const [open, setOpen] = useState(false);
  const deleteSubject = useDeleteSubject();

  const handleDelete = async () => {
    try {
      await deleteSubject.mutateAsync(subject.id);
      setOpen(false);
    } catch (error) {
      console.error("Error deleting subject:", error);
    }
  };

  const defaultTrigger = (
    <Button 
      variant="ghost" 
      size="sm" 
      className="p-1 hover:bg-red-50"
    >
      <Trash2 className="w-4 h-4 text-red-600" />
    </Button>
  );

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger || defaultTrigger}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Subject</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{subject.name}"? This action cannot be undone.
            {subject.department && (
              <span className="block mt-2 text-sm text-gray-600">
                Department: {subject.department.name}
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700"
            disabled={deleteSubject.isPending}
          >
            Delete Subject
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
