import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, ScrollView, Text, Alert, Platform, TouchableOpacity, TextInput, Modal } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import axios from 'axios';

// Definicja interfejsu dla szczegółowych danych klienta.
interface CustomerDetails {
    id: number; // Unikalny identyfikator klienta.
    name: string; // Imię i nazwisko lub nazwa firmy.
    email: string; // Adres email.
    phone?: string; // Numer telefonu (opcjonalny).
    company?: string; // Nazwa firmy (opcjonalna).
    address?: string; // Adres (opcjonalny).
    nip?: string; // Numer NIP (opcjonalny).
    representative?: string; // Przedstawiciel (opcjonalny).
    createdAt: string; // Data utworzenia rekordu.
    assignedGroupId?: number; // ID przypisanej grupy (opcjonalne).
    assignedUserId?: number; // ID przypisanego użytkownika (opcjonalne).
}

/**
 * Komponent pomocniczy do wyświetlania wiersza z informacją (etykieta i wartość).
 * @param {{ label: string, value: string | number | null | undefined }} props - Właściwości komponentu.
 * @returns {JSX.Element | null} - Zwraca widok wiersza lub null, jeśli wartość jest pusta.
 */
const InfoRow = ({ label, value }: { label: string, value: string | number | null | undefined }) => {
    if (value === null || value === undefined || value === "") return null;
    return (
        <View style={styles.infoRow}>
            <View style={styles.infoLabel}>
                <Text style={styles.label}>{label}</Text>
            </View>
            <Text style={styles.value}>{value}</Text>
        </View>
    );
};

/**
 * Komponent ekranu szczegółów klienta.
 * Wyświetla dane klienta, umożliwia ich edycję i usuwanie.
 * @returns {JSX.Element} - Zwraca widok szczegółów klienta.
 */
export default function CustomerDetailScreen() {
    // Pobranie ID klienta z parametrów URL.
    const { id } = useLocalSearchParams<{ id: string }>();
    // Pobranie tokena z kontekstu autentykacji.
    const { token } = useAuth();
    // Inicjalizacja hooka do nawigacji.
    const router = useRouter();
    // Stan przechowujący dane klienta.
    const [customer, setCustomer] = useState<CustomerDetails | null>(null);
    // Stan wskazujący, czy trwa ładowanie danych.
    const [loading, setLoading] = useState(true);
    // Stan przechowujący ewentualny błąd.
    const [error, setError] = useState<string | null>(null);
    // Stan kontrolujący tryb edycji.
    const [isEditing, setIsEditing] = useState(false);
    // Stan przechowujący dane formularza edycji.
    const [editForm, setEditForm] = useState<Partial<CustomerDetails>>({});

    // Efekt do pobierania szczegółów klienta z API.
    useEffect(() => {
        const fetchCustomerDetails = async () => {
            if (!id || !token) {
                setLoading(false);
                return;
            }
            try {
                const response = await axios.get(`/api/Customers/${id}`);
                if (!response.data) throw new Error('Nie udało się pobrać danych klienta.');
                const data = response.data;
                setCustomer(data);
                setEditForm(data); // Inicjalizacja formularza edycji danymi klienta.
            } catch (err: any) {
                console.error("Błąd podczas pobierania klienta:", err);
                setError(err.message || "Błąd podczas pobierania danych");
            } finally {
                setLoading(false);
            }
        };
        fetchCustomerDetails();
    }, [id, token]);

    // Funkcja do zapisywania zmian w danych klienta.
    const handleSave = async () => {
        if (!customer || !token) return;

        try {
            const response = await axios.put(`/api/Customers/${customer.id}`, editForm);
            if (response.status === 204) { // Status 204 No Content oznacza sukces.
                setCustomer({ ...customer, ...editForm });
                setIsEditing(false); // Wyłączenie trybu edycji.
                Alert.alert("Sukces", "Dane klienta zostały zaktualizowane");
            }
        } catch (err: any) {
            console.error("Błąd podczas aktualizacji:", err);
            Alert.alert("Błąd", "Nie udało się zaktualizować danych klienta");
        }
    };

    // Funkcja do usuwania klienta.
    const handleDelete = () => {
        Alert.alert(
            "Usuń klienta",
            "Czy na pewno chcesz usunąć tego klienta? Tej operacji nie można cofnąć.",
            [
                { text: "Anuluj", style: "cancel" },
                {
                    text: "Usuń",
                    style: "destructive",
                    onPress: async () => {
                        if (!customer || !token) return;
                        try {
                            await axios.delete(`/api/Customers/${customer.id}`);
                            Alert.alert("Sukces", "Klient został usunięty");
                            router.back(); // Powrót do poprzedniego ekranu.
                        } catch (err: any) {
                            console.error("Błąd podczas usuwania:", err);
                            Alert.alert("Błąd", "Nie udało się usunąć klienta");
                        }
                    }
                }
            ]
        );
    };

    // Widok ładowania.
    if (loading) return (
        <View style={styles.centered}>
            <ActivityIndicator size="large" color="#fff" />
        </View>
    );

    // Widok błędu lub braku klienta.
    if (error || !customer) return (
        <View style={styles.centered}>
            <Text style={styles.errorText}>{error || 'Nie znaleziono klienta.'}</Text>
        </View>
    );

    // Główny widok komponentu.
    return (
        <>
            {/* Konfiguracja nagłówka ekranu. */}
            <Stack.Screen
                options={{
                    title: customer.name,
                    headerStyle: { backgroundColor: '#1f2937' },
                    headerTintColor: '#fff',
                    headerRight: () => (
                        <View style={styles.headerButtons}>
                            <TouchableOpacity onPress={() => setIsEditing(!isEditing)} style={styles.headerButton}>
                                <FontAwesome name={isEditing ? "times" : "edit"} size={20} color="#fff" />
                            </TouchableOpacity>
                            {isEditing && (
                                <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
                                    <FontAwesome name="save" size={20} color="#10b981" />
                                </TouchableOpacity>
                            )}
                        </View>
                    )
                }}
            />
            <ScrollView style={styles.container}>
                <View style={styles.card}>
                    {isEditing ? (
                        // Formularz edycji danych.
                        <View style={styles.editForm}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Nazwa *</Text>
                                <TextInput
                                    style={styles.input}
                                    value={editForm.name || ''}
                                    onChangeText={(text) => setEditForm({ ...editForm, name: text })}
                                    placeholder="Nazwa klienta"
                                    placeholderTextColor="#6b7280"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Email *</Text>
                                <TextInput
                                    style={styles.input}
                                    value={editForm.email || ''}
                                    onChangeText={(text) => setEditForm({ ...editForm, email: text })}
                                    placeholder="Email"
                                    placeholderTextColor="#6b7280"
                                    keyboardType="email-address"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Telefon</Text>
                                <TextInput
                                    style={styles.input}
                                    value={editForm.phone || ''}
                                    onChangeText={(text) => setEditForm({ ...editForm, phone: text })}
                                    placeholder="Numer telefonu"
                                    placeholderTextColor="#6b7280"
                                    keyboardType="phone-pad"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Firma</Text>
                                <TextInput
                                    style={styles.input}
                                    value={editForm.company || ''}
                                    onChangeText={(text) => setEditForm({ ...editForm, company: text })}
                                    placeholder="Nazwa firmy"
                                    placeholderTextColor="#6b7280"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>NIP</Text>
                                <TextInput
                                    style={styles.input}
                                    value={editForm.nip || ''}
                                    onChangeText={(text) => setEditForm({ ...editForm, nip: text })}
                                    placeholder="NIP"
                                    placeholderTextColor="#6b7280"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Adres</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    value={editForm.address || ''}
                                    onChangeText={(text) => setEditForm({ ...editForm, address: text })}
                                    placeholder="Adres"
                                    placeholderTextColor="#6b7280"
                                    multiline
                                    numberOfLines={3}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Przedstawiciel</Text>
                                <TextInput
                                    style={styles.input}
                                    value={editForm.representative || ''}
                                    onChangeText={(text) => setEditForm({ ...editForm, representative: text })}
                                    placeholder="Imię i nazwisko przedstawiciela"
                                    placeholderTextColor="#6b7280"
                                />
                            </View>
                        </View>
                    ) : (
                        // Widok szczegółów klienta.
                        <>
                            <InfoRow label="Nazwa" value={customer.name} />
                            <InfoRow label="Email" value={customer.email} />
                            <InfoRow label="Telefon" value={customer.phone} />
                            <InfoRow label="Firma" value={customer.company} />
                            <InfoRow label="NIP" value={customer.nip} />
                            <InfoRow label="Adres" value={customer.address} />
                            <InfoRow label="Przedstawiciel" value={customer.representative} />
                            <InfoRow label="Data utworzenia" value={new Date(customer.createdAt).toLocaleDateString('pl-PL')} />
                        </>
                    )}
                </View>

                {!isEditing && (
                    // Przycisk usuwania klienta.
                    <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                        <FontAwesome name="trash" size={16} color="#fff" />
                        <Text style={styles.deleteButtonText}>Usuń klienta</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
        </>
    );
}

// Definicje stylów dla komponentu.
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#111827'
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#111827',
        padding: 20
    },
    card: {
        backgroundColor: '#1f2937',
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 10,
        padding: 20
    },
    headerButtons: {
        flexDirection: 'row',
        marginRight: 10,
    },
    headerButton: {
        marginLeft: 15,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#374151'
    },
    infoLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    label: {
        fontSize: 14,
        color: '#9ca3af',
        flex: 1
    },
    value: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '500',
        textAlign: 'right',
        flex: 1
    },
    editForm: {
        marginTop: 10,
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
        height: 80,
        textAlignVertical: 'top',
    },
    deleteButton: {
        flexDirection: 'row',
        backgroundColor: '#dc2626',
        padding: 15,
        margin: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    deleteButtonText: {
        color: '#fff',
        marginLeft: 10,
        fontWeight: 'bold',
        fontSize: 16,
    },
    errorText: {
        color: '#ef4444',
        fontSize: 16,
        textAlign: 'center'
    },
});
