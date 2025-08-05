import { createContext, useContext, useState, type ReactNode } from 'react'; // Importuje hooki React do zarządzania stanem i kontekstem

// Definiuje typy modalów dostępne w aplikacji
type ModalType = 'success' | 'error' | 'confirm' | 'custom' | 'info'; // Typ union definiujący wszystkie możliwe typy modalów

// Interfejs definiujący opcje konfiguracji modala
interface ModalOptions {
    type: ModalType; // Typ modala (success, error, confirm, custom, info)
    title?: string; // Opcjonalny tytuł modala
    message?: string; // Opcjonalna wiadomość modala
    confirmText?: string; // Opcjonalny tekst przycisku potwierdzenia
    cancelText?: string; // Opcjonalny tekst przycisku anulowania
    onConfirm?: () => void; // Opcjonalna funkcja wywoływana po potwierdzeniu
    onCancel?: () => void; // Opcjonalna funkcja wywoływana po anulowaniu
    content?: ReactNode; // Opcjonalna zawartość niestandardowa (dla typu 'custom')
}

// Interfejs definiujący typ kontekstu modala
interface ModalContextType {
    isOpen: boolean; // Stan otwarcia modala (true/false)
    openModal: (options: ModalOptions) => void; // Funkcja otwierająca modal z opcjami
    closeModal: () => void; // Funkcja zamykająca modal
    options: ModalOptions | null; // Aktualne opcje modala lub null
    openToast: (message: string, type?: 'success' | 'error', duration?: number) => void; // Funkcja otwierająca toast
    openConfirmModal: (title: string, message: string, onConfirm?: () => void, onCancel?: () => void) => Promise<boolean>; // Funkcja otwierająca modal potwierdzenia
}

// Tworzy kontekst React dla modalów z typem ModalContextType
const ModalContext = createContext<ModalContextType | undefined>(undefined); // Kontekst z domyślną wartością undefined

// Komponent dostawcy kontekstu modala
export const ModalProvider = ({ children }: { children: ReactNode }) => { // Komponent przyjmujący dzieci jako props
    // Stan otwarcia modala (true = otwarty, false = zamknięty)
    const [isOpen, setIsOpen] = useState(false); // Hook useState do zarządzania stanem otwarcia modala

    // Stan opcji modala (konfiguracja aktualnie wyświetlanego modala)
    const [options, setOptions] = useState<ModalOptions | null>(null); // Hook useState do zarządzania opcjami modala

    // Stan toastu (powiadomienia wyświetlane w prawym górnym rogu)
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; visible: boolean } | null>(null); // Hook useState do zarządzania stanem toastu

    // Stan timeoutu toastu (do automatycznego ukrywania)
    const [toastTimeout, setToastTimeout] = useState<NodeJS.Timeout | null>(null); // Hook useState do zarządzania timeoutem toastu

    // Funkcja otwierająca modal z podanymi opcjami
    const openModal = (newOptions: ModalOptions) => { // Funkcja przyjmująca nowe opcje modala
        setOptions(newOptions); // Ustawia nowe opcje modala w stanie
        setIsOpen(true); // Otwiera modal ustawiając isOpen na true
    };

    // Funkcja zamykająca modal z animacją
    const closeModal = () => { // Funkcja zamykająca modal
        setIsOpen(false); // Zamyka modal ustawiając isOpen na false
        setTimeout(() => setOptions(null), 300); // Czyści opcje modala po 300ms (czas animacji)
    };

    // Funkcja otwierająca toast (powiadomienie)
    const openToast = (message: string, type: 'success' | 'error' = 'success', duration = 2500) => { // Funkcja z parametrami domyślnymi
        if (toastTimeout) clearTimeout(toastTimeout); // Czyści poprzedni timeout jeśli istnieje
        setToast({ message, type, visible: true }); // Ustawia nowy toast jako widoczny
        const timeout = setTimeout(() => { // Tworzy timeout do automatycznego ukrycia
            setToast(t => t ? { ...t, visible: false } : null); // Ukrywa toast ustawiając visible na false
            setTimeout(() => setToast(null), 400); // Usuwa toast z DOM po 400ms (czas animacji fade out)
        }, duration); // Timeout trwa przez podany czas (domyślnie 2500ms)
        setToastTimeout(timeout); // Zapisuje timeout w stanie
    };

    // Funkcja otwierająca modal potwierdzenia z Promise
    const openConfirmModal = (title: string, message: string): Promise<boolean> => { // Funkcja zwracająca Promise<boolean>
        return new Promise((resolve) => { // Tworzy nowy Promise
            openModal({ // Otwiera modal z opcjami
                type: 'confirm', // Typ modala to 'confirm'
                title, // Tytuł modala
                message, // Wiadomość modala
                onConfirm: () => { // Funkcja wywoływana po potwierdzeniu
                    resolve(true); // Rozwiązuje Promise z wartością true
                },
                onCancel: () => { // Funkcja wywoływana po anulowaniu
                    resolve(false); // Rozwiązuje Promise z wartością false
                },
            });
        });
    };

    // Funkcja obsługująca potwierdzenie w modalu
    const handleConfirm = () => { // Funkcja obsługująca kliknięcie przycisku potwierdzenia
        if (options?.onConfirm) { // Sprawdza czy istnieje funkcja onConfirm
            options.onConfirm(); // Wywołuje funkcję onConfirm
        }
        closeModal(); // Zamyka modal
    };

    return (
        <ModalContext.Provider value={{ isOpen, openModal, closeModal, options, openToast, openConfirmModal }}> {/* Dostawca kontekstu z wartościami */}
            {children} {/* Renderuje dzieci komponentu */}

            {/* Renderuje modal jeśli jest otwarty i ma opcje */}
            {isOpen && options && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 animate-fade-in"> {/* Kontener modala - pełny ekran z tłem */}
                    <div className="bg-gray-800 rounded-lg p-8 w-full max-w-md shadow-2xl text-white"> {/* Główny kontener modala */}
                        {options.type === 'custom' ? ( // Sprawdza czy modal jest typu 'custom'
                            options.content // Renderuje niestandardową zawartość
                        ) : (
                            <>
                                {/* Nagłówek modala z ikonami */}
                                <h2 className="text-2xl font-bold mb-4">
                                    {options.type === 'success' && '✅ Sukces'} {/* Ikona i tekst dla sukcesu */}
                                    {options.type === 'error' && '❌ Błąd'} {/* Ikona i tekst dla błędu */}
                                    {options.type === 'confirm' && options.title} {/* Tytuł dla potwierdzenia */}
                                    {options.type === 'info' && options.title} {/* Tytuł dla informacji */}
                                </h2>
                                <p className="text-lg mb-6">{options.message}</p> {/* Wiadomość modala */}

                                {/* Przyciski dla modala potwierdzenia */}
                                {options.type === 'confirm' && (
                                    <div className="flex justify-end space-x-4"> {/* Kontener przycisków */}
                                        <button
                                            onClick={() => { // Obsługa kliknięcia anuluj
                                                if (options.onCancel) options.onCancel(); // Wywołuje funkcję onCancel
                                                closeModal(); // Zamyka modal
                                            }}
                                            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors" // Styl przycisku anuluj
                                        >
                                            {options.cancelText || 'Anuluj'} {/* Tekst przycisku anuluj */}
                                        </button>
                                        <button
                                            onClick={handleConfirm} // Obsługa kliknięcia potwierdź
                                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors" // Styl przycisku potwierdź
                                        >
                                            {options.confirmText || 'Potwierdź'} {/* Tekst przycisku potwierdź */}
                                        </button>
                                    </div>
                                )}

                                {/* Przyciski dla modalów sukces/błąd */}
                                {(options.type === 'success' || options.type === 'error') && (
                                    <div className="flex justify-end"> {/* Kontener przycisku OK */}
                                        <button
                                            onClick={closeModal} // Obsługa kliknięcia OK
                                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors" // Styl przycisku OK
                                        >
                                            OK {/* Tekst przycisku OK */}
                                        </button>
                                    </div>
                                )}

                                {/* Przyciski dla modala informacji */}
                                {options.type === 'info' && (
                                    <div className="flex justify-end space-x-4"> {/* Kontener przycisków */}
                                        {options.cancelText && ( // Renderuje przycisk anuluj jeśli podano tekst
                                            <button
                                                onClick={() => { // Obsługa kliknięcia anuluj
                                                    if (options.onCancel) options.onCancel(); // Wywołuje funkcję onCancel
                                                    closeModal(); // Zamyka modal
                                                }}
                                                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors" // Styl przycisku anuluj
                                            >
                                                {options.cancelText} {/* Tekst przycisku anuluj */}
                                            </button>
                                        )}
                                        {options.confirmText && ( // Renderuje przycisk potwierdź jeśli podano tekst
                                            <button
                                                onClick={() => { // Obsługa kliknięcia potwierdź
                                                    if (options.onConfirm) options.onConfirm(); // Wywołuje funkcję onConfirm
                                                    closeModal(); // Zamyka modal
                                                }}
                                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors" // Styl przycisku potwierdź
                                            >
                                                {options.confirmText} {/* Tekst przycisku potwierdź */}
                                            </button>
                                        )}
                                        {!(options.cancelText || options.confirmText) && ( // Renderuje przycisk OK jeśli nie podano innych tekstów
                                            <button
                                                onClick={closeModal} // Obsługa kliknięcia OK
                                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors" // Styl przycisku OK
                                            >
                                                OK {/* Tekst przycisku OK */}
                                            </button>
                                        )}
                                    </div>
                                )}

                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Globalny toast - powiadomienie w prawym górnym rogu */}
            {toast && toast.visible && (
                <div className={`fixed top-6 right-6 z-[9999] px-6 py-3 rounded-lg shadow-lg text-white font-semibold text-lg transition-all duration-400 animate-fade-in ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`} // Kontener toastu z warunkowym kolorem
                    style={{ minWidth: 220, opacity: toast.visible ? 1 : 0 }}> {/* Style inline dla minimalnej szerokości i przezroczystości */}
                    {toast.type === 'success' ? '✅ ' : '❌ '}{toast.message} {/* Ikona i wiadomość toastu */}
                </div>
            )}
        </ModalContext.Provider>
    );
};

// Hook do używania kontekstu modala w komponentach
export const useModal = () => { // Hook zwracający kontekst modala
    const context = useContext(ModalContext); // Pobiera kontekst z React
    if (context === undefined) { // Sprawdza czy kontekst jest zdefiniowany
        throw new Error('useModal must be used within a ModalProvider'); // Rzuca błąd jeśli hook jest używany poza providerem
    }
    return context; // Zwraca kontekst modala
};