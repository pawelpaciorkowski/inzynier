import React, { useEffect, useState, useCallback } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs, useRouter, useFocusEffect } from 'expo-router';
import { Pressable, View, Text } from 'react-native';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

/**
 * Komponent ikony paska zakładek z opcjonalnym wskaźnikiem nieprzeczytanych powiadomień.
 * @param {object} props - Właściwości komponentu.
 * @param {React.ComponentProps<typeof FontAwesome>['name']} props.name - Nazwa ikony z FontAwesome.
 * @param {string} props.color - Kolor ikony.
 * @param {number} [props.unreadCount] - Liczba nieprzeczytanych powiadomień.
 * @returns {JSX.Element} - Zwraca ikonę z plakietką.
 */
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
  unreadCount?: number; // Dodano właściwość unreadCount
}) {
  return (
    <View style={{ position: 'relative' }}>
      <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />
      {props.unreadCount !== undefined && props.unreadCount > 0 && (
        <View
          style={{
            position: 'absolute',
            right: -6,
            top: -3,
            backgroundColor: 'red',
            borderRadius: 9,
            width: 18,
            height: 18,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
            {props.unreadCount}
          </Text>
        </View>
      )}
    </View>
  );
}

/**
 * Główny komponent layoutu zakładek.
 * Definiuje strukturę i wygląd paska zakładek oraz nagłówka.
 * @returns {JSX.Element} - Zwraca komponent zakładek.
 */
export default function TabLayout() {
  // Inicjalizuje hook do nawigacji
  const router = useRouter();
  // Pobiera token z kontekstu autentykacji
  const { token } = useAuth();
  // Stan przechowujący liczbę nieprzeczytanych powiadomień
  const [unreadCount, setUnreadCount] = useState(0);

  // Funkcja do pobierania liczby nieprzeczytanych powiadomień
  const fetchUnreadCount = useCallback(async () => {
    if (!token) return;
    try {
      const response = await axios.get(`/api/Notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUnreadCount(response.data);
    } catch (err) {
      console.error("Błąd pobierania liczby nieprzeczytanych powiadomień:", err);
    }
  }, [token]);

  // Efekt do okresowego odświeżania liczby powiadomień
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Odświeża co 30 sekund
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Efekt do odświeżania liczby powiadomień przy powrocie na ekran
  useFocusEffect(
    useCallback(() => {
      fetchUnreadCount();
    }, [fetchUnreadCount])
  );

  // Renderuje komponent zakładek
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          backgroundColor: '#1f2937',
          borderTopColor: '#374151',
        },
        headerStyle: {
          backgroundColor: '#1f2937',
        },
        headerTintColor: '#fff',
        headerRight: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Pressable
              onPress={() => router.push('/reminders')}
              style={{ marginRight: 15 }}
            >
              <FontAwesome
                name="clock-o"
                size={24}
                color="white"
              />
            </Pressable>
            <Pressable
              onPress={() => router.push('/notifications')}
              style={{ marginRight: 15, position: 'relative' }}
            >
              <FontAwesome
                name="bell"
                size={25}
                color="white"
              />
              {unreadCount > 0 && (
                <View
                  style={{
                    position: 'absolute',
                    right: -6,
                    top: -3,
                    backgroundColor: 'red',
                    borderRadius: 9,
                    width: 18,
                    height: 18,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
                    {unreadCount}
                  </Text>
                </View>
              )}
            </Pressable>
          </View>
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Moje Zadania',
          tabBarIcon: ({ color }) => <TabBarIcon name="tasks" color={color} />,
          headerRight: () => (
            <Link href="/add-task" asChild>
              <Pressable>
                {({ pressed }) => (
                  <FontAwesome
                    name="plus-circle"
                    size={25}
                    color="white"
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="customers"
        options={{
          title: 'Klienci',
          tabBarIcon: ({ color }) => <TabBarIcon name="briefcase" color={color} />,
        }}
      />
      <Tabs.Screen
        name="invoices"
        options={{
          title: 'Faktury',
          tabBarIcon: ({ color }) => <TabBarIcon name="file-text-o" color={color} />,
        }}
      />
      <Tabs.Screen
        name="activities"
        options={{
          title: 'Aktywności',
          tabBarIcon: ({ color }) => <TabBarIcon name="list-alt" color={color} />,
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} unreadCount={unreadCount} />,
        }}
      />
    </Tabs>

  );
}
