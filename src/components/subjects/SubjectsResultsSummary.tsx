
interface SubjectsResultsSummaryProps {
  filteredCount: number;
  totalCount: number;
}

export function SubjectsResultsSummary({ filteredCount, totalCount }: SubjectsResultsSummaryProps) {
  return (
    <div className="text-sm text-muted-foreground">
      Showing <strong>{filteredCount}</strong> of <strong>{totalCount}</strong> subjects.
    </div>
  );
}
