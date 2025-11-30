import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { List, Task, User } from "@/entities";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Inbox, Trash2, BarChart3, Settings } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface SidebarProps {
  selectedListId: string | null;
  onSelectList: (listId: string | null) => void;
  onSelectTrash?: () => void;
  isTrashSelected?: boolean;
}

export default function Sidebar({ 
  selectedListId, 
  onSelectList, 
  onSelectTrash,
  isTrashSelected = false 
}: SidebarProps) {
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListName, setNewListName] = useState("");
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: lists = [], isLoading: listsLoading, error: listsError } = useQuery({
    queryKey: ["lists"],
    queryFn: async () => {
      try {
        const user = await User.me();
        if (!user?.id) {
          console.error("❌ SECURITY: No authenticated user found");
          return [];
        }

        console.log("✅ SECURITY: Fetching lists for userId:", user.id);
        const result = await List.filter({ 
          archived: false,
          userId: user.id // CRITICAL: Filter by userId
        }, "-created_at");
        
        console.log(`✅ SECURITY: Found ${result?.length || 0} lists for user ${user.id}`);
        return result || [];
      } catch (error) {
        console.error("❌ SECURITY: Error fetching lists:", error);
        throw error;
      }
    },
  });

  const { data: deletedCount = 0 } = useQuery({
    queryKey: ["deletedTasksCount"],
    queryFn: async () => {
      try {
        const user = await User.me();
        if (!user?.id) {
          console.error("❌ SECURITY: No authenticated user found");
          return 0;
        }

        const result = await Task.filter({ 
          deleted: true,
          userId: user.id // CRITICAL: Filter by userId
        });
        
        return result?.length || 0;
      } catch (error) {
        console.error("❌ SECURITY: Error fetching deleted tasks count:", error);
        return 0;
      }
    },
  });

  const createListMutation = useMutation({
    mutationFn: async (name: string) => {
      const user = await User.me();
      if (!user?.id) {
        throw new Error("Not authenticated");
      }

      const colors = ["#FFD93D", "#8B5CF6", "#06B6D4", "#F59E0B", "#EF4444", "#10B981"];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      
      console.log("✅ SECURITY: Creating list for userId:", user.id);
      
      const newList = await List.create({
        userId: user.id, // CRITICAL: Set owner
        name,
        description: "",
        color: randomColor,
        archived: false,
        order: lists.length,
      });
      
      console.log("✅ SECURITY: List created successfully:", newList.id);
      return newList;
    },
    onSuccess: (data) => {
      console.log("List creation succeeded, invalidating queries...");
      queryClient.invalidateQueries({ queryKey: ["lists"] });
      setNewListName("");
      setIsAddingList(false);
      toast({
        title: "Success",
        description: "List created successfully!",
      });
    },
    onError: (error) => {
      console.error("Error creating list:", error);
      toast({
        title: "Error",
        description: "Failed to create list. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteListMutation = useMutation({
    mutationFn: async (listId: string) => {
      // CRITICAL: Verify list ownership before delete
      const user = await User.me();
      if (!user?.id) {
        throw new Error("Not authenticated");
      }

      const existingList = await List.filter({ 
        id: listId, 
        userId: user.id // CRITICAL: Verify ownership
      });

      if (!existingList || existingList.length === 0) {
        throw new Error("List not found or access denied");
      }

      await List.delete(listId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lists"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      if (selectedListId === lists.find(l => l.id === selectedListId)?.id) {
        onSelectList(null);
      }
      toast({
        title: "Success",
        description: "List deleted successfully!",
      });
    },
    onError: (error: any) => {
      console.error("Error deleting list:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete list. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCreateList = () => {
    if (newListName.trim()) {
      console.log("Attempting to create list:", newListName);
      createListMutation.mutate(newListName);
    }
  };

  if (listsError) {
    console.error("Lists query error:", listsError);
  }

  return (
    <aside className="w-64 border-r bg-background p-4 flex flex-col h-full">
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Lists</h2>
        
        <div className="space-y-1">
          <Button
            variant={!selectedListId && !isTrashSelected ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => {
              onSelectList(null);
              if (onSelectTrash) onSelectTrash();
            }}
          >
            <Inbox className="mr-2 h-4 w-4" />
            All Tasks
          </Button>

          <Button
            variant={isTrashSelected ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => {
              if (onSelectTrash) {
                onSelectTrash();
              }
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Trash
            {deletedCount > 0 && (
              <Badge variant="destructive" className="ml-auto">
                {deletedCount}
              </Badge>
            )}
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => navigate("/analytics")}
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Analytics
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => navigate("/settings")}
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-1">
          {listsLoading ? (
            <div className="text-center py-4 text-sm text-muted-foreground">
              Loading lists...
            </div>
          ) : lists.length === 0 && !isAddingList ? (
            <div className="text-center py-4 text-sm text-muted-foreground">
              No lists yet. Create your first list!
            </div>
          ) : (
            lists.map((list) => (
              <div key={list.id} className="group relative">
                <Button
                  variant={selectedListId === list.id ? "secondary" : "ghost"}
                  className="w-full justify-start pr-8"
                  onClick={() => onSelectList(list.id)}
                >
                  <div
                    className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                    style={{ backgroundColor: list.color }}
                  />
                  <span className="truncate">{list.name}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Delete "${list.name}"?`)) {
                      deleteListMutation.mutate(list.id);
                    }
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      <div className="mt-4 pt-4 border-t">
        {isAddingList ? (
          <div className="space-y-2">
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
            />
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={handleCreateList}
                disabled={!newListName.trim()}
                className="flex-1"
              >
                Create
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setIsAddingList(false);
                  setNewListName("");
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setIsAddingList(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            New List
          </Button>
        )}
      </div>
    </aside>
  );
}