import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { useMood } from '../hooks/useMood';
import { format } from 'date-fns';

const MOOD_OPTIONS = [
  'Happy', 'Excited', 'Relaxed', 'Neutral',
  'Anxious', 'Sad', 'Angry', 'Tired'
];

export default function MoodScreen() {
  const { moodHistory, loading, error, addMoodEntry, removeMoodEntry } = useMood();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [journalEntry, setJournalEntry] = useState('');

  const handleAddMood = async () => {
    if (!selectedMood) {
      Alert.alert('Error', 'Please select a mood');
      return;
    }

    try {
      await addMoodEntry(selectedMood, journalEntry);
      setSelectedMood(null);
      setJournalEntry('');
    } catch (err) {
      Alert.alert('Error', 'Failed to add mood entry');
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
            <Button
              key={mood}
              mode={selectedMood === mood ? 'contained' : 'outlined'}
              onPress={() => setSelectedMood(mood)}
              style={styles.moodButton}
            >
              {mood}
            </Button>
          ))}
        </View>
        <Button
          mode="contained"
          onPress={handleAddMood}
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
              {entry.entry && (
                <Text variant="bodyMedium" style={styles.entryText}>
                  {entry.entry}
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
  moodButton: {
    marginBottom: 8,
    flex: 1,
    minWidth: '45%',
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
}); 