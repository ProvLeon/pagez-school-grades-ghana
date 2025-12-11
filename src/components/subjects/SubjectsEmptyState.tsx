import { Button } from "@/components/ui/button";
import { BookOpen, Plus } from "lucide-react";

interface SubjectsEmptyStateProps {
  onAdd: () => void;
}

export function SubjectsEmptyState({ onAdd }: SubjectsEmptyStateProps) {
  return (
    <div className="text-center py-20">
      <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
      <h3 className="mt-4 text-lg font-semibold">No subjects found</h3>
      <p className="mt-2 text-sm text-muted-foreground">Get started by adding a new subject.</p>
      <Button className="mt-6" onClick={onAdd}>
        <Plus className="w-4 h-4 mr-2" />
        Add Subject
      </Button>
    </div>
  );
}