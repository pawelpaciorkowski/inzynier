import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useRouter, Stack } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Picker } from '@react-native-picker/picker';

export default function AddCustomerScreen() {
    const { token } = useAuth();
    const router = useRouter();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [company, setCompany] = useState('');
    const [address, setAddress] = useState('');
    const [nip, setNip] = useState('');
    const [representativeUserId, setRepresentativeUserId] = useState<number | null>(null);
    const [users, setUsers] = useState<Array<{ id: number; username: string; email: string }>>([]);
    const [loading, setLoading] = useState(false);
    const [loadingUsers, setLoadingUsers] = useState(false);

    // Pobierz listę użytkowników przy załadowaniu komponentu
    useEffect(() => {
        const fetchUsers = async () => {
            if (!token) return;
            setLoadingUsers(true);
            try {
                const response = await api.get('/Profile/users-list');
                setUsers(response.data || []);
            } catch (err: any) {
                console.error("Błąd podczas pobierania użytkowników:", err);
            } finally {
                setLoadingUsers(false);
            }
        };
        fetchUsers();
    }, [token]);

    const handleAddCustomer = async () => {
        if (!name.trim() || !email.trim()) {
            Alert.alert("Błąd walidacji", "Nazwa i Email są wymagane.");
            return;
        }

        // Walidacja email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert("Błąd walidacji", "Podaj poprawny adres email.");
            return;
        }

        setLoading(true);
        try {
            const response = await api.post(`/Customers`, {
                name: name.trim(),
                email: email.trim(),
                phone: phone.trim() || null,
                company: company.trim() || null,
                address: address.trim() || null,
                nip: nip.trim() || null,
                representativeUserId: representativeUserId || null,
            });

            if (response.status === 201) {
                Alert.alert("Sukces", "Klient został pomyślnie dodany.", [
                    { text: "OK", onPress: () => router.back() }
                ]);
            }
        } catch (err: any) {
            console.error("Błąd podczas dodawania klienta:", err);
            const errorMessage = err.response?.data?.message || err.message || "Nieznany błąd";
            Alert.alert("Błąd", `Nie udało się dodać klienta: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Stack.Screen
                options={{
                    title: 'Nowy Klient',
                    headerStyle: { backgroundColor: '#1f2937' },
                    headerTintColor: '#fff'
                }}
            />
            <ScrollView style={styles.container}>
                <View style={styles.card}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Nazwa klienta *</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Imię i nazwisko lub nazwa firmy"
                            placeholderTextColor="#6b7280"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Email *</Text>
                        <TextInput
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            placeholder="email@example.com"
                            placeholderTextColor="#6b7280"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Telefon</Text>
                        <TextInput
                            style={styles.input}
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                            placeholder="+48 123 456 789"
                            placeholderTextColor="#6b7280"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Firma</Text>
                        <TextInput
                            style={styles.input}
                            value={company}
                            onChangeText={setCompany}
                            placeholder="Nazwa firmy"
                            placeholderTextColor="#6b7280"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>NIP</Text>
                        <TextInput
                            style={styles.input}
                            value={nip}
                            onChangeText={setNip}
                            placeholder="1234567890"
                            placeholderTextColor="#6b7280"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Adres</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={address}
                            onChangeText={setAddress}
                            placeholder="Ulica, kod pocztowy miasto"
                            placeholderTextColor="#6b7280"
                            multiline
                            numberOfLines={3}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Przedstawiciel (pracownik firmy)</Text>
                        {loadingUsers ? (
                            <ActivityIndicator size="small" color="#10b981" style={{ padding: 12 }} />
                        ) : (
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={representativeUserId}
                                    onValueChange={(itemValue) => setRepresentativeUserId(itemValue || null)}
                                    style={styles.picker}
                                    dropdownIconColor="#fff"
                                >
                                    <Picker.Item label="-- Wybierz przedstawiciela --" value={null} />
                                    {users.map(user => (
                                        <Picker.Item key={user.id} label={`${user.username} (${user.email})`} value={user.id} />
                                    ))}
                                </Picker>
                            </View>
                        )}
                    </View>

                    <TouchableOpacity
                        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                        onPress={handleAddCustomer}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <FontAwesome name="plus" size={16} color="#fff" />
                        )}
                        <Text style={styles.submitButtonText}>
                            {loading ? "Dodaję..." : "Dodaj Klienta"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#111827',
        padding: 16
    },
    card: {
        backgroundColor: '#1f2937',
        borderRadius: 10,
        padding: 20,
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
    submitButton: {
        flexDirection: 'row',
        backgroundColor: '#10b981',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    },
    submitButtonDisabled: {
        backgroundColor: '#6b7280',
    },
    submitButtonText: {
        color: '#fff',
        marginLeft: 10,
        fontWeight: 'bold',
        fontSize: 16,
    },
    pickerContainer: {
        backgroundColor: '#374151',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#4b5563',
        overflow: 'hidden',
    },
    picker: {
        color: '#fff',
        height: 50,
    },
});