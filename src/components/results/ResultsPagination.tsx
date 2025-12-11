
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ResultsPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const ResultsPagination = ({ currentPage, totalPages, onPageChange }: ResultsPaginationProps) => {
  const getPaginationNumbers = () => {
    const pages = [];
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

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between">
      <Button 
        variant="outline" 
        size="sm" 
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Previous
      </Button>
      
      <div className="hidden md:flex items-center gap-1">
        {getPaginationNumbers().map((page, index) => (
          page === '...' ? (
            <span key={`ellipsis-${index}`} className="px-3 py-1 text-muted-foreground">...</span>
          ) : (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "ghost"}
              size="sm"
              onClick={() => onPageChange(page as number)}
              className="w-9 h-9"
            >
              {page}
            </Button>
          )
        ))}
      </div>
      
      <Button 
        variant="outline" 
        size="sm" 
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
        <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );
};

export default ResultsPagination;
