import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { format } from 'date-fns';
import { useAuth } from '../providers/AuthProvider';
import { getMoodEntries, deleteMoodEntry, type MoodEntry } from '../services/mood';
import { Ionicons } from '@expo/vector-icons';

export default function HistoryScreen() {
  const { user } = useAuth();
  const [moodHistory, setMoodHistory] = React.useState<MoodEntry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadMoodHistory();
    }
  }, [user]);

  const loadMoodHistory = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const entries = await getMoodEntries(user.id);
      setMoodHistory(entries);
    } catch (err) {
      setError('Failed to load mood history');
      console.error('Error loading mood history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (entryId: string) => {
    try {
      await deleteMoodEntry(entryId);
      await loadMoodHistory();
    } catch (err) {
      console.error('Error deleting mood entry:', err);
    }
  };

  const renderItem = ({ item }: { item: MoodEntry }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.mood}>{item.mood}</Text>
        <TouchableOpacity
          onPress={() => handleDelete(item.id)}
          style={styles.deleteButton}
        >
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
      {item.journal_entry && (
        <Text style={styles.journal}>{item.journal_entry}</Text>
      )}
      <Text style={styles.date}>
        {format(new Date(item.created_at), 'PPpp')}
      </Text>
    </View>
  );

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={moodHistory}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          loading ? (
            <Text style={styles.emptyText}>Loading...</Text>
          ) : (
            <Text style={styles.emptyText}>No mood entries yet</Text>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingTop: 20,
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mood: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    textTransform: 'capitalize',
  },
  deleteButton: {
    padding: 4,
  },
  journal: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 12,
    lineHeight: 20,
  },
  date: {
    fontSize: 12,
    color: '#6B7280',
  },
  error: {
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 16,
    marginTop: 20,
  },
});