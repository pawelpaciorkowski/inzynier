import { View, Text, FlatList, ActivityIndicator, StyleSheet, Pressable, TextInput, Alert, Modal, ScrollView } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAuth } from '../context/AuthContext';

interface Reminder {
    id: number;
    note: string;
    userId: number;
    remindAt: string;
}

export default function RemindersPage() {
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [newNote, setNewNote] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [dateInput, setDateInput] = useState('');
    const [timeInput, setTimeInput] = useState('');
    const [saving, setSaving] = useState(false);
    const { token } = useAuth();

    const fetchReminders = useCallback(async () => {
        if (!token) return;

        setLoading(true);
        setError(null);
        try {
            const response = await axios.get('/api/Reminders', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = response.data.$values || response.data;
            setReminders(data);
        } catch (err) {
            console.error("Błąd pobierania przypomnień:", err);
            setError("Nie udało się załadować przypomnień.");
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchReminders();
    }, [fetchReminders]);

    const handleAddReminder = async () => {
        if (!newNote.trim()) {
            Alert.alert('Błąd', 'Wpisz treść przypomnienia');
            return;
        }

        if (!dateInput.trim() || !timeInput.trim()) {
            Alert.alert('Błąd', 'Wprowadź datę i godzinę');
            return;
        }

        // Parsowanie daty i czasu (format: DD.MM.YYYY i HH:MM)
        const dateParts = dateInput.split('.');
        const timeParts = timeInput.split(':');

        if (dateParts.length !== 3 || timeParts.length !== 2) {
            Alert.alert('Błąd', 'Nieprawidłowy format daty lub czasu');
            return;
        }

        const reminderDate = new Date(
            parseInt(dateParts[2]), // rok
            parseInt(dateParts[1]) - 1, // miesiąc (0-indexed)
            parseInt(dateParts[0]), // dzień
            parseInt(timeParts[0]), // godzina
            parseInt(timeParts[1]) // minuta
        );

        if (isNaN(reminderDate.getTime())) {
            Alert.alert('Błąd', 'Nieprawidłowa data lub godzina');
            return;
        }

        if (!token) return;

        setSaving(true);
        try {
            await axios.post('/api/Reminders', {
                note: newNote.trim(),
                remindAt: reminderDate.toISOString()
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setNewNote('');
            setDateInput('');
            setTimeInput('');
            setModalVisible(false);
            fetchReminders();
            Alert.alert('Sukces', 'Przypomnienie zostało dodane');
        } catch (err) {
            console.error("Błąd dodawania przypomnienia:", err);
            Alert.alert('Błąd', 'Nie udało się dodać przypomnienia');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteReminder = (id: number, note: string) => {
        Alert.alert(
            'Potwierdź usunięcie',
            `Czy na pewno chcesz usunąć przypomnienie: "${note}"?`,
            [
                { text: 'Anuluj', style: 'cancel' },
                {
                    text: 'Usuń',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await axios.delete(`/api/Reminders/${id}`, {
                                headers: { Authorization: `Bearer ${token}` }
                            });
                            fetchReminders();
                            Alert.alert('Sukces', 'Przypomnienie zostało usunięte');
                        } catch (err) {
                            console.error("Błąd usuwania przypomnienia:", err);
                            Alert.alert('Błąd', 'Nie udało się usunąć przypomnienia');
                        }
                    }
                }
            ]
        );
    };

    // Ustawienie domyślnych wartości dla nowego przypomnienia
    useEffect(() => {
        if (modalVisible) {
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);

            setDateInput(format(tomorrow, 'dd.MM.yyyy'));
            setTimeInput(format(now, 'HH:mm'));
        }
    }, [modalVisible]);

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#007bff" />
                <Text style={styles.loadingText}>Ładowanie przypomnień...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centered}>
                <FontAwesome name="exclamation-triangle" size={48} color="#dc3545" />
                <Text style={styles.errorText}>Błąd: {error}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>⏰ Przypomnienia</Text>
                <Pressable
                    onPress={() => setModalVisible(true)}
                    style={styles.addButton}
                >
                    <FontAwesome name="plus" size={20} color="#fff" />
                </Pressable>
            </View>

            {reminders.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <FontAwesome name="clock-o" size={64} color="#6b7280" />
                    <Text style={styles.emptyText}>Brak przypomnień</Text>
                    <Text style={styles.emptySubText}>Dodaj swoje pierwsze przypomnienie!</Text>
                </View>
            ) : (
                <FlatList
                    data={reminders}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.reminderItem}>
                            <View style={styles.reminderContent}>
                                <Text style={styles.reminderNote}>{item.note}</Text>
                                <Text style={styles.reminderDate}>
                                    {format(new Date(item.remindAt), 'dd.MM.yyyy HH:mm', { locale: pl })}
                                </Text>
                            </View>
                            <Pressable
                                onPress={() => handleDeleteReminder(item.id, item.note)}
                                style={styles.deleteButton}
                            >
                                <FontAwesome name="trash" size={18} color="#dc3545" />
                            </Pressable>
                        </View>
                    )}
                />
            )}

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Nowe przypomnienie</Text>
                            <Pressable onPress={() => setModalVisible(false)} style={styles.closeButton}>
                                <FontAwesome name="times" size={24} color="#fff" />
                            </Pressable>
                        </View>

                        <ScrollView style={styles.modalBody}>
                            <Text style={styles.inputLabel}>Treść przypomnienia:</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Wpisz treść przypomnienia..."
                                placeholderTextColor="#9ca3af"
                                value={newNote}
                                onChangeText={setNewNote}
                                multiline={true}
                                numberOfLines={3}
                            />

                            <Text style={styles.inputLabel}>Data (DD.MM.YYYY):</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="np. 27.07.2025"
                                placeholderTextColor="#9ca3af"
                                value={dateInput}
                                onChangeText={setDateInput}
                            />

                            <Text style={styles.inputLabel}>Godzina (HH:MM):</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="np. 14:30"
                                placeholderTextColor="#9ca3af"
                                value={timeInput}
                                onChangeText={setTimeInput}
                            />
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <Pressable
                                onPress={() => setModalVisible(false)}
                                style={styles.cancelButton}
                            >
                                <Text style={styles.cancelButtonText}>Anuluj</Text>
                            </Pressable>

                            <Pressable
                                onPress={handleAddReminder}
                                style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                                disabled={saving}
                            >
                                {saving ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.saveButtonText}>Dodaj</Text>
                                )}
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#111827',
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    addButton: {
        backgroundColor: '#007bff',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#111827',
    },
    loadingText: {
        marginTop: 10,
        color: '#fff',
    },
    errorText: {
        marginTop: 10,
        color: '#dc3545',
        fontSize: 16,
        textAlign: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        color: '#6b7280',
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 16,
    },
    emptySubText: {
        color: '#9ca3af',
        fontSize: 14,
        marginTop: 8,
    },
    reminderItem: {
        backgroundColor: '#1f2937',
        padding: 16,
        borderRadius: 8,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    reminderContent: {
        flex: 1,
    },
    reminderNote: {
        color: '#fff',
        fontSize: 16,
        marginBottom: 4,
    },
    reminderDate: {
        color: '#9ca3af',
        fontSize: 14,
    },
    deleteButton: {
        padding: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#1f2937',
        borderRadius: 12,
        margin: 20,
        maxHeight: '80%',
        minWidth: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#374151',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    closeButton: {
        padding: 4,
    },
    modalBody: {
        padding: 16,
        maxHeight: 400,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 8,
        marginTop: 16,
    },
    textInput: {
        backgroundColor: '#374151',
        borderRadius: 8,
        padding: 12,
        color: '#fff',
        fontSize: 16,
        textAlignVertical: 'top',
        minHeight: 80,
    },

    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#374151',
        gap: 12,
    },
    cancelButton: {
        backgroundColor: '#6b7280',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        flex: 1,
    },
    cancelButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    saveButton: {
        backgroundColor: '#007bff',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        flex: 1,
    },
    saveButtonDisabled: {
        backgroundColor: '#4b5563',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
}); 