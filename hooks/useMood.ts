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
  const lastRefreshTime = useRef<number>(0);
  const pendingRefresh = useRef<boolean>(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
      pendingRefresh.current = false;
    };
  }, []);

  // Track user ID changes and trigger refresh
  useEffect(() => {
    if (initialized && user?.id) {
      if (user.id !== currentUserId.current) {
        console.log('👤 User ID changed, triggering refresh:', {
          from: currentUserId.current || 'none',
          to: user.id,
          initialized,
          hasHistory: moodHistory.length > 0
        });
        currentUserId.current = user.id;
        refreshHistory(true).catch(console.error);
      }
    } else if (!user?.id && currentUserId.current) {
      console.log('👤 User logged out, clearing history');
      currentUserId.current = null;
      setMoodHistory([]);
    }
  }, [user?.id, initialized]);

  const refreshHistory = useCallback(async (force = false) => {
    const userId = user?.id;
    if (!initialized) {
      console.log('⏭️ Skipping refresh - auth not initialized:', {
        initialized,
        hasUser: !!user,
        userId
      });
      return;
    }

    if (!userId) {
      console.log('⏭️ Skipping refresh - no user ID');
      setMoodHistory([]);
      return;
    }

    // Debounce refreshes unless forced
    const now = Date.now();
    if (!force && now - lastRefreshTime.current < 1000) {
      console.log('⏭️ Debouncing refresh - too soon:', {
        timeSinceLastRefresh: now - lastRefreshTime.current,
        userId
      });
      return;
    }

    try {
      if (isMounted.current) {
        setLoading(true);
        setError(null);
      }

      console.log('🔄 Refreshing mood history...', {
        userId,
        force,
        lastRefresh: new Date(lastRefreshTime.current).toISOString(),
        pendingRefresh: pendingRefresh.current
      });

      const entries = await getMoodEntries(userId);
      lastRefreshTime.current = now;
      pendingRefresh.current = false;

      if (isMounted.current) {
        setMoodHistory(entries);
        console.log('✅ Loaded mood entries:', {
          count: entries.length,
          userId,
          firstEntryId: entries[0]?.id
        });
      }
    } catch (err) {
      console.error('❌ Error refreshing mood history:', err);
      if (isMounted.current) {
        setError('Failed to load mood history');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [initialized, user]);

  const addMoodEntry = useCallback(async (mood: MoodType, journal_entry?: string) => {
    const userId = user?.id;
    if (!initialized) {
      console.warn('⚠️ Cannot add mood entry - auth not initialized');
      return;
    }

    if (!userId) {
      console.error('❌ Cannot add mood entry - no user ID');
      setError('You must be logged in to log moods');
      return;
    }

    try {
      setError(null);
      console.log('📝 Adding mood entry...', {
        mood,
        userId,
        initialized,
        currentHistory: moodHistory.length
      });

      const newEntry = await createMoodEntry({
        user_id: userId,
        mood,
        journal_entry,
      });

      console.log('✅ Created new mood entry:', {
        id: newEntry.id,
        mood: newEntry.mood,
        created_at: newEntry.created_at,
        userId
      });

      // Immediately update local state
      if (isMounted.current) {
        setMoodHistory(prev => [newEntry, ...prev]);
      }

      // Force refresh to ensure consistency
      await refreshHistory(true);

    } catch (err) {
      console.error('❌ Error adding mood entry:', err);
      if (isMounted.current) {
        setError('Failed to add mood entry');
      }
    }
  }, [initialized, user, refreshHistory]);

  const removeMoodEntry = useCallback(async (entryId: string) => {
    if (!user?.id) {
      console.error('❌ Cannot remove mood entry - no user ID');
      return;
    }

    try {
      setError(null);
      
      // Optimistic update
      setMoodHistory(prev => prev.filter(entry => entry.id !== entryId));
      
      await deleteMoodEntry(entryId);
      
      // Refresh to ensure consistency
      await refreshHistory(true);
    } catch (err) {
      console.error('❌ Error removing mood entry:', err);
      if (isMounted.current) {
        setError('Failed to remove mood entry');
        // Revert optimistic update on error
        await refreshHistory(true);
      }
    }
  }, [user, refreshHistory]);

  return {
    moodHistory,
    loading,
    error,
    refreshHistory,
    addMoodEntry,
    removeMoodEntry,
  };
} 