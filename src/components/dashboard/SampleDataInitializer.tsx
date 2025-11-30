import { useEffect, useState } from "react";
import { User, Task, List } from "@/entities";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function SampleDataInitializer() {
    const queryClient = useQueryClient();
    const [isInitializing, setIsInitializing] = useState(false);

    useEffect(() => {
        initializeSampleData();
    }, []);

    const initializeSampleData = async () => {
        if (isInitializing) return;
        setIsInitializing(true);

        try {
            const user = await User.me();
            if (!user?.id) {
                console.log("No user found, skipping sample data initialization");
                return;
            }

            // Check if sample data has already been initialized
            const preferences = user.preferences || {};
            if (preferences.sampleDataInitialized) {
                console.log("Sample data already initialized for user:", user.email);
                return;
            }

            console.log("🎉 Initializing sample data for new member:", user.email);

            // Create a sample list
            const sampleList = await List.create({
                userId: user.id,
                name: "Getting Started",
                description: "Your first project list",
                color: "#FFD93D",
                archived: false,
                order: 0,
            });

            console.log("✅ Created sample list:", sampleList.id);

            // Get tomorrow and next week dates
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const nextWeek = new Date();
            nextWeek.setDate(nextWeek.getDate() + 7);

            // Create sample tasks
            const sampleTasks = [
                {
                    userId: user.id,
                    title: "Welcome to GoTodoBanana! 🍌",
                    description: "This is a sample task to help you get started. Try editing it, marking it complete, or deleting it!",
                    priority: "High",
                    status: "todo",
                    completed: false,
                    deleted: false,
                    isRecurring: false,
                    dueDate: tomorrow.toISOString(),
                    listId: sampleList.id,
                    tags: ["Welcome", "Tutorial"],
                    order: 0,
                    isSampleData: true,
                },
                {
                    userId: user.id,
                    title: "Explore the Calendar View",
                    description: "Click the view switcher to see your tasks in calendar format. Perfect for planning your week!",
                    priority: "Medium",
                    status: "todo",
                    completed: false,
                    deleted: false,
                    isRecurring: false,
                    dueDate: nextWeek.toISOString(),
                    listId: sampleList.id,
                    tags: ["Tutorial"],
                    order: 1,
                    isSampleData: true,
                },
                {
                    userId: user.id,
                    title: "Try the Kanban Board",
                    description: "Drag and drop tasks between columns to change their status. Great for visual task management!",
                    priority: "Medium",
                    status: "todo",
                    completed: false,
                    deleted: false,
                    isRecurring: false,
                    listId: sampleList.id,
                    tags: ["Tutorial"],
                    order: 2,
                    isSampleData: true,
                },
                {
                    userId: user.id,
                    title: "Create Your First List",
                    description: "Organize your tasks by creating custom lists. Click the sidebar to add a new project or category.",
                    priority: "Low",
                    status: "todo",
                    completed: false,
                    deleted: false,
                    isRecurring: false,
                    listId: sampleList.id,
                    tags: ["Getting Started"],
                    order: 3,
                    isSampleData: true,
                },
                {
                    userId: user.id,
                    title: "Add Your First Real Task",
                    description: "Click the 'New Task' button or press Ctrl+N to create your first task. You're all set!",
                    priority: "Low",
                    status: "todo",
                    completed: false,
                    deleted: false,
                    isRecurring: false,
                    listId: sampleList.id,
                    tags: ["Getting Started"],
                    order: 4,
                    isSampleData: true,
                },
            ];

            // Create all sample tasks
            for (const task of sampleTasks) {
                await Task.create(task);
            }

            console.log(`✅ Created ${sampleTasks.length} sample tasks`);

            // Mark sample data as initialized in user preferences
            await User.updateProfile({
                preferences: {
                    ...preferences,
                    sampleDataInitialized: true,
                },
            });

            console.log("✅ Sample data initialization complete!");

            // Refresh queries to show the new data
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            queryClient.invalidateQueries({ queryKey: ["lists"] });

            toast.success("Welcome! We've created some sample tasks to help you get started 🎉");

        } catch (error) {
            console.error("❌ Error initializing sample data:", error);
            // Silently fail - don't disrupt user experience
        } finally {
            setIsInitializing(false);
        }
    };

    // This component doesn't render anything
    return null;
}