import { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Picker } from '@react-native-picker/picker';

// Definiuje strukturę obiektu klienta
interface Customer { id: number; name: string; }

// Definiuje strukturę obiektu DTO (Data Transfer Object) do aktualizacji zadania
interface UpdateTaskDto {
    title: string; // Tytuł zadania
    description?: string; // Opis zadania (opcjonalny)
    dueDate?: string; // Termin wykonania (opcjonalny)
    completed: boolean; // Status ukończenia zadania
    customerId: number; // ID klienta, do którego przypisane jest zadanie
}

/**
 * Komponent ekranu edycji istniejącego zadania.
 * Umożliwia modyfikację danych zadania i zapisanie zmian.
 * @returns {JSX.Element} - Zwraca formularz do edycji zadania.
 */
export default function EditTaskScreen() {
    // Pobiera token uwierzytelniający z kontekstu
    const { token } = useAuth();
    // Inicjalizuje hook do nawigacji
    const router = useRouter();
    // Pobiera parametry lokalne, w tym ID zadania
    const { taskId } = useLocalSearchParams<{ taskId: string }>();

    // Stan przechowujący tytuł zadania
    const [title, setTitle] = useState('');
    // Stan przechowujący opis zadania
    const [description, setDescription] = useState('');
    // Stan przechowujący termin wykonania zadania
    const [dueDate, setDueDate] = useState('');
    // Stan przechowujący status ukończenia zadania
    const [completed, setCompleted] = useState(false);
    // Stan przechowujący ID wybranego klienta
    const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);

    // Stan przechowujący listę wszystkich klientów
    const [customers, setCustomers] = useState<Customer[]>([]);
    // Stan wskazujący, czy trwa ładowanie danych
    const [loading, setLoading] = useState(true);

    // Efekt pobierający dane zadania i listę klientów po zamontowaniu komponentu
    useEffect(() => {
        // Asynchroniczna funkcja do pobierania danych
        const fetchData = async () => {
            // Przerywa, jeśli brakuje tokena lub ID zadania
            if (!token || !taskId) {
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                // Równoległe zapytania o listę klientów i dane konkretnego zadania
                const [customersRes, taskRes] = await Promise.all([
                    api.get(`/Customers`),
                    api.get(`/user/tasks/${taskId}`)
                ]);

                // Przetwarza odpowiedź z listą klientów
                const customerData = customersRes.data;
                setCustomers(customerData?.$values || (Array.isArray(customerData) ? customerData : []));

                // Przetwarza odpowiedź z danymi zadania i ustawia stany formularza
                const taskData = taskRes.data;
                setTitle(taskData.title);
                setDescription(taskData.description || '');
                setSelectedCustomerId(taskData.customerId);
                setCompleted(taskData.completed);
                setDueDate(taskData.dueDate ? new Date(taskData.dueDate).toISOString().split('T')[0] : '');

            } catch (err) {
                // Wyświetla alert w przypadku błędu
                Alert.alert("Błąd", "Nie udało się pobrać danych zadania.");
            } finally {
                // Kończy stan ładowania
                setLoading(false);
            }
        };
        // Wywołuje funkcję pobierającą dane
        fetchData();
    }, [token, taskId]); // Efekt uruchamia się ponownie, gdy zmieni się token lub ID zadania

    // Funkcja obsługująca aktualizację zadania
    const handleUpdateTask = async () => {
        // Walidacja - sprawdza, czy tytuł i klient są wybrane
        if (!title.trim() || !selectedCustomerId) {
            Alert.alert("Błąd walidacji", "Tytuł i klient są wymagane.");
            return;
        }

        // Tworzy obiekt DTO z danymi do aktualizacji
        const updateDto: UpdateTaskDto = {
            title,
            description,
            customerId: selectedCustomerId,
            completed,
            dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        };

        try {
            // Wykonuje zapytanie PUT do API w celu aktualizacji zadania
            await api.put(`/user/tasks/${taskId}`, updateDto);

            // Wyświetla alert o sukcesie
            Alert.alert("Sukces", "Zadanie zostało zaktualizowane.");
            // Wraca do poprzedniego ekranu
            router.back();
        } catch {
            // Wyświetla alert w przypadku błędu
            Alert.alert("Błąd", "Nie udało się zaktualizować zadania.");
        }
    };

    // Jeśli dane się ładują, wyświetla wskaźnik aktywności
    if (loading) {
        return <View style={styles.container}><ActivityIndicator size="large" color="#fff" /></View>
    }

    // Renderuje formularz edycji zadania
    return (
        <View style={styles.container}>
            <Text style={styles.label}>Tytuł zadania</Text>
            <TextInput style={styles.input} value={title} onChangeText={setTitle} />

            <Text style={styles.label}>Opis (opcjonalnie)</Text>
            <TextInput style={styles.input} value={description} onChangeText={setDescription} multiline />

            <Text style={styles.label}>Termin wykonania</Text>
            <TextInput style={styles.input} value={dueDate} onChangeText={setDueDate} placeholder="RRRR-MM-DD" />

            <Text style={styles.label}>Przypisz do klienta</Text>
            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={selectedCustomerId}
                    onValueChange={(itemValue) => setSelectedCustomerId(itemValue)}
                    style={styles.picker}
                    dropdownIconColor={'#fff'}
                >
                    {/* Mapuje listę klientów do komponentów Picker.Item */}
                    {customers.map(c => <Picker.Item key={c.id} label={c.name} value={c.id} />)}
                </Picker>
            </View>

            <Button title="Zapisz zmiany" onPress={handleUpdateTask} />
        </View>
    );
}

// Definicje stylów dla komponentu
const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#111827' },
    label: { fontSize: 16, color: '#d1d5db', marginBottom: 5 },
    input: { backgroundColor: '#1f2937', color: 'white', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 8, marginBottom: 20, borderColor: '#374151', borderWidth: 1 },
    pickerContainer: { backgroundColor: '#1f2937', borderRadius: 8, marginBottom: 20, borderColor: '#374151', borderWidth: 1 },
    picker: { color: 'white' },
});
