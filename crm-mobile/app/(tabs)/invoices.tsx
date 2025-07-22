import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, FlatList, ActivityIndicator, RefreshControl, TextInput, Text, View, TouchableOpacity, Pressable } from 'react-native';
import { Link, Stack, useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import axios from 'axios';

interface Invoice {
    id: number;
    invoiceNumber: string;
    customerName: string;
    totalAmount: number;
    issuedAt: string;
    isPaid: boolean;
}

// Komponent do renderowania statusu płatności
const PaymentStatus = ({ isPaid }: { isPaid: boolean }) => (
    <View style={[styles.statusBadge, isPaid ? styles.paidBadge : styles.unpaidBadge]}>
        <FontAwesome name={isPaid ? 'check-circle' : 'hourglass-half'} size={14} color="#fff" />
        <Text style={styles.statusText}>{isPaid ? 'Zapłacona' : 'Oczekuje'}</Text>
    </View>
);

export default function InvoicesScreen() {
    const { token } = useAuth();
    const router = useRouter();

    const [allInvoices, setAllInvoices] = useState<Invoice[]>([]);
    const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilters, setActiveFilters] = useState<Set<'paid' | 'unpaid'>>(new Set(['paid', 'unpaid']));

    const fetchInvoices = useCallback(async () => {
        if (!token) {
            setError("Brak tokena autoryzacyjnego.");
            setLoading(false);
            return;
        }

        if (!refreshing) setLoading(true);
        setError(null);

        try {
            const response = await axios.get('/api/Invoices');

            const data = response.data;
            console.log("Odpowiedź z backendu (raw):", JSON.stringify(data, null, 2));

            const invoicesData = data.$values || data;
            console.log("Przetworzone dane faktur:", invoicesData);

            if (invoicesData.length > 0) {
                const firstInvoice = invoicesData[0];
                console.log("Pierwsza faktura (pełna):", JSON.stringify(firstInvoice, null, 2));
                console.log("Pierwsza faktura totalAmount:", firstInvoice.totalAmount);
                console.log("Typ totalAmount:", typeof firstInvoice.totalAmount);
                console.log("Czy totalAmount jest null:", firstInvoice.totalAmount === null);
                console.log("Czy totalAmount jest undefined:", firstInvoice.totalAmount === undefined);
            }

            setAllInvoices(invoicesData);
            setFilteredInvoices(invoicesData);
        } catch (err: any) {
            console.error("Błąd podczas pobierania faktur:", err);
            setError(err.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [token, refreshing]);

    useEffect(() => {
        fetchInvoices();
    }, []);

    const onRefresh = useCallback(() => {
        setSearchQuery('');
        setActiveFilters(new Set(['paid', 'unpaid']));
        setRefreshing(true);
        fetchInvoices();
    }, [fetchInvoices]);

    // Filtrowanie faktur po wyszukiwaniu i statusie
    useEffect(() => {
        let filtered = allInvoices;

        // Filtrowanie po statusie - jeśli żaden filtr nie jest aktywny, pokazuj wszystkie
        if (activeFilters.size > 0) {
            filtered = filtered.filter(invoice => {
                if (activeFilters.has('paid') && activeFilters.has('unpaid')) {
                    return true; // Oba filtry aktywne = wszystkie faktury
                } else if (activeFilters.has('paid')) {
                    return invoice.isPaid;
                } else if (activeFilters.has('unpaid')) {
                    return !invoice.isPaid;
                }
                return false;
            });
        }

        // Filtrowanie po wyszukiwaniu
        if (searchQuery.trim() !== '') {
            const lowercasedQuery = searchQuery.toLowerCase();
            filtered = filtered.filter(invoice =>
                invoice.invoiceNumber.toLowerCase().includes(lowercasedQuery) ||
                invoice.customerName.toLowerCase().includes(lowercasedQuery)
            );
        }

        setFilteredInvoices(filtered);
    }, [searchQuery, activeFilters, allInvoices]);

    const toggleFilter = (filter: 'paid' | 'unpaid') => {
        setActiveFilters(prev => {
            const newFilters = new Set(prev);
            if (newFilters.has(filter)) {
                newFilters.delete(filter);
            } else {
                newFilters.add(filter);
            }
            return newFilters;
        });
    };

    const getStatusFilterCount = (status: 'paid' | 'unpaid') => {
        return allInvoices.filter(invoice =>
            status === 'paid' ? invoice.isPaid : !invoice.isPaid
        ).length;
    };

    const isFilterActive = (filter: 'paid' | 'unpaid') => activeFilters.has(filter);

    if (loading) return <View style={[styles.container, styles.centered]}><ActivityIndicator size="large" color="#fff" /></View>;
    if (error) return <View style={[styles.container, styles.centered]}><Text style={styles.errorText}>Błąd: {error}</Text></View>;

    return (
        <>
            <Stack.Screen options={{
                title: 'Faktury', headerRight: () => (
                    <Link href="/add-invoice" asChild>
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
                        placeholder="Szukaj po numerze lub kliencie..."
                        placeholderTextColor="#9ca3af"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                {/* Filtry statusu */}
                <View style={styles.filterContainer}>
                    <TouchableOpacity
                        style={[styles.filterButton, isFilterActive('paid') && styles.filterButtonActive]}
                        onPress={() => toggleFilter('paid')}
                    >
                        <FontAwesome
                            name={isFilterActive('paid') ? "check-circle" : "circle-o"}
                            size={12}
                            color={isFilterActive('paid') ? '#fff' : '#10b981'}
                        />
                        <Text style={[styles.filterButtonText, isFilterActive('paid') && styles.filterButtonTextActive]} numberOfLines={1}>
                            Zapłacone ({getStatusFilterCount('paid')})
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.filterButton, isFilterActive('unpaid') && styles.filterButtonActive]}
                        onPress={() => toggleFilter('unpaid')}
                    >
                        <FontAwesome
                            name={isFilterActive('unpaid') ? "check-circle" : "circle-o"}
                            size={12}
                            color={isFilterActive('unpaid') ? '#fff' : '#f59e0b'}
                        />
                        <Text style={[styles.filterButtonText, isFilterActive('unpaid') && styles.filterButtonTextActive]} numberOfLines={1}>
                            Oczekujące ({getStatusFilterCount('unpaid')})
                        </Text>
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={filteredInvoices}
                    keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => router.push({ pathname: "/invoice/[id]", params: { id: item.id } })}>
                            <View style={styles.item}>
                                <View style={styles.itemHeader}>
                                    <Text style={styles.itemTitle}>{item.invoiceNumber}</Text>
                                    <PaymentStatus isPaid={item.isPaid} />
                                </View>
                                <Text style={styles.itemSubtitle}>{item.customerName}</Text>
                                <View style={styles.itemFooter}>
                                    <Text style={styles.itemDate}>
                                        Wystawiono: {new Date(item.issuedAt).toLocaleDateString('pl-PL')}
                                    </Text>
                                    <Text style={styles.itemAmount}>
                                        {item.totalAmount !== undefined && item.totalAmount !== null ? item.totalAmount.toFixed(2) : 'N/A'} PLN
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    )}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
                    ListEmptyComponent={
                        <Text style={styles.noResultsText}>
                            {searchQuery || activeFilters.size < 2
                                ? 'Brak faktur pasujących do filtrów.'
                                : 'Brak faktur'
                            }
                        </Text>
                    }
                />
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#111827' },
    centered: { justifyContent: 'center', alignItems: 'center' },
    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1f2937', borderRadius: 8, margin: 16, paddingHorizontal: 10 },
    searchIcon: { marginRight: 8 },
    searchInput: { flex: 1, height: 45, color: '#fff', fontSize: 16 },
    item: { backgroundColor: '#1f2937', padding: 15, marginVertical: 8, marginHorizontal: 16, borderRadius: 10 },
    itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
    itemTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
    itemSubtitle: { fontSize: 14, color: '#9ca3af', marginBottom: 15 },
    itemFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#374151', paddingTop: 10 },
    itemDate: { fontSize: 12, color: '#6b7280' },
    itemAmount: { fontSize: 16, fontWeight: 'bold', color: '#3b82f6' },
    statusBadge: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12 },
    paidBadge: { backgroundColor: '#10b981' }, // Zielony
    unpaidBadge: { backgroundColor: '#f59e0b' }, // Pomarańczowy
    statusText: { color: '#fff', fontSize: 12, marginLeft: 5, fontWeight: 'bold' },
    errorText: { color: '#ef4444', fontSize: 16 },
    noResultsText: { textAlign: 'center', marginTop: 20, fontSize: 16, color: '#6b7280' },
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 10,
        marginHorizontal: 16,
        backgroundColor: '#1f2937',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12
    },
    filterButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 16,
        marginHorizontal: 4
    },
    filterButtonActive: {
        backgroundColor: '#3b82f6',
        borderWidth: 1,
        borderColor: '#3b82f6'
    },
    filterButtonText: {
        color: '#9ca3af',
        fontSize: 13,
        fontWeight: 'bold',
        marginLeft: 6,
        textAlign: 'center',
        flexShrink: 1
    },
    filterButtonTextActive: {
        color: '#fff'
    },
});