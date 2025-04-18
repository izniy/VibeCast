import { useState, useEffect } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { MoodEntry, getMoodHistory, createMoodEntry, deleteMoodEntry } from '../services/mood';

export const useMood = () => {
  const { user } = useAuth();
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMoodHistory = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      const history = await getMoodHistory(user.id);
      setMoodHistory(history);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch mood history');
    } finally {
      setLoading(false);
    }
  };

  const addMoodEntry = async (mood: string, entry?: string) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const newEntry = await createMoodEntry(user.id, mood, entry);
      setMoodHistory(prev => [newEntry, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create mood entry');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeMoodEntry = async (entryId: string) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      await deleteMoodEntry(user.id, entryId);
      setMoodHistory(prev => prev.filter(entry => entry.id !== entryId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete mood entry');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMoodHistory();
    }
  }, [user]);

  return {
    moodHistory,
    loading,
    error,
    addMoodEntry,
    removeMoodEntry,
    refreshHistory: fetchMoodHistory,
  };
}; 