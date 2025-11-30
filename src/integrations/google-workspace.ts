import { superdevClient } from "@/lib/superdev/client";

// Google Workspace integration for calendar sync
export const googleWorkspace = {
  calendar: {
    // Check if Google Calendar is connected
    async getConnectionStatus() {
      try {
        // This would check if the user has authorized Google Calendar
        // For now, return a basic status
        const hasToken = localStorage.getItem("google_calendar_token");
        return { connected: !!hasToken };
      } catch (error) {
        console.error("Error checking connection status:", error);
        return { connected: false };
      }
    },

    // Authenticate with Google Calendar
    async authenticate() {
      try {
        // Open Google OAuth flow
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        if (!clientId) {
          throw new Error("Google Client ID not configured");
        }

        const redirectUri = `${window.location.origin}/oauth/callback`;
        const scope = "https://www.googleapis.com/auth/calendar.events";
        
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
          `client_id=${clientId}&` +
          `redirect_uri=${encodeURIComponent(redirectUri)}&` +
          `response_type=token&` +
          `scope=${encodeURIComponent(scope)}`;

        // Open popup window for OAuth
        const width = 500;
        const height = 600;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;
        
        const popup = window.open(
          authUrl,
          "Google Calendar Authorization",
          `width=${width},height=${height},left=${left},top=${top}`
        );

        // Wait for OAuth callback
        return new Promise((resolve, reject) => {
          const checkPopup = setInterval(() => {
            if (popup?.closed) {
              clearInterval(checkPopup);
              const token = localStorage.getItem("google_calendar_token");
              if (token) {
                resolve({ success: true });
              } else {
                reject(new Error("Authentication cancelled"));
              }
            }
          }, 500);
        });
      } catch (error) {
        console.error("Error authenticating with Google Calendar:", error);
        throw error;
      }
    },

    // Create a calendar event
    async createEvent(event: any) {
      try {
        const token = localStorage.getItem("google_calendar_token");
        if (!token) {
          throw new Error("Not authenticated with Google Calendar");
        }

        const response = await fetch(
          "https://www.googleapis.com/calendar/v3/calendars/primary/events",
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(event),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error?.message || "Failed to create event");
        }

        return await response.json();
      } catch (error) {
        console.error("Error creating calendar event:", error);
        throw error;
      }
    },

    // List calendar events
    async listEvents(timeMin?: string, timeMax?: string) {
      try {
        const token = localStorage.getItem("google_calendar_token");
        if (!token) {
          throw new Error("Not authenticated with Google Calendar");
        }

        const params = new URLSearchParams({
          timeMin: timeMin || new Date().toISOString(),
          timeMax: timeMax || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          singleEvents: "true",
          orderBy: "startTime",
        });

        const response = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
          {
            headers: {
              "Authorization": `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error?.message || "Failed to list events");
        }

        return await response.json();
      } catch (error) {
        console.error("Error listing calendar events:", error);
        throw error;
      }
    },
  },
};