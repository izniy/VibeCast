import { View, Text, StyleSheet, TouchableOpacity, Image, Animated } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../providers/AuthProvider';
import { supabase } from '@/lib/supabaseClient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MOODS = [
  { emoji: '😊', label: 'Happy', color: '#34D399' },
  { emoji: '😌', label: 'Calm', color: '#60A5FA' },
  { emoji: '😐', label: 'Neutral', color: '#9CA3AF' },
  { emoji: '😔', label: 'Sad', color: '#818CF8' },
  { emoji: '😤', label: 'Angry', color: '#F87171' },
];

const TOOLTIP_KEY = 'hasShownFabTooltip';
const TOOLTIP_DURATION = 3000; // 3 seconds

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [entry, setEntry] = useState('');
  const [showTooltip, setShowTooltip] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const tooltipAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate FAB entrance
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Check if tooltip should be shown
    checkTooltip();
  }, []);

  const checkTooltip = async () => {
    try {
      const hasShown = await AsyncStorage.getItem(TOOLTIP_KEY);
      if (!hasShown) {
        setShowTooltip(true);
        // Animate tooltip entrance
        Animated.timing(tooltipAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();

        // Auto-hide tooltip after duration
        setTimeout(() => {
          hideTooltip();
        }, TOOLTIP_DURATION);

        // Mark tooltip as shown
        await AsyncStorage.setItem(TOOLTIP_KEY, 'true');
      }
    } catch (error) {
      console.error('Error checking tooltip:', error);
    }
  };

  const hideTooltip = () => {
    Animated.timing(tooltipAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setShowTooltip(false));
  };

  const handleLogMood = () => {
    setShowTooltip(false);
    router.push('/mood' as any);
  };

  const saveMood = async (mood: string) => {
    try {
      setSelectedMood(mood);
      const { error } = await supabase.from('moods').insert({
        user_id: user?.id,
        mood: mood,
        entry: '',
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving mood:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1517021897933-0e0319cfbc28?q=80&w=2070&auto=format&fit=crop' }}
        style={styles.backgroundImage}
      />
      <View style={styles.overlay} />
      
      <View style={styles.content}>
        <Text style={styles.greeting}>How are you feeling today?</Text>
        
        <View style={styles.moodGrid}>
          {MOODS.map((mood) => (
            <TouchableOpacity
              key={mood.label}
              style={[
                styles.moodButton,
                selectedMood === mood.label && { backgroundColor: mood.color + '33' },
              ]}
              onPress={() => saveMood(mood.label)}
            >
              <Text style={styles.moodEmoji}>{mood.emoji}</Text>
              <Text style={[
                styles.moodLabel,
                selectedMood === mood.label && { color: mood.color },
              ]}>
                {mood.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {!user && (
          <View style={styles.loginPrompt}>
            <Text style={styles.loginText}>Sign in to track your moods</Text>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => router.push('/login')}
            >
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Animated.View style={[
        styles.fab,
        {
          opacity: fadeAnim,
          transform: [
            { scale: scaleAnim },
          ],
        },
      ]}>
        {showTooltip && (
          <Animated.View style={[
            styles.tooltip,
            {
              opacity: tooltipAnim,
              transform: [
                { translateY: tooltipAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [10, 0],
                })},
              ],
            },
          ]}>
            <Text style={styles.tooltipText}>Tap to log your mood</Text>
          </Animated.View>
        )}
        <TouchableOpacity
          style={styles.fabButton}
          onPress={handleLogMood}
        >
          <Ionicons name="add" size={30} color="white" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  greeting: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 40,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    marginTop: 20,
  },
  moodButton: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    width: '28%',
    aspectRatio: 1,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  moodEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  moodLabel: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
  },
  loginPrompt: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  loginText: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 12,
  },
  loginButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    alignItems: 'center',
  },
  fabButton: {
    backgroundColor: '#6366F1',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tooltip: {
    position: 'absolute',
    bottom: 70,
    backgroundColor: '#1F2937',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tooltipText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});