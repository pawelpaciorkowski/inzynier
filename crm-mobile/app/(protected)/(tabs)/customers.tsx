// Plik: crm-mobile/app/(tabs)/customers.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, FlatList, ActivityIndicator, RefreshControl, TextInput, Text, View, TouchableOpacity, Pressable } from 'react-native';
import { Link, Stack, useRouter } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';
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

    if (isLoading) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color="#fff" />
            </View>
        );
    }

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
                )
            }} />
            <View style={styles.container}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Szukaj klientów..."
                    placeholderTextColor="#9ca3af"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                <FlatList
                    data={filteredCustomers}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <Link href={`/customer/${item.id}`} asChild>
                            <TouchableOpacity style={styles.customerItem}>
                                <View style={styles.customerInfo}>
                                    <Text style={styles.customerName}>{item.name}</Text>
                                    {item.nip && <Text style={styles.customerNip}>NIP: {item.nip}</Text>}
                                </View>
                                <FontAwesome name="chevron-right" size={16} color="#6b7280" />
                            </TouchableOpacity>
                        </Link>
                    )}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#ffffff']}
                            tintColor="#ffffff"
                        />
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
    searchInput: {
        height: 50,
        borderColor: '#374151',
        borderWidth: 1,
        borderRadius: 8,
        margin: 15,
        paddingHorizontal: 15,
        color: 'white',
        backgroundColor: '#1f2937',
    },
    customerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#374151',
        backgroundColor: '#1f2937',
        marginHorizontal: 15,
        marginVertical: 2,
        borderRadius: 8,
    },
    customerInfo: {
        flex: 1,
    },
    customerName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 4,
    },
    customerNip: {
        fontSize: 14,
        color: '#9ca3af',
    },
    errorText: {
        color: '#ef4444',
        fontSize: 16,
        textAlign: 'center',
    },
});

