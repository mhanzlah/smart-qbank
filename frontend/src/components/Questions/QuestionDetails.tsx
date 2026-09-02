import type { QuestionPublic } from "@/client";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LatexText } from "../Common/LatexText";

interface QuestionDetailsProps {
  question: QuestionPublic | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function QuestionDetails({
  question,
  open,
  onOpenChange,
}: QuestionDetailsProps) {
  if (!question) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Question Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">ID</p>
            <p className="break-all font-mono text-xs">{question.id}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Question</p>
            <p className="whitespace-pre-wrap text-sm font-medium">
              <LatexText>{question.question}</LatexText>
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Options</p>

            <div className="space-y-2">
              {question.options.map((option, index) => {
                const optionLetter = String.fromCharCode(65 + index);
                const isCorrect = optionLetter === question.correct_option;

                return (
                  <div key={optionLetter} className="rounded-md border p-3">
                    <div className="flex items-start gap-3">
                      <span className="font-semibold">{optionLetter}.</span>

                      <span className="flex-1">
                        <LatexText>{option}</LatexText>
                      </span>

                      {isCorrect && <Badge variant="default">Correct</Badge>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Difficulty</p>

              <Badge variant="outline">{question.difficulty}</Badge>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Cognitive Level</p>

              <Badge variant="outline">{question.cognitive_level}</Badge>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Explanation</p>

            <div className="whitespace-pre-wrap text-sm">
              {question.explanation ? (
                <LatexText>{question.explanation}</LatexText>
              ) : (
                "No explanation provided"
              )}
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Topic ID</p>

            <p className="break-all font-mono text-xs">{question.topic_id}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Validated</p>

            <Badge variant="outline">
              {question.is_validated ? "Yes" : "No"}
            </Badge>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Review Status</p>

            <Badge variant="outline">{question.review_status}</Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
