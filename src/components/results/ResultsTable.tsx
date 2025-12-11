
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash, Eye, Download, MoreVertical, Globe } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Result } from "@/hooks/useResults";
import { useIsMobile } from "@/hooks/use-mobile";

interface ResultsTableProps {
  results: Result[];
  selectedResults: string[];
  isAllSelected: boolean;
  isIndeterminate: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
  onDownload: (id: string) => void;
  onPublish?: (result: Result) => void;
  onSelectAll: (checked: boolean) => void;
  onSelectResult: (id: string, checked: boolean) => void;
}

const ResultsTable = ({ results, ...props }: ResultsTableProps) => {
  const isMobile = useIsMobile();

  if (results.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Eye className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold">No Results Found</h3>
          <p className="text-muted-foreground text-sm">No results match your current search criteria.</p>
        </CardContent>
      </Card>
    );
  }

  return isMobile ? <MobileResultsView results={results} {...props} /> : <DesktopResultsView results={results} {...props} />;
};

const MobileResultsView = ({ results, selectedResults, onSelectResult, onView, onEdit, onDownload, onPublish, onDelete }: Omit<ResultsTableProps, 'isAllSelected' | 'isIndeterminate' | 'onSelectAll'>) => (
  <div className="space-y-4">
    {results.map((result) => (
      <Card key={result.id} className="p-4">
        <div className="flex items-start gap-4">
          <Checkbox
            checked={selectedResults.includes(result.id)}
            onCheckedChange={(checked) => onSelectResult(result.id, checked as boolean)}
            className="mt-1"
          />
          <div className="flex-1 space-y-1">
            <p className="font-semibold">{result.student?.full_name || 'Unknown'}</p>
            <p className="text-sm text-muted-foreground">{result.student?.student_id}</p>
            <p className="text-xs text-muted-foreground">{result.class?.name} &bull; {result.term} Term {result.academic_year}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(result.id)}>View</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(result.id)}>Edit</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDownload(result.id)}>Download</DropdownMenuItem>
              {onPublish && <DropdownMenuItem onClick={() => onPublish(result)}>Publish</DropdownMenuItem>}
              <DropdownMenuItem onClick={() => onDelete(result.id)} className="text-destructive">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>
    ))}
  </div>
);

const DesktopResultsView = ({ results, selectedResults, isAllSelected, isIndeterminate, onSelectAll, onSelectResult, onView, onEdit, onDownload, onPublish, onDelete }: ResultsTableProps) => (
  <Card>
    <CardContent className="p-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"><Checkbox checked={isAllSelected || isIndeterminate} onCheckedChange={onSelectAll} /></TableHead>
            <TableHead>Student</TableHead>
            <TableHead>Class/Dept</TableHead>
            <TableHead>Term/Session</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((result) => (
            <TableRow key={result.id}>
              <TableCell><Checkbox checked={selectedResults.includes(result.id)} onCheckedChange={(checked) => onSelectResult(result.id, checked as boolean)} /></TableCell>
              <TableCell>
                <div className="font-medium">{result.student?.full_name || 'Unknown'}</div>
                <div className="text-sm text-muted-foreground">{result.student?.student_id}</div>
              </TableCell>
              <TableCell>
                <div>{result.class?.name}</div>
                <div className="text-sm text-muted-foreground">{result.class?.department?.name || 'N/A'}</div>
              </TableCell>
              <TableCell>
                <div>{result.term} Term</div>
                <div className="text-sm text-muted-foreground">{result.academic_year}</div>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onView(result.id)}>View</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(result.id)}>Edit</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDownload(result.id)}>Download</DropdownMenuItem>
                    {onPublish && <DropdownMenuItem onClick={() => onPublish(result)}>Publish</DropdownMenuItem>}
                    <DropdownMenuItem onClick={() => onDelete(result.id)} className="text-destructive">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);

export default ResultsTable;
