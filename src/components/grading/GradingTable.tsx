
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";

type GradingScale = {
  id: string;
  from: number | string;
  to: number | string;
  grade: string;
  remark: string;
};

interface GradingTableProps {
  grading: GradingScale[];
  department: "kg" | "primary" | "jhs";
  onAddRow: (department: "kg" | "primary" | "jhs") => void;
  onRemoveRow: (department: "kg" | "primary" | "jhs", id: string) => void;
  onUpdateRow: (department: "kg" | "primary" | "jhs", id: string, field: keyof GradingScale, value: string | number) => void;
}

const GradingTable = ({ grading, department, onAddRow, onRemoveRow, onUpdateRow }: GradingTableProps) => {
  const handleUpdateRow = (id: string, field: keyof GradingScale, value: string | number) => {
    onUpdateRow(department, id, field, value);
  };

  const handleRemoveRow = (id: string) => {
    onRemoveRow(department, id);
  };

  const handleAddRow = () => {
    onAddRow(department);
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-border">
          <thead>
            <tr className="bg-muted/50">
              <th className="border border-border p-2 text-left text-sm font-medium text-muted-foreground">From (%)</th>
              <th className="border border-border p-2 text-left text-sm font-medium text-muted-foreground">To (%)</th>
              <th className="border border-border p-2 text-left text-sm font-medium text-muted-foreground">Grade</th>
              <th className="border border-border p-2 text-left text-sm font-medium text-muted-foreground">Remark</th>
              <th className="border border-border p-2 text-center text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {grading.map((row) => (
              <tr key={row.id} className="even:bg-muted/20">
                <td className="border border-border p-2">
                  <Input
                    type="number"
                    value={row.from != null ? row.from : ''}
                    onChange={(e) => {
                      const value = e.target.value === "" ? "" : Number(e.target.value);
                      handleUpdateRow(row.id, "from", value);
                    }}
                    className="w-full border-none focus-visible:ring-0"
                    min="0"
                    max="100"
                  />
                </td>
                <td className="border border-border p-2">
                  <Input
                    type="number"
                    value={row.to != null ? row.to : ''}
                    onChange={(e) => {
                      const value = e.target.value === "" ? "" : Number(e.target.value);
                      handleUpdateRow(row.id, "to", value);
                    }}
                    className="w-full border-none focus-visible:ring-0"
                    min="0"
                    max="100"
                  />
                </td>
                <td className="border border-border p-2">
                  <Input
                    value={row.grade || ''}
                    onChange={(e) => handleUpdateRow(row.id, "grade", e.target.value)}
                    className="w-full border-none focus-visible:ring-0"
                    placeholder="e.g., A, B, C"
                  />
                </td>
                <td className="border border-border p-2">
                  <Input
                    value={row.remark || ''}
                    onChange={(e) => handleUpdateRow(row.id, "remark", e.target.value)}
                    className="w-full border-none focus-visible:ring-0"
                    placeholder="e.g., Excellent, Good"
                  />
                </td>
                <td className="border border-border p-2 text-center ">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveRow(row.id)}
                    className="text-destructive hover:text-red-200 hover:bg-destructive/20 bg-destructive/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button onClick={handleAddRow} variant="outline" className="flex items-center gap-2 w-full justify-center">
        <Plus className="w-4 h-4" />
        Add Row
      </Button>
    </div>
  );
};

export default GradingTable;
