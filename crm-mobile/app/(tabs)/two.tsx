import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator, TextInput, Alert, ScrollView } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

// Definicja interfejsu dla profilu użytkownika.
interface UserProfile {
    id: number; // Unikalny identyfikator użytkownika.
    username: string; // Nazwa użytkownika.
    email: string; // Adres email użytkownika.
    role: string | null; // Nazwa roli przypisanej do użytkownika (z backendu).
    roleName?: string; // Alias dla kompatybilności wstecznej.
}

/**
 * Komponent ekranu profilu użytkownika (druga zakładka).
 * Wyświetla dane profilu, umożliwia zmianę hasła i wylogowanie.
 * @returns {JSX.Element} - Zwraca widok profilu użytkownika.
 */
export default function TabTwoScreen() {
    // Pobranie funkcji wylogowania i tokena z kontekstu autentykacji.
    const { logout, token } = useAuth();
    // Stan przechowujący dane profilu użytkownika.
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    // Stan wskazujący, czy trwa ładowanie danych.
    const [loading, setLoading] = useState(true);
    // Stan przechowujący ewentualny błąd.
    const [error, setError] = useState<string | null>(null);

    // Stany dla formularza zmiany hasła.
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    // Stan wskazujący, czy trwa proces zmiany hasła.
    const [changingPassword, setChangingPassword] = useState(false);

    // Efekt do pobierania danych profilu użytkownika po zamontowaniu komponentu.
    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                const response = await api.get('/Profile');
                if (!response.data) throw new Error('Nie udało się pobrać danych profilu.');
                const data = response.data;
                // Mapowanie roli - backend zwraca 'role', ale używamy również 'roleName' dla kompatybilności
                const profileData: UserProfile = {
                    ...data,
                    roleName: data.role || null, // Ustawiamy roleName na podstawie role z backendu
                };
                setUserProfile(profileData);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchUserProfile();
    }, [token]);

    // Funkcja do obsługi zmiany hasła.
    const handleChangePassword = async () => {
        // Walidacja pól formularza.
        if (!currentPassword || !newPassword || !confirmNewPassword) {
            Alert.alert("Błąd", "Wszystkie pola hasła są wymagane.");
            return;
        }
        if (newPassword !== confirmNewPassword) {
            Alert.alert("Błąd", "Nowe hasło i potwierdzenie hasła nie są zgodne.");
            return;
        }
        if (newPassword.length < 6) {
            Alert.alert("Błąd", "Nowe hasło musi mieć co najmniej 6 znaków.");
            return;
        }

        setChangingPassword(true);
        try {
            // Wysłanie zapytania PUT do API w celu zmiany hasła.
            const response = await api.put('/Profile/change-password', {
                currentPassword,
                newPassword,
            });

            if (!response.data) {
                throw new Error('Nie udało się zmienić hasła.');
            }

            Alert.alert("Sukces", "Hasło zostało pomyślnie zmienione.");
            // Wyczyszczenie pól formularza po pomyślnej zmianie.
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
        } catch (err: any) {
            Alert.alert("Błąd", err.message);
        } finally {
            setChangingPassword(false);
        }
    };

    // Widok ładowania.
    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#fff" />
            </View>
        );
    }

    // Widok błędu.
    if (error) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>Błąd: {error}</Text>
            </View>
        );
    }

    // Główny widok komponentu.
    return (
        <ScrollView style={styles.container}>
            {/* Karta z danymi profilu */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Dane Profilu</Text>
                <Text style={styles.infoText}>Nazwa użytkownika: {userProfile?.username}</Text>
                <Text style={styles.infoText}>Email: {userProfile?.email}</Text>
                <Text style={styles.infoText}>Rola: {userProfile?.role || userProfile?.roleName || 'Brak'}</Text>
            </View>

            {/* Karta z formularzem zmiany hasła */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Zmień Hasło</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Bieżące hasło"
                    placeholderTextColor="#9ca3af"
                    secureTextEntry
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Nowe hasło"
                    placeholderTextColor="#9ca3af"
                    secureTextEntry
                    value={newPassword}
                    onChangeText={setNewPassword}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Potwierdź nowe hasło"
                    placeholderTextColor="#9ca3af"
                    secureTextEntry
                    value={confirmNewPassword}
                    onChangeText={setConfirmNewPassword}
                />
                <Button
                    title={changingPassword ? "Zmieniam..." : "Zmień Hasło"}
                    onPress={handleChangePassword}
                    disabled={changingPassword}
                    color="#3b82f6"
                />
            </View>

            {/* Kontener z przyciskiem wylogowania */}
            <View style={styles.logoutContainer}>
                <Button title="Wyloguj" onPress={logout} color="#ef4444" />
            </View>
        </ScrollView>
    );
}

// Definicje stylów dla komponentu.
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#111827',
        padding: 16,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#111827',
    },
    card: {
        backgroundColor: '#1f2937',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 16,
    },
    infoText: {
        fontSize: 16,
        color: '#fff',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#374151',
        color: '#fff',
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
        fontSize: 16,
    },
    logoutContainer: {
        marginTop: 20,
        marginBottom: 20,
    },
    errorText: {
        color: '#ef4444',
        fontSize: 16,
        textAlign: 'center',
    },
});
