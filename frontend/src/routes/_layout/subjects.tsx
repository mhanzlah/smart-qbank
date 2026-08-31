import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Suspense } from "react";

import { SubjectsService, UsersService } from "@/client";
import AddSubject from "@/components/Subjects/AddSubject";
import { columns } from "@/components/Subjects/columns";
import { DataTable } from "@/components/Common/DataTable";
import PendingSubjects from "@/components/Pending/PendingSubjects";
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
        title: "Subjects",
      },
    ],
  }),
});

function SubjectsTableContent() {
  const { data: subjects } = useSuspenseQuery(getSubjectsQueryOptions());

  return <DataTable columns={columns} data={subjects ?? []} />;
}

function SubjectsTable() {
  return (
    <Suspense fallback={<PendingSubjects />}>
      <SubjectsTableContent />
    </Suspense>
  );
}

function Subjects() {
  const { user: currentUser } = useAuth();

  const isSuperuser = currentUser?.is_superuser === true;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Subjects</h1>

          <p className="text-muted-foreground">
            Manage subjects and course learning outcomes
          </p>
        </div>

        {isSuperuser && <AddSubject />}
      </div>

      <SubjectsTable />
    </div>
  );
}
