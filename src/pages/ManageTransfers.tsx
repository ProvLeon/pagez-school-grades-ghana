import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { useTransfers, useUpdateTransferStatus, Transfer } from "@/hooks/useTransfers";
import { useClasses } from "@/hooks/useClasses";
import TransferFilters from "@/components/transfers/TransferFilters";
import TransferCard from "@/components/transfers/TransferCard";
import AddTransferDialog from "@/components/transfers/AddTransferDialog";
import { TransferConfirmationDialog } from "@/components/transfers/TransferConfirmationDialog";
import { BulkPromotionDialog } from "@/components/transfers/BulkPromotionDialog";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, CheckCircle, ArrowRightLeft, FileCheck, Ban, Plus, ArrowUpCircle } from "lucide-react";

const ManageTransfers = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ status: "all", academic_year: "all", from_class: "all", to_class: "all" });
  const [confirmationDialog, setConfirmationDialog] = useState<{ isOpen: boolean; transfer: Transfer | null; }>({ isOpen: false, transfer: null });

  const { data: transfers = [], isLoading } = useTransfers();
  const { data: classes = [] } = useClasses();
  const updateTransferStatus = useUpdateTransferStatus();
  const { toast } = useToast();

  const filteredTransfers = transfers.filter(transfer => {
    const matchesSearch = !searchTerm || transfer.student?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || transfer.student?.student_id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filters.status === "all" || transfer.status === filters.status;
    const matchesYear = filters.academic_year === "all" || transfer.academic_year === filters.academic_year;
    const matchesFromClass = filters.from_class === "all" || transfer.from_class_id === filters.from_class;
    const matchesToClass = filters.to_class === "all" || transfer.to_class_id === filters.to_class;
    return matchesSearch && matchesStatus && matchesYear && matchesFromClass && matchesToClass;
  });

  const handleUpdateStatus = async (id: string, status: "approved" | "rejected" | "completed", notes?: string) => {
    try {
      await updateTransferStatus.mutateAsync({ id, status, notes });
      toast({ title: `Transfer ${status.charAt(0).toUpperCase() + status.slice(1)}` });
    } catch (error) {
      toast({ title: `Failed to ${status} transfer`, variant: "destructive" });
    }
  };

  const stats = {
    total: transfers.length,
    pending: transfers.filter(t => t.status === "pending").length,
    approved: transfers.filter(t => t.status === "approved").length,
    completed: transfers.filter(t => t.status === "completed").length,
    rejected: transfers.filter(t => t.status === "rejected").length,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="Student Transfers" subtitle="Loading transfers..." />
        <main className="container mx-auto px-4 py-6"><Skeleton className="h-64 w-full" /></main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header title="Student Transfers" subtitle="Manage student class transfers and track their status" />

      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard title="Total" value={stats.total} icon={ArrowRightLeft} />
          <StatCard title="Pending" value={stats.pending} icon={Clock} />
          <StatCard title="Approved" value={stats.approved} icon={CheckCircle} />
          <StatCard title="Completed" value={stats.completed} icon={FileCheck} />
          <StatCard title="Rejected" value={stats.rejected} icon={Ban} />
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <TransferFilters searchTerm={searchTerm} setSearchTerm={setSearchTerm} filters={filters} setFilters={setFilters} classes={classes} onClearFilters={() => { setSearchTerm(""); setFilters({ status: "all", academic_year: "all", from_class: "all", to_class: "all" }); }} />
          <div className="flex gap-2 w-full md:w-auto">
            <BulkPromotionDialog
              trigger={
                <Button variant="outline" className="flex-1 md:flex-none">
                  <ArrowUpCircle className="w-4 h-4 mr-2" />
                  Bulk Promotion
                </Button>
              }
            />
            <AddTransferDialog>
              <Button variant="default" className="flex-1 md:flex-none">
                <Plus className="w-4 h-4 mr-2" />
                New Transfer
              </Button>
            </AddTransferDialog>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            {filteredTransfers.length === 0 ? (
              <div className="text-center py-16">
                <ArrowRightLeft className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No Transfers Found</h3>
                <p className="text-sm text-muted-foreground">No transfers match your current filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredTransfers.map((transfer) => (
                  <TransferCard
                    key={transfer.id}
                    transfer={transfer}
                    onApprove={() => handleUpdateStatus(transfer.id, "approved")}
                    onComplete={() => setConfirmationDialog({ isOpen: true, transfer })}
                    onReject={() => {
                      const reason = window.prompt("Reason for rejection:");
                      if (reason) handleUpdateStatus(transfer.id, "rejected", reason);
                    }}
                    onView={() => { }}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <TransferConfirmationDialog
        isOpen={confirmationDialog.isOpen}
        onOpenChange={(open) => setConfirmationDialog({ isOpen: open, transfer: null })}
        onConfirm={() => handleUpdateStatus(confirmationDialog.transfer!.id, "completed")}
        transfer={confirmationDialog.transfer}
        isLoading={updateTransferStatus.isPending}
      />
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

export default ManageTransfers;
