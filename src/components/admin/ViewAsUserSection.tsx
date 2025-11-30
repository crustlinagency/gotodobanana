import { useState } from "react";
import { User, Task } from "@/entities";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Eye, UserCheck, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ViewAsUserSection() {
    const [selectedUserId, setSelectedUserId] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    const { data: users = [] } = useQuery({
        queryKey: ["allUsers"],
        queryFn: async () => {
            const result = await User.list();
            return result || [];
        },
    });

    const { data: userTasks = [], isLoading: tasksLoading } = useQuery({
        queryKey: ["viewAsUserTasks", selectedUserId],
        queryFn: async () => {
            if (!selectedUserId) return [];
            const selectedUser = users.find((u: any) => u.id === selectedUserId);
            if (!selectedUser) return [];

            const result = await Task.filter({ userId: selectedUserId });
            return result || [];
        },
        enabled: !!selectedUserId,
    });

    const filteredUsers = users.filter((user: any) =>
        user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const selectedUser = users.find((u: any) => u.id === selectedUserId);

    const handleViewUser = () => {
        if (!selectedUserId) {
            toast.error("Please select a user first");
            return;
        }
        
        // Store the view-as-user data in localStorage
        localStorage.setItem("viewAsUser", JSON.stringify({
            userId: selectedUserId,
            userName: selectedUser?.full_name || selectedUser?.email,
            userEmail: selectedUser?.email
        }));
        
        toast.success(`Now viewing dashboard as ${selectedUser?.full_name || selectedUser?.email}`);
        
        // Navigate to dashboard
        navigate("/dashboard");
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Eye className="h-5 w-5 text-banana-500" />
                        <CardTitle>View As User</CardTitle>
                    </div>
                    <CardDescription>
                        View the dashboard from any user's perspective to help troubleshoot issues
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>Admin Feature</AlertTitle>
                        <AlertDescription>
                            This feature allows you to see what any user sees on their dashboard. 
                            Perfect for troubleshooting and support. User data remains private and secure.
                        </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Select User</label>
                        <Input
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="mb-2"
                        />
                        <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Choose a user to view" />
                            </SelectTrigger>
                            <SelectContent>
                                {filteredUsers.map((user: any) => (
                                    <SelectItem key={user.id} value={user.id}>
                                        {user.full_name || "No name"} ({user.email})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedUser && (
                        <div className="p-4 bg-muted rounded-lg space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Selected User:</span>
                                <Badge>{selectedUser.role || "user"}</Badge>
                            </div>
                            <div className="text-sm">
                                <strong>Name:</strong> {selectedUser.full_name || "N/A"}
                            </div>
                            <div className="text-sm">
                                <strong>Email:</strong> {selectedUser.email}
                            </div>
                            <div className="text-sm">
                                <strong>User ID:</strong> <code className="text-xs bg-background px-1 py-0.5 rounded">{selectedUser.id}</code>
                            </div>
                        </div>
                    )}

                    <Button
                        onClick={handleViewUser}
                        disabled={!selectedUserId}
                        className="w-full bg-banana-500 hover:bg-banana-600 text-black"
                    >
                        <UserCheck className="h-4 w-4 mr-2" />
                        View User's Dashboard
                    </Button>
                </CardContent>
            </Card>

            {selectedUser && (
                <Card>
                    <CardHeader>
                        <CardTitle>User Statistics</CardTitle>
                        <CardDescription>
                            Overview of {selectedUser.full_name || selectedUser.email}'s activity
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {tasksLoading ? (
                            <p className="text-muted-foreground">Loading user data...</p>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-4 bg-muted rounded-lg">
                                    <div className="text-2xl font-bold">{userTasks.length}</div>
                                    <div className="text-sm text-muted-foreground">Total Tasks</div>
                                </div>
                                <div className="p-4 bg-muted rounded-lg">
                                    <div className="text-2xl font-bold">
                                        {userTasks.filter((t: any) => t.completed).length}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Completed</div>
                                </div>
                                <div className="p-4 bg-muted rounded-lg">
                                    <div className="text-2xl font-bold">
                                        {userTasks.filter((t: any) => !t.completed && !t.deleted).length}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Active</div>
                                </div>
                                <div className="p-4 bg-muted rounded-lg">
                                    <div className="text-2xl font-bold">
                                        {userTasks.filter((t: any) => t.deleted).length}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Deleted</div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}