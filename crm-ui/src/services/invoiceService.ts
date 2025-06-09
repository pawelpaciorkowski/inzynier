import axios from 'axios';

export interface InvoiceListItemDto {
    id: number;
    invoiceNumber: string;
    issuedAt: string; 
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


export const deleteInvoice = async (id: number): Promise<void> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Brak autoryzacji');

    try {
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

const API_URL = '/api/invoices'; 
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
        throw error; 
    }
};
