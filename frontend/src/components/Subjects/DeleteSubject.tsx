import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { SubjectsService } from "@/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { LoadingButton } from "@/components/ui/loading-button";
import useCustomToast from "@/hooks/useCustomToast";
import { handleError } from "@/utils";

interface DeleteSubjectProps {
  id: string;
  onSuccess: () => void;
}

const DeleteSubject = ({ id, onSuccess }: DeleteSubjectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useCustomToast();
  const { handleSubmit } = useForm();

  const deleteSubject = async (id: string) => {
    await SubjectsService.deleteSubject({
      path: {
        subject_id: id,
      },
    });
  };

  const mutation = useMutation({
    mutationFn: deleteSubject,
    onSuccess: () => {
      showSuccessToast("The subject was deleted successfully");
      setIsOpen(false);
      onSuccess();
    },
    onError: handleError.bind(showErrorToast),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["subjects"],
      });
    },
  });

  const onSubmit = () => {
    mutation.mutate(id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuItem
        variant="destructive"
        onSelect={(e) => e.preventDefault()}
        onClick={() => setIsOpen(true)}
      >
        <Trash2 />
        Delete Subject
      </DropdownMenuItem>

      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Delete Subject</DialogTitle>

            <DialogDescription>
              All topics and questions associated with this subject will also be{" "}
              <strong>permanently deleted.</strong> Are you sure? You will not
              be able to undo this action.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline" disabled={mutation.isPending}>
                Cancel
              </Button>
            </DialogClose>

            <LoadingButton
              variant="destructive"
              type="submit"
              loading={mutation.isPending}
            >
              Delete
            </LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteSubject;
