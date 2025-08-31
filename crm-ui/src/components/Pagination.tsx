// Import głównej biblioteki React
import React from 'react';

// Interface definiujący props komponentu Pagination
interface PaginationProps {
    // Numer aktualnie wybranej strony
    currentPage: number;
    // Całkowita liczba stron dostępnych do wyświetlenia
    totalPages: number;
    // Funkcja callback wywoływana gdy użytkownik zmienia stronę
    onPageChange: (page: number) => void;
}

// Komponent paginacji - renderuje nawigację po stronach z przyciskami numerów stron
const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
    // Jeśli jest tylko jedna strona lub mniej, nie wyświetlamy paginacji
    if (totalPages <= 1) return null;

    // Tworzymy tablicę z numerami stron do wyświetlenia
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
    }

    return (
        // Nawigacja wyśrodkowana z marginesem górnym
        <nav className="flex justify-center mt-6">
            {/* Lista przycisków paginacji z poziomym układem i odstępami */}
            <ul className="inline-flex items-center space-x-1">
                {/* Przycisk "Poprzednia strona" */}
                <li>
                    <button
                        // Stylowanie Tailwind - szary przycisk z lewym zaokrągleniem, hover effect i opacity dla disabled
                        className="px-3 py-1 rounded-l bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50"
                        // Przejście do poprzedniej strony
                        onClick={() => onPageChange(currentPage - 1)}
                        // Wyłączenie przycisku gdy jesteśmy na pierwszej stronie
                        disabled={currentPage === 1}
                    >
                        &lt;
                    </button>
                </li>
                {/* Mapowanie numerów stron na przyciski */}
                {pages.map(page => (
                    <li key={page}>
                        <button
                            // Warunkowe stylowanie - aktywna strona ma niebieskie tło, inne szare z hover effect
                            className={`px-3 py-1 ${page === currentPage ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'} rounded`}
                            // Przejście do konkretnej strony
                            onClick={() => onPageChange(page)}
                            // Wyłączenie przycisku dla aktualnie wybranej strony
                            disabled={page === currentPage}
                        >
                            {/* Wyświetlenie numeru strony */}
                            {page}
                        </button>
                    </li>
                ))}
                {/* Przycisk "Następna strona" */}
                <li>
                    <button
                        // Stylowanie z prawym zaokrągleniem
                        className="px-3 py-1 rounded-r bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50"
                        // Przejście do następnej strony
                        onClick={() => onPageChange(currentPage + 1)}
                        // Wyłączenie przycisku gdy jesteśmy na ostatniej stronie
                        disabled={currentPage === totalPages}
                    >
                        &gt;
                    </button>
                </li>
            </ul>
        </nav>
    );
};

// Eksport domyślny komponentu Pagination
export default Pagination; 