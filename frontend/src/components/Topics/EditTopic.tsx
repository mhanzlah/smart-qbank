import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { type TopicPublic, TopicsService } from "@/client";
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
import { Textarea } from "@/components/ui/textarea";
import useCustomToast from "@/hooks/useCustomToast";
import { handleError } from "@/utils";

const formSchema = z.object({
  name: z.string().min(1, "Topic name is required"),

  description: z.string().optional(),

  cognitive_levels: z.string().optional(),

  mcq_focus: z.string().min(1, "MCQ focus is required"),

  key_areas: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface EditTopicProps {
  topic: TopicPublic;
  onSuccess: () => void;
}

const EditTopic = ({ topic, onSuccess }: EditTopicProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const queryClient = useQueryClient();

  const { showSuccessToast, showErrorToast } = useCustomToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    criteriaMode: "all",

    defaultValues: {
      name: topic.name,
      description: topic.description ?? "",

      cognitive_levels: topic.cognitive_levels?.join("\n") ?? "",

      mcq_focus: topic.mcq_focus,

      key_areas: topic.key_areas?.join("\n") ?? "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      TopicsService.updateTopic({
        path: {
          topic_id: topic.id,
        },

        body: {
          name: data.name,
          description: data.description || null,

          cognitive_levels: data.cognitive_levels
            ? data.cognitive_levels
                .split("\n")
                .map((item) => item.trim())
                .filter(Boolean)
            : [],

          mcq_focus: data.mcq_focus,

          key_areas: data.key_areas
            ? data.key_areas
                .split("\n")
                .map((item) => item.trim())
                .filter(Boolean)
            : [],
        },
      }),

    onSuccess: () => {
      showSuccessToast("Topic updated successfully");

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

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuItem
        onSelect={(e) => e.preventDefault()}
        onClick={() => {
          form.reset({
            name: topic.name,
            description: topic.description ?? "",
            cognitive_levels: topic.cognitive_levels?.join("\n") ?? "",
            mcq_focus: topic.mcq_focus,
            key_areas: topic.key_areas?.join("\n") ?? "",
          });

          setIsOpen(true);
        }}
      >
        <Pencil />
        Edit Topic
      </DropdownMenuItem>

      <DialogContent className="sm:max-w-lg">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Edit Topic</DialogTitle>

              <DialogDescription>
                Update the topic details below.
              </DialogDescription>
            </DialogHeader>

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
                        placeholder="e.g. Object-Oriented Principles"
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
                        className="min-h-20 resize-none"
                        placeholder="Describe the topic..."
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
                    <FormLabel>Cognitive Levels</FormLabel>

                    <FormControl>
                      <Textarea
                        className="min-h-24 resize-none"
                        placeholder={`One per line:
Recall
Understand
Apply`}
                        {...field}
                      />
                    </FormControl>

                    <p className="text-xs text-muted-foreground">
                      Enter one cognitive level per line.
                    </p>

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
                        className="min-h-24 resize-none"
                        placeholder="What should MCQs focus on?"
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
                    <FormLabel>Key Areas</FormLabel>

                    <FormControl>
                      <Textarea
                        className="min-h-24 resize-none"
                        placeholder={`One per line:
Classes
Objects
Inheritance`}
                        {...field}
                      />
                    </FormControl>

                    <p className="text-xs text-muted-foreground">
                      Enter one key area per line.
                    </p>

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

export default EditTopic;
