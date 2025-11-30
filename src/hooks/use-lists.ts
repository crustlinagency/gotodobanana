import { useQuery } from "@tanstack/react-query";
import { List, User } from "@/entities";

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
        const result = await List.filter({ 
          archived: false,
          userId: user.id // CRITICAL: Filter by userId
        }, "-created_at");
        
        console.log(`✅ SECURITY: Found ${result?.length || 0} lists for user`);
        return result || [];
      } catch (error) {
        console.error("❌ SECURITY: Error fetching lists:", error);
        return [];
      }
    },
  });
}