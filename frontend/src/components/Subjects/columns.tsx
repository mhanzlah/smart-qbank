import type { ColumnDef } from "@tanstack/react-table";

import type { SubjectPublic } from "@/client";
import { Badge } from "@/components/ui/badge";
import { SubjectActionsMenu } from "./SubjectActionsMenu";

export const columns = (canManage: boolean): ColumnDef<SubjectPublic>[] => [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => (
      <span
        className="font-mono text-xs text-muted-foreground"
        title={row.original.id}
      >
        {row.original.id.slice(0, 8)}
      </span>
    ),
  },
  {
    accessorKey: "name",
    header: "Subject",
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  },
  {
    accessorKey: "code",
    header: "Code",
    cell: ({ row }) => (
      <Badge variant="outline">{row.original.code || "N/A"}</Badge>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }) => {
      const date = row.original.created_at;

      if (!date) {
        return <span className="text-muted-foreground">N/A</span>;
      }

      return (
        <span className="text-muted-foreground">
          {new Date(date).toLocaleDateString()}
        </span>
      );
    },
  },
  ...(canManage
    ? [
        {
          id: "actions",
          header: () => <span className="sr-only">Actions</span>,
          cell: ({ row }) => (
            <div
              className="flex justify-end"
              onClick={(event) => event.stopPropagation()}
            >
              <SubjectActionsMenu subject={row.original} />
            </div>
          ),
        } satisfies ColumnDef<SubjectPublic>,
      ]
    : []),
];
