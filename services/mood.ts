import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';
import type { MoodType } from '@/types/mood';

export type MoodEntry = Database['public']['Tables']['mood_entries']['Row'];
export type CreateMoodEntryParams = {
  user_id: string;
  mood: MoodType;
  journal_entry?: string | null;
};

export async function getMoodEntries(userId: string): Promise<MoodEntry[]> {
  console.log('🔍 Fetching mood entries...', { userId });
  
  const { data, error } = await supabase
    .from('mood_entries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  console.log('🧠 getMoodEntries() response:', {
    userId,
    error,
    count: data?.length,
    firstEntry: data?.[0] ? {
      id: data[0].id,
      mood: data[0].mood,
      created_at: data[0].created_at
    } : null,
    lastEntry: data?.[data.length - 1] ? {
      id: data[data.length - 1].id,
      mood: data[data.length - 1].mood,
      created_at: data[data.length - 1].created_at
    } : null
  });

  if (error) {
    console.error('Error fetching mood entries:', error);
    throw error;
  }

  return data || [];
}

export async function getLatestMoodEntry(userId: string): Promise<MoodEntry | null> {
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

export async function getLatestMood(userId: string): Promise<MoodType | null> {
  const entry = await getLatestMoodEntry(userId);
  return entry?.mood || null;
}

export async function createMoodEntry(params: CreateMoodEntryParams): Promise<MoodEntry> {
  console.log('📝 Creating mood entry...', {
    userId: params.user_id,
    mood: params.mood,
    hasJournal: !!params.journal_entry
  });

  const { data, error } = await supabase
    .from('mood_entries')
    .insert([{
      user_id: params.user_id,
      mood: params.mood,
      journal_entry: params.journal_entry || null
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating mood entry:', error);
    throw error;
  }

  console.log('✅ Created mood entry:', {
    id: data.id,
    mood: data.mood,
    created_at: data.created_at
  });

  return data;
}

export async function deleteMoodEntry(entryId: string): Promise<void> {
  const { error } = await supabase
    .from('mood_entries')
    .delete()
    .eq('id', entryId);

  if (error) {
    console.error('Error deleting mood entry:', error);
    throw error;
  }
} 