
import { Badge } from "@/components/ui/badge";

interface ResultsStatusBadgeProps {
  approved: boolean;
  type: "teacher" | "admin";
}

const ResultsStatusBadge = ({ approved, type }: ResultsStatusBadgeProps) => {
  if (approved) {
    return (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
        ✓ {type === "teacher" ? "Reviewed" : "Live"}
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs">
      ⏳ Pending
    </Badge>
  );
};

export default ResultsStatusBadge;
