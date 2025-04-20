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

  // Track user ID changes
  useEffect(() => {
    if (user?.id !== currentUserId.current) {
      console.log('👤 User ID changed:', {
        from: currentUserId.current || 'none',
        to: user?.id || 'none',
        initialized,
        hasHistory: moodHistory.length > 0
      });
      currentUserId.current = user?.id || null;
    }
  }, [user?.id, initialized, moodHistory.length]);

  const refreshHistory = useCallback(async (force = false) => {
    const userId = user?.id;
    if (!initialized || !userId) {
      console.log('⏭️ Skipping refresh - auth not ready:', {
        initialized,
        hasUser: !!user,
        userId
      });
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

      if (isMounted.current) {
        // Optimistic update
        setMoodHistory((prev) => {
          const updated = [newEntry, ...prev];
          console.log('📊 Updated mood history (optimistic):', {
            previousCount: prev.length,
            newCount: updated.length,
            newEntryId: newEntry.id,
            userId
          });
          return updated;
        });

        // Poll until the entry is visible in Supabase queries
        const pollUntilVisible = async () => {
          const maxAttempts = 5;
          let attempts = 0;

          console.log('🔄 Starting visibility polling for new entry:', {
            entryId: newEntry.id,
            maxAttempts,
            userId
          });

          while (attempts < maxAttempts && isMounted.current) {
            console.log(`📡 Polling attempt ${attempts + 1}/${maxAttempts}...`);
            
            try {
              const latest = await getMoodEntries(userId);
              if (latest.some(entry => entry.id === newEntry.id)) {
                console.log('🟢 Entry is now visible in Supabase query:', {
                  entryId: newEntry.id,
                  attempt: attempts + 1,
                  totalEntries: latest.length
                });
                
                if (isMounted.current) {
                  setMoodHistory(latest);
                  pendingRefresh.current = false;
                }
                return;
              }
              
              console.log('⏳ Entry not yet visible, waiting 1000ms...');
              await new Promise(res => setTimeout(res, 1000));
              attempts++;
            } catch (err) {
              console.error('❌ Error during polling:', err);
              attempts++;
            }
          }

          if (attempts === maxAttempts) {
            console.warn('⚠️ Mood entry still not visible after polling. Forcing refresh.', {
              entryId: newEntry.id,
              attempts,
              userId
            });
            
            if (isMounted.current) {
              await refreshHistory(true);
            }
          }
        };

        // Start polling
        pollUntilVisible().catch(err => {
          console.error('❌ Error in pollUntilVisible:', err);
          if (isMounted.current) {
            refreshHistory(true);
          }
        });
      }
    } catch (err) {
      console.error('❌ Error adding mood entry:', err);
      setError('Failed to save mood entry');
    }
  }, [initialized, user, refreshHistory]);

  const removeMoodEntry = useCallback(async (entryId: string) => {
    const userId = user?.id;
    if (!userId) {
      console.error('Cannot remove mood entry - no user ID');
      setError('You must be logged in to remove moods');
      return;
    }

    try {
      setError(null);
      console.log('🗑️ Removing mood entry...', { entryId, userId });

      // Optimistic update
      setMoodHistory((prev) => {
        const updated = prev.filter(entry => entry.id !== entryId);
        console.log('📊 Updated mood history (optimistic delete):', {
          previousCount: prev.length,
          newCount: updated.length,
          removedId: entryId
        });
        return updated;
      });

      await deleteMoodEntry(entryId);
      console.log('✅ Removed mood entry:', entryId);

      // Refresh to ensure sync
      await refreshHistory(true);
    } catch (err) {
      console.error('Error removing mood entry:', err);
      setError('Failed to remove mood entry');
      // Revert optimistic update on error
      await refreshHistory(true);
    }
  }, [user, refreshHistory]);

  // Refresh history when auth is initialized or user changes
  useEffect(() => {
    console.log('\n=== Auth/User State Change ===');
    console.log('🔑 Auth State:', {
      initialized,
      userId: user?.id || 'none',
      historyLength: moodHistory.length,
      pendingRefresh: pendingRefresh.current
    });

    if (initialized) {
      if (user?.id) {
        if (moodHistory.length === 0 || pendingRefresh.current) {
          console.log('🔄 Triggering refresh: empty history or pending refresh');
          refreshHistory(true);
        } else {
          console.log('⏭️ Skipping refresh: history exists and no pending refresh');
        }
      } else {
        console.log('🧹 Clearing mood history - no user');
        setMoodHistory([]);
        setError(null);
      }
    }
    console.log('=== End Auth/User State Change ===\n');
  }, [initialized, user?.id, refreshHistory, moodHistory.length]);

  return {
    moodHistory,
    loading,
    error,
    refreshHistory,
    addMoodEntry,
    removeMoodEntry
  };
} 