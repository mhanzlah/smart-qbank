import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { ArrowLeft, ClipboardCheck, Search, X } from "lucide-react";
import { Suspense, useMemo, useState } from "react";

import {
  QuestionsService,
  SubjectsService,
  TopicsService,
  UsersService,
  type QuestionPublic,
} from "@/client";
import ReviewQuestion from "@/components/Questions/ReviewQuestion";
import { DataTable } from "@/components/Common/DataTable";
import PendingQuestions from "@/components/Pending/PendingQuestions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useAuth from "@/hooks/useAuth";
import type { ColumnDef } from "@tanstack/react-table";

function getReviewQuestionsQueryOptions() {
  return {
    queryFn: async () =>
      (await QuestionsService.readQuestionsForReview()).data,
    queryKey: ["questions-review"],
  };
}

function getReviewTopicsQueryOptions() {
  return {
    queryFn: async () =>
      (await TopicsService.readTopics()).data,
    queryKey: ["review-topics"],
  };
}

function getReviewSubjectsQueryOptions() {
  return {
    queryFn: async () =>
      (await SubjectsService.readSubjects()).data,
    queryKey: ["review-subjects"],
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
        title: "Review Questions - Smart QBank",
      },
    ],
  }),
});

function ReviewQuestionsTableContent() {
  const { data: questions } = useSuspenseQuery(
    getReviewQuestionsQueryOptions(),
  );

  const { data: topics } = useSuspenseQuery(
    getReviewTopicsQueryOptions(),
  );

  const { data: subjects } = useSuspenseQuery(
    getReviewSubjectsQueryOptions(),
  );

  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [search, setSearch] = useState("");

  const topicMap = useMemo(
    () => new Map(topics.map((topic) => [topic.id, topic])),
    [topics],
  );

  const subjectMap = useMemo(
    () => new Map(subjects.map((subject) => [subject.id, subject])),
    [subjects],
  );

  /*
   * Topics belonging to the selected subject.
   */
  const filteredTopics = useMemo(() => {
    if (selectedSubject === "all") {
      return topics;
    }

    return topics.filter(
      (topic) => topic.subject_id === selectedSubject,
    );
  }, [topics, selectedSubject]);

  /*
   * Questions after applying all filters.
   */
  const filteredQuestions = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return questions.filter((question) => {
      const topic = topicMap.get(question.topic_id);

      if (!topic) {
        return false;
      }

      // Subject filter
      if (
        selectedSubject !== "all" &&
        topic.subject_id !== selectedSubject
      ) {
        return false;
      }

      // Topic filter
      if (
        selectedTopic !== "all" &&
        question.topic_id !== selectedTopic
      ) {
        return false;
      }

      // Difficulty filter
      if (
        selectedDifficulty !== "all" &&
        question.difficulty !== selectedDifficulty
      ) {
        return false;
      }

      // Search filter
      if (
        searchText &&
        !question.question.toLowerCase().includes(searchText)
      ) {
        return false;
      }

      return true;
    });
  }, [
    questions,
    topicMap,
    selectedSubject,
    selectedTopic,
    selectedDifficulty,
    search,
  ]);

  /*
   * Reset topic when subject changes.
   */
  const handleSubjectChange = (value: string) => {
    setSelectedSubject(value);
    setSelectedTopic("all");
  };

  const clearFilters = () => {
    setSelectedSubject("all");
    setSelectedTopic("all");
    setSelectedDifficulty("all");
    setSearch("");
  };

  const hasFilters =
    selectedSubject !== "all" ||
    selectedTopic !== "all" ||
    selectedDifficulty !== "all" ||
    search.trim() !== "";

  const columns: ColumnDef<QuestionPublic>[] = [
    {
      accessorKey: "question",
      header: "Question",
      cell: ({ row }) => (
        <div className="max-w-[500px] truncate">
          {row.original.question}
        </div>
      ),
    },

    {
      id: "subject",
      header: "Subject",
      cell: ({ row }) => {
        const topic = topicMap.get(row.original.topic_id);

        if (!topic) {
          return (
            <span className="text-muted-foreground">
              Unknown
            </span>
          );
        }

        const subject = subjectMap.get(topic.subject_id);

        return (
          <span className="max-w-[180px] truncate">
            {subject?.name ?? "Unknown"}
          </span>
        );
      },
    },

    {
      id: "topic",
      header: "Topic",
      cell: ({ row }) => {
        const topic = topicMap.get(row.original.topic_id);

        return (
          <span className="max-w-[200px] truncate">
            {topic?.name ?? "Unknown topic"}
          </span>
        );
      },
    },

    {
      accessorKey: "difficulty",
      header: "Difficulty",
      cell: ({ row }) => (
        <Badge variant="secondary">
          {row.original.difficulty}
        </Badge>
      ),
    },

    {
      accessorKey: "cognitive_level",
      header: "Cognitive Level",
      cell: ({ row }) => (
        <span className="capitalize">
          {row.original.cognitive_level}
        </span>
      ),
    },

    {
      accessorKey: "review_status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.original.review_status}
        </Badge>
      ),
    },

    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const topicName =
          topicMap.get(row.original.topic_id)?.name ??
          "Unknown topic";

        return (
          <ReviewQuestion
            question={row.original}
            topicName={topicName}
          />
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="rounded-lg border bg-card p-4">
        <div className="flex flex-col gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              placeholder="Search questions..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              className="pl-9"
            />
          </div>

          {/* Select filters */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {/* Subject */}
            <Select
              value={selectedSubject}
              onValueChange={handleSubjectChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">
                  All Subjects
                </SelectItem>

                {subjects.map((subject) => (
                  <SelectItem
                    key={subject.id}
                    value={subject.id}
                  >
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Topic */}
            <Select
              value={selectedTopic}
              onValueChange={setSelectedTopic}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select topic" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">
                  All Topics
                </SelectItem>

                {filteredTopics.map((topic) => (
                  <SelectItem
                    key={topic.id}
                    value={topic.id}
                  >
                    {topic.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Difficulty */}
            <Select
              value={selectedDifficulty}
              onValueChange={setSelectedDifficulty}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">
                  All Difficulties
                </SelectItem>

                <SelectItem value="easy">
                  Easy
                </SelectItem>

                <SelectItem value="medium">
                  Medium
                </SelectItem>

                <SelectItem value="hard">
                  Hard
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Clear */}
            <Button
              variant="outline"
              onClick={clearFilters}
              disabled={!hasFilters}
            >
              <X className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Result count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-medium text-foreground">
            {filteredQuestions.length}
          </span>{" "}
          of{" "}
          <span className="font-medium text-foreground">
            {questions.length}
          </span>{" "}
          questions
        </p>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredQuestions}
      />
    </div>
  );
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
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="mt-1"
          >
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
              Review questions before they are added to the
              approved question bank
            </p>
          </div>
        </div>

        <Button variant="outline" asChild>
          <Link to="/questions">
            Back to Questions
          </Link>
        </Button>
      </div>

      {/* Permission information */}
      {!isSuperuser && (
        <div className="rounded-md border bg-muted/30 p-4 text-sm text-muted-foreground">
          You can review questions, but only superusers can
          modify questions.
        </div>
      )}

      {/* Questions */}
      <ReviewQuestionsTable />
    </div>
  );
}
