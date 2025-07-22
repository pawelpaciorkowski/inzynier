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
    customerNip: string;
    totalAmount: number;
    issueDate: string;
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
            const invoicesData = data.$values || data;

            setAllInvoices(invoicesData);
            setFilteredInvoices(invoicesData);
        } catch (err: any) {
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
        setRefreshing(true);
        fetchInvoices();
    }, [fetchInvoices]);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredInvoices(allInvoices);
        } else {
            const lowercasedQuery = searchQuery.toLowerCase();
            const filtered = allInvoices.filter(invoice =>
                invoice.invoiceNumber.toLowerCase().includes(lowercasedQuery) ||
                invoice.customerName.toLowerCase().includes(lowercasedQuery)
            );
            setFilteredInvoices(filtered);
        }
    }, [searchQuery, allInvoices]);

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
                <FlatList
                    data={filteredInvoices}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => router.push({ pathname: "/invoice/[id]", params: { id: item.id } })}>
                            <View style={styles.item}>
                                <View style={styles.itemHeader}>
                                    <Text style={styles.itemTitle}>{item.invoiceNumber}</Text>
                                    <PaymentStatus isPaid={item.isPaid} />
                                </View>
                                <Text style={styles.itemSubtitle}>{item.customerName}</Text>
                                {item.customerNip && (
                                    <Text style={styles.itemNip}>NIP: {item.customerNip}</Text>
                                )}
                                <View style={styles.itemFooter}>
                                    <Text style={styles.itemDate}>
                                        Wystawiono: {new Date(item.issueDate).toLocaleDateString('pl-PL')}
                                    </Text>
                                    <Text style={styles.itemAmount}>
                                        {item.totalAmount !== undefined && item.totalAmount !== null ? item.totalAmount.toFixed(2) : 'N/A'} PLN
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    )}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
                    ListEmptyComponent={<Text style={styles.noResultsText}>Brak faktur</Text>}
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
    itemNip: { fontSize: 12, color: '#6b7280', marginBottom: 5 },
    itemFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#374151', paddingTop: 10 },
    itemDate: { fontSize: 12, color: '#6b7280' },
    itemAmount: { fontSize: 16, fontWeight: 'bold', color: '#3b82f6' },
    statusBadge: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12 },
    paidBadge: { backgroundColor: '#10b981' }, // Zielony
    unpaidBadge: { backgroundColor: '#f59e0b' }, // Pomarańczowy
    statusText: { color: '#fff', fontSize: 12, marginLeft: 5, fontWeight: 'bold' },
    errorText: { color: '#ef4444', fontSize: 16 },
    noResultsText: { textAlign: 'center', marginTop: 20, fontSize: 16, color: '#6b7280' },
});