
import { Users, BookOpen, FileText, Settings, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    { title: "Add Student", icon: Users, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10", hoverBorder: "hover:border-blue-200 dark:hover:border-blue-500/30", onClick: () => navigate('/students/add-students') },
    { title: "New Class", icon: BookOpen, color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-500/10", hoverBorder: "hover:border-indigo-200 dark:hover:border-indigo-500/30", onClick: () => navigate('/classes') },
    { title: "Add Results", icon: FileText, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10", hoverBorder: "hover:border-emerald-200 dark:hover:border-emerald-500/30", onClick: () => navigate('/results/add-results') },
    { title: "Settings", icon: Settings, color: "text-slate-600 dark:text-slate-400", bg: "bg-slate-100/80 dark:bg-slate-500/10", hoverBorder: "hover:border-slate-300 dark:hover:border-slate-500/30", onClick: () => navigate('/settings') },
  ];

  return (
    <div data-tour="dashboard-quick-actions" className="rounded-2xl bg-white dark:bg-card p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 dark:border-border">
      <div className="mb-4 flex items-center gap-2 border-b border-slate-100 dark:border-border pb-3">
        <Zap className="h-5 w-5 text-amber-500 dark:text-amber-400" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-card-foreground">Quick Actions</h3>
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className={`group/btn flex flex-col items-center justify-center gap-1.5 rounded-xl border border-transparent bg-slate-50/60 dark:bg-background/50 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:bg-white dark:hover:bg-accent ${action.hoverBorder}`}
          >
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${action.bg} ${action.color} transition-transform duration-200 group-hover/btn:scale-110`}>
              <action.icon className="h-3.5 w-3.5 stroke-[2]" />
            </div>
            <span className="font-semibold text-slate-600 dark:text-slate-300 text-[10px] leading-tight tracking-tight">{action.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
