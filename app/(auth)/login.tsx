import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '../providers/AuthProvider';
import { useColorScheme } from 'nativewind';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();
  const { colorScheme } = useColorScheme();

  const getErrorMessage = (error: Error): string => {
    const message = error.message.toLowerCase();
    
    if (message.includes('invalid login credentials')) {
      return 'Invalid email or password';
    }
    if (message.includes('invalid email')) {
      return 'Please enter a valid email address';
    }
    if (message.includes('password')) {
      return 'Password must be at least 6 characters long';
    }
    if (message.includes('rate limit')) {
      return 'Too many login attempts. Please try again later';
    }
    return 'An error occurred during sign in. Please try again';
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const { error } = await signIn(email, password);
      
      if (error) {
        Alert.alert('Error', getErrorMessage(error));
        return;
      }
      
      router.replace('/(tabs)');
    } catch (err) {
      Alert.alert(
        'Error',
        err instanceof Error ? getErrorMessage(err) : 'An unexpected error occurred'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 justify-center p-6 bg-gray-50 dark:bg-gray-900">
          <View className="space-y-6">
            {/* Header */}
            <View className="space-y-2">
              <Text className="text-3xl font-bold text-gray-900 dark:text-white">
                Welcome back
              </Text>
              <Text className="text-base text-gray-600 dark:text-gray-400">
                Sign in to your account to continue
              </Text>
            </View>

            {/* Error Message */}
            {/* {error && (
              <View className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg">
                <Text className="text-sm text-red-500 dark:text-red-400">{error}</Text>
              </View>
            )} */}

            {/* Form */}
            <View className="space-y-4">
              <View>
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </Text>
                <TextInput
                  className="w-full bg-white dark:bg-gray-800 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter your email"
                  placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </Text>
                <TextInput
                  className="w-full bg-white dark:bg-gray-800 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter your password"
                  placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoComplete="password"
                />
              </View>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              className={`mt-6 w-full bg-indigo-500 py-3 rounded-lg items-center ${
                loading ? 'opacity-70' : 'active:opacity-90'
              }`}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold text-base">
                  Sign In
                </Text>
              )}
            </TouchableOpacity>

            {/* Sign Up Link */}
            <View className="flex-row justify-center mt-6">
              <Text className="text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
              </Text>
              <Link href="/register" asChild>
                <TouchableOpacity>
                  <Text className="text-indigo-500 dark:text-indigo-400 font-semibold">
                    Sign Up
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}