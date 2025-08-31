import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet } from 'react-native';

import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';

/**
 * Komponent ekranu modalnego.
 * Wyświetla prosty ekran modalny z tytułem i separatorem.
 * @returns {JSX.Element} - Zwraca widok ekranu modalnego.
 */
export default function ModalScreen() {
  // Renderuje główny widok komponentu.
  return (
    <View style={styles.container}>
      {/* Wyświetla tytuł ekranu. */}
      <Text style={styles.title}>Modal</Text>
      {/* Wyświetla separator wizualny. */}
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      {/* Wyświetla komponent z informacjami o edytowanym ekranie. */}
      <EditScreenInfo path="app/modal.tsx" />

      {/* Ustawia styl paska stanu w zależności od platformy. */}
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}

// Definicje stylów dla komponentu.
const styles = StyleSheet.create({
  // Styl dla głównego kontenera.
  container: {
    flex: 1, // Kontener zajmuje całą dostępną przestrzeń.
    alignItems: 'center', // Wyśrodkowuje elementy w poziomie.
    justifyContent: 'center', // Wyśrodkowuje elementy w pionie.
  },
  // Styl dla tytułu.
  title: {
    fontSize: 20, // Rozmiar czcionki.
    fontWeight: 'bold', // Grubość czcionki.
  },
  // Styl dla separatora.
  separator: {
    marginVertical: 30, // Margines pionowy.
    height: 1, // Wysokość.
    width: '80%', // Szerokość.
  },
});