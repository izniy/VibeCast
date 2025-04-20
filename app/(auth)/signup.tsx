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
import { useRouter, Stack } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';

export default function SignUpScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signUp, error, loading, clearError } = useAuth();
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
      setIsSubmitting(true);
      await signUp(email, password, {
        data: { full_name: fullName }
      });
      Alert.alert(
        'Registration Successful',
        'Please check your email for verification instructions.',
        [{ 
          text: 'OK', 
          onPress: () => {
            router.replace('/login');
          }
        }]
      );
    } catch (err) {
      console.error('Signup error:', err);
      Alert.alert(
        'Registration Failed',
        err instanceof Error ? err.message : 'An unexpected error occurred'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ 
        headerShown: false,
      }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-gray-50 dark:bg-gray-900"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ 
            flexGrow: 1,
            justifyContent: 'center',
            padding: 20
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="space-y-8">
            <View className="items-center space-y-2">
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

              <View className="space-y-4">
                <TextInput
                  className="w-full bg-white dark:bg-gray-800 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                  placeholder="Full Name"
                  placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                  editable={!loading && !isSubmitting}
                />

                <TextInput
                  className="w-full bg-white dark:bg-gray-800 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                  placeholder="Email"
                  placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!loading && !isSubmitting}
                />

                <View className="relative">
                  <TextInput
                    className="w-full bg-white dark:bg-gray-800 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white pr-12"
                    placeholder="Password"
                    placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    editable={!loading && !isSubmitting}
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

                <View className="relative">
                  <TextInput
                    className="w-full bg-white dark:bg-gray-800 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white pr-12"
                    placeholder="Confirm Password"
                    placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    editable={!loading && !isSubmitting}
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

                <TouchableOpacity
                  className={`w-full bg-indigo-500 py-3 rounded-lg items-center ${
                    (loading || isSubmitting) ? 'opacity-70' : 'active:opacity-90'
                  }`}
                  onPress={handleSignUp}
                  disabled={loading || isSubmitting}
                >
                  <Text className="text-white font-semibold text-base">
                    {isSubmitting ? 'Creating Account...' : 'Create Account'}
                  </Text>
                </TouchableOpacity>

                <View className="flex-row justify-center">
                  <Text className="text-gray-600 dark:text-gray-400">
                    Already have an account?{' '}
                  </Text>
                  <TouchableOpacity 
                    onPress={() => router.replace('/login')} 
                    disabled={loading || isSubmitting}
                  >
                    <Text className="text-indigo-500 dark:text-indigo-400 font-semibold">
                      Sign In
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
} 