import React from 'react';
import { Text } from 'react-native';
import type { MoodType } from '@/types/mood';

const moodConfig: Record<MoodType, { emoji: string }> = {
  happy: { emoji: '😊' },
  sad: { emoji: '😢' },
  energetic: { emoji: '⚡️' },
  relaxed: { emoji: '😌' },
  focused: { emoji: '🎯' },
  romantic: { emoji: '❤️' },
  angry: { emoji: '😠' }
};

interface MoodEmojiProps {
  mood: MoodType;
  size?: number;
}

export function MoodEmoji({ mood, size = 24 }: MoodEmojiProps) {
  return (
    <Text style={{ fontSize: size }}>
      {moodConfig[mood].emoji}
    </Text>
  );
} 