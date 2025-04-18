import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledText = styled(Text);

const moods = [
  { emoji: '😊', name: 'Happy' },
  { emoji: '😢', name: 'Sad' },
  { emoji: '😰', name: 'Stressed' },
  { emoji: '😌', name: 'Relaxed' },
  { emoji: '😴', name: 'Tired' },
  { emoji: '😡', name: 'Angry' },
];

interface MoodSelectorProps {
  onSelectMood: (mood: { emoji: string; name: string }) => void;
  selectedMood?: { emoji: string; name: string };
}

export const MoodSelector: React.FC<MoodSelectorProps> = ({ onSelectMood, selectedMood }) => {
  return (
    <StyledView className="flex-row flex-wrap justify-center gap-4 p-4">
      {moods.map((mood) => (
        <TouchableOpacity
          key={mood.name}
          onPress={() => onSelectMood(mood)}
          className={`items-center p-4 rounded-full ${
            selectedMood?.name === mood.name ? 'bg-blue-200' : 'bg-gray-100'
          }`}
        >
          <StyledText className="text-3xl">{mood.emoji}</StyledText>
          <StyledText className="text-sm mt-1">{mood.name}</StyledText>
        </TouchableOpacity>
      ))}
    </StyledView>
  );
}; 