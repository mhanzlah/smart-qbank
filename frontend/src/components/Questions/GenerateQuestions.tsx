import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { useState } from "react";

import { type QuestionGenerationResponse, QuestionsService } from "@/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/components/ui/loading-button";
import { Separator } from "@/components/ui/separator";
import useCustomToast from "@/hooks/useCustomToast";
import { handleError } from "@/utils";

interface GenerateQuestionsProps {
  topicIds: string[];
  disabled?: boolean;
}

const GenerateQuestions = ({
  topicIds,
  disabled = false,
}: GenerateQuestionsProps) => {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);

  const [easyQuestions, setEasyQuestions] = useState(5);
  const [mediumQuestions, setMediumQuestions] = useState(3);
  const [hardQuestions, setHardQuestions] = useState(2);

  const [questions, setQuestions] = useState<
    QuestionGenerationResponse["questions"]
  >([]);

  const [generationTime, setGenerationTime] = useState<number | null>(null);

  const { showErrorToast } = useCustomToast();

  const questionsPerTopic = easyQuestions + mediumQuestions + hardQuestions;

  const totalQuestions = questionsPerTopic * topicIds.length;

  const generateMutation = useMutation({
    mutationFn: () =>
      QuestionsService.generateQuestions({
        body: {
          topic_ids: topicIds,
          difficulty_distribution: {
            easy: easyQuestions,
            medium: mediumQuestions,
            hard: hardQuestions,
          },
        },
      }),

    onSuccess: (data) => {
      const generatedQuestions = data.data.questions;

      setQuestions(generatedQuestions);
      setGenerationTime(data.data.generation_time);

      if (generatedQuestions.length === 0) {
        showErrorToast("The model did not generate any questions.");
      }
    },

    onError: (error) => {
      handleError(error, showErrorToast);
    },
  });

  const handleGenerate = () => {
    setQuestions([]);
    setGenerationTime(null);
    generateMutation.reset();
    generateMutation.mutate();
  };

  const handleClose = (open: boolean) => {
    if (generateMutation.isPending) {
      return;
    }

    setIsOpen(open);

    if (!open) {
      setQuestions([]);
      generateMutation.reset();
    }
  };

  const isBusy = generateMutation.isPending;
  const hasGeneratedQuestions = questions.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={disabled}>
          <Sparkles className="mr-2 h-4 w-4" />
          Generate Questions
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Generate Questions</DialogTitle>

          <DialogDescription>
            Generate questions for the selected topics using AI. Generated
            questions are automatically saved to the database.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {!hasGeneratedQuestions &&
            !generateMutation.isPending &&
            !generateMutation.isError && (
              <div className="space-y-6">
                <div className="rounded-md border bg-muted/30 p-4">
                  <p className="text-sm font-medium">Selected Topics</p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {topicIds.length} topic
                    {topicIds.length === 1 ? "" : "s"} selected.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium">Questions Per Topic</h3>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Set the number of questions to generate for each
                      difficulty level for every selected topic.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <label
                        htmlFor="easy-questions"
                        className="text-sm font-medium"
                      >
                        Easy
                      </label>

                      <Input
                        id="easy-questions"
                        type="number"
                        min={0}
                        max={1000}
                        value={easyQuestions}
                        disabled={isBusy}
                        onChange={(event) => {
                          const value = Number(event.target.value);

                          setEasyQuestions(
                            Math.min(1000, Math.max(0, value || 0)),
                          );
                        }}
                      />

                      <p className="text-xs text-muted-foreground">
                        {easyQuestions} per topic
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="medium-questions"
                        className="text-sm font-medium"
                      >
                        Medium
                      </label>

                      <Input
                        id="medium-questions"
                        type="number"
                        min={0}
                        max={1000}
                        value={mediumQuestions}
                        disabled={isBusy}
                        onChange={(event) => {
                          const value = Number(event.target.value);

                          setMediumQuestions(
                            Math.min(1000, Math.max(0, value || 0)),
                          );
                        }}
                      />

                      <p className="text-xs text-muted-foreground">
                        {mediumQuestions} per topic
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="hard-questions"
                        className="text-sm font-medium"
                      >
                        Hard
                      </label>

                      <Input
                        id="hard-questions"
                        type="number"
                        min={0}
                        max={1000}
                        value={hardQuestions}
                        disabled={isBusy}
                        onChange={(event) => {
                          const value = Number(event.target.value);

                          setHardQuestions(
                            Math.min(1000, Math.max(0, value || 0)),
                          );
                        }}
                      />

                      <p className="text-xs text-muted-foreground">
                        {hardQuestions} per topic
                      </p>
                    </div>
                  </div>

                  <div className="rounded-md border p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Questions per topic
                      </span>

                      <span className="font-medium">{questionsPerTopic}</span>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Selected topics
                      </span>

                      <span className="font-medium">{topicIds.length}</span>
                    </div>

                    <Separator className="my-3" />

                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Total questions</span>

                      <span className="font-semibold">{totalQuestions}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

          {generateMutation.isPending && (
            <div className="rounded-md border p-8 text-center">
              <Sparkles className="mx-auto mb-3 h-6 w-6 animate-pulse" />

              <p className="font-medium">Generating questions...</p>

              <p className="mt-1 text-sm text-muted-foreground">
                Generating {questionsPerTopic} question
                {questionsPerTopic === 1 ? "" : "s"} per topic across{" "}
                {topicIds.length} selected topic
                {topicIds.length === 1 ? "" : "s"}. This may take a moment.
              </p>
            </div>
          )}

          {generateMutation.isError && !generateMutation.isPending && (
            <div className="rounded-md border border-destructive/50 p-6 text-center">
              <p className="font-medium">Failed to generate questions</p>

              <p className="mt-1 text-sm text-muted-foreground">
                The model could not generate a valid question set. Please try
                again.
              </p>

              <Button
                className="mt-4"
                onClick={handleGenerate}
                disabled={isBusy}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </div>
          )}

          {hasGeneratedQuestions && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Questions Generated</h3>

                <p className="text-sm text-muted-foreground">
                  {questions.length} question
                  {questions.length === 1 ? "" : "s"} generated and saved
                  successfully{" "}
                  {generationTime !== null && (
                    <div className="block">
                      in{" "}
                      <span className="font-medium text-foreground">
                        {generationTime < 60
                          ? `${generationTime.toFixed(1)}s`
                          : `${Math.floor(generationTime / 60)}m ${(
                              generationTime % 60
                            ).toFixed(1)}s`}
                      </span>
                    </div>
                  )}
                  .
                </p>
              </div>

              <div className="space-y-4">
                {questions.map((question, index) => (
                  <div key={question.id} className="rounded-lg border p-4">
                    <div className="space-y-4">
                      <p className="font-medium">
                        {index + 1}. {question.question}
                      </p>

                      <div className="space-y-2">
                        {Object.entries(question.options).map(
                          ([optionLetter, option]) => {
                            const letter = String.fromCharCode(
                              65 + Number(optionLetter),
                            );
                            const isCorrect =
                              question.correct_option === letter;

                            return (
                              <div
                                key={letter}
                                className={`rounded-md border p-2 text-sm ${
                                  isCorrect ? "border-primary/50 bg-muted" : ""
                                }`}
                              >
                                <span className="font-medium">{letter}.</span>{" "}
                                {option}
                              </div>
                            );
                          },
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-md bg-muted px-2 py-1 text-xs">
                          {question.difficulty}
                        </span>

                        <span className="rounded-md bg-muted px-2 py-1 text-xs">
                          {question.cognitive_level}
                        </span>
                      </div>

                      {question.explanation && (
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Explanation
                          </p>

                          <p className="mt-1 text-sm">{question.explanation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <Separator />

        <DialogFooter>
          {!hasGeneratedQuestions &&
            !generateMutation.isPending &&
            !generateMutation.isError && (
              <>
                <Button
                  variant="outline"
                  disabled={isBusy}
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>

                <LoadingButton
                  loading={generateMutation.isPending}
                  onClick={handleGenerate}
                  disabled={topicIds.length === 0 || questionsPerTopic === 0}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate {totalQuestions} Questions
                </LoadingButton>
              </>
            )}

          {generateMutation.isError && !generateMutation.isPending && (
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          )}

          {hasGeneratedQuestions && (
            <Button
              onClick={() => {
                setIsOpen(false);
                navigate({ to: "/questions/review" });
              }}
            >
              Go to Review
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GenerateQuestions;
