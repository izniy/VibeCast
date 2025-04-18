import { Stack } from 'expo-router';
import { useAuth } from '../../app/providers/AuthProvider';
import { View, ActivityIndicator } from 'react-native';

export default function AuthLayout() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}