import { useState } from "react";
import { User, Task, Comment, Attachment, Subtask, List, Tag, FilterPreset } from "@/entities";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { Database, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";

export default function DatabaseCleanupSection() {
    const queryClient = useQueryClient();
    const [isCleaningDatabase, setIsCleaningDatabase] = useState(false);
    const [cleanupResults, setCleanupResults] = useState<any>(null);

    const handleDatabaseCleanup = async () => {
        setIsCleaningDatabase(true);
        const results = {
            tasks: 0,
            comments: 0,
            attachments: 0,
            subtasks: 0,
            lists: 0,
            tags: 0,
            filterPresets: 0,
            users: 0,
        };

        try {
            console.log("🔧 ADMIN CLEANUP: Starting system-wide database cleanup");

            // Get all users
            const allUsers = await User.list();
            console.log(`Found ${allUsers.length} users to process`);

            // Fix Tasks with NULL userId
            const tasksWithoutUserId = await Task.list();
            for (const task of tasksWithoutUserId) {
                if (!task.userId && task.created_by) {
                    const owner = allUsers.find((u: any) => u.email === task.created_by);
                    if (owner) {
                        await Task.update(task.id, { userId: owner.id });
                        results.tasks++;
                    }
                }
            }

            // Fix Comments with NULL userId
            const commentsWithoutUserId = await Comment.list();
            for (const comment of commentsWithoutUserId) {
                if (!comment.userId && comment.created_by) {
                    const owner = allUsers.find((u: any) => u.email === comment.created_by);
                    if (owner) {
                        await Comment.update(comment.id, { userId: owner.id });
                        results.comments++;
                    }
                }
            }

            // Fix Attachments with NULL userId
            const attachmentsWithoutUserId = await Attachment.list();
            for (const attachment of attachmentsWithoutUserId) {
                if (!attachment.userId && attachment.created_by) {
                    const owner = allUsers.find((u: any) => u.email === attachment.created_by);
                    if (owner) {
                        await Attachment.update(attachment.id, { userId: owner.id });
                        results.attachments++;
                    }
                }
            }

            // Fix Subtasks with NULL userId
            const subtasksWithoutUserId = await Subtask.list();
            for (const subtask of subtasksWithoutUserId) {
                if (!subtask.userId && subtask.created_by) {
                    const owner = allUsers.find((u: any) => u.email === subtask.created_by);
                    if (owner) {
                        await Subtask.update(subtask.id, { userId: owner.id });
                        results.subtasks++;
                    }
                }
            }

            // Fix Lists with NULL userId
            const listsWithoutUserId = await List.list();
            for (const list of listsWithoutUserId) {
                if (!list.userId && list.created_by) {
                    const owner = allUsers.find((u: any) => u.email === list.created_by);
                    if (owner) {
                        await List.update(list.id, { userId: owner.id });
                        results.lists++;
                    }
                }
            }

            // Fix Tags with NULL userId (only for private tags)
            const tagsWithoutUserId = await Tag.list();
            for (const tag of tagsWithoutUserId) {
                if (!tag.userId && tag.created_by && tag.visibility !== "global") {
                    const owner = allUsers.find((u: any) => u.email === tag.created_by);
                    if (owner) {
                        await Tag.update(tag.id, { userId: owner.id });
                        results.tags++;
                    }
                }
            }

            // Fix FilterPresets with NULL userId
            const presetsWithoutUserId = await FilterPreset.list();
            for (const preset of presetsWithoutUserId) {
                if (!preset.userId && preset.created_by) {
                    const owner = allUsers.find((u: any) => u.email === preset.created_by);
                    if (owner) {
                        await FilterPreset.update(preset.id, { userId: owner.id });
                        results.filterPresets++;
                    }
                }
            }

            // Fix User roles if NULL
            for (const user of allUsers) {
                if (!user.role) {
                    await User.updateProfile({ role: "user" });
                    results.users++;
                }
            }

            console.log("✅ ADMIN CLEANUP: Database cleanup completed", results);
            setCleanupResults(results);

            const totalFixed = Object.values(results).reduce((sum: number, val: number) => sum + val, 0);
            if (totalFixed > 0) {
                toast.success(`System-wide cleanup complete! Fixed ${totalFixed} records.`);
                queryClient.invalidateQueries();
            } else {
                toast.info("No records needed fixing. Database is clean!");
            }
        } catch (error) {
            console.error("❌ ADMIN CLEANUP: Error during database cleanup:", error);
            toast.error("Database cleanup failed. Please try again.");
        } finally {
            setIsCleaningDatabase(false);
        }
    };

    return (
        <Card className="border-banana-500/20">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-banana-500" />
                    <CardTitle>System-Wide Database Cleanup</CardTitle>
                </div>
                <CardDescription>
                    Fix missing user data across the entire system for all users
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Admin Tool</AlertTitle>
                    <AlertDescription>
                        This tool scans ALL user data (tasks, lists, comments, attachments, etc.) across the entire system
                        and fixes any records that are missing proper user ownership information. This ensures maximum 
                        security and data isolation for all users.
                    </AlertDescription>
                </Alert>

                <Button
                    onClick={handleDatabaseCleanup}
                    disabled={isCleaningDatabase}
                    className="w-full bg-banana-500 hover:bg-banana-600 text-black"
                >
                    {isCleaningDatabase ? (
                        <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Cleaning Database...
                        </>
                    ) : (
                        <>
                            <Database className="h-4 w-4 mr-2" />
                            Run System-Wide Cleanup
                        </>
                    )}
                </Button>

                {cleanupResults && (
                    <div className="mt-4 p-4 bg-muted rounded-lg space-y-2">
                        <div className="flex items-center gap-2 mb-3">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <span className="font-semibold">Cleanup Results</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>Tasks fixed: <strong>{cleanupResults.tasks}</strong></div>
                            <div>Comments fixed: <strong>{cleanupResults.comments}</strong></div>
                            <div>Attachments fixed: <strong>{cleanupResults.attachments}</strong></div>
                            <div>Subtasks fixed: <strong>{cleanupResults.subtasks}</strong></div>
                            <div>Lists fixed: <strong>{cleanupResults.lists}</strong></div>
                            <div>Tags fixed: <strong>{cleanupResults.tags}</strong></div>
                            <div>Filter presets fixed: <strong>{cleanupResults.filterPresets}</strong></div>
                            <div>User profiles fixed: <strong>{cleanupResults.users}</strong></div>
                        </div>
                        <div className="mt-3 pt-3 border-t">
                            <div className="font-bold">
                                Total records fixed: {Object.values(cleanupResults).reduce((sum: number, val: number) => sum + val, 0)}
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}