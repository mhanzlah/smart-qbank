import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Suspense, useState } from "react";

import { type UserPublic, UsersService } from "@/client";
import AddUser from "@/components/Admin/AddUser";
import { columns, UserTableData } from "@/components/Admin/columns";
import UserDetails from "@/components/Admin/UserDetails";
import UserFilters, {
  type UserFilters as UserFiltersState,
} from "@/components/Admin/UserFilters";
import { DataTable } from "@/components/Common/DataTable";
import PageHeader from "@/components/Common/PageHeader";
import { PageLayout } from "@/components/Common/PageLayout";
import PendingUsers from "@/components/Pending/PendingUsers";
import useAuth from "@/hooks/useAuth";

function getUsersQueryOptions() {
  return {
    queryFn: async () =>
      (
        await UsersService.readUsers({
          query: {
            skip: 0,
            limit: 100,
          },
        })
      ).data,
    queryKey: ["users"],
  };
}

export const Route = createFileRoute("/_layout/admin")({
  component: Admin,

  beforeLoad: async () => {
    const { data: user } = await UsersService.readUserMe();

    if (!user.is_superuser) {
      throw redirect({
        to: "/",
      });
    }
  },

  head: () => ({
    meta: [
      {
        title: "Admin - Smart QBank",
      },
    ],
  }),
});

function UsersTableContent({
  onRowClick,
}: {
  onRowClick: (user: UserTableData) => void;
}) {
  const { data: users } = useSuspenseQuery(getUsersQueryOptions());
  const { user: currentUser } = useAuth();

  const tableData: UserTableData[] = (users?.data ?? []).map((user) => ({
    ...user,
    isCurrentUser: user.id === currentUser?.id,
  }));

  return (
    <DataTable columns={columns} data={tableData} onRowClick={onRowClick} />
  );
}
function UsersTable({
  onRowClick,
}: {
  onRowClick: (user: UserPublic) => void;
}) {
  return (
    <Suspense fallback={<PendingUsers />}>
      <UsersTableContent onRowClick={onRowClick} />
    </Suspense>
  );
}

function Admin() {
  const [selectedUser, setSelectedUser] = useState<UserPublic | null>(null);

  return (
    <>
      <PageHeader
        title="Users"
        description="Manage user accounts and permissions."
        action={<AddUser />}
      />
      <div className="flex flex-col gap-6">
        <UsersTable onRowClick={setSelectedUser} />

        <UserDetails
          user={selectedUser}
          open={selectedUser !== null}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedUser(null);
            }
          }}
        />
      </div>
    </>
  );
}
