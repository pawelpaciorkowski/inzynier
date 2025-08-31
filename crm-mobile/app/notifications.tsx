import { View, Text, FlatList, ActivityIndicator, StyleSheet, Pressable, Modal, ScrollView } from 'react-native';
import axios from 'axios';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAuth } from '../context/AuthContext';
import { useCallback, useEffect, useState } from 'react';

// Definiuje strukturę obiektu powiadomienia
interface Notification {
    id: number; // Unikalny identyfikator powiadomienia
    message: string; // Treść powiadomienia
    createdAt: string; // Data utworzenia
    isRead: boolean; // Status przeczytania
    messageId?: number; // Opcjonalne ID powiązanej wiadomości
}

// Definiuje strukturę obiektu szczegółów wiadomości
interface MessageDetails {
    id: number; // ID wiadomości
    subject: string; // Temat wiadomości
    body: string; // Treść wiadomości
    sentAt: string; // Data wysłania
    senderUsername: string; // Nazwa nadawcy
    recipientUsername: string; // Nazwa odbiorcy
}

/**
 * Komponent strony z powiadomieniami.
 * Wyświetla listę powiadomień użytkownika, pozwala na ich odczytywanie i przeglądanie szczegółów.
 * @returns {JSX.Element} - Zwraca widok strony z powiadomieniami.
 */
export default function NotificationsPage() {
    // Stan przechowujący listę powiadomień
    const [notifications, setNotifications] = useState<Notification[]>([]);
    // Stan wskazujący, czy trwa ładowanie powiadomień
    const [loading, setLoading] = useState(true);
    // Stan przechowujący ewentualny błąd
    const [error, setError] = useState<string | null>(null);
    // Stan kontrolujący widoczność modala
    const [modalVisible, setModalVisible] = useState(false);
    // Stan przechowujący wybrane powiadomienie
    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
    // Stan przechowujący szczegóły wiadomości
    const [messageDetails, setMessageDetails] = useState<MessageDetails | null>(null);
    // Stan wskazujący, czy trwa ładowanie szczegółów wiadomości
    const [loadingDetails, setLoadingDetails] = useState(false);
    // Pobranie tokena z kontekstu autentykacji
    const { token } = useAuth();

    // Funkcja do pobierania powiadomień z API
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

    // Efekt uruchamiający pobieranie powiadomień po zamontowaniu komponentu
    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // Funkcja do oznaczania powiadomienia jako przeczytane
    const handleMarkAsRead = async (id: number) => {
        if (!token) return;
        try {
            await axios.post(`/api/Notifications/mark-as-read/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchNotifications(); // Odświeża listę powiadomień
        } catch (err) {
            console.error("Błąd oznaczania jako przeczytane:", err);
        }
    };

    // Funkcja do oznaczania wszystkich powiadomień jako przeczytane
    const handleMarkAllAsRead = async () => {
        const unreadNotifications = notifications.filter(n => !n.isRead);
        if (unreadNotifications.length === 0) return;

        if (!token) return;
        try {
            await Promise.all(unreadNotifications.map(n =>
                axios.post(`/api/Notifications/mark-as-read/${n.id}`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ));
            fetchNotifications();
        } catch (err) {
            console.error("Błąd masowego oznaczania jako przeczytane:", err);
        }
    };

    // Funkcja do pobierania szczegółów wiadomości
    const fetchMessageDetails = async (messageId: number) => {
        if (!token) return null;
        try {
            setLoadingDetails(true);
            const response = await axios.get(`/api/Messages/${messageId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (err) {
            console.error("Błąd pobierania szczegółów wiadomości:", err);
            return null;
        } finally {
            setLoadingDetails(false);
        }
    };

    // Funkcja obsługująca naciśnięcie powiadomienia
    const handleNotificationPress = async (notification: Notification) => {
        setSelectedNotification(notification);
        setMessageDetails(null);
        setModalVisible(true);

        // Jeśli powiadomienie ma MessageId, pobiera szczegóły wiadomości
        if (notification.messageId) {
            const details = await fetchMessageDetails(notification.messageId);
            if (details) {
                setMessageDetails(details);
            }
        }
    };

    // Funkcja zamykająca modal
    const closeModal = () => {
        setModalVisible(false);
        setSelectedNotification(null);
        setMessageDetails(null);
    };

    // Widok ładowania
    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#007bff" />
                <Text style={styles.loadingText}>Ładowanie powiadomień...</Text>
            </View>
        );
    }

    // Widok błędu
    if (error) {
        return (
            <View style={styles.centered}>
                <FontAwesome name="exclamation-triangle" size={48} color="#dc3545" />
                <Text style={styles.errorText}>Błąd: {error}</Text>
            </View>
        );
    }

    // Liczba nieprzeczytanych powiadomień
    const unreadCount = notifications.filter(n => !n.isRead).length;

    // Główny widok komponentu
    return (
        <View style={styles.container}>
            <Text style={styles.header}>🔔 Powiadomienia</Text>

            {/* Przycisk do oznaczania wszystkich jako przeczytane */}
            {notifications.length > 0 && unreadCount > 0 && (
                <Pressable onPress={handleMarkAllAsRead} style={styles.markAllButton}>
                    <Text style={styles.markAllButtonText}>
                        Oznacz wszystkie jako przeczytane ({unreadCount})
                    </Text>
                </Pressable>
            )}

            {/* Widok pustej listy powiadomień */}
            {notifications.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Brak powiadomień do wyświetlenia.</Text>
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => {
                        const isLongMessage = item.message.length > 80;
                        const displayMessage = isLongMessage
                            ? `${item.message.substring(0, 80)}...`
                            : item.message;

                        return (
                            <Pressable
                                style={[styles.notificationItem, item.isRead ? styles.read : styles.unread]}
                                onPress={() => handleNotificationPress(item)}
                            >
                                <View style={styles.notificationContent}>
                                    <View style={styles.messageContainer}>
                                        <Text style={styles.notificationMessage}>
                                            {displayMessage}
                                        </Text>
                                        {isLongMessage && (
                                            <Text style={styles.expandButton}>
                                                Dotknij aby zobaczyć szczegóły
                                            </Text>
                                        )}
                                    </View>
                                    <Text style={styles.notificationDate}>
                                        {format(new Date(item.createdAt), 'dd.MM.yyyy HH:mm', { locale: pl })}
                                    </Text>
                                    {!item.isRead && (
                                        <Pressable onPress={() => handleMarkAsRead(item.id)} style={styles.markAsReadButton}>
                                            <Text style={styles.markAsReadButtonText}>Oznacz jako przeczytane</Text>
                                        </Pressable>
                                    )}
                                </View>
                            </Pressable>
                        );
                    }}
                />
            )}

            {/* Modal ze szczegółami powiadomienia */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={closeModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Szczegóły powiadomienia</Text>
                            <Pressable onPress={closeModal} style={styles.closeButton}>
                                <FontAwesome name="times" size={24} color="#fff" />
                            </Pressable>
                        </View>

                        <ScrollView style={styles.modalBody}>
                            {selectedNotification && (
                                <View>
                                    <Text style={styles.modalLabel}>Powiadomienie:</Text>
                                    <Text style={styles.modalText}>{selectedNotification.message}</Text>

                                    <Text style={styles.modalLabel}>Data:</Text>
                                    <Text style={styles.modalText}>
                                        {format(new Date(selectedNotification.createdAt), 'dd.MM.yyyy HH:mm', { locale: pl })}
                                    </Text>

                                    <Text style={styles.modalLabel}>Status:</Text>
                                    <Text style={styles.modalText}>
                                        {selectedNotification.isRead ? 'Przeczytane' : 'Nieprzeczytane'}
                                    </Text>

                                    {loadingDetails && (
                                        <View style={styles.modalLoading}>
                                            <ActivityIndicator size="small" color="#007bff" />
                                            <Text style={styles.modalLoadingText}>Ładowanie szczegółów...</Text>
                                        </View>
                                    )}

                                    {messageDetails && (
                                        <View style={styles.messageDetailsSection}>
                                            <Text style={styles.modalLabel}>📨 Treść wiadomości:</Text>
                                            <Text style={styles.modalSubLabel}>Temat:</Text>
                                            <Text style={styles.modalText}>{messageDetails.subject}</Text>
                                            <Text style={styles.modalSubLabel}>Treść:</Text>
                                            <Text style={styles.modalText}>{messageDetails.body}</Text>
                                            <Text style={styles.modalSubLabel}>Od:</Text>
                                            <Text style={styles.modalText}>{messageDetails.senderUsername}</Text>
                                            <Text style={styles.modalSubLabel}>Wysłano:</Text>
                                            <Text style={styles.modalText}>
                                                {format(new Date(messageDetails.sentAt), 'dd.MM.yyyy HH:mm', { locale: pl })}
                                            </Text>
                                        </View>
                                    )}

                                    {selectedNotification.messageId && !messageDetails && !loadingDetails && (
                                        <View style={styles.messageHint}>
                                            <Text style={styles.modalHintText}>
                                                ⚠️ Nie udało się załadować szczegółów wiadomości.
                                            </Text>
                                        </View>
                                    )}

                                    {!selectedNotification.messageId && !messageDetails && (
                                        <View style={styles.generalNotificationSection}>
                                            <Text style={styles.modalLabel}>ℹ️ Informacje:</Text>
                                            <Text style={styles.modalText}>
                                                To jest ogólne powiadomienie systemowe. Pełna treść znajduje się powyżej.
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            )}
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            {selectedNotification && !selectedNotification.isRead && (
                                <Pressable
                                    onPress={() => {
                                        handleMarkAsRead(selectedNotification.id);
                                        closeModal();
                                    }}
                                    style={styles.modalMarkAsReadButton}
                                >
                                    <Text style={styles.modalMarkAsReadButtonText}>Oznacz jako przeczytane</Text>
                                </Pressable>
                            )}

                            <Pressable onPress={closeModal} style={styles.modalCloseButton}>
                                <Text style={styles.modalCloseButtonText}>Zamknij</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

// Definicje stylów dla komponentu
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
    messageContainer: {
        marginBottom: 8,
    },
    notificationMessage: {
        color: '#fff',
        fontSize: 16,
        lineHeight: 22,
        flexWrap: 'wrap',
    },
    expandButton: {
        color: '#007bff',
        fontSize: 14,
        marginTop: 4,
        fontWeight: '500',
    },
    notificationDate: {
        color: '#6b7280',
        fontSize: 12,
        marginBottom: 10,
    },
    markAsReadButton: {
        backgroundColor: '#007bff',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 5,
        alignSelf: 'flex-start',
    },
    markAsReadButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },

    markAllButton: {
        backgroundColor: '#007bff',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 16,
        alignItems: 'center',
    },
    markAllButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
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
    modalLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#007bff',
        marginTop: 12,
        marginBottom: 4,
    },
    modalSubLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#9ca3af',
        marginTop: 8,
        marginBottom: 2,
    },
    modalText: {
        fontSize: 14,
        color: '#fff',
        lineHeight: 20,
    },
    modalLoading: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
    },
    modalLoadingText: {
        marginLeft: 8,
        color: '#9ca3af',
        fontSize: 13,
    },
    messageDetailsSection: {
        marginTop: 16,
        padding: 12,
        backgroundColor: '#374151',
        borderRadius: 8,
    },
    generalNotificationSection: {
        marginTop: 16,
        padding: 12,
        backgroundColor: '#065f46',
        borderRadius: 8,
    },
    messageHint: {
        marginTop: 16,
        padding: 12,
        backgroundColor: '#1e40af',
        borderRadius: 8,
    },
    modalHintText: {
        color: '#fff',
        fontSize: 13,
        lineHeight: 18,
    },
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#374151',
    },
    modalMarkAsReadButton: {
        backgroundColor: '#007bff',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 6,
        flex: 1,
        marginRight: 8,
    },
    modalMarkAsReadButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    modalCloseButton: {
        backgroundColor: '#6b7280',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 6,
        flex: 1,
        marginLeft: 8,
    },
    modalCloseButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});