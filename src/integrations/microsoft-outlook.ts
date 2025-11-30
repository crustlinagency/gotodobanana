// Microsoft Outlook/Office 365 Calendar Integration
// Uses Microsoft Graph API for calendar operations

import { getMicrosoftConfig, exchangeMicrosoftCode } from "@/functions";

const REDIRECT_URI = `${window.location.origin}/oauth/callback`;
const SCOPES = "Calendars.ReadWrite User.Read";

// Cache the client ID after first fetch
let cachedClientId: string | null = null;

async function getClientId(): Promise<string> {
    if (cachedClientId) {
        return cachedClientId;
    }

    try {
        const response = await getMicrosoftConfig();
        if (!response.clientId) {
            throw new Error("Microsoft Client ID not configured in backend");
        }
        cachedClientId = response.clientId;
        return cachedClientId;
    } catch (error) {
        throw new Error("Failed to get Microsoft Client ID. Please ensure VITE_MICROSOFT_CLIENT_ID is set in your backend secrets.");
    }
}

export const microsoftOutlook = {
    calendar: {
        /**
         * Initiate OAuth 2.0 authentication flow with Microsoft
         */
        authenticate: async () => {
            console.log("[Microsoft Auth] Starting authentication flow");
            const clientId = await getClientId();
            console.log("[Microsoft Auth] Client ID retrieved");

            const authUrl = new URL("https://login.microsoftonline.com/common/oauth2/v2.0/authorize");
            authUrl.searchParams.append("client_id", clientId);
            authUrl.searchParams.append("response_type", "code"); // Changed from "token" to "code"
            authUrl.searchParams.append("redirect_uri", REDIRECT_URI);
            authUrl.searchParams.append("scope", SCOPES);
            authUrl.searchParams.append("response_mode", "query"); // Changed from "fragment" to "query"
            authUrl.searchParams.append("state", "microsoft_calendar");

            console.log("[Microsoft Auth] Auth URL:", authUrl.toString());

            // Open authentication in popup
            const popup = window.open(
                authUrl.toString(),
                "Microsoft Calendar Authentication",
                "width=600,height=700,left=100,top=100"
            );

            if (!popup) {
                console.error("[Microsoft Auth] Popup blocked");
                throw new Error("Popup blocked. Please allow popups for this site.");
            }

            console.log("[Microsoft Auth] Popup opened, waiting for response");

            // Wait for authentication to complete
            return new Promise((resolve, reject) => {
                let messageReceived = false;

                // Listen for messages from the popup window
                const messageHandler = (event: MessageEvent) => {
                    // Verify the message is from our origin
                    if (event.origin !== window.location.origin) {
                        console.warn("[Microsoft Auth] Received message from unknown origin:", event.origin);
                        return;
                    }

                    console.log("[Microsoft Auth] Received message:", event.data);

                    if (event.data.type === "oauth_success" && event.data.service === "microsoft") {
                        messageReceived = true;
                        console.log("✅ [Microsoft Auth] Authentication successful via message");
                        window.removeEventListener("message", messageHandler);
                        clearInterval(checkInterval);
                        clearTimeout(timeout);
                        resolve({ success: true });
                    } else if (event.data.type === "oauth_error") {
                        messageReceived = true;
                        console.error("[Microsoft Auth] Authentication error via message:", event.data.error, event.data.errorDescription);
                        window.removeEventListener("message", messageHandler);
                        clearInterval(checkInterval);
                        clearTimeout(timeout);
                        reject(new Error(event.data.errorDescription || event.data.error || "Authentication failed"));
                    }
                };

                window.addEventListener("message", messageHandler);

                // Fallback: Check popup closed and localStorage (in case message doesn't work)
                const checkInterval = setInterval(() => {
                    if (popup.closed) {
                        console.log("[Microsoft Auth] Popup closed");
                        clearInterval(checkInterval);
                        
                        // Small delay to ensure localStorage is updated
                        setTimeout(() => {
                            if (!messageReceived) {
                                window.removeEventListener("message", messageHandler);
                                clearTimeout(timeout);
                                
                                // Check if token was stored
                                const token = localStorage.getItem("microsoft_calendar_token");
                                console.log("[Microsoft Auth] Checking localStorage, token found:", !!token);
                                
                                if (token) {
                                    console.log("✅ [Microsoft Auth] Authentication successful via localStorage");
                                    resolve({ success: true });
                                } else {
                                    console.error("[Microsoft Auth] No token found, authentication cancelled or failed");
                                    reject(new Error("Authentication cancelled or failed. Please try again."));
                                }
                            }
                        }, 100);
                    }
                }, 500);

                // Timeout after 5 minutes
                const timeout = setTimeout(() => {
                    console.error("[Microsoft Auth] Authentication timeout");
                    window.removeEventListener("message", messageHandler);
                    clearInterval(checkInterval);
                    if (!popup.closed) {
                        popup.close();
                    }
                    reject(new Error("Authentication timeout. Please try again."));
                }, 300000);
            });
        },

        /**
         * Check if user has connected Microsoft Calendar
         */
        getConnectionStatus: async () => {
            const token = localStorage.getItem("microsoft_calendar_token");
            const expiryStr = localStorage.getItem("microsoft_calendar_token_expiry");

            if (!token) {
                return { connected: false };
            }

            // Check if token is expired
            if (expiryStr) {
                const expiry = parseInt(expiryStr);
                if (Date.now() > expiry) {
                    // Token expired, clear it
                    localStorage.removeItem("microsoft_calendar_token");
                    localStorage.removeItem("microsoft_calendar_token_expiry");
                    return { connected: false, expired: true };
                }
            }

            return { connected: true };
        },

        /**
         * Create a calendar event in Outlook
         */
        createEvent: async (event: {
            summary: string;
            description?: string;
            start: {
                dateTime: string;
                timeZone: string;
            };
            end: {
                dateTime: string;
                timeZone: string;
            };
        }) => {
            const token = localStorage.getItem("microsoft_calendar_token");
            if (!token) {
                throw new Error("Not authenticated with Microsoft Calendar");
            }

            // Transform to Microsoft Graph API format
            const graphEvent = {
                subject: event.summary,
                body: {
                    contentType: "HTML",
                    content: event.description || "",
                },
                start: {
                    dateTime: event.start.dateTime,
                    timeZone: event.start.timeZone,
                },
                end: {
                    dateTime: event.end.dateTime,
                    timeZone: event.end.timeZone,
                },
                isReminderOn: true,
                reminderMinutesBeforeStart: 15,
            };

            const response = await fetch(
                "https://graph.microsoft.com/v1.0/me/calendar/events",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(graphEvent),
                }
            );

            if (!response.ok) {
                const error = await response.json();
                console.error("Microsoft Graph API error:", error);
                throw new Error(error.error?.message || "Failed to create calendar event");
            }

            return await response.json();
        },

        /**
         * List calendar events
         */
        listEvents: async (maxResults = 10) => {
            const token = localStorage.getItem("microsoft_calendar_token");
            if (!token) {
                throw new Error("Not authenticated with Microsoft Calendar");
            }

            const response = await fetch(
                `https://graph.microsoft.com/v1.0/me/calendar/events?$top=${maxResults}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || "Failed to fetch calendar events");
            }

            return await response.json();
        },

        /**
         * Disconnect Microsoft Calendar
         */
        disconnect: () => {
            localStorage.removeItem("microsoft_calendar_token");
            localStorage.removeItem("microsoft_calendar_token_expiry");
        },
    },
};