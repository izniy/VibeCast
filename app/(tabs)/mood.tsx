import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useMood } from '../hooks/useMood';
import { useRecommendations } from '../providers/RecommendationsProvider';
import type { MoodType } from '../types/mood';

const MOOD_OPTIONS: MoodType[] = ['happy', 'sad', 'energetic', 'relaxed', 'focused', 'romantic', 'angry'];

export default function MoodScreen() {
  const router = useRouter();
  const { addMoodEntry, loading, error } = useMood();
  const { fetchRecommendations } = useRecommendations();
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [journalEntry, setJournalEntry] = useState('');

  const handleSubmit = async () => {
    if (!selectedMood) {
      return;
    }

    try {
      await addMoodEntry(selectedMood, journalEntry);
      await fetchRecommendations(selectedMood);
      
      // Reset form
      setSelectedMood(null);
      setJournalEntry('');
      
      // Navigate within tabs
      router.push('/(tabs)/recommendations' as any);
    } catch (err) {
      console.error('Error submitting mood:', err);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.moodSelector}>
        {MOOD_OPTIONS.map((mood) => (
          <TouchableOpacity
            key={mood}
            style={[
              styles.moodOption,
              selectedMood === mood && styles.selectedMood,
            ]}
            onPress={() => setSelectedMood(mood)}
          >
            <Text style={[
              styles.moodText,
              selectedMood === mood && styles.selectedMoodText
            ]}>
              {mood}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.journalSection}>
        <Text style={styles.label}>How are you feeling? (Optional)</Text>
        <TextInput
          style={styles.input}
          value={journalEntry}
          onChangeText={setJournalEntry}
          placeholder="Write about your mood..."
          multiline
          numberOfLines={4}
        />
      </View>

      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={loading}
        disabled={!selectedMood || loading}
        style={styles.submitButton}
      >
        Log Mood
      </Button>

      {error && (
        <Text style={styles.error}>{error}</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  moodSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 8,
  },
  moodOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
  },
  selectedMood: {
    backgroundColor: '#3B82F6',
  },
  moodText: {
    fontSize: 16,
    color: '#1F2937',
    textTransform: 'capitalize',
  },
  selectedMoodText: {
    color: '#FFFFFF',
  },
  journalSection: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    margin: 16,
  },
  error: {
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 8,
  },
}); 