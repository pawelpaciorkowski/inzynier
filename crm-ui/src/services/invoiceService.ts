// Plik: crm-ui/src/services/invoiceService.ts
import axios from 'axios';

// Definiujemy typ, który odpowiada DTO z naszego backendu
export interface InvoiceListItemDto {
    id: number;
    invoiceNumber: string;
    issuedAt: string; // datę traktujemy jako string, sformatujemy ją później
    totalAmount: number;
    customerName: string;
}

export interface CreateInvoiceItemDto {
    serviceId: number;
    quantity: number;
}

export interface CreateInvoiceDto {
    customerId: number;
    invoiceNumber: string;
    items: CreateInvoiceItemDto[];
}

// Funkcja do tworzenia nowej faktury
export const createInvoice = async (invoiceData: CreateInvoiceDto) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Brak autoryzacji');

    try {
        const response = await axios.post(API_URL, invoiceData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Błąd podczas tworzenia faktury:', error);
        throw error;
    }
};

// ... (istniejące funkcje)

// Funkcja do usuwania faktury
// Zlokalizuj tę funkcję:
export const deleteInvoice = async (id: number): Promise<void> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Brak autoryzacji');

    try {
        // TUTAJ JEST POPRAWKA:
        // Używamy backticków (`) do stworzenia prawidłowego template string
        await axios.delete(`${API_URL}/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } catch (error) {
        console.error(`Błąd podczas usuwania faktury o ID ${id}:`, error);
        throw error;
    }
};

const API_URL = '/api/invoices'; // Używamy proxy zdefiniowanego w vite.config.ts

// Funkcja do pobierania listy wszystkich faktur
export const getInvoices = async (): Promise<InvoiceListItemDto[]> => {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('Brak autoryzacji');
    }

    try {
        const response = await axios.get(API_URL, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Błąd podczas pobierania faktur:', error);
        throw error; // Rzucamy błąd dalej, aby komponent mógł go obsłużyć
    }
};

// Możemy tu w przyszłości dodać inne funkcje, np. getInvoiceById, createInvoice etc.