import { useState, useMemo } from "react";
import { useTeacherResults } from "@/hooks/useTeacherResults";
import { useClasses } from "@/hooks/useClasses";
import { useDepartments } from "@/hooks/useDepartments";
import { useTeachers } from "@/hooks/useTeachers";
import { useReportCards } from "@/hooks/useReportCards";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Header } from "@/components/Header";
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";
import ManageResultsHeader from "@/components/results/ManageResultsHeader";
import ManageResultsMobileFilters from "@/components/results/ManageResultsMobileFilters";
import ManageResultsFilters from "@/components/results/ManageResultsFilters";
import ManageResultsContent from "@/components/results/ManageResultsContent";
import ManageResultsLoadingState from "@/components/results/ManageResultsLoadingState";
import ManageResultsBulkActions from "@/components/results/ManageResultsBulkActions";
import { useCanAccessClass } from "@/hooks/useTeacherClassAccess";

const TeacherManageResults = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { generateSingleReport } = useReportCards();
  const { getAccessibleClassIds } = useCanAccessClass();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [selectedResults, setSelectedResults] = useState<string[]>([]);
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    resultId: "",
    studentName: ""
  });
  
  const [filters, setFilters] = useState({
    class: "all",
    department: "all",
    session: "all",
    term: "all",
    teacher: "all",
  });

  const { data: results = [], isLoading } = useTeacherResults();
  const { data: classes = [] } = useClasses();
  const { data: departments = [] } = useDepartments();
  const { data: teachers = [] } = useTeachers();
  const accessibleClassIds = getAccessibleClassIds();

  // Filter classes to only show accessible ones
  const accessibleClasses = classes.filter(cls => accessibleClassIds.includes(cls.id));

  // Delete mutation
  const deleteResultMutation = useMutation({
    mutationFn: async (resultId: string) => {
      const { error: subjectMarksError } = await supabase
        .from('subject_marks')
        .delete()
        .eq('result_id', resultId);
      
      if (subjectMarksError) throw subjectMarksError;
      
      const { error: resultError } = await supabase
        .from('results')
        .delete()
        .eq('id', resultId);
      
      if (resultError) throw resultError;
      
      return resultId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher_results'] });
      toast({
        title: "Result Deleted",
        description: "The result has been successfully deleted.",
      });
      setDeleteDialog({ isOpen: false, resultId: "", studentName: "" });
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete the result. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Filter and search logic
  const filteredResults = useMemo(() => {
    return results.filter(result => {
      const matchesSearch = !searchTerm || 
        result.student?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.student?.student_id?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesClass = filters.class === "all" || result.class_id === filters.class;
      const matchesDepartment = filters.department === "all" || result.class?.department_id === filters.department;
      const matchesSession = filters.session === "all" || result.academic_year === filters.session;
      const matchesTerm = filters.term === "all" || result.term === filters.term;
      const matchesTeacher = filters.teacher === "all" || result.teacher_id === filters.teacher;

      return matchesSearch && matchesClass && matchesDepartment && matchesSession && 
             matchesTerm && matchesTeacher;
    });
  }, [results, searchTerm, filters]);

  // Pagination logic
  const totalEntries = filteredResults.length;
  const entriesPerPage = parseInt(pageSize);
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = Math.min(startIndex + entriesPerPage, totalEntries);
  const currentResults = filteredResults.slice(startIndex, endIndex);

  // Action handlers
  const handleEdit = (resultId: string) => {
    navigate(`/teacher/results/edit/${resultId}`);
  };

  const handleDelete = (resultId: string) => {
    const result = results.find(r => r.id === resultId);
    const studentName = result?.student?.full_name || "Unknown Student";
    
    setDeleteDialog({
      isOpen: true,
      resultId,
      studentName
    });
  };

  const confirmDelete = () => {
    if (deleteDialog.resultId) {
      deleteResultMutation.mutate(deleteDialog.resultId);
    }
  };

  const handleView = (resultId: string) => {
    navigate(`/results/view/${resultId}`);
  };

  const handleDownload = (resultId: string) => {
    generateSingleReport(resultId);
  };

  // Calculate summary stats
  const approvedResults = results.filter(r => r.admin_approved).length;
  const pendingResults = results.filter(r => !r.admin_approved).length;

  if (isLoading) {
    return <ManageResultsLoadingState />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Header 
        title="My Results" 
        subtitle="Manage results for your assigned classes"
      />
      
      <div className="p-3 sm:p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
          <ManageResultsHeader
            totalEntries={totalEntries}
            approvedResults={approvedResults}
            pendingResults={pendingResults}
          />

          <ManageResultsContent
            currentResults={currentResults}
            totalEntries={totalEntries}
            startIndex={startIndex}
            endIndex={endIndex}
            currentPage={currentPage}
            totalPages={totalPages}
            activeFilterCount={0}
            selectedResults={selectedResults}
            isAllSelected={false}
            isIndeterminate={false}
            onPageChange={setCurrentPage}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
            onDownload={handleDownload}
            onClearFilters={() => {}}
            onSelectAll={() => {}}
            onSelectResult={() => {}}
          />
        </div>
      </div>

      <DeleteConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, isOpen: open }))}
        onConfirm={confirmDelete}
        title="Delete Result"
        description="Are you sure you want to delete the result for"
        itemName={deleteDialog.studentName}
        isLoading={deleteResultMutation.isPending}
      />
    </div>
  );
};

export default TeacherManageResults;