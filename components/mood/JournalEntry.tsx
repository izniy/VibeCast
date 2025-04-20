import React from 'react';
import { View, TextInput, Text } from 'react-native';

interface JournalEntryProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export const JournalEntry: React.FC<JournalEntryProps> = ({
  value,
  onChangeText,
  placeholder = "How are you feeling today?"
}) => {
  return (
    <View className="w-full p-4">
      <Text className="text-lg font-semibold mb-2 text-gray-800">Journal Entry</Text>
      <TextInput
        className="w-full min-h-[120px] p-3 rounded-lg bg-white border border-gray-200"
        multiline
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        textAlignVertical="top"
      />
    </View>
  );
}; 