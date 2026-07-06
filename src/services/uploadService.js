import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

function requireSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured. Add your credentials to your .env file.');
  }
}

const BUCKET = 'portfolio-assets';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_RESUME_TYPES = ['application/pdf'];

export function validateImageFile(file) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return 'Please upload a JPG, PNG, WebP, or GIF image.';
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'Image must be smaller than 5 MB.';
  }
  return null;
}

export function validateResumeFile(file) {
  if (!ALLOWED_RESUME_TYPES.includes(file.type)) {
    return 'Please upload a PDF file for your resume.';
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'Resume must be smaller than 5 MB.';
  }
  return null;
}

// Upload a file and return its public URL
export async function uploadFile(userId, folder, file) {
  requireSupabase();
  const ext = file.name.split('.').pop();
  const timestamp = Date.now();
  const path = `${userId}/${folder}/${timestamp}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

// Delete a file by its full public URL
export async function deleteFileByUrl(publicUrl) {
  try {
    const url = new URL(publicUrl);
    // Extract path after /storage/v1/object/public/portfolio-assets/
    const marker = `/object/public/${BUCKET}/`;
    const idx = url.pathname.indexOf(marker);
    if (idx === -1) return;
    const path = decodeURIComponent(url.pathname.slice(idx + marker.length));
    await supabase.storage.from(BUCKET).remove([path]);
  } catch {
    // Silently ignore delete errors — the upload still succeeded
  }
}
