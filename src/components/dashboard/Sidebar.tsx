import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { List } from "@/entities";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Inbox, Trash2, BarChart3 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface SidebarProps {
  selectedListId: string | null;
  onSelectList: (listId: string | null) => void;
}

export default function Sidebar({ selectedListId, onSelectList }: SidebarProps) {
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListName, setNewListName] = useState("");
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: lists = [] } = useQuery({
    queryKey: ["lists"],
    queryFn: async () => {
      const result = await List.filter({ archived: false }, "-created_at");
      return result || [];
    },
  });

  const createListMutation = useMutation({
    mutationFn: async (name: string) => {
      const colors = ["#FFD93D", "#8B5CF6", "#06B6D4", "#F59E0B", "#EF4444", "#10B981"];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      
      return await List.create({
        name,
        description: "",
        color: randomColor,
        archived: false,
        order: lists.length,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lists"] });
      setNewListName("");
      setIsAddingList(false);
    },
  });

  const deleteListMutation = useMutation({
    mutationFn: async (listId: string) => {
      await List.delete(listId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lists"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      if (selectedListId === lists.find(l => l.id === selectedListId)?.id) {
        onSelectList(null);
      }
    },
  });

  const handleCreateList = () => {
    if (newListName.trim()) {
      createListMutation.mutate(newListName);
    }
  };

  return (
    <div className="w-64 border-r bg-muted/30 flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-lg mb-4">Lists</h2>
        
        {/* All Tasks */}
        <Button
          variant={selectedListId === null ? "secondary" : "ghost"}
          className="w-full justify-start mb-2"
          onClick={() => onSelectList(null)}
        >
          <Inbox className="h-4 w-4 mr-2" />
          All Tasks
        </Button>

        {/* Analytics */}
        <Button
          variant="ghost"
          className="w-full justify-start mb-2"
          onClick={() => navigate("/analytics")}
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Analytics
        </Button>

        {isAddingList ? (
          <div className="flex gap-2 mt-2">
            <Input
              placeholder="List name"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateList();
                if (e.key === "Escape") {
                  setIsAddingList(false);
                  setNewListName("");
                }
              }}
              autoFocus
              className="h-8"
            />
            <Button size="sm" onClick={handleCreateList} disabled={!newListName.trim()}>
              Add
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => setIsAddingList(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            New List
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {lists.map((list) => (
            <div
              key={list.id}
              className={`group flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent cursor-pointer ${
                selectedListId === list.id ? "bg-accent" : ""
              }`}
            >
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: list.color }}
              />
              <span
                className="flex-1 text-sm truncate"
                onClick={() => onSelectList(list.id)}
              >
                {list.name}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Delete list "${list.name}"?`)) {
                    deleteListMutation.mutate(list.id);
                  }
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}