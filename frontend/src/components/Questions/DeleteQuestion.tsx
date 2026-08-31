import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { QuestionsService } from "@/client";
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

interface DeleteQuestionProps {
  id: string;
  onSuccess: () => void;
}

const DeleteQuestion = ({ id, onSuccess }: DeleteQuestionProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const queryClient = useQueryClient();

  const { showSuccessToast, showErrorToast } = useCustomToast();

  const { handleSubmit } = useForm();

  const mutation = useMutation({
    mutationFn: async (questionId: string) => {
      await QuestionsService.deleteQuestion({
        path: {
          question_id: questionId,
        },
      });
    },

    onSuccess: () => {
      showSuccessToast("The question was deleted successfully");

      setIsOpen(false);
      onSuccess();
    },

    onError: handleError.bind(showErrorToast),

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["questions"],
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
        onSelect={(event) => event.preventDefault()}
        onClick={() => setIsOpen(true)}
      >
        <Trash2 />
        Delete Question
      </DropdownMenuItem>

      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Delete Question</DialogTitle>

            <DialogDescription>
              This question will be <strong>permanently deleted.</strong> Are
              you sure? You will not be able to undo this action.
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

export default DeleteQuestion;
