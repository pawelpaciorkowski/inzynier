import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useRouter, Stack } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface Customer { id: number; name: string; }
interface Service { id: number; name: string; price: number; }

interface InvoiceItem {
    serviceId: number;
    quantity: string; // Używamy string, bo TextInput zwraca string
}

export default function AddInvoiceScreen() {
    const { token } = useAuth();
    const router = useRouter();

    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [items, setItems] = useState<InvoiceItem[]>([{ serviceId: 0, quantity: '1' }]);
    const [loading, setLoading] = useState(false);

    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [customersRes, servicesRes] = await Promise.all([
                    axios.get(`/api/Customers`), // Usunięto nagłówki, bo są globalne
                    axios.get(`/api/Services`)   // Usunięto nagłówki, bo są globalne
                ]);

                const customersData = customersRes.data.$values || customersRes.data;
                const servicesData = servicesRes.data.$values || servicesRes.data;

                setCustomers(customersData);
                setServices(servicesData);
            } catch (err) {
                Alert.alert("Błąd", "Nie udało się pobrać danych (klientów/usług).");
            }
        };
        fetchData();
    }, [token]);

const handleAddItem = () => {
    setItems([...items, { serviceId: 0, quantity: '1' }]);
};

const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
};

const handleItemChange = (value: string | number, index: number, field: 'serviceId' | 'quantity') => {
    const newItems = [...items];
    if (field === 'serviceId') {
        newItems[index].serviceId = typeof value === 'string' ? parseInt(value) : value;
    } else {
        newItems[index].quantity = value as string;
    }
    setItems(newItems);
};

const handleAddInvoice = async () => {
    if (!invoiceNumber.trim() || selectedCustomerId === null) {
        Alert.alert("Błąd walidacji", "Numer faktury i klient są wymagane.");
        return;
    }

    if (items.some(item => item.serviceId === 0 || parseInt(item.quantity) <= 0)) {
        Alert.alert("Błąd walidacji", "Wszystkie pozycje faktury muszą mieć wybraną usługę i ilość większą niż 0.");
        return;
    }

    setLoading(true);
    try {
        const invoiceItems = items.map(item => ({
            serviceId: item.serviceId,
            quantity: parseInt(item.quantity),
        }));

        await axios.post(`${API_URL}/api/Invoices`, {
            invoiceNumber,
            customerId: selectedCustomerId,
            items: invoiceItems,
        }, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            }
        });

        Alert.alert("Sukces", "Faktura została pomyślnie dodana.");
        router.back();
    } catch (err: any) {
        Alert.alert("Błąd", `Nie udało się dodać faktury: ${err.message || err}`);
    } finally {
        setLoading(false);
    }
};

return (
    <>
        <Stack.Screen options={{ title: 'Nowa Faktura' }} />
        <ScrollView style={styles.container}>
            <Text style={styles.label}>Numer faktury *</Text>
            <TextInput style={styles.input} value={invoiceNumber} onChangeText={setInvoiceNumber} />

            <Text style={styles.label}>Wybierz klienta *</Text>
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

            <Text style={styles.label}>Pozycje faktury</Text>
            {items.map((item, index) => (
                <View key={index} style={styles.itemRow}>
                    <View style={styles.itemPickerContainer}>
                        <Picker
                            selectedValue={item.serviceId}
                            onValueChange={(value) => handleItemChange(value, index, 'serviceId')}
                            style={styles.picker}
                            dropdownIconColor={'#fff'}
                        >
                            <Picker.Item label="-- Wybierz usługę --" value={0} />
                            {services.map(s => <Picker.Item key={s.id} label={`${s.name} (${s.price} PLN)`} value={s.id} />)}
                        </Picker>
                    </View>
                    <TextInput
                        style={styles.itemQuantityInput}
                        value={item.quantity}
                        onChangeText={(text) => handleItemChange(text, index, 'quantity')}
                        keyboardType="numeric"
                        placeholder="Ilość"
                        placeholderTextColor="#9ca3af"
                    />
                    {items.length > 1 && (
                        <TouchableOpacity onPress={() => handleRemoveItem(index)} style={styles.removeButton}>
                            <FontAwesome name="minus-circle" size={24} color="#ef4444" />
                        </TouchableOpacity>
                    )}
                </View>
            ))}
            <TouchableOpacity onPress={handleAddItem} style={styles.addButton}>
                <FontAwesome name="plus-circle" size={24} color="#10b981" />
                <Text style={styles.addButtonText}>Dodaj pozycję</Text>
            </TouchableOpacity>

            <Button
                title={loading ? "Dodaję..." : "Dodaj Fakturę"}
                onPress={handleAddInvoice}
                disabled={loading}
                color="#10b981"
            />
        </ScrollView>
    </>
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
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    itemPickerContainer: {
        flex: 1,
        backgroundColor: '#1f2937',
        borderRadius: 8,
        borderColor: '#374151',
        borderWidth: 1,
        marginRight: 10,
    },
    itemQuantityInput: {
        width: 80,
        backgroundColor: '#1f2937',
        color: 'white',
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 8,
        borderColor: '#374151',
        borderWidth: 1,
        textAlign: 'center',
    },
    removeButton: {
        marginLeft: 10,
        padding: 5,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1f2937',
        padding: 10,
        borderRadius: 8,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#374151',
    },
    addButtonText: {
        color: '#10b981',
        marginLeft: 10,
        fontSize: 16,
        fontWeight: 'bold',
    },
});