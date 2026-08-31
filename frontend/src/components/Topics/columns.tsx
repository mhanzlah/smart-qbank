import type { ColumnDef } from "@tanstack/react-table";

import type { TopicPublic } from "@/client";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TopicActionsMenu } from "./TopicActionsMenu";

export type TopicTableData = TopicPublic;

export const columns: ColumnDef<TopicTableData>[] = [
  {
    accessorKey: "name",
    header: "Topic",
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  },

  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const description = row.original.description;

      return (
        <span
          className={cn(
            "block max-w-md truncate text-muted-foreground",
            !description && "italic",
          )}
          title={description ?? undefined}
        >
          {description || "No description"}
        </span>
      );
    },
  },

  {
    accessorKey: "cognitive_levels",
    header: "Cognitive Levels",
    cell: ({ row }) => {
      const levels = row.original.cognitive_levels ?? [];

      return (
        <div className="flex max-w-sm flex-wrap gap-1">
          {levels.length > 0 ? (
            levels.map((level) => (
              <Badge key={level} variant="secondary">
                {level}
              </Badge>
            ))
          ) : (
            <span className="text-sm text-muted-foreground">None</span>
          )}
        </div>
      );
    },
  },

  {
    accessorKey: "mcq_focus",
    header: "MCQ Focus",
    cell: ({ row }) => (
      <span
        className="block max-w-md truncate text-muted-foreground"
        title={row.original.mcq_focus}
      >
        {row.original.mcq_focus}
      </span>
    ),
  },

  {
    accessorKey: "key_areas",
    header: "Key Areas",
    cell: ({ row }) => {
      const areas = row.original.key_areas ?? [];

      return (
        <div className="flex max-w-sm flex-wrap gap-1">
          {areas.length > 0 ? (
            areas.slice(0, 3).map((area) => (
              <Badge key={area} variant="outline">
                {area}
              </Badge>
            ))
          ) : (
            <span className="text-sm text-muted-foreground">None</span>
          )}

          {areas.length > 3 && (
            <Badge variant="outline">+{areas.length - 3}</Badge>
          )}
        </div>
      );
    },
  },

  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <TopicActionsMenu topic={row.original} />
      </div>
    ),
  },
];
