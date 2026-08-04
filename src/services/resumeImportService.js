import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export async function importResume(file) {
  if (!isSupabaseConfigured || !supabase) throw new Error('Supabase is not configured.');
  // Keep the sizeable document parsers out of the dashboard's initial bundle.
  const { parseResumeFile } = await import('../utils/resumeParser');
  const text = await parseResumeFile(file);
  const { data, error } = await supabase.functions.invoke('import-resume', {
    body: { text, fileName: file.name },
  });
  if (error) throw new Error(data?.error || error.message || 'Resume import failed.');
  if (!data?.resume) throw new Error('The resume service returned an invalid response.');
  return data;
}
