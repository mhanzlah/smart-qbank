
import type { ColumnDef } from "@tanstack/react-table";
import type { QuestionPublic } from "@/client";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { QuestionActionsMenu } from "./QuestionActionsMenu";

export type QuestionTableData = QuestionPublic;

export const columns: ColumnDef<QuestionTableData>[] = [
  {
    accessorKey: "question",
    header: "Question",
    cell: ({ row }) => {
      const question = row.original.question;

      return (
        <span
          className="block max-w-xl truncate font-medium"
          title={question}
        >
          {question}
        </span>
      );
    },
  },

  {
    accessorKey: "difficulty",
    header: "Difficulty",
    cell: ({ row }) => {
      const difficulty = row.original.difficulty;

      return (
        <Badge
          variant={
            difficulty === "easy"
              ? "secondary"
              : difficulty === "medium"
                ? "outline"
                : "destructive"
          }
        >
          {difficulty.charAt(0).toUpperCase() +
            difficulty.slice(1)}
        </Badge>
      );
    },
  },

  {
    accessorKey: "correct_option",
    header: "Correct Answer",
    cell: ({ row }) => (
      <Badge variant="outline">
        {row.original.correct_option}
      </Badge>
    ),
  },

  {
    id: "actions",
    header: () => (
      <span className="sr-only">Actions</span>
    ),
    cell: ({ row }) => (
      <div className="flex justify-end">
        <QuestionActionsMenu
          question={row.original}
        />
      </div>
    ),
  },
];
