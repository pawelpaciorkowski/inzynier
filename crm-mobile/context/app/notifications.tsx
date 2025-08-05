import { View, Text, FlatList, ActivityIndicator, StyleSheet, Pressable } from 'react-native';
import axios from 'axios';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAuth } from '../../context/AuthContext';
import { useCallback, useEffect, useState } from 'react';

interface Notification {
    id: number;
    message: string;
    createdAt: string;
    isRead: boolean;
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { token } = useAuth();

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        setError(null);
        if (!token) {
            setError("Brak tokena autoryzacji.");
            setLoading(false);
            return;
        }
        try {
            const response = await axios.get(`/api/Notifications/user`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = response.data.$values || response.data;
            setNotifications(data);
        } catch (err) {
            console.error("Błąd pobierania powiadomień:", err);
            setError("Nie udało się załadować powiadomień.");
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const handleMarkAsRead = async (id: number) => {
        if (!token) return;
        try {
            await axios.post(`/api/Notifications/mark-as-read/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchNotifications(); // Odśwież listę powiadomień
        } catch (err) {
            console.error("Błąd oznaczania jako przeczytane:", err);
            // Optionally show an alert or toast
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#007bff" />
                <Text style={styles.loadingText}>Ładowanie powiadomień...</Text>
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
            <Text style={styles.header}>🔔 Powiadomienia</Text>
            {notifications.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Brak powiadomień do wyświetlenia.</Text>
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={[styles.notificationItem, item.isRead ? styles.read : styles.unread]}>
                            <View style={styles.notificationContent}>
                                <Text style={styles.notificationMessage}>{item.message}</Text>
                                <Text style={styles.notificationDate}>
                                    {format(new Date(item.createdAt), 'dd.MM.yyyy HH:mm', { locale: pl })}
                                </Text>
                            </View>
                            {!item.isRead && (
                                <Pressable onPress={() => handleMarkAsRead(item.id)} style={styles.markAsReadButton}>
                                    <Text style={styles.markAsReadButtonText}>Oznacz jako przeczytane</Text>
                                </Pressable>
                            )}
                        </View>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#111827',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 20,
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
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        color: '#6b7280',
        fontSize: 18,
    },
    notificationItem: {
        backgroundColor: '#1f2937',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    read: {
        opacity: 0.7,
    },
    unread: {
        borderWidth: 1,
        borderColor: '#007bff',
    },
    notificationContent: {
        flex: 1,
    },
    notificationMessage: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    notificationDate: {
        color: '#6b7280',
        fontSize: 12,
        marginTop: 5,
    },
    markAsReadButton: {
        backgroundColor: '#007bff',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 5,
    },
    markAsReadButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
});
