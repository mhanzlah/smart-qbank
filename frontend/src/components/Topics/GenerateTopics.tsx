import { useMutation } from "@tanstack/react-query";
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

  // Store indexes of topics selected for saving.
  const [selectedTopics, setSelectedTopics] = useState<Set<number>>(new Set());

  const { showErrorToast, showSuccessToast } = useCustomToast();

  /*
   * Generate topics using AI.
   * These topics are NOT saved to the database yet.
   */
  const generateMutation = useMutation({
    mutationFn: () =>
      TopicsService.generateTopics({
        body: {
          subject_id: subjectId,
          number_of_topics: numberOfTopics,
        },
      }),

    onSuccess: (data) => {
      console.log("Topic generation response:", data);

      const generatedTopics = data.data.topics;

      setTopics(generatedTopics);

      // Select all generated topics by default.
      setSelectedTopics(new Set(generatedTopics.map((_, index) => index)));

      if (generatedTopics.length === 0) {
        showErrorToast("The model did not generate any topics.");
      }
    },

    onError: (error) => {
      console.error("Topic generation error:", error);
      handleError(error, showErrorToast);
    },
  });

  /*
   * Save selected generated topics to the database.
   *
   * Backend:
   * POST /topics/bulk
   *
   * Body:
   * {
   *   subject_id: "...",
   *   topics: [...]
   * }
   */
  const bulkCreateMutation = useMutation({
    mutationFn: () => {
      const selected = topics.filter((_, index) => selectedTopics.has(index));

      return TopicsService.createTopics({
        body: {
          subject_id: subjectId,
          topics: selected,
        },
      });
    },

    onSuccess: () => {
      setIsOpen(false);
      setTopics([]);
      setSelectedTopics(new Set());
      generateMutation.reset();

      // Change this to your success toast if you have one.
      showSuccessToast("Selected topics were created successfully.");
    },

    onError: (error) => {
      console.error("Bulk topic creation error:", error);
      handleError(error, showErrorToast);
    },
  });

  const handleGenerate = () => {
    setTopics([]);
    setSelectedTopics(new Set());
    generateMutation.reset();

    generateMutation.mutate();
  };

  const handleToggleTopic = (index: number) => {
    setSelectedTopics((previous) => {
      const next = new Set(previous);

      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }

      return next;
    });
  };

  const handleToggleAll = () => {
    if (selectedTopics.size === topics.length) {
      setSelectedTopics(new Set());
      return;
    }

    setSelectedTopics(new Set(topics.map((_, index) => index)));
  };

  const handleDelete = (index: number) => {
    setTopics((previous) =>
      previous.filter((_, topicIndex) => topicIndex !== index),
    );

    // Rebuild selection indexes after deleting the topic.
    setSelectedTopics((previous) => {
      const next = new Set<number>();

      previous.forEach((selectedIndex) => {
        if (selectedIndex < index) {
          next.add(selectedIndex);
        } else if (selectedIndex > index) {
          next.add(selectedIndex - 1);
        }
      });

      return next;
    });
  };

  const handleClose = (open: boolean) => {
    if (generateMutation.isPending || bulkCreateMutation.isPending) {
      return;
    }

    setIsOpen(open);

    if (!open) {
      setTopics([]);
      setSelectedTopics(new Set());
      generateMutation.reset();
      bulkCreateMutation.reset();
    }
  };

  const isBusy = generateMutation.isPending || bulkCreateMutation.isPending;

  const hasGeneratedTopics = topics.length > 0;

  const allSelected =
    topics.length > 0 && selectedTopics.size === topics.length;

  const selectedCount = selectedTopics.size;

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
            Generate academic topics for this subject using the subject's
            learning outcomes. Select the topics you want to save.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Generation settings */}
          {!hasGeneratedTopics &&
            !generateMutation.isPending &&
            !generateMutation.isError && (
              <div className="space-y-2">
                <label
                  htmlFor="number-of-topics"
                  className="text-sm font-medium"
                >
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

          {/* Generating */}
          {generateMutation.isPending && (
            <div className="rounded-md border p-8 text-center">
              <Sparkles className="mx-auto mb-3 h-6 w-6 animate-pulse" />

              <p className="font-medium">Generating topics...</p>

              <p className="mt-1 text-sm text-muted-foreground">
                Generating {numberOfTopics} topics using the subject's learning
                outcomes. This may take a moment.
              </p>
            </div>
          )}

          {/* Error */}
          {generateMutation.isError && !generateMutation.isPending && (
            <div className="rounded-md border border-destructive/50 p-6 text-center">
              <p className="font-medium">Failed to generate topics</p>

              <p className="mt-1 text-sm text-muted-foreground">
                The model could not generate a valid topic set. Please try
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

          {/* Generated topics */}
          {hasGeneratedTopics && (
            <div className="space-y-4">
              {/* Header / select all */}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold">Generated Topics</h3>

                  <p className="text-sm text-muted-foreground">
                    {selectedCount} of {topics.length} selected.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isBusy}
                  onClick={handleToggleAll}
                >
                  <Check className="mr-2 h-4 w-4" />
                  {allSelected ? "Deselect All" : "Select All"}
                </Button>
              </div>

              <div className="space-y-4">
                {topics.map((topic, index) => {
                  const isSelected = selectedTopics.has(index);

                  return (
                    <div
                      key={`${topic.name}-${index}`}
                      className={`rounded-lg border p-4 transition-colors ${
                        isSelected ? "border-primary/50 bg-muted/30" : ""
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Checkbox */}
                        <input
                          type="checkbox"
                          checked={isSelected}
                          disabled={isBusy}
                          onChange={() => handleToggleTopic(index)}
                          className="mt-1 h-4 w-4 cursor-pointer"
                          aria-label={`Select ${topic.name}`}
                        />

                        <div className="min-w-0 flex-1 space-y-4">
                          {/* Name */}
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

                          {/* MCQ Focus */}
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                              MCQ Focus
                            </p>

                            <p className="mt-1 text-sm">{topic.mcq_focus}</p>
                          </div>

                          {/* Key Areas */}
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

                        {/* Remove generated topic */}
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={isBusy}
                          onClick={() => handleDelete(index)}
                          aria-label={`Remove ${topic.name}`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* All topics removed */}
          {!generateMutation.isPending &&
            generateMutation.isSuccess &&
            topics.length === 0 && (
              <div className="rounded-md border p-8 text-center">
                <p className="font-medium">No topics available.</p>

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
          {/* Initial state */}
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

          {/* Error */}
          {generateMutation.isError && !generateMutation.isPending && (
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          )}

          {/* Generated */}
          {hasGeneratedTopics && (
            <>
              <Button
                variant="outline"
                disabled={isBusy}
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>

              <LoadingButton
                loading={bulkCreateMutation.isPending}
                disabled={selectedCount === 0}
                onClick={() => bulkCreateMutation.mutate()}
              >
                Create {selectedCount} Selected Topic
                {selectedCount === 1 ? "" : "s"}
              </LoadingButton>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GenerateTopics;
