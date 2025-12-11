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
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type ModalType = 'warning' | 'danger' | 'success' | 'info';

const iconMap = {
  warning: AlertTriangle,
  danger: XCircle,
  success: CheckCircle,
  info: Info,
};

const iconColorMap = {
  warning: 'text-amber-500',
  danger: 'text-red-500',
  success: 'text-green-500',
  info: 'text-blue-500',
};

interface ConfirmationModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description: string;
  type?: ModalType;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  showIcon?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onOpenChange,
  onConfirm,
  title = "Are you sure?",
  description,
  type = "warning",
  confirmText = "Yes, Continue!",
  cancelText = "Cancel",
  isLoading = false,
  showIcon = true,
}) => {
  const Icon = iconMap[type];
  const iconColor = iconColorMap[type];

  const getConfirmButtonClasses = () => {
    switch (type) {
      case 'danger':
        return "bg-red-600 hover:bg-red-700 focus:ring-red-600";
      case 'success':
        return "bg-green-600 hover:bg-green-700 focus:ring-green-600";
      case 'info':
        return "bg-blue-600 hover:bg-blue-700 focus:ring-blue-600";
      default:
        return "bg-primary hover:bg-primary/90 focus:ring-primary";
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="fixed left-[50%] top-[50%] z-[9999] translate-x-[-50%] translate-y-[-50%] max-w-md w-full mx-4 bg-background border shadow-2xl animate-in fade-in-0 zoom-in-95 duration-300">
        <AlertDialogHeader className="text-center space-y-4">
          {showIcon && (
            <div className="flex justify-center">
              <div className="p-3 rounded-full bg-muted">
                <Icon className={cn("h-8 w-8", iconColor)} />
              </div>
            </div>
          )}
          <AlertDialogTitle className="text-xl font-bold text-foreground">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground text-base">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2 mt-6">
          <AlertDialogCancel 
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className={cn(
              "w-full sm:w-auto text-white",
              getConfirmButtonClasses()
            )}
          >
            {isLoading ? "Processing..." : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};