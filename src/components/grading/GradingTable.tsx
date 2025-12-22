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
  departmentId: string;
  departmentName: string;
  onAddRow: (departmentId: string) => void;
  onRemoveRow: (departmentId: string, id: string) => void;
  onUpdateRow: (departmentId: string, id: string, field: keyof GradingScale, value: string | number) => void;
}

const GradingTable = ({
  grading,
  departmentId,
  departmentName,
  onAddRow,
  onRemoveRow,
  onUpdateRow
}: GradingTableProps) => {
  const handleUpdateRow = (id: string, field: keyof GradingScale, value: string | number) => {
    onUpdateRow(departmentId, id, field, value);
  };

  const handleRemoveRow = (id: string) => {
    onRemoveRow(departmentId, id);
  };

  const handleAddRow = () => {
    onAddRow(departmentId);
  };

  return (
    <div className="space-y-4">
      {grading.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No grading scales defined for {departmentName}.</p>
          <p className="text-sm mt-1">Click "Add Row" to create your first grading scale.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-border">
            <thead>
              <tr className="bg-muted/50">
                <th className="border border-border p-2 text-left text-sm font-medium text-muted-foreground w-20">
                  From (%)
                </th>
                <th className="border border-border p-2 text-left text-sm font-medium text-muted-foreground w-20">
                  To (%)
                </th>
                <th className="border border-border p-2 text-left text-sm font-medium text-muted-foreground w-24">
                  Grade
                </th>
                <th className="border border-border p-2 text-left text-sm font-medium text-muted-foreground">
                  Remark
                </th>
                <th className="border border-border p-2 text-center text-sm font-medium text-muted-foreground w-20">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {grading.map((row) => (
                <tr key={row.id} className="even:bg-muted/20 hover:bg-muted/30 transition-colors">
                  <td className="border border-border p-1">
                    <Input
                      type="number"
                      value={row.from !== null && row.from !== undefined ? row.from : ''}
                      onChange={(e) => {
                        const value = e.target.value === "" ? "" : Number(e.target.value);
                        handleUpdateRow(row.id, "from", value);
                      }}
                      className="w-full h-9 border-0 bg-transparent focus-visible:ring-1 focus-visible:ring-primary"
                      min="0"
                      max="100"
                      placeholder="0"
                    />
                  </td>
                  <td className="border border-border p-1">
                    <Input
                      type="number"
                      value={row.to !== null && row.to !== undefined ? row.to : ''}
                      onChange={(e) => {
                        const value = e.target.value === "" ? "" : Number(e.target.value);
                        handleUpdateRow(row.id, "to", value);
                      }}
                      className="w-full h-9 border-0 bg-transparent focus-visible:ring-1 focus-visible:ring-primary"
                      min="0"
                      max="100"
                      placeholder="100"
                    />
                  </td>
                  <td className="border border-border p-1">
                    <Input
                      type="text"
                      value={row.grade || ''}
                      onChange={(e) => handleUpdateRow(row.id, "grade", e.target.value)}
                      className="w-full h-9 border-0 bg-transparent focus-visible:ring-1 focus-visible:ring-primary"
                      placeholder="A"
                      maxLength={5}
                    />
                  </td>
                  <td className="border border-border p-1">
                    <Input
                      type="text"
                      value={row.remark || ''}
                      onChange={(e) => handleUpdateRow(row.id, "remark", e.target.value)}
                      className="w-full h-9 border-0 bg-transparent focus-visible:ring-1 focus-visible:ring-primary"
                      placeholder="Excellent"
                    />
                  </td>
                  <td className="border border-border p-1 text-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveRow(row.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Button
        type="button"
        onClick={handleAddRow}
        variant="outline"
        className="flex items-center gap-2 w-full justify-center border-dashed hover:border-primary hover:text-primary"
      >
        <Plus className="w-4 h-4" />
        Add Row
      </Button>
    </div>
  );
};

export default GradingTable;
