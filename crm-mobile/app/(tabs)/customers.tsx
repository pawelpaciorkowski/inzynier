import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StyleSheet, FlatList, ActivityIndicator, RefreshControl, TextInput, Text, View, TouchableOpacity, Pressable } from 'react-native';
import { Link, Stack, useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import api from '../../services/api';

// Definicja interfejsu dla obiektu klienta, odzwierciedlająca model danych z backendu.
interface Customer {
    id: number; // Unikalny identyfikator klienta.
    name: string; // Imię i nazwisko lub nazwa firmy klienta.
    email: string; // Adres email klienta.
    phone?: string; // Numer telefonu (opcjonalny).
    company?: string; // Nazwa firmy (opcjonalna).
    address?: string; // Adres (opcjonalny).
    nip?: string; // Numer NIP (opcjonalny).
    representative?: { id: number; username: string; email: string } | null; // Przedstawiciel (pracownik firmy) - obiekt użytkownika.
    representativeUserId?: number | null; // ID przedstawiciela (użytkownika).
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
    const { token } = useAuth();
    const router = useRouter();

    const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
    const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const isInitialLoad = useRef(true);
    const hasDataLoaded = useRef(false);
    const hasRefreshedOnThisFocus = useRef(false);

    const fetchCustomers = useCallback(async () => {
        if (!token) {
            setError("Brak tokena autoryzacyjnego.");
            setLoading(false);
            return;
        }

        if (!refreshing) {
            setLoading(true);
        }
        setError(null);

        try {
            const response = await api.get('/Customers');
            const data = response.data;

            let customersData;
            if (Array.isArray(data)) {
                customersData = data;
            } else if (data && data.$values && Array.isArray(data.$values)) {
                customersData = data.$values;
            } else if (data && typeof data === 'object') {
                const keys = Object.keys(data);
                for (const key of keys) {
                    if (Array.isArray(data[key])) {
                        customersData = data[key];
                        break;
                    }
                }
            }

            if (Array.isArray(customersData)) {
                const validCustomers = customersData.filter(customer => {
                    if (!customer || typeof customer !== 'object') {
                        return false;
                    }
                    if (!customer.id && customer.id !== 0) {
                        return false;
                    }
                    return true;
                });

                setAllCustomers(validCustomers);
                setFilteredCustomers(validCustomers);
                if (isInitialLoad.current) {
                    isInitialLoad.current = false;
                }
                hasDataLoaded.current = true;
            } else {
                setError("Nieprawidłowy format danych z serwera");
            }
        } catch (err: any) {
            console.error("Błąd podczas pobierania klientów:", err);
            setError(err.message || "Błąd podczas pobierania danych");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [token, refreshing]);

    useEffect(() => {
        if (isInitialLoad.current) {
            fetchCustomers();
        }
    }, [fetchCustomers]);

    useFocusEffect(
        useCallback(() => {
            let timeoutId: ReturnType<typeof setTimeout> | null = null;


            if (!isInitialLoad.current && token && hasDataLoaded.current && !hasRefreshedOnThisFocus.current) {
                hasRefreshedOnThisFocus.current = true; // Oznacz że już odświeżyliśmy


                timeoutId = setTimeout(() => {
                    setRefreshing(true); // Ustaw refreshing, aby nie pokazywać 
                    fetchCustomers();
                }, 300);
            }


            return () => {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
                hasRefreshedOnThisFocus.current = false;
            };
        }, [token])
    );

    const onRefresh = useCallback(() => {
        setSearchQuery(''); // Czyści pole wyszukiwania.
        setRefreshing(true); // Uruchamia stan odświeżania.
    }, []);

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
    }, [searchQuery, allCustomers]);

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
