import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Attachment, Task, User } from "@/entities";
import { uploadFile } from "@/integrations/core";
import { Button } from "@/components/ui/button";
import { Paperclip, Upload, Download, Trash2, File } from "lucide-react";
import { toast } from "sonner";

interface TaskAttachmentsProps {
    taskId: string;
}

export default function TaskAttachments({ taskId }: TaskAttachmentsProps) {
    const [uploading, setUploading] = useState(false);
    const queryClient = useQueryClient();

    const { data: attachments = [], isLoading } = useQuery({
        queryKey: ["attachments", taskId],
        queryFn: async () => {
            try {
                const user = await User.me();
                if (!user?.email) {
                    console.error("❌ SECURITY: No authenticated user");
                    return [];
                }

                console.log("✅ SECURITY: Verifying task ownership for attachments, user:", user.email);
                
                const taskResult = await Task.filter({ 
                    id: taskId,
                    created_by: user.email 
                });
                
                if (!taskResult || taskResult.length === 0) {
                    console.error("❌ SECURITY: Task not found or access denied");
                    return [];
                }

                console.log("✅ SECURITY: Task ownership verified, fetching attachments");
                // CRITICAL: Also filter attachments by created_by for defense in depth
                const result = await Attachment.filter({ 
                    taskId,
                    created_by: user.email 
                }, "-created_at");
                console.log(`✅ SECURITY: Found ${result?.length || 0} attachments for user ${user.email}`);
                return result || [];
            } catch (error) {
                console.error("❌ SECURITY: Error fetching attachments:", error);
                return [];
            }
        },
    });

    const deleteAttachmentMutation = useMutation({
        mutationFn: async (attachmentId: string) => {
            // CRITICAL: Verify attachment ownership before delete
            const user = await User.me();
            if (!user?.email) {
                throw new Error("Not authenticated");
            }

            const existingAttachment = await Attachment.filter({ 
                id: attachmentId, 
                created_by: user.email 
            });

            if (!existingAttachment || existingAttachment.length === 0) {
                throw new Error("Attachment not found or access denied");
            }

            await Attachment.delete(attachmentId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["attachments", taskId] });
            toast.success("Attachment deleted");
        },
        onError: (error: any) => {
            console.error("Error deleting attachment:", error);
            toast.error(error.message || "Failed to delete attachment");
        },
    });

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            const { file_url } = await uploadFile({ file });

            await Attachment.create({
                taskId,
                fileName: file.name,
                fileUrl: file_url,
                fileSize: file.size,
                fileType: file.type,
            });

            queryClient.invalidateQueries({ queryKey: ["attachments", taskId] });
            toast.success("File uploaded successfully");
        } catch (error) {
            console.error("Error uploading file:", error);
            toast.error("Failed to upload file");
        } finally {
            setUploading(false);
            e.target.value = "";
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Paperclip className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-semibold">
                        Attachments ({attachments.length})
                    </h3>
                </div>
                <label>
                    <input
                        type="file"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={uploading}
                    />
                    <Button
                        size="sm"
                        className="bg-banana-500 hover:bg-banana-600 text-black"
                        disabled={uploading}
                        asChild
                    >
                        <span>
                            <Upload className="h-4 w-4 mr-2" />
                            {uploading ? "Uploading..." : "Upload File"}
                        </span>
                    </Button>
                </label>
            </div>

            {attachments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                    No attachments yet. Upload files to share with your team.
                </p>
            ) : (
                <div className="space-y-2">
                    {attachments.map((attachment: any) => (
                        <div
                            key={attachment.id}
                            className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                            <div className="p-2 rounded bg-banana-500/10">
                                <File className="h-5 w-5 text-banana-600" />
                            </div>
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
                                    className="h-8 w-8"
                                    asChild
                                >
                                    <a
                                        href={attachment.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        download
                                    >
                                        <Download className="h-4 w-4" />
                                    </a>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive"
                                    onClick={() => {
                                        if (confirm("Delete this attachment?")) {
                                            deleteAttachmentMutation.mutate(attachment.id);
                                        }
                                    }}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}