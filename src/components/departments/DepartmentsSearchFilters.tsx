
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface DepartmentsSearchFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export function DepartmentsSearchFilters({ 
  searchTerm, 
  onSearchChange, 
}: DepartmentsSearchFiltersProps) {
  return (
    <div className="relative w-full md:w-80">
      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <Input 
        placeholder="Search departments..." 
        className="pl-9 w-full"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  );
}
