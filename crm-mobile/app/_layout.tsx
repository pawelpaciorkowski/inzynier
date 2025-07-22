import { SplashScreen, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '../context/AuthContext'; // Upewnij się, że ścieżka jest poprawna
import { Slot } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

// Zapobiegaj automatycznemu ukrywaniu ekranu powitalnego
SplashScreen.preventAutoHideAsync();

function InitialLayout() {
  // ✅ POPRAWKA: Używamy `isAuthenticated` i `isLoading` - zgodnie z Twoim AuthContext.
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Jeśli stan ładowania się nie zakończył, nic nie rób.
    if (isLoading) {
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';

    // ✅ Logika oparta o `isAuthenticated`
    if (isAuthenticated && inAuthGroup) {
      // Jeśli użytkownik jest uwierzytelniony i jest na ekranie logowania, przekieruj go do aplikacji.
      router.replace('/(protected)/(tabs)/customers');
    } else if (!isAuthenticated && !inAuthGroup) {
      // Jeśli nie jest uwierzytelniony i jest poza ekranem logowania, przekieruj go do logowania.
      router.replace('/(auth)/login');
    }

    // Gdy cała logika jest gotowa, ukryj ekran powitalny
    SplashScreen.hideAsync();
  }, [isAuthenticated, isLoading, segments]); // Obserwuj poprawną zmienną

  // Dopóki isLoading jest true, pokazuj ekran ładowania.
  // To zapobiega błędom renderowania na chronionych ekranach.
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111827' }}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  // <Slot /> renderuje odpowiednią grupę tras: (auth) lub (protected)
  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <InitialLayout />
    </AuthProvider>
  );
}