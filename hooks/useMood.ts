import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

export interface MoodEntry {
  id: string;
  user_id: string;
  mood: string;
  journal_entry?: string;
  created_at: string;
}

export type Mood = 'Happy' | 'Excited' | 'Relaxed' | 'Sad' | 'Angry' | 'Anxious';

export const useMood = () => {
  const { user } = useAuth();
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshHistory = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setMoodHistory(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch mood history');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addMoodEntry = async (mood: Mood, journalEntry?: string) => {
    if (!user) {
      setError('User must be logged in to add mood entries');
      return null;
    }

    try {
      setError(null);
      const newEntry = {
        user_id: user.id,
        mood,
        journal_entry: journalEntry,
      };

      const { data, error: insertError } = await supabase
        .from('mood_entries')
        .insert([newEntry])
        .select()
        .single();

      if (insertError) throw insertError;

      setMoodHistory(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add mood entry');
      return null;
    }
  };

  const removeMoodEntry = async (entryId: string) => {
    if (!user) {
      setError('User must be logged in to remove mood entries');
      return false;
    }

    try {
      setError(null);
      const { error: deleteError } = await supabase
        .from('mood_entries')
        .delete()
        .eq('id', entryId)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      setMoodHistory(prev => prev.filter(entry => entry.id !== entryId));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove mood entry');
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      refreshHistory();
    } else {
      setMoodHistory([]);
    }
  }, [user, refreshHistory]);

  return {
    moodHistory,
    loading,
    error,
    addMoodEntry,
    removeMoodEntry,
    refreshHistory,
  };
}; 