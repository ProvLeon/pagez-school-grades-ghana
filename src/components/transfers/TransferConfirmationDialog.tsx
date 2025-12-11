
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, User, BookOpen, Calendar } from 'lucide-react';
import { Transfer } from '@/hooks/useTransfers';

interface TransferConfirmationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  transfer: Transfer | null;
  isLoading?: boolean;
}

export const TransferConfirmationDialog: React.FC<TransferConfirmationDialogProps> = ({
  isOpen,
  onOpenChange,
  onConfirm,
  transfer,
  isLoading = false,
}) => {
  if (!transfer) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md bg-white dark:bg-gray-800">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-lg">
            <ArrowRight className="w-5 h-5 text-blue-500" />
            Complete Transfer
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4 text-left">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Are you sure you want to complete this transfer? This action will permanently move the student to the new class.
              </p>

              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="font-medium">
                    {transfer.student?.full_name}
                  </span>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  ID: {transfer.student?.student_id}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">From:</span>
                  <Badge variant="outline">
                    {transfer.from_class?.name || 'Unassigned'}
                  </Badge>
                </div>
                <div className="flex items-center justify-center">
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">To:</span>
                  <Badge variant="default">
                    {transfer.to_class?.name || 'Unassigned'}
                  </Badge>
                </div>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  <span>Requested: {new Date(transfer.request_date).toLocaleDateString()}</span>
                </div>
                {transfer.reason && (
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-3 h-3" />
                    <span>Reason: {transfer.reason}</span>
                  </div>
                )}
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/30 rounded p-2">
                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                  <strong>Warning:</strong> This action cannot be undone.
                </p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            {isLoading ? "Completing..." : "Complete Transfer"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
