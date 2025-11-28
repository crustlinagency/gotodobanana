import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LayoutGrid } from "lucide-react";
import ViewSwitcher from "./ViewSwitcher";
import FilterPanel from "./FilterPanel";

interface TaskToolbarProps {
  currentView: "list" | "calendar" | "kanban";
  onViewChange: (view: "list" | "calendar" | "kanban") => void;
  onGroupByChange?: (groupBy: "none" | "list" | "priority" | "dueDate" | "status") => void;
  onFilterChange: (filters: any) => void;
  activeFilters: any;
  tags: string[];
  lists: any[];
}

export default function TaskToolbar({
  currentView,
  onViewChange,
  onGroupByChange,
  onFilterChange,
  activeFilters,
  tags,
  lists,
}: TaskToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-2">
        <FilterPanel
          onFilterChange={onFilterChange}
          activeFilters={activeFilters}
          tags={tags}
          lists={lists}
        />

        {onGroupByChange && currentView === "list" && (
          <>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4 text-muted-foreground" />
              <Select onValueChange={(value: any) => onGroupByChange(value)} defaultValue="none">
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Group by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="list">List</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="dueDate">Due Date</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </div>

      <ViewSwitcher
        currentView={currentView}
        onViewChange={onViewChange}
      />
    </div>
  );
}