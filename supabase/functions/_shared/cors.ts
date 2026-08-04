const DEFAULT_ALLOWED_ORIGINS = [
  "https://template-portfolio-product.vercel.app",
  "http://localhost:5173",
];

function allowedOrigins() {
  const configured = Deno.env.get("SITE_URLS") ?? Deno.env.get("SITE_URL") ?? "";
  return new Set([
    ...DEFAULT_ALLOWED_ORIGINS,
    ...configured.split(",").map((origin) => origin.trim()).filter(Boolean),
  ]);
}

export function corsHeaders(req: Request) {
  const origin = req.headers.get("Origin") ?? "";
  const allowedOrigin = allowedOrigins().has(origin)
    ? origin
    : DEFAULT_ALLOWED_ORIGINS[0];

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

export function json(req: Request, status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(req), "Content-Type": "application/json" },
  });
}

export function handleOptions(req: Request): Response | null {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders(req) });
  }
  return null;
}
