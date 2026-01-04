import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Attachment, User } from "@/entities";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, Download, Trash2, FileIcon } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { uploadFile } from "@/integrations/core";

interface TaskAttachmentsProps {
  taskId?: string;
  noteId?: string;
}

export default function TaskAttachments({ taskId, noteId }: TaskAttachmentsProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const targetId = taskId || noteId;
  const targetType = taskId ? "task" : "note";

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const user = await User.me();
      return user;
    },
  });

  const { data: attachments = [], isLoading } = useQuery({
    queryKey: ["attachments", targetId],
    queryFn: async () => {
      try {
        if (!targetId) return [];
        console.log(`✅ SECURITY: Fetching attachments for ${targetType}:`, targetId);
        const filter = taskId ? { taskId } : { noteId };
        const result = await Attachment.filter(filter, "-created_at");
        console.log(`✅ SECURITY: Found ${result?.length || 0} attachments`);
        return result || [];
      } catch (error) {
        console.error("❌ SECURITY: Error fetching attachments:", error);
        return [];
      }
    },
    enabled: !!targetId,
  });

  const deleteAttachmentMutation = useMutation({
    mutationFn: async (id: string) => {
      return await Attachment.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attachments", targetId] });
      toast.success("Attachment deleted");
    },
    onError: () => {
      toast.error("Failed to delete attachment");
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) {
      if (!user?.id) {
        toast.error("You must be logged in to upload files");
      }
      return;
    }

    setIsUploading(true);
    try {
      console.log("✅ SECURITY: Uploading file for userId:", user.id);
      const { file_url } = await uploadFile({ file });

      console.log("✅ SECURITY: Creating attachment record with userId:", user.id);
      await Attachment.create({
        taskId,
        noteId,
        userId: user.id,
        fileName: file.name,
        fileUrl: file_url,
        fileSize: file.size,
        fileType: file.type,
      });

      queryClient.invalidateQueries({ queryKey: ["attachments", targetId] });
      toast.success("File uploaded successfully");
    } catch (error) {
      console.error("❌ SECURITY: Error uploading file:", error);
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-banana-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold">Attachments</h3>
        <Button
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="bg-banana-500 hover:bg-banana-600 text-black"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Upload className="h-4 w-4 mr-2" />
          )}
          Upload File
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      <div className="space-y-2">
        {attachments.length === 0 ? (
          <p className="text-center text-muted-foreground py-8 text-sm">
            No attachments yet. Upload files to get started!
          </p>
        ) : (
          attachments.map((attachment: any) => (
            <div
              key={attachment.id}
              className="flex items-center gap-3 p-3 rounded-md border bg-card hover:bg-muted/50"
            >
              <FileIcon className="h-8 w-8 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {attachment.fileName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(attachment.fileSize)}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => window.open(attachment.fileUrl, "_blank")}
                  className="h-8 w-8"
                  disabled={deleteAttachmentMutation.isPending}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteAttachmentMutation.mutate(attachment.id)}
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  disabled={deleteAttachmentMutation.isPending}
                >
                  {deleteAttachmentMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}