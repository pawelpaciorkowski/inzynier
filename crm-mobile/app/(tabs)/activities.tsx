import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, ActivityIndicator, Text, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Stack } from 'expo-router';
import axios from 'axios';

// Interfejs dla aktywności
interface Activity {
  id: number;
  note: string;
  createdAt: string;
  userName: string;
  customerName: string;
}

export default function ActivitiesScreen() {
  // POPRAWKA: Używamy 'token' zamiast 'authToken' dla spójności
  const { token } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      if (!token) {
        setError('Brak tokena autoryzacyjnego.');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('/api/Activities');

        if (!response.data) {
          throw new Error('Nie udało się pobrać aktywności.');
        }

        // POPRAWKA: Przetwarzamy JSON tylko raz
        const responseData = response.data;

        // Sprawdzamy, czy dane są 'opakowane' i wyciągamy tablicę z pola $values
        if (responseData && Array.isArray((responseData as any).$values)) {
          setActivities((responseData as any).$values);
        } else if (Array.isArray(responseData)) {
          setActivities(responseData);
        } else {
          setActivities([]);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [token]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Błąd: {error}</Text>
      </View>
    );
  }

  return (
    <>
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
                {new Date(item.createdAt).toLocaleString('pl-PL')}
              </Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.noResultsText}>Brak aktywności</Text>}
        />
      </View>
    </>
  );
}

// Style dopasowane do ciemnego motywu
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