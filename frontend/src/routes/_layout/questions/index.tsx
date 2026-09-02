import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Suspense, useState } from "react";

import type { QuestionPublic } from "@/client";
import {
  QuestionsService,
  SubjectsService,
  TopicsService,
  UsersService,
} from "@/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/Common/DataTable";
import PendingQuestions from "@/components/Pending/PendingQuestions";
import AddQuestion from "@/components/Questions/AddQuestion";
import GenerateQuestions from "@/components/Questions/GenerateQuestions";
import QuestionDetails from "@/components/Questions/QuestionDetails";
import { columns } from "@/components/Questions/columns";
import useAuth from "@/hooks/useAuth";

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

function getQuestionsQueryOptions(topicIds: string[]) {
  const normalizedTopicIds = [...topicIds].sort();

  return {
    queryFn: async () =>
      (
        await QuestionsService.readQuestions({
          query: {
            topic_ids: normalizedTopicIds,
          },
        })
      ).data,

    queryKey: ["questions", normalizedTopicIds],

    enabled: normalizedTopicIds.length > 0,
  };
}

export const Route = createFileRoute("/_layout/questions/")({
  component: Questions,

  validateSearch: (search: Record<string, unknown>) => ({
    subject_id: String(search.subject_id ?? ""),
    topic_ids: String(search.topic_ids ?? ""),
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
        title: "Questions - Smart QBank",
      },
    ],
  }),
});

function QuestionsTableContent({
  topicIds,
  onRowClick,
}: {
  topicIds: string[];
  onRowClick: (question: QuestionPublic) => void;
}) {
  const { data: questions = [], isLoading } = useQuery(
    getQuestionsQueryOptions(topicIds),
  );

  if (isLoading) {
    return <PendingQuestions />;
  }

  return (
    <DataTable columns={columns} data={questions} onRowClick={onRowClick} />
  );
}

function QuestionsTable({
  topicIds,
  onRowClick,
}: {
  topicIds: string[];
  onRowClick: (question: QuestionPublic) => void;
}) {
  return (
    <Suspense fallback={<PendingQuestions />}>
      <QuestionsTableContent topicIds={topicIds} onRowClick={onRowClick} />
    </Suspense>
  );
}

function Questions() {
  const { user: currentUser } = useAuth();
  const navigate = Route.useNavigate();

  const { subject_id: subjectId, topic_ids: topicIdsParam } = Route.useSearch();

  const { data: subjects } = useSuspenseQuery(getSubjectsQueryOptions());

  const { data: topics = [], isLoading: topicsLoading } = useQuery({
    ...getTopicsQueryOptions(subjectId),
    enabled: Boolean(subjectId),
  });

  const [selectedQuestion, setSelectedQuestion] =
    useState<QuestionPublic | null>(null);

  const selectedTopicIds = topicIdsParam
    ? topicIdsParam.split(",").filter(Boolean)
    : [];

  const selectedTopics = topics.filter((topic) =>
    selectedTopicIds.includes(topic.id),
  );

  const isSuperuser = currentUser?.is_superuser === true;

  const handleSubjectChange = (value: string) => {
    const newSubjectId = value === "all" ? "" : value;

    navigate({
      search: {
        subject_id: newSubjectId,
        topic_ids: "",
      },
    });

    // Close any currently opened question
    setSelectedQuestion(null);
  };

  const handleTopicChange = (topicId: string, checked: boolean) => {
    const newTopicIds = checked
      ? [...selectedTopicIds, topicId]
      : selectedTopicIds.filter((id) => id !== topicId);

    navigate({
      search: {
        subject_id: subjectId,
        topic_ids: newTopicIds.join(","),
      },
    });

    setSelectedQuestion(null);
  };

  const handleSelectAllTopics = () => {
    const allTopicIds = topics.map((topic) => topic.id);

    navigate({
      search: {
        subject_id: subjectId,
        topic_ids: allTopicIds.join(","),
      },
    });

    setSelectedQuestion(null);
  };

  const handleClearTopics = () => {
    navigate({
      search: {
        subject_id: subjectId,
        topic_ids: "",
      },
    });

    setSelectedQuestion(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Questions</h1>

          <p className="text-muted-foreground">
            Manage questions in the question bank
          </p>
        </div>

        <div className="flex items-center gap-3">
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-[240px] justify-between"
                disabled={!subjectId || topicsLoading}
              >
                {topicsLoading
                  ? "Loading topics..."
                  : selectedTopics.length === 0
                    ? "Select Topics"
                    : `${selectedTopics.length} topic${
                        selectedTopics.length > 1 ? "s" : ""
                      } selected`}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start" className="w-[240px]">
              {topics.length > 0 && (
                <>
                  <DropdownMenuCheckboxItem
                    checked={
                      selectedTopicIds.length === topics.length &&
                      topics.length > 0
                    }
                    onCheckedChange={handleSelectAllTopics}
                  >
                    Select All
                  </DropdownMenuCheckboxItem>

                  {selectedTopicIds.length > 0 && (
                    <DropdownMenuCheckboxItem
                      checked={false}
                      onCheckedChange={handleClearTopics}
                    >
                      Clear Selection
                    </DropdownMenuCheckboxItem>
                  )}

                  <div className="my-1 border-t" />

                  {topics.map((topic) => (
                    <DropdownMenuCheckboxItem
                      key={topic.id}
                      checked={selectedTopicIds.includes(topic.id)}
                      onCheckedChange={(checked) =>
                        handleTopicChange(topic.id, checked)
                      }
                    >
                      {topic.name}
                    </DropdownMenuCheckboxItem>
                  ))}
                </>
              )}

              {topics.length === 0 && !topicsLoading && (
                <div className="px-2 py-2 text-sm text-muted-foreground">
                  No topics found
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" asChild>
            <Link to="/questions/review">Review Questions</Link>
          </Button>

          {isSuperuser && (
            <>
              <GenerateQuestions
                topicIds={selectedTopicIds}
                disabled={selectedTopicIds.length === 0}
              />

              <AddQuestion
                topicId={selectedTopicIds[0] ?? ""}
                disabled={selectedTopicIds.length !== 1}
              />
            </>
          )}
        </div>
      </div>

      {selectedTopicIds.length > 0 ? (
        <QuestionsTable
          key={selectedTopicIds.join(",")}
          topicIds={selectedTopicIds}
          onRowClick={setSelectedQuestion}
        />
      ) : (
        <div className="rounded-md border p-8 text-center">
          <h3 className="text-lg font-semibold">Select topics</h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Select one or more topics to view their questions.
          </p>
        </div>
      )}

      <QuestionDetails
        question={selectedQuestion}
        open={selectedQuestion !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedQuestion(null);
          }
        }}
      />
    </div>
  );
}
