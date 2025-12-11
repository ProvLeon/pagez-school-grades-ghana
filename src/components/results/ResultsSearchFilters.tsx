
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, X } from "lucide-react";

interface FilterState {
  class: string;
  department: string;
  session: string;
  term: string;
  teacher: string;
}

interface ResultsSearchFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  pageSize: string;
  setPageSize: (value: string) => void;
  classes: any[];
  departments: any[];
  teachers: any[];
  onClearFilters: () => void;
}

const ResultsSearchFilters = ({
  searchTerm,
  setSearchTerm,
  filters,
  setFilters,
  pageSize,
  setPageSize,
  classes,
  departments,
  teachers,
  onClearFilters
}: ResultsSearchFiltersProps) => {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by student..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 w-full"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="w-full md:w-auto">
            <Filter className="w-4 h-4 mr-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
          <Button variant="ghost" onClick={onClearFilters}>Clear</Button>
        </div>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-4 border-t">
          <Select value={filters.department} onValueChange={(value) => setFilters({...filters, department: value})}>
            <SelectTrigger><SelectValue placeholder="All Departments" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filters.class} onValueChange={(value) => setFilters({...filters, class: value})}>
            <SelectTrigger><SelectValue placeholder="All Classes" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes.filter(cls => filters.department === "all" || cls.department_id === filters.department).map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filters.teacher} onValueChange={(value) => setFilters({...filters, teacher: value})}>
            <SelectTrigger><SelectValue placeholder="All Teachers" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Teachers</SelectItem>
              {teachers.map((teacher) => (
                <SelectItem key={teacher.id} value={teacher.id}>{teacher.full_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filters.session} onValueChange={(value) => setFilters({...filters, session: value})}>
            <SelectTrigger><SelectValue placeholder="All Sessions" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sessions</SelectItem>
              <SelectItem value="2022/2023">2022/2023</SelectItem>
              <SelectItem value="2023/2024">2023/2024</SelectItem>
              <SelectItem value="2024/2025">2024/2025</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.term} onValueChange={(value) => setFilters({...filters, term: value})}>
            <SelectTrigger><SelectValue placeholder="All Terms" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Terms</SelectItem>
              <SelectItem value="first">First Term</SelectItem>
              <SelectItem value="second">Second Term</SelectItem>
              <SelectItem value="third">Third Term</SelectItem>
            </SelectContent>
          </Select>
          <Select value={pageSize} onValueChange={setPageSize}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 per page</SelectItem>
              <SelectItem value="25">25 per page</SelectItem>
              <SelectItem value="50">50 per page</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};

export default ResultsSearchFilters;
