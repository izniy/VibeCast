import { MoodType } from './mood';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      mood_entries: {
        Row: {
          id: string
          user_id: string
          mood: MoodType
          journal_entry: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          mood: MoodType
          journal_entry?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          mood?: MoodType
          journal_entry?: string | null
          created_at?: string
        }
      }
    }
  }
}

// Helper type to convert database types to application types
export type MoodEntryRow = Database['public']['Tables']['mood_entries']['Row'];

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
