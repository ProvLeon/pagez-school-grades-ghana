
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SubjectWithDepartment } from "@/hooks/useSubjects";

interface SubjectsMobileViewProps {
  subjects: SubjectWithDepartment[];
  onEdit: (subject: SubjectWithDepartment) => void;
  onDelete: (subject: SubjectWithDepartment) => void;
}

export function SubjectsMobileView({ subjects, onEdit, onDelete }: SubjectsMobileViewProps) {
  return (
    <div className="space-y-4">
      {subjects.map((subject) => (
        <Card key={subject.id} className="p-4">
          <div className="flex items-start gap-4">
            <div className="flex-1 space-y-1">
              <p className="font-medium">{subject.name}</p>
              <p className="text-sm text-muted-foreground">Code: {subject.code || "N/A"}</p>
              <div className="flex items-center pt-2">
                <Badge variant="outline">{subject.department?.name || "N/A"}</Badge>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(subject)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(subject)} className="text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Card>
      ))}
    </div>
  );
}
