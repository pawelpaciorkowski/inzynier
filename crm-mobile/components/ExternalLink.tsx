import { Link } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import { Platform } from 'react-native';

/**
 * Komponent do tworzenia linków zewnętrznych, które otwierają się w przeglądarce systemowej.
 * Na platformie webowej działa jak standardowy link, a na mobilnych otwiera przeglądarkę.
 * @param {Omit<React.ComponentProps<typeof Link>, 'href'> & { href: string }} props - Właściwości komponentu Link z wymaganym `href`.
 * @returns {JSX.Element} - Zwraca komponent Link z niestandardową obsługą naciśnięcia.
 */
export function ExternalLink(
  props: Omit<React.ComponentProps<typeof Link>, 'href'> & { href: string }
) {
  return (
    <Link
      target="_blank" // Otwiera link w nowej karcie na platformie webowej.
      {...props}
      // @ts-expect-error: Zewnętrzne adresy URL nie są typowane.
      href={props.href}
      onPress={(e) => {
        // Sprawdza, czy platforma nie jest webowa.
        if (Platform.OS !== 'web') {
          // Zapobiega domyślnej akcji nawigacji wewnątrz aplikacji.
          e.preventDefault();
          // Otwiera link w przeglądarce systemowej urządzenia.
          WebBrowser.openBrowserAsync(props.href as string);
        }
      }}
    />
  );
}