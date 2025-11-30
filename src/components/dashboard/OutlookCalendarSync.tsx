import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, RefreshCw, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { microsoftOutlook } from "@/integrations/microsoft-outlook";
import { Task, User } from "@/entities";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export default function OutlookCalendarSync() {
    const [isSyncing, setIsSyncing] = useState(false);
    const queryClient = useQueryClient();

    const { data: user } = useQuery({
        queryKey: ["user"],
        queryFn: async () => await User.me(),
    });

    // Check connection status
    const { data: syncStatus, isLoading: isCheckingStatus } = useQuery({
        queryKey: ["outlookCalendarStatus"],
        queryFn: async () => {
            try {
                const status = await microsoftOutlook.calendar.getConnectionStatus();
                return status;
            } catch (error) {
                console.error("Error checking Outlook Calendar status:", error);
                return { connected: false };
            }
        },
        enabled: !!user,
    });

    // Sync tasks to Outlook Calendar
    const syncTasksMutation = useMutation({
        mutationFn: async () => {
            if (!user?.id) {
                throw new Error("User not authenticated");
            }

            console.log("📅 Starting Outlook Calendar sync...");

            // Get all non-deleted tasks with due dates
            const tasks = await Task.filter({
                userId: user.id,
                deleted: false,
            });

            const tasksWithDueDates = tasks.filter(
                (task: any) => task.dueDate && !task.completed
            );

            console.log(`📅 Found ${tasksWithDueDates.length} tasks to sync to Outlook`);

            // Sync each task to Outlook Calendar
            let syncedCount = 0;
            for (const task of tasksWithDueDates) {
                try {
                    const event = {
                        summary: task.title,
                        description: task.description || "",
                        start: {
                            dateTime: new Date(task.dueDate).toISOString(),
                            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                        },
                        end: {
                            dateTime: new Date(new Date(task.dueDate).getTime() + 60 * 60 * 1000).toISOString(),
                            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                        },
                    };

                    await microsoftOutlook.calendar.createEvent(event);
                    syncedCount++;
                } catch (error) {
                    console.error(`❌ Error syncing task ${task.title} to Outlook:`, error);
                }
            }

            return { syncedCount, totalTasks: tasksWithDueDates.length };
        },
        onSuccess: (data) => {
            toast.success(
                `Successfully synced ${data.syncedCount} of ${data.totalTasks} tasks to Outlook Calendar! 📅`
            );
            queryClient.invalidateQueries({ queryKey: ["outlookCalendarStatus"] });
        },
        onError: (error: any) => {
            console.error("❌ Error syncing to Outlook Calendar:", error);
            toast.error(error.message || "Failed to sync tasks to Outlook Calendar");
        },
    });

    // Connect to Outlook Calendar
    const connectMutation = useMutation({
        mutationFn: async () => {
            console.log("🔗 Connecting to Outlook Calendar...");
            await microsoftOutlook.calendar.authenticate();
        },
        onSuccess: () => {
            toast.success("Successfully connected to Outlook Calendar!");
            queryClient.invalidateQueries({ queryKey: ["outlookCalendarStatus"] });
        },
        onError: (error: any) => {
            console.error("❌ Error connecting to Outlook Calendar:", error);
            toast.error(error.message || "Failed to connect to Outlook Calendar");
        },
    });

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            await syncTasksMutation.mutateAsync();
        } finally {
            setIsSyncing(false);
        }
    };

    const handleConnect = async () => {
        await connectMutation.mutateAsync();
    };

    if (isCheckingStatus) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Outlook Calendar Sync
                    </CardTitle>
                    <CardDescription>
                        Checking connection status...
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Outlook Calendar Sync
                        </CardTitle>
                        <CardDescription>
                            Keep your tasks synced with Microsoft Outlook Calendar
                        </CardDescription>
                    </div>
                    {syncStatus?.connected && (
                        <Badge variant="outline" className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-green-600" />
                            Connected
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {!syncStatus?.connected ? (
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            Connect your Outlook Calendar to sync your tasks automatically.
                            Tasks with due dates will be added to your calendar.
                        </AlertDescription>
                    </Alert>
                ) : (
                    <Alert>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertDescription>
                            Your Outlook Calendar is connected! Click "Sync Now" to add your tasks with due dates to your calendar.
                        </AlertDescription>
                    </Alert>
                )}

                <div className="flex flex-col gap-2">
                    {!syncStatus?.connected ? (
                        <Button
                            onClick={handleConnect}
                            disabled={connectMutation.isPending}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {connectMutation.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Connecting...
                                </>
                            ) : (
                                <>
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Connect Outlook Calendar
                                </>
                            )}
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSync}
                            disabled={isSyncing || syncTasksMutation.isPending}
                            className="w-full"
                        >
                            {isSyncing || syncTasksMutation.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Syncing...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Sync Now
                                </>
                            )}
                        </Button>
                    )}
                </div>

                <p className="text-xs text-muted-foreground">
                    Only tasks with due dates that are not completed will be synced to your calendar.
                </p>
            </CardContent>
        </Card>
    );
}