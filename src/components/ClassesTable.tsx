import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";
import { EditClassDialog } from "@/components/EditClassDialog";
import { useDeleteClass } from "@/hooks/useClasses";
import { useToast } from "@/hooks/use-toast";
import { Class } from "@/lib/supabase";
import { MoreHorizontal, Edit, Trash2, GraduationCap } from "lucide-react";

interface ClassesTableProps {
  classes: Class[];
  searchTerm: string;
  onAdd?: () => void;
}

export const ClassesTable = ({ classes, searchTerm, onAdd }: ClassesTableProps) => {
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    classItem: Class | null;
  }>({ isOpen: false, classItem: null });

  const deleteClass = useDeleteClass();
  const { toast } = useToast();

  // Filter classes based on search term
  const filteredClasses = classes.filter((cls) => {
    if (!searchTerm) return true;

    const search = searchTerm.toLowerCase();
    return (
      cls.name.toLowerCase().includes(search) ||
      cls.teacher?.full_name?.toLowerCase().includes(search) ||
      cls.department?.name?.toLowerCase().includes(search)
    );
  });

  const handleDeleteClick = (classItem: Class) => {
    setDeleteConfirmation({ isOpen: true, classItem });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmation.classItem) return;

    try {
      await deleteClass.mutateAsync(deleteConfirmation.classItem.id);
      toast({
        title: "Class deleted",
        description: "The class has been successfully deleted.",
      });
      setDeleteConfirmation({ isOpen: false, classItem: null });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete class. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Empty state
  if (filteredClasses.length === 0) {
    return (
      <div className="text-center py-20">
        <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">
          {searchTerm ? "No classes found" : "No classes yet"}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {searchTerm
            ? "No classes match your search criteria."
            : "Get started by adding a new class."}
        </p>
        {!searchTerm && onAdd && (
          <Button className="mt-6" onClick={onAdd}>
            Add Class
          </Button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead>Class Name</TableHead>
              <TableHead className="hidden sm:table-cell">Department</TableHead>
              <TableHead className="hidden md:table-cell">Students</TableHead>
              <TableHead className="hidden lg:table-cell">Class Teacher</TableHead>
              <TableHead className="hidden xl:table-cell">Academic Year</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClasses.map((cls) => (
              <TableRow key={cls.id}>
                <TableCell className="font-medium">{cls.name}</TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge variant="outline"
                    className="text-primary">

                    {cls.department?.name || "N/A"}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">
                  {cls.student_count || 0}
                </TableCell>
                <TableCell className="hidden lg:table-cell text-muted-foreground">
                  {cls.teacher?.full_name || "Not assigned"}
                </TableCell>
                <TableCell className="hidden xl:table-cell text-muted-foreground">
                  {cls.academic_year}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingClass(cls)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(cls)}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Class Dialog */}
      <EditClassDialog
        classItem={editingClass}
        open={!!editingClass}
        onOpenChange={(open) => !open && setEditingClass(null)}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={deleteConfirmation.isOpen}
        onOpenChange={(open) =>
          setDeleteConfirmation({ isOpen: open, classItem: null })
        }
        onConfirm={handleDeleteConfirm}
        title="Delete Class"
        description={`Are you sure you want to delete "${deleteConfirmation.classItem?.name}"? This action cannot be undone.`}
        isLoading={deleteClass.isPending}
      />
    </>
  );
};
