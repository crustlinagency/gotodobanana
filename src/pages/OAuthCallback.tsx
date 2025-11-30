import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function OAuthCallback() {
    useEffect(() => {
        // Parse the OAuth token from URL hash
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const accessToken = params.get("access_token");
        const error = params.get("error");
        const state = params.get("state");

        if (error) {
            console.error("OAuth error:", error);
            // Close the popup on error
            if (window.opener) {
                window.close();
            }
            return;
        }

        if (accessToken) {
            // Determine which service based on state parameter
            const isMicrosoft = state === "microsoft_calendar";
            const tokenKey = isMicrosoft ? "microsoft_calendar_token" : "google_calendar_token";
            const expiryKey = isMicrosoft ? "microsoft_calendar_token_expiry" : "google_calendar_token_expiry";
            const serviceName = isMicrosoft ? "Outlook Calendar" : "Google Calendar";

            // Store the token in localStorage
            localStorage.setItem(tokenKey, accessToken);

            // Store the expiry time
            const expiresIn = params.get("expires_in");
            if (expiresIn) {
                const expiryTime = Date.now() + parseInt(expiresIn) * 1000;
                localStorage.setItem(expiryKey, expiryTime.toString());
            }

            console.log(`✅ ${serviceName} authenticated successfully`);

            // Close the popup window after a brief delay
            setTimeout(() => {
                if (window.opener) {
                    window.close();
                }
            }, 500);
        }
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-banana-600 mx-auto" />
                <h2 className="text-xl font-semibold">Connecting to Calendar...</h2>
                <p className="text-muted-foreground">This window will close automatically.</p>
            </div>
        </div>
    );
}