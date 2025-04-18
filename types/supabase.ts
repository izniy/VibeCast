export interface Database {
  public: {
    Tables: {
      moods: {
        Row: {
          id: string;
          user_id: string;
          mood: string;
          entry: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          mood: string;
          entry?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          mood?: string;
          entry?: string | null;
          created_at?: string;
        };
      };
      recommendations: {
        Row: {
          id: string;
          user_id: string;
          mood_id: string;
          type: 'music' | 'movie';
          content_id: string;
          title: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          mood_id: string;
          type: 'music' | 'movie';
          content_id: string;
          title: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          mood_id?: string;
          type?: 'music' | 'movie';
          content_id?: string;
          title?: string;
          description?: string | null;
          created_at?: string;
        };
      };
    };
  };
}