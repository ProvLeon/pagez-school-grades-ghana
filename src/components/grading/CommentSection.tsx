
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";

type CommentOption = {
  id: string;
  value: string;
};

interface CommentSectionProps {
  title: string;
  options: CommentOption[];
  type: "conduct" | "attitude" | "interest" | "teacher";
  onAddOption: (type: "conduct" | "attitude" | "interest" | "teacher") => void;
  onRemoveOption: (type: "conduct" | "attitude" | "interest" | "teacher", id: string) => void;
  onUpdateOption: (type: "conduct" | "attitude" | "interest" | "teacher", id: string, value: string) => void;
}

const CommentSection = ({
  title,
  options,
  type,
  onAddOption,
  onRemoveOption,
  onUpdateOption
}: CommentSectionProps) => {
  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-lg text-foreground">{title}</h4>
      <div className="space-y-2">
        {options.map((option) => (
          <div key={option.id} className="flex items-center gap-2">
            <Input
              value={option.value || ''}
              onChange={(e) => onUpdateOption(type, option.id, e.target.value)}
              placeholder={`Enter ${title.toLowerCase()}`}
              className="flex-1"
            />
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onRemoveOption(type, option.id)}
              className="text-destructive hover:text-red-200 hover:bg-destructive/20 bg-destructive/20"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
        <Button onClick={() => onAddOption(type)} variant="outline" size="sm" className="w-full justify-center">
          <Plus className="w-4 h-4 mr-2" />
          Add Option
        </Button>
      </div>
    </div>
  );
};

export default CommentSection;
