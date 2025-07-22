import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, ScrollView, Text, Alert, Platform, TouchableOpacity, TextInput, Modal } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import axios from 'axios';

interface CustomerDetails {
    id: number;
    name: string;
    email: string;
    phone?: string;
    company?: string;
    address?: string;
    nip?: string;
    representative?: string;
    createdAt: string;
    assignedGroupId?: number;
    assignedUserId?: number;
}

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

export default function CustomerDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { token } = useAuth();
    const router = useRouter();
    const [customer, setCustomer] = useState<CustomerDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<Partial<CustomerDetails>>({});

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
                setEditForm(data);
            } catch (err: any) {
                console.error("Błąd podczas pobierania klienta:", err);
                setError(err.message || "Błąd podczas pobierania danych");
            } finally {
                setLoading(false);
            }
        };
        fetchCustomerDetails();
    }, [id, token]);

    const handleSave = async () => {
        if (!customer || !token) return;

        try {
            const response = await axios.put(`/api/Customers/${customer.id}`, editForm);
            if (response.status === 204) {
                setCustomer({ ...customer, ...editForm });
                setIsEditing(false);
                Alert.alert("Sukces", "Dane klienta zostały zaktualizowane");
            }
        } catch (err: any) {
            console.error("Błąd podczas aktualizacji:", err);
            Alert.alert("Błąd", "Nie udało się zaktualizować danych klienta");
        }
    };

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
                            router.back();
                        } catch (err: any) {
                            console.error("Błąd podczas usuwania:", err);
                            Alert.alert("Błąd", "Nie udało się usunąć klienta");
                        }
                    }
                }
            ]
        );
    };

    if (loading) return (
        <View style={styles.centered}>
            <ActivityIndicator size="large" color="#fff" />
        </View>
    );

    if (error || !customer) return (
        <View style={styles.centered}>
            <Text style={styles.errorText}>{error || 'Nie znaleziono klienta.'}</Text>
        </View>
    );

    return (
        <>
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
                    <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                        <FontAwesome name="trash" size={16} color="#fff" />
                        <Text style={styles.deleteButtonText}>Usuń klienta</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
        </>
    );
}

// Style dopasowane do ciemnego motywu
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