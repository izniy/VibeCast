import React from 'react';
import { View, Image, Text } from 'react-native';
import { useColorScheme } from 'nativewind';

export default function AppHeader() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View className={`
      flex-row items-center justify-between px-4 py-3 
      ${isDark ? 'bg-indigo-950/90' : 'bg-indigo-100/90'}
      shadow-md
    `}>
      <View className="flex-row items-center space-x-3">
        <Image 
          source={require('../../assets/adaptive-icon.png')} 
          className="w-10 h-10 rounded-xl" 
          resizeMode="contain"
        />
        <View>
          <Text className={`
            text-xl font-bold 
            ${isDark ? 'text-indigo-100' : 'text-indigo-800'}
          `}>
            VibeCast
          </Text>
          <Text className={`
            text-xs 
            ${isDark ? 'text-indigo-300' : 'text-indigo-600'}
          `}>
            Track your mood, feel the groove ✨
          </Text>
        </View>
      </View>
    </View>
  );
} 