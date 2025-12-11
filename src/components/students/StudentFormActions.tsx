
import { Button } from "@/components/ui/button";
import { UserPlus, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface StudentFormActionsProps {
  isSubmitting: boolean;
}

export const StudentFormActions = ({ isSubmitting }: StudentFormActionsProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-end gap-3 pt-6 border-t">
      <Button 
        type="button"
        variant="outline"
        onClick={() => navigate('/students/manage-students')}
        disabled={isSubmitting}
      >
        Cancel
      </Button>
      <Button 
        type="submit" 
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Creating...</>
        ) : (
          <><UserPlus className="w-4 h-4 mr-2" /> Create Student</>
        )}
      </Button>
    </div>
  );
};
