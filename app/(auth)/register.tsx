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

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();
  const { colorScheme } = useColorScheme();

  const getErrorMessage = (error: Error): string => {
    const message = error.message.toLowerCase();
    
    if (message.includes('email already registered')) {
      return 'This email is already registered. Please sign in instead';
    }
    if (message.includes('invalid email')) {
      return 'Please enter a valid email address';
    }
    if (message.includes('weak password')) {
      return 'Password is too weak. Please use at least 6 characters with a mix of letters and numbers';
    }
    if (message.includes('rate limit')) {
      return 'Too many signup attempts. Please try again later';
    }
    return 'An error occurred during sign up. Please try again';
  };

  const validateForm = () => {
    if (!email || !password || !confirmPassword) {
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

    // Basic email validation
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
      setLoading(true);
      const { error } = await signUp(email, password);
      
      if (error) {
        Alert.alert('Error', getErrorMessage(error));
        return;
      }
      
      Alert.alert(
        'Success',
        'Account created successfully! Please check your email to verify your account.',
        [{ text: 'OK', onPress: () => router.replace('/login') }]
      );
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
                Create Account
              </Text>
              <Text className="text-base text-gray-600 dark:text-gray-400">
                Sign up to get started
              </Text>
            </View>

            {/* Error Message */}
            {error && (
              <View className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg">
                <Text className="text-sm text-red-500 dark:text-red-400">{error}</Text>
              </View>
            )}

            {/* Form */}
            <View className="space-y-4">
              {/* Email Input */}
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

              {/* Password Input */}
              <View>
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </Text>
                <TextInput
                  className="w-full bg-white dark:bg-gray-800 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                  placeholder="Create a password"
                  placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoComplete="password-new"
                />
              </View>

              {/* Confirm Password Input */}
              <View>
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm Password
                </Text>
                <TextInput
                  className="w-full bg-white dark:bg-gray-800 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                  placeholder="Confirm your password"
                  placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  autoComplete="password-new"
                />
              </View>
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity
              className={`mt-6 w-full bg-indigo-500 py-3 rounded-lg items-center ${
                loading ? 'opacity-70' : 'active:opacity-90'
              }`}
              onPress={handleSignUp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold text-base">
                  Create Account
                </Text>
              )}
            </TouchableOpacity>

            {/* Login Link */}
            <View className="flex-row justify-center mt-6">
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
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}