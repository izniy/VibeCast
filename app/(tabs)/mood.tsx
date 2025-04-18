import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity, TextInput } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { useMood } from '../hooks/useMood';
import { format } from 'date-fns';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { MoodEntry, MoodType } from '../services/mood';

const MOOD_OPTIONS: MoodType[] = ['happy', 'sad', 'stressed', 'angry', 'relaxed'];

export default function MoodScreen() {
  const { moodHistory, loading, error, addMoodEntry, removeMoodEntry } = useMood();
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [journalEntry, setJournalEntry] = useState('');

  const handleSubmit = async () => {
    if (!selectedMood) {
      // Show error that mood must be selected
      return;
    }

    try {
      await addMoodEntry(selectedMood, journalEntry);
      // Reset form
      setSelectedMood(null);
      setJournalEntry('');
    } catch (err) {
      console.error('Error submitting mood:', err);
    }
  };

  const handleDeleteMood = async (entryId: string) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this mood entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeMoodEntry(entryId);
            } catch (err) {
              Alert.alert('Error', 'Failed to delete mood entry');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: MoodEntry }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.mood}>{item.mood}</Text>
        <TouchableOpacity
          onPress={() => handleDeleteMood(item.id)}
          style={styles.deleteButton}
        >
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
      {item.journal_entry && (
        <Text style={styles.journal}>{item.journal_entry}</Text>
      )}
      <Text style={styles.date}>
        {format(new Date(item.created_at), 'PPpp')}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text variant="bodyLarge" style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.moodSelector}>
        <Text variant="titleLarge" style={styles.title}>How are you feeling?</Text>
        <View style={styles.moodGrid}>
          {MOOD_OPTIONS.map((mood) => (
            <TouchableOpacity
              key={mood}
              style={[
                styles.moodOption,
                selectedMood === mood && styles.selectedMood,
              ]}
              onPress={() => setSelectedMood(mood)}
            >
              <Text style={styles.moodText}>{mood}</Text>
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
      </View>

      <View style={styles.historySection}>
        <Text variant="titleLarge" style={styles.title}>Mood History</Text>
        {moodHistory.map((entry) => (
          <Card key={entry.id} style={styles.moodCard}>
            <Card.Content>
              <View style={styles.moodHeader}>
                <Text variant="titleMedium">{entry.mood}</Text>
                <Text variant="bodySmall">
                  {format(new Date(entry.created_at), 'MMM d, yyyy h:mm a')}
                </Text>
              </View>
              {entry.journal_entry && (
                <Text variant="bodyMedium" style={styles.entryText}>
                  {entry.journal_entry}
                </Text>
              )}
            </Card.Content>
            <Card.Actions>
              <Button
                onPress={() => handleDeleteMood(entry.id)}
                textColor="red"
              >
                Delete
              </Button>
            </Card.Actions>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  moodSelector: {
    marginBottom: 24,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
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
  submitButton: {
    marginTop: 8,
  },
  historySection: {
    gap: 12,
  },
  moodCard: {
    marginBottom: 12,
  },
  moodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  entryText: {
    marginTop: 8,
  },
  errorText: {
    color: 'red',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mood: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  deleteButton: {
    padding: 8,
  },
  journal: {
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: '#6B7280',
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
}); 