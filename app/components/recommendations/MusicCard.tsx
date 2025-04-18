import React, { useRef, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Animated, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SpotifyTrack } from '../../../services/spotifyService';

interface MusicCardProps {
  song: SpotifyTrack;
}

export function MusicCard({ song }: MusicCardProps) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <TouchableOpacity 
        style={styles.touchable}
        onPress={() => {
          if (song.external_urls.spotify) {
            Linking.openURL(song.external_urls.spotify);
          }
        }}
      >
        <Image 
          source={{ uri: song.album.images[0].url }} 
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.content}>
          <Text numberOfLines={1} style={styles.title}>
            {song.name}
          </Text>
          <Text numberOfLines={1} style={styles.artist}>
            {song.artists[0].name}
          </Text>
          {song.preview_url && (
            <TouchableOpacity 
              style={styles.previewButton}
              onPress={() => Linking.openURL(song.preview_url!)}
            >
              <Ionicons name="play-circle" size={24} color="#6366F1" />
              <Text style={styles.previewText}>Preview</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 160,
    marginRight: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  touchable: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: 160,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  artist: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  previewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  previewText: {
    fontSize: 12,
    color: '#6366F1',
    fontWeight: '500',
  },
}); 