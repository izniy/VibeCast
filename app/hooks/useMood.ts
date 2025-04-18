import { useState } from 'react';
import { MoodEntry } from '../services/mood';
import * as moodService from '../services/mood';

export function useMood() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function logMood(userId: string, mood: string, journal: string) {
    setLoading(true);
    setError(null);
    try {
      const { error } = await moodService.logMoodEntry(userId, mood, journal);
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log mood');
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function getMoodHistory(userId: string): Promise<MoodEntry[]> {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await moodService.getMoodLogs(userId);
      if (error) throw error;
      return data || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch mood history');
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function deleteMood(userId: string, moodId: string) {
    setLoading(true);
    setError(null);
    try {
      const { error } = await moodService.deleteMoodLog(userId, moodId);
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete mood entry');
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return {
    loading,
    error,
    logMood,
    getMoodHistory,
    deleteMood
  };
} 