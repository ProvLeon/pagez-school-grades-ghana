
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface DepartmentsHeaderProps {
  onAddNew: () => void;
}

export function DepartmentsHeader({ onAddNew }: DepartmentsHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Departments</h1>
        <p className="text-muted-foreground">
          Manage your school's departments.
        </p>
      </div>
      <Button onClick={onAddNew}>
        <Plus className="w-4 h-4 mr-2" />
        Add Department
      </Button>
    </div>
  );
}
