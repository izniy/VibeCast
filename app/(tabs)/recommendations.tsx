import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useRecommendations } from '@/hooks/useRecommendations';
import { RecommendationsProvider } from '@/providers/RecommendationsProvider';
import { MovieCard } from '@/components/recommendations/MovieCard';
import { AffirmationCard } from '@/components/recommendations/AffirmationCard';
import { SkeletonCard } from '@/components/recommendations/SkeletonCard';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import { getRotatedAffirmation, getDailyAffirmationIndex } from '@/utils/affirmations';

export default function RecommendationsScreen() {
  const { recommendations, loading, error, fetchRecommendations } = useRecommendations();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleRetry = () => {
    if (recommendations?.lastMood) {
      fetchRecommendations(recommendations.lastMood);
    }
  };

  const renderSkeletons = (type: 'affirmation' | 'movie') => (
    <ScrollView 
      horizontal={type === 'movie'}
      showsHorizontalScrollIndicator={false} 
      style={styles.section}
      contentContainerStyle={styles.sectionContent}
    >
      {[...Array(type === 'movie' ? 5 : 1)].map((_, index) => (
        <SkeletonCard key={index} type={type} />
      ))}
    </ScrollView>
  );

  const renderSection = (
    title: string,
    icon: keyof typeof Ionicons.glyphMap,
    description: string | undefined,
    items: any[],
    renderItem: (item: any) => JSX.Element,
    type: 'movie'
  ) => (
    <>
      <View style={styles.sectionHeader}>
        <Ionicons name={icon} size={24} color={isDark ? '#E5E7EB' : '#1F2937'} />
        <Text style={[styles.title, isDark && { color: '#E5E7EB' }]}>{title}</Text>
      </View>
      
      {!loading && description && (
        <Text style={styles.description}>{description}</Text>
      )}
      
      {loading ? (
        renderSkeletons(type)
      ) : (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.section}
          contentContainerStyle={styles.sectionContent}
        >
          {items.length === 0 ? (
            <Text style={styles.emptyText}>No {title.toLowerCase()} available</Text>
          ) : (
            items.map(renderItem)
          )}
        </ScrollView>
      )}
    </>
  );

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.error}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Ionicons name="refresh" size={20} color="white" />
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!recommendations && !loading) {
    return (
      <View style={[styles.container, styles.emptyContainer]}>
        <View style={styles.emptyContent}>
          <Ionicons 
            name="heart" 
            size={48} 
            color={isDark ? '#9CA3AF' : '#6B7280'} 
            style={styles.emptyIcon} 
          />
          <Text style={[styles.emptyText, isDark && { color: '#9CA3AF' }]}>
            Log your mood to get personalized recommendations!
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        style={[styles.scrollView, isDark && { backgroundColor: '#1F2937' }]}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={handleRetry}
            tintColor={isDark ? 'white' : 'black'}
          />
        }
      >
        {recommendations?.lastMood && (
          <>
            <Text style={[styles.description, { fontWeight: 'bold', marginTop: 16 }]}>
              Based on your mood: {recommendations.lastMood}
            </Text>

            {/* Affirmation Section */}
            <View style={[styles.sectionHeader, { marginTop: 24 }]}>
              <Ionicons name="sparkles" size={24} color={isDark ? '#E5E7EB' : '#1F2937'} />
              <Text style={[styles.title, isDark && { color: '#E5E7EB' }]}>
                Your Daily Affirmation
              </Text>
            </View>
            
            <View style={styles.affirmationContainer}>
              {loading ? (
                renderSkeletons('affirmation')
              ) : (
                <AffirmationCard 
                  mood={recommendations.lastMood} 
                  affirmation={getRotatedAffirmation(recommendations.lastMood)} 
                />
              )}
            </View>

            <View 
              style={[
                styles.divider,
                { backgroundColor: isDark ? '#374151' : '#E5E7EB' }
              ]} 
            />
          </>
        )}

        {/* Movies Section */}
        {renderSection(
          'Movies for Your Mood',
          'film',
          recommendations?.movieDescription,
          recommendations?.movies || [],
          (movie) => <MovieCard key={movie.id} movie={movie} />,
          'movie'
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  section: {
    marginTop: 12,
  },
  sectionContent: {
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 8,
    color: '#1F2937',
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
    paddingHorizontal: 16,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContent: {
    alignItems: 'center',
    padding: 20,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    maxWidth: '80%',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  error: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  affirmationContainer: {
    paddingVertical: 16,
  },
  divider: {
    height: 1,
    marginVertical: 24,
  },
}); 