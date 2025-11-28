import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  CalendarDays, 
  AlertCircle, 
  CheckCircle2, 
  X,
  Star
} from "lucide-react";

interface QuickFiltersProps {
  onFilterApply: (filter: any) => void;
  activeFilters: any;
  onClearFilters: () => void;
}

export default function QuickFilters({ 
  onFilterApply, 
  activeFilters,
  onClearFilters 
}: QuickFiltersProps) {
  const quickFilters = [
    {
      id: "today",
      label: "Today",
      icon: Clock,
      filter: { dateRange: "today" },
    },
    {
      id: "week",
      label: "This Week",
      icon: CalendarDays,
      filter: { dateRange: "week" },
    },
    {
      id: "overdue",
      label: "Overdue",
      icon: AlertCircle,
      filter: { dateRange: "overdue" },
    },
    {
      id: "high-priority",
      label: "High Priority",
      icon: Star,
      filter: { priority: "High" },
    },
    {
      id: "completed",
      label: "Completed",
      icon: CheckCircle2,
      filter: { status: "completed" },
    },
  ];

  const hasActiveFilters = Object.keys(activeFilters).some(
    key => activeFilters[key] && activeFilters[key] !== "all"
  );

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <span className="text-sm font-medium text-muted-foreground">
        Quick Filters:
      </span>
      
      {quickFilters.map((qf) => {
        const Icon = qf.icon;
        const isActive = 
          (qf.filter.dateRange && activeFilters.dateRange === qf.filter.dateRange) ||
          (qf.filter.priority && activeFilters.priority === qf.filter.priority) ||
          (qf.filter.status && activeFilters.status === qf.filter.status);
        
        return (
          <Button
            key={qf.id}
            variant={isActive ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterApply(qf.filter)}
            className={isActive ? "bg-banana-500 hover:bg-banana-600 text-black" : ""}
          >
            <Icon className="h-3 w-3 mr-1.5" />
            {qf.label}
          </Button>
        );
      })}

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-3 w-3 mr-1.5" />
          Clear All
        </Button>
      )}
    </div>
  );
}