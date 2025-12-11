import { Badge } from "@/components/ui/badge";

export function SessionStatusBadge({ status }: { status: string }) {
  const variant =
    status === "open"
      ? "default"
      : status === "closed"
      ? "secondary"
      : "outline"; // draft

  const label = status.charAt(0).toUpperCase() + status.slice(1);

  return <Badge variant={variant as any}>{label}</Badge>;
}
