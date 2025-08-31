// Plik: crm-mobile/app/(tabs)/customers.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, FlatList, ActivityIndicator, RefreshControl, TextInput, Text, View, TouchableOpacity, Pressable } from 'react-native';
import { Link, Stack, useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import axios from 'axios';

// Definicja interfejsu dla obiektu klienta, odzwierciedlająca model danych z backendu.
interface Customer {
    id: number; // Unikalny identyfikator klienta.
    name: string; // Imię i nazwisko lub nazwa firmy klienta.
    email: string; // Adres email klienta.
    phone?: string; // Numer telefonu (opcjonalny).
    company?: string; // Nazwa firmy (opcjonalna).
    address?: string; // Adres (opcjonalny).
    nip?: string; // Numer NIP (opcjonalny).
    representative?: string; // Przedstawiciel handlowy (opcjonalny).
    createdAt: string; // Data utworzenia rekordu klienta.
    assignedGroupId?: number; // ID grupy, do której klient jest przypisany (opcjonalne).
    assignedUserId?: number; // ID użytkownika, do którego klient jest przypisany (opcjonalne).
}

/**
 * Komponent ekranu wyświetlającego listę klientów.
 * Umożliwia przeglądanie, wyszukiwanie i odświeżanie listy klientów.
 * @returns {JSX.Element} - Zwraca widok z listą klientów.
 */
export default function CustomersScreen() {
    // Pobranie tokena uwierzytelniającego z kontekstu.
    const { token } = useAuth();
    // Inicjalizacja hooka do nawigacji.
    const router = useRouter();

    // Stan przechowujący pełną listę klientów pobraną z serwera.
    const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
    // Stan przechowujący listę klientów po zastosowaniu filtrów (np. wyszukiwania).
    const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
    // Stan wskazujący, czy trwa ładowanie danych.
    const [loading, setLoading] = useState(true);
    // Stan wskazujący, czy trwa proces odświeżania listy.
    const [refreshing, setRefreshing] = useState(false);
    // Stan przechowujący ewentualny błąd, który wystąpił podczas pobierania danych.
    const [error, setError] = useState<string | null>(null);
    // Stan przechowujący aktualną frazę wyszukiwania wprowadzoną przez użytkownika.
    const [searchQuery, setSearchQuery] = useState('');

    // Funkcja do pobierania listy klientów z API, opakowana w useCallback dla optymalizacji.
    const fetchCustomers = useCallback(async () => {
        // Przerywa wykonanie, jeśli brakuje tokena.
        if (!token) {
            setError("Brak tokena autoryzacyjnego.");
            setLoading(false);
            return;
        }

        // Ustawia stan ładowania tylko przy pierwszym ładowaniu, nie przy odświeżaniu, by uniknąć migotania.
        if (!refreshing) {
            setLoading(true);
        }
        // Resetuje stan błędu przed nowym zapytaniem.
        setError(null);

        try {
            // Logowanie rozpoczęcia pobierania danych.
            console.log("Pobieranie klientów...");
            // Wykonanie zapytania GET do API.
            const response = await axios.get('/api/Customers');
            // Logowanie odpowiedzi z serwera.
            console.log("Odpowiedź z serwera:", response.data);

            // Przypisanie danych z odpowiedzi do zmiennej.
            const data = response.data;
            // Logowanie typu i struktury otrzymanych danych.
            console.log("Typ danych:", typeof data);
            console.log("Czy data jest tablicą:", Array.isArray(data));

            // Zmienna do przechowywania przetworzonych danych klientów.
            let customersData;
            // Sprawdzenie różnych możliwych formatów odpowiedzi z serwera .NET.
            if (Array.isArray(data)) {
                customersData = data;
            } else if (data && data.$values && Array.isArray(data.$values)) {
                customersData = data.$values; // Typowy format dla referencji cyklicznych w JSON.NET.
            } else if (data && typeof data === 'object') {
                // Próba znalezienia tablicy wewnątrz obiektu, jeśli format jest nietypowy.
                const keys = Object.keys(data);
                console.log("Klucze w obiekcie:", keys);
                for (const key of keys) {
                    if (Array.isArray(data[key])) {
                        customersData = data[key];
                        break;
                    }
                }
            }

            // Logowanie danych po przetworzeniu.
            console.log("Przetworzone dane klientów:", customersData);

            // Jeśli dane są poprawną tablicą, przetwarzamy je dalej.
            if (Array.isArray(customersData)) {
                // Walidacja każdego obiektu klienta w tablicy.
                const validCustomers = customersData.filter(customer => {
                    if (!customer || typeof customer !== 'object') {
                        console.warn("Nieprawidłowy klient:", customer);
                        return false;
                    }
                    if (!customer.id && customer.id !== 0) {
                        console.warn("Klient bez ID:", customer);
                        return false;
                    }
                    return true;
                });

                // Logowanie poprawnych klientów.
                console.log("Poprawni klienci:", validCustomers);
                // Ustawienie pełnej listy klientów i listy filtrowanej.
                setAllCustomers(validCustomers);
                setFilteredCustomers(validCustomers);
            } else {
                // Obsługa błędu nieprawidłowego formatu danych.
                console.error("Nieprawidłowy format danych:", data);
                setError("Nieprawidłowy format danych z serwera");
            }
        } catch (err: any) {
            // Obsługa błędów zapytania sieciowego.
            console.error("Błąd podczas pobierania klientów:", err);
            console.error("Szczegóły błędu:", err.response?.data);
            setError(err.message || "Błąd podczas pobierania danych");
        } finally {
            // Zakończenie stanu ładowania i odświeżania.
            setLoading(false);
            setRefreshing(false);
        }
    }, [token, refreshing]); // Zależności hooka useCallback.

    // Efekt uruchamiający pobieranie klientów przy starcie komponentu.
    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    // Funkcja wywoływana przy odświeżaniu listy (pull-to-refresh).
    const onRefresh = useCallback(() => {
        setSearchQuery(''); // Czyści pole wyszukiwania.
        setRefreshing(true); // Uruchamia stan odświeżania.
    }, []);

    // Efekt filtrujący klientów na podstawie frazy wyszukiwania.
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredCustomers(allCustomers); // Jeśli wyszukiwarka jest pusta, pokaż wszystkich.
        } else {
            const lowercasedQuery = searchQuery.toLowerCase();
            const filtered = allCustomers.filter(customer =>
                customer.name.toLowerCase().includes(lowercasedQuery) || // Filtruj po nazwie.
                (customer.nip && customer.nip.includes(searchQuery)) // Filtruj po NIP.
            );
            setFilteredCustomers(filtered);
        }
    }, [searchQuery, allCustomers]); // Zależności hooka useEffect.

    // Widok wyświetlany podczas ładowania danych.
    if (loading) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color="#fff" />
            </View>
        );
    }

    // Widok wyświetlany w przypadku błędu.
    if (error) {
        return (
            <View style={[styles.container, styles.centered]}>
                <Text style={styles.errorText}>Błąd: {error}</Text>
            </View>
        );
    }

    // Główny widok komponentu z listą klientów.
    return (
        <>
            {/* Konfiguracja nagłówka ekranu z przyciskiem do dodawania klienta. */}
            <Stack.Screen options={{
                title: 'Klienci', headerRight: () => (
                    <Link href="/add-customer" asChild>
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
            }} />
            <View style={styles.container}>
                {/* Kontener z polem wyszukiwania. */}
                <View style={styles.searchContainer}>
                    <FontAwesome name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Szukaj po nazwie lub NIP..."
                        placeholderTextColor="#9ca3af"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
                {/* Lista klientów. */}
                <FlatList
                    data={filteredCustomers}
                    keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() =>
                                router.push({
                                    pathname: "/customer/[id]",
                                    params: { id: item.id },
                                })
                            }
                        >
                            <View style={styles.customerItem}>
                                <View style={styles.customerHeader}>
                                    <Text style={styles.customerName}>{item.name}</Text>
                                    <FontAwesome name="chevron-right" size={16} color="#9ca3af" />
                                </View>

                                {item.company && (
                                    <Text style={styles.customerCompany}>{item.company}</Text>
                                )}

                                <View style={styles.customerDetails}>
                                    {item.email && (
                                        <View style={styles.detailRow}>
                                            <FontAwesome name="envelope" size={14} color="#6b7280" style={styles.detailIcon} />
                                            <Text style={styles.detailText}>{item.email}</Text>
                                        </View>
                                    )}

                                    {item.phone && (
                                        <View style={styles.detailRow}>
                                            <FontAwesome name="phone" size={14} color="#6b7280" style={styles.detailIcon} />
                                            <Text style={styles.detailText}>{item.phone}</Text>
                                        </View>
                                    )}

                                    {item.nip && (
                                        <View style={styles.detailRow}>
                                            <FontAwesome name="id-card" size={14} color="#6b7280" style={styles.detailIcon} />
                                            <Text style={styles.detailText}>NIP: {item.nip}</Text>
                                        </View>
                                    )}

                                    {item.address && (
                                        <View style={styles.detailRow}>
                                            <FontAwesome name="map-marker" size={14} color="#6b7280" style={styles.detailIcon} />
                                            <Text style={styles.detailText} numberOfLines={2}>{item.address}</Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        </TouchableOpacity>
                    )}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
                    }
                    ListEmptyComponent={
                        <Text style={styles.noResultsText}>Brak wyników</Text>
                    }
                />
            </View>
        </>
    );
}

// Definicje stylów dla komponentu.
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#111827',
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
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
    customerItem: {
        backgroundColor: '#1f2937',
        padding: 20,
        marginVertical: 8,
        marginHorizontal: 16,
        borderRadius: 10,
        borderLeftWidth: 4,
        borderLeftColor: '#3b82f6',
    },
    customerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    customerName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        flex: 1,
    },
    customerCompany: {
        fontSize: 14,
        color: '#9ca3af',
        marginTop: 4,
        fontStyle: 'italic',
    },
    customerDetails: {
        marginTop: 8,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    detailIcon: {
        marginRight: 8,
        width: 14,
    },
    detailText: {
        fontSize: 14,
        color: '#9ca3af',
        flex: 1,
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
