import { stripe, admin, userClient } from "../_shared/clients.ts";
import { json, handleOptions } from "../_shared/cors.ts";

const SITE_URL = Deno.env.get("SITE_URL")!;

Deno.serve(async (req) => {
  const preflight = handleOptions(req);
  if (preflight) return preflight;

  if (req.method !== "POST") return json(req, 405, { error: "method not allowed" });

  const { data: { user } } = await userClient(req).auth.getUser();
  if (!user) return json(req, 401, { error: "unauthorized" });

  try {
    // Always the caller's OWN customer id — never accepted from the browser.
    const { data: bc } = await admin
      .from("billing_customers")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!bc?.stripe_customer_id) {
      return json(req, 404, { error: "No billing account found for this user." });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: bc.stripe_customer_id,
      return_url: `${SITE_URL}/dashboard?tab=billing`,
    });

    return json(req, 200, { url: portalSession.url });
  } catch (err) {
    console.error("[create-customer-portal-session] error", err instanceof Error ? err.message : err);
    return json(req, 500, { error: "Could not open billing portal. Please try again." });
  }
});
