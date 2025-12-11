
import ResultsTable from "@/components/results/ResultsTable";
import ResultsPagination from "@/components/results/ResultsPagination";
import ManageResultsStats from "@/components/results/ManageResultsStats";
import { Result } from "@/hooks/useResults";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Trash2, Download, MoreHorizontal, Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useReportCards } from "@/hooks/useReportCards";
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";
import { PublishReportDialog } from "./PublishReportDialog";
import { useState } from "react";

interface ManageResultsContentProps {
  currentResults: Result[];
  totalEntries: number;
  startIndex: number;
  endIndex: number;
  currentPage: number;
  totalPages: number;
  activeFilterCount: number;
  selectedResults: string[];
  isAllSelected: boolean;
  isIndeterminate: boolean;
  onPageChange: (page: number) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
  onDownload: (id: string) => void;
  onClearFilters: () => void;
  onSelectAll: (checked: boolean) => void;
  onSelectResult: (id: string, checked: boolean) => void;
}

const ManageResultsContent = ({
  currentResults,
  totalEntries,
  startIndex,
  endIndex,
  currentPage,
  totalPages,
  activeFilterCount,
  selectedResults,
  isAllSelected,
  isIndeterminate,
  onPageChange,
  onEdit,
  onDelete,
  onView,
  onDownload,
  onClearFilters,
  onSelectAll,
  onSelectResult
}: ManageResultsContentProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState<any>(null);

  const handleDelete = async () => {
    if (selectedResult) {
      onDelete(selectedResult.id);
      setDeleteDialogOpen(false);
      setSelectedResult(null);
    }
  };
  return (
    <>
      {/* Results Table */}
      <ResultsTable
        results={currentResults}
        totalResults={totalEntries}
        startIndex={startIndex}
        endIndex={endIndex}
        selectedResults={selectedResults}
        isAllSelected={isAllSelected}
        isIndeterminate={isIndeterminate}
        onEdit={onEdit}
        onDelete={onDelete}
        onView={onView}
        onDownload={onDownload}
        onPublish={(result) => {
          setSelectedResult(result);
          setPublishDialogOpen(true);
        }}
        onSelectAll={onSelectAll}
        onSelectResult={onSelectResult}
      />

      {/* Stats Card - moved here to appear beneath the table */}
      <ManageResultsStats
        startIndex={startIndex}
        endIndex={endIndex}
        totalEntries={totalEntries}
        activeFilterCount={activeFilterCount}
        onClearFilters={onClearFilters}
      />

      {/* Pagination */}
      <ResultsPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalEntries={totalEntries}
        startIndex={startIndex}
        endIndex={endIndex}
        onPageChange={onPageChange}
      />

      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Delete Result"
        description="Are you sure you want to delete this result? This action cannot be undone."
        isLoading={false}
      />

      {selectedResult && (
        <PublishReportDialog
          isOpen={publishDialogOpen}
          onClose={() => {
            setPublishDialogOpen(false);
            setSelectedResult(null);
          }}
          result={selectedResult}
        />
      )}
    </>
  );
};

export default ManageResultsContent;
