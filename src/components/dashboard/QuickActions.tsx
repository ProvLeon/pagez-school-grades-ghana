
import { Users, BookOpen, FileText, Settings, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    { title: "Add Student", icon: Users, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10", onClick: () => navigate('/students/add-students') },
    { title: "Create Class", icon: BookOpen, color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-500/10", onClick: () => navigate('/classes') },
    { title: "Add Results", icon: FileText, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10", onClick: () => navigate('/results/add-results') },
    { title: "Settings", icon: Settings, color: "text-slate-600 dark:text-slate-400", bg: "bg-slate-50 dark:bg-slate-500/10", onClick: () => navigate('/settings') },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-card p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 dark:border-border">
      <div className="mb-4 flex items-center justify-between border-b border-slate-100 dark:border-border pb-3">
        <h3 className="text-sm font-bold text-slate-800 dark:text-card-foreground uppercase tracking-wider">Quick Actions</h3>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className="group/btn flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-100 dark:border-border bg-slate-50/50 dark:bg-background/50 px-3 py-4 text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-200 dark:hover:border-slate-600 hover:bg-white dark:hover:bg-accent"
          >
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${action.bg} ${action.color} transition-transform group-hover/btn:scale-110`}>
              <action.icon className="h-4 w-4" />
            </div>
            <span className="font-semibold text-slate-700 dark:text-card-foreground text-xs leading-tight">{action.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
