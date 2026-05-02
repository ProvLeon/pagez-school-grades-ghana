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
    <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-card p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 dark:border-border">
      <div className="mb-5 flex items-center justify-between border-b border-slate-100 dark:border-border pb-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-rose-500 dark:text-rose-400" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-card-foreground">Upcoming Events</h3>
        </div>
      </div>
      
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-slate-300 dark:text-muted-foreground" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-8 flex flex-col items-center">
            <div className="rounded-full bg-slate-50 dark:bg-muted p-4 mb-3">
              <Calendar className="w-8 h-8 text-slate-300 dark:text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-muted-foreground">No upcoming events</p>
          </div>
        ) : (
          events.map((event) => (
            <div key={event.id} className="flex items-center gap-4 group/event rounded-xl p-2 transition-colors hover:bg-slate-50 dark:hover:bg-accent">
              <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 shadow-sm text-rose-700 dark:text-rose-400 shrink-0">
                <span className="text-[10px] font-black uppercase tracking-widest text-rose-500 dark:text-rose-400 leading-none mt-1">
                  {new Date(event.event_date).toLocaleString('en-US', { month: 'short' })}
                </span>
                <span className="text-lg font-bold leading-tight">
                  {new Date(event.event_date).getDate()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-card-foreground truncate transition-colors group-hover/event:text-rose-600 dark:group-hover/event:text-rose-400">{event.title}</p>
                <p className="text-xs font-medium text-slate-400 dark:text-muted-foreground mt-0.5 flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${event.color || 'bg-rose-500'}`} />
                  {new Date(event.event_date).toLocaleDateString('en-US', { weekday: 'long' })}
                  {event.event_time && ` • ${event.event_time.slice(0, 5)}`}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
