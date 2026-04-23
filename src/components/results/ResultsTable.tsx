import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Eye, Trash, Download, MoreVertical } from "lucide-react";
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
  totalResults?: number;
  startIndex?: number;
  endIndex?: number;
}

// ─── Shared badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ result }: { result: Result }) =>
  !result.subject_marks || result.subject_marks.length === 0 ? (
    <Badge
      variant="outline"
      className="text-[10px] uppercase font-bold py-0.5 px-2 bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
    >
      Pending Scores
    </Badge>
  ) : (
    <Badge
      variant="secondary"
      className="text-[10px] uppercase font-bold py-0.5 px-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-0 dark:bg-emerald-500/10 dark:text-emerald-400"
    >
      Scores Added
    </Badge>
  );

// ─── Avatar ───────────────────────────────────────────────────────────────────
const StudentAvatar = ({ result, size = "md" }: { result: Result; size?: "sm" | "md" }) => {
  const dim = size === "sm" ? "w-10 h-10" : "w-12 h-12";
  return (
    <div
      className={`shrink-0 ${dim} rounded-full overflow-hidden bg-indigo-50 border border-slate-200 dark:border-slate-800 flex items-center justify-center`}
    >
      {result.student?.photo_url ? (
        <img
          src={result.student.photo_url}
          alt={result.student.full_name}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="text-indigo-600 font-bold text-lg uppercase">
          {result.student?.full_name?.charAt(0) || "?"}
        </span>
      )}
    </div>
  );
};

// ─── Desktop row ──────────────────────────────────────────────────────────────
interface RowProps {
  result: Result;
  selectedResults: string[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
  onDownload: (id: string) => void;
  onPublish?: (result: Result) => void;
  onSelectResult: (id: string, checked: boolean) => void;
}

const DesktopResultRow = ({
  result,
  selectedResults,
  onEdit,
  onDelete,
  onView,
  onDownload,
  onPublish,
  onSelectResult,
}: RowProps) => {
  // When the dropdown closes, a click event fires on the underlying row
  // (Radix "click-through" behaviour). This ref blocks that stray click.
  const menuJustClosed = useRef(false);

  const handleRowClick = (e: React.MouseEvent<HTMLTableRowElement>) => {
    // Swallow the click that arrives immediately after the dropdown closes.
    if (menuJustClosed.current) return;

    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest('[role="checkbox"]')) return;

    onView(result.id);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      menuJustClosed.current = true;
      // Clear after the current event loop so normal subsequent clicks work.
      requestAnimationFrame(() => {
        menuJustClosed.current = false;
      });
    }
  };

  return (
    <TableRow
      className="cursor-pointer hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5 transition-colors group"
      onClick={handleRowClick}
    >
      <TableCell>
        <Checkbox
          checked={selectedResults.includes(result.id)}
          onCheckedChange={(checked) =>
            onSelectResult(result.id, checked as boolean)
          }
        />
      </TableCell>

      <TableCell>
        <div className="flex items-center gap-3">
          <StudentAvatar result={result} size="sm" />
          <div>
            <div className="font-medium">{result.student?.full_name || "Unknown"}</div>
            <div className="text-sm text-muted-foreground">
              {result.student?.student_id}
            </div>
          </div>
        </div>
      </TableCell>

      <TableCell>
        <div>{result.class?.name}</div>
        <div className="text-sm text-muted-foreground">
          {result.class?.department?.name || "N/A"}
        </div>
      </TableCell>

      <TableCell>
        <div>{result.term} Term</div>
        <div className="text-sm text-muted-foreground">{result.academic_year}</div>
      </TableCell>

      <TableCell>
        <StatusBadge result={result} />
      </TableCell>

      <TableCell className="text-right">
        <DropdownMenu onOpenChange={handleOpenChange}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onView(result.id);
              }}
            >
              View
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onEdit(result.id);
              }}
            >
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDownload(result.id);
              }}
            >
              Download
            </DropdownMenuItem>
            {onPublish && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onPublish(result);
                }}
              >
                Publish
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDelete(result.id);
              }}
              className="text-destructive"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};

// ─── Mobile row ───────────────────────────────────────────────────────────────
const MobileResultRow = ({
  result,
  selectedResults,
  onEdit,
  onDelete,
  onView,
  onDownload,
  onPublish,
  onSelectResult,
}: RowProps) => {
  const menuJustClosed = useRef(false);

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (menuJustClosed.current) return;
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest('[role="checkbox"]')) return;
    onView(result.id);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      menuJustClosed.current = true;
      requestAnimationFrame(() => {
        menuJustClosed.current = false;
      });
    }
  };

  return (
    <Card
      className="p-4 cursor-pointer hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all hover:shadow-md hover:shadow-indigo-500/5"
      onClick={handleCardClick}
    >
      <div className="flex items-start gap-4">
        <Checkbox
          checked={selectedResults.includes(result.id)}
          onCheckedChange={(checked) =>
            onSelectResult(result.id, checked as boolean)
          }
          className="mt-1"
        />

        <div className="flex items-center gap-3 flex-1 overflow-hidden">
          <StudentAvatar result={result} />
          <div className="flex-1 space-y-1 truncate">
            <p className="font-semibold truncate">
              {result.student?.full_name || "Unknown"}
            </p>
            <p className="text-sm text-muted-foreground truncate">
              {result.student?.student_id}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {result.class?.name} &bull; {result.term} Term {result.academic_year}
            </p>
            <StatusBadge result={result} />
          </div>
        </div>

        <DropdownMenu onOpenChange={handleOpenChange}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onView(result.id);
              }}
            >
              View
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onEdit(result.id);
              }}
            >
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDownload(result.id);
              }}
            >
              Download
            </DropdownMenuItem>
            {onPublish && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onPublish(result);
                }}
              >
                Publish
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDelete(result.id);
              }}
              className="text-destructive"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
};

// ─── Desktop view ─────────────────────────────────────────────────────────────
const DesktopResultsView = ({
  results,
  selectedResults,
  isAllSelected,
  isIndeterminate,
  onSelectAll,
  onSelectResult,
  onEdit,
  onDelete,
  onView,
  onDownload,
  onPublish,
}: ResultsTableProps) => (
  <Card>
    <CardContent className="p-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={isAllSelected || isIndeterminate}
                onCheckedChange={onSelectAll}
              />
            </TableHead>
            <TableHead>Student</TableHead>
            <TableHead>Class / Dept</TableHead>
            <TableHead>Term / Session</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((result) => (
            <DesktopResultRow
              key={result.id}
              result={result}
              selectedResults={selectedResults}
              onEdit={onEdit}
              onDelete={onDelete}
              onView={onView}
              onDownload={onDownload}
              onPublish={onPublish}
              onSelectResult={onSelectResult}
            />
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);

// ─── Mobile view ──────────────────────────────────────────────────────────────
const MobileResultsView = ({
  results,
  selectedResults,
  onSelectResult,
  onEdit,
  onDelete,
  onView,
  onDownload,
  onPublish,
}: Omit<ResultsTableProps, "isAllSelected" | "isIndeterminate" | "onSelectAll">) => (
  <div className="space-y-4">
    {results.map((result) => (
      <MobileResultRow
        key={result.id}
        result={result}
        selectedResults={selectedResults}
        onEdit={onEdit}
        onDelete={onDelete}
        onView={onView}
        onDownload={onDownload}
        onPublish={onPublish}
        onSelectResult={onSelectResult}
      />
    ))}
  </div>
);

// ─── Root export ──────────────────────────────────────────────────────────────
const ResultsTable = ({ results, ...props }: ResultsTableProps) => {
  const isMobile = useIsMobile();

  if (results.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Eye className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold">No Results Found</h3>
          <p className="text-muted-foreground text-sm">
            No results match your current search criteria.
          </p>
        </CardContent>
      </Card>
    );
  }

  return isMobile ? (
    <MobileResultsView results={results} {...props} />
  ) : (
    <DesktopResultsView results={results} {...props} />
  );
};

export default ResultsTable;
