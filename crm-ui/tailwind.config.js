// Plik konfiguracyjny Tailwind CSS - definiuje ustawienia frameworka CSS
/** @type {import('tailwindcss').Config} */
export default {
    // Definuje ścieżki do plików, które będą skanowane w poszukiwaniu klas Tailwind
    content: [
        // Plik główny HTML aplikacji
        "./index.html",
        // Wszystkie pliki JavaScript/TypeScript w katalogu src (komponenty React)
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    // Konfiguracja motywu Tailwind CSS
    theme: {
        // Rozszerzenia domyślnego motywu Tailwind
        extend: {
            // Tutaj można dodać niestandardowe kolory, czcionki, spacing, itp.
            // Obecnie puste - używamy domyślnych ustawień Tailwind
        },
    },
    // Lista pluginów Tailwind CSS
    plugins: [
        // Obecnie brak dodatkowych pluginów
        // Można tutaj dodać np. @tailwindcss/forms, @tailwindcss/typography
    ],
};
