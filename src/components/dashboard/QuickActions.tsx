
import { Users, BookOpen, FileText, Settings, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    { title: "Add Student", icon: Users, desc: "Enroll new batch", color: "text-blue-600", bg: "bg-blue-500/10", hover: "hover:bg-blue-50", onClick: () => navigate('/students/add-students') },
    { title: "Create Class", icon: BookOpen, desc: "Setup curriculum", color: "text-indigo-600", bg: "bg-indigo-500/10", hover: "hover:bg-indigo-50", onClick: () => navigate('/classes') },
    { title: "Add Results", icon: FileText, desc: "Record new marks", color: "text-emerald-600", bg: "bg-emerald-500/10", hover: "hover:bg-emerald-50", onClick: () => navigate('/results/add-results') },
    { title: "Settings", icon: Settings, desc: "System config", color: "text-slate-600", bg: "bg-slate-500/10", hover: "hover:bg-slate-50", onClick: () => navigate('/settings') },
  ];

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-card p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 dark:border-border flex-1">
      <div className="mb-5 flex items-center justify-between border-b border-slate-100 dark:border-border pb-3">
        <h3 className="text-lg font-bold text-slate-900 dark:text-card-foreground">Quick Actions</h3>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-2">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className={`group/btn relative flex flex-col items-start gap-3 rounded-xl border border-slate-100 dark:border-border bg-white dark:bg-background/50 p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-200 dark:hover:border-border hover:bg-slate-50 dark:hover:bg-accent`}
          >
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${action.bg} ${action.color} transition-transform group-hover/btn:scale-110`}>
              <action.icon className="h-5 w-5" />
            </div>
            <div>
              <span className="block font-semibold text-slate-800 dark:text-card-foreground text-sm leading-tight">{action.title}</span>
              <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-muted-foreground">{action.desc}</span>
            </div>
            <ArrowUpRight className="absolute right-3 top-3 h-4 w-4 text-slate-300 dark:text-muted-foreground opacity-0 transition-opacity group-hover/btn:opacity-100" />
          </button>
        ))}
      </div>
    </div>
  );
}
