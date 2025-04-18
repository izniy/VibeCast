import { supabase } from './supabaseClient';
import { PostgrestError } from '@supabase/supabase-js';

// Define valid mood types to match the database enum
export type MoodType = 'happy' | 'sad' | 'stressed' | 'angry' | 'relaxed';

export interface MoodEntry {
  id: string;
  user_id: string;
  mood: string;
  entry?: string;
  created_at: string;
}

export type MoodServiceResponse<T> = {
  data: T | null;
  error: PostgrestError | null;
};

/**
 * Log a new mood entry for a user
 */
export async function logMoodEntry(
  userId: string,
  mood: MoodType,
  journal: string
): Promise<MoodServiceResponse<MoodEntry>> {
  try {
    const response = await supabase
      .from('mood_entries')
      .insert({
        user_id: userId,
        mood,
        journal,
      })
      .select()
      .single();

    return {
      data: response.data as MoodEntry | null,
      error: response.error
    };
  } catch (error) {
    return {
      data: null,
      error: error as PostgrestError
    };
  }
}

/**
 * Get all mood logs for a user, ordered by creation date
 */
export async function getMoodLogs(
  userId: string
): Promise<MoodServiceResponse<MoodEntry[]>> {
  try {
    const response = await supabase
      .from('mood_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    return {
      data: response.data as MoodEntry[] | null,
      error: response.error
    };
  } catch (error) {
    return {
      data: null,
      error: error as PostgrestError
    };
  }
}

/**
 * Get a specific mood log by ID
 */
export async function getMoodLogById(
  userId: string,
  logId: string
): Promise<MoodServiceResponse<MoodEntry>> {
  try {
    const response = await supabase
      .from('mood_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('id', logId)
      .single();

    return {
      data: response.data as MoodEntry | null,
      error: response.error
    };
  } catch (error) {
    return {
      data: null,
      error: error as PostgrestError
    };
  }
}

/**
 * Delete a specific mood log
 */
export async function deleteMoodLog(
  userId: string,
  logId: string
): Promise<MoodServiceResponse<null>> {
  try {
    const { error } = await supabase
      .from('mood_entries')
      .delete()
      .eq('user_id', userId)
      .eq('id', logId);

    return {
      data: null,
      error
    };
  } catch (error) {
    return {
      data: null,
      error: error as PostgrestError
    };
  }
}

/**
 * Update a specific mood log's mood and/or journal
 */
export async function updateMoodLog(
  userId: string,
  logId: string,
  updates: Partial<Pick<MoodEntry, 'mood' | 'journal'>>
): Promise<MoodServiceResponse<MoodEntry>> {
  try {
    const response = await supabase
      .from('mood_entries')
      .update(updates)
      .eq('user_id', userId)
      .eq('id', logId)
      .select()
      .single();

    return {
      data: response.data as MoodEntry | null,
      error: response.error
    };
  } catch (error) {
    return {
      data: null,
      error: error as PostgrestError
    };
  }
}

export const getMoodHistory = async (userId: string): Promise<MoodEntry[]> => {
  const { data, error } = await supabase
    .from('mood_entries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

export const createMoodEntry = async (
  userId: string,
  mood: string,
  entry?: string
): Promise<MoodEntry> => {
  const { data, error } = await supabase
    .from('mood_entries')
    .insert([
      {
        user_id: userId,
        mood,
        entry,
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const deleteMoodEntry = async (userId: string, entryId: string): Promise<void> => {
  const { error } = await supabase
    .from('mood_entries')
    .delete()
    .eq('id', entryId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(error.message);
  }
}; 