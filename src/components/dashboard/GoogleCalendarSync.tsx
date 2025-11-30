import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, RefreshCw, CheckCircle2, AlertCircle, Loader2, Wrench } from "lucide-react";
import { toast } from "sonner";
import { googleWorkspace } from "@/integrations/google-workspace";
import { Task, User } from "@/entities";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export default function GoogleCalendarSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const queryClient = useQueryClient();

  // TEMPORARILY DISABLED - Feature is in development
  const FEATURE_DISABLED = true;

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => await User.me(),
  });

  // Disabled: Connection status check
  const { data: syncStatus, isLoading: isCheckingStatus } = useQuery({
    queryKey: ["googleCalendarStatus"],
    queryFn: async () => {
      if (FEATURE_DISABLED) {
        return { connected: false, disabled: true };
      }
      try {
        // Check if user has connected Google Calendar
        const status = await googleWorkspace.calendar.getConnectionStatus();
        return status;
      } catch (error) {
        console.error("Error checking Google Calendar status:", error);
        return { connected: false };
      }
    },
    enabled: !!user && !FEATURE_DISABLED,
  });

  // Disabled: Sync tasks mutation
  const syncTasksMutation = useMutation({
    mutationFn: async () => {
      if (FEATURE_DISABLED) {
        throw new Error("Feature temporarily disabled");
      }

      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      console.log("📅 Starting Google Calendar sync...");

      // Get all non-deleted tasks with due dates
      const tasks = await Task.filter({
        userId: user.id,
        deleted: false,
      });

      const tasksWithDueDates = tasks.filter(
        (task: any) => task.dueDate && !task.completed
      );

      console.log(`📅 Found ${tasksWithDueDates.length} tasks to sync`);

      // Sync each task to Google Calendar
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
            reminders: {
              useDefault: true,
            },
          };

          await googleWorkspace.calendar.createEvent(event);
          syncedCount++;
        } catch (error) {
          console.error(`❌ Error syncing task ${task.title}:`, error);
        }
      }

      return { syncedCount, totalTasks: tasksWithDueDates.length };
    },
    onSuccess: (data) => {
      toast.success(
        `Successfully synced ${data.syncedCount} of ${data.totalTasks} tasks to Google Calendar! 📅`
      );
      queryClient.invalidateQueries({ queryKey: ["googleCalendarStatus"] });
    },
    onError: (error: any) => {
      console.error("❌ Error syncing to Google Calendar:", error);
      toast.error("This feature is temporarily disabled.");
    },
  });

  // Disabled: Connect mutation
  const connectMutation = useMutation({
    mutationFn: async () => {
      if (FEATURE_DISABLED) {
        throw new Error("Feature temporarily disabled");
      }
      console.log("🔗 Connecting to Google Calendar...");
      await googleWorkspace.calendar.authenticate();
    },
    onSuccess: () => {
      toast.success("Successfully connected to Google Calendar!");
      queryClient.invalidateQueries({ queryKey: ["googleCalendarStatus"] });
    },
    onError: (error: any) => {
      console.error("❌ Error connecting to Google Calendar:", error);
      toast.error("This feature is temporarily disabled.");
    },
  });

  const handleSync = async () => {
    if (FEATURE_DISABLED) {
      toast.info("Google Calendar sync is temporarily disabled while we configure the integration.");
      return;
    }
    setIsSyncing(true);
    try {
      await syncTasksMutation.mutateAsync();
    } finally {
      setIsSyncing(false);
    }
  };

  const handleConnect = async () => {
    if (FEATURE_DISABLED) {
      toast.info("Google Calendar sync is temporarily disabled while we configure the integration.");
      return;
    }
    await connectMutation.mutateAsync();
  };

  if (isCheckingStatus && !FEATURE_DISABLED) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Google Calendar Sync
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
    <Card className="opacity-75">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Google Calendar Sync
            </CardTitle>
            <CardDescription>
              Keep your tasks synced with Google Calendar
            </CardDescription>
          </div>
          {FEATURE_DISABLED && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Wrench className="h-3 w-3" />
              Coming Soon
            </Badge>
          )}
          {!FEATURE_DISABLED && syncStatus?.connected && (
            <Badge variant="outline" className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-green-600" />
              Connected
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {FEATURE_DISABLED ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Google Calendar sync is currently being configured and will be available soon. 
              This feature will allow you to automatically sync tasks with due dates to your Google Calendar.
            </AlertDescription>
          </Alert>
        ) : !syncStatus?.connected ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Connect your Google Calendar to sync your tasks automatically.
              Tasks with due dates will be added to your calendar.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription>
              Your Google Calendar is connected! Click "Sync Now" to add your tasks with due dates to your calendar.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col gap-2">
          {!syncStatus?.connected ? (
            <Button
              onClick={handleConnect}
              disabled={connectMutation.isPending || FEATURE_DISABLED}
              className="w-full bg-banana-500 hover:bg-banana-600 text-black"
            >
              {connectMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4 mr-2" />
                  Connect Google Calendar
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleSync}
              disabled={isSyncing || syncTasksMutation.isPending || FEATURE_DISABLED}
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
          {FEATURE_DISABLED 
            ? "This feature will sync tasks with due dates to your calendar once enabled."
            : "Only tasks with due dates that are not completed will be synced to your calendar."}
        </p>
      </CardContent>
    </Card>
  );
}