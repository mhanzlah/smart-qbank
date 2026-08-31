import { EllipsisVertical } from "lucide-react";
import { useState } from "react";

import type { SubjectPublic } from "@/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useAuth from "@/hooks/useAuth";
import DeleteSubject from "./DeleteSubject";
import EditSubject from "./EditSubject";

interface SubjectActionsMenuProps {
  subject: SubjectPublic;
}

export const SubjectActionsMenu = ({ subject }: SubjectActionsMenuProps) => {
  const [open, setOpen] = useState(false);
  const { user: currentUser } = useAuth();

  if (!currentUser?.is_superuser || currentUser.role !== "editor") {
    return null;
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <EllipsisVertical />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <EditSubject subject={subject} onSuccess={() => setOpen(false)} />

        <DeleteSubject id={subject.id} onSuccess={() => setOpen(false)} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
