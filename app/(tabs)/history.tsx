import React, { useCallback, useMemo, useState } from 'react';
import { View, StyleSheet, FlatList, Alert, ActivityIndicator, Animated } from 'react-native';
import { Text } from 'react-native-paper';
import { format, isToday, isYesterday } from 'date-fns';
import { useMood } from '../hooks/useMood';
import { useAuth } from '../providers/AuthProvider';
import type { MoodEntry } from '../services/mood';
import type { MoodType } from '../types/mood';
import { MoodEntryCard } from '../components/history/MoodEntryCard';
import { MoodFilterChips } from '../components/history/MoodFilterChips';

interface GroupedMoodEntries {
  title: string;
  data: MoodEntry[];
  dominantMood: MoodType;
  description: string;
}

const moodDescriptions: Record<MoodType, string> = {
  happy: 'Bright and joyful moments ✨',
  sad: 'Reflective and emotional times 💧',
  energetic: 'Burst of energy and motivation ⚡',
  relaxed: 'Calm and peaceful vibes 🌿',
  focused: 'Moments of deep concentration 🎯',
  romantic: 'Matters of the heart 💖',
  angry: 'Tense and intense moments 🔥',
};

export default function HistoryScreen() {
  const { user } = useAuth();
  const { moodHistory, loading, error, refreshHistory, removeMoodEntry } = useMood();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const [selectedMood, setSelectedMood] = useState<MoodType | 'all'>('all');

  const handleRefresh = useCallback(async () => {
    await refreshHistory();
    // Trigger fade-in animation after refresh
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [refreshHistory, fadeAnim]);

  const handleDeleteEntry = useCallback((entry: MoodEntry) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this mood entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => removeMoodEntry(entry.id),
        },
      ]
    );
  }, [removeMoodEntry]);

  const getDominantMood = useCallback((entries: MoodEntry[]): MoodType => {
    if (entries.length === 0) {
      return 'happy' as MoodType; // Default mood if no entries
    }

    const moodCounts = new Map<MoodType, number>();
    
    entries.forEach(entry => {
      moodCounts.set(entry.mood, (moodCounts.get(entry.mood) || 0) + 1);
    });

    let dominantMood = entries[0].mood;
    let maxCount = moodCounts.get(dominantMood) || 0;

    moodCounts.forEach((count, mood) => {
      if (count > maxCount) {
        maxCount = count;
        dominantMood = mood;
      }
    });

    return dominantMood;
  }, []);

  const filteredAndGroupedEntries = useMemo(() => {
    if (!moodHistory.length) return [];

    // Filter entries if a specific mood is selected
    const filteredEntries = selectedMood === 'all'
      ? moodHistory
      : moodHistory.filter(entry => entry.mood === selectedMood);

    const groups: Record<string, MoodEntry[]> = {};
    
    filteredEntries.forEach(entry => {
      const date = new Date(entry.created_at);
      let title = format(date, 'EEEE, MMMM d');
      
      if (isToday(date)) {
        title = 'Today';
      } else if (isYesterday(date)) {
        title = 'Yesterday';
      }

      if (!groups[title]) {
        groups[title] = [];
      }
      groups[title].push(entry);
    });

    // Sort entries within each group
    Object.values(groups).forEach(entries => {
      entries.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });

    return Object.entries(groups).map(([title, data]) => {
      const dominantMood = getDominantMood(data);
      return {
        title,
        data,
        dominantMood,
        description: moodDescriptions[dominantMood],
      };
    });
  }, [moodHistory, selectedMood, getDominantMood]);

  const renderSectionHeader = useCallback(({ title, description }: { title: string; description: string }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionDescription}>{description}</Text>
    </View>
  ), []);

  if (loading && !moodHistory.length) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!moodHistory.length) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No mood entries yet</Text>
        <Text style={styles.emptySubtext}>
          Your mood history will appear here once you start logging your moods
        </Text>
      </View>
    );
  }

  const hasFilteredEntries = filteredAndGroupedEntries.length > 0;

  return (
    <View style={styles.container}>
      <MoodFilterChips
        selectedMood={selectedMood}
        onSelectMood={setSelectedMood}
      />
      <Animated.View style={[styles.listContainer, { opacity: fadeAnim }]}>
        {hasFilteredEntries ? (
          <FlatList
            data={filteredAndGroupedEntries}
            renderItem={({ item }) => (
              <View style={styles.section}>
                {renderSectionHeader(item)}
                {item.data.map((entry) => (
                  <MoodEntryCard
                    key={entry.id}
                    entry={entry}
                    onDelete={() => handleDeleteEntry(entry)}
                  />
                ))}
              </View>
            )}
            keyExtractor={(item) => item.title}
            refreshing={loading}
            onRefresh={handleRefresh}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>No entries found</Text>
            <Text style={styles.emptySubtext}>
              Try selecting a different mood filter
            </Text>
          </View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F3F4F6',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    borderRadius: 8,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});