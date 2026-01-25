import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface PlatformEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  color: string;
  event_type: string;
  priority: number;
}

const fetchUpcomingEvents = async (): Promise<PlatformEvent[]> => {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('platform_events')
    .select('*')
    .gte('event_date', today)
    .eq('is_active', true)
    .order('event_date', { ascending: true })
    .order('priority', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error fetching events:', error);
    return [];
  }

  return data || [];
};

export const UpcomingEvents = () => {
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['platform-events'],
    queryFn: fetchUpcomingEvents,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-muted-foreground" />
          <span>Upcoming Events</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No upcoming events</p>
          </div>
        ) : (
          events.map((event) => (
            <div key={event.id} className="flex items-center gap-3">
              <div className="flex flex-col items-center justify-center w-12 h-12 rounded-md bg-muted text-muted-foreground">
                <span className="text-xs font-bold">
                  {new Date(event.event_date).toLocaleString('en-US', { month: 'short' })}
                </span>
                <span className="text-lg font-bold">
                  {new Date(event.event_date).getDate()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{event.title}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(event.event_date).toLocaleDateString('en-US', { weekday: 'long' })}
                  {event.event_time && ` • ${event.event_time.slice(0, 5)}`}
                </p>
              </div>
              <div className={`w-2 h-2 rounded-full ${event.color || 'bg-blue-500'}`} />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
