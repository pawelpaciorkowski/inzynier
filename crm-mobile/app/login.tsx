import { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

/**
 * Komponent ekranu logowania.
 * Umożliwia użytkownikowi wprowadzenie nazwy użytkownika i hasła w celu zalogowania się do aplikacji.
 * @returns {JSX.Element} - Zwraca formularz logowania.
 */
export default function LoginScreen() {
    // Stan przechowujący nazwę użytkownika wprowadzoną przez użytkownika.
    const [username, setUsername] = useState('admin');
    // Stan przechowujący hasło wprowadzone przez użytkownika.
    const [password, setPassword] = useState('Diviruse007@');
    // Pobranie funkcji `login` z kontekstu autentykacji.
    const { login } = useAuth();

    /**
     * Funkcja obsługująca naciśnięcie przycisku logowania.
     * Próbuje zalogować użytkownika przy użyciu wprowadzonych danych.
     * W przypadku błędu wyświetla alert.
     */
    const onLoginPress = async () => {
        try {
            // Wywołuje funkcję `login` z kontekstu z wprowadzonymi danymi.
            await login(username, password);
        } catch (e) {
            // W przypadku błędu (np. nieprawidłowe dane) wyświetla alert.
            Alert.alert("Błąd logowania", "Nieprawidłowa nazwa użytkownika lub hasło.");
        }
    };

    // Renderuje interfejs użytkownika ekranu logowania.
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

// Definicje stylów dla komponentu ekranu logowania.
const styles = StyleSheet.create({
    // Styl dla głównego kontenera widoku.
    container: {
        flex: 1, // Kontener zajmuje całą dostępną przestrzeń.
        justifyContent: 'center', // Wyśrodkowuje zawartość w pionie.
        padding: 20, // Wewnętrzny odstęp.
        backgroundColor: '#111827' // Kolor tła.
    },
    // Styl dla tytułu ekranu.
    title: {
        fontSize: 32, // Rozmiar czcionki.
        fontWeight: 'bold', // Grubość czcionki.
        color: 'white', // Kolor tekstu.
        textAlign: 'center', // Wyśrodkowanie tekstu.
        marginBottom: 40, // Margines dolny.
    },
    // Styl dla pól tekstowych.
    input: {
        height: 50, // Wysokość pola.
        borderColor: '#374151', // Kolor obramowania.
        borderWidth: 1, // Szerokość obramowania.
        borderRadius: 8, // Zaokrąglenie rogów.
        marginBottom: 20, // Margines dolny.
        paddingHorizontal: 15, // Wewnętrzny odstęp poziomy.
        color: 'white', // Kolor wprowadzanego tekstu.
        backgroundColor: '#1f2937' // Kolor tła pola.
    },
});
