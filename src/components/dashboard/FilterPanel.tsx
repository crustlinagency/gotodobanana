import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import AdvancedFilters from "./AdvancedFilters";
import FilterPresetManager from "./FilterPresetManager";
import QuickFilters from "./QuickFilters";

interface FilterPanelProps {
  onFilterChange: (filters: any) => void;
  activeFilters: any;
  tags: string[];
  lists: any[];
}

export default function FilterPanel({ 
  onFilterChange, 
  activeFilters,
  tags,
  lists 
}: FilterPanelProps) {
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

  const activeFilterCount = Object.entries(activeFilters).filter(([key, value]) => {
    if (key === 'sortBy') return false;
    return value && value !== "all" && (Array.isArray(value) ? value.length > 0 : true);
  }).length;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filter Tasks</SheetTitle>
          <SheetDescription>
            Customize your task view with filters and presets
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div>
            <h3 className="text-sm font-semibold mb-3">Quick Filters</h3>
            <QuickFilters
              onFilterApply={handleQuickFilter}
              activeFilters={activeFilters}
              onClearFilters={handleClearFilters}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Priority</label>
            <Select 
              value={activeFilters.priority || "all"}
              onValueChange={(value) => onFilterChange({ priority: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Status</label>
            <Select 
              value={activeFilters.status || "all"}
              onValueChange={(value) => onFilterChange({ status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Sort By</label>
            <Select 
              value={activeFilters.sortBy || "-created_at"}
              onValueChange={(value) => onFilterChange({ sortBy: value })}
            >
              <SelectTrigger>
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

          <div>
            <h3 className="text-sm font-semibold mb-3">Advanced Filters</h3>
            <AdvancedFilters
              tags={tags}
              lists={lists}
              onFilterChange={onFilterChange}
              activeFilters={activeFilters}
            />
          </div>

          <div className="pt-4 border-t">
            <FilterPresetManager
              currentFilters={activeFilters}
              onLoadPreset={handleLoadPreset}
            />
          </div>

          {activeFilterCount > 0 && (
            <Button 
              variant="outline" 
              className="w-full gap-2"
              onClick={handleClearFilters}
            >
              <X className="h-4 w-4" />
              Clear All Filters
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}