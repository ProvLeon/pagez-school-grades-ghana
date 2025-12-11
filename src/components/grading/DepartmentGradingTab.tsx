
import { TabsContent } from "@/components/ui/tabs";
import GradingTable from "./GradingTable";
import SBATypeSelector from "./SBATypeSelector";

type GradingScale = {
  id: string;
  from: number;
  to: number;
  grade: string;
  remark: string;
};

interface DepartmentGradingTabProps {
  value: string;
  title: string;
  grading: GradingScale[];
  sbaType: string;
  department: "kg" | "primary" | "jhs";
  onSBATypeChange: (value: string) => void;
  onAddRow: (department: "kg" | "primary" | "jhs") => void;
  onRemoveRow: (department: "kg" | "primary" | "jhs", id: string) => void;
  onUpdateRow: (department: "kg" | "primary" | "jhs", id: string, field: keyof GradingScale, value: string | number) => void;
}

const DepartmentGradingTab = ({
  value,
  title,
  grading,
  sbaType,
  department,
  onSBATypeChange,
  onAddRow,
  onRemoveRow,
  onUpdateRow
}: DepartmentGradingTabProps) => {
  return (
    <TabsContent value={value} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">{title} Grading Scale</h3>
        <GradingTable
          grading={grading}
          department={department}
          onAddRow={onAddRow}
          onRemoveRow={onRemoveRow}
          onUpdateRow={onUpdateRow}
        />
        <SBATypeSelector
          value={sbaType}
          onChange={onSBATypeChange}
          department={department}
        />
      </div>
    </TabsContent>
  );
};

export default DepartmentGradingTab;
