import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileSpreadsheet, FolderPlus, Layers } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SubjectsQuickActionsProps {
  onAddSubject: () => void;
}

export function SubjectsQuickActions({ onAddSubject }: SubjectsQuickActionsProps) {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          variant="outline"
          className="w-full justify-start bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
          onClick={onAddSubject}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Subject
        </Button>

        <Button
          variant="outline"
          className="w-full justify-start bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700"
          onClick={() => navigate('/subjects/departments')}
        >
          <FolderPlus className="w-4 h-4 mr-2" />
          Manage Departments
        </Button>

        <Button
          variant="outline"
          className="w-full justify-start bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
          onClick={() => navigate('/subjects/combinations')}
        >
          <Layers className="w-4 h-4 mr-2" />
          Subject Combinations
        </Button>

        <Button
          variant="outline"
          className="w-full justify-start bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-700"
          disabled
        >
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Import Subjects
        </Button>
      </CardContent>
    </Card>
  );
}
