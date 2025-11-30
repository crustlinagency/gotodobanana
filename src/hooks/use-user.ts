import { useQuery } from "@tanstack/react-query";
import { User } from "@/entities";
import { useEffect } from "react";

/**
 * Hook to get the current authenticated user
 * This is the single source of truth for user data across the app
 */
export function useUser() {
    const query = useQuery({
        queryKey: ["user"],
        queryFn: async () => {
            try {
                const user = await User.me();
                console.log("User authenticated:", user?.email);
                return user;
            } catch (error) {
                console.error("Auth error:", error);
                // Return null instead of throwing to prevent app crashes
                return null;
            }
        },
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
        retry: false, // Don't retry on auth failures
        refetchOnWindowFocus: false, // Prevent refetch loops
    });

    // Auto-redirect to login if not authenticated after loading completes
    useEffect(() => {
        if (!query.isLoading && !query.data) {
            console.log("User not authenticated, redirecting to login...");
            // Small delay to ensure any open dialogs can close
            const timer = setTimeout(() => {
                User.login();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [query.isLoading, query.data]);

    return query;
}