import type { ColumnDef } from "@tanstack/react-table";

import type { SubjectPublic } from "@/client";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SubjectActionsMenu } from "./SubjectActionsMenu";

export const columns: ColumnDef<SubjectPublic>[] = [
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
    accessorKey: "clo",
    header: "CLO",
    cell: ({ row }) => (
      <div
        className={cn(
          "max-w-md truncate",
          !row.original.clo && "text-muted-foreground",
        )}
        title={row.original.clo || undefined}
      >
        {row.original.clo || "No CLO provided"}
      </div>
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
      <div className="flex justify-end">
        <SubjectActionsMenu subject={row.original} />
      </div>
    ),
  },
];
