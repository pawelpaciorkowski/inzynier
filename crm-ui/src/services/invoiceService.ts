import axios from 'axios';

const API_URL = '/api'; 


export interface InvoiceListItemDto {
    id: number;
    invoiceNumber: string;
    issuedAt: string; 
    totalAmount: number;
    customerName: string;
}

export interface InvoiceItemDto {
    id: number;
    description: string;
    quantity: number;
    unitPrice: number;
    netAmount: number;
    grossAmount: number;
}

export interface InvoiceDetailsDto extends InvoiceListItemDto {
    items: {
        $values: InvoiceItemDto[];
    };
}

// DTO do tworzenia nowej faktury
export interface CreateInvoiceItemDto {
    serviceId: number;
    quantity: number;
}

export interface CreateInvoiceDto {
    customerId: number;
    invoiceNumber: string;
    items: CreateInvoiceItemDto[];
}

// --- Funkcje serwisu ---

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Brak autoryzacji');
    return { Authorization: `Bearer ${token}` };
};

// Pobiera listę wszystkich faktur
export const getInvoices = async (): Promise<InvoiceListItemDto[]> => {
    try {
        const response = await axios.get(`${API_URL}/invoices`, { headers: getAuthHeaders() });
        // Obsługa formatu .$values, jeśli API go zwróci
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (response.data as any).$values || response.data;
    } catch (error) {
        console.error('Błąd podczas pobierania faktur:', error);
        throw error; 
    }
};

// Pobiera szczegóły pojedynczej faktury
export const getInvoiceById = async (id: number): Promise<InvoiceDetailsDto> => {
    try {
        const response = await axios.get(`${API_URL}/invoices/${id}`, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        console.error(`Błąd podczas pobierania faktury o ID ${id}:`, error);
        throw error;
    }
};

// Tworzy nową fakturę
export const createInvoice = async (invoiceData: CreateInvoiceDto) => {
    try {
        const response = await axios.post(`${API_URL}/invoices`, invoiceData, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        console.error('Błąd podczas tworzenia faktury:', error);
        throw error;
    }
};

// Usuwa fakturę
export const deleteInvoice = async (id: number): Promise<void> => {
    try {
        await axios.delete(`${API_URL}/invoices/${id}`, { headers: getAuthHeaders() });
    } catch (error) {
        console.error(`Błąd podczas usuwania faktury o ID ${id}:`, error);
        throw error;
    }
};