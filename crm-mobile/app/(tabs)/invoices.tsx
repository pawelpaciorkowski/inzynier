import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, FlatList, ActivityIndicator, RefreshControl, TextInput, Text, View, TouchableOpacity, Pressable } from 'react-native';
import { Link, Stack, useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import api from '../../services/api';

// Definicja interfejsu dla obiektu faktury.
interface Invoice {
    id: number; // Unikalny identyfikator faktury.
    invoiceNumber: string; // Numer faktury.
    customerName: string; // Nazwa klienta, dla którego wystawiono fakturę.
    totalAmount: number; // Całkowita kwota faktury.
    issuedAt: string; // Data wystawienia faktury.
    isPaid: boolean; // Status płatności (true - zapłacona, false - nie).
}

/**
 * Komponent do renderowania plakietki statusu płatności.
 * @param {{ isPaid: boolean }} props - Właściwości komponentu.
 * @returns {JSX.Element} - Zwraca widok plakietki.
 */
const PaymentStatus = ({ isPaid }: { isPaid: boolean }) => (
    <View style={[styles.statusBadge, isPaid ? styles.paidBadge : styles.unpaidBadge]}>
        <FontAwesome name={isPaid ? 'check-circle' : 'hourglass-half'} size={14} color="#fff" />
        <Text style={styles.statusText}>{isPaid ? 'Zapłacona' : 'Oczekuje'}</Text>
    </View>
);

/**
 * Komponent ekranu wyświetlającego listę faktur.
 * Umożliwia przeglądanie, wyszukiwanie i filtrowanie faktur.
 * @returns {JSX.Element} - Zwraca widok z listą faktur.
 */
export default function InvoicesScreen() {
    // Pobranie tokena uwierzytelniającego z kontekstu.
    const { token } = useAuth();
    // Inicjalizacja hooka do nawigacji.
    const router = useRouter();

    // Stan przechowujący pełną listę faktur.
    const [allInvoices, setAllInvoices] = useState<Invoice[]>([]);
    // Stan przechowujący przefiltrowaną listę faktur.
    const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
    // Stan wskazujący, czy trwa ładowanie danych.
    const [loading, setLoading] = useState(true);
    // Stan wskazujący, czy trwa proces odświeżania listy.
    const [refreshing, setRefreshing] = useState(false);
    // Stan przechowujący ewentualny błąd.
    const [error, setError] = useState<string | null>(null);
    // Stan przechowujący frazę wyszukiwania.
    const [searchQuery, setSearchQuery] = useState('');
    // Stan przechowujący aktywne filtry statusu płatności.
    const [activeFilters, setActiveFilters] = useState<Set<'paid' | 'unpaid'>>(new Set(['paid', 'unpaid']));

    // Funkcja do pobierania faktur z API.
    const fetchInvoices = useCallback(async () => {
        if (!token) {
            setError("Brak tokena autoryzacyjnego.");
            setLoading(false);
            return;
        }

        if (!refreshing) setLoading(true);
        setError(null);

        try {
            const response = await api.get('/Invoices');

            const data = response.data;
            const invoicesData = data.$values || data;

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

    // Efekt uruchamiający pobieranie faktur przy starcie komponentu.
    useEffect(() => {
        fetchInvoices();
    }, []);

    // Funkcja wywoływana przy odświeżaniu listy.
    const onRefresh = useCallback(() => {
        setSearchQuery('');
        setActiveFilters(new Set(['paid', 'unpaid']));
        setRefreshing(true);
        fetchInvoices();
    }, [fetchInvoices]);

    // Efekt filtrujący faktury po zmianie wyszukiwania lub aktywnych filtrów.
    useEffect(() => {
        let filtered = allInvoices;

        // Filtrowanie po statusie.
        if (activeFilters.size > 0) {
            filtered = filtered.filter(invoice => {
                if (activeFilters.has('paid') && activeFilters.has('unpaid')) {
                    return true; // Pokaż wszystkie, jeśli oba filtry są aktywne.
                } else if (activeFilters.has('paid')) {
                    return invoice.isPaid;
                } else if (activeFilters.has('unpaid')) {
                    return !invoice.isPaid;
                }
                return false;
            });
        }

        // Filtrowanie po frazie wyszukiwania.
        if (searchQuery.trim() !== '') {
            const lowercasedQuery = searchQuery.toLowerCase();
            filtered = filtered.filter(invoice =>
                invoice.invoiceNumber.toLowerCase().includes(lowercasedQuery) ||
                invoice.customerName.toLowerCase().includes(lowercasedQuery)
            );
        }

        setFilteredInvoices(filtered);
    }, [searchQuery, activeFilters, allInvoices]);

    // Funkcja do przełączania filtrów statusu.
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

    // Funkcja do pobierania liczby faktur dla danego statusu.
    const getStatusFilterCount = (status: 'paid' | 'unpaid') => {
        return allInvoices.filter(invoice =>
            status === 'paid' ? invoice.isPaid : !invoice.isPaid
        ).length;
    };

    // Funkcja sprawdzająca, czy dany filtr jest aktywny.
    const isFilterActive = (filter: 'paid' | 'unpaid') => activeFilters.has(filter);

    // Widok ładowania.
    if (loading) return <View style={[styles.container, styles.centered]}><ActivityIndicator size="large" color="#fff" /></View>;
    // Widok błędu.
    if (error) return <View style={[styles.container, styles.centered]}><Text style={styles.errorText}>Błąd: {error}</Text></View>;

    // Główny widok komponentu.
    return (
        <>
            {/* Konfiguracja nagłówka ekranu. */}
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
                {/* Kontener wyszukiwarki. */}
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

                {/* Kontener filtrów statusu. */}
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

                {/* Lista faktur. */}
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

// Definicje stylów dla komponentu.
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
