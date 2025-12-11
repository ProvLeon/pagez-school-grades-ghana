
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ResultsHeaderProps {
  title: string;
  subtitle?: string;
  showAddButton?: boolean;
  showBackButton?: boolean;
  addButtonText?: string;
  onAddClick?: () => void;
}

const ResultsHeader = ({
  title,
  subtitle,
  showAddButton = false,
  showBackButton = false,
  addButtonText = "Add New",
  onAddClick
}: ResultsHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-6 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="p-2 md:hidden"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <div>
              <h1 className="text-xl md:text-3xl font-bold text-gray-900">{title}</h1>
              {subtitle && (
                <p className="text-sm md:text-base text-gray-600 mt-1">{subtitle}</p>
              )}
            </div>
          </div>
          
          {showAddButton && (
            <Button 
              onClick={onAddClick}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 md:px-6 w-full md:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              {addButtonText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultsHeader;
