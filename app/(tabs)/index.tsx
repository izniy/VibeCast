import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Platform, StyleSheet as RNStyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { Text } from 'react-native-paper';
import MoodEntryModal from '@/components/mood/MoodEntryModal';
import { useColorScheme } from 'nativewind';
import { useRecommendations } from '@/providers/RecommendationsProvider';
import type { MoodType } from '@/types/mood';
import AppHeader from '@/components/common/AppHeader';
import { useMood } from '@/hooks/useMood';

const MOODS = [
  { emoji: '😊', label: 'happy', color: '#34D399', gradient: ['#34D399', '#10B981'] },
  { emoji: '😔', label: 'sad', color: '#818CF8', gradient: ['#818CF8', '#6366F1'] },
  { emoji: '⚡️', label: 'energetic', color: '#F59E0B', gradient: ['#F59E0B', '#D97706'] },
  { emoji: '😌', label: 'relaxed', color: '#60A5FA', gradient: ['#60A5FA', '#3B82F6'] },
  { emoji: '🎯', label: 'focused', color: '#8B5CF6', gradient: ['#8B5CF6', '#7C3AED'] },
  { emoji: '💝', label: 'romantic', color: '#EC4899', gradient: ['#EC4899', '#DB2777'] },
  { emoji: '😠', label: 'angry', color: '#EF4444', gradient: ['#EF4444', '#DC2626'] },
];

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [showModal, setShowModal] = useState(false);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { fetchRecommendations } = useRecommendations();
  const { addMoodEntry } = useMood();

  const handleMoodSelect = (mood: MoodType) => {
    setSelectedMood(mood);
    setShowModal(true);
  };

  const handleSaveMood = async (journalEntry: string) => {
    if (!selectedMood || !user) return;

    try {
      await addMoodEntry(selectedMood, journalEntry);
      await fetchRecommendations(selectedMood);
      setShowModal(false);
      setSelectedMood(null);
      router.push('/(tabs)/recommendations');
    } catch (error) {
      console.error('Error saving mood:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={{
          uri: 'https://images.unsplash.com/photo-1517021897933-0e0319cfbc28?q=80&w=2070&auto=format&fit=crop',
        }}
        style={styles.backgroundImage}
      />
      <View style={styles.overlay} />
      <AppHeader />
      <View style={styles.content}>
        <Text
          style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: '#FFFFFF',
            textAlign: 'center',
            marginBottom: 20,
          }}
        >
          How are you feeling today?
        </Text>

        <View style={styles.moodGrid}>
          {MOODS.map((mood) => (
            <TouchableOpacity
              key={mood.label}
              style={[
                styles.moodButton,
                { backgroundColor: 'rgba(255, 255, 255, 0.8)' },
                selectedMood === mood.label && styles.selectedMoodButton,
              ]}
              onPress={() => handleMoodSelect(mood.label as MoodType)}
            >
              <View style={styles.moodContent}>
                <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                <Text
                  className={`text-sm font-medium capitalize text-center ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  {mood.label}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {!user && (
          <View style={styles.loginPrompt} className="bg-white/90 dark:bg-gray-800/90 rounded-2xl">
            <Text className={`text-base ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-3`}>
              Sign in to track your moods
            </Text>
            <TouchableOpacity
              className="bg-indigo-500 px-6 py-3 rounded-lg"
              onPress={() => router.push('/login' as any)}
            >
              <Text className="text-white font-semibold text-base">Login</Text>
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
    position: 'relative',
    backgroundColor: '#F3F4F6',
  },
  backgroundImage: {
    ...RNStyleSheet.absoluteFillObject,
    resizeMode: 'cover',
  },
  overlay: {
    ...RNStyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  content: {
    flex: 1,
    paddingHorizontal: '5%',
    paddingTop: 60,
    width: '100%',
    maxWidth: 800,
    alignSelf: 'center',
  },  
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    marginTop: 20,
    paddingHorizontal: '2%',
  },
  moodButton: {
    width: '28%',
    minWidth: 100,
    maxWidth: 160,
    aspectRatio: 1,
    padding: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    borderRadius: 12,
  },
  selectedMoodButton: {
    elevation: 8,
    shadowColor: '#4F46E5',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5.84,
    transform: [{ scale: 1.05 }],
  },
  moodContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moodEmoji: {
    fontSize: 32,
    marginBottom: 8,
    textAlign: 'center',
  },
  loginPrompt: {
    position: 'absolute',
    bottom: 40,
    left: '10%',
    right: '10%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    maxWidth: 400,
    alignSelf: 'center',
  },
});
