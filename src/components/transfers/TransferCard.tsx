
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, MoreVertical } from "lucide-react";
import { Transfer } from "@/hooks/useTransfers";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface TransferCardProps {
  transfer: Transfer;
  onApprove: (id: string) => void;
  onComplete: (id: string) => void;
  onReject: (id: string) => void;
  onView: (id: string) => void;
}

const TransferCard = ({ transfer, onApprove, onComplete, onReject, onView }: TransferCardProps) => {
  const statusVariant = {
    pending: "secondary",
    approved: "default",
    completed: "success",
    rejected: "destructive",
  }[transfer.status] || "outline";

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base">{transfer.student?.full_name}</CardTitle>
            <p className="text-sm text-muted-foreground">ID: {transfer.student?.student_id}</p>
          </div>
          <Badge variant={statusVariant as any}>{transfer.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm p-3 bg-muted/50 rounded-md">
          <span className="font-medium">{transfer.from_class?.name || 'N/A'}</span>
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">{transfer.to_class?.name || 'N/A'}</span>
        </div>
        <div className="text-sm text-muted-foreground">
          <p><strong>Reason:</strong> {transfer.reason}</p>
          <p><strong>Requested:</strong> {new Date(transfer.request_date).toLocaleDateString()}</p>
        </div>
        <div className="flex items-center justify-end gap-2 pt-3 border-t">
          {transfer.status === 'pending' && (
            <Button size="sm" onClick={() => onApprove(transfer.id)}>Approve</Button>
          )}
          {transfer.status === 'approved' && (
            <Button size="sm" onClick={() => onComplete(transfer.id)}>Complete</Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(transfer.id)}>View Details</DropdownMenuItem>
              {transfer.status === 'pending' && <DropdownMenuItem onClick={() => onReject(transfer.id)} className="text-destructive">Reject</DropdownMenuItem>}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransferCard;
