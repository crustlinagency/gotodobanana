import { List, User } from "@/entities";
import { useQuery } from "@tanstack/react-query";

export function useLists() {
  return useQuery({
    queryKey: ["lists"],
    queryFn: async () => {
      try {
        // Get current user to filter by their email
        const user = await User.me();
        if (!user?.email) {
          console.error("No authenticated user found");
          return [];
        }

        console.log("Fetching lists for user:", user.email);
        
        const lists = await List.filter({ 
          archived: false,
          created_by: user.email // CRITICAL: Filter by current user
        }, "-created_at");
        
        console.log(`Found ${lists?.length || 0} lists for user ${user.email}`);
        return lists || [];
      } catch (error) {
        console.error("Error fetching lists:", error);
        return [];
      }
    },
  });
}