import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function OAuthCallback() {
    useEffect(() => {
        console.log("[OAuth Callback] Page loaded");
        console.log("[OAuth Callback] Full URL:", window.location.href);
        console.log("[OAuth Callback] Hash:", window.location.hash);
        
        // Parse the OAuth token from URL hash
        const hash = window.location.hash.substring(1);
        console.log("[OAuth Callback] Parsed hash:", hash);
        
        const params = new URLSearchParams(hash);
        const accessToken = params.get("access_token");
        const error = params.get("error");
        const errorDescription = params.get("error_description");
        const state = params.get("state");

        console.log("[OAuth Callback] Access token found:", !!accessToken);
        console.log("[OAuth Callback] Error:", error);
        console.log("[OAuth Callback] Error description:", errorDescription);
        console.log("[OAuth Callback] State:", state);

        if (error) {
            console.error("[OAuth Callback] OAuth error:", error, errorDescription);
            // Notify parent window of error
            if (window.opener) {
                window.opener.postMessage({ 
                    type: "oauth_error", 
                    error, 
                    errorDescription 
                }, window.location.origin);
            }
            // Close the popup on error after a delay so user can see error
            setTimeout(() => {
                if (window.opener) {
                    window.close();
                }
            }, 2000);
            return;
        }

        if (accessToken) {
            console.log("[OAuth Callback] Access token received, length:", accessToken.length);
            
            // Determine which service based on state parameter
            const isMicrosoft = state === "microsoft_calendar";
            const isGoogle = state === "google_calendar";
            
            console.log("[OAuth Callback] Service type - Microsoft:", isMicrosoft, "Google:", isGoogle);
            
            const tokenKey = isMicrosoft ? "microsoft_calendar_token" : "google_calendar_token";
            const expiryKey = isMicrosoft ? "microsoft_calendar_token_expiry" : "google_calendar_token_expiry";
            const serviceName = isMicrosoft ? "Outlook Calendar" : "Google Calendar";

            // Store the token in localStorage
            localStorage.setItem(tokenKey, accessToken);
            console.log("[OAuth Callback] Token stored in localStorage:", tokenKey);

            // Store the expiry time
            const expiresIn = params.get("expires_in");
            if (expiresIn) {
                const expiryTime = Date.now() + parseInt(expiresIn) * 1000;
                localStorage.setItem(expiryKey, expiryTime.toString());
                console.log("[OAuth Callback] Token expiry set:", new Date(expiryTime).toISOString());
            }

            console.log(`✅ [OAuth Callback] ${serviceName} authenticated successfully`);

            // Notify parent window of success
            if (window.opener) {
                console.log("[OAuth Callback] Notifying parent window of success");
                window.opener.postMessage({ 
                    type: "oauth_success", 
                    service: isMicrosoft ? "microsoft" : "google",
                    tokenKey,
                    expiryKey
                }, window.location.origin);
            }

            // Close the popup window after a brief delay
            setTimeout(() => {
                console.log("[OAuth Callback] Closing popup window");
                if (window.opener) {
                    window.close();
                }
            }, 500);
        } else {
            console.warn("[OAuth Callback] No access token or error found in URL");
            // Notify parent of unknown error
            if (window.opener) {
                window.opener.postMessage({ 
                    type: "oauth_error", 
                    error: "no_token",
                    errorDescription: "No access token received from OAuth provider"
                }, window.location.origin);
            }
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