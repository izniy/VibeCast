import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Text } from 'react-native-paper';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '../providers/AuthProvider';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import { supabase } from '../lib/supabase';

export default function SignUpScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signUp, error, isLoading, clearError } = useAuth();
  const router = useRouter();
  const { colorScheme } = useColorScheme();

  const validateForm = () => {
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;
    
    try {
      await signUp(email, password);

      // Update user metadata with full name
      const { error: updateError } = await supabase.auth.updateUser({
        data: { full_name: fullName }
      });

      if (updateError) {
        console.error('Error updating user metadata:', updateError);
        // Continue with signup flow even if metadata update fails
      }

      Alert.alert(
        'Registration Successful',
        'Please check your email for verification instructions.',
        [{ text: 'OK', onPress: () => router.push('/login' as any) }]
      );
    } catch (err) {
      // Error is handled by AuthProvider
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gray-50 dark:bg-gray-900"
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 24, justifyContent: 'center' }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="space-y-8">
          <View className="space-y-2">
            <Text 
              variant="headlineLarge" 
              className="text-3xl font-bold text-gray-900 dark:text-white text-center"
            >
              Create Account
            </Text>
            <Text 
              variant="bodyLarge" 
              className="text-base text-gray-600 dark:text-gray-400 text-center"
            >
              Sign up to start tracking your moods
            </Text>
          </View>

          <View className="space-y-4">
            {error && (
              <TouchableOpacity 
                onPress={clearError}
                className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg"
              >
                <Text className="text-sm text-red-500 dark:text-red-400 text-center">
                  {error}
                </Text>
              </TouchableOpacity>
            )}

            <View className="space-y-2">
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Full Name
              </Text>
              <TextInput
                className="w-full bg-white dark:bg-gray-800 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter your full name"
                placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
                editable={!isLoading}
              />
            </View>

            <View className="space-y-2">
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </Text>
              <TextInput
                className="w-full bg-white dark:bg-gray-800 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter your email"
                placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!isLoading}
              />
            </View>

            <View className="space-y-2">
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </Text>
              <View className="relative">
                <TextInput
                  className="w-full bg-white dark:bg-gray-800 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white pr-12"
                  placeholder="Create a password"
                  placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  className="absolute right-3 top-3"
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={24}
                    color={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View className="space-y-2">
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirm Password
              </Text>
              <View className="relative">
                <TextInput
                  className="w-full bg-white dark:bg-gray-800 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white pr-12"
                  placeholder="Confirm your password"
                  placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  className="absolute right-3 top-3"
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off' : 'eye'}
                    size={24}
                    color={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              className={`w-full bg-indigo-500 py-3 rounded-lg items-center ${
                isLoading ? 'opacity-70' : 'active:opacity-90'
              }`}
              onPress={handleSignUp}
              disabled={isLoading}
            >
              <Text className="text-white font-semibold text-base">
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>

            <View className="flex-row justify-center">
              <Text className="text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
              </Text>
              <Link href="/login" asChild>
                <TouchableOpacity>
                  <Text className="text-indigo-500 dark:text-indigo-400 font-semibold">
                    Sign In
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
} 