import { useQuery } from "@tanstack/react-query";
import { User } from "@/entities";

/**
 * Hook to get the current authenticated user
 * This is the single source of truth for user data across the app
 */
export function useUser() {
    return useQuery({
        queryKey: ["user"],
        queryFn: async () => {
            try {
                const user = await User.me();
                console.log("User authenticated:", user?.email);
                return user;
            } catch (error) {
                console.error("Auth error:", error);
                return null;
            }
        },
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
        retry: 1,
    });
}