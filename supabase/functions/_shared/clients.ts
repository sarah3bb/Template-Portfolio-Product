import Stripe from "npm:stripe@17";
import { createClient } from "npm:@supabase/supabase-js@2";

export const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2024-06-20",
  // Deno has no Node `http` module — Stripe's SDK needs an explicit fetch-based client.
  httpClient: Stripe.createFetchHttpClient(),
});

// Service-role client: bypasses RLS entirely. Only ever used server-side,
// inside Edge Functions, never exposed to the browser.
export const admin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// Client scoped to the caller's own JWT — used only to resolve the
// authenticated user server-side via auth.getUser(). Never trust a
// user id supplied directly by the client in a request body.
export function userClient(req: Request) {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } } }
  );
}
