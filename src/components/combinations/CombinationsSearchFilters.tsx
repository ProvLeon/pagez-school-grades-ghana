
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface CombinationsSearchFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  totalCombinations: number;
  filteredCount: number;
}

export function CombinationsSearchFilters({ 
  searchTerm, 
  onSearchChange, 
  totalCombinations, 
  filteredCount 
}: CombinationsSearchFiltersProps) {
  return (
    <Card className="shadow-lg border-0 rounded-xl overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
              <Search className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">
                {filteredCount} combinations available
              </h3>
              {searchTerm && (
                <p className="text-gray-500 text-sm">
                  Filtered from {totalCombinations} total combinations
                </p>
              )}
            </div>
          </div>
          
          <div className="relative w-full lg:w-96">
            <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            <Input 
              placeholder="Search by name, department, or subjects..." 
              className="pl-12 w-full bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 h-12 rounded-xl"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
