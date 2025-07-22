import { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator, Modal, FlatList } from 'react-native';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useRouter, Stack } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface Customer {
    id: number;
    name: string;
}

export default function AddTaskScreen() {
    const { token } = useAuth();
    const router = useRouter();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
    const [selectedCustomerName, setSelectedCustomerName] = useState<string>('');
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(false);
    const [customersLoading, setCustomersLoading] = useState(true);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [customerSearchQuery, setCustomerSearchQuery] = useState('');

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const res = await axios.get(`/api/Customers`);
                const data = res.data;
                let customersData: Customer[] = [];
                if (data && Array.isArray((data as any).$values)) {
                    customersData = (data as any).$values;
                } else if (Array.isArray(data)) {
                    customersData = data;
                }

                // Sprawdzamy czy każdy klient ma wymagane pola
                const validCustomers = customersData.filter(customer => {
                    if (!customer || typeof customer !== 'object') {
                        console.warn("Nieprawidłowy klient:", customer);
                        return false;
                    }
                    if (!customer.id && customer.id !== 0) {
                        console.warn("Klient bez ID:", customer);
                        return false;
                    }
                    if (!customer.name) {
                        console.warn("Klient bez nazwy:", customer);
                        return false;
                    }
                    return true;
                });

                setCustomers(validCustomers);
                setFilteredCustomers(validCustomers);
            } catch (err) {
                console.error("Błąd podczas pobierania klientów:", err);
                Alert.alert("Błąd", "Nie udało się pobrać listy klientów.");
            } finally {
                setCustomersLoading(false);
            }
        };
        fetchCustomers();
    }, [token]);

    // Filtrowanie klientów
    useEffect(() => {
        if (customerSearchQuery.trim() === '') {
            setFilteredCustomers(customers);
        } else {
            const lowercasedQuery = customerSearchQuery.toLowerCase();
            const filtered = customers.filter(customer =>
                customer && customer.name && customer.name.toLowerCase().includes(lowercasedQuery)
            );
            setFilteredCustomers(filtered);
        }
    }, [customerSearchQuery, customers]);

    const handleAddTask = async () => {
        if (!title.trim()) {
            Alert.alert("Błąd walidacji", "Tytuł zadania jest wymagany.");
            return;
        }

        if (!selectedCustomerId) {
            Alert.alert("Błąd walidacji", "Wybierz klienta dla zadania.");
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`/api/user/tasks`, {
                title: title.trim(),
                description: description.trim() || null,
                customerId: selectedCustomerId,
            });

            if (response.status === 201) {
                Alert.alert("Sukces", "Zadanie zostało pomyślnie dodane.", [
                    { text: "OK", onPress: () => router.back() }
                ]);
            }
        } catch (err: any) {
            console.error("Błąd podczas dodawania zadania:", err);
            const errorMessage = err.response?.data?.message || err.message || "Nieznany błąd";
            Alert.alert("Błąd", `Nie udało się dodać zadania: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    const selectCustomer = (customer: Customer) => {
        if (!customer || !customer.id || !customer.name) {
            console.warn("Próba wyboru nieprawidłowego klienta:", customer);
            return;
        }
        setSelectedCustomerId(customer.id);
        setSelectedCustomerName(customer.name);
        setShowCustomerModal(false);
        setCustomerSearchQuery('');
    };

    const clearSelectedCustomer = () => {
        setSelectedCustomerId(null);
        setSelectedCustomerName('');
    };

    return (
        <>
            <Stack.Screen
                options={{
                    title: 'Nowe Zadanie',
                    headerStyle: { backgroundColor: '#1f2937' },
                    headerTintColor: '#fff'
                }}
            />
            <ScrollView style={styles.container}>
                <View style={styles.card}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Tytuł zadania *</Text>
                        <TextInput
                            style={styles.input}
                            value={title}
                            onChangeText={setTitle}
                            placeholder="Wprowadź tytuł zadania"
                            placeholderTextColor="#6b7280"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Opis (opcjonalnie)</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Szczegółowy opis zadania..."
                            placeholderTextColor="#6b7280"
                            multiline
                            numberOfLines={4}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Przypisz do klienta *</Text>
                        {selectedCustomerId ? (
                            <View style={styles.selectedCustomerContainer}>
                                <Text style={styles.selectedCustomerText}>{selectedCustomerName}</Text>
                                <TouchableOpacity onPress={clearSelectedCustomer} style={styles.clearCustomerButton}>
                                    <FontAwesome name="times" size={16} color="#ef4444" />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={styles.customerSelector}
                                onPress={() => setShowCustomerModal(true)}
                            >
                                <Text style={styles.customerSelectorText}>Wybierz klienta</Text>
                                <FontAwesome name="chevron-down" size={16} color="#9ca3af" />
                            </TouchableOpacity>
                        )}
                    </View>

                    <TouchableOpacity
                        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                        onPress={handleAddTask}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <FontAwesome name="plus" size={16} color="#fff" />
                        )}
                        <Text style={styles.submitButtonText}>
                            {loading ? "Dodaję..." : "Dodaj Zadanie"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Modal wyboru klienta */}
            <Modal
                visible={showCustomerModal}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Wybierz klienta</Text>
                        <TouchableOpacity
                            onPress={() => setShowCustomerModal(false)}
                            style={styles.closeButton}
                        >
                            <FontAwesome name="times" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.searchContainer}>
                        <FontAwesome name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Szukaj klienta..."
                            placeholderTextColor="#9ca3af"
                            value={customerSearchQuery}
                            onChangeText={setCustomerSearchQuery}
                        />
                        {customerSearchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setCustomerSearchQuery('')} style={styles.clearButton}>
                                <FontAwesome name="times" size={16} color="#9ca3af" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {customersLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#fff" />
                            <Text style={styles.loadingText}>Ładowanie klientów...</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={filteredCustomers}
                            keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.customerItem}
                                    onPress={() => selectCustomer(item)}
                                >
                                    <Text style={styles.customerItemText}>{item.name}</Text>
                                    <FontAwesome name="chevron-right" size={16} color="#9ca3af" />
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={
                                <Text style={styles.emptyText}>
                                    {customerSearchQuery ? 'Brak klientów pasujących do wyszukiwania.' : 'Brak klientów.'}
                                </Text>
                            }
                        />
                    )}
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#111827',
        padding: 16
    },
    card: {
        backgroundColor: '#1f2937',
        borderRadius: 10,
        padding: 20,
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        color: '#9ca3af',
        marginBottom: 6,
        fontWeight: '500',
    },
    input: {
        backgroundColor: '#374151',
        borderRadius: 8,
        padding: 12,
        color: '#fff',
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#4b5563',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    customerSelector: {
        backgroundColor: '#374151',
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: '#4b5563',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    customerSelectorText: {
        color: '#9ca3af',
        fontSize: 16,
    },
    selectedCustomerContainer: {
        backgroundColor: '#374151',
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: '#4b5563',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    selectedCustomerText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
    clearCustomerButton: {
        padding: 4,
    },
    submitButton: {
        flexDirection: 'row',
        backgroundColor: '#10b981',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    },
    submitButtonDisabled: {
        backgroundColor: '#6b7280',
    },
    submitButtonText: {
        color: '#fff',
        marginLeft: 10,
        fontWeight: 'bold',
        fontSize: 16,
    },
    // Modal styles
    modalContainer: {
        flex: 1,
        backgroundColor: '#111827',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#374151',
        backgroundColor: '#1f2937',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    closeButton: {
        padding: 8,
    },
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#9ca3af',
        marginTop: 10,
        fontSize: 16,
    },
    customerItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#1f2937',
        padding: 16,
        marginHorizontal: 16,
        marginVertical: 4,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#3b82f6',
    },
    customerItemText: {
        fontSize: 16,
        color: '#fff',
        flex: 1,
    },
    emptyText: {
        textAlign: 'center',
        color: '#9ca3af',
        marginTop: 50,
        fontSize: 16,
        paddingHorizontal: 20,
    },
});