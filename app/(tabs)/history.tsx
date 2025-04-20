import React, { useCallback, useMemo, useState } from 'react';
import { View, StyleSheet, FlatList, Alert, ActivityIndicator, Animated, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { format, isToday, isYesterday } from 'date-fns';
import { useMood } from '@/hooks/useMood';
import { useAuth } from '@/providers/AuthProvider';
import type { MoodType } from '@/types/mood';
import type { MoodEntry } from '@/services/mood';
import { MoodEntryCard } from '@/components/history/MoodEntryCard';
import { MoodFilterChips } from '@/components/history/MoodFilterChips';

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

  // Add debug logging for component state
  React.useEffect(() => {
    console.log('📊 HistoryScreen render:', {
      hasUser: !!user,
      userId: user?.id,
      moodHistoryLength: moodHistory.length,
      moodHistoryIds: moodHistory.map(entry => entry.id),
      isLoading: loading,
      hasError: !!error,
      selectedMood,
      timestamp: new Date().toISOString()
    });
  }, [user, moodHistory, loading, error, selectedMood]);

  // Add initial fade-in
  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleRefresh = useCallback(async () => {
    console.log('🔄 Manual refresh triggered');
    fadeAnim.setValue(0);
    await refreshHistory(true);
    console.log('✅ Manual refresh completed');
    // Start fade-in after data is loaded
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
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
      
      return 'happy';
    }

    const moodCounts = new Map<MoodType, number>();
    
    entries.forEach(entry => {
      const mood = entry.mood as MoodType;
      moodCounts.set(mood, (moodCounts.get(mood) || 0) + 1);
    });

    let dominantMood: MoodType = entries[0].mood as MoodType;
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

  const renderContent = () => {
    console.log('🎨 Rendering content:', {
      hasError: !!error,
      isLoading: loading,
      moodHistoryLength: moodHistory.length
    });

    if (error) {
      return (
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => refreshHistory(true)} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (loading && !moodHistory.length) {
      return (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      );
    }

    if (!moodHistory.length) {
      return (
        <View style={styles.centerContent}>
          <Text style={styles.emptyText}>No mood entries yet</Text>
          <Text style={styles.emptySubtext}>Your mood history will appear here</Text>
        </View>
      );
    }

    return (
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
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <MoodFilterChips
          selectedMood={selectedMood}
          onSelectMood={setSelectedMood}
        />
      </View>
      <Animated.View style={[styles.listContainer, { opacity: fadeAnim }]}>
        {renderContent()}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  filterContainer: {
    marginBottom: 8,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  section: {
    marginTop: 8,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    marginBottom: 12,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#6366F1',
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});
