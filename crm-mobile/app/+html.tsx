import { ScrollViewStyleReset } from 'expo-router/html';

/**
 * Ten plik jest przeznaczony tylko dla wersji webowej i służy do konfiguracji głównego dokumentu HTML
 * dla każdej strony internetowej podczas renderowania statycznego.
 * Zawartość tej funkcji działa tylko w środowiskach Node.js i
 * nie ma dostępu do DOM ani interfejsów API przeglądarki.
 * @param {object} props - Właściwości komponentu.
 * @param {React.ReactNode} props.children - Dzieci komponentu.
 * @returns {JSX.Element} - Zwraca główny dokument HTML.
 */
export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />


        <ScrollViewStyleReset />


        <style dangerouslySetInnerHTML={{ __html: responsiveBackground }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const responsiveBackground = `
body {
  background-color: #fff;
}
@media (prefers-color-scheme: dark) {
  body {
    background-color: #000;
  }
}`;
