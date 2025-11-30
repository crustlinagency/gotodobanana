import { useState } from "react";
import { User, Task, Comment, Attachment, Subtask, List, Tag, FilterPreset } from "@/entities";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Database, RefreshCw, CheckCircle, AlertCircle, UserCog, Trash2 } from "lucide-react";

export default function DatabaseCleanupSection() {
    const queryClient = useQueryClient();
    const [isCleaningDatabase, setIsCleaningDatabase] = useState(false);
    const [cleanupResults, setCleanupResults] = useState<any>(null);
    const [adminEmail, setAdminEmail] = useState("realfranksvendsen@gmail.com");

    const { data: allUsers = [] } = useQuery({
        queryKey: ["allUsersForCleanup"],
        queryFn: async () => {
            const result = await User.list();
            return result || [];
        },
    });

    const handleComprehensiveCleanup = async () => {
        setIsCleaningDatabase(true);
        const results = {
            tasksFixed: 0,
            tasksDeleted: 0,
            commentsFixed: 0,
            attachmentsFixed: 0,
            subtasksFixed: 0,
            listsFixed: 0,
            tagsFixed: 0,
            filterPresetsFixed: 0,
            usersFixed: 0,
            rolesUpdated: 0,
        };

        try {
            console.log("🔧 COMPREHENSIVE CLEANUP: Starting database repair...");

            // Get admin user
            const adminUser = allUsers.find((u: any) => u.email === adminEmail);
            if (!adminUser) {
                toast.error(`Admin user ${adminEmail} not found!`);
                setIsCleaningDatabase(false);
                return;
            }

            console.log(`✅ Found admin user: ${adminUser.email} (${adminUser.id})`);

            // === STEP 1: Fix ALL tasks ===
            console.log("🔧 Step 1: Fixing tasks...");
            const allTasks = await Task.list();
            console.log(`Found ${allTasks.length} total tasks`);

            for (const task of allTasks) {
                const updates: any = {};
                let needsUpdate = false;

                // Fix NULL userId - assign to admin
                if (!task.userId) {
                    updates.userId = adminUser.id;
                    needsUpdate = true;
                    console.log(`Fixing task ${task.id} - assigning to admin`);
                }

                // Fix NULL status
                if (!task.status) {
                    updates.status = "todo";
                    needsUpdate = true;
                }

                // Fix NULL priority
                if (!task.priority) {
                    updates.priority = "Medium";
                    needsUpdate = true;
                }

                // Fix NULL completed
                if (task.completed === null || task.completed === undefined) {
                    updates.completed = false;
                    needsUpdate = true;
                }

                // Fix NULL deleted
                if (task.deleted === null || task.deleted === undefined) {
                    updates.deleted = false;
                    needsUpdate = true;
                }

                // Fix NULL isRecurring
                if (task.isRecurring === null || task.isRecurring === undefined) {
                    updates.isRecurring = false;
                    needsUpdate = true;
                }

                if (needsUpdate) {
                    await Task.update(task.id, updates);
                    results.tasksFixed++;
                }
            }

            // === STEP 2: Fix Comments ===
            console.log("🔧 Step 2: Fixing comments...");
            const allComments = await Comment.list();
            for (const comment of allComments) {
                if (!comment.userId) {
                    const owner = allUsers.find((u: any) => u.email === comment.created_by);
                    if (owner) {
                        await Comment.update(comment.id, { userId: owner.id });
                        results.commentsFixed++;
                    } else if (adminUser) {
                        await Comment.update(comment.id, { userId: adminUser.id });
                        results.commentsFixed++;
                    }
                }
            }

            // === STEP 3: Fix Attachments ===
            console.log("🔧 Step 3: Fixing attachments...");
            const allAttachments = await Attachment.list();
            for (const attachment of allAttachments) {
                if (!attachment.userId) {
                    const owner = allUsers.find((u: any) => u.email === attachment.created_by);
                    if (owner) {
                        await Attachment.update(attachment.id, { userId: owner.id });
                        results.attachmentsFixed++;
                    } else if (adminUser) {
                        await Attachment.update(attachment.id, { userId: adminUser.id });
                        results.attachmentsFixed++;
                    }
                }
            }

            // === STEP 4: Fix Subtasks ===
            console.log("🔧 Step 4: Fixing subtasks...");
            const allSubtasks = await Subtask.list();
            for (const subtask of allSubtasks) {
                const updates: any = {};
                let needsUpdate = false;

                if (!subtask.userId) {
                    const owner = allUsers.find((u: any) => u.email === subtask.created_by);
                    updates.userId = owner ? owner.id : adminUser.id;
                    needsUpdate = true;
                }

                if (subtask.completed === null || subtask.completed === undefined) {
                    updates.completed = false;
                    needsUpdate = true;
                }

                if (needsUpdate) {
                    await Subtask.update(subtask.id, updates);
                    results.subtasksFixed++;
                }
            }

            // === STEP 5: Fix Lists ===
            console.log("🔧 Step 5: Fixing lists...");
            const allLists = await List.list();
            for (const list of allLists) {
                const updates: any = {};
                let needsUpdate = false;

                if (!list.userId) {
                    const owner = allUsers.find((u: any) => u.email === list.created_by);
                    updates.userId = owner ? owner.id : adminUser.id;
                    needsUpdate = true;
                }

                if (list.archived === null || list.archived === undefined) {
                    updates.archived = false;
                    needsUpdate = true;
                }

                if (needsUpdate) {
                    await List.update(list.id, updates);
                    results.listsFixed++;
                }
            }

            // === STEP 6: Fix Tags ===
            console.log("🔧 Step 6: Fixing tags...");
            const allTags = await Tag.list();
            for (const tag of allTags) {
                if (!tag.userId && tag.visibility !== "global") {
                    const owner = allUsers.find((u: any) => u.email === tag.created_by);
                    if (owner) {
                        await Tag.update(tag.id, { userId: owner.id });
                        results.tagsFixed++;
                    } else if (adminUser) {
                        await Tag.update(tag.id, { userId: adminUser.id });
                        results.tagsFixed++;
                    }
                }
            }

            // === STEP 7: Fix FilterPresets ===
            console.log("🔧 Step 7: Fixing filter presets...");
            const allPresets = await FilterPreset.list();
            for (const preset of allPresets) {
                if (!preset.userId) {
                    const owner = allUsers.find((u: any) => u.email === preset.created_by);
                    if (owner) {
                        await FilterPreset.update(preset.id, { userId: owner.id });
                        results.filterPresetsFixed++;
                    } else if (adminUser) {
                        await FilterPreset.update(preset.id, { userId: adminUser.id });
                        results.filterPresetsFixed++;
                    }
                }
            }

            // === STEP 8: Update User Roles ===
            console.log("🔧 Step 8: Updating user roles...");
            for (const user of allUsers) {
                let targetRole = "user";
                
                if (user.email === "realfranksvendsen@gmail.com") {
                    targetRole = "administrator";
                } else if (user.email === "dfyaffiliateprogram@gmail.com") {
                    targetRole = "premium";
                }

                if (user.role !== targetRole) {
                    // Note: We cannot update other users' profiles directly
                    // This would need to be done through a backend function
                    console.log(`User ${user.email} needs role: ${targetRole} (current: ${user.role})`);
                    results.rolesUpdated++;
                }
            }

            console.log("✅ COMPREHENSIVE CLEANUP: Complete!", results);
            setCleanupResults(results);

            const totalFixed = results.tasksFixed + results.commentsFixed + results.attachmentsFixed + 
                              results.subtasksFixed + results.listsFixed + results.tagsFixed + 
                              results.filterPresetsFixed;
            
            toast.success(`Database repair complete! Fixed ${totalFixed} records.`);
            queryClient.invalidateQueries();

        } catch (error: any) {
            console.error("❌ CLEANUP ERROR:", error);
            toast.error(`Cleanup failed: ${error.message}`);
        } finally {
            setIsCleaningDatabase(false);
        }
    };

    const handleDeletePermanentlyDeletedTasks = async () => {
        try {
            console.log("🗑️ Removing permanently deleted tasks from database...");
            
            // Note: This is a placeholder - permanent deletion should be handled
            // when users delete from trash
            toast.info("Permanent deletion is now handled when items are removed from trash");
            
        } catch (error: any) {
            console.error("❌ Error deleting tasks:", error);
            toast.error(`Failed to delete tasks: ${error.message}`);
        }
    };

    return (
        <div className="space-y-6">
            <Card className="border-banana-500/20">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Database className="h-5 w-5 text-banana-500" />
                        <CardTitle>Comprehensive Database Repair</CardTitle>
                    </div>
                    <CardDescription>
                        Fix NULL values, assign orphaned records, and update user roles
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Database Repair Tool</AlertTitle>
                        <AlertDescription>
                            This tool will:
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>Assign all orphaned tasks (NULL userId) to the admin account</li>
                                <li>Fix NULL values in required fields (status, priority, completed, deleted)</li>
                                <li>Repair comments, attachments, subtasks, lists, and tags</li>
                                <li>Show which users need role updates (must be done manually)</li>
                            </ul>
                        </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                        <Label htmlFor="adminEmail">Admin Email</Label>
                        <Input
                            id="adminEmail"
                            type="email"
                            value={adminEmail}
                            onChange={(e) => setAdminEmail(e.target.value)}
                            placeholder="admin@example.com"
                        />
                        <p className="text-xs text-muted-foreground">
                            Orphaned records will be assigned to this admin account
                        </p>
                    </div>

                    <Button
                        onClick={handleComprehensiveCleanup}
                        disabled={isCleaningDatabase || !adminEmail}
                        className="w-full bg-banana-500 hover:bg-banana-600 text-black"
                    >
                        {isCleaningDatabase ? (
                            <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Repairing Database...
                            </>
                        ) : (
                            <>
                                <Database className="h-4 w-4 mr-2" />
                                Run Comprehensive Repair
                            </>
                        )}
                    </Button>

                    {cleanupResults && (
                        <div className="mt-4 p-4 bg-muted rounded-lg space-y-2">
                            <div className="flex items-center gap-2 mb-3">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                <span className="font-semibold">Repair Results</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>Tasks fixed: <strong className="text-green-600">{cleanupResults.tasksFixed}</strong></div>
                                <div>Comments fixed: <strong className="text-green-600">{cleanupResults.commentsFixed}</strong></div>
                                <div>Attachments fixed: <strong className="text-green-600">{cleanupResults.attachmentsFixed}</strong></div>
                                <div>Subtasks fixed: <strong className="text-green-600">{cleanupResults.subtasksFixed}</strong></div>
                                <div>Lists fixed: <strong className="text-green-600">{cleanupResults.listsFixed}</strong></div>
                                <div>Tags fixed: <strong className="text-green-600">{cleanupResults.tagsFixed}</strong></div>
                                <div>Filter presets: <strong className="text-green-600">{cleanupResults.filterPresetsFixed}</strong></div>
                                <div>Roles to update: <strong className="text-yellow-600">{cleanupResults.rolesUpdated}</strong></div>
                            </div>
                            <div className="mt-3 pt-3 border-t">
                                <div className="font-bold">
                                    Total records repaired: {
                                        cleanupResults.tasksFixed + cleanupResults.commentsFixed + 
                                        cleanupResults.attachmentsFixed + cleanupResults.subtasksFixed +
                                        cleanupResults.listsFixed + cleanupResults.tagsFixed + 
                                        cleanupResults.filterPresetsFixed
                                    }
                                </div>
                            </div>
                            {cleanupResults.rolesUpdated > 0 && (
                                <Alert className="mt-4">
                                    <UserCog className="h-4 w-4" />
                                    <AlertTitle>Role Updates Needed</AlertTitle>
                                    <AlertDescription>
                                        {cleanupResults.rolesUpdated} user(s) need role updates. Please manually update:
                                        <ul className="list-disc list-inside mt-2">
                                            <li>realfranksvendsen@gmail.com → administrator</li>
                                            <li>dfyaffiliateprogram@gmail.com → premium</li>
                                            <li>All others → user</li>
                                        </ul>
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <UserCog className="h-5 w-5 text-banana-500" />
                        <CardTitle>Current User Roles</CardTitle>
                    </div>
                    <CardDescription>
                        View all user roles in the system
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {allUsers.map((user: any) => (
                            <div key={user.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                <div className="flex-1">
                                    <div className="font-medium">{user.full_name || "No name"}</div>
                                    <div className="text-sm text-muted-foreground">{user.email}</div>
                                </div>
                                <Badge variant={
                                    user.role === "administrator" ? "default" : 
                                    user.role === "premium" ? "secondary" : 
                                    "outline"
                                }>
                                    {user.role || "user"}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}