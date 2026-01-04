import { Button } from "@/components/ui/button";
import { Plus, Filter, Tag as TagIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";

interface NotesToolbarProps {
  onNewNote: () => void;
  onFilterChange: (filters: any) => void;
  activeFilters: any;
  tags: string[];
  noteCount: number;
}

export default function NotesToolbar({ 
  onNewNote, 
  onFilterChange, 
  activeFilters, 
  tags,
}: NotesToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
      <div className="flex items-center gap-2">
      </div>

      <div className="flex items-center gap-2">
        {/* Priority Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 gap-2">
              <Filter className="h-4 w-4" />
              Priority: {activeFilters.priority === "all" ? "All" : activeFilters.priority}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Filter by Priority</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onFilterChange({ priority: "all" })}>
              All Priorities
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFilterChange({ priority: "High" })}>
              High Priority
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFilterChange({ priority: "Medium" })}>
              Medium Priority
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFilterChange({ priority: "Low" })}>
              Low Priority
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Tags Filter */}
        {tags.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-2">
                <TagIcon className="h-4 w-4" />
                Tags
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Filter by Tags</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {tags.map((tag) => (
                <DropdownMenuCheckboxItem
                  key={tag}
                  checked={activeFilters.tags?.includes(tag)}
                  onCheckedChange={(checked) => {
                    const currentTags = activeFilters.tags || [];
                    const newTags = checked
                      ? [...currentTags, tag]
                      : currentTags.filter((t: string) => t !== tag);
                    onFilterChange({ tags: newTags });
                  }}
                >
                  {tag}
                </DropdownMenuCheckboxItem>
              ))}
              {activeFilters.tags && activeFilters.tags.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-destructive focus:text-destructive"
                    onClick={() => onFilterChange({ tags: [] })}
                  >
                    Clear tag filters
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <Button 
          onClick={onNewNote} 
          className="bg-banana-500 hover:bg-banana-600 text-black h-9"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Note
        </Button>
      </div>
    </div>
  );
}
