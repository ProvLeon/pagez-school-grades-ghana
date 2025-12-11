
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Download, X } from "lucide-react";

interface ManageResultsBulkActionsProps {
  selectedCount: number;
  onBulkDelete: () => void;
  onBulkDownload: () => void;
  onClearSelection: () => void;
  isDeleting: boolean;
}

const ManageResultsBulkActions = ({
  selectedCount,
  onBulkDelete,
  onBulkDownload,
  onClearSelection,
  isDeleting
}: ManageResultsBulkActionsProps) => {
  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium text-blue-700">
              {selectedCount} result{selectedCount !== 1 ? 's' : ''} selected
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onBulkDownload}
                className="text-green-600 border-green-200 hover:bg-green-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Download All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onBulkDelete}
                disabled={isDeleting}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {isDeleting ? 'Deleting...' : 'Delete All'}
              </Button>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4 mr-1" />
            Clear Selection
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ManageResultsBulkActions;
