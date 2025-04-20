import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { openSpotifyLink } from '@/services/spotify';
import { useColorScheme } from 'nativewind';
import { DEFAULT_ALBUM_ART } from '@/services/spotify';

interface MusicCardProps {
  title: string;
  artist: string;
  imageUrl: string;
  spotifyUrl: string;
}

export function MusicCard({ title, artist, imageUrl, spotifyUrl }: MusicCardProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handlePress = async () => {
    try {
      await openSpotifyLink(spotifyUrl);
    } catch (error) {
      console.error('Error opening Spotify link:', error);
    }
  };

  const handleImageError = () => {
    console.warn('Failed to load image for track:', {
      title,
      imageUrl
    });
  };

  return (
    <View style={[
      styles.card,
      isDark && styles.cardDark
    ]}>
      <Image
        source={{ uri: imageUrl }}
        style={styles.image}
        onError={handleImageError}
        defaultSource={{ uri: DEFAULT_ALBUM_ART }}
      />
      <View style={styles.content}>
        <Text 
          style={[styles.title, isDark && styles.textDark]} 
          numberOfLines={1}
        >
          {title}
        </Text>
        <Text 
          style={[styles.artist, isDark && styles.textDark]} 
          numberOfLines={1}
        >
          {artist}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.playButton}
        onPress={handlePress}
      >
        <Ionicons
          name="musical-note"
          size={24}
          color={isDark ? '#22C55E' : '#1DB954'}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginVertical: 6,
    marginHorizontal: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardDark: {
    backgroundColor: '#1F2937',
    shadowColor: '#000',
    shadowOpacity: 0.2,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  artist: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  textDark: {
    color: '#E5E7EB',
  },
  playButton: {
    padding: 8,
  },
}); 