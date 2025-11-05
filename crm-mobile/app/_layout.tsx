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

/**
 * Komponent do zarządzania nawigacją i autentykacją.
 * @returns {JSX.Element | null} - Zwraca null, ponieważ logika nawigacji jest w useEffect.
 */
const InitialLayout = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useReminders();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'login';

    if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    } else if (!isAuthenticated && !inAuthGroup) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, segments]);

  return null;
};

/**
 * Główny komponent layoutu aplikacji, który ładuje czcionki i dostarcza kontekst autentykacji.
 * @returns {JSX.Element | null} - Zwraca layout aplikacji lub null, jeśli czcionki nie są załadowane.
 */
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
      <Stack screenOptions={{
        headerStyle: { backgroundColor: '#1f2937' },
        headerTintColor: '#fff',
      }}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="add-task" options={{ presentation: 'modal', title: 'Nowe Zadanie', contentStyle: { backgroundColor: '#111827' } }} />
        <Stack.Screen name="edit-task" options={{ presentation: 'modal', title: 'Edytuj Zadanie' }} />
        <Stack.Screen name="notifications" options={{ presentation: 'modal', title: 'Powiadomienia' }} />
        <Stack.Screen name="reminders" options={{ presentation: 'modal', title: 'Przypomnienia' }} />
      </Stack>
      <InitialLayout />
    </AuthProvider>
  );
}