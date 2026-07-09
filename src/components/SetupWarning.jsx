import React from 'react';

export default function SetupWarning() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f172a',
      color: '#f1f5f9',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
      padding: '2rem',
    }}>
      <div style={{ maxWidth: '600px', width: '100%' }}>
        <div style={{
          background: '#422006',
          border: '1px solid #92400e',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '2rem',
        }}>
          <h2 style={{ color: '#fbbf24', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
            Supabase is not configured yet
          </h2>
          <p style={{ color: '#fcd34d', fontSize: '0.9rem', margin: 0 }}>
            The app is running but cannot connect to a database. Follow the steps below to finish setup.
          </p>
        </div>

        <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#e2e8f0' }}>
          Setup steps
        </h3>

        <ol style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <li style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.6' }}>
            Create a free project at{' '}
            <a href="https://supabase.com" target="_blank" rel="noreferrer"
              style={{ color: '#818cf8' }}>supabase.com</a>
          </li>
          <li style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.6' }}>
            Open your project → <strong style={{ color: '#e2e8f0' }}>SQL Editor</strong> → paste the contents of{' '}
            <code style={{ background: '#1e293b', padding: '0 4px', borderRadius: '4px', color: '#a5b4fc' }}>supabase/schema.sql</code>{' '}
            and click Run
          </li>
          <li style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.6' }}>
            Go to <strong style={{ color: '#e2e8f0' }}>Project Settings → API</strong> and copy your{' '}
            <strong style={{ color: '#e2e8f0' }}>Project URL</strong> and{' '}
            <strong style={{ color: '#e2e8f0' }}>anon public key</strong>
          </li>
          <li style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.6' }}>
            Create a file called{' '}
            <code style={{ background: '#1e293b', padding: '0 4px', borderRadius: '4px', color: '#a5b4fc' }}>.env</code>{' '}
            in the root of this project with:
            <pre style={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              padding: '1rem',
              marginTop: '0.5rem',
              fontSize: '0.8rem',
              color: '#86efac',
              whiteSpace: 'pre-wrap',
            }}>
{`VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here`}
            </pre>
          </li>
          <li style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.6' }}>
            Restart the dev server: <code style={{ background: '#1e293b', padding: '0 4px', borderRadius: '4px', color: '#a5b4fc' }}>npm run dev</code>
          </li>
        </ol>

        <div style={{
          marginTop: '2rem',
          background: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '8px',
          padding: '1rem',
          fontSize: '0.8rem',
          color: '#64748b',
        }}>
          This screen will disappear automatically once your .env file is set up correctly.
        </div>
      </div>
    </div>
  );
}
