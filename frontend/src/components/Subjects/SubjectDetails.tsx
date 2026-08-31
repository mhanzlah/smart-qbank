import type { SubjectPublic } from "@/client";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SubjectDetailsProps {
  subject: SubjectPublic | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SubjectDetails({
  subject,
  open,
  onOpenChange,
}: SubjectDetailsProps) {
  if (!subject) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Subject Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">ID</p>
            <p className="break-all font-mono text-xs">{subject.id}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Subject</p>
            <p className="font-medium">{subject.name}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Code</p>
            <Badge variant="outline">{subject.code || "N/A"}</Badge>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">CLO</p>
            <p className="whitespace-pre-wrap text-sm">
              {subject.clo || "No CLO provided"}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Created</p>
            <p className="text-sm">
              {subject.created_at
                ? new Date(subject.created_at).toLocaleString()
                : "N/A"}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
