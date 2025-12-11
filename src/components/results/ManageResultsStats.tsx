
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ManageResultsStatsProps {
  startIndex: number;
  endIndex: number;
  totalEntries: number;
  activeFilterCount: number;
  onClearFilters: () => void;
}

const ManageResultsStats = ({
  startIndex,
  endIndex,
  totalEntries,
  activeFilterCount,
  onClearFilters
}: ManageResultsStatsProps) => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
      <p>
        Showing <strong>{startIndex + 1}-{endIndex}</strong> of <strong>{totalEntries}</strong> results.
        {activeFilterCount > 0 && (
          <span className="ml-2">
            ({activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} applied)
          </span>
        )}
      </p>
      {activeFilterCount > 0 && (
        <Button variant="ghost" size="sm" onClick={onClearFilters}>
          <X className="w-4 h-4 mr-2" />
          Clear Filters
        </Button>
      )}
    </div>
  );
};

export default ManageResultsStats;
