import { supabase } from '../lib/supabase';

export interface MoodEntry {
  id: string;
  user_id: string;
  mood: string;
  journal_entry?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateMoodEntryParams {
  user_id: string;
  mood: string;
  journal_entry?: string;
}

class MoodService {
  async getMoodEntries(userId: string): Promise<MoodEntry[]> {
    const { data, error } = await supabase
      .from('mood_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching mood entries:', error);
      throw error;
    }

    return data || [];
  }

  async getLatestMood(userId: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('mood_entries')
      .select('mood')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No mood entries found
        return null;
      }
      console.error('Error fetching latest mood:', error);
      throw error;
    }

    return data?.mood || null;
  }

  async createMoodEntry(params: CreateMoodEntryParams): Promise<MoodEntry> {
    const { data, error } = await supabase
      .from('mood_entries')
      .insert([params])
      .select()
      .single();

    if (error) {
      console.error('Error creating mood entry:', error);
      throw error;
    }

    return data;
  }

  async deleteMoodEntry(entryId: string): Promise<void> {
    const { error } = await supabase
      .from('mood_entries')
      .delete()
      .eq('id', entryId);

    if (error) {
      console.error('Error deleting mood entry:', error);
      throw error;
    }
  }
}

export const moodService = new MoodService(); 