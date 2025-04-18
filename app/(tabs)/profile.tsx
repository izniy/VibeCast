import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../../app/providers/AuthProvider';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text as PaperText } from 'react-native-paper';
import { supabase } from '../../app/lib/supabase';
import { useColorScheme } from 'nativewind';
import Constants from 'expo-constants';

type MenuItem = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  onPress: () => void;
};

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newName, setNewName] = useState(user?.user_metadata?.full_name || '');
  const { colorScheme } = useColorScheme();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/login');
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  const handleSaveProfile = async () => {
    if (!newName.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    setIsUpdating(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: newName.trim() }
      });

      if (error) throw error;

      // Force a refresh of the session to update the UI
      const { error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) throw refreshError;

      setShowEditModal(false);
      Alert.alert('Success', 'Name updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update name. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditProfile = () => {
    setNewName(user?.user_metadata?.full_name || '');
    setShowEditModal(true);
  };

  const menuItems: MenuItem[] = [
    {
      icon: 'person-outline',
      title: 'Edit Profile',
      onPress: handleEditProfile
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

  const fullName = user?.user_metadata?.full_name || 'Anonymous';
  const email = user?.email || '';

  return (
    <>
      <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
        <View className="p-6 space-y-4">
          <View className="space-y-1">
            <PaperText 
              variant="headlineLarge" 
              className="text-2xl font-bold text-gray-900 dark:text-white"
            >
              {fullName}
            </PaperText>
            <PaperText 
              variant="bodyLarge"
              className="text-gray-600 dark:text-gray-400"
            >
              {email}
            </PaperText>
          </View>
        </View>

        {/* Menu Items */}
        <View className="mt-4">
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={item.onPress}
              disabled={isUpdating}
              className={`flex-row items-center px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 ${
                isUpdating ? 'opacity-50' : ''
              }`}
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
          VibeCast v{Constants.expoConfig?.version || '1.0.0'}
        </Text>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1 justify-end"
        >
          <View className="bg-white dark:bg-gray-800 rounded-t-3xl">
            <View className="p-6 space-y-6">
              <View className="flex-row justify-between items-center">
                <Text className="text-xl font-semibold text-gray-900 dark:text-white">
                  Edit Profile
                </Text>
                <TouchableOpacity
                  onPress={() => setShowEditModal(false)}
                  disabled={isUpdating}
                >
                  <Ionicons
                    name="close"
                    size={24}
                    color={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
                  />
                </TouchableOpacity>
              </View>

              <View className="space-y-2">
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Full Name
                </Text>
                <TextInput
                  className="w-full bg-white dark:bg-gray-700 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                  placeholder="Enter your full name"
                  placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
                  value={newName}
                  onChangeText={setNewName}
                  autoCapitalize="words"
                  editable={!isUpdating}
                />
              </View>

              <View className="flex-row space-x-4">
                <TouchableOpacity
                  className="flex-1 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 items-center"
                  onPress={() => setShowEditModal(false)}
                  disabled={isUpdating}
                >
                  <Text className="text-gray-800 dark:text-gray-200 font-semibold">
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-1 py-3 rounded-lg items-center bg-indigo-500 ${
                    isUpdating ? 'opacity-70' : 'active:opacity-90'
                  }`}
                  onPress={handleSaveProfile}
                  disabled={isUpdating}
                >
                  <Text className="text-white font-semibold">
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
} 