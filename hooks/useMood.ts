import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import type { MoodEntry } from '@/services/mood';
import type { MoodType } from '@/types/mood';
import type { Database } from '@/types/database';
import { supabase } from '@/lib/supabase';

export function useMood() {
  const { user } = useAuth();
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const refreshHistory = useCallback(async () => {
    if (!user?.id) {
      console.log('No user ID available for fetching mood history');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data: moodData, error: fetchError } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      if (!moodData) {
        throw new Error('No mood data received');
      }

      if (isMounted.current) {
        setMoodHistory(moodData);
      }
    } catch (err) {
      console.error('Error fetching mood history:', err);
      if (isMounted.current) {
        setError(err instanceof Error ? err.message : 'Failed to load mood history');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [user?.id]);

  const addMoodEntry = useCallback(async (mood: MoodType, journalEntry?: string) => {
    if (!user?.id) {
      console.log('No user ID available for adding mood entry');
      return;
    }

    try {
      setError(null);

      // Cast mood to mood_type enum for Supabase
      const moodValue = mood as unknown as Database['public']['Tables']['mood_entries']['Row']['mood'];

      const { error: insertError } = await supabase
        .from('mood_entries')
        .insert([{
          user_id: user.id,
          mood: moodValue,
          journal_entry: journalEntry || null
        }]);

      if (insertError) {
        throw insertError;
      }

      // Refresh to get the new entry
      await refreshHistory();
    } catch (err) {
      console.error('Error adding mood entry:', err);
      if (isMounted.current) {
        setError(err instanceof Error ? err.message : 'Failed to add mood entry');
      }
    }
  }, [user?.id, refreshHistory]);

  const removeMoodEntry = useCallback(async (entryId: string) => {
    try {
      setError(null);

      const { error: deleteError } = await supabase
        .from('mood_entries')
        .delete()
        .eq('id', entryId);

      if (deleteError) {
        throw deleteError;
      }

      await refreshHistory();
    } catch (err) {
      console.error('Error removing mood entry:', err);
      if (isMounted.current) {
        setError(err instanceof Error ? err.message : 'Failed to remove mood entry');
      }
    }
  }, [refreshHistory]);

  // Load mood history when user changes
  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  return {
    moodHistory,
    loading,
    error,
    refreshHistory,
    addMoodEntry,
    removeMoodEntry
  };
} 