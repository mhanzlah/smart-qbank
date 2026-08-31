import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { type Subject, SubjectsService } from "@/client";
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
  name: z
    .string()
    .min(1, { message: "Subject name is required" }),
  code: z.string().optional(),
  clo: z
    .string()
    .min(1, { message: "CLO is required" }),
});

type FormData = z.infer<typeof formSchema>;

interface EditSubjectProps {
  subject: Subject;
  onSuccess: () => void;
}

const EditSubject = ({ subject, onSuccess }: EditSubjectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useCustomToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      name: subject.name,
      code: subject.code ?? "",
      clo: subject.clo ?? "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      SubjectsService.updateSubject({
        path: {
          subject_id: subject.id,
        },
        body: data,
      }),
    onSuccess: () => {
      showSuccessToast("Subject updated successfully");
      setIsOpen(false);
      onSuccess();
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
      <DropdownMenuItem
        onSelect={(e) => e.preventDefault()}
        onClick={() => {
          form.reset({
            name: subject.name,
            code: subject.code ?? "",
            clo: subject.clo ?? "",
          });
          setIsOpen(true);
        }}
      >
        <Pencil />
        Edit Subject
      </DropdownMenuItem>

      <DialogContent className="sm:max-w-lg">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Edit Subject</DialogTitle>
              <DialogDescription>
                Update the subject details and course learning outcomes.
              </DialogDescription>
            </DialogHeader>

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
                        placeholder="Enter the course learning outcomes..."
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

export default EditSubject;
