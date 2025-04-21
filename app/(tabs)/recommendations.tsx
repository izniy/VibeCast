import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useRecommendations } from '@/hooks/useRecommendations';
import { MovieCard } from '@/components/recommendations/MovieCard';
import { AffirmationCard } from '@/components/recommendations/AffirmationCard';
import { MusicCard } from '@/components/recommendations/MusicCard';
import { SkeletonCard } from '@/components/recommendations/SkeletonCard';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import { getRotatedAffirmation } from '@/utils/affirmations';

export default function RecommendationsScreen() {
  const { recommendations, loading, error, fetchRecommendations } = useRecommendations();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleRetry = () => {
    if (recommendations?.lastMood) {
      fetchRecommendations(recommendations.lastMood);
    }
  };

  const renderSkeletons = (type: 'affirmation' | 'movie' | 'music') => (
    <ScrollView 
      horizontal={type === 'movie'}
      showsHorizontalScrollIndicator={false} 
      style={styles.section}
      contentContainerStyle={styles.sectionContent}
    >
      {[...Array(type === 'movie' ? 5 : type === 'music' ? 3 : 1)].map((_, index) => (
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
    layout: 'horizontal' | 'vertical'
  ) => (
    <>
      <View style={styles.sectionHeader}>
        <Ionicons name={icon} size={24} color={isDark ? '#E5E7EB' : '#1F2937'} />
        <Text style={[styles.title, isDark && { color: '#E5E7EB' }]}>{title}</Text>
      </View>
      
      {!loading && description && (
        <Text style={[styles.description, isDark && { color: '#9CA3AF' }]}>
          {description}
        </Text>
      )}
      
      {loading ? (
        renderSkeletons(layout === 'horizontal' ? 'movie' : layout === 'vertical' ? 'music' : 'affirmation')
      ) : layout === 'horizontal' ? (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.section}
          contentContainerStyle={styles.sectionContent}
        >
          {items.length === 0 ? (
            <Text style={[styles.emptyText, isDark && { color: '#9CA3AF' }]}>
              No {title.toLowerCase()} available
            </Text>
          ) : (
            items.map(renderItem)
          )}
        </ScrollView>
      ) : (
        <View style={[styles.section, styles.sectionContent]}>
          {items.length === 0 ? (
            <Text style={[styles.emptyText, isDark && { color: '#9CA3AF' }]}>
              No {title.toLowerCase()} available
            </Text>
          ) : (
            items.map(renderItem)
          )}
        </View>
      )}
    </>
  );

  if (error) {
    return (
      <View style={[styles.container, isDark && { backgroundColor: '#1F2937' }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.error, isDark && { color: '#EF4444' }]}>{error}</Text>
          <TouchableOpacity 
            style={[styles.retryButton, isDark && { backgroundColor: '#3B82F6' }]} 
            onPress={handleRetry}
          >
            <Ionicons name="refresh" size={20} color="white" />
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!recommendations && !loading) {
    return (
      <View style={[styles.container, styles.emptyContainer, isDark && { backgroundColor: '#1F2937' }]}>
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
    <ScrollView 
      style={[styles.container, isDark && { backgroundColor: '#1F2937' }]}
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
          <Text style={[
            styles.description, 
            { fontWeight: 'bold', marginTop: 16 },
            isDark && { color: '#E5E7EB' }
          ]}>
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

          {/* Music Section */}
          {renderSection(
            'Music for Your Mood',
            'musical-notes',
            recommendations.musicDescription,
            recommendations.music || [],
            (track) => (
              <MusicCard
                key={track.id}
                title={track.name}
                artist={track.artists.join(', ')}
                imageUrl={track.album.images[0]?.url}
                spotifyUrl={track.external_urls.spotify}
              />
            ),
            'vertical'
          )}

          <View 
            style={[
              styles.divider,
              { backgroundColor: isDark ? '#374151' : '#E5E7EB' }
            ]} 
          />

          {/* Movies Section */}
          {renderSection(
            'Movies for Your Mood',
            'film',
            recommendations.movieDescription,
            recommendations.movies || [],
            (movie) => <MovieCard key={movie.id} movie={movie} />,
            'horizontal'
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: '5%',
  },
  section: {
    marginVertical: 8,
  },
  sectionContent: {
    paddingHorizontal: '2%',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: '2%',
    marginTop: 16,
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    paddingHorizontal: '2%',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
    marginHorizontal: '5%',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: '5%',
  },
  error: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  retryText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContent: {
    alignItems: 'center',
    padding: '5%',
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
  affirmationContainer: {
    paddingHorizontal: '5%',
  },
});
