import { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator, Modal, FlatList } from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useRouter, Stack } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';

// Definiuje strukturę obiektu klienta
interface Customer {
    id: number; // Unikalny identyfikator klienta
    name: string; // Nazwa klienta
}

/**
 * Komponent ekranu dodawania nowego zadania.
 * Umożliwia wprowadzenie danych zadania, przypisanie go do klienta i wysłanie do API.
 * @returns {JSX.Element} - Zwraca formularz do dodawania zadania.
 */
export default function AddTaskScreen() {
    // Pobiera token uwierzytelniający z kontekstu
    const { token } = useAuth();
    // Inicjalizuje hook do nawigacji
    const router = useRouter();

    // Stan przechowujący tytuł zadania
    const [title, setTitle] = useState('');
    // Stan przechowujący opis zadania
    const [description, setDescription] = useState('');
    // Stan przechowujący ID wybranego klienta
    const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
    // Stan przechowujący nazwę wybranego klienta
    const [selectedCustomerName, setSelectedCustomerName] = useState<string>('');
    // Stan przechowujący listę wszystkich klientów
    const [customers, setCustomers] = useState<Customer[]>([]);
    // Stan przechowujący przefiltrowaną listę klientów
    const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
    // Stan wskazujący, czy trwa proces dodawania zadania
    const [loading, setLoading] = useState(false);
    // Stan wskazujący, czy trwa ładowanie listy klientów
    const [customersLoading, setCustomersLoading] = useState(true);
    // Stan kontrolujący widoczność modala wyboru klienta
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    // Stan przechowujący frazę wyszukiwania klientów
    const [customerSearchQuery, setCustomerSearchQuery] = useState('');

    // Efekt pobierający listę klientów po zamontowaniu komponentu
    useEffect(() => {
        // Asynchroniczna funkcja do pobierania klientów
        const fetchCustomers = async () => {
            try {
                // Wykonuje zapytanie GET do API w celu pobrania klientów
                const res = await api.get(`/Customers`);
                // Pobiera dane z odpowiedzi
                const data = res.data;
                // Inicjalizuje pustą tablicę na dane klientów
                let customersData: Customer[] = [];
                // Sprawdza format danych i przypisuje do tablicy
                if (data && Array.isArray((data as any).$values)) {
                    customersData = (data as any).$values;
                } else if (Array.isArray(data)) {
                    customersData = data;
                }

                // Filtruje klientów, aby upewnić się, że mają wymagane pola
                const validCustomers = customersData.filter(customer => {
                    // Sprawdza, czy obiekt klienta jest poprawny
                    if (!customer || typeof customer !== 'object') {
                        console.warn("Nieprawidłowy klient:", customer);
                        return false;
                    }
                    // Sprawdza, czy klient ma ID
                    if (!customer.id && customer.id !== 0) {
                        console.warn("Klient bez ID:", customer);
                        return false;
                    }
                    // Sprawdza, czy klient ma nazwę
                    if (!customer.name) {
                        console.warn("Klient bez nazwy:", customer);
                        return false;
                    }
                    // Zwraca true, jeśli klient jest poprawny
                    return true;
                });

                // Ustawia pobranych i zweryfikowanych klientów w stanie
                setCustomers(validCustomers);
                // Ustawia przefiltrowanych klientów (początkowo wszyscy)
                setFilteredCustomers(validCustomers);
            } catch (err) {
                // Loguje błąd w konsoli
                console.error("Błąd podczas pobierania klientów:", err);
                // Wyświetla alert o błędzie
                Alert.alert("Błąd", "Nie udało się pobrać listy klientów.");
            } finally {
                // Kończy stan ładowania klientów
                setCustomersLoading(false);
            }
        };
        // Wywołuje funkcję pobierającą klientów
        fetchCustomers();
    }, [token]); // Efekt uruchamia się ponownie, gdy zmieni się token

    // Efekt filtrujący klientów na podstawie frazy wyszukiwania
    useEffect(() => {
        // Jeśli fraza wyszukiwania jest pusta, pokazuje wszystkich klientów
        if (customerSearchQuery.trim() === '') {
            setFilteredCustomers(customers);
        } else {
            // Konwertuje frazę na małe litery
            const lowercasedQuery = customerSearchQuery.toLowerCase();
            // Filtruje klientów, których nazwa zawiera frazę wyszukiwania
            const filtered = customers.filter(customer =>
                customer && customer.name && customer.name.toLowerCase().includes(lowercasedQuery)
            );
            // Ustawia przefiltrowaną listę w stanie
            setFilteredCustomers(filtered);
        }
    }, [customerSearchQuery, customers]); // Efekt uruchamia się przy zmianie frazy lub listy klientów

    // Funkcja obsługująca dodawanie nowego zadania
    const handleAddTask = async () => {
        // Sprawdza, czy tytuł zadania nie jest pusty
        if (!title.trim()) {
            Alert.alert("Błąd walidacji", "Tytuł zadania jest wymagany.");
            return;
        }

        // Sprawdza, czy wybrano klienta
        if (!selectedCustomerId) {
            Alert.alert("Błąd walidacji", "Wybierz klienta dla zadania.");
            return;
        }

        // Ustawia stan ładowania na true
        setLoading(true);
        try {
            // Wykonuje zapytanie POST do API w celu dodania zadania
            const response = await api.post(`/user/tasks`, {
                title: title.trim(),
                description: description.trim() || null,
                customerId: selectedCustomerId,
            });

            // Jeśli zadanie zostało pomyślnie dodane (status 201)
            if (response.status === 201) {
                // Wyświetla alert o sukcesie i wraca do poprzedniego ekranu
                Alert.alert("Sukces", "Zadanie zostało pomyślnie dodane.", [
                    { text: "OK", onPress: () => router.back() }
                ]);
            }
        } catch (err: any) {
            // Loguje błąd w konsoli
            console.error("Błąd podczas dodawania zadania:", err);
            // Wyświetla alert o błędzie
            const errorMessage = err.response?.data?.message || err.message || "Nieznany błąd";
            Alert.alert("Błąd", `Nie udało się dodać zadania: ${errorMessage}`);
        } finally {
            // Kończy stan ładowania
            setLoading(false);
        }
    };

    // Funkcja do wyboru klienta z listy
    const selectCustomer = (customer: Customer) => {
        // Sprawdza, czy obiekt klienta jest poprawny
        if (!customer || !customer.id || !customer.name) {
            console.warn("Próba wyboru nieprawidłowego klienta:", customer);
            return;
        }
        // Ustawia ID wybranego klienta
        setSelectedCustomerId(customer.id);
        // Ustawia nazwę wybranego klienta
        setSelectedCustomerName(customer.name);
        // Zamyka modal wyboru klienta
        setShowCustomerModal(false);
        // Czyści frazę wyszukiwania
        setCustomerSearchQuery('');
    };

    // Funkcja do czyszczenia wybranego klienta
    const clearSelectedCustomer = () => {
        // Resetuje ID wybranego klienta
        setSelectedCustomerId(null);
        // Resetuje nazwę wybranego klienta
        setSelectedCustomerName('');
    };

    // Renderuje komponent
    return (
        <>
            {/* Konfiguracja nagłówka ekranu */}
            <Stack.Screen
                options={{
                    title: 'Nowe Zadanie',
                    headerStyle: { backgroundColor: '#1f2937' },
                    headerTintColor: '#fff'
                }}
            />
            {/* Widok z możliwością przewijania */}
            <ScrollView style={styles.container}>
                {/* Karta z formularzem */}
                <View style={styles.card}>
                    {/* Grupa pola Tytuł */}
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

                    {/* Grupa pola Opis */}
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

                    {/* Grupa pola Przypisz do klienta */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Przypisz do klienta *</Text>
                        {/* Warunkowe renderowanie: pokazuje wybranego klienta lub przycisk wyboru */}
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

                    {/* Przycisk dodawania zadania */}
                    <TouchableOpacity
                        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                        onPress={handleAddTask}
                        disabled={loading}
                    >
                        {/* Warunkowe renderowanie: pokazuje wskaźnik ładowania lub ikonę */}
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
                    {/* Nagłówek modala */}
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Wybierz klienta</Text>
                        <TouchableOpacity
                            onPress={() => setShowCustomerModal(false)}
                            style={styles.closeButton}
                        >
                            <FontAwesome name="times" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {/* Kontener wyszukiwania */}
                    <View style={styles.searchContainer}>
                        <FontAwesome name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Szukaj klienta..."
                            placeholderTextColor="#9ca3af"
                            value={customerSearchQuery}
                            onChangeText={setCustomerSearchQuery}
                        />
                        {/* Przycisk czyszczenia wyszukiwania */}
                        {customerSearchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setCustomerSearchQuery('')} style={styles.clearButton}>
                                <FontAwesome name="times" size={16} color="#9ca3af" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Warunkowe renderowanie: pokazuje wskaźnik ładowania lub listę klientów */}
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

// Definicje stylów dla komponentu
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
    // Style dla modala
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
