import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import defaultPortfolio from '../data/defaultPortfolio';

function requireSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured. Add your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.');
  }
}

// Fetch a published portfolio by slug (used by public /p/:slug page)
export async function getPortfolioBySlug(slug) {
  requireSupabase();
  const { data, error } = await supabase
    .from('portfolios')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single();

  if (error) throw error;
  return data;
}

// Fetch the logged-in user's portfolio
export async function getPortfolioByUserId(userId) {
  requireSupabase();
  const { data, error } = await supabase
    .from('portfolios')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data; // null if no portfolio yet
}

// Create a new starter portfolio for a new user
export async function createStarterPortfolio(user) {
  requireSupabase();
  const slug = generateSlug(user.email, user.user_metadata?.full_name);
  const uniqueSlug = await ensureUniqueSlug(slug);

  const starterData = {
    ...defaultPortfolio,
    user_id: user.id,
    slug: uniqueSlug,
    email: user.email,
    first_name: user.user_metadata?.full_name?.split(' ')[0] || 'Your',
    last_name: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || 'Name',
    typewriter_text: defaultPortfolio.typewriter_text,
  };

  const { data, error } = await supabase
    .from('portfolios')
    .insert(starterData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Save portfolio changes — update by id if the record already exists, otherwise insert
export async function savePortfolio(userId, portfolioData) {
  requireSupabase();
  const { id, created_at, ...rest } = portfolioData;

  const payload = {
    ...rest,
    user_id: userId,
    updated_at: new Date().toISOString(),
  };

  let query;
  if (id) {
    query = supabase
      .from('portfolios')
      .update(payload)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();
  } else {
    query = supabase
      .from('portfolios')
      .insert({ ...payload, user_id: userId })
      .select()
      .single();
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// Check if a slug is available (excluding the current user's own slug)
export async function checkSlugAvailable(slug, currentUserId) {
  if (!isSupabaseConfigured) return false;
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) return false;

  const { data } = await supabase
    .from('portfolios')
    .select('user_id')
    .eq('slug', slug)
    .maybeSingle();

  if (!data) return true;
  return data.user_id === currentUserId;
}

// ---- helpers ----

function generateSlug(email = '', fullName = '') {
  if (fullName) {
    return fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }
  return email.split('@')[0].toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function ensureUniqueSlug(base) {
  let slug = base;
  let counter = 1;

  while (true) {
    const { data } = await supabase
      .from('portfolios')
      .select('id')
      .eq('slug', slug)
      .maybeSingle(); // was .single() — threw when no rows found

    if (!data) return slug;
    slug = `${base}-${counter}`;
    counter++;
  }
}
