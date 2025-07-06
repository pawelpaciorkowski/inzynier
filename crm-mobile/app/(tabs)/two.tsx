import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator, TextInput, Alert, ScrollView } from 'react-native';
import { useAuth } from '../../context/AuthContext';

interface UserProfile {
    id: number;
    username: string;
    email: string;
    roleName: string;
}

export default function TabTwoScreen() {
    const { logout, token } = useAuth();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [changingPassword, setChangingPassword] = useState(false);

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                const response = await fetch('http://10.0.2.2:5167/api/Profile', {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                if (!response.ok) throw new Error('Nie udało się pobrać danych profilu.');
                const data = await response.json();
                setUserProfile(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchUserProfile();
    }, [token]);

    const handleChangePassword = async () => {
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
            const response = await fetch('http://10.0.2.2:5167/api/Profile/change-password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Nie udało się zmienić hasła.');
            }

            Alert.alert("Sukces", "Hasło zostało pomyślnie zmienione.");
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
        } catch (err: any) {
            Alert.alert("Błąd", err.message);
        } finally {
            setChangingPassword(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#fff" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>Błąd: {error}</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Dane Profilu</Text>
                <Text style={styles.infoText}>Nazwa użytkownika: {userProfile?.username}</Text>
                <Text style={styles.infoText}>Email: {userProfile?.email}</Text>
                <Text style={styles.infoText}>Rola: {userProfile?.roleName}</Text>
            </View>

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

            <View style={styles.logoutContainer}>
                <Button title="Wyloguj" onPress={logout} color="#ef4444" />
            </View>
        </ScrollView>
    );
}

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