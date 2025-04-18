import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { format } from 'date-fns';
import { useAuth } from '../providers/AuthProvider';
import { useMood } from '../hooks/useMood';
import type { MoodEntry } from '../services/moodService';

export default function HistoryScreen() {
  const { user } = useAuth();
  const { moodHistory, loading, error, refreshHistory, removeMoodEntry } = useMood();

  useEffect(() => {
    if (user) {
      refreshHistory();
    }
  }, [user]);

  const handleDelete = async (entryId: string) => {
    if (!user) return;
    await removeMoodEntry(entryId);
    await refreshHistory();
  };

  const renderMoodItem = ({ item }: { item: MoodEntry }) => (
    <View className="bg-white p-4 mb-4 rounded-lg shadow-sm">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-lg font-semibold text-gray-800">
          {item.mood}
        </Text>
        <Text className="text-sm text-gray-500">
          {format(new Date(item.created_at), 'MMM d, yyyy h:mm a')}
        </Text>
      </View>
      {item.journal_entry && (
        <Text className="text-gray-600 mb-2">{item.journal_entry}</Text>
      )}
      <TouchableOpacity
        onPress={() => handleDelete(item.id)}
        className="self-end"
      >
        <Text className="text-red-500">Delete</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-red-500 text-center">{error}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 p-4">
      <Text className="text-2xl font-bold mb-4">Mood History</Text>
      <FlatList
        data={moodHistory}
        renderItem={renderMoodItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <Text className="text-center text-gray-500">
            No mood entries yet
          </Text>
        }
      />
    </View>
  );
}