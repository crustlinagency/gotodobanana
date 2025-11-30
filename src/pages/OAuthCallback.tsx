import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { exchangeMicrosoftCode } from "@/functions";

export default function OAuthCallback() {
    useEffect(() => {
        console.log("[OAuth Callback] Page loaded");
        console.log("[OAuth Callback] Full URL:", window.location.href);
        
        // Parse the OAuth response from URL
        // For Microsoft Code flow, check query parameters
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");
        const error = urlParams.get("error");
        const errorDescription = urlParams.get("error_description");
        const state = urlParams.get("state");

        // For Google implicit flow, check hash
        const hash = window.location.hash.substring(1);
        const hashParams = new URLSearchParams(hash);
        const accessTokenFromHash = hashParams.get("access_token");
        const errorFromHash = hashParams.get("error");
        const errorDescriptionFromHash = hashParams.get("error_description");
        const stateFromHash = hashParams.get("state");

        console.log("[OAuth Callback] Code (query):", code);
        console.log("[OAuth Callback] Access token (hash):", !!accessTokenFromHash);
        console.log("[OAuth Callback] Error:", error || errorFromHash);
        console.log("[OAuth Callback] State:", state || stateFromHash);

        // Handle errors
        if (error || errorFromHash) {
            console.error("[OAuth Callback] OAuth error:", error || errorFromHash, errorDescription || errorDescriptionFromHash);
            if (window.opener) {
                window.opener.postMessage({ 
                    type: "oauth_error", 
                    error: error || errorFromHash, 
                    errorDescription: errorDescription || errorDescriptionFromHash
                }, window.location.origin);
            }
            setTimeout(() => {
                if (window.opener) {
                    window.close();
                }
            }, 2000);
            return;
        }

        // Handle Microsoft Authorization Code flow
        if (code && (state === "microsoft_calendar" || urlParams.get("state") === "microsoft_calendar")) {
            console.log("[OAuth Callback] Processing Microsoft authorization code");
            
            (async () => {
                try {
                    // Get the code verifier from sessionStorage (stored in parent window)
                    const codeVerifier = window.opener?.sessionStorage.getItem("microsoft_code_verifier");
                    if (!codeVerifier) {
                        throw new Error("Code verifier not found. Please try authenticating again.");
                    }
                    console.log("[OAuth Callback] Code verifier retrieved from parent window");

                    // Exchange code for access token using backend function
                    const redirectUri = `${window.location.origin}/oauth/callback`;
                    console.log("[OAuth Callback] Exchanging code for token with redirect URI:", redirectUri);
                    
                    const tokenResponse = await exchangeMicrosoftCode({
                        code,
                        redirectUri,
                        codeVerifier,
                    });

                    if (!tokenResponse.access_token) {
                        throw new Error("No access token received from server");
                    }

                    console.log("[OAuth Callback] Token received, storing in localStorage");

                    // Store the token in parent window's localStorage
                    if (window.opener) {
                        window.opener.localStorage.setItem("microsoft_calendar_token", tokenResponse.access_token);
                        
                        // Store the expiry time
                        if (tokenResponse.expires_in) {
                            const expiryTime = Date.now() + tokenResponse.expires_in * 1000;
                            window.opener.localStorage.setItem("microsoft_calendar_token_expiry", expiryTime.toString());
                            console.log("[OAuth Callback] Token expiry set:", new Date(expiryTime).toISOString());
                        }
                    }

                    console.log("✅ [OAuth Callback] Microsoft Calendar authenticated successfully");

                    // Notify parent window
                    if (window.opener) {
                        console.log("[OAuth Callback] Notifying parent window of success");
                        window.opener.postMessage({ 
                            type: "oauth_success", 
                            service: "microsoft",
                            tokenKey: "microsoft_calendar_token",
                            expiryKey: "microsoft_calendar_token_expiry"
                        }, window.location.origin);
                    }

                    // Close popup
                    setTimeout(() => {
                        console.log("[OAuth Callback] Closing popup window");
                        if (window.opener) {
                            window.close();
                        }
                    }, 500);
                } catch (error) {
                    console.error("[OAuth Callback] Error exchanging code:", error);
                    if (window.opener) {
                        window.opener.postMessage({ 
                            type: "oauth_error", 
                            error: "token_exchange_failed",
                            errorDescription: error instanceof Error ? error.message : "Failed to exchange code for token"
                        }, window.location.origin);
                    }
                }
            })();
            return;
        }

        // Handle Google Implicit flow (access token in hash)
        if (accessTokenFromHash) {
            console.log("[OAuth Callback] Processing Google access token from hash");
            
            const isGoogle = stateFromHash === "google_calendar";
            const tokenKey = "google_calendar_token";
            const expiryKey = "google_calendar_token_expiry";

            // Store the token
            localStorage.setItem(tokenKey, accessTokenFromHash);
            console.log("[OAuth Callback] Token stored in localStorage:", tokenKey);

            // Store the expiry time
            const expiresIn = hashParams.get("expires_in");
            if (expiresIn) {
                const expiryTime = Date.now() + parseInt(expiresIn) * 1000;
                localStorage.setItem(expiryKey, expiryTime.toString());
                console.log("[OAuth Callback] Token expiry set:", new Date(expiryTime).toISOString());
            }

            console.log("✅ [OAuth Callback] Google Calendar authenticated successfully");

            // Notify parent window
            if (window.opener) {
                console.log("[OAuth Callback] Notifying parent window of success");
                window.opener.postMessage({ 
                    type: "oauth_success", 
                    service: "google",
                    tokenKey,
                    expiryKey
                }, window.location.origin);
            }

            // Close popup
            setTimeout(() => {
                console.log("[OAuth Callback] Closing popup window");
                if (window.opener) {
                    window.close();
                }
            }, 500);
            return;
        }

        console.warn("[OAuth Callback] No authorization code or access token found in URL");
        if (window.opener) {
            window.opener.postMessage({ 
                type: "oauth_error", 
                error: "no_auth_data",
                errorDescription: "No authorization code or access token received from OAuth provider"
            }, window.location.origin);
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