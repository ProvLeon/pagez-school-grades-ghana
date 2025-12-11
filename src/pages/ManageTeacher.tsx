import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { useTeachers, useCreateTeacher, useUpdateTeacher, useDeleteTeacher, ExtendedTeacher } from "@/hooks/useTeachers";
import { useDepartments } from "@/hooks/useDepartments";
import { useToast } from "@/hooks/use-toast";
import { useTeacherAssignments } from "@/hooks/useTeacherAssignments";
import { supabase } from "@/integrations/supabase/client";
import AddTeacherDialog from "@/components/teacher/AddTeacherDialog";
import TeacherSearchFilters from "@/components/teacher/TeacherSearchFilters";
import TeacherGrid from "@/components/teacher/TeacherGrid";
import TeacherEditDialog from "@/components/teacher/TeacherEditDialog";
import TeacherPasswordDialog from "@/components/teacher/TeacherPasswordDialog";
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, UserCheck, Building2, GraduationCap, Plus } from "lucide-react";

const ManageTeacher = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<ExtendedTeacher | null>(null);

  const { data: teachers = [], isLoading } = useTeachers();
  const { data: assignments = [] } = useTeacherAssignments();
  const { toast } = useToast();

  const createTeacherMutation = useCreateTeacher();
  const updateTeacherMutation = useUpdateTeacher();
  const deleteTeacherMutation = useDeleteTeacher();

  const handleAddTeacher = async (teacherData: any) => {
    try {
      await createTeacherMutation.mutateAsync(teacherData);
      toast({ title: "Teacher Added", description: "New teacher account created." });
    } catch (error) {
      toast({ title: "Failed to Add Teacher", variant: "destructive" });
    }
  };

  const handleUpdateTeacher = async (updatedTeacher: ExtendedTeacher) => {
    if (!selectedTeacher) return;
    try {
      await updateTeacherMutation.mutateAsync({
        id: selectedTeacher.id,
        updateData: {
          full_name: updatedTeacher.full_name,
          username: updatedTeacher.username,
          email: updatedTeacher.email,
          phone: updatedTeacher.phone,
          department_id: updatedTeacher.department_id,
        }
      });
      setIsEditDialogOpen(false);
      toast({ title: "Teacher Updated", description: "Teacher information updated." });
    } catch (error) {
      toast({ title: "Update Failed", variant: "destructive" });
    }
  };

  const handlePasswordUpdate = async (newPassword: string) => {
    if (!selectedTeacher?.user_id) return;
    try {
      const { error } = await supabase.auth.admin.updateUserById(selectedTeacher.user_id, { password: newPassword });
      if (error) throw error;
      toast({ title: "Password Reset", description: `Password has been reset.` });
      setIsPasswordDialogOpen(false);
    } catch (error) {
      toast({ title: "Error", description: "Failed to reset password.", variant: "destructive" });
    }
  };

  const handleToggleStatus = async (teacher: ExtendedTeacher) => {
    try {
      await updateTeacherMutation.mutateAsync({ id: teacher.id, updateData: { is_active: !teacher.is_active } });
      toast({ title: `Teacher ${!teacher.is_active ? 'Activated' : 'Deactivated'}` });
    } catch (error) {
      toast({ title: "Status Update Failed", variant: "destructive" });
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedTeacher) return;
    try {
      await deleteTeacherMutation.mutateAsync(selectedTeacher.id);
      setIsDeleteDialogOpen(false);
      toast({ title: "Teacher Deleted" });
    } catch (error) {
      toast({ title: "Deletion Failed", variant: "destructive" });
    }
  };

  const stats = {
    total: teachers.length,
    active: teachers.filter(t => t.is_active !== false).length,
    departments: new Set(teachers.map(t => t.department_id).filter(Boolean)).size,
    assignments: assignments.length,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="Teacher Management" subtitle="Loading teacher data..." />
        <main className="container mx-auto px-4 py-6"><Skeleton className="h-64 w-full" /></main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header title="Teacher Management" subtitle="Manage teaching staff, credentials, and assignments" />

      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Teachers" value={stats.total} icon={Users} />
          <StatCard title="Active Teachers" value={stats.active} icon={UserCheck} />
          <StatCard title="Departments" value={stats.departments} icon={Building2} />
          <StatCard title="Assignments" value={stats.assignments} icon={GraduationCap} />
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <TeacherSearchFilters searchTerm={searchTerm} setSearchTerm={setSearchTerm} selectedDepartment={selectedDepartment} setSelectedDepartment={setSelectedDepartment} />
          <AddTeacherDialog onAddTeacher={handleAddTeacher} trigger={<Button className="w-full md:w-auto"><Plus className="w-4 h-4 mr-2" />Add Teacher</Button>} />
        </div>

        <Card>
          <CardContent className="p-6">
            <TeacherGrid
              teachers={teachers}
              assignments={assignments}
              onEditTeacher={(t) => { setSelectedTeacher(t); setIsEditDialogOpen(true); }}
              onResetPassword={(t) => { setSelectedTeacher(t); setIsPasswordDialogOpen(true); }}
              onToggleStatus={handleToggleStatus}
              onDeleteTeacher={(t) => { setSelectedTeacher(t); setIsDeleteDialogOpen(true); }}
              searchTerm={searchTerm}
              selectedDepartment={selectedDepartment}
            />
          </CardContent>
        </Card>
      </main>

      <TeacherEditDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} teacher={selectedTeacher} onUpdateTeacher={handleUpdateTeacher} />
      <TeacherPasswordDialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen} teacher={selectedTeacher} onPasswordUpdate={handlePasswordUpdate} />
      <DeleteConfirmationDialog isOpen={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} onConfirm={handleConfirmDelete} title="Delete Teacher" description={`Are you sure you want to delete ${selectedTeacher?.full_name}?`} isLoading={deleteTeacherMutation.isPending} />
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon }: { title: string, value: number, icon: React.ElementType }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <Icon className="h-5 w-5 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

export default ManageTeacher;
