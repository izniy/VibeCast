import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { createMoodEntry, getMoodEntries, deleteMoodEntry, type MoodEntry } from '@/services/mood';
import type { MoodType } from '@/types/mood';
import type { Database } from '@/types/database';
import { supabase } from '@/lib/supabase';

export function useMood() {
  const { user, initialized } = useAuth();
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);
  const currentUserId = useRef<string | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Track user ID changes
  useEffect(() => {
    if (user?.id !== currentUserId.current) {
      console.log('👤 User ID changed:', {
        from: currentUserId.current || 'none',
        to: user?.id || 'none'
      });
      currentUserId.current = user?.id || null;
    }
  }, [user?.id]);

  const refreshHistory = useCallback(async (force = false) => {
    // Wait for auth to be initialized
    if (!initialized) {
      console.log('⏳ Auth not initialized yet, skipping refresh');
      return;
    }

    if (!user?.id) {
      console.log('❌ No user ID available for fetching mood history');
      return;
    }

    console.log('\n=== Refreshing Mood History ===');
    console.log('👤 User ID:', user.id);
    console.log('📊 Current History Length:', moodHistory.length);
    console.log('🔄 Force Refresh:', force);

    try {
      setLoading(true);
      setError(null);

      const entries = await getMoodEntries(user.id);

      if (isMounted.current) {
        console.log('✅ Mood history fetched:', {
          count: entries.length,
          latest: entries[0]?.created_at || 'none',
          userId: user.id
        });
        setMoodHistory(entries);
        console.log('📝 State updated with new history, length:', entries.length);
      }
    } catch (err) {
      console.error('❌ Error fetching mood history:', err);
      if (isMounted.current) {
        setError(err instanceof Error ? err.message : 'Failed to load mood history');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
      console.log('=== End Mood History Refresh ===\n');
    }
  }, [initialized, user?.id, moodHistory.length]);

  const addMoodEntry = useCallback(async (mood: MoodType, journalEntry?: string) => {
    // Wait for auth to be initialized
    if (!initialized) {
      console.error('❌ Cannot add mood entry - auth not initialized');
      return;
    }

    if (!user?.id) {
      console.error('❌ Cannot add mood entry - no user ID available');
      return;
    }

    console.log('\n=== Adding Mood Entry ===');
    console.log('👤 User ID:', user.id);
    console.log('🎭 Mood:', mood);
    console.log('📊 Current History Length:', moodHistory.length);

    try {
      setError(null);
      setLoading(true);

      // Create the new entry
      const newEntry = await createMoodEntry({
        user_id: user.id,
        mood: mood,
        journal_entry: journalEntry
      });

      console.log('✅ Mood entry created:', {
        id: newEntry.id,
        mood: newEntry.mood,
        timestamp: newEntry.created_at,
        userId: newEntry.user_id
      });

      // Immediately update the local state
      if (isMounted.current) {
        const updatedHistory = [newEntry, ...moodHistory];
        console.log('📝 Updating local state:', {
          newLength: updatedHistory.length,
          addedEntry: newEntry.id
        });
        setMoodHistory(updatedHistory);
      }

      // Refresh to ensure we're in sync with the server
      await refreshHistory(true);
    } catch (err) {
      console.error('❌ Error adding mood entry:', err);
      if (isMounted.current) {
        setError(err instanceof Error ? err.message : 'Failed to add mood entry');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
      console.log('=== End Add Mood Entry ===\n');
    }
  }, [initialized, user?.id, moodHistory, refreshHistory]);

  const removeMoodEntry = useCallback(async (entryId: string) => {
    if (!initialized || !user?.id) {
      console.error('❌ Cannot remove mood entry - auth not ready or no user ID');
      return;
    }

    console.log('\n=== Removing Mood Entry ===');
    console.log('👤 User ID:', user.id);
    console.log('📝 Entry ID:', entryId);
    console.log('📊 Current History Length:', moodHistory.length);

    try {
      setError(null);
      setLoading(true);

      // Optimistically update local state
      const updatedHistory = moodHistory.filter(entry => entry.id !== entryId);
      console.log('📝 Updating local state:', {
        oldLength: moodHistory.length,
        newLength: updatedHistory.length
      });
      setMoodHistory(updatedHistory);

      // Delete from server
      await deleteMoodEntry(entryId);
      console.log('✅ Mood entry deleted successfully');

      // Refresh to ensure we're in sync
      await refreshHistory(true);
    } catch (err) {
      console.error('❌ Error removing mood entry:', err);
      if (isMounted.current) {
        setError(err instanceof Error ? err.message : 'Failed to remove mood entry');
        // Revert optimistic update on error
        await refreshHistory(true);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
      console.log('=== End Remove Mood Entry ===\n');
    }
  }, [initialized, user?.id, moodHistory, refreshHistory]);

  // Refresh history when auth is initialized or user changes
  useEffect(() => {
    console.log('\n=== Auth/User State Change ===');
    console.log('🔑 Auth Initialized:', initialized);
    console.log('👤 User ID:', user?.id || 'none');
    console.log('📊 Current History Length:', moodHistory.length);

    if (initialized) {
      if (user?.id) {
        console.log('🔄 Refreshing history for user');
        refreshHistory(true);
      } else {
        console.log('🧹 Clearing mood history - no user');
        setMoodHistory([]);
        setError(null);
      }
    }
    console.log('=== End Auth/User State Change ===\n');
  }, [initialized, user?.id, refreshHistory]);

  return {
    moodHistory,
    loading,
    error,
    refreshHistory,
    addMoodEntry,
    removeMoodEntry
  };
} 