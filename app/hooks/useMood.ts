import { useState, useCallback } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { MoodEntry, getMoodEntries, createMoodEntry, deleteMoodEntry, type MoodType } from '../services/mood';

export function useMood() {
  const { user } = useAuth();
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshHistory = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      const entries = await getMoodEntries(user.id);
      setMoodHistory(entries);
    } catch (err) {
      setError('Failed to load mood history');
      console.error('Error loading mood history:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addMoodEntry = useCallback(async (mood: MoodType, journalEntry?: string) => {
    if (!user) return;

    try {
      setError(null);
      await createMoodEntry({
        user_id: user.id,
        mood,
        journal_entry: journalEntry
      });
      await refreshHistory();
    } catch (err) {
      setError('Failed to add mood entry');
      console.error('Error adding mood entry:', err);
    }
  }, [user, refreshHistory]);

  const removeMoodEntry = useCallback(async (entryId: string) => {
    try {
      setError(null);
      await deleteMoodEntry(entryId);
      await refreshHistory();
    } catch (err) {
      setError('Failed to delete mood entry');
      console.error('Error deleting mood entry:', err);
    }
  }, [refreshHistory]);

  return {
    moodHistory,
    loading,
    error,
    addMoodEntry,
    removeMoodEntry,
    refreshHistory
  };
} 