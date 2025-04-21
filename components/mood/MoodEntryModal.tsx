import React from 'react';
import {
  View,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text } from 'react-native-paper';

interface MoodEntryModalProps {
  visible: boolean;
  selectedMood: string | null;
  onClose: () => void;
  onSave: (journalEntry: string) => void;
  isLoading?: boolean;
}

export default function MoodEntryModal({
  visible,
  selectedMood,
  onClose,
  onSave,
  isLoading = false,
}: MoodEntryModalProps) {
  const [journalEntry, setJournalEntry] = React.useState('');

  const handleSave = () => {
    onSave(journalEntry);
    setJournalEntry('');
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={styles.feelingText}>Feeling {selectedMood}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          {/* Prompt */}
          <View style={styles.promptContainer}>
            <Text style={styles.promptTitle}>✍️ Reflect & express</Text>
            <Text style={styles.promptSubtitle}>
              Write down how you're really feeling — this is your safe space.
            </Text>
          </View>

          {/* Input */}
          <TextInput
            style={styles.input}
            placeholder="Share your thoughts..."
            placeholderTextColor="#6B7280"
            value={journalEntry}
            onChangeText={setJournalEntry}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, isLoading && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={isLoading}
          >
            <Text style={styles.saveButtonText}>
              {isLoading ? 'Saving...' : 'Save Mood'}
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
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: 'white',
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  feelingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  cancelText: {
    color: '#6366F1',
    fontWeight: '500',
    fontSize: 14,
  },
  promptContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  promptTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 6,
  },
  promptSubtitle: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 14,
    lineHeight: 20,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 24,
    color: '#111827',
  },
  saveButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});
