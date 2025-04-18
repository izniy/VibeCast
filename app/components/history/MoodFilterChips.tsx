import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import type { MoodType } from '../../types/mood';

interface MoodFilterChipsProps {
  selectedMood: MoodType | 'all';
  onSelectMood: (mood: MoodType | 'all') => void;
}

const moodConfig: Record<MoodType | 'all', { emoji: string; color: string }> = {
  all: { emoji: '🌈', color: '#64748B' },
  happy: { emoji: '😊', color: '#22C55E' },
  sad: { emoji: '😢', color: '#3B82F6' },
  energetic: { emoji: '⚡️', color: '#EAB308' },
  relaxed: { emoji: '😌', color: '#8B5CF6' },
  focused: { emoji: '🎯', color: '#6366F1' },
  romantic: { emoji: '❤️', color: '#EC4899' },
  angry: { emoji: '😠', color: '#EF4444' },
};

export function MoodFilterChips({ selectedMood, onSelectMood }: MoodFilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {Object.entries(moodConfig).map(([mood, { emoji, color }]) => {
        const isSelected = selectedMood === mood;
        return (
          <TouchableOpacity
            key={mood}
            onPress={() => onSelectMood(mood as MoodType | 'all')}
            style={[
              styles.chip,
              { borderColor: color },
              isSelected && { backgroundColor: color }
            ]}
          >
            <Text style={styles.emoji}>{emoji}</Text>
            <Text style={[
              styles.label,
              isSelected && styles.selectedLabel
            ]}>
              {mood === 'all' ? 'All' : mood.charAt(0).toUpperCase() + mood.slice(1)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    backgroundColor: 'white',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  emoji: {
    fontSize: 16,
    marginRight: 6,
  },
  label: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  selectedLabel: {
    color: 'white',
  },
}); 