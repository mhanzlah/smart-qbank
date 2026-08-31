import type { ColumnDef } from "@tanstack/react-table";

import type { TopicPublic } from "@/client";
import { TopicActionsMenu } from "./TopicActionsMenu";

export const columns: ColumnDef<TopicPublic>[] = [
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
    header: "Topic",
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  },
  {
    accessorKey: "subject_id",
    header: "Subject ID",
    cell: ({ row }) => (
      <span
        className="font-mono text-xs text-muted-foreground"
        title={row.original.subject_id}
      >
        {row.original.subject_id.slice(0, 8)}
      </span>
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
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <div
        className="flex justify-end"
        onClick={(event) => event.stopPropagation()}
      >
        <TopicActionsMenu topic={row.original} />
      </div>
    ),
  },
];
