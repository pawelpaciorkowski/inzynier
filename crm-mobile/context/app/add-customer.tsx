import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useRouter, Stack } from 'expo-router';

export default function AddCustomerScreen() {
    const { token } = useAuth();
    const router = useRouter();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [company, setCompany] = useState('');
    const [address, setAddress] = useState('');
    const [nip, setNip] = useState('');
    const [representative, setRepresentative] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAddCustomer = async () => {
        if (!name.trim() || !email.trim()) {
            Alert.alert("Błąd walidacji", "Nazwa i Email są wymagane.");
            return;
        }

        setLoading(true);
        try {
            await axios.post(`/api/Customers`, {
                name,
                email,
                phone,
                company,
                address,
                nip,
                representative,
            });

            Alert.alert("Sukces", "Klient został pomyślnie dodane.");
            router.back();
        } catch (err: any) {
            Alert.alert("Błąd", `Nie udało się dodać klienta: ${err.message || err}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Stack.Screen options={{ title: 'Nowy Klient' }} />
            <ScrollView style={styles.container}>
                <Text style={styles.label}>Nazwa klienta *</Text>
                <TextInput style={styles.input} value={name} onChangeText={setName} />

                <Text style={styles.label}>Email *</Text>
                <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" />

                <Text style={styles.label}>Telefon</Text>
                <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

                <Text style={styles.label}>Firma</Text>
                <TextInput style={styles.input} value={company} onChangeText={setCompany} />

                <Text style={styles.label}>Adres</Text>
                <TextInput style={styles.input} value={address} onChangeText={setAddress} />

                <Text style={styles.label}>NIP</Text>
                <TextInput style={styles.input} value={nip} onChangeText={setNip} />

                <Text style={styles.label}>Reprezentant</Text>
                <TextInput style={styles.input} value={representative} onChangeText={setRepresentative} />

                <Button
                    title={loading ? "Dodaję..." : "Dodaj Klienta"}
                    onPress={handleAddCustomer}
                    disabled={loading}
                    color="#10b981"
                />
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#111827' },
    label: { fontSize: 16, color: '#d1d5db', marginBottom: 5 },
    input: {
        backgroundColor: '#1f2937',
        color: 'white',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 8,
        marginBottom: 20,
        borderColor: '#374151',
        borderWidth: 1,
    },
});