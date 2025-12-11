import React, { useState } from "react";
import {
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { useDeleteMockExamSession } from "@/hooks/useMockExams";

interface DeleteMockSessionDialogProps {
  trigger: React.ReactElement;
  sessionId: string;
  sessionName: string;
  onSuccess?: () => void;
}

export function DeleteMockSessionDialog({ 
  trigger, 
  sessionId, 
  sessionName, 
  onSuccess 
}: DeleteMockSessionDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const deleteSession = useDeleteMockExamSession();

  const handleDelete = async () => {
    try {
      await deleteSession.mutateAsync(sessionId);
      setIsOpen(false);
      onSuccess?.();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  return (
    <>
      <div onClick={() => setIsOpen(true)}>
        {trigger}
      </div>
      <ConfirmationModal
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        onConfirm={handleDelete}
        title="Delete Mock Sheet"
        description={`You are about to delete "${sessionName}". This action will permanently remove the mock sheet and all associated student results.`}
        type="danger"
        confirmText="Yes, Delete!"
        isLoading={deleteSession.isPending}
      />
    </>
  );
}