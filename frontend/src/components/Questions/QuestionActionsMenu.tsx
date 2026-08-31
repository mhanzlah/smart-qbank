import { EllipsisVertical } from "lucide-react";
import { useState } from "react";

import type { QuestionPublic } from "@/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DeleteQuestion from "./DeleteQuestion";
import EditQuestion from "./EditQuestion";

interface QuestionActionsMenuProps {
  question: QuestionPublic;
}

export const QuestionActionsMenu = ({ question }: QuestionActionsMenuProps) => {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <EllipsisVertical />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <EditQuestion question={question} onSuccess={() => setOpen(false)} />

        <DeleteQuestion id={question.id} onSuccess={() => setOpen(false)} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
