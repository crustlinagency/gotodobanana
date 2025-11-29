import { Task, User } from "@/entities";
import { useQuery } from "@tanstack/react-query";

export function useTasks(listId?: string | null, searchQuery?: string) {
  return useQuery({
    queryKey: ["tasks", listId, searchQuery],
    queryFn: async () => {
      try {
        // Get current user to filter by their email
        const user = await User.me();
        if (!user?.email) {
          console.error("No authenticated user found");
          return [];
        }

        console.log("Fetching tasks for user:", user.email);
        
        let tasks;
        
        if (listId) {
          tasks = await Task.filter({ 
            listId,
            created_by: user.email // CRITICAL: Filter by current user
          }, "-created_at");
        } else {
          tasks = await Task.filter({ 
            created_by: user.email // CRITICAL: Filter by current user
          }, "-created_at");
        }

        // Apply search filter
        if (searchQuery && searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          tasks = tasks.filter((task: any) =>
            task.title?.toLowerCase().includes(query) ||
            task.description?.toLowerCase().includes(query) ||
            task.tags?.some((tag: string) => tag.toLowerCase().includes(query))
          );
        }

        console.log(`Found ${tasks?.length || 0} tasks for user ${user.email}`);
        return tasks || [];
      } catch (error) {
        console.error("Error fetching tasks:", error);
        return [];
      }
    },
  });
}