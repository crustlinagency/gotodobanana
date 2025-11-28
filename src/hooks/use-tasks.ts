import { Task } from "@/entities";
import { useQuery } from "@tanstack/react-query";

export function useTasks(listId?: string | null, searchQuery?: string) {
  return useQuery({
    queryKey: ["tasks", listId, searchQuery],
    queryFn: async () => {
      try {
        let tasks;
        
        if (listId) {
          tasks = await Task.filter({ listId }, "-created_at");
        } else {
          tasks = await Task.list("-created_at");
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

        return tasks || [];
      } catch (error) {
        console.error("Error fetching tasks:", error);
        return [];
      }
    },
  });
}