import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";

import { TopicsService, type TopicGenerationResponse } from "@/client";
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

interface GenerateTopicsProps {
  subjectId: string;
  disabled?: boolean;
}

const GenerateTopics = ({
  subjectId,
  disabled = false,
}: GenerateTopicsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [numberOfTopics, setNumberOfTopics] = useState(10);
  const [topics, setTopics] = useState<TopicGenerationResponse["topics"]>([]);

  const queryClient = useQueryClient();

  const { showSuccessToast, showErrorToast } = useCustomToast();

  /* ---------------------------------------------------------------------- */
  /* Generate topics                                                        */
  /* ---------------------------------------------------------------------- */

  const generateMutation = useMutation({
    mutationFn: () =>
      TopicsService.generateTopics({
        body: {
          subject_id: subjectId,
          number_of_topics: numberOfTopics,
        },
      }),

    onSuccess: (data) => {
      setTopics(data.topics);

      if (data.topics.length === 0) {
        showErrorToast("The model did not generate any topics.");
      }
    },

    onError: handleError.bind(showErrorToast),
  });

  /* ---------------------------------------------------------------------- */
  /* Bulk create approved topics                                           */
  /* ---------------------------------------------------------------------- */

  const createMutation = useMutation({
    mutationFn: () =>
      TopicsService.createTopics({
        body: {
          subject_id: subjectId,
          topics,
        },
      }),

    onSuccess: () => {
      showSuccessToast(
        `${topics.length} topic${topics.length === 1 ? "" : "s"} created successfully`,
      );

      setTopics([]);
      setIsOpen(false);

      queryClient.invalidateQueries({
        queryKey: ["topics", subjectId],
      });
    },

    onError: handleError.bind(showErrorToast),
  });

  /* ---------------------------------------------------------------------- */
  /* Delete a generated topic                                              */
  /* ---------------------------------------------------------------------- */

  const handleDelete = (index: number) => {
    setTopics((previous) =>
      previous.filter((_, topicIndex) => topicIndex !== index),
    );
  };

  /* ---------------------------------------------------------------------- */
  /* Generate                                                               */
  /* ---------------------------------------------------------------------- */

  const handleGenerate = () => {
    setTopics([]);
    generateMutation.mutate();
  };

  /* ---------------------------------------------------------------------- */
  /* Approve all remaining topics                                           */
  /* ---------------------------------------------------------------------- */

  const handleApproveAll = () => {
    if (topics.length === 0) {
      return;
    }

    createMutation.mutate();
  };

  /* ---------------------------------------------------------------------- */
  /* Close                                                                  */
  /* ---------------------------------------------------------------------- */

  const handleClose = (open: boolean) => {
    if (generateMutation.isPending || createMutation.isPending) {
      return;
    }

    setIsOpen(open);

    if (!open) {
      setTopics([]);
      generateMutation.reset();
      createMutation.reset();
    }
  };

  const isBusy = generateMutation.isPending || createMutation.isPending;

  const hasGeneratedTopics = topics.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={disabled}>
          <Sparkles className="mr-2 h-4 w-4" />
          Generate Topics
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Generate Topics</DialogTitle>

          <DialogDescription>
            Generate academic topics using the selected subject's course
            learning outcomes. Review the generated topics before adding them to
            the question bank.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* ---------------------------------------------------------------- */}
          {/* Generation settings                                             */}
          {/* ---------------------------------------------------------------- */}

          {!hasGeneratedTopics && !generateMutation.isPending && (
            <div className="space-y-2">
              <label htmlFor="number-of-topics" className="text-sm font-medium">
                Number of Topics
              </label>

              <Input
                id="number-of-topics"
                type="number"
                min={1}
                max={50}
                value={numberOfTopics}
                disabled={isBusy}
                onChange={(event) => {
                  const value = Number(event.target.value);

                  setNumberOfTopics(Math.min(50, Math.max(1, value || 1)));
                }}
              />

              <p className="text-xs text-muted-foreground">
                Generate between 1 and 50 topics.
              </p>
            </div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* Generating                                                       */}
          {/* ---------------------------------------------------------------- */}

          {generateMutation.isPending && (
            <div className="rounded-md border p-8 text-center">
              <Sparkles className="mx-auto mb-3 h-6 w-6 animate-pulse" />

              <p className="font-medium">Generating topics...</p>

              <p className="mt-1 text-sm text-muted-foreground">
                The model is generating {numberOfTopics} topics based on the
                subject's CLOs. This may take a moment.
              </p>
            </div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* Generation error                                                 */}
          {/* ---------------------------------------------------------------- */}

          {generateMutation.isError && !generateMutation.isPending && (
            <div className="rounded-md border border-destructive/50 p-6 text-center">
              <p className="font-medium">Failed to generate topics</p>

              <p className="mt-1 text-sm text-muted-foreground">
                The model could not generate a valid topic set. Try again.
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

          {/* ---------------------------------------------------------------- */}
          {/* Generated topics                                                 */}
          {/* ---------------------------------------------------------------- */}

          {hasGeneratedTopics && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Generated Topics</h3>

                  <p className="text-sm text-muted-foreground">
                    {topics.length} topic
                    {topics.length === 1 ? "" : "s"} available for approval.
                    Delete any topics you do not want to keep.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {topics.map((topic, index) => (
                  <div
                    key={`${topic.name}-${index}`}
                    className="rounded-lg border p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1 space-y-4">
                        {/* Name + description */}
                        <div>
                          <h4 className="font-semibold">{topic.name}</h4>

                          <p className="mt-1 text-sm text-muted-foreground">
                            {topic.description}
                          </p>
                        </div>

                        {/* Cognitive levels */}
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Cognitive Levels
                          </p>

                          <div className="mt-2 flex flex-wrap gap-1">
                            {topic.cognitive_levels.map((level) => (
                              <span
                                key={level}
                                className="rounded-md bg-muted px-2 py-1 text-xs"
                              >
                                {level}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* MCQ focus */}
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            MCQ Focus
                          </p>

                          <p className="mt-1 text-sm">{topic.mcq_focus}</p>
                        </div>

                        {/* Key areas */}
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Key Areas
                          </p>

                          <ul className="mt-1 list-disc pl-5 text-sm">
                            {topic.key_areas.map((area) => (
                              <li key={area}>{area}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Delete */}
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={isBusy}
                        onClick={() => handleDelete(index)}
                        aria-label={`Delete ${topic.name}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* All topics deleted                                               */}
          {/* ---------------------------------------------------------------- */}

          {!generateMutation.isPending &&
            generateMutation.isSuccess &&
            topics.length === 0 && (
              <div className="rounded-md border p-8 text-center">
                <p className="font-medium">No topics available for approval.</p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Generate a new set of topics to continue.
                </p>

                <Button
                  className="mt-4"
                  variant="outline"
                  onClick={handleGenerate}
                  disabled={isBusy}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Again
                </Button>
              </div>
            )}
        </div>

        <Separator />

        <DialogFooter>
          {/* Initial / retry state */}
          {!hasGeneratedTopics &&
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
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate
                </LoadingButton>
              </>
            )}

          {/* Generation error */}
          {generateMutation.isError && !generateMutation.isPending && (
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isBusy}
            >
              Close
            </Button>
          )}

          {/* Generated topics */}
          {hasGeneratedTopics && (
            <>
              <Button
                variant="outline"
                disabled={isBusy}
                onClick={() => setTopics([])}
              >
                Discard All
              </Button>

              <LoadingButton
                loading={createMutation.isPending}
                disabled={isBusy || topics.length === 0}
                onClick={handleApproveAll}
              >
                <Check className="mr-2 h-4 w-4" />
                Approve All ({topics.length})
              </LoadingButton>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GenerateTopics;
