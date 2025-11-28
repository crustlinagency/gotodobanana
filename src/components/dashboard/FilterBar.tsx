import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, SortAsc, LayoutGrid, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import AdvancedFilters from "./AdvancedFilters";
import FilterPresetManager from "./FilterPresetManager";
import QuickFilters from "./QuickFilters";

interface FilterBarProps {
  onFilterChange: (filters: any) => void;
  onGroupByChange?: (groupBy: "none" | "list" | "priority" | "dueDate" | "status") => void;
  activeFilters: any;
  tags: string[];
  lists: any[];
}

export default function FilterBar({ 
  onFilterChange, 
  onGroupByChange, 
  activeFilters,
  tags,
  lists 
}: FilterBarProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleQuickFilter = (filter: any) => {
    onFilterChange(filter);
  };

  const handleClearFilters = () => {
    onFilterChange({
      priority: "all",
      status: "all",
      dateRange: undefined,
      tags: undefined,
      lists: undefined,
      sortBy: "-created_at",
    });
  };

  const handleLoadPreset = (filters: any) => {
    onFilterChange(filters);
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Quick Filters */}
      <QuickFilters
        onFilterApply={handleQuickFilter}
        activeFilters={activeFilters}
        onClearFilters={handleClearFilters}
      />

      {/* Main Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Filter className="h-4 w-4" />
          <span>Filters:</span>
        </div>

        <Select 
          value={activeFilters.priority || "all"}
          onValueChange={(value) => onFilterChange({ priority: value })}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="High">High</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
          </SelectContent>
        </Select>

        <Select 
          value={activeFilters.status || "all"}
          onValueChange={(value) => onFilterChange({ status: value })}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        {onGroupByChange && (
          <>
            <div className="h-6 w-px bg-border mx-2" />
            
            <div className="flex items-center gap-2 text-sm font-medium">
              <LayoutGrid className="h-4 w-4" />
              <span>Group by:</span>
            </div>

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
          </>
        )}

        <div className="flex items-center gap-2 ml-auto">
          <SortAsc className="h-4 w-4" />
          <Select 
            value={activeFilters.sortBy || "-created_at"}
            onValueChange={(value) => onFilterChange({ sortBy: value })}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="-created_at">Newest First</SelectItem>
              <SelectItem value="created_at">Oldest First</SelectItem>
              <SelectItem value="dueDate">Due Date</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {showAdvanced ? <ChevronUp className="h-4 w-4 mr-2" /> : <ChevronDown className="h-4 w-4 mr-2" />}
          Advanced
        </Button>

        <FilterPresetManager
          currentFilters={activeFilters}
          onLoadPreset={handleLoadPreset}
        />
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <AdvancedFilters
          tags={tags}
          lists={lists}
          onFilterChange={onFilterChange}
          activeFilters={activeFilters}
        />
      )}
    </div>
  );
}