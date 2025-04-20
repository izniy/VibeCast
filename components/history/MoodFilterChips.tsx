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
            <View style={styles.chipContent}>
              <Text style={styles.emoji}>{emoji}</Text>
              <Text style={[
                styles.label,
                isSelected && styles.selectedLabel
              ]}>
                {mood === 'all' ? 'All' : mood.charAt(0).toUpperCase() + mood.slice(1)}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 2,
    gap: 8,
  },
  chip: {
    minWidth: 80,
    maxWidth: 110,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    marginRight: 8,
    backgroundColor: 'white',
    justifyContent: 'center',
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
  chipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  emoji: {
    fontSize: 14,
    marginRight: 4,
  },
  label: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  selectedLabel: {
    color: 'white',
  },
}); 