import { Tabs } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import React from 'react';

// Pomocniczy komponent do renderowania ikonek
function TabBarIcon(props: { name: React.ComponentProps<typeof FontAwesome>['name']; color: string }) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  // UWAGA: Zwracamy bezpośrednio konfigurację <Tabs>.
  // Komponent <AuthProvider> jest już w głównym pliku app/_layout.tsx i nie może być tutaj powtórzony.
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: '#a1a1aa',
        tabBarStyle: {
          backgroundColor: '#1f2937',
          borderTopColor: '#374151'
        },
        headerStyle: {
          backgroundColor: '#1f2937',
        },
        headerTintColor: '#fff',
      }}>
      <Tabs.Screen
        name="customers" // Nazwa pliku: customers.tsx
        options={{
          title: 'Klienci',
          tabBarIcon: ({ color }) => <TabBarIcon name="users" color={color} />,
        }}
      />
      <Tabs.Screen
        name="invoices" // Nazwa pliku: invoices.tsx
        options={{
          title: 'Faktury',
          tabBarIcon: ({ color }) => <TabBarIcon name="file-text-o" color={color} />,
        }}
      />
      {/* Dodaj tutaj resztę swoich zakładek zgodnie z nazwami plików */}
    </Tabs>
  );
}