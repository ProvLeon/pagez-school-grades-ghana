
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SBATypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  department: string;
}

const SBATypeSelector = ({ value, onChange, department }: SBATypeSelectorProps) => {
  const sbaTypeOptions = [
    { value: "50/50", label: "50/50 – 50% Class Assessment, 50% Examination" },
    { value: "60/10/10/10/10", label: "60/10/10/10/10 – 60% Exam, 10% CA1, 10% CA2, 10% CA3, 10% CA4" },
    { value: "60/20/20", label: "60/20/20 – 60% Exam, 20% CA1, 20% CA2" },
    { value: "60/40", label: "60/40 – 60% Class Assessment, 40% Exam" },
    { value: "70/10/10/10", label: "70/10/10/10 – 70% Exam, 10% CA1, 10% CA2, 10% CA3" },
    { value: "70/30", label: "70/30 – 70% Exam, 30% Class Assessment" }
  ];

  return (
    <div className="space-y-2">
      <Label htmlFor={`${department}-sba-type`} className="mb-2 block text-sm font-medium text-muted-foreground">SBA Type Configuration</Label>
      <Select value={value || ''} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select assessment structure" />
        </SelectTrigger>
        <SelectContent>
          {sbaTypeOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default SBATypeSelector;
