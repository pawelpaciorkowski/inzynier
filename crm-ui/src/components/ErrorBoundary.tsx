// Import głównej biblioteki React
import React from 'react';

// Interface definiujący props komponentu ErrorBoundary
interface ErrorBoundaryProps {
    // Komponenty potomne, które będą "owinięte" w ErrorBoundary
    children: React.ReactNode;
    // Opcjonalny komponent fallback do wyświetlenia w przypadku błędu
    fallback?: React.ReactNode;
}

// Interface definiujący stan komponentu ErrorBoundary
interface ErrorBoundaryState {
    // Flaga określająca czy wystąpił błąd
    hasError: boolean;
    // Opcjonalny obiekt błędu z szczegółami
    error?: Error;
}

// Komponent klasy ErrorBoundary - łapie błędy JavaScript w drzewie komponentów potomnych
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    // Konstruktor inicjalizujący stan komponentu
    constructor(props: ErrorBoundaryProps) {
        super(props);
        // Inicjalizujemy stan - na początku nie ma błędów
        this.state = { hasError: false };
    }

    // Statyczna metoda wywoływana gdy wystąpi błąd w komponencie potomnym
    // Pozwala zaktualizować stan na podstawie błędu
    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        // Zwracamy nowy stan z informacją o błędzie
        return { hasError: true, error };
    }

    // Metoda lifecycle wywoływana po złapaniu błędu
    // Służy do logowania błędów i dodatkowych akcji
    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Logujemy błąd do konsoli dla celów debugowania
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Metoda renderująca komponent
    render() {
        // Sprawdzamy czy wystąpił błąd
        if (this.state.hasError) {
            // Jeśli przekazano niestandardowy komponent fallback, renderujemy go
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Domyślny widok błędu z stylowaniem Tailwind CSS
            return (
                // Kontener błędu z czerwonym tłem i obramowaniem
                <div className="p-6 bg-red-900 border border-red-700 rounded-lg text-red-100">
                    {/* Tytuł błędu */}
                    <h3 className="text-lg font-semibold mb-2">Wystąpił błąd</h3>
                    {/* Opis błędu */}
                    <p className="mb-4">Wystąpił nieoczekiwany błąd w komponencie.</p>
                    {/* Przycisk do resetu stanu błędu */}
                    <button
                        // Obsługa kliknięcia - resetuje stan błędu
                        onClick={() => this.setState({ hasError: false, error: undefined })}
                        // Stylowanie przycisku Tailwind - czerwone tło z hover effect
                        className="px-4 py-2 bg-red-700 hover:bg-red-600 rounded text-white"
                    >
                        Spróbuj ponownie
                    </button>
                </div>
            );
        }

        // Jeśli nie ma błędu, renderujemy normalne komponenty potomne
        return this.props.children;
    }
} 