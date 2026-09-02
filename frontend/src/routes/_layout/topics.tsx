import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Suspense, useState } from "react";

import type { TopicPublic } from "@/client";
import { SubjectsService, TopicsService, UsersService } from "@/client";
import { DataTable } from "@/components/Common/DataTable";
import PendingTopics from "@/components/Pending/PendingTopics";
import AddTopic from "@/components/Topics/AddTopic";
import GenerateTopics from "@/components/Topics/GenerateTopics";
import { columns } from "@/components/Topics/columns";
import TopicDetails from "@/components/Topics/TopicDetails";
import useAuth from "@/hooks/useAuth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

export const Route = createFileRoute("/_layout/topics")({
  component: Topics,

  validateSearch: (search: Record<string, unknown>) => ({
    subject_id: String(search.subject_id ?? ""),
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
        title: "Topics - Smart QBank",
      },
    ],
  }),
});

function TopicsTableContent({
  subjectId,
  onRowClick,
}: {
  subjectId: string;
  onRowClick: (topic: TopicPublic) => void;
}) {
  const { data: topics } = useSuspenseQuery(getTopicsQueryOptions(subjectId));

  return (
    <DataTable
      columns={columns}
      data={topics ?? []}
      onRowClick={onRowClick}
    />
  );
}

function TopicsTable({
  subjectId,
  onRowClick,
}: {
  subjectId: string;
  onRowClick: (topic: TopicPublic) => void;
}) {
  return (
    <Suspense fallback={<PendingTopics />}>
      <TopicsTableContent
        subjectId={subjectId}
        onRowClick={onRowClick}
      />
    </Suspense>
  );
}

function Topics() {
  const { user: currentUser } = useAuth();

  const navigate = Route.useNavigate();

  const { subject_id: subjectId } = Route.useSearch();

  const { data: subjects } = useSuspenseQuery(getSubjectsQueryOptions());

  const [selectedTopic, setSelectedTopic] =
    useState<TopicPublic | null>(null);

  const canManageTopics =
    currentUser?.is_superuser === true || currentUser?.role === "editor";

  const handleSubjectChange = (value: string) => {
    const newSubjectId = value === "all" ? "" : value;

    navigate({
      search: {
        subject_id: newSubjectId,
      },
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Topics</h1>

          <p className="text-muted-foreground">
            Manage topics and their learning metadata
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select
            value={subjectId || "all"}
            onValueChange={handleSubjectChange}
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Select subject" />
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

          {canManageTopics && (
            <>
              <GenerateTopics
                subjectId={subjectId}
                disabled={!subjectId}
              />

              <AddTopic
                subjectId={subjectId}
                disabled={!subjectId}
              />
            </>
          )}
        </div>
      </div>

      {subjectId ? (
        <TopicsTable
          subjectId={subjectId}
          onRowClick={setSelectedTopic}
        />
      ) : (
        <div className="rounded-md border p-8 text-center">
          <h3 className="text-lg font-semibold">Select a subject</h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Select a subject to view its topics.
          </p>
        </div>
      )}

      <TopicDetails
        topic={selectedTopic}
        open={selectedTopic !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedTopic(null);
          }
        }}
      />
    </div>
  );
}
