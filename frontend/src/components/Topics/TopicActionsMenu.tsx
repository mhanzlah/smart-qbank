import { EllipsisVertical } from "lucide-react";
import { useState } from "react";

import type { TopicPublic } from "@/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DeleteTopic from "./DeleteTopic";
import EditTopic from "./EditTopic";

interface TopicActionsMenuProps {
  topic: TopicPublic;
}

export const TopicActionsMenu = ({ topic }: TopicActionsMenuProps) => {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <EllipsisVertical />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <EditTopic topic={topic} onSuccess={() => setOpen(false)} />

        <DeleteTopic id={topic.id} onSuccess={() => setOpen(false)} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
