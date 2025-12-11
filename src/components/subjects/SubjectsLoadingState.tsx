
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export function SubjectsLoadingState() {
  return (
    <Card>
      <CardContent className="py-20 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">Loading subjects...</p>
      </CardContent>
    </Card>
  );
}
