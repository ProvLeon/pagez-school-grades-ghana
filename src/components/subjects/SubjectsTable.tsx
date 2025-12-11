
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SubjectWithDepartment } from "@/hooks/useSubjects";

interface SubjectsTableProps {
  subjects: SubjectWithDepartment[];
  onEdit: (subject: SubjectWithDepartment) => void;
  onDelete: (subject: SubjectWithDepartment) => void;
}

export function SubjectsTable({ subjects, onEdit, onDelete }: SubjectsTableProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead>Subject</TableHead>
            <TableHead className="hidden sm:table-cell">Code</TableHead>
            <TableHead className="hidden md:table-cell">Department</TableHead>
            <TableHead className="hidden lg:table-cell">Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subjects.map((subject) => (
            <TableRow key={subject.id}>
              <TableCell className="font-medium">{subject.name}</TableCell>
              <TableCell className="hidden sm:table-cell">
                <Badge variant="outline">{subject.code || "N/A"}</Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell text-muted-foreground">{subject.department?.name || "N/A"}</TableCell>
              <TableCell className="hidden lg:table-cell text-muted-foreground">
                {new Date(subject.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="w-4 h-4" />
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
