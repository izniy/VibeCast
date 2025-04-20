import React from 'react';
import { View, Modal, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { useColorScheme } from 'nativewind';

interface MoodEntryModalProps {
  visible: boolean;
  selectedMood: string | null;
  onClose: () => void;
  onSave: (journalEntry: string) => void;
}

export default function MoodEntryModal({ visible, selectedMood, onClose, onSave }: MoodEntryModalProps) {
  const [journalEntry, setJournalEntry] = React.useState('');
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleSave = () => {
    onSave(journalEntry);
    setJournalEntry('');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <View className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-t-3xl p-6 shadow-xl`}>
          <View className="flex-row justify-between items-center mb-6">
            <Text className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Feeling {selectedMood}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text className="text-indigo-500">Cancel</Text>
            </TouchableOpacity>
          </View>

          <Text className={`text-base mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Add a note (optional)
          </Text>
          <TextInput
            className={`w-full rounded-lg p-4 mb-6 ${
              isDark ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-900'
            } border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}
            placeholder="How are you feeling?"
            placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
            value={journalEntry}
            onChangeText={setJournalEntry}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <TouchableOpacity
            className="bg-indigo-500 rounded-lg py-4 items-center"
            onPress={handleSave}
          >
            <Text className="text-white font-semibold text-base">
              Save Mood
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
}); 