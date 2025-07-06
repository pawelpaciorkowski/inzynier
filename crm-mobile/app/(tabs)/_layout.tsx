// Plik: crm-mobile/app/(tabs)/_layout.tsx
import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import { Pressable } from 'react-native';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        // Poprawione opcje dla spójnego, ciemnego wyglądu
        tabBarActiveTintColor: '#fff', // Aktywna ikona będzie biała
        tabBarInactiveTintColor: '#6b7280', // Nieaktywna ikona będzie szara
        tabBarStyle: {
          backgroundColor: '#1f2937', // Ciemne tło dla paska zakładek
          borderTopColor: '#374151', // Kolor górnej krawędzi
        },
        headerStyle: {
          backgroundColor: '#1f2937', // Ciemne tło dla nagłówka
        },
        headerTintColor: '#fff', // Kolor tekstu w nagłówku
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
        name="activities"
        options={{
          title: 'Aktywności',
          tabBarIcon: ({ color }) => <TabBarIcon name="list" color={color} />,
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />
    </Tabs>
  );
}