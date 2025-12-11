import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X, Filter } from "lucide-react";
import { useDepartments } from "@/hooks/useDepartments";
import { Card, CardContent } from "@/components/ui/card";

interface SubjectsSearchFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  departmentFilter: string;
  onDepartmentChange: (value: string) => void;
}

export function SubjectsSearchFilters({
  searchTerm,
  onSearchChange,
  departmentFilter,
  onDepartmentChange,
}: SubjectsSearchFiltersProps) {
  const { data: departments = [] } = useDepartments();

  const hasActiveFilters = searchTerm || (departmentFilter && departmentFilter !== "all");

  const clearFilters = () => {
    onSearchChange("");
    onDepartmentChange("all");
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row items-center gap-4">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search subjects by name or code..."
              className="pl-9 w-full"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          {/* Department Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Select value={departmentFilter || "all"} onValueChange={onDepartmentChange}>
              <SelectTrigger className="w-full md:w-[200px]">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <SelectValue placeholder="All Departments" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="mt-3 pt-3 border-t flex items-center gap-2 text-sm text-muted-foreground">
            <span>Active filters:</span>
            {searchTerm && (
              <span className="bg-muted px-2 py-0.5 rounded text-foreground">
                Search: "{searchTerm}"
              </span>
            )}
            {departmentFilter && departmentFilter !== "all" && (
              <span className="bg-muted px-2 py-0.5 rounded text-foreground">
                Department: {departments.find(d => d.id === departmentFilter)?.name || departmentFilter}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
