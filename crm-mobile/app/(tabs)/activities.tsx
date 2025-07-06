import React, { useEffect, useState, useContext } from 'react';
import { StyleSheet, FlatList, ActivityIndicator, View, Text } from 'react-native';
import { useAuth } from '../../context/AuthContext'; // Upewnij się, że ścieżka jest poprawna
import { Text as ThemedText, View as ThemedView } from '../../components/Themed'; // Zakładam, że masz Themed komponenty

interface Activity {
  id: string;
  note: string;
  createdAt: string;
  userName: string;
  customerName: string;
}

export default function ActivitiesScreen() {
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
        const response = await fetch('http://10.0.2.2:5167/api/Activities', { // Zmieniono na adres dla emulatora Androida z poprawnym portem
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Nie udało się pobrać aktywności.');
        }

        const data: Activity[] = await response.json();
        setActivities(data);
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
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" />
        <ThemedText>Ładowanie aktywności...</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText style={styles.errorText}>Błąd: {error}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Ostatnie Aktywności</ThemedText>
      {activities.length === 0 ? (
        <ThemedText style={styles.noActivitiesText}>Brak aktywności do wyświetlenia.</ThemedText>
      ) : (
        <FlatList
          data={activities}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.activityItem}>
              <ThemedText style={styles.activityNote}>{item.note}</ThemedText>
              <ThemedText style={styles.activityDetails}>
                Klient: {item.customerName || 'N/A'} | Użytkownik: {item.userName || 'N/A'}
              </ThemedText>
              <ThemedText style={styles.activityDate}>
                {new Date(item.createdAt).toLocaleString()}
              </ThemedText>
            </View>
          )}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  activityItem: {
    backgroundColor: '#f0f0f0', // Możesz użyć ThemedView dla tła
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  activityNote: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  activityDetails: {
    fontSize: 14,
    color: '#555', // Możesz użyć ThemedText dla koloru
    marginBottom: 3,
  },
  activityDate: {
    fontSize: 12,
    color: '#888', // Możesz użyć ThemedText dla koloru
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  noActivitiesText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
  },
});
