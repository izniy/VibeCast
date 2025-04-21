import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { useColorScheme } from 'nativewind';

export default function AppHeader() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={[ 
      styles.container, 
      { backgroundColor: isDark ? 'rgba(49, 46, 129, 0.9)' : 'rgba(224, 231, 255, 0.9)' }
    ]}>
      <View style={styles.logoRow}>
        <View style={styles.emojiWrapper}>
          <Image 
            source={require('../../assets/adaptive-icon.png')} 
            style={styles.icon}
            resizeMode="contain"
          />
        </View>
        <View>
          <Text style={[ 
            styles.title, 
          ]}>
            VibeCast
          </Text>
          <Text style={[ 
            styles.subtitle, 
            { color: isDark ? '#A5B4FC' : '#6366F1' }
          ]}>
            Track your mood, feel the groove ✨
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 2,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emojiWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 4,
  },
  icon: {
    width: 28,
    height: 28,
    borderRadius: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 12,
  },
});