import React from 'react';
import { View, TextInput } from 'react-native';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledTextInput = styled(TextInput);

interface JournalEntryProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export const JournalEntry: React.FC<JournalEntryProps> = ({
  value,
  onChangeText,
  placeholder = "How are you feeling today?",
}) => {
  return (
    <StyledView className="p-4">
      <StyledTextInput
        className="bg-white p-4 rounded-lg min-h-[120px] text-base"
        multiline
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        textAlignVertical="top"
      />
    </StyledView>
  );
}; 