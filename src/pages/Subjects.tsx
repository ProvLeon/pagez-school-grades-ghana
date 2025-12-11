
import { useState } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Plus, Search, MoreVertical, Edit, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useSubjects, useDeleteSubject, SubjectWithDepartment } from "@/hooks/useSubjects";
import { SubjectFormDialog } from "@/components/subjects/SubjectFormDialog";
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { SubjectsEmptyState } from "@/components/subjects/SubjectsEmptyState";

const Subjects = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectWithDepartment | null>(null);
  const [deletingSubject, setDeletingSubject] = useState<SubjectWithDepartment | null>(null);

  const { data: subjects = [], isLoading } = useSubjects();
  const deleteSubject = useDeleteSubject();

  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.department?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    setEditingSubject(null);
    setIsFormOpen(true);
  };

  const handleEdit = (subject: SubjectWithDepartment) => {
    setEditingSubject(subject);
    setIsFormOpen(true);
  };

  const handleDelete = (subject: SubjectWithDepartment) => {
    setDeletingSubject(subject);
  };

  const confirmDelete = () => {
    if (deletingSubject) {
      deleteSubject.mutate(deletingSubject.id, {
        onSuccess: () => setDeletingSubject(null),
      });
    }
  };

  return (
    <div className="min-h-screen bg-muted/40">
      <Header title="Subjects" subtitle="Manage academic subjects and curriculum" />
      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Subjects</h1>
            <p className="text-muted-foreground">Manage all subjects in your school.</p>
          </div>
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add Subject
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search subjects..."
              className="pl-9 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
          </div>
        ) : filteredSubjects.length === 0 ? (
          <SubjectsEmptyState onAdd={handleAdd} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredSubjects.map((subject) => (
              <Card key={subject.id} className="overflow-hidden">
                <CardHeader className="flex flex-row items-center gap-4 p-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{subject.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{subject.code || "N/A"}</p>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Department</span>
                    <Badge variant="outline">{subject.department?.name || "N/A"}</Badge>
                  </div>
                  <div className="flex items-center justify-end text-sm pt-3 border-t">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(subject)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(subject)} className="text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <SubjectFormDialog
          isOpen={isFormOpen}
          onOpenChange={setIsFormOpen}
          subject={editingSubject}
        />

        <DeleteConfirmationDialog
          isOpen={!!deletingSubject}
          onOpenChange={(open) => !open && setDeletingSubject(null)}
          onConfirm={confirmDelete}
          title="Delete Subject"
          description={`Are you sure you want to delete the "${deletingSubject?.name}" subject?`}
          isLoading={deleteSubject.isPending}
        />
      </main>
    </div>
  );
};

export default Subjects;
