import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

function requireSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured. Add your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.');
  }
}

// Reads go straight to the RLS-protected tables via the anon-key client —
// safe, since select policies only ever return the caller's own rows.
// Writes to these tables only ever happen server-side (Stripe webhook /
// Edge Functions with the service role key), never from this file.

export async function getSubscription(userId) {
  requireSupabase();
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data; // null if the user has never subscribed
}

export async function getTrialHistory(userId) {
  requireSupabase();
  const { data, error } = await supabase
    .from('trial_history')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data; // null if the user has never started a trial
}

export async function getSpecialAccessRows(userId) {
  requireSupabase();
  const { data, error } = await supabase
    .from('special_access')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;
  return data || [];
}

// The Edge Functions below all attach the caller's session JWT
// automatically via supabase.functions.invoke() — no manual header
// plumbing needed here.

export async function startCheckout(nonce) {
  requireSupabase();
  const { data, error } = await supabase.functions.invoke('create-checkout-session', {
    body: { nonce },
  });
  if (error) throw new Error(error.message || 'Could not start checkout.');
  if (!data?.url) throw new Error(data?.error || 'Could not start checkout.');
  return data; // { url, trialDays }
}

export async function openBillingPortal() {
  requireSupabase();
  const { data, error } = await supabase.functions.invoke('create-customer-portal-session', {
    body: {},
  });
  if (error) throw new Error(error.message || 'Could not open billing portal.');
  if (!data?.url) throw new Error(data?.error || 'Could not open billing portal.');
  return data.url;
}

export async function redeemAccessCode(code) {
  requireSupabase();
  const { data, error } = await supabase.functions.invoke('redeem-access-code', {
    body: { code },
  });
  if (error) throw new Error(error.message || 'Something went wrong.');
  return data; // { success, message }
}
