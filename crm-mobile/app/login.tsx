// Plik: crm-mobile/app/login.tsx
import { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
    const [username, setUsername] = useState('user'); // Domyślne wartości dla ułatwienia testowania
    const [password, setPassword] = useState('user123');
    const { login } = useAuth();

    const onLoginPress = async () => {
        try {
            await login(username, password);
            // Nawigacja odbędzie się automatycznie w _layout.tsx
        } catch (e) {
            Alert.alert("Błąd logowania", "Nieprawidłowa nazwa użytkownika lub hasło.");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>CRM Login</Text>
            <TextInput
                style={styles.input}
                placeholder="Nazwa użytkownika"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Hasło"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <Button title="Zaloguj się" onPress={onLoginPress} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#111827'
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        marginBottom: 40,
    },
    input: {
        height: 50,
        borderColor: '#374151',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 20,
        paddingHorizontal: 15,
        color: 'white',
        backgroundColor: '#1f2937'
    },
});