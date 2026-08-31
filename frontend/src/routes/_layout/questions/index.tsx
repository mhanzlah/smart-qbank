import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Suspense } from "react";

import {
  QuestionsService,
  SubjectsService,
  TopicsService,
  UsersService,
} from "@/client";
import AddQuestion from "@/components/Questions/AddQuestion";
import { columns } from "@/components/Questions/columns";
import { DataTable } from "@/components/Common/DataTable";
import PendingQuestions from "@/components/Pending/PendingQuestions";
import useAuth from "@/hooks/useAuth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

/* -------------------------------------------------------------------------- */
/* Queries                                                                    */
/* -------------------------------------------------------------------------- */

function getSubjectsQueryOptions() {
  return {
    queryFn: async () => (await SubjectsService.readSubjects()).data,
    queryKey: ["subjects"],
  };
}

function getTopicsQueryOptions(subjectId: string) {
  return {
    queryFn: async () =>
      (
        await TopicsService.readTopics({
          query: {
            subject_id: subjectId,
          },
        })
      ).data,
    queryKey: ["topics", subjectId],
  };
}

function getQuestionsQueryOptions(topicId: string) {
  return {
    queryFn: async () =>
      (
        await QuestionsService.readQuestions({
          query: {
            topic_id: topicId,
          },
        })
      ).data,

    queryKey: ["questions", topicId],
  };
}

/* -------------------------------------------------------------------------- */
/* Route                                                                      */
/* -------------------------------------------------------------------------- */

export const Route = createFileRoute("/_layout/questions/")({
  component: Questions,

  validateSearch: (search: Record<string, unknown>) => ({
    subject_id: String(search.subject_id ?? ""),
    topic_id: String(search.topic_id ?? ""),
  }),

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
        title: "Questions",
      },
    ],
  }),
});

/* -------------------------------------------------------------------------- */
/* Questions Table                                                            */
/* -------------------------------------------------------------------------- */

function QuestionsTableContent({ topicId }: { topicId: string }) {
  const { data: questions } = useSuspenseQuery(
    getQuestionsQueryOptions(topicId),
  );

  return <DataTable columns={columns} data={questions ?? []} />;
}

function QuestionsTable({ topicId }: { topicId: string }) {
  return (
    <Suspense fallback={<PendingQuestions />}>
      <QuestionsTableContent topicId={topicId} />
    </Suspense>
  );
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

function Questions() {
  const { user: currentUser } = useAuth();

  const navigate = Route.useNavigate();

  const { subject_id: subjectId, topic_id: topicId } = Route.useSearch();

  const { data: subjects } = useSuspenseQuery(getSubjectsQueryOptions());

  const { data: topics = [], isLoading: topicsLoading } = useQuery({
    ...getTopicsQueryOptions(subjectId),
    enabled: Boolean(subjectId),
  });

  const isSuperuser = currentUser?.is_superuser === true;

  /* ---------------------------------------------------------------------- */
  /* Subject change                                                         */
  /* ---------------------------------------------------------------------- */

  const handleSubjectChange = (value: string) => {
    const newSubjectId = value === "all" ? "" : value;

    navigate({
      search: {
        subject_id: newSubjectId,
        topic_id: "",
      },
    });
  };

  /* ---------------------------------------------------------------------- */
  /* Topic change                                                           */
  /* ---------------------------------------------------------------------- */

  const handleTopicChange = (value: string) => {
    const newTopicId = value === "all" ? "" : value;

    navigate({
      search: {
        subject_id: subjectId,
        topic_id: newTopicId,
      },
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                             */}
      {/* ------------------------------------------------------------------ */}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Questions</h1>

          <p className="text-muted-foreground">
            Manage questions in the question bank
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Subject */}
          <Select
            value={subjectId || "all"}
            onValueChange={handleSubjectChange}
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="All Subjects" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>

              {subjects.map((subject) => (
                <SelectItem key={subject.id} value={subject.id}>
                  {subject.name}
                  {subject.code ? ` (${subject.code})` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Topic */}
          <Select
            value={topicId || "all"}
            onValueChange={handleTopicChange}
            disabled={!subjectId || topicsLoading}
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue
                placeholder={
                  topicsLoading ? "Loading topics..." : "Select topic"
                }
              />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">Select Topic</SelectItem>

              {topics.map((topic) => (
                <SelectItem key={topic.id} value={topic.id}>
                  {topic.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Review Questions */}
          <Button variant="outline" asChild>
            <Link to="/questions/review">Review Questions</Link>
          </Button>

          {/* Add Question */}
          {isSuperuser && topicId && <AddQuestion topicId={topicId} />}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Questions                                                           */}
      {/* ------------------------------------------------------------------ */}

      {topicId ? (
        <QuestionsTable topicId={topicId} />
      ) : (
        <div className="rounded-md border p-8 text-center">
          <h3 className="text-lg font-semibold">Select a topic</h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Select a topic to view its questions.
          </p>
        </div>
      )}
    </div>
  );
}
