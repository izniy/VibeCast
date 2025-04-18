import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MoodType } from '../../types/mood';

interface MoodSelectorProps {
  selectedMood: MoodType | null;
  onSelectMood: (mood: MoodType) => void;
}

const MOODS: { type: MoodType; emoji: string; label: string; color: string }[] = [
  { type: 'happy', emoji: '😊', label: 'Happy', color: 'bg-green-400' },
  { type: 'sad', emoji: '😢', label: 'Sad', color: 'bg-blue-400' },
  { type: 'energetic', emoji: '⚡️', label: 'Energetic', color: 'bg-yellow-400' },
  { type: 'relaxed', emoji: '😌', label: 'Relaxed', color: 'bg-purple-400' },
  { type: 'focused', emoji: '🎯', label: 'Focused', color: 'bg-indigo-400' },
  { type: 'romantic', emoji: '❤️', label: 'Romantic', color: 'bg-pink-400' },
  { type: 'angry', emoji: '😠', label: 'Angry', color: 'bg-red-400' },
];

export const MoodSelector: React.FC<MoodSelectorProps> = ({
  selectedMood,
  onSelectMood,
}) => {
  return (
    <View className="w-full p-4">
      <Text className="text-lg font-semibold mb-4 text-gray-800">How are you feeling?</Text>
      <View className="flex-row flex-wrap justify-between">
        {MOODS.map(({ type, emoji, label, color }) => (
          <TouchableOpacity
            key={type}
            onPress={() => onSelectMood(type)}
            className={`w-[18%] aspect-square rounded-full items-center justify-center mb-2 ${
              selectedMood === type ? color : 'bg-gray-100'
            }`}
          >
            <Text className="text-2xl">{emoji}</Text>
            <Text className="text-xs mt-1 text-center">
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}; 