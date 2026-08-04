import { admin, userClient } from "../_shared/clients.ts";
import { json, handleOptions } from "../_shared/cors.ts";

// Never stored in the database — combined with the plaintext code before
// hashing, so a database dump alone can't be rainbow-tabled.
const PEPPER = Deno.env.get("ACCESS_CODE_PEPPER") ?? "";

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX_ATTEMPTS = 10;

// Always the same generic message, regardless of which failure mode
// actually occurred server-side — never reveal whether a guessed code
// exists, is expired, is exhausted, or was already redeemed.
const GENERIC_FAILURE = "That code is invalid or has already been used.";

async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req) => {
  const preflight = handleOptions(req);
  if (preflight) return preflight;

  if (req.method !== "POST") return json(req, 405, { success: false, message: GENERIC_FAILURE });

  const { data: { user } } = await userClient(req).auth.getUser();
  if (!user) return json(req, 401, { success: false, message: GENERIC_FAILURE });

  const body = await req.json().catch(() => ({}));
  const code = typeof body.code === "string" ? body.code.trim() : "";
  if (!code || code.length > 100) {
    return json(req, 200, { success: false, message: GENERIC_FAILURE });
  }

  // Per-user rate limit, using the redemption log already required for
  // audit — reduces brute-force attempts without a separate table.
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
  const { count } = await admin
    .from("access_code_redemptions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("redeemed_at", windowStart);

  if ((count ?? 0) >= RATE_LIMIT_MAX_ATTEMPTS) {
    return json(req, 429, { success: false, message: "Too many attempts. Please try again later." });
  }

  try {
    const codeHash = await sha256Hex(PEPPER + code);
    const { data, error } = await admin.rpc("redeem_access_code", {
      p_code_hash: codeHash,
      p_user_id: user.id,
    });

    if (error) {
      console.error("[redeem-access-code] rpc error", error.message);
      return json(req, 500, { success: false, message: "Something went wrong. Please try again." });
    }

    const success = !!(data as { success?: boolean } | null)?.success;
    return json(req, 200, {
      success,
      message: success ? "Access code redeemed!" : GENERIC_FAILURE,
    });
  } catch (err) {
    console.error("[redeem-access-code] error", err instanceof Error ? err.message : err);
    return json(req, 500, { success: false, message: "Something went wrong. Please try again." });
  }
});
