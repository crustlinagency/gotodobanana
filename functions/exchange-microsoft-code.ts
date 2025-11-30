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
        
        const { code, redirectUri, codeVerifier } = await req.json();
        
        if (!code || !redirectUri || !codeVerifier) {
            return new Response(
                JSON.stringify({ error: "Missing code, redirectUri, or codeVerifier" }),
                {
                    status: 400,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                }
            );
        }

        const clientId = Deno.env.get("VITE_MICROSOFT_CLIENT_ID");

        if (!clientId) {
            console.error("[Exchange Microsoft Code] Missing client ID");
            return new Response(
                JSON.stringify({ error: "Microsoft Client ID not configured" }),
                {
                    status: 500,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                }
            );
        }

        console.log("[Exchange Microsoft Code] Exchanging code for token with PKCE");

        // Exchange the code for an access token with PKCE (no client secret needed)
        const tokenResponse = await fetch(
            "https://login.microsoftonline.com/common/oauth2/v2.0/token",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    client_id: clientId,
                    code: code,
                    redirect_uri: redirectUri,
                    grant_type: "authorization_code",
                    code_verifier: codeVerifier,
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