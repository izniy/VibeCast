import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

export type MoodEntry = Database['public']['Tables']['mood_entries']['Row'];
export type CreateMoodEntryParams = Omit<Database['public']['Tables']['mood_entries']['Insert'], 'id' | 'created_at' | 'updated_at'>;

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

  async getLatestMoodEntry(userId: string): Promise<MoodEntry | null> {
    const { data, error } = await supabase
      .from('mood_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No mood entries found
        return null;
      }
      console.error('Error fetching latest mood entry:', error);
      throw error;
    }

    return data;
  }

  async getLatestMood(userId: string): Promise<string | null> {
    const entry = await this.getLatestMoodEntry(userId);
    return entry?.mood || null;
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