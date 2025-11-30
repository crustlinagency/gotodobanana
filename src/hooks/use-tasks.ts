import { useQuery } from "@tanstack/react-query";
import { Task, User } from "@/entities";

export function useTasks() {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      try {
        const user = await User.me();
        if (!user?.id) {
          console.error("❌ SECURITY: No authenticated user found");
          return [];
        }

        console.log("✅ SECURITY: Fetching tasks for userId:", user.id);
        const result = await Task.filter({ 
          deleted: false,
          userId: user.id // CRITICAL: Filter by userId
        }, "-created_at");
        
        console.log(`✅ SECURITY: Found ${result?.length || 0} tasks for user`);
        return result || [];
      } catch (error) {
        console.error("❌ SECURITY: Error fetching tasks:", error);
        return [];
      }
    },
  });
}