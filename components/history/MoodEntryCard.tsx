import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { format } from 'date-fns';
import type { MoodEntry } from '../../services/mood';

interface MoodEntryCardProps {
  entry: MoodEntry;
  onDelete?: () => void;
}

const moodConfig: Record<string, { color: string; emoji: string }> = {
  happy: { color: '#22C55E', emoji: '😊' },
  sad: { color: '#3B82F6', emoji: '😢' },
  energetic: { color: '#EAB308', emoji: '⚡️' },
  relaxed: { color: '#8B5CF6', emoji: '😌' },
  focused: { color: '#6366F1', emoji: '🎯' },
  romantic: { color: '#EC4899', emoji: '❤️' },
  angry: { color: '#EF4444', emoji: '😠' }
};

export function MoodEntryCard({ entry, onDelete }: MoodEntryCardProps) {
  const Container = onDelete ? TouchableOpacity : View;
  const containerProps = onDelete ? {
    onLongPress: onDelete,
    delayLongPress: 500,
  } : {};

  const moodInfo = moodConfig[entry.mood];
  const formattedTime = format(new Date(entry.created_at), 'h:mm a');

  return (
    <Container
      style={styles.container}
      {...containerProps}
    >
      <View style={styles.header}>
        <View style={styles.moodContainer}>
          <View style={[styles.moodDot, { backgroundColor: moodInfo.color }]} />
          <Text style={styles.moodText}>
            <Text style={styles.moodEmoji}>{moodInfo.emoji} </Text>
            {entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)}
          </Text>
        </View>
        <Text style={styles.timeText}>{formattedTime}</Text>
      </View>
      {entry.journal_entry ? (
        <Text style={styles.journalText} numberOfLines={2}>
          {entry.journal_entry}
        </Text>
      ) : null}
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  moodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moodDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  moodText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1F2937',
  },
  moodEmoji: {
    fontSize: 18,
  },
  journalText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  timeText: {
    fontSize: 12,
    color: '#6B7280',
  },
}); 