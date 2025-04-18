import { supabase } from '../lib/supabaseClient';
import { Database } from '../types/database';

export type MoodEntry = Database['public']['Tables']['mood_entries']['Row'];
export type InsertMoodEntry = Database['public']['Tables']['mood_entries']['Insert'];
export type UpdateMoodEntry = Database['public']['Tables']['mood_entries']['Update'];

export const moodService = {
  async createMoodEntry(entry: InsertMoodEntry) {
    const { data, error } = await supabase
      .from('mood_entries')
      .insert(entry)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getLatestMoodEntry(userId: string) {
    const { data, error } = await supabase
      .from('mood_entries')
      .select()
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;
    return data;
  },

  async getMoodEntries(userId: string) {
    const { data, error } = await supabase
      .from('mood_entries')
      .select()
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async updateMoodEntry(id: string, updates: UpdateMoodEntry) {
    const { data, error } = await supabase
      .from('mood_entries')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteMoodEntry(id: string) {
    const { error } = await supabase
      .from('mood_entries')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}; 