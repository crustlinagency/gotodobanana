import { useState } from "react";
import { User, Task, Comment, Attachment, Subtask, List, Tag, FilterPreset } from "@/entities";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Save, AlertCircle, Shield, Database, RefreshCw, CheckCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Settings() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isCleaningDatabase, setIsCleaningDatabase] = useState(false);
    const [cleanupResults, setCleanupResults] = useState<any>(null);
    
    const { data: user, isLoading } = useQuery({
        queryKey: ["user"],
        queryFn: async () => {
            const currentUser = await User.me();
            if (!currentUser) {
                throw new Error("Not authenticated");
            }
            return currentUser;
        },
    });

    const [fullName, setFullName] = useState(user?.full_name || "");
    const [email, setEmail] = useState(user?.email || "");
    const [tagVisibility, setTagVisibility] = useState(user?.tagVisibility || "all");

    const updateProfileMutation = useMutation({
        mutationFn: async (data: any) => {
            await User.updateProfile(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user"] });
            toast.success("Profile updated successfully");
        },
        onError: (error: any) => {
            console.error("Error updating profile:", error);
            toast.error(error.message || "Failed to update profile");
        },
    });

    const handleSave = () => {
        const updates: any = {};
        
        if (fullName !== user?.full_name) {
            updates.full_name = fullName;
        }
        
        if (email !== user?.email && !user?.email?.includes("gmail.com")) {
            updates.email = email;
        }
        
        if (tagVisibility !== user?.tagVisibility) {
            updates.tagVisibility = tagVisibility;
        }

        if (Object.keys(updates).length > 0) {
            updateProfileMutation.mutate(updates);
        } else {
            toast.info("No changes to save");
        }
    };

    const handleDatabaseCleanup = async () => {
        if (!user?.id) {
            toast.error("You must be logged in to run database cleanup");
            return;
        }

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
            console.log("🔧 CLEANUP: Starting database cleanup for userId:", user.id);

            // Fix Tasks with NULL userId
            const tasksWithoutUserId = await Task.list();
            for (const task of tasksWithoutUserId) {
                if (!task.userId && task.created_by === user.email) {
                    await Task.update(task.id, { userId: user.id });
                    results.tasks++;
                }
            }

            // Fix Comments with NULL userId
            const commentsWithoutUserId = await Comment.list();
            for (const comment of commentsWithoutUserId) {
                if (!comment.userId && comment.created_by === user.email) {
                    await Comment.update(comment.id, { userId: user.id });
                    results.comments++;
                }
            }

            // Fix Attachments with NULL userId
            const attachmentsWithoutUserId = await Attachment.list();
            for (const attachment of attachmentsWithoutUserId) {
                if (!attachment.userId && attachment.created_by === user.email) {
                    await Attachment.update(attachment.id, { userId: user.id });
                    results.attachments++;
                }
            }

            // Fix Subtasks with NULL userId
            const subtasksWithoutUserId = await Subtask.list();
            for (const subtask of subtasksWithoutUserId) {
                if (!subtask.userId && subtask.created_by === user.email) {
                    await Subtask.update(subtask.id, { userId: user.id });
                    results.subtasks++;
                }
            }

            // Fix Lists with NULL userId
            const listsWithoutUserId = await List.list();
            for (const list of listsWithoutUserId) {
                if (!list.userId && list.created_by === user.email) {
                    await List.update(list.id, { userId: user.id });
                    results.lists++;
                }
            }

            // Fix Tags with NULL userId (only for private tags)
            const tagsWithoutUserId = await Tag.list();
            for (const tag of tagsWithoutUserId) {
                if (!tag.userId && tag.created_by === user.email && tag.visibility !== "global") {
                    await Tag.update(tag.id, { userId: user.id });
                    results.tags++;
                }
            }

            // Fix FilterPresets with NULL userId
            const presetsWithoutUserId = await FilterPreset.list();
            for (const preset of presetsWithoutUserId) {
                if (!preset.userId && preset.created_by === user.email) {
                    await FilterPreset.update(preset.id, { userId: user.id });
                    results.filterPresets++;
                }
            }

            // Fix User role if NULL
            if (!user.role) {
                await User.updateProfile({ role: "user" });
                results.users++;
            }

            console.log("✅ CLEANUP: Database cleanup completed", results);
            setCleanupResults(results);
            
            const totalFixed = Object.values(results).reduce((sum: number, val: number) => sum + val, 0);
            if (totalFixed > 0) {
                toast.success(`Database cleanup complete! Fixed ${totalFixed} records.`);
                queryClient.invalidateQueries();
            } else {
                toast.info("No records needed fixing. Database is clean!");
            }
        } catch (error) {
            console.error("❌ CLEANUP: Error during database cleanup:", error);
            toast.error("Database cleanup failed. Please try again.");
        } finally {
            setIsCleaningDatabase(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-banana-500 mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading settings...</p>
                </div>
            </div>
        );
    }

    const isGoogleAuth = user?.email?.includes("gmail.com") || false;

    return (
        <div className="min-h-screen flex flex-col">
            <DashboardHeader />
            
            <main className="flex-1 container max-w-4xl mx-auto py-8 px-4">
                <div className="mb-6">
                    <Button
                        variant="ghost"
                        onClick={() => navigate("/dashboard")}
                        className="mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                    </Button>
                    
                    <h1 className="text-3xl font-bold">Settings</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage your account preferences and privacy settings
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Database Cleanup Section */}
                    <Card className="border-banana-500/20">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Database className="h-5 w-5 text-banana-500" />
                                <CardTitle>Database Cleanup</CardTitle>
                            </div>
                            <CardDescription>
                                Fix any missing user data and ensure all your records are properly associated with your account
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>What does this do?</AlertTitle>
                                <AlertDescription>
                                    This tool will scan all your data (tasks, lists, comments, attachments, etc.) 
                                    and fix any records that are missing proper user ownership information. 
                                    This ensures maximum security and data isolation.
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
                                        Run Database Cleanup
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
                                        <div>User profile fixed: <strong>{cleanupResults.users}</strong></div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Profile Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>
                                Update your personal details and account information
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Full Name</Label>
                                <Input
                                    id="fullName"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Your full name"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your.email@example.com"
                                    disabled={isGoogleAuth}
                                />
                                {isGoogleAuth && (
                                    <p className="text-xs text-muted-foreground">
                                        Email cannot be changed for Google-authenticated accounts
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Account Role</Label>
                                <div className="flex items-center gap-2">
                                    <Badge variant={user?.role === "admin" ? "destructive" : user?.role === "premium" ? "default" : "secondary"}>
                                        {user?.role === "admin" ? "Administrator" : user?.role === "premium" ? "Premium User" : "Free User"}
                                    </Badge>
                                    {user?.role === "user" && (
                                        <span className="text-sm text-muted-foreground">
                                            Upgrade to Premium for advanced features
                                        </span>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tag Visibility Settings */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-banana-500" />
                                <CardTitle>Tag Privacy Settings</CardTitle>
                            </div>
                            <CardDescription>
                                Control who can see your tags and whether you can see others' tags
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="tagVisibility">Tag Visibility</Label>
                                <Select value={tagVisibility} onValueChange={setTagVisibility}>
                                    <SelectTrigger id="tagVisibility">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            See All Tags (Your tags + Global tags)
                                        </SelectItem>
                                        <SelectItem value="private">
                                            Private Only (Only your own tags)
                                        </SelectItem>
                                        <SelectItem value="team">
                                            Team Tags (Coming soon - For team collaboration)
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Important</AlertTitle>
                                <AlertDescription>
                                    {tagVisibility === "all" 
                                        ? "You can see and use both your own tags and tags marked as 'global' by other users."
                                        : tagVisibility === "private"
                                        ? "You will only see your own tags. You won't have access to global tags created by others."
                                        : "Team tag sharing will be available in a future update for collaborative workspaces."}
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>

                    {/* User ID Info (for debugging/reference) */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Account Information</CardTitle>
                            <CardDescription>
                                Technical details about your account
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">User ID</span>
                                <code className="text-xs bg-muted px-2 py-1 rounded">{user?.id}</code>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Account Created</span>
                                <span className="text-sm text-muted-foreground">
                                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Save Button */}
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => navigate("/dashboard")}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={updateProfileMutation.isPending}
                            className="bg-banana-500 hover:bg-banana-600 text-black"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}