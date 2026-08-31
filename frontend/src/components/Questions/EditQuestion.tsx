import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { type QuestionPublic, QuestionsService } from "@/client";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/components/ui/loading-button";
import useCustomToast from "@/hooks/useCustomToast";
import { handleError } from "@/utils";

const formSchema = z.object({
  question: z.string().min(1, "Question is required"),

  option_a: z.string().min(1, "Option A is required"),
  option_b: z.string().min(1, "Option B is required"),
  option_c: z.string().min(1, "Option C is required"),
  option_d: z.string().min(1, "Option D is required"),
  option_e: z.string().min(1, "Option E is required"),

  correct_option: z.enum(["A", "B", "C", "D", "E"]),

  difficulty: z.enum(["easy", "medium", "hard"]),

  cognitive_level: z
    .string()
    .min(1, "Cognitive level is required")
    .max(100, "Cognitive level must be less than 100 characters"),

  explanation: z
    .string()
    .min(1, "Explanation is required")
    .max(600, "Explanation must be less than 600 characters"),
});

type FormData = z.infer<typeof formSchema>;

interface EditQuestionProps {
  question: QuestionPublic;
  onSuccess: () => void;
}

const EditQuestion = ({ question, onSuccess }: EditQuestionProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const queryClient = useQueryClient();

  const { showSuccessToast, showErrorToast } = useCustomToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",

    defaultValues: {
      question: question.question,

      option_a: question.options[0] ?? "",
      option_b: question.options[1] ?? "",
      option_c: question.options[2] ?? "",
      option_d: question.options[3] ?? "",
      option_e: question.options[4] ?? "",

      correct_option: question.correct_option as "A" | "B" | "C" | "D" | "E",

      difficulty: question.difficulty,

      cognitive_level: question.cognitive_level ?? "",

      explanation: question.explanation ?? "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      QuestionsService.updateQuestion({
        path: {
          question_id: question.id,
        },

        body: {
          question: data.question,

          // Backend expects list[str]
          options: [
            data.option_a,
            data.option_b,
            data.option_c,
            data.option_d,
            data.option_e,
          ],

          correct_option: data.correct_option,
          difficulty: data.difficulty,
          cognitive_level: data.cognitive_level,
          explanation: data.explanation,

          // Keep the question attached to its existing topic
          topic_id: question.topic_id,
        },
      }),

    onSuccess: () => {
      showSuccessToast("Question updated successfully");

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

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuItem
        onSelect={(event) => event.preventDefault()}
        onClick={() => {
          form.reset({
            question: question.question,

            option_a: question.options[0] ?? "",
            option_b: question.options[1] ?? "",
            option_c: question.options[2] ?? "",
            option_d: question.options[3] ?? "",
            option_e: question.options[4] ?? "",

            correct_option: question.correct_option as
              | "A"
              | "B"
              | "C"
              | "D"
              | "E",

            difficulty: question.difficulty,

            cognitive_level: question.cognitive_level ?? "",

            explanation: question.explanation ?? "",
          });

          setIsOpen(true);
        }}
      >
        <Pencil />
        Edit Question
      </DropdownMenuItem>

      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Question</DialogTitle>

          <DialogDescription>
            Update the question details below.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {/* Scrollable form content */}
            <div className="max-h-[65vh] overflow-y-auto px-1 pr-3">
              <div className="grid gap-4 py-4">
                {/* Question */}
                <FormField
                  control={form.control}
                  name="question"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Question
                        <span className="text-destructive"> *</span>
                      </FormLabel>

                      <FormControl>
                        <textarea
                          className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
                          placeholder="Enter the question..."
                          {...field}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Options */}
                {(
                  [
                    ["option_a", "Option A"],
                    ["option_b", "Option B"],
                    ["option_c", "Option C"],
                    ["option_d", "Option D"],
                    ["option_e", "Option E"],
                  ] as const
                ).map(([name, label]) => (
                  <FormField
                    key={name}
                    control={form.control}
                    name={name}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {label}
                          <span className="text-destructive"> *</span>
                        </FormLabel>

                        <FormControl>
                          <Input
                            placeholder={`Enter ${label.toLowerCase()}...`}
                            {...field}
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}

                {/* Correct option + Difficulty */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="correct_option"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Correct Option
                          <span className="text-destructive"> *</span>
                        </FormLabel>

                        <FormControl>
                          <select
                            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                            value={field.value}
                            onChange={field.onChange}
                          >
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                            <option value="D">D</option>
                            <option value="E">E</option>
                          </select>
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="difficulty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Difficulty
                          <span className="text-destructive"> *</span>
                        </FormLabel>

                        <FormControl>
                          <select
                            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                            value={field.value}
                            onChange={field.onChange}
                          >
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                          </select>
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Cognitive Level */}
                <FormField
                  control={form.control}
                  name="cognitive_level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Cognitive Level
                        <span className="text-destructive"> *</span>
                      </FormLabel>

                      <FormControl>
                        <Input
                          placeholder="e.g. Remember, Understand, Apply"
                          {...field}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Explanation */}
                <FormField
                  control={form.control}
                  name="explanation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Explanation
                        <span className="text-destructive"> *</span>
                      </FormLabel>

                      <FormControl>
                        <textarea
                          className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
                          placeholder="Explain why the correct answer is correct..."
                          {...field}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Footer */}
            <DialogFooter className="mt-4">
              <DialogClose asChild>
                <Button variant="outline" disabled={mutation.isPending}>
                  Cancel
                </Button>
              </DialogClose>

              <LoadingButton type="submit" loading={mutation.isPending}>
                Save
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditQuestion;
