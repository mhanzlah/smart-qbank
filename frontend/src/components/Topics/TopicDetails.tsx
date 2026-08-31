import type { TopicPublic } from "@/client";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TopicDetailsProps {
  topic: TopicPublic | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TopicDetails({
  topic,
  open,
  onOpenChange,
}: TopicDetailsProps) {
  if (!topic) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Topic Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">ID</p>
            <p className="break-all font-mono text-xs">{topic.id}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Topic</p>
            <p className="font-medium">{topic.name}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Description</p>
            <p className="whitespace-pre-wrap text-sm">
              {topic.description || "No description provided"}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Cognitive Levels</p>

            {topic.cognitive_levels?.length ? (
              <div className="flex flex-wrap gap-2">
                {topic.cognitive_levels.map((level) => (
                  <Badge key={level} variant="secondary">
                    {level}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm">No cognitive levels provided</p>
            )}
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">MCQ Focus</p>
            <p className="whitespace-pre-wrap text-sm">
              {topic.mcq_focus || "No MCQ focus provided"}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Key Areas</p>

            {topic.key_areas?.length ? (
              <ul className="list-disc space-y-1 pl-5 text-sm">
                {topic.key_areas.map((area) => (
                  <li key={area}>{area}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm">No key areas provided</p>
            )}
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Subject ID</p>
            <p className="break-all font-mono text-xs">{topic.subject_id}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Created</p>
            <p className="text-sm">
              {topic.created_at
                ? new Date(topic.created_at).toLocaleString()
                : "N/A"}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
