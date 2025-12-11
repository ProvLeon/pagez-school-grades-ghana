import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Globe, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface PublishReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  result: {
    id: string;
    is_public?: boolean;
    students?: {
      full_name: string;
      student_id: string;
    };
    academic_year: string;
    term: string;
  };
}

export const PublishReportDialog = ({ isOpen, onClose, result }: PublishReportDialogProps) => {
  const [isPublic, setIsPublic] = useState(result.is_public || false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handlePublishToggle = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('results')
        .update({ is_public: isPublic } as any)
        .eq('id', result.id);

      if (error) throw error;

      toast({
        title: isPublic ? "Report Published" : "Report Unpublished",
        description: isPublic 
          ? "Report is now publicly accessible" 
          : "Report is no longer publicly accessible",
      });

      queryClient.invalidateQueries({ queryKey: ['results'] });
      onClose();
    } catch (error) {
      console.error('Error updating report visibility:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update report visibility. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Publish Report Card
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Student Details</Label>
            <div className="bg-muted p-3 rounded-lg">
              <p className="font-semibold">{result.students?.full_name}</p>
              <p className="text-sm text-muted-foreground">
                ID: {result.students?.student_id} • {result.academic_year} • {result.term} term
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="public-toggle">Make Report Public</Label>
              <p className="text-sm text-muted-foreground">
                Allow public access to this report card
              </p>
            </div>
            <Switch
              id="public-toggle"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
          </div>

          {isPublic ? (
            <Alert>
              <Globe className="h-4 w-4" />
              <AlertDescription>
                This report will be accessible through the public student portal without requiring login.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                This report will only be accessible to authenticated users with proper permissions.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handlePublishToggle} disabled={isLoading}>
            {isLoading ? "Updating..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};