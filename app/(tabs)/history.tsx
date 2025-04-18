import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { styled } from 'nativewind';
import { useMood } from '../hooks/useMood';
import { format } from 'date-fns';

const StyledView = styled(View);
const StyledText = styled(Text);

export default function History() {
  const { moodLogs, loading, fetchMoodLogs, deleteMoodLog } = useMood();

  useEffect(() => {
    fetchMoodLogs();
  }, [fetchMoodLogs]);

  function renderMoodLog({ item }) {
    return (
      <StyledView className="bg-white p-4 mb-4 rounded-lg shadow-sm">
        <StyledView className="flex-row justify-between items-center mb-2">
          <StyledText className="text-lg font-semibold">{item.mood}</StyledText>
          <StyledText className="text-gray-500">
            {format(new Date(item.created_at), 'MMM d, yyyy h:mm a')}
          </StyledText>
        </StyledView>

        {item.journal_entry ? (
          <StyledText className="text-gray-700 mb-2">{item.journal_entry}</StyledText>
        ) : null}

        <TouchableOpacity
          onPress={() => deleteMoodLog(item.id)}
          className="self-end"
        >
          <StyledText className="text-red-500">Delete</StyledText>
        </TouchableOpacity>
      </StyledView>
    );
  }

  if (loading) {
    return (
      <StyledView className="flex-1 justify-center items-center">
        <StyledText>Loading...</StyledText>
      </StyledView>
    );
  }

  return (
    <StyledView className="flex-1 bg-gray-100">
      <FlatList
        data={moodLogs}
        renderItem={renderMoodLog}
        keyExtractor={(item) => item.id}
        contentContainerClassName="p-4"
        ListEmptyComponent={
          <StyledView className="flex-1 justify-center items-center p-4">
            <StyledText className="text-gray-500 text-center">
              No mood logs yet. Start tracking your mood from the home screen!
            </StyledText>
          </StyledView>
        }
      />
    </StyledView>
  );
}