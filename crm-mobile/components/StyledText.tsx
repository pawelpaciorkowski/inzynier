import { Text, TextProps } from './Themed';

/**
 * Komponent tekstowy używający czcionki monospaced (SpaceMono).
 * @param {TextProps} props - Właściwości przekazywane do standardowego komponentu Text.
 * @returns {JSX.Element} - Zwraca komponent Text z niestandardowym stylem czcionki.
 */
export function MonoText(props: TextProps) {
  // Zwraca komponent Text, przekazując wszystkie właściwości i dodając styl czcionki.
  return <Text {...props} style={[props.style, { fontFamily: 'SpaceMono' }]} />;
}