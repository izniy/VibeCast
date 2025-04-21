import { TouchableOpacity } from 'react-native';
import { View, Text } from '@/components/Themed';
import { useColorScheme } from 'nativewind';
import { MoodType } from '@/types/mood';

interface MoodGridProps {
  onSelectMood: (mood: MoodType) => void;
}

const MOODS = [
  { type: 'happy' as MoodType, emoji: '😊', label: 'Happy' },
  { type: 'sad' as MoodType, emoji: '😢', label: 'Sad' },
  { type: 'energetic' as MoodType, emoji: '⚡️', label: 'Energetic' },
  { type: 'relaxed' as MoodType, emoji: '😌', label: 'Relaxed' },
  { type: 'focused' as MoodType, emoji: '🎯', label: 'Focused' },
  { type: 'romantic' as MoodType, emoji: '💝', label: 'Romantic' },
  { type: 'angry' as MoodType, emoji: '😠', label: 'Angry' },
];

export function MoodGrid({ onSelectMood }: MoodGridProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View className="flex-row flex-wrap justify-around p-4">
      {MOODS.map(({ type, emoji, label }) => (
        <TouchableOpacity
          key={type}
          onPress={() => onSelectMood(type)}
          className={`w-[30%] aspect-square mb-4 items-center justify-center rounded-xl ${
            isDark ? 'bg-zinc-800' : 'bg-zinc-100'
          }`}
        >
          <Text className="text-4xl mb-2">{emoji}</Text>
          <Text className="text-sm">{label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
} 