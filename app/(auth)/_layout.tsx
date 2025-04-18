import { Stack } from 'expo-router';
import { useAuth } from '../providers/AuthProvider';
import { Redirect } from 'expo-router';

export default function AuthLayout() {
  const { user, loading } = useAuth();

  // Handle the loading state
  if (loading) {
    return null; // Or a loading screen component
  }

  // If user is authenticated, redirect to the main app
  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="login"
        options={{
          title: 'Sign In',
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          title: 'Create Account',
        }}
      />
    </Stack>
  );
}