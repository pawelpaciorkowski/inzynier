import { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';

interface Customer { id: number; name: string; }
const API_URL = 'http://10.0.2.2:5167';

export default function AddTaskScreen() {
    const { token } = useAuth();
    const router = useRouter();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
    const [customers, setCustomers] = useState<Customer[]>([]);

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/customers`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = res.data;
                if (data && Array.isArray((data as any).$values)) {
                    setCustomers((data as any).$values);
                } else if (Array.isArray(data)) {
                    setCustomers(data);
                }
            } catch (err) {
                Alert.alert("Błąd", "Nie udało się pobrać listy klientów.");
            }
        };
        fetchCustomers();
    }, [token]);

    const handleAddTask = async () => {
        if (!title.trim() || !selectedCustomerId) {
            Alert.alert("Błąd walidacji", "Tytuł i klient są wymagane.");
            return;
        }

        try {
            await axios.post(`${API_URL}/api/user/tasks`, {
                title,
                description,
                customerId: selectedCustomerId,
            }, { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } });

            Alert.alert("Sukces", "Zadanie zostało pomyślnie dodane.");
            router.back();
        } catch {
            Alert.alert("Błąd", "Nie udało się dodać zadania.");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Tytuł zadania</Text>
            <TextInput style={styles.input} value={title} onChangeText={setTitle} />

            <Text style={styles.label}>Opis (opcjonalnie)</Text>
            <TextInput style={styles.input} value={description} onChangeText={setDescription} multiline />

            <Text style={styles.label}>Przypisz do klienta</Text>
            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={selectedCustomerId}
                    onValueChange={(itemValue) => setSelectedCustomerId(itemValue)}
                    style={styles.picker}
                    dropdownIconColor={'#fff'}
                >
                    <Picker.Item label="-- Wybierz klienta --" value={null} />
                    {customers.map(c => <Picker.Item key={c.id} label={c.name} value={c.id} />)}
                </Picker>
            </View>

            <Button title="Zapisz zadanie" onPress={handleAddTask} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#111827' },
    label: { fontSize: 16, color: '#d1d5db', marginBottom: 5 },
    input: {
        backgroundColor: '#1f2937',
        color: 'white',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 8,
        marginBottom: 20,
        borderColor: '#374151',
        borderWidth: 1,
    },
    pickerContainer: {
        backgroundColor: '#1f2937',
        borderRadius: 8,
        marginBottom: 20,
        borderColor: '#374151',
        borderWidth: 1,
    },
    picker: {
        color: 'white',
    }
});