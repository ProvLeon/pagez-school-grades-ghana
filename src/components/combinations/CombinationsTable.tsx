
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Layers, Edit, Trash2 } from "lucide-react";
import { SubjectCombination, useDeleteSubjectCombination } from "@/hooks/useSubjectCombinations";
import { useSubjects } from "@/hooks/useSubjects";
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";
import { useState } from "react";

interface CombinationsTableProps {
  combinations: SubjectCombination[];
}

export function CombinationsTable({ combinations }: CombinationsTableProps) {
  const { data: subjects = [] } = useSubjects();
  const deleteSubjectCombination = useDeleteSubjectCombination();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [combinationToDelete, setCombinationToDelete] = useState<SubjectCombination | null>(null);

  const getSubjectNames = (subjectIds: string[]) => {
    return subjects
      .filter(subject => subjectIds.includes(subject.id))
      .map(subject => subject.name);
  };

  const handleDeleteClick = (combination: SubjectCombination) => {
    setCombinationToDelete(combination);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (combinationToDelete) {
      await deleteSubjectCombination.mutateAsync(combinationToDelete.id);
      setDeleteDialogOpen(false);
      setCombinationToDelete(null);
    }
  };

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50">
              <TableHead className="text-blue-700 font-bold text-sm uppercase tracking-wide py-4">Combination Details</TableHead>
              <TableHead className="text-blue-700 font-bold text-sm uppercase tracking-wide">Department</TableHead>
              <TableHead className="text-blue-700 font-bold text-sm uppercase tracking-wide">Subjects</TableHead>
              <TableHead className="text-blue-700 font-bold text-sm uppercase tracking-wide text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {combinations.map((combination) => (
              <TableRow key={combination.id} className="hover:bg-blue-50/50 transition-all duration-200 border-b border-blue-50/50 group">
                <TableCell className="py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center shadow-sm">
                      <Layers className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900 text-base">{combination.name}</span>
                      {combination.description && (
                        <p className="text-sm text-gray-500 mt-1">{combination.description}</p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-gray-200 px-3 py-1 rounded-lg">
                    {combination.department?.name || 'Unknown Department'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {getSubjectNames(combination.subject_ids).map((subjectName, index) => (
                      <Badge 
                        key={index} 
                        className="px-2 py-1 text-white font-medium text-xs bg-blue-500"
                      >
                        {subjectName}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-9 w-9 p-0 text-blue-600 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-all duration-200"
                      title="Edit Combination"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-9 w-9 p-0 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-all duration-200"
                      title="Delete Combination"
                      onClick={() => handleDeleteClick(combination)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Subject Combination"
        description="Are you sure you want to delete this subject combination"
        itemName={combinationToDelete?.name}
        isLoading={deleteSubjectCombination.isPending}
      />
    </>
  );
}
