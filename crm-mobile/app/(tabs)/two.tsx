// Plik: crm-mobile/app/(tabs)/two.tsx
import { View, Button, StyleSheet, Text } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function TabTwoScreen() {
  const { logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mój Profil</Text>
      <Button title="Wyloguj" onPress={logout} color="#ef4444" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111827'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 40,
  },
});