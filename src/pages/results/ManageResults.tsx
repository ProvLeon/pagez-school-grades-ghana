
import { useState, useMemo } from "react";
import { useResults } from "@/hooks/useResults";
import { useClasses } from "@/hooks/useClasses";
import { useDepartments } from "@/hooks/useDepartments";
import { useTeachers } from "@/hooks/useTeachers";
import { useReportCards } from "@/hooks/useReportCards";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, BarChart3, Search, X, Users, Info } from "lucide-react";
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";
import ManageResultsContent from "@/components/results/ManageResultsContent";
import ManageResultsBulkActions from "@/components/results/ManageResultsBulkActions";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useCanAccessClass } from "@/hooks/useTeacherClassAccess";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ManageResults = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { generateSingleReport } = useReportCards();
  const { isTeacher, isAdmin } = useAuth();
  const { getAccessibleClassIds } = useCanAccessClass();
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedResults, setSelectedResults] = useState<string[]>([]);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, resultId: "", studentName: "" });
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState({ isOpen: false, count: 0 });
  const [filters, setFilters] = useState({
    class_id: "",
    department_id: "",
    academic_year: "",
    term: "",
    teacher_id: "",
  });

  const { data: results = [], isLoading } = useResults();
  const { data: allClasses = [] } = useClasses();
  const { data: departments = [] } = useDepartments();
  const { data: teachers = [] } = useTeachers();

  // For teachers, only show their assigned classes
  const accessibleClassIds = getAccessibleClassIds();
  const classes = useMemo(() => {
    if (isAdmin) return allClasses;
    if (isTeacher && accessibleClassIds.length > 0) {
      return allClasses.filter(cls => accessibleClassIds.includes(cls.id));
    }
    return allClasses;
  }, [allClasses, isAdmin, isTeacher, accessibleClassIds]);

  const deleteResultMutation = useMutation({
    mutationFn: async (resultId: string) => {
      const { error: subjectMarksError } = await supabase.from('subject_marks').delete().eq('result_id', resultId);
      if (subjectMarksError) throw subjectMarksError;
      const { error: resultError } = await supabase.from('results').delete().eq('id', resultId);
      if (resultError) throw resultError;
      return resultId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['results'] });
      toast({ title: "Result Deleted", description: "The result has been successfully deleted." });
      setDeleteDialog({ isOpen: false, resultId: "", studentName: "" });
    },
    onError: (error: Error) => {
      toast({ title: "Delete Failed", description: error.message || "Failed to delete result.", variant: "destructive" });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (resultIds: string[]) => {
      const { error: subjectMarksError } = await supabase.from('subject_marks').delete().in('result_id', resultIds);
      if (subjectMarksError) throw subjectMarksError;
      const { error: resultError } = await supabase.from('results').delete().in('id', resultIds);
      if (resultError) throw resultError;
      return resultIds;
    },
    onSuccess: (deletedIds) => {
      queryClient.invalidateQueries({ queryKey: ['results'] });
      setSelectedResults([]);
      setBulkDeleteDialog({ isOpen: false, count: 0 });
      toast({ title: "Results Deleted", description: `${deletedIds.length} results deleted.` });
    },
    onError: (error: Error) => {
      toast({ title: "Bulk Delete Failed", description: error.message || "Failed to delete results.", variant: "destructive" });
    },
  });

  const filteredResults = useMemo(() => {
    return results.filter(result => {
      // For teachers, only show results for their assigned classes
      if (isTeacher && !isAdmin && accessibleClassIds.length > 0) {
        if (!accessibleClassIds.includes(result.class_id)) {
          return false;
        }
      }

      const matchesSearch = !searchTerm ||
        result.student?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.student?.student_id?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesClass = !filters.class_id || filters.class_id === 'all' || result.class_id === filters.class_id;
      const matchesDepartment = !filters.department_id || filters.department_id === 'all' || result.class?.department_id === filters.department_id;
      const matchesSession = !filters.academic_year || result.academic_year === filters.academic_year;
      const matchesTerm = !filters.term || result.term === filters.term;
      const matchesTeacher = !filters.teacher_id || result.teacher_id === filters.teacher_id;
      return matchesSearch && matchesClass && matchesDepartment && matchesSession && matchesTerm && matchesTeacher;
    });
  }, [results, searchTerm, filters, isTeacher, isAdmin, accessibleClassIds]);

  const totalEntries = filteredResults.length;
  const entriesPerPage = parseInt(pageSize);
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = Math.min(startIndex + entriesPerPage, totalEntries);
  const currentResults = filteredResults.slice(startIndex, endIndex);

  const handleSelectAll = (checked: boolean) => {
    setSelectedResults(checked ? currentResults.map(r => r.id) : []);
  };

  const handleSelectResult = (resultId: string, checked: boolean) => {
    setSelectedResults(prev => checked ? [...prev, resultId] : prev.filter(id => id !== resultId));
  };

  const confirmBulkDelete = () => {
    if (selectedResults.length > 0) bulkDeleteMutation.mutate(selectedResults);
  };

  const confirmDelete = () => {
    if (deleteDialog.resultId) deleteResultMutation.mutate(deleteDialog.resultId);
  };

  const clearFilters = () => {
    setFilters({ class_id: "", department_id: "", academic_year: "", term: "", teacher_id: "" });
    setSearchTerm("");
    setCurrentPage(1);
    setSelectedResults([]);
  };

  const activeFilters = Object.values(filters).filter(Boolean).length + (searchTerm ? 1 : 0);

  const isAllSelected = currentResults.length > 0 && currentResults.every(r => selectedResults.includes(r.id));
  const isIndeterminate = selectedResults.length > 0 && !isAllSelected;

  return (
    <div className="min-h-screen bg-muted/40">
      <Header
        title="Manage Results"
        subtitle={isTeacher && !isAdmin
          ? "View and manage results for your assigned classes"
          : "Review, manage and track student academic performance"
        }
      />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Teacher info alert */}
        {isTeacher && !isAdmin && (
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-700">
              You are viewing results for your {accessibleClassIds.length} assigned class{accessibleClassIds.length !== 1 ? 'es' : ''}.
              Contact an administrator if you need access to additional classes.
            </AlertDescription>
          </Alert>
        )}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Results</h1>
            <p className="text-muted-foreground">Review, manage and track student academic performance.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => navigate('/results/add-results')}>
              <Plus className="w-4 h-4 mr-2" />
              Add Result
            </Button>
            <Button variant="outline" onClick={() => navigate('/results/analytics')}>
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search results..."
                  className="pl-9 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {/* Show class filter for admins OR teachers with multiple classes */}
              {(isAdmin || (isTeacher && accessibleClassIds.length > 1)) && (
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
                  {/* Only show department filter for admins */}
                  {isAdmin && (
                    <Select value={filters.department_id} onValueChange={(value) => setFilters(prev => ({ ...prev, department_id: value }))}>
                      <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Filter by department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                  {activeFilters > 0 && (
                    <Button variant="ghost" onClick={clearFilters}>
                      <X className="w-4 h-4 mr-2" />
                      Clear Filters
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {selectedResults.length > 0 && (
          <ManageResultsBulkActions
            selectedCount={selectedResults.length}
            onBulkDelete={() => setBulkDeleteDialog({ isOpen: true, count: selectedResults.length })}
            onBulkDownload={() => { }}
            onClearSelection={() => setSelectedResults([])}
            isDeleting={bulkDeleteMutation.isPending}
          />
        )}

        {isLoading ? (
          <div className="border rounded-lg p-4 space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : currentResults.length === 0 ? (
          <div className="text-center py-20">
            <Users className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No results found</h3>
            <p className="mt-2 text-sm text-muted-foreground">Get started by adding a new result.</p>
            <Button className="mt-6" onClick={() => navigate('/results/add-results')}>
              <Plus className="w-4 h-4 mr-2" />
              Add Result
            </Button>
          </div>
        ) : (
          <ManageResultsContent
            currentResults={currentResults}
            totalEntries={totalEntries}
            startIndex={startIndex}
            endIndex={endIndex}
            currentPage={currentPage}
            totalPages={totalPages}
            activeFilterCount={activeFilters}
            selectedResults={selectedResults}
            isAllSelected={isAllSelected}
            isIndeterminate={isIndeterminate}
            onPageChange={setCurrentPage}
            onEdit={(id) => navigate(`/results/edit/${id}`)}
            onDelete={(id) => {
              const result = results.find(r => r.id === id);
              setDeleteDialog({ isOpen: true, resultId: id, studentName: result?.student?.full_name || '' });
            }}
            onView={(id) => navigate(`/results/view/${id}`)}
            onDownload={(id) => generateSingleReport(id)}
            onClearFilters={clearFilters}
            onSelectAll={handleSelectAll}
            onSelectResult={handleSelectResult}
          />
        )}
      </main>

      <DeleteConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, isOpen: open }))}
        onConfirm={confirmDelete}
        title="Delete Result"
        description={`Are you sure you want to delete the result for ${deleteDialog.studentName}?`}
        isLoading={deleteResultMutation.isPending}
      />

      <DeleteConfirmationDialog
        isOpen={bulkDeleteDialog.isOpen}
        onOpenChange={(open) => setBulkDeleteDialog(prev => ({ ...prev, isOpen: open }))}
        onConfirm={confirmBulkDelete}
        title="Delete Selected Results"
        description={`Are you sure you want to delete ${bulkDeleteDialog.count} selected results? This action cannot be undone.`}
        isLoading={bulkDeleteMutation.isPending}
      />
    </div>
  );
};

export default ManageResults;
