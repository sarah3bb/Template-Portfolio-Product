import { useState, useEffect, useCallback } from 'react';
import { getPortfolioByUserId, createStarterPortfolio, savePortfolio } from '../services/portfolioService';

export function usePortfolio(user) {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const load = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      let data = await getPortfolioByUserId(user.id);
      if (!data) {
        data = await createStarterPortfolio(user);
      }
      setPortfolio(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  async function save(updatedData) {
    setSaving(true);
    setSaveSuccess(false);
    setError(null);
    try {
      const saved = await savePortfolio(user.id, updatedData);
      setPortfolio(saved);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      return saved;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }

  return { portfolio, loading, saving, error, saveSuccess, save, refresh: load };
}
