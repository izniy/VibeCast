import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../providers/AuthProvider';
import { supabase } from '@/lib/supabaseClient';

const MOODS = [
  { emoji: '😊', label: 'Happy', color: '#34D399' },
  { emoji: '😌', label: 'Calm', color: '#60A5FA' },
  { emoji: '😐', label: 'Neutral', color: '#9CA3AF' },
  { emoji: '😔', label: 'Sad', color: '#818CF8' },
  { emoji: '😤', label: 'Angry', color: '#F87171' },
];

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [entry, setEntry] = useState('');

  const saveMood = async (mood: string) => {
    try {
      setSelectedMood(mood);
      const { error } = await supabase.from('moods').insert({
        user_id: user?.id,
        mood: mood,
        entry: '',
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving mood:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1517021897933-0e0319cfbc28?q=80&w=2070&auto=format&fit=crop' }}
        style={styles.backgroundImage}
      />
      <View style={styles.overlay} />
      
      <View style={styles.content}>
        <Text style={styles.greeting}>How are you feeling today?</Text>
        
        <View style={styles.moodGrid}>
          {MOODS.map((mood) => (
            <TouchableOpacity
              key={mood.label}
              style={[
                styles.moodButton,
                selectedMood === mood.label && { backgroundColor: mood.color + '33' },
              ]}
              onPress={() => saveMood(mood.label)}
            >
              <Text style={styles.moodEmoji}>{mood.emoji}</Text>
              <Text style={[
                styles.moodLabel,
                selectedMood === mood.label && { color: mood.color },
              ]}>
                {mood.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {!user && (
          <View style={styles.loginPrompt}>
            <Text style={styles.loginText}>Sign in to track your moods</Text>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => router.push('/login')}
            >
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  greeting: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 40,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    marginTop: 20,
  },
  moodButton: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    width: '28%',
    aspectRatio: 1,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  moodEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  moodLabel: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
  },
  loginPrompt: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  loginText: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 12,
  },
  loginButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});