/**
 * Konwertuje datę z backendu (UTC) na czas lokalny
 * Backend wysyła daty w UTC, ale czasami bez 'Z' na końcu
 */
export function parseBackendDate(dateString: string | null | undefined): Date {
    if (!dateString) {
        return new Date();
    }
    
    if (dateString.endsWith('Z')) {
        return new Date(dateString);
    }
    
    const utcDate = new Date(dateString + 'Z');
    return utcDate;
}

/**
 * Formatuje datę z backendu na polski format lokalny
 */
export function formatBackendDate(dateString: string | null | undefined): string {
    return parseBackendDate(dateString).toLocaleString('pl-PL');
}
