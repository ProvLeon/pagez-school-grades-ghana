
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";

interface TransferFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filters: {
    status: string;
    academic_year: string;
    from_class: string;
    to_class: string;
  };
  setFilters: (filters: any) => void;
  onClearFilters: () => void;
  classes: any[];
}

const TransferFilters = ({
  searchTerm,
  setSearchTerm,
  filters,
  setFilters,
  onClearFilters,
  classes = []
}: TransferFiltersProps) => {
  const activeFilterCount = Object.values(filters).filter(f => f !== "all").length + (searchTerm ? 1 : 0);

  return (
    <div className="flex flex-col md:flex-row gap-4 w-full">
      <div className="relative w-full md:w-80">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by student..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 w-full"
        />
      </div>
      <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
        <SelectTrigger className="w-full md:w-40"><SelectValue placeholder="All Status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="approved">Approved</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
        </SelectContent>
      </Select>
      {activeFilterCount > 0 && (
        <Button variant="ghost" onClick={onClearFilters}>
          <X className="w-4 h-4 mr-2" />
          Clear Filters
        </Button>
      )}
    </div>
  );
};

export default TransferFilters;
