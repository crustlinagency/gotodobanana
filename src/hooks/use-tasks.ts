import { Task, User } from "@/entities";
import { useQuery } from "@tanstack/react-query";

export function useTasks(listId?: string | null, searchQuery?: string) {
  return useQuery({
    queryKey: ["tasks", listId, searchQuery],
    queryFn: async () => {
      try {
        const user = await User.me();
        if (!user?.id) {
          console.error("❌ SECURITY: No authenticated user found");
          return [];
        }

        console.log("✅ SECURITY: Fetching tasks for userId:", user.id);
        
        let tasks;
        
        if (listId) {
          tasks = await Task.filter({ 
            listId,
            userId: user.id // CRITICAL: Filter by userId not email
          }, "-created_at");
        } else {
          tasks = await Task.filter({ 
            userId: user.id // CRITICAL: Filter by userId not email
          }, "-created_at");
        }

        if (searchQuery && searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          tasks = tasks.filter((task: any) =>
            task.title?.toLowerCase().includes(query) ||
            task.description?.toLowerCase().includes(query) ||
            task.tags?.some((tag: string) => tag.toLowerCase().includes(query))
          );
        }

        console.log(`✅ SECURITY: Found ${tasks?.length || 0} tasks for user ${user.id}`);
        return tasks || [];
      } catch (error) {
        console.error("❌ SECURITY: Error fetching tasks:", error);
        return [];
      }
    },
  });
}