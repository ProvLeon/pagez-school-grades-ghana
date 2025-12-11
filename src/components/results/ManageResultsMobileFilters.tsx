
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, X } from "lucide-react";

interface ManageResultsMobileFiltersProps {
  showMobileFilters: boolean;
  setShowMobileFilters: (show: boolean) => void;
  activeFilterCount: number;
}

const ManageResultsMobileFilters = ({
  showMobileFilters,
  setShowMobileFilters,
  activeFilterCount
}: ManageResultsMobileFiltersProps) => {
  return (
    <div className="md:hidden">
      <Button
        variant="outline"
        onClick={() => setShowMobileFilters(!showMobileFilters)}
        className="w-full flex items-center justify-between p-4 bg-white shadow-md border-blue-200 hover:bg-blue-50 transition-all duration-200 min-h-[48px]"
      >
        <div className="flex items-center">
          <Filter className="w-5 h-5 mr-3 text-blue-600" />
          <span className="font-medium text-base">Filters & Search</span>
          {activeFilterCount > 0 && (
            <Badge className="ml-3 bg-blue-600 text-white px-2 py-1 text-xs">
              {activeFilterCount}
            </Badge>
          )}
        </div>
        {showMobileFilters ? (
          <X className="w-5 h-5 text-gray-500" />
        ) : (
          <Filter className="w-5 h-5 text-gray-500" />
        )}
      </Button>
    </div>
  );
};

export default ManageResultsMobileFilters;
