// Plik: crm-mobile/app/(tabs)/customers.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, FlatList, ActivityIndicator, RefreshControl, TextInput, Text, View, TouchableOpacity, Pressable } from 'react-native';
import { Link, Stack, useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import axios from 'axios';

// Definicja interfejsu dla klienta
interface Customer {
    id: number;
    name: string;
    nip: string;
}

export default function CustomersScreen() {
    const { token, isLoading } = useAuth();
    const router = useRouter();

    const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
    const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    if (isLoading) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color="#fff" />
            </View>
        );
    }

    const fetchCustomers = useCallback(async () => {
        if (!token) {
            setError("Brak tokena autoryzacyjnego.");
            setLoading(false);
            return;
        }

        // Nie ustawiamy tutaj setLoading(true), aby uniknąć migotania przy odświeżaniu
        if (!refreshing) {
            setLoading(true);
        }
        setError(null);

        try {
            const response = await axios.get('/api/Customers');

            const data = response.data;
            const customersData = data.$values || data;

            setAllCustomers(customersData);
            setFilteredCustomers(customersData);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [token, refreshing]);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    const onRefresh = useCallback(() => {
        setSearchQuery(''); // Czyścimy wyszukiwanie przy odświeżaniu
        setRefreshing(true);
    }, []);

    // ✅ UZUPEŁNIONA LOGIKA FILTROWANIA
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredCustomers(allCustomers);
        } else {
            const lowercasedQuery = searchQuery.toLowerCase();
            const filtered = allCustomers.filter(customer =>
                customer.name.toLowerCase().includes(lowercasedQuery) ||
                (customer.nip && customer.nip.includes(searchQuery))
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
                <FlatList
                    data={filteredCustomers}
                    keyExtractor={(item) => item.id.toString()}
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
                                <Text style={styles.customerName}>{item.name}</Text>
                                <Text style={styles.customerNip}>NIP: {item.nip}</Text>
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
    customerName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    customerNip: {
        fontSize: 14,
        color: '#9ca3af',
        marginTop: 4,
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