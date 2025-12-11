
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AddClassDialog } from "@/components/AddClassDialog";
import { AssignStudentsDialog } from "@/components/AssignStudentsDialog";
import { BulkEditClassesDialog } from "@/components/BulkEditClassesDialog";

export const ClassesQuickActions = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <AddClassDialog
          trigger={
            <Button variant="outline" className="w-full justify-start  ">
              <Plus className="w-4 h-4 mr-2" />
              Create New Class
            </Button>
          }
        />
        <AssignStudentsDialog />
        <BulkEditClassesDialog />
      </CardContent>
    </Card>
  );
};
