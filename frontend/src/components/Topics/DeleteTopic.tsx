import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { TopicsService } from "@/client";
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

interface DeleteTopicProps {
  id: string;
  onSuccess: () => void;
}

const DeleteTopic = ({ id, onSuccess }: DeleteTopicProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const queryClient = useQueryClient();

  const { showSuccessToast, showErrorToast } = useCustomToast();

  const { handleSubmit } = useForm();

  const deleteTopic = async (id: string) => {
    await TopicsService.deleteTopic({
      path: {
        topic_id: id,
      },
    });
  };

  const mutation = useMutation({
    mutationFn: deleteTopic,

    onSuccess: () => {
      showSuccessToast("The topic was deleted successfully");
      setIsOpen(false);
      onSuccess();
    },

    onError: handleError.bind(showErrorToast),

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["topics"],
      });
    },
  });

  const onSubmit = async () => {
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
        Delete Topic
      </DropdownMenuItem>

      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Delete Topic</DialogTitle>

            <DialogDescription>
              This topic and its associated questions will also be{" "}
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

export default DeleteTopic;
