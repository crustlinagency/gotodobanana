import { useQuery } from "@tanstack/react-query";
import { User } from "@/entities";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Loader2, ArrowLeft, Shield, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import Footer from "@/components/Footer";
import UserManagementSection from "@/components/admin/UserManagementSection";
import SystemAnalytics from "@/components/admin/SystemAnalytics";
import DatabaseCleanupSection from "@/components/admin/DatabaseCleanupSection";
import ViewAsUserSection from "@/components/admin/ViewAsUserSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminDashboard() {
    const navigate = useNavigate();

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

    useEffect(() => {
        if (!isLoading && !user) {
            User.login();
        }
    }, [user, isLoading]);

    useEffect(() => {
        if (user && user.role !== "administrator") {
            navigate("/dashboard");
        }
    }, [user, navigate]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-banana-600" />
            </div>
        );
    }

    if (!user || user.role !== "administrator") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Alert variant="destructive" className="max-w-md">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Access Denied</AlertTitle>
                    <AlertDescription>
                        You don't have permission to access this page. Administrator privileges required.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <DashboardHeader onNewTask={() => {}} onSearch={() => {}} />

            <main className="flex-1 container max-w-7xl mx-auto py-8 px-4">
                <div className="mb-6">
                    <Button
                        variant="ghost"
                        onClick={() => navigate("/dashboard")}
                        className="mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                    </Button>

                    <div className="flex items-center gap-3 mb-2">
                        <Shield className="h-8 w-8 text-banana-500" />
                        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                    </div>
                    <p className="text-muted-foreground">
                        Manage users, view analytics, and maintain system health
                    </p>
                </div>

                <Tabs defaultValue="users" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="users">User Management</TabsTrigger>
                        <TabsTrigger value="analytics">System Analytics</TabsTrigger>
                        <TabsTrigger value="cleanup">Database Cleanup</TabsTrigger>
                        <TabsTrigger value="viewas">View As User</TabsTrigger>
                    </TabsList>

                    <TabsContent value="users">
                        <UserManagementSection />
                    </TabsContent>

                    <TabsContent value="analytics">
                        <SystemAnalytics />
                    </TabsContent>

                    <TabsContent value="cleanup">
                        <DatabaseCleanupSection />
                    </TabsContent>

                    <TabsContent value="viewas">
                        <ViewAsUserSection />
                    </TabsContent>
                </Tabs>
            </main>

            <Footer />
        </div>
    );
}