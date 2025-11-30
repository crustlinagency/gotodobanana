Deno.serve(async (req) => {
    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    };

    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        console.log("[Exchange Microsoft Code] Function started");
        
        const { code, redirectUri } = await req.json();
        
        if (!code || !redirectUri) {
            return new Response(
                JSON.stringify({ error: "Missing code or redirectUri" }),
                {
                    status: 400,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                }
            );
        }

        const clientId = Deno.env.get("VITE_MICROSOFT_CLIENT_ID");
        const clientSecret = Deno.env.get("VITE_MICROSOFT_CLIENT_SECRET");

        if (!clientId || !clientSecret) {
            console.error("[Exchange Microsoft Code] Missing client credentials");
            return new Response(
                JSON.stringify({ error: "Microsoft credentials not configured" }),
                {
                    status: 500,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                }
            );
        }

        console.log("[Exchange Microsoft Code] Exchanging code for token");

        // Exchange the code for an access token
        const tokenResponse = await fetch(
            "https://login.microsoftonline.com/common/oauth2/v2.0/token",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    client_id: clientId,
                    client_secret: clientSecret,
                    code: code,
                    redirect_uri: redirectUri,
                    grant_type: "authorization_code",
                    scope: "Calendars.ReadWrite User.Read",
                }),
            }
        );

        if (!tokenResponse.ok) {
            const errorData = await tokenResponse.json();
            console.error("[Exchange Microsoft Code] Token exchange failed:", errorData);
            return new Response(
                JSON.stringify({ 
                    error: errorData.error_description || "Failed to exchange code for token" 
                }),
                {
                    status: 500,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                }
            );
        }

        const tokenData = await tokenResponse.json();
        console.log("[Exchange Microsoft Code] Token exchange successful");

        return new Response(
            JSON.stringify({
                access_token: tokenData.access_token,
                expires_in: tokenData.expires_in,
            }),
            {
                status: 200,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
        );
    } catch (error) {
        console.error("[Exchange Microsoft Code] Error:", error);
        return new Response(
            JSON.stringify({ error: error.message || "Failed to exchange code" }),
            {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
        );
    }
});