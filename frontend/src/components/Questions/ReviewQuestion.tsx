import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Eye, X } from "lucide-react";
import { useState } from "react";

import { type QuestionPublic, QuestionsService } from "@/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import useCustomToast from "@/hooks/useCustomToast";
import { handleError } from "@/utils";

interface ReviewQuestionProps {
  question: QuestionPublic;
  topicName: string;
}

const ReviewQuestion = ({ question, topicName }: ReviewQuestionProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useCustomToast();

  const mutation = useMutation({
    mutationFn: async (reviewStatus: "approved" | "rejected") => {
      return QuestionsService.reviewQuestion({
        path: {
          question_id: question.id,
        },
        body: {
          review_status: reviewStatus,
        },
      });
    },

    onSuccess: (_, reviewStatus) => {
      showSuccessToast(
        reviewStatus === "approved"
          ? "Question approved successfully"
          : "Question rejected successfully",
      );

      setIsOpen(false);
    },

    onError: handleError.bind(showErrorToast),

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["questions-review"],
      });

      queryClient.invalidateQueries({
        queryKey: ["questions"],
      });
    },
  });

  const handleReview = (status: "approved" | "rejected") => {
    mutation.mutate(status);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="mr-2 h-4 w-4" />
          Review
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Review Question</DialogTitle>

          <DialogDescription>
            Review the question carefully before approving or rejecting it.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Question */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Question</h3>

            <div className="rounded-md border bg-muted/30 p-4 text-sm leading-6">
              {question.question}
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Options</h3>

            <div className="space-y-2">
              {question.options.map((option, index) => {
                const optionLetter = String.fromCharCode(65 + index);
                const isCorrect = optionLetter === question.correct_option;

                return (
                  <div
                    key={optionLetter}
                    className={`flex items-start gap-3 rounded-md border p-3 text-sm ${
                      isCorrect
                        ? "border-primary bg-primary/5"
                        : "bg-background"
                    }`}
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold">
                      {optionLetter}
                    </span>

                    <span className="flex-1 pt-1">{option}</span>

                    {isCorrect && <Badge variant="default">Correct</Badge>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Metadata */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Topic</h3>

              <p className="text-sm text-muted-foreground">{topicName}</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Difficulty</h3>

              <Badge variant="secondary">{question.difficulty}</Badge>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Cognitive Level</h3>

              <p className="text-sm text-muted-foreground">
                {question.cognitive_level}
              </p>
            </div>
          </div>

          {/* Explanation */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Explanation</h3>

            <div className="rounded-md border bg-muted/30 p-4 text-sm leading-6">
              {question.explanation}
            </div>
          </div>

          {/* Review status */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Current Status:</span>

            <Badge variant="outline">{question.review_status}</Badge>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <DialogClose asChild>
            <Button variant="outline" disabled={mutation.isPending}>
              Cancel
            </Button>
          </DialogClose>

          <div className="flex gap-2">
            <Button
              variant="destructive"
              type="button"
              disabled={mutation.isPending}
              onClick={() => handleReview("rejected")}
            >
              <X className="mr-2 h-4 w-4" />
              Reject
            </Button>

            <Button
              type="button"
              disabled={mutation.isPending}
              onClick={() => handleReview("approved")}
            >
              <Check className="mr-2 h-4 w-4" />
              Approve
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewQuestion;
