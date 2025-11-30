// Microsoft Outlook/Office 365 Calendar Integration
// Uses Microsoft Graph API for calendar operations

import { getMicrosoftConfig } from "@/functions";

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
            const clientId = await getClientId();

            const authUrl = new URL("https://login.microsoftonline.com/common/oauth2/v2.0/authorize");
            authUrl.searchParams.append("client_id", clientId);
            authUrl.searchParams.append("response_type", "token");
            authUrl.searchParams.append("redirect_uri", REDIRECT_URI);
            authUrl.searchParams.append("scope", SCOPES);
            authUrl.searchParams.append("response_mode", "fragment");
            authUrl.searchParams.append("state", "microsoft_calendar");

            // Open authentication in popup
            const popup = window.open(
                authUrl.toString(),
                "Microsoft Calendar Authentication",
                "width=600,height=700,left=100,top=100"
            );

            if (!popup) {
                throw new Error("Popup blocked. Please allow popups for this site.");
            }

            // Wait for authentication to complete
            return new Promise((resolve, reject) => {
                const checkInterval = setInterval(() => {
                    if (popup.closed) {
                        clearInterval(checkInterval);
                        // Check if token was stored
                        const token = localStorage.getItem("microsoft_calendar_token");
                        if (token) {
                            resolve({ success: true });
                        } else {
                            reject(new Error("Authentication cancelled or failed"));
                        }
                    }
                }, 500);

                // Timeout after 5 minutes
                setTimeout(() => {
                    clearInterval(checkInterval);
                    if (!popup.closed) {
                        popup.close();
                    }
                    reject(new Error("Authentication timeout"));
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