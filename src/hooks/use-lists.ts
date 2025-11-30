import { List, User } from "@/entities";
import { useQuery } from "@tanstack/react-query";

export function useLists() {
  return useQuery({
    queryKey: ["lists"],
    queryFn: async () => {
      try {
        const user = await User.me();
        if (!user?.id) {
          console.error("❌ SECURITY: No authenticated user found");
          return [];
        }

        console.log("✅ SECURITY: Fetching lists for userId:", user.id);
        
        const lists = await List.filter({ 
          archived: false,
          userId: user.id // CRITICAL: Filter by userId not email
        }, "-created_at");
        
        console.log(`✅ SECURITY: Found ${lists?.length || 0} lists for user ${user.id}`);
        return lists || [];
      } catch (error) {
        console.error("❌ SECURITY: Error fetching lists:", error);
        return [];
      }
    },
  });
}