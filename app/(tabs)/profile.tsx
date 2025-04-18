import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { useAuth } from '../../lib/auth';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type MenuItem = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  onPress: () => void;
};

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/login');
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  const menuItems: MenuItem[] = [
    {
      icon: 'person-outline',
      title: 'Edit Profile',
      onPress: () => Alert.alert('Coming Soon', 'This feature will be available soon!')
    },
    {
      icon: 'notifications-outline',
      title: 'Notifications',
      onPress: () => Alert.alert('Coming Soon', 'This feature will be available soon!')
    },
    {
      icon: 'settings-outline',
      title: 'Settings',
      onPress: () => Alert.alert('Coming Soon', 'This feature will be available soon!')
    },
    {
      icon: 'help-circle-outline',
      title: 'Help & Support',
      onPress: () => Alert.alert('Coming Soon', 'This feature will be available soon!')
    },
    {
      icon: 'log-out-outline',
      title: 'Sign Out',
      onPress: handleSignOut
    }
  ];

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Profile Header */}
      <View className="items-center pt-8 pb-6 bg-white dark:bg-gray-800">
        <View className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden mb-4">
          <Image
            source={{ uri: user?.user_metadata?.avatar_url || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y' }}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>
        <Text className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
          {user?.user_metadata?.full_name || 'VibeCast User'}
        </Text>
        <Text className="text-sm text-gray-500 dark:text-gray-400">
          {user?.email}
        </Text>
      </View>

      {/* Menu Items */}
      <View className="mt-4">
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={item.onPress}
            className="flex-row items-center px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700"
          >
            <Ionicons
              name={item.icon}
              size={24}
              className="text-gray-600 dark:text-gray-400"
            />
            <Text className="flex-1 ml-4 text-gray-800 dark:text-white">
              {item.title}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              className="text-gray-400"
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* App Version */}
      <Text className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6 mb-8">
        VibeCast v1.0.0
      </Text>
    </ScrollView>
  );
} 