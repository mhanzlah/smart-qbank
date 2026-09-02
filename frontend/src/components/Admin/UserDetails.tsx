import type { UserPublic } from "@/client";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UserDetailsProps {
  user: UserPublic | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UserDetails({
  user,
  open,
  onOpenChange,
}: UserDetailsProps) {
  if (!user) {
    return null;
  }

  const role = user.is_superuser ? "Superuser" : user.role;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">ID</p>
            <p className="break-all font-mono text-xs">{user.id}</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Full Name</p>
              <p className="text-sm font-medium">{user.full_name || "N/A"}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="break-all text-sm">{user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Role</p>

              <Badge
                variant={
                  user.is_superuser
                    ? "default"
                    : user.role === "user"
                      ? "secondary"
                      : "outline"
                }
              >
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </Badge>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Status</p>

              <Badge variant="outline">
                {user.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
