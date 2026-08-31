import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { type SubjectCreate, SubjectsService } from "@/client";
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
import useCustomToast from "@/hooks/useCustomToast";
import { handleError } from "@/utils";

const formSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Subject name is required" }),
  code: z
    .string()
    .optional(),
  clo: z
    .string()
    .min(1, { message: "CLO is required" }),
});

type FormData = z.infer<typeof formSchema>;

const AddSubject = () => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useCustomToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      name: "",
      code: "",
      clo: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: SubjectCreate) =>
      SubjectsService.createSubject({
        body: data,
      }),
    onSuccess: () => {
      showSuccessToast("Subject created successfully");
      form.reset();
      setIsOpen(false);
    },
    onError: handleError.bind(showErrorToast),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["subjects"],
      });
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="my-4">
          <Plus className="mr-2" />
          Add Subject
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Subject</DialogTitle>
          <DialogDescription>
            Add a subject and define its course learning outcomes.
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
                      Subject Name{" "}
                      <span className="text-destructive">*</span>
                    </FormLabel>

                    <FormControl>
                      <Input
                        placeholder="e.g. Programming Fundamentals"
                        {...field}
                        required
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code</FormLabel>

                    <FormControl>
                      <Input
                        placeholder="e.g. PF"
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="clo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Course Learning Outcomes (CLO){" "}
                      <span className="text-destructive">*</span>
                    </FormLabel>

                    <FormControl>
                      <textarea
                        className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-40 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                        placeholder={`By the end of this course student will be able to:

- Demonstrate proficiency in writing basic programs.
- Explain core programming concepts.
- Develop simple algorithms to solve computational problems.`}
                        {...field}
                        required
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button
                  variant="outline"
                  disabled={mutation.isPending}
                >
                  Cancel
                </Button>
              </DialogClose>

              <LoadingButton
                type="submit"
                loading={mutation.isPending}
              >
                Save
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddSubject;
