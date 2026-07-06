// Re-export from context so all existing imports keep working.
// The actual auth state lives in AuthContext (one subscription for the whole app).
export { useAuth } from '../context/AuthContext';
