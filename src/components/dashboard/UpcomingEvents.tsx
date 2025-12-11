
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

const events = [
  { title: "Term Exams", date: "2025-11-15", color: "bg-red-500" },
  { title: "Parent-Teacher Conference", date: "2025-11-22", color: "bg-blue-500" },
  { title: "Staff Meeting", date: "2025-11-28", color: "bg-green-500" },
];

export const UpcomingEvents = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-muted-foreground" />
          <span>Upcoming Events</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {events.map((event, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="flex flex-col items-center justify-center w-12 h-12 rounded-md bg-muted text-muted-foreground">
              <span className="text-xs font-bold">{new Date(event.date).toLocaleString('en-US', { month: 'short' })}</span>
              <span className="text-lg font-bold">{new Date(event.date).getDate()}</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{event.title}</p>
              <p className="text-xs text-muted-foreground">{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long' })}</p>
            </div>
            <div className={`w-2 h-2 rounded-full ${event.color}`} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
