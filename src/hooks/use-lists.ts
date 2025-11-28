import { List } from "@/entities";
import { useQuery } from "@tanstack/react-query";

export function useLists() {
  return useQuery({
    queryKey: ["lists"],
    queryFn: async () => {
      try {
        const lists = await List.filter({ archived: false }, "-created_at");
        return lists || [];
      } catch (error) {
        console.error("Error fetching lists:", error);
        return [];
      }
    },
  });
}