import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { type TopicCreate, TopicsService } from "@/client";
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
import { Textarea } from "@/components/ui/textarea";
import useCustomToast from "@/hooks/useCustomToast";
import { handleError } from "@/utils";

const formSchema = z.object({
  name: z
    .string()
    .min(1, "Topic name is required")
    .max(255, "Topic name must be less than 255 characters"),

  description: z.string().optional(),

  cognitive_levels: z
    .string()
    .min(1, "At least one cognitive level is required"),

  mcq_focus: z.string().min(1, "MCQ focus is required"),

  key_areas: z.string().min(1, "At least one key area is required"),
});

type FormData = z.infer<typeof formSchema>;

interface AddTopicProps {
  subjectId: string;
  disabled?: boolean;
}

const AddTopic = ({ subjectId, disabled = false }: AddTopicProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const queryClient = useQueryClient();

  const { showSuccessToast, showErrorToast } = useCustomToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      name: "",
      description: "",
      cognitive_levels: "",
      mcq_focus: "",
      key_areas: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: TopicCreate) =>
      TopicsService.createTopic({
        body: data,
      }),

    onSuccess: () => {
      showSuccessToast("Topic created successfully");

      form.reset();

      setIsOpen(false);
    },

    onError: handleError.bind(showErrorToast),

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["topics", subjectId],
      });
    },
  });

  const onSubmit = (data: FormData) => {
    const topic: TopicCreate = {
      name: data.name,
      description: data.description || null,

      cognitive_levels: data.cognitive_levels
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),

      mcq_focus: data.mcq_focus,

      key_areas: data.key_areas
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),

      // Automatically comes from the selected subject.
      subject_id: subjectId,
    };

    mutation.mutate(topic);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="my-4" disabled={disabled}>
          <Plus className="mr-2" />
          Add Topic
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Topic</DialogTitle>

          <DialogDescription>
            Add a topic and define the information used for MCQ generation.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Topic Name <span className="text-destructive">*</span>
                    </FormLabel>

                    <FormControl>
                      <Input
                        placeholder="e.g. Variables and Data Types"
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>

                    <FormControl>
                      <Textarea
                        placeholder="Describe what this topic covers..."
                        className="min-h-20 resize-none"
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cognitive_levels"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Cognitive Levels{" "}
                      <span className="text-destructive">*</span>
                    </FormLabel>

                    <FormControl>
                      <Textarea
                        placeholder={`One per line:
Recall
Understand
Apply`}
                        className="min-h-24 resize-none"
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mcq_focus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      MCQ Focus <span className="text-destructive">*</span>
                    </FormLabel>

                    <FormControl>
                      <Textarea
                        placeholder="What should generated MCQs focus on?"
                        className="min-h-24 resize-none"
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="key_areas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Key Areas <span className="text-destructive">*</span>
                    </FormLabel>

                    <FormControl>
                      <Textarea
                        placeholder={`One per line:
Variables
Primitive data types
Type conversion`}
                        className="min-h-24 resize-none"
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
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

export default AddTopic;