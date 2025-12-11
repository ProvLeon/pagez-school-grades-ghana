import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus } from "lucide-react";
import { useCreateMockExamSession } from "@/hooks/useMockExams";

interface Props {
  trigger?: React.ReactNode;
}

export function CreateMockSessionDialog({ trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [year, setYear] = useState("2024/2025");
  const [term, setTerm] = useState("Term 1");
  const [date, setDate] = useState<string>("");
  const [published, setPublished] = useState(false);

  const createSession = useCreateMockExamSession();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await createSession.mutateAsync({
      name: name.trim(),
      academic_year: year,
      term,
      exam_date: date || null,
      is_published: published,
      status: "draft",
    });

    setOpen(false);
    setName("");
    setPublished(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button type="button" className="gap-2">
            <Plus className="h-4 w-4" />
            Create Session
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Mock Exam Session</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., BECE Mocks - March" required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year">Academic Year</Label>
              <Input id="year" value={year} onChange={(e) => setYear(e.target.value)} placeholder="2024/2025" />
            </div>
            <div className="space-y-2">
              <Label>Term</Label>
              <Select value={term} onValueChange={setTerm}>
                <SelectTrigger>
                  <SelectValue placeholder="Select term" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Term 1">Term 1</SelectItem>
                  <SelectItem value="Term 2">Term 2</SelectItem>
                  <SelectItem value="Term 3">Term 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="date">Exam Date</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="space-y-1">
                <Label>Published</Label>
                <p className="text-xs text-muted-foreground">Make session visible to viewers</p>
              </div>
              <Switch checked={published} onCheckedChange={setPublished} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createSession.isPending}>
              {createSession.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
