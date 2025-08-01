import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { Stack } from 'expo-router';
import { useReminders } from '../hooks/useReminders';

export {
  ErrorBoundary,
} from 'expo-router';

const InitialLayout = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // Hook przypomnień - aktywny tylko gdy użytkownik jest zalogowany
  useReminders();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'login'; // Sprawdzamy, czy jesteśmy na ekranie logowania

    if (isAuthenticated && inAuthGroup) {
      // Jeśli zalogowany i na ekranie logowania, przekieruj do (tabs)
      router.replace('/(tabs)');
    } else if (!isAuthenticated && !inAuthGroup) {
      // Jeśli niezalogowany i nie na ekranie logowania, przekieruj do login
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, segments]);

  return (
    <Stack screenOptions={{
      headerStyle: { backgroundColor: '#1f2937' },
      headerTintColor: '#fff',
    }}>
      <Stack.Screen name="login" options={{ headerShown: false }} /> {/* Ustaw login jako pierwszy ekran */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="add-task" options={{ presentation: 'modal', title: 'Nowe Zadanie', contentStyle: { backgroundColor: '#111827' } }} />
      <Stack.Screen name="edit-task" options={{ presentation: 'modal', title: 'Edytuj Zadanie' }} />
      <Stack.Screen name="notifications" options={{ presentation: 'modal', title: 'Powiadomienia' }} />
      <Stack.Screen name="reminders" options={{ presentation: 'modal', title: 'Przypomnienia' }} />
    </Stack>
  );
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <InitialLayout />
    </AuthProvider>
  );
}