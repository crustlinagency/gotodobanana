import { useQuery } from "@tanstack/react-query";
import { Note, User } from "@/entities";

export function useNotes() {
  return useQuery({
    queryKey: ["notes"],
    queryFn: async () => {
      try {
        const user = await User.me();
        if (!user?.id) {
          console.error("❌ SECURITY: No authenticated user found");
          return [];
        }

        console.log("✅ SECURITY: Fetching notes for userId:", user.id);
        const result = await Note.filter({ 
          deleted: false,
          userId: user.id
        }, "-created_at");
        
        console.log(`✅ SECURITY: Found ${result?.length || 0} notes for user`);
        return result || [];
      } catch (error) {
        console.error("❌ SECURITY: Error fetching notes:", error);
        return [];
      }
    },
  });
}
