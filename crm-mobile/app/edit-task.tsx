import { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Picker } from '@react-native-picker/picker';

interface Customer { id: number; name: string; }

interface UpdateTaskDto {
    title: string;
    description?: string;
    dueDate?: string;
    completed: boolean;
    customerId: number;
}

export default function EditTaskScreen() {
    const { token } = useAuth();
    const router = useRouter();
    const { taskId } = useLocalSearchParams<{ taskId: string }>();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [completed, setCompleted] = useState(false);
    const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);

    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!token || !taskId) return;
            try {
                const [customersRes, taskRes] = await Promise.all([
                    axios.get(`/api/Customers`),
                    axios.get(`/api/user/tasks/${taskId}`)
                ]);

                const customerData = customersRes.data;
                setCustomers(customerData?.$values || (Array.isArray(customerData) ? customerData : []));

                const taskData = taskRes.data;
                setTitle(taskData.title);
                setDescription(taskData.description || '');
                setSelectedCustomerId(taskData.customerId);
                setCompleted(taskData.completed);
                setDueDate(taskData.dueDate ? new Date(taskData.dueDate).toISOString().split('T')[0] : '');

            } catch (err) {
                Alert.alert("Błąd", "Nie udało się pobrać danych zadania.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [token, taskId]);

    const handleUpdateTask = async () => {
        if (!title.trim() || !selectedCustomerId) {
            Alert.alert("Błąd walidacji", "Tytuł i klient są wymagane.");
            return;
        }

        const updateDto: UpdateTaskDto = {
            title,
            description,
            customerId: selectedCustomerId,
            completed,
            dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        };

        try {
            await axios.put(`/api/user/tasks/${taskId}`, updateDto);

            Alert.alert("Sukces", "Zadanie zostało zaktualizowane.");
            router.back();
        } catch {
            Alert.alert("Błąd", "Nie udało się zaktualizować zadania.");
        }
    };

    if (loading) {
        return <View style={styles.container}><ActivityIndicator size="large" color="#fff" /></View>
    }

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
                    {customers.map(c => <Picker.Item key={c.id} label={c.name} value={c.id} />)}
                </Picker>
            </View>

            <Button title="Zapisz zmiany" onPress={handleUpdateTask} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#111827' },
    label: { fontSize: 16, color: '#d1d5db', marginBottom: 5 },
    input: { backgroundColor: '#1f2937', color: 'white', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 8, marginBottom: 20, borderColor: '#374151', borderWidth: 1 },
    pickerContainer: { backgroundColor: '#1f2937', borderRadius: 8, marginBottom: 20, borderColor: '#374151', borderWidth: 1 },
    picker: { color: 'white' },
});