
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDepartments } from "@/hooks/useDepartments";

interface TeacherSearchFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedDepartment: string;
  setSelectedDepartment: (dept: string) => void;
}

const TeacherSearchFilters = ({
  searchTerm,
  setSearchTerm,
  selectedDepartment,
  setSelectedDepartment
}: TeacherSearchFiltersProps) => {
  const { data: departments = [] } = useDepartments();

  return (
    <div className="flex flex-col md:flex-row gap-4 w-full">
      <div className="relative w-full md:w-80">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search teachers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 w-full"
        />
      </div>
      <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
        <SelectTrigger className="w-full md:w-60">
          <SelectValue placeholder="All Departments" />
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
    </div>
  );
};

export default TeacherSearchFilters;
