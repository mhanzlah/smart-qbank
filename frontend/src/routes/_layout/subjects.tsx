import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Suspense, useState } from "react";

import type { SubjectPublic } from "@/client";
import { SubjectsService, UsersService } from "@/client";
import { DataTable } from "@/components/Common/DataTable";
import PendingSubjects from "@/components/Pending/PendingSubjects";
import AddSubject from "@/components/Subjects/AddSubject";
import { columns } from "@/components/Subjects/columns";
import SubjectDetails from "@/components/Subjects/SubjectDetails";
import useAuth from "@/hooks/useAuth";

function getSubjectsQueryOptions() {
  return {
    queryFn: async () => (await SubjectsService.readSubjects()).data,
    queryKey: ["subjects"],
  };
}

export const Route = createFileRoute("/_layout/subjects")({
  component: Subjects,

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
        title: "Subjects - Smart QBank",
      },
    ],
  }),
});

function SubjectsTableContent({
  onRowClick,
  canManage,
}: {
  onRowClick: (subject: SubjectPublic) => void;
  canManage: boolean;
}) {
  const { data: subjects } = useSuspenseQuery(getSubjectsQueryOptions());

  return (
    <DataTable
      columns={columns(canManage)}
      data={subjects ?? []}
      onRowClick={onRowClick}
    />
  );
}

function SubjectsTable({
  onRowClick,
  canManage,
}: {
  onRowClick: (subject: SubjectPublic) => void;
  canManage: boolean;
}) {
  return (
    <Suspense fallback={<PendingSubjects />}>
      <SubjectsTableContent onRowClick={onRowClick} canManage={canManage} />
    </Suspense>
  );
}

function Subjects() {
  const { user: currentUser } = useAuth();

  const [selectedSubject, setSelectedSubject] = useState<SubjectPublic | null>(
    null,
  );

  const canManage =
    currentUser?.is_superuser === true || currentUser?.role === "editor";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Subjects</h1>

          <p className="text-muted-foreground">
            Manage subjects and course learning outcomes
          </p>
        </div>

        {canManage && <AddSubject />}
      </div>

      <SubjectsTable onRowClick={setSelectedSubject} canManage={canManage} />

      <SubjectDetails
        subject={selectedSubject}
        open={selectedSubject !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedSubject(null);
          }
        }}
      />
    </div>
  );
}
