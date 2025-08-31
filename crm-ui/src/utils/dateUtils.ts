/**
 * Konwertuje datę z backendu (UTC) na czas lokalny
 * Backend wysyła daty w UTC, ale czasami bez 'Z' na końcu
 */
export function parseBackendDate(dateString: string): Date {
    // Jeśli data już zawiera 'Z', użyj jej bezpośrednio
    if (dateString.endsWith('Z')) {
        return new Date(dateString);
    }
    // W przeciwnym razie dodaj 'Z' aby oznaczyć UTC
    return new Date(dateString + 'Z');
}

/**
 * Formatuje datę z backendu na polski format lokalny
 */
export function formatBackendDate(dateString: string): string {
    return parseBackendDate(dateString).toLocaleString('pl-PL');
}
