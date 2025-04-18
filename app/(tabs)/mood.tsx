import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useColorScheme } from 'react-native';
import { Stack, router } from 'expo-router';
import { useAuth } from '../providers/AuthProvider';
import { logMoodEntry } from '../services/mood';

interface MoodOption {
  emoji: string;
  label: string;
  value: string;
}

const moodOptions: MoodOption[] = [
  { emoji: '😊', label: 'Happy', value: 'happy' },
  { emoji: '😢', label: 'Sad', value: 'sad' },
  { emoji: '😰', label: 'Stressed', value: 'stressed' },
  { emoji: '😠', label: 'Angry', value: 'angry' },
  { emoji: '😌', label: 'Relaxed', value: 'relaxed' },
];

export default function MoodScreen() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [journalEntry, setJournalEntry] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleMoodSelect = (moodValue: string) => {
    setSelectedMood(moodValue);
  };

  const handleJournalChange = (text: string) => {
    setJournalEntry(text);
  };

  const validateInput = () => {
    if (!selectedMood && !journalEntry.trim()) {
      Alert.alert(
        "Incomplete Entry",
        "Please select a mood and write something in your journal."
      );
      return false;
    }
    
    if (!selectedMood) {
      Alert.alert(
        "Mood Required",
        "Please select how you're feeling."
      );
      return false;
    }
    
    if (!journalEntry.trim()) {
      Alert.alert(
        "Journal Required",
        "Please write something about how you're feeling."
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert("Error", "You must be logged in to save your mood.");
      return;
    }

    if (!validateInput()) return;
    
    // TypeScript safety: selectedMood is guaranteed to be non-null here
    // because validateInput() would have returned false if it was null
    const mood = selectedMood!;
    
    setIsLoading(true);
    try {
      const { error } = await logMoodEntry(
        user.id,
        mood,
        journalEntry.trim()
      );

      if (error) throw error;

      // Clear form
      setSelectedMood(null);
      setJournalEntry('');
      
      // Show success message and navigate
      Alert.alert(
        "Success!",
        "Your mood has been logged. Would you like to see your recommendations?",
        [
          {
            text: "Not Now",
            style: "cancel"
          },
          {
            text: "View Recommendations",
            onPress: () => router.replace("../recommendations")
          }
        ]
      );
    } catch (error) {
      console.error('Error submitting mood:', error);
      Alert.alert(
        "Failed to Save",
        "There was a problem saving your mood. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = selectedMood && journalEntry.trim().length > 0;

  return (
    <ScrollView 
      className={`flex-1 px-4 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}
      keyboardShouldPersistTaps="handled"
    >
      <Stack.Screen options={{ title: 'Mood Logger' }} />
      
      <Text className={`text-2xl font-bold mt-8 mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        How are you feeling today?
      </Text>

      <View className="flex-row justify-between mb-8">
        {moodOptions.map((mood) => (
          <TouchableOpacity
            key={mood.value}
            onPress={() => handleMoodSelect(mood.value)}
            className={`items-center p-3 rounded-full active:opacity-80 ${
              selectedMood === mood.value
                ? isDark 
                  ? 'bg-indigo-600'
                  : 'bg-indigo-500'
                : isDark
                  ? 'bg-gray-800'
                  : 'bg-gray-200'
            }`}
          >
            <Text className="text-3xl mb-1">{mood.emoji}</Text>
            <Text className={`text-xs ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {mood.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View className="mb-8">
        <TextInput
          multiline
          numberOfLines={6}
          value={journalEntry}
          onChangeText={handleJournalChange}
          placeholder="Write your thoughts here..."
          placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
          className={`p-4 rounded-lg ${
            isDark 
              ? 'bg-gray-800 text-white' 
              : 'bg-white text-gray-900'
          } border ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          }`}
          style={{ textAlignVertical: 'top' }}
        />
      </View>

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={isLoading}
        className={`py-4 px-6 rounded-lg mb-8 active:opacity-80 ${
          isFormValid && !isLoading
            ? isDark
              ? 'bg-indigo-600'
              : 'bg-indigo-500'
            : isDark
              ? 'bg-gray-800'
              : 'bg-gray-300'
        }`}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className={`text-center font-semibold ${
            isFormValid
              ? 'text-white'
              : isDark
                ? 'text-gray-500'
                : 'text-gray-400'
          }`}>
            Save Entry
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
} 