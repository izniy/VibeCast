import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';
import type { MoodType } from '../types/mood';

type MoodEntry = Database['public']['Tables']['mood_entries']['Row'];
type CreateMoodEntryParams = Omit<MoodEntry, 'id' | 'created_at' | 'updated_at'>;

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
      
      const { data, error: fetchError } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setMoodHistory(data || []);
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
      const newEntry: CreateMoodEntryParams = {
        user_id: user.id,
        mood,
        journal_entry: journalEntry || null
      };

      const { error: insertError } = await supabase
        .from('mood_entries')
        .insert([newEntry]);

      if (insertError) throw insertError;
      await refreshHistory();
    } catch (err) {
      setError('Failed to add mood entry');
      console.error('Error adding mood entry:', err);
    }
  }, [user, refreshHistory]);

  const removeMoodEntry = useCallback(async (entryId: string) => {
    try {
      setError(null);
      const { error: deleteError } = await supabase
        .from('mood_entries')
        .delete()
        .eq('id', entryId);

      if (deleteError) throw deleteError;
      await refreshHistory();
    } catch (err) {
      setError('Failed to delete mood entry');
      console.error('Error deleting mood entry:', err);
    }
  }, [refreshHistory]);

  // Fetch mood history when the component mounts or user changes
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
    refreshHistory
  };
} 