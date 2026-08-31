import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { ArrowLeft, ClipboardCheck } from "lucide-react";
import { Suspense } from "react";

import { QuestionsService, UsersService } from "@/client";
import ReviewQuestion from "@/components/Questions/ReviewQuestion";
import { DataTable } from "@/components/Common/DataTable";
import PendingQuestions from "@/components/Pending/PendingQuestions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import useAuth from "@/hooks/useAuth";
import type { ColumnDef } from "@tanstack/react-table";
import type { QuestionPublic } from "@/client";

function getReviewQuestionsQueryOptions() {
  return {
    queryFn: async () => (await QuestionsService.readQuestionsForReview()).data,
    queryKey: ["questions-review"],
  };
}

export const Route = createFileRoute("/_layout/questions/review")({
  component: ReviewQuestions,

  beforeLoad: async () => {
    const { data: user } = await UsersService.readUserMe();

    if (!user.is_superuser && user.role !== "editor") {
      throw redirect({
        to: "/",
      });
    }
  },

  head: () => ({
    meta: [
      {
        title: "Review Questions",
      },
    ],
  }),
});

const columns: ColumnDef<QuestionPublic>[] = [
  {
    accessorKey: "question",
    header: "Question",
    cell: ({ row }) => {
      const question = row.original.question;

      return <div className="max-w-[500px] truncate">{question}</div>;
    },
  },

  {
    accessorKey: "difficulty",
    header: "Difficulty",
    cell: ({ row }) => {
      const difficulty = row.original.difficulty;

      return <Badge variant="secondary">{difficulty}</Badge>;
    },
  },

  {
    accessorKey: "cognitive_level",
    header: "Cognitive Level",
    cell: ({ row }) => (
      <span className="capitalize">{row.original.cognitive_level}</span>
    ),
  },

  {
    accessorKey: "review_status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant="outline">{row.original.review_status}</Badge>
    ),
  },

  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <ReviewQuestion question={row.original} />,
  },
];

function ReviewQuestionsTableContent() {
  const { data: questions } = useSuspenseQuery(
    getReviewQuestionsQueryOptions(),
  );

  return <DataTable columns={columns} data={questions ?? []} />;
}

function ReviewQuestionsTable() {
  return (
    <Suspense fallback={<PendingQuestions />}>
      <ReviewQuestionsTableContent />
    </Suspense>
  );
}

function ReviewQuestions() {
  const { user: currentUser } = useAuth();

  const isSuperuser = currentUser?.is_superuser === true;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon" asChild className="mt-1">
            <Link to="/questions">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>

          <div>
            <div className="flex items-center gap-2">
              <ClipboardCheck className="h-6 w-6" />

              <h1 className="text-2xl font-bold tracking-tight">
                Review Questions
              </h1>
            </div>

            <p className="text-muted-foreground">
              Review questions before they are added to the approved question
              bank
            </p>
          </div>
        </div>

        <Button variant="outline" asChild>
          <Link to="/questions">Back to Questions</Link>
        </Button>
      </div>

      {/* Permission information */}
      {!isSuperuser && (
        <div className="rounded-md border bg-muted/30 p-4 text-sm text-muted-foreground">
          You can review questions, but only superusers can modify questions.
        </div>
      )}

      {/* Questions */}
      <ReviewQuestionsTable />
    </div>
  );
}
