import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  showPageSizeSelector?: boolean;
  className?: string;
}

export const TablePagination = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 30, 50, 100],
  showPageSizeSelector = true,
  className = "",
}: TablePaginationProps) => {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const getPaginationNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t bg-muted/20 ${className}`}>
      {/* Items info and page size selector */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>
          {totalItems === 0 ? (
            "No items"
          ) : (
            <>
              Showing <span className="font-medium text-foreground">{startItem}</span> to{" "}
              <span className="font-medium text-foreground">{endItem}</span> of{" "}
              <span className="font-medium text-foreground">{totalItems}</span> items
            </>
          )}
        </span>

        {showPageSizeSelector && onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline">Show</span>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => onPageSizeChange(Number(value))}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="hidden sm:inline">per page</span>
          </div>
        )}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          {/* First page button */}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 hidden sm:flex"
            disabled={!canGoPrevious}
            onClick={() => onPageChange(1)}
            title="First page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>

          {/* Previous button */}
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            disabled={!canGoPrevious}
            onClick={() => onPageChange(currentPage - 1)}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Previous</span>
          </Button>

          {/* Page numbers - hidden on mobile */}
          <div className="hidden md:flex items-center gap-1">
            {getPaginationNumbers().map((page, index) =>
              page === '...' ? (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 py-1 text-muted-foreground"
                >
                  ...
                </span>
              ) : (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "ghost"}
                  size="sm"
                  className="h-8 w-8"
                  onClick={() => onPageChange(page as number)}
                >
                  {page}
                </Button>
              )
            )}
          </div>

          {/* Mobile page indicator */}
          <span className="md:hidden text-sm text-muted-foreground px-2">
            {currentPage} / {totalPages}
          </span>

          {/* Next button */}
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            disabled={!canGoNext}
            onClick={() => onPageChange(currentPage + 1)}
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>

          {/* Last page button */}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 hidden sm:flex"
            disabled={!canGoNext}
            onClick={() => onPageChange(totalPages)}
            title="Last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default TablePagination;
