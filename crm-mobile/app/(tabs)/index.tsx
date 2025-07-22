import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, RefreshControl, Alert, TextInput, Pressable } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { useFocusEffect, Link } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { Stack } from 'expo-router';

// Definicje interfejsów pozostają bez zmian
interface Task {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string;
}

interface UpdateTaskDto {
  title: string;
  description?: string;
  dueDate?: string;
  completed: boolean;
}

export default function TabOneScreen() {
  const { token, logout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTasks = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('/api/user/tasks');
      const data = res.data;

      // Logika do obsługi .$values pozostaje
      let tasksData: Task[] = [];
      if (data && Array.isArray((data as any).$values)) {
        tasksData = (data as any).$values;
      } else if (Array.isArray(data)) {
        tasksData = data;
      } else {
        tasksData = [];
      }

      setTasks(tasksData);
      setFilteredTasks(tasksData);
    } catch (err) {
      setError('Nie udało się pobrać zadań.');
      if (axios.isAxiosError(err) && err.response?.status === 401) logout();
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [token, logout]);

  useFocusEffect(useCallback(() => { fetchTasks(); }, [fetchTasks]));

  const onRefresh = useCallback(() => {
    setSearchQuery(''); // Czyścimy wyszukiwanie przy odświeżaniu
    setIsRefreshing(true);
    fetchTasks();
  }, [fetchTasks]);

  // Logika filtrowania zadań
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredTasks(tasks);
    } else {
      const lowercasedQuery = searchQuery.toLowerCase();
      const filtered = tasks.filter(task =>
        task.title.toLowerCase().includes(lowercasedQuery) ||
        (task.description && task.description.toLowerCase().includes(lowercasedQuery))
      );
      setFilteredTasks(filtered);
    }
  }, [searchQuery, tasks]);

  const toggleComplete = async (task: Task) => {
    // Logika optymistycznego UI pozostaje
    setTasks(prevTasks =>
      prevTasks.map(t =>
        t.id === task.id ? { ...t, completed: !t.completed } : t
      )
    );

    const updateDto: UpdateTaskDto = {
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      completed: !task.completed,
    };

    try {
      await axios.put(`/api/user/tasks/${task.id}`, updateDto);
    } catch (error) {
      alert('Nie udało się zaktualizować zadania.');
      // Przywrócenie stanu w przypadku błędu
      setTasks(prevTasks =>
        prevTasks.map(t =>
          t.id === task.id ? { ...t, completed: task.completed } : t
        )
      );
    }
  };

  const handleDelete = (taskToDelete: Task) => {
    Alert.alert(
      "Potwierdź usunięcie",
      `Czy na pewno chcesz usunąć zadanie "${taskToDelete.title}"?`,
      [
        { text: "Anuluj", style: 'cancel' },
        {
          text: "Usuń",
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`/api/user/tasks/${taskToDelete.id}`);
              setTasks(prev => prev.filter(task => task.id !== taskToDelete.id));
            } catch (error) {
              Alert.alert("Błąd", "Nie udało się usunąć zadania.");
              console.error("Błąd usuwania zadania:", error);
            }
          }
        }
      ]
    );
  };

  // Reszta komponentu (renderowanie) pozostaje bez zmian
  if (loading && !isRefreshing) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#fff" /></View>;
  }

  if (error) {
    return <View style={styles.center}><Text style={styles.errorText}>{error}</Text></View>;
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Zadania',
          headerRight: () => (
            <Link href="/add-task" asChild>
              <Pressable>
                {({ pressed }) => (
                  <FontAwesome
                    name="plus-circle"
                    size={25}
                    color="white"
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
      <View style={styles.container}>
        {/* Wyszukiwarka */}
        <View style={styles.searchContainer}>
          <FontAwesome name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Szukaj po tytule lub opisie..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <FontAwesome name="times" size={16} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.taskContainer}>
              <TouchableOpacity onPress={() => toggleComplete(item)} style={styles.taskContent}>
                <FontAwesome
                  name={item.completed ? 'check-square-o' : 'square-o'}
                  size={24}
                  color={item.completed ? '#4ade80' : '#9ca3af'}
                  style={styles.checkbox}
                />
                <View style={styles.textContent}>
                  <Text style={[styles.taskTitle, item.completed && styles.completed]}>{item.title}</Text>
                  {item.description && <Text style={styles.taskDescription}>{item.description}</Text>}
                  {item.dueDate && (
                    <Text style={styles.dueDate}>
                      Termin: {new Date(item.dueDate).toLocaleDateString('pl-PL')}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
              <View style={styles.actionsContainer}>
                <Link href={{ pathname: "/edit-task", params: { taskId: item.id } }} asChild>
                  <TouchableOpacity style={styles.actionButton}>
                    <FontAwesome name="pencil" size={22} color="#facc15" />
                  </TouchableOpacity>
                </Link>
                <TouchableOpacity onPress={() => handleDelete(item)} style={styles.actionButton}>
                  <FontAwesome name="trash-o" size={22} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {searchQuery ? 'Brak zadań pasujących do wyszukiwania.' : 'Brak zadań do wyświetlenia.'}
            </Text>
          }
          contentContainerStyle={{ padding: 20 }}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#fff" />
          }
        />
      </View>
    </>
  );
}

// Style pozostają bez zmian
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111827' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111827' },
  errorText: { color: '#ef4444', fontSize: 16 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    borderRadius: 8,
    margin: 16,
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 45,
    color: '#fff',
    fontSize: 16,
  },
  clearButton: {
    padding: 8,
  },
  taskContainer: {
    backgroundColor: '#1f2937',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    marginRight: 15,
  },
  textContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  taskDescription: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 5,
  },
  dueDate: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    fontStyle: 'italic',
  },
  completed: {
    textDecorationLine: 'line-through',
    color: '#6b7280',
  },
  deleteButton: {
    padding: 5,
    marginLeft: 10,
  },
  emptyText: {
    textAlign: 'center',
    color: '#9ca3af',
    marginTop: 50,
    fontSize: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  actionButton: {
    padding: 5,
    marginLeft: 10,
  },
});