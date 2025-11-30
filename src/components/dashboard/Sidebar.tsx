import { useLists } from "@/hooks/use-lists";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Inbox, Trash2, FolderOpen } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { List, User } from "@/entities";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

interface SidebarProps {
  selectedListId: string | null;
  onSelectList: (listId: string | null) => void;
  onSelectTrash: () => void;
  isTrashSelected: boolean;
}

export default function Sidebar({
  selectedListId,
  onSelectList,
  onSelectTrash,
  isTrashSelected,
}: SidebarProps) {
  const { data: lists = [] } = useLists();
  const [isNewListDialogOpen, setIsNewListDialogOpen] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListDescription, setNewListDescription] = useState("");
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const user = await User.me();
      return user;
    },
  });

  const { data: deletedTasksCount = 0 } = useQuery({
    queryKey: ["deletedTasksCount"],
    queryFn: async () => {
      try {
        if (!user?.id) return 0;
        
        const { Task } = await import("@/entities");
        const result = await Task.filter({ 
          deleted: true,
          userId: user.id // CRITICAL: Filter by userId
        });
        return result?.length || 0;
      } catch (error) {
        console.error("Error fetching deleted tasks count:", error);
        return 0;
      }
    },
    enabled: !!user,
  });

  const createListMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      console.log("✅ SECURITY: Creating list with userId:", user.id);
      return await List.create({
        userId: user.id, // CRITICAL: Use userId
        name: newListName,
        description: newListDescription,
        color: "#FFD93D",
        archived: false,
        order: lists.length,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lists"] });
      setNewListName("");
      setNewListDescription("");
      setIsNewListDialogOpen(false);
      toast.success("List created successfully");
    },
    onError: (error: any) => {
      console.error("❌ SECURITY: Error creating list:", error);
      toast.error("Failed to create list");
    },
  });

  const handleCreateList = (e: React.FormEvent) => {
    e.preventDefault();
    if (newListName.trim()) {
      createListMutation.mutate();
    }
  };

  return (
    <>
      <div className="flex flex-col h-full border-r bg-muted/30">
        <div className="p-4 border-b">
          <Button
            onClick={() => setIsNewListDialogOpen(true)}
            className="w-full bg-banana-500 hover:bg-banana-600 text-black"
          >
            <Plus className="h-4 w-4 mr-2" />
            New List
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            <Button
              variant={!selectedListId && !isTrashSelected ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => onSelectList(null)}
            >
              <Inbox className="h-4 w-4 mr-2" />
              All Tasks
            </Button>

            {lists.map((list: any) => (
              <Button
                key={list.id}
                variant={selectedListId === list.id ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => onSelectList(list.id)}
              >
                <FolderOpen className="h-4 w-4 mr-2" />
                <span className="truncate">{list.name}</span>
              </Button>
            ))}

            <Button
              variant={isTrashSelected ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={onSelectTrash}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Trash
              {deletedTasksCount > 0 && (
                <span className="ml-auto text-xs bg-muted px-2 py-0.5 rounded">
                  {deletedTasksCount}
                </span>
              )}
            </Button>
          </div>
        </ScrollArea>
      </div>

      <Dialog open={isNewListDialogOpen} onOpenChange={setIsNewListDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New List</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateList} className="space-y-4">
            <div>
              <Label htmlFor="listName">List Name *</Label>
              <Input
                id="listName"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="e.g., Work, Personal, Shopping"
                required
              />
            </div>
            <div>
              <Label htmlFor="listDescription">Description</Label>
              <Input
                id="listDescription"
                value={newListDescription}
                onChange={(e) => setNewListDescription(e.target.value)}
                placeholder="Optional description"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsNewListDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-banana-500 hover:bg-banana-600 text-black"
                disabled={!newListName.trim() || createListMutation.isPending}
              >
                Create List
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}