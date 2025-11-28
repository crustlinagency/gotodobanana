import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, CheckCircle, X } from "lucide-react";
import { useLists } from "@/hooks/use-lists";

interface BulkActionsToolbarProps {
  selectedCount: number;
  onDeleteSelected: () => void;
  onMoveToList: (listId: string) => void;
  onMarkComplete: () => void;
  onClearSelection: () => void;
}

export default function BulkActionsToolbar({
  selectedCount,
  onDeleteSelected,
  onMoveToList,
  onMarkComplete,
  onClearSelection,
}: BulkActionsToolbarProps) {
  const { data: lists = [] } = useLists();
  
  const validLists = lists.filter((list: any) => list.id && list.id !== "");

  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
      <Card className="shadow-2xl border-2 border-banana-500">
        <div className="flex items-center gap-4 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="bg-banana-500 text-banana-900 px-3 py-1 rounded-full font-semibold text-sm">
              {selectedCount} selected
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClearSelection}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="h-8 w-px bg-border" />

          <Button
            variant="outline"
            size="sm"
            onClick={onMarkComplete}
            className="gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Mark Complete
          </Button>

          {validLists.length > 0 && (
            <Select onValueChange={onMoveToList}>
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue placeholder="Move to list..." />
              </SelectTrigger>
              <SelectContent>
                {validLists.map((list: any) => (
                  <SelectItem key={list.id} value={list.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: list.color }}
                      />
                      {list.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Button
            variant="destructive"
            size="sm"
            onClick={onDeleteSelected}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </Card>
    </div>
  );
}