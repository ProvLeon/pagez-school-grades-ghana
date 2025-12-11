import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Search, MoreHorizontal, Edit, Trash2, Building2, X, Eye, Users, BookOpen } from "lucide-react";
import { useDepartments, useDeleteDepartment, Department } from "@/hooks/useDepartments";
import { useSubjects } from "@/hooks/useSubjects";
import { useClasses } from "@/hooks/useClasses";
import { DepartmentFormDialog } from "@/components/departments/DepartmentFormDialog";
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { formatDepartmentForDisplay } from "@/utils/departmentMapping";
import { TablePagination } from "@/components/ui/table-pagination";

// Department Details Dialog Component
const DepartmentDetailsDialog = ({
  department,
  subjectCount,
  classCount,
  open,
  onOpenChange,
}: {
  department: Department | null;
  subjectCount: number;
  classCount: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  if (!department) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <span>{formatDepartmentForDisplay(department.name)}</span>
          </DialogTitle>
          <DialogDescription>Department details and statistics</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Department Name</p>
              <p className="text-sm font-semibold">{formatDepartmentForDisplay(department.name)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Created</p>
              <p className="text-sm">{new Date(department.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          {department.description && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Description</p>
              <p className="text-sm">{department.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <Card className="bg-muted/50">
              <CardContent className="p-4 flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xl font-bold">{subjectCount}</p>
                  <p className="text-xs text-muted-foreground">Subjects</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-muted/50">
              <CardContent className="p-4 flex items-center gap-3">
                <Users className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xl font-bold">{classCount}</p>
                  <p className="text-xs text-muted-foreground">Classes</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const ManageDepartments = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [viewingDepartment, setViewingDepartment] = useState<Department | null>(null);
  const [deletingDepartment, setDeletingDepartment] = useState<Department | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: departments = [], isLoading } = useDepartments();
  const { data: subjects = [] } = useSubjects();
  const { data: classes = [] } = useClasses();
  const deleteDepartment = useDeleteDepartment();

  // Filter departments based on search
  const filteredDepartments = departments.filter(dept => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      dept.name.toLowerCase().includes(search) ||
      dept.description?.toLowerCase().includes(search)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredDepartments.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedDepartments = filteredDepartments.slice(startIndex, startIndex + pageSize);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Ensure current page is valid
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [filteredDepartments.length, pageSize, currentPage, totalPages]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedDepartments([]); // Clear selection when changing pages
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
    setSelectedDepartments([]);
  };

  // Get counts for a department
  const getSubjectCount = (deptId: string) => subjects.filter(s => s.department_id === deptId).length;
  const getClassCount = (deptId: string) => classes.filter(c => c.department_id === deptId).length;

  const handleAdd = () => {
    setEditingDepartment(null);
    setIsFormOpen(true);
  };

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    setIsFormOpen(true);
  };

  const handleView = (department: Department) => {
    setViewingDepartment(department);
  };

  const handleDelete = (department: Department) => {
    setDeletingDepartment(department);
  };

  const confirmDelete = () => {
    if (deletingDepartment) {
      deleteDepartment.mutate(deletingDepartment.id, {
        onSuccess: () => setDeletingDepartment(null),
        onError: () => setDeletingDepartment(null),
      });
    }
  };

  const handleSelectDepartment = (deptId: string, checked: boolean) => {
    setSelectedDepartments(prev =>
      checked ? [...prev, deptId] : prev.filter(id => id !== deptId)
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedDepartments(checked ? paginatedDepartments.map(d => d.id) : []);
  };

  const getDepartmentInitials = (name: string) => {
    const normalized = formatDepartmentForDisplay(name);
    return normalized.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  // Stats
  const totalDepartments = departments.length;
  const totalSubjectsInDepts = subjects.length;
  const totalClassesInDepts = classes.length;

  return (
    <div className="min-h-screen bg-muted/40">
      <Header title="Manage Departments" />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Departments</h1>
            <p className="text-muted-foreground">
              Organize your school into departments. {totalDepartments} total departments.
            </p>
          </div>
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add Department
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col items-center gap-0 justify-center">
                {/*<div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>*/}
                {/*<div className="flex items-end ">*/}
                <p className="text-6xl font-bold text-primary">{totalDepartments}</p>
                <p className="text-xs text-muted-foreground">Departments</p>
                {/*</div>*/}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col items-center gap-0 justify-center">
                {/*<div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-gray-600" />
                </div>*/}
                {/*<div className="flex items-end ">*/}
                <p className="text-6xl font-bold text-gray-400">{totalSubjectsInDepts}</p>
                <p className="text-xs text-muted-foreground ">Subjects</p>
                {/*</div>*/}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col items-center gap-0 justify-center">
                {/*<div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-600" />
                </div>*/}
                {/*<div>*/}
                <p className="text-6xl font-bold text-gray-400">{totalClassesInDepts}</p>
                <p className="text-xs text-muted-foreground">Classes</p>
                {/*</div>*/}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col items-center gap-0 justify-center">
                {/*<div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">*/}
                <span className="text-6xl font-bold text-gray-400">
                  {totalDepartments > 0 ? Math.round(totalSubjectsInDepts / totalDepartments) : 0}
                </span>
                {/*</div>*/}
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg. Subjects</p>
                  <p className="text-xs text-muted-foreground">per department</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search departments..."
                  className="pl-9 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {searchTerm && (
                <Button variant="ghost" onClick={clearSearch} size="sm">
                  <X className="w-4 h-4 mr-2" />
                  Clear Search
                </Button>
              )}
            </div>

            {searchTerm && (
              <div className="mt-3 pt-3 border-t flex items-center gap-2 text-sm text-muted-foreground">
                <span>Showing {filteredDepartments.length} of {totalDepartments} departments</span>
                <Badge variant="default" className="font-normal">
                  Search: "{searchTerm}"
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedDepartments.length > 0 && (
          <Card className="border-primary/50 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">
                  {selectedDepartments.length} department{selectedDepartments.length > 1 ? 's' : ''} selected
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDepartments([])}
                  >
                    Clear Selection
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      if (selectedDepartments.length === 1) {
                        const dept = departments.find(d => d.id === selectedDepartments[0]);
                        if (dept) setDeletingDepartment(dept);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Selected
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Content Area */}
        {isLoading ? (
          <Card>
            <CardContent className="p-4 space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        ) : filteredDepartments.length === 0 ? (
          <div className="text-center py-20">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No departments found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {searchTerm
                ? "Try adjusting your search."
                : "Get started by adding a new department."}
            </p>
            {!searchTerm ? (
              <Button className="mt-6" onClick={handleAdd}>
                <Plus className="w-4 h-4 mr-2" />
                Add Department
              </Button>
            ) : (
              <Button variant="outline" className="mt-6" onClick={clearSearch}>
                <X className="w-4 h-4 mr-2" />
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40 hover:bg-muted/40">
                      <th className="p-4 text-left">
                        <Checkbox
                          checked={selectedDepartments.length === paginatedDepartments.length && paginatedDepartments.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </th>
                      <th className="p-4 text-left font-semibold">Department</th>
                      <th className="p-4 text-left font-semibold hidden md:table-cell">Description</th>
                      <th className="p-4 text-left font-semibold hidden sm:table-cell">Subjects</th>
                      <th className="p-4 text-left font-semibold hidden lg:table-cell">Classes</th>
                      <th className="p-4 text-left font-semibold hidden xl:table-cell">Created</th>
                      <th className="p-4 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedDepartments.map((department) => {
                      const subjectCount = getSubjectCount(department.id);
                      const classCount = getClassCount(department.id);

                      return (
                        <tr key={department.id} className="border-b hover:bg-muted/50">
                          <td className="p-4">
                            <Checkbox
                              checked={selectedDepartments.includes(department.id)}
                              onCheckedChange={(checked) => handleSelectDepartment(department.id, checked as boolean)}
                            />
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center font-semibold text-primary">
                                {getDepartmentInitials(department.name)}
                              </div>
                              <div>
                                <p className="font-medium">{formatDepartmentForDisplay(department.name)}</p>
                                <p className="text-muted-foreground text-xs md:hidden">
                                  {department.description?.slice(0, 30) || "No description"}
                                  {department.description && department.description.length > 30 ? "..." : ""}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 hidden md:table-cell">
                            <p className="text-muted-foreground truncate max-w-[200px]">
                              {department.description || "No description"}
                            </p>
                          </td>
                          <td className="p-4 hidden sm:table-cell">
                            <Badge variant="default">
                              <BookOpen className="w-3 h-3 mr-1" />
                              {subjectCount}
                            </Badge>
                          </td>
                          <td className="p-4 hidden lg:table-cell">
                            <Badge variant="outline">
                              <Users className="w-3 h-3 mr-1" />
                              {classCount}
                            </Badge>
                          </td>
                          <td className="p-4 hidden xl:table-cell text-muted-foreground">
                            {new Date(department.created_at).toLocaleDateString()}
                          </td>
                          <td className="p-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleView(department)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEdit(department)}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDelete(department)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredDepartments.length}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                pageSizeOptions={[10, 20, 30, 50]}
              />
            </CardContent>
          </Card>
        )}
      </main>

      {/* Dialogs */}
      <DepartmentFormDialog
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        department={editingDepartment}
      />

      <DepartmentDetailsDialog
        department={viewingDepartment}
        subjectCount={viewingDepartment ? getSubjectCount(viewingDepartment.id) : 0}
        classCount={viewingDepartment ? getClassCount(viewingDepartment.id) : 0}
        open={!!viewingDepartment}
        onOpenChange={(open) => !open && setViewingDepartment(null)}
      />

      <DeleteConfirmationDialog
        isOpen={!!deletingDepartment}
        onOpenChange={(open) => !open && setDeletingDepartment(null)}
        onConfirm={confirmDelete}
        title="Delete Department"
        description={`Are you sure you want to delete the "${deletingDepartment?.name}" department? This will affect all associated subjects and classes. This action cannot be undone.`}
        isLoading={deleteDepartment.isPending}
      />
    </div>
  );
};

export default ManageDepartments;
