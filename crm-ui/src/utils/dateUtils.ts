/**
 * Konwertuje datę z backendu (UTC) na czas lokalny
 * Backend wysyła daty w UTC, ale czasami bez 'Z' na końcu
 */
export function parseBackendDate(dateString: string | null | undefined): Date {
    // Sprawdź czy data istnieje
    if (!dateString) {
        return new Date(); // Zwróć aktualną datę jeśli brak danych
    }
    
    // Jeśli data już zawiera 'Z', użyj jej bezpośrednio
    if (dateString.endsWith('Z')) {
        return new Date(dateString);
    }
    
    // Jeśli data nie ma 'Z', dodaj 'Z' na końcu żeby JavaScript traktował jako UTC
    // Następnie konwertuj na czas lokalny
    const utcDate = new Date(dateString + 'Z');
    return utcDate;
}

/**
 * Formatuje datę z backendu na polski format lokalny
 */
export function formatBackendDate(dateString: string | null | undefined): string {
    return parseBackendDate(dateString).toLocaleString('pl-PL');
}
