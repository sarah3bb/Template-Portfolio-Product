import { useState, useEffect } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// To enable Google Places autocomplete:
//
//   1. Go to https://console.cloud.google.com
//   2. Create a project, then enable "Places API" and "Maps JavaScript API"
//   3. Create an API key under Credentials
//   4. Add the key to your .env file:
//        VITE_GOOGLE_MAPS_API_KEY=your-real-api-key-here
//   5. Restart the dev server: npm run dev
//
// Without a key the location field works as a plain text input.
// ─────────────────────────────────────────────────────────────────────────────

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export const isGooglePlacesConfigured =
  Boolean(GOOGLE_API_KEY) &&
  GOOGLE_API_KEY !== 'your-google-places-api-key';

let loadPromise = null;

function loadGoogleMaps() {
  if (window.google?.maps?.places) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const callbackName = '__googleMapsReady';
    window[callbackName] = resolve;

    const script = document.createElement('script');
    script.id = 'google-maps-places-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&libraries=places&callback=${callbackName}`;
    script.async = true;
    script.defer = true;
    script.onerror = reject;
    document.head.appendChild(script);
  });

  return loadPromise;
}

export function useGooglePlaces() {
  const [ready, setReady] = useState(
    typeof window !== 'undefined' && !!window.google?.maps?.places
  );

  useEffect(() => {
    if (!isGooglePlacesConfigured || ready) return;

    loadGoogleMaps()
      .then(() => setReady(true))
      .catch(() => {
        // Script failed — we fall back to plain text input gracefully
      });
  }, [ready]);

  return ready;
}
