import { useState } from "react";
import { User } from "@/entities";
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
import { ArrowLeft, Save, AlertCircle, Shield } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Settings() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    
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