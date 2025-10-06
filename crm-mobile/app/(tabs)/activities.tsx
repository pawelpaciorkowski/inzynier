import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, ActivityIndicator, Text, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Stack } from 'expo-router';
import api from '../../services/api';

// Definiuje strukturę obiektu aktywności
interface Activity {
  id: number; // Unikalny identyfikator aktywności
  note: string; // Treść (opis) aktywności
  createdAt: string; // Data utworzenia aktywności
  userName: string; // Nazwa użytkownika, który wykonał aktywność
  customerName: string; // Nazwa klienta, którego dotyczyła aktywność
}

/**
 * Komponent ekranu wyświetlającego listę aktywności.
 * Pobiera i wyświetla aktywności z API.
 * @returns {JSX.Element} - Zwraca widok z listą aktywności.
 */
export default function ActivitiesScreen() {
  // Pobiera token uwierzytelniający z kontekstu
  const { token } = useAuth();
  // Stan przechowujący listę aktywności
  const [activities, setActivities] = useState<Activity[]>([]);
  // Stan wskazujący, czy trwa ładowanie danych
  const [loading, setLoading] = useState(true);
  // Stan przechowujący ewentualny błąd
  const [error, setError] = useState<string | null>(null);

  // Efekt pobierający aktywności po zamontowaniu komponentu
  useEffect(() => {
    // Asynchroniczna funkcja do pobierania aktywności
    const fetchActivities = async () => {
      // Sprawdza, czy token jest dostępny
      if (!token) {
        setError('Brak tokena autoryzacyjnego.');
        setLoading(false);
        return;
      }

      try {
        // Wykonuje zapytanie GET do API w celu pobrania aktywności
        const response = await api.get('/Activities');

        // Sprawdza, czy odpowiedź zawiera dane
        if (!response.data) {
          throw new Error('Nie udało się pobrać aktywności.');
        }

        // Przetwarza dane odpowiedzi
        const responseData = response.data;

        // Sprawdza format danych i wyciąga tablicę z pola $values, jeśli istnieje
        if (responseData && Array.isArray((responseData as any).$values)) {
          setActivities((responseData as any).$values);
        } else if (Array.isArray(responseData)) {
          setActivities(responseData);
        } else {
          setActivities([]);
        }
      } catch (err: any) {
        // Ustawia błąd w przypadku niepowodzenia
        setError(err.message);
      } finally {
        // Kończy stan ładowania
        setLoading(false);
      }
    };

    // Wywołuje funkcję pobierającą aktywności
    fetchActivities();
  }, [token]); // Efekt uruchamia się ponownie, gdy zmieni się token

  // Jeśli dane się ładują, wyświetla wskaźnik aktywności
  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  // Jeśli wystąpił błąd, wyświetla komunikat o błędzie
  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Błąd: {error}</Text>
      </View>
    );
  }

  // Renderuje główny widok komponentu
  return (
    <>
      {/* Konfiguracja nagłówka ekranu */}
      <Stack.Screen options={{ title: 'Aktywności' }} />
      <View style={styles.container}>
        <FlatList
          data={activities}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.activityItem}>
              <Text style={styles.activityNote}>{item.note}</Text>
              <Text style={styles.activityDetails}>
                Klient: {item.customerName || 'Brak'} | Użytkownik: {item.userName || 'Brak'}
              </Text>
              <Text style={styles.activityDate}>
                {item.createdAt ? new Date(item.createdAt).toLocaleString('pl-PL') : 'Brak daty'}
              </Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.noResultsText}>Brak aktywności</Text>}
        />
      </View>
    </>
  );
}

// Definicje stylów dla komponentu
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityItem: {
    backgroundColor: '#1f2937',
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b', // Żółty akcent
  },
  activityNote: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  activityDetails: {
    fontSize: 14,
    color: '#9ca3af',
    marginVertical: 5,
  },
  activityDate: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'right',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
  },
  noResultsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#6b7280',
  }
});
