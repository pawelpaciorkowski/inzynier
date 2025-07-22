import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, ScrollView, Text, Alert, Platform, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import axios from 'axios';

// ✅ INTERFEJSY W PEŁNI ZGODNE Z TWOIM KODEM C#
interface InvoiceItemDetails {
    id: number;
    description: string;
    quantity: number;
    unitPrice: number;
    netAmount: number;
    grossAmount: number;
}

interface InvoiceDetails {
    id: number;
    invoiceNumber: string;
    customerName: string;
    customerNip: string;
    totalAmount: number;
    netAmount: number;
    taxAmount: number;
    issueDate: string;
    dueDate: string;
    isPaid: boolean;
    items: {
        $values: InvoiceItemDetails[];
    };
}

const InfoRow = ({ label, value }: { label: string, value: string | number | null | undefined }) => {
    if (value === null || value === undefined) return null;
    return (
        <View style={styles.infoRow}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value}>{value}</Text>
        </View>
    );
};

export default function InvoiceDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { token } = useAuth();
    const [invoice, setInvoice] = useState<InvoiceDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchInvoiceDetails = async () => {
            if (!id || !token) { setLoading(false); return; }
            setLoading(true);
            try {
                const response = await axios.get(`/api/Invoices/${id}`);
                if (!response.data) throw new Error(`Nie udało się pobrać danych faktury (status: ${response.status})`);
                const data = response.data;
                setInvoice(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchInvoiceDetails();
    }, [id, token]);

    const handleDownloadPdf = async () => {
        if (!token || !id || !invoice) return;
        setIsDownloading(true);
        try {
            const fileName = `${invoice.invoiceNumber.replace(/\//g, '_')}.pdf`;
            const fileUri = FileSystem.documentDirectory + fileName;

            const response = await axios.get(`/api/Invoices/${id}/pdf`, { responseType: 'blob' });

            const reader = new FileReader();
            reader.onload = async () => {
                if (reader.result && typeof reader.result === 'string') {
                    await FileSystem.writeAsStringAsync(fileUri, reader.result.split(',')[1], { encoding: FileSystem.EncodingType.Base64 });
                    if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(fileUri);
                    else Alert.alert("Błąd", "Udostępnianie nie jest dostępne na tym urządzeniu.");
                }
            };
            reader.readAsDataURL(response.data);

        } catch (err: any) {
            Alert.alert("Błąd pobierania", "Nie udało się pobrać pliku PDF.");
        } finally {
            setIsDownloading(false);
        }
    };

    if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color="#fff" /></View>;
    if (error || !invoice) return <View style={styles.centered}><Text style={styles.errorText}>{error || 'Nie znaleziono faktury.'}</Text></View>;

    return (
        <>
            <Stack.Screen options={{ title: invoice.invoiceNumber, headerStyle: { backgroundColor: '#1f2937' }, headerTintColor: '#fff' }} />
            <ScrollView style={styles.container}>
                <View style={styles.card}>
                    <InfoRow label="Numer faktury" value={invoice.invoiceNumber} />
                    <InfoRow label="Klient" value={invoice.customerName} />
                    <InfoRow label="NIP" value={invoice.customerNip} />
                    <InfoRow label="Data wystawienia" value={new Date(invoice.issueDate).toLocaleDateString('pl-PL')} />
                    <InfoRow label="Termin płatności" value={new Date(invoice.dueDate).toLocaleDateString('pl-PL')} />
                    <InfoRow label="Status" value={invoice.isPaid ? 'Zapłacona' : 'Oczekuje'} />
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Pozycje na fakturze</Text>
                    {invoice.items?.$values.map(item => (
                        <View key={item.id} style={styles.item}>
                            <Text style={styles.itemName}>{item.description}</Text>
                            <Text style={styles.itemDetails}>
                                {item.quantity} x {item.unitPrice !== undefined && item.unitPrice !== null ? item.unitPrice.toFixed(2) : 'N/A'} PLN = {item.grossAmount !== undefined && item.grossAmount !== null ? item.grossAmount.toFixed(2) : 'N/A'} PLN
                            </Text>
                        </View>
                    ))}
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Podsumowanie</Text>
                    {/* Te wartości będą teraz dostępne dzięki poprawce w backendzie */}
                    <InfoRow label="Wartość netto" value={invoice.netAmount !== undefined && invoice.netAmount !== null ? `${invoice.netAmount.toFixed(2)} PLN` : 'N/A'} />
                    <InfoRow label="Podatek VAT" value={invoice.taxAmount !== undefined && invoice.taxAmount !== null ? `${invoice.taxAmount.toFixed(2)} PLN` : 'N/A'} />
                    <Text style={styles.totalAmountLabel}>Do zapłaty (brutto)</Text>
                    <Text style={styles.totalAmountValue}>{invoice.totalAmount !== undefined && invoice.totalAmount !== null ? `${invoice.totalAmount.toFixed(2)} PLN` : 'N/A'}</Text>
                </View>

                <TouchableOpacity style={[styles.downloadButton, isDownloading && styles.disabledButton]} onPress={handleDownloadPdf} disabled={isDownloading}>
                    {isDownloading ? <ActivityIndicator color="#fff" /> : <><FontAwesome name="download" size={20} color="#fff" /><Text style={styles.downloadButtonText}>Pobierz PDF</Text></>}
                </TouchableOpacity>
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#111827' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111827', padding: 20 },
    card: { backgroundColor: '#1f2937', marginHorizontal: 16, marginVertical: 8, borderRadius: 10, padding: 20 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#374151', paddingBottom: 10 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
    label: { fontSize: 14, color: '#9ca3af' },
    value: { fontSize: 14, color: '#fff', fontWeight: 'bold' },
    item: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#374151' },
    itemName: { fontSize: 16, color: '#fff' },
    itemDetails: { fontSize: 12, color: '#9ca3af', marginTop: 4 },
    totalAmountLabel: { fontSize: 16, color: '#9ca3af', textAlign: 'center', marginTop: 10 },
    totalAmountValue: { fontSize: 28, color: '#3b82f6', fontWeight: 'bold', textAlign: 'center', marginTop: 5 },
    downloadButton: { flexDirection: 'row', backgroundColor: '#10b981', padding: 15, margin: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    downloadButtonText: { color: '#fff', marginLeft: 10, fontWeight: 'bold', fontSize: 16 },
    disabledButton: { backgroundColor: '#555' },
    errorText: { color: '#ef4444', fontSize: 16, textAlign: 'center' },
});