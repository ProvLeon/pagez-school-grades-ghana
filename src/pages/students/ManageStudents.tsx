import { useState } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, Filter, Edit, Trash2, Plus, Search, MoreHorizontal, Eye, Users, X } from "lucide-react";
import { useStudents, useDeleteStudent, Student } from "@/hooks/useStudents";
import { useClasses } from "@/hooks/useClasses";
import { useDepartments } from "@/hooks/useDepartments";
import { useNavigate } from "react-router-dom";
import { EditStudentDialog } from "@/components/EditStudentDialog";
import { BulkStudentOperationsDialog } from "@/components/BulkStudentOperationsDialog";
import { StudentDetailsDialog } from "@/components/StudentDetailsDialog";
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

const ManageStudents = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [deletingStudent, setDeletingStudent] = useState<{ id: string, name: string } | null>(null);
  const [filters, setFilters] = useState({
    class_id: "",
    department_id: "",
    has_left: undefined as boolean | undefined,
    gender: "",
  });

  const { data: students = [], isLoading } = useStudents({
    ...filters,
    class_id: filters.class_id === "all" ? "" : filters.class_id,
    department_id: filters.department_id === "all" ? "" : filters.department_id,
    search: searchTerm,
  });

  const { data: classes = [] } = useClasses();
  const { data: departments = [] } = useDepartments();
  const deleteStudent = useDeleteStudent();

  const confirmDelete = () => {
    if (deletingStudent) {
      deleteStudent.mutate(deletingStudent.id, {
        onSuccess: () => setDeletingStudent(null),
        onError: () => setDeletingStudent(null),
      });
    }
  };

  const handleSelectStudent = (studentId: string, checked: boolean) => {
    setSelectedStudents(prev => checked ? [...prev, studentId] : prev.filter(id => id !== studentId));
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedStudents(checked ? students.map(s => s.id) : []);
  };

  const getInitials = (name: string) => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const studentNames = students.reduce((acc, student) => ({ ...acc, [student.id]: student.full_name }), {} as { [key: string]: string });

  const activeFilters = Object.values(filters).filter(Boolean).length + (searchTerm ? 1 : 0);

  const clearFilters = () => {
    setFilters({
      class_id: "",
      department_id: "",
      has_left: undefined,
      gender: "",
    });
    setSearchTerm("");
  };

  return (
    <div className="min-h-screen bg-muted/40">
      <Header title="Manage Students" />

      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Students</h1>
            <p className="text-muted-foreground">Manage all student records in your school.</p>
          </div>
          <Button onClick={() => navigate('/students/add-students')}>
            <Plus className="w-4 h-4 mr-2" />
            Add Student
          </Button>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  className="pl-9 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Select value={filters.class_id} onValueChange={(value) => setFilters(prev => ({ ...prev, class_id: value }))}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={filters.department_id} onValueChange={(value) => setFilters(prev => ({ ...prev, department_id: value }))}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                {activeFilters > 0 && (
                  <Button variant="ghost" onClick={clearFilters}>
                    <X className="w-4 h-4 mr-2" />
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="border rounded-lg p-4 space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-20">
            <Users className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No students found</h3>
            <p className="mt-2 text-sm text-muted-foreground">Get started by adding a new student.</p>
            <Button className="mt-6" onClick={() => navigate('/students/add-students')}>
              <Plus className="w-4 h-4 mr-2" />
              Add Student
            </Button>
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40 hover:bg-muted/40">
                      <th className="p-4 text-left"><Checkbox checked={selectedStudents.length === students.length && students.length > 0} onCheckedChange={handleSelectAll} /></th>
                      <th className="p-4 text-left font-semibold">Name</th>
                      <th className="p-4 text-left font-semibold hidden md:table-cell">Student ID</th>
                      <th className="p-4 text-left font-semibold hidden lg:table-cell">Class</th>
                      <th className="p-4 text-left font-semibold hidden xl:table-cell">Status</th>
                      <th className="p-4 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student.id} className="border-b hover:bg-muted/50">
                        <td className="p-4"><Checkbox checked={selectedStudents.includes(student.id)} onCheckedChange={(checked) => handleSelectStudent(student.id, checked as boolean)} /></td>
                        <td className="p-4 flex items-center gap-3">
                          <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center font-semibold">
                            {student.photo_url ? <img src={student.photo_url} alt={student.full_name} className="w-full h-full rounded-full object-cover" /> : getInitials(student.full_name)}
                          </div>
                          <div>
                            <p className="font-medium">{student.full_name}</p>
                            <p className="text-muted-foreground text-xs md:hidden">{student.student_id}</p>
                          </div>
                        </td>
                        <td className="p-4 hidden md:table-cell">{student.student_id}</td>
                        <td className="p-4 hidden lg:table-cell">{student.class?.name || 'N/A'}</td>
                        <td className="p-4 hidden xl:table-cell"><Badge variant={student.has_left ? "outline" : "default"}>{student.has_left ? "Inactive" : "Active"}</Badge></td>
                        <td className="p-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setViewingStudent(student)}>View Details</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setEditingStudent(student)}>Edit</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setDeletingStudent({ id: student.id, name: student.full_name })} className="text-destructive">Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                    }
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>)}
      </main>

      <EditStudentDialog student={editingStudent} open={!!editingStudent} onOpenChange={(open) => !open && setEditingStudent(null)} />
      <BulkStudentOperationsDialog selectedStudents={selectedStudents} studentNames={studentNames} open={showBulkDialog} onOpenChange={setShowBulkDialog} onClearSelection={() => setSelectedStudents([])} />
      <StudentDetailsDialog student={viewingStudent} open={!!viewingStudent} onOpenChange={(open) => !open && setViewingStudent(null)} />
      <DeleteConfirmationDialog isOpen={!!deletingStudent} onOpenChange={(open) => !open && setDeletingStudent(null)} onConfirm={confirmDelete} title="Delete Student" description={`Are you sure you want to delete ${deletingStudent?.name}?`} isLoading={deleteStudent.isPending} />
    </div>
  );
};

export default ManageStudents;
