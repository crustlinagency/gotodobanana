import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, Tag, FolderKanban, X } from "lucide-react";
import { format } from "date-fns";

interface AdvancedFiltersProps {
  tags: string[];
  lists: any[];
  onFilterChange: (filters: any) => void;
  activeFilters: any;
}

export default function AdvancedFilters({ 
  tags, 
  lists, 
  onFilterChange,
  activeFilters 
}: AdvancedFiltersProps) {
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();

  const handleDateRangeApply = () => {
    if (dateFrom && dateTo) {
      onFilterChange({
        dateRange: "custom",
        dateFrom: dateFrom.toISOString(),
        dateTo: dateTo.toISOString(),
      });
    }
  };

  const uniqueTags = Array.from(new Set(tags.filter(Boolean)));
  const activeTagsArray = activeFilters.tags || [];
  const activeListsArray = activeFilters.lists || [];

  const toggleTag = (tag: string) => {
    const newTags = activeTagsArray.includes(tag)
      ? activeTagsArray.filter((t: string) => t !== tag)
      : [...activeTagsArray, tag];
    onFilterChange({ tags: newTags.length > 0 ? newTags : undefined });
  };

  const toggleList = (listId: string) => {
    const newLists = activeListsArray.includes(listId)
      ? activeListsArray.filter((l: string) => l !== listId)
      : [...activeListsArray, listId];
    onFilterChange({ lists: newLists.length > 0 ? newLists : undefined });
  };

  return (
    <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
      <div className="flex items-center gap-2 text-sm font-medium">
        <span>Advanced Filters</span>
      </div>

      {/* Date Range Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <CalendarIcon className="h-4 w-4" />
          Date Range
        </label>
        <div className="flex gap-2 items-center flex-wrap">
          <Select
            value={activeFilters.dateRange || "all"}
            onValueChange={(value) => {
              if (value === "all") {
                onFilterChange({ 
                  dateRange: undefined, 
                  dateFrom: undefined, 
                  dateTo: undefined 
                });
              } else {
                onFilterChange({ dateRange: value });
              }
            }}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Dates</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>

          {activeFilters.dateRange === "custom" && (
            <div className="flex gap-2 items-center">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    {dateFrom ? format(dateFrom, "MMM d") : "From"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <span className="text-muted-foreground">to</span>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    {dateTo ? format(dateTo, "MMM d") : "To"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Button
                size="sm"
                onClick={handleDateRangeApply}
                disabled={!dateFrom || !dateTo}
              >
                Apply
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Tags Filter */}
      {uniqueTags.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Tags
          </label>
          <div className="flex flex-wrap gap-2">
            {uniqueTags.map((tag) => (
              <Badge
                key={tag}
                variant={activeTagsArray.includes(tag) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleTag(tag)}
              >
                {tag}
                {activeTagsArray.includes(tag) && (
                  <X className="h-3 w-3 ml-1" />
                )}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Lists Filter */}
      {lists.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <FolderKanban className="h-4 w-4" />
            Lists
          </label>
          <div className="flex flex-wrap gap-2">
            {lists.map((list) => (
              <Badge
                key={list.id}
                variant={activeListsArray.includes(list.id) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleList(list.id)}
              >
                {list.name}
                {activeListsArray.includes(list.id) && (
                  <X className="h-3 w-3 ml-1" />
                )}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}