import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Note, User } from "@/entities";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Tag as TagIcon, MessageSquare, Info } from "lucide-react";
import { toast } from "sonner";
import RichTextEditor from "../RichTextEditor";
import TaskComments from "../TaskComments";

interface NoteFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note?: any;
  onSuccess?: () => void;
}

export default function NoteForm({ open, onOpenChange, note, onSuccess }: NoteFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [tagsInput, setTagsInput] = useState("");
  const [activeTab, setActiveTab] = useState("details");
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const user = await User.me();
      return user;
    },
  });

  useEffect(() => {
    if (note) {
      setTitle(note.title || "");
      setContent(note.content || "");
      setPriority(note.priority || "Medium");
      setTagsInput(note.tags ? note.tags.join(", ") : "");
    } else {
      setTitle("");
      setContent("");
      setPriority("Medium");
      setTagsInput("");
    }
    setActiveTab("details");
  }, [note, open]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("User not authenticated");

      const tags = tagsInput
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag !== "");

      const noteData = {
        userId: user.id,
        title,
        content,
        priority,
        tags,
        deleted: false,
        order: note?.order || 0,
      };

      if (note?.id) {
        return await Note.update(note.id, noteData);
      } else {
        return await Note.create(noteData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast.success(note ? "Note updated" : "Note created");
      onOpenChange(false);
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      console.error("Error saving note:", error);
      toast.error("Failed to save note");
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      saveMutation.mutate();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>{note ? "Edit Note" : "Create New Note"}</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <div className="px-6 border-b">
            <TabsList className="bg-transparent border-b-0 w-full justify-start h-12 p-0 gap-6">
              <TabsTrigger 
                value="details" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-banana-500 data-[state=active]:bg-transparent px-0 h-full"
              >
                <Info className="h-4 w-4 mr-2" />
                Details
              </TabsTrigger>
              {note && (
                <TabsTrigger 
                  value="comments" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-banana-500 data-[state=active]:bg-transparent px-0 h-full"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Comments
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          <div className="flex-1 overflow-auto p-6">
            <TabsContent value="details" className="mt-0 space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Note title..."
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger id="priority">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (comma separated)</Label>
                    <div className="relative">
                      <TagIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="tags"
                        className="pl-9"
                        value={tagsInput}
                        onChange={(e) => setTagsInput(e.target.value)}
                        placeholder="work, idea, personal"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Content</Label>
                  <RichTextEditor 
                    content={content} 
                    onChange={setContent} 
                    placeholder="Write your note content here..."
                  />
                </div>
              </div>
            </TabsContent>

            {note && (
              <TabsContent value="comments" className="mt-0">
                <TaskComments noteId={note.id} />
              </TabsContent>
            )}
          </div>
        </Tabs>

        <DialogFooter className="p-6 pt-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-banana-500 hover:bg-banana-600 text-black min-w-[100px]"
            disabled={!title.trim() || saveMutation.isPending}
          >
            {saveMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            {note ? "Update Note" : "Create Note"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
