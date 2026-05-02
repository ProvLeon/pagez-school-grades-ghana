import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Download, X, Loader2, Globe, EyeOff } from "lucide-react";

interface ManageResultsBulkActionsProps {
  selectedCount: number;
  onBulkDelete: () => void;
  onBulkDownload: () => void;
  onBulkPublish: (publish: boolean) => void;
  onClearSelection: () => void;
  isDeleting: boolean;
  isDownloading?: boolean;
  isPublishing?: boolean;
}

const ManageResultsBulkActions = ({
  selectedCount,
  onBulkDelete,
  onBulkDownload,
  onBulkPublish,
  onClearSelection,
  isDeleting,
  isDownloading = false,
  isPublishing = false,
}: ManageResultsBulkActionsProps) => {
  const isBusy = isDeleting || isDownloading || isPublishing;

  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="text-sm font-medium text-blue-700">
              {selectedCount} result{selectedCount !== 1 ? 's' : ''} selected
            </div>
            <div className="flex flex-wrap gap-2">

              {/* Publish Selected */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onBulkPublish(true)}
                disabled={isBusy}
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Publishing…
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4 mr-2" />
                    Publish Selected
                  </>
                )}
              </Button>

              {/* Unpublish Selected */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onBulkPublish(false)}
                disabled={isBusy}
                className="text-gray-600 border-gray-200 hover:bg-gray-50"
              >
                <EyeOff className="w-4 h-4 mr-2" />
                Unpublish
              </Button>

              {/* Download */}
              <Button
                variant="outline"
                size="sm"
                onClick={onBulkDownload}
                disabled={isBusy}
                className="text-green-600 border-green-200 hover:bg-green-50"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Downloading…
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Download All
                  </>
                )}
              </Button>

              {/* Delete */}
              <Button
                variant="outline"
                size="sm"
                onClick={onBulkDelete}
                disabled={isBusy}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting…
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete All
                  </>
                )}
              </Button>

            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            disabled={isBusy}
            className="text-gray-500 hover:text-gray-700 shrink-0"
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
