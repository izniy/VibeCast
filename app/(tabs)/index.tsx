import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { Text } from 'react-native-paper';
import MoodEntryModal from '@/components/mood/MoodEntryModal';
import { useColorScheme } from 'nativewind';
import { useRecommendations } from '@/providers/RecommendationsProvider';
import type { MoodType } from '@/types/mood';
import AppHeader from '@/components/common/AppHeader';

const MOODS = [
  { emoji: '😊', label: 'happy', color: '#34D399' },
  { emoji: '😔', label: 'sad', color: '#818CF8' },
  { emoji: '⚡️', label: 'energetic', color: '#F59E0B' },
  { emoji: '😌', label: 'relaxed', color: '#60A5FA' },
  { emoji: '🎯', label: 'focused', color: '#8B5CF6' },
  { emoji: '💝', label: 'romantic', color: '#EC4899' },
  { emoji: '😠', label: 'angry', color: '#EF4444' },
];

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [showModal, setShowModal] = useState(false);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { fetchRecommendations } = useRecommendations();

  const handleMoodSelect = (mood: MoodType) => {
    setSelectedMood(mood);
    setShowModal(true);
  };

  const handleSaveMood = async (journalEntry: string) => {
    if (!selectedMood || !user) return;

    try {
      console.log('Saving mood entry:', {
        user_id: user.id,
        mood: selectedMood,
        journal_entry: journalEntry,
      });

      const { error, data } = await supabase.from('mood_entries').insert({
        user_id: user.id,
        mood: selectedMood,
        journal_entry: journalEntry,
      }).select();

      if (error) {
        console.error('Error saving mood entry:', error);
        throw error;
      }

      console.log('Successfully saved mood entry:', data);
      
      // Fetch new recommendations based on the mood
      await fetchRecommendations(selectedMood);
      
      // Close modal after successful save
      setShowModal(false);
      setSelectedMood(null);
      
      // Navigate to recommendations
      router.push('/(tabs)/recommendations');
    } catch (error) {
      console.error('Error saving mood:', error);
    }
  };

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1517021897933-0e0319cfbc28?q=80&w=2070&auto=format&fit=crop' }}
        style={styles.backgroundImage}
      />
      <View style={styles.overlay} />
      <AppHeader />
      <View style={styles.content}>
        <Text className={`text-3xl font-bold text-white text-center mb-10 ${
          isDark ? 'text-shadow-lg' : 'text-shadow-md'
        }`}>
          How are you feeling today?
        </Text>
        
        <View style={styles.moodGrid}>
          {MOODS.map((mood) => (
            <TouchableOpacity
              key={mood.label}
              className={`bg-white/90 dark:bg-gray-800/90 rounded-2xl p-5 items-center w-[28%] aspect-square justify-center
                ${selectedMood === mood.label ? 'border-2 border-indigo-500' : ''}`}
              onPress={() => handleMoodSelect(mood.label as MoodType)}
            >
              <Text style={styles.moodEmoji}>{mood.emoji}</Text>
              <Text className={`text-sm font-medium capitalize ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {mood.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {!user && (
          <View className="absolute bottom-10 left-5 right-5 bg-white/90 dark:bg-gray-800/90 rounded-2xl p-5 items-center">
            <Text className={`text-base ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-3`}>
              Sign in to track your moods
            </Text>
            <TouchableOpacity
              className="bg-indigo-500 px-6 py-3 rounded-lg"
              onPress={() => router.push('/login' as any)}
            >
              <Text className="text-white font-semibold text-base">
                Login
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <MoodEntryModal
        visible={showModal}
        selectedMood={selectedMood}
        onClose={() => {
          setShowModal(false);
          setSelectedMood(null);
        }}
        onSave={handleSaveMood}
      />
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
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    marginTop: 20,
  },
  moodEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
});