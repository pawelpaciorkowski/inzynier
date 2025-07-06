import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, ScrollView, Text, Alert, Platform } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { TouchableOpacity } from 'react-native-gesture-handler';

interface CustomerDetails {
    id: number;
    name: string;
    email: string;
    phoneNumber: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
}

const InfoRow = ({ label, value }: { label: string, value: string | number | null | undefined }) => {
    if (value === null || value === undefined || value === "") return null;
    return (
        <View style={styles.infoRow}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value}>{value}</Text>
        </View>
    );
};

export default function CustomerDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { token } = useAuth();
    const [customer, setCustomer] = useState<CustomerDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCustomerDetails = async () => {
            if (!id || !token) {
                setLoading(false);
                return;
            }
            try {
                const response = await fetch(`http://10.0.2.2:5167/api/Customers/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                if (!response.ok) throw new Error('Nie udało się pobrać danych klienta.');
                const data = await response.json();
                setCustomer(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchCustomerDetails();
    }, [id, token]);

    if (loading) return <ActivityIndicator size="large" color="#fff" style={styles.centered} />;
    if (error || !customer) return <View style={styles.centered}><Text style={styles.errorText}>{error || 'Nie znaleziono klienta.'}</Text></View>;

    return (
        <>
            <Stack.Screen options={{ title: customer.name, headerStyle: { backgroundColor: '#1f2937' }, headerTintColor: '#fff' }} />
            <ScrollView style={styles.container}>
                <View style={styles.card}>
                    <InfoRow label="Nazwa" value={customer.name} />
                    <InfoRow label="Email" value={customer.email} />
                    <InfoRow label="Numer telefonu" value={customer.phoneNumber} />
                    <InfoRow label="Adres" value={customer.address} />
                    <InfoRow label="Miasto" value={customer.city} />
                    <InfoRow label="Kod pocztowy" value={customer.postalCode} />
                    <InfoRow label="Kraj" value={customer.country} />
                </View>
            </ScrollView>
        </>
    );
}

// Style dopasowane do ciemnego motywu
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#111827' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111827', padding: 20 },
    card: { backgroundColor: '#1f2937', marginHorizontal: 16, marginVertical: 8, borderRadius: 10, padding: 20 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#374151', paddingBottom: 10 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
    label: { fontSize: 14, color: '#9ca3af' },
    value: { fontSize: 14, color: '#fff', fontWeight: 'bold' },
    item: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#374151' },
    itemName: { fontSize: 16, color: '#fff' },
    itemDetails: { fontSize: 12, color: '#9ca3af', marginTop: 4 },
    totalAmountLabel: { fontSize: 16, color: '#9ca3af', textAlign: 'center', marginTop: 10 },
    totalAmountValue: { fontSize: 28, color: '#3b82f6', fontWeight: 'bold', textAlign: 'center', marginTop: 5 },
    downloadButton: { flexDirection: 'row', backgroundColor: '#10b981', padding: 15, margin: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    downloadButtonText: { color: '#fff', marginLeft: 10, fontWeight: 'bold', fontSize: 16 },
    errorText: { color: '#ef4444', fontSize: 16, textAlign: 'center' },
});