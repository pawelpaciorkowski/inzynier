/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useModal } from '../context/ModalContext';
import { useAuth } from '../context/AuthContext';
import {
    DocumentArrowDownIcon,
    FunnelIcon,
    TableCellsIcon,
    ChartBarIcon,
    UsersIcon,
    DocumentTextIcon,
    CurrencyDollarIcon,
    CheckCircleIcon,
    ClockIcon
} from '@heroicons/react/24/outline';

interface ExportConfig {
    type: 'customers' | 'invoices' | 'payments' | 'contracts' | 'tasks' | 'meetings' | 'notes';
    format: 'csv' | 'xlsx' | 'pdf';
    dateFrom?: string;
    dateTo?: string;
    includeRelations: boolean;
    groupId?: number;
    tagId?: number;
    columns: string[];
}

interface Group {
    id: number;
    name: string;
}

interface Tag {
    id: number;
    name: string;
    color?: string;
}

const AVAILABLE_COLUMNS = {
    customers: [
        'id', 'name', 'email', 'phone', 'company', 'address', 'nip', 'representative',
        'createdAt', 'assignedGroup', 'assignedUser', 'tags', 'contractCount',
        'invoiceCount', 'totalInvoiceValue', 'paidInvoiceValue'
    ],
    invoices: [
        'id', 'number', 'customerName', 'customerEmail', 'totalAmount', 'isPaid',
        'issuedAt', 'dueDate', 'createdBy', 'assignedGroup', 'tags', 'items'
    ],
    payments: [
        'id', 'invoiceNumber', 'customerName', 'amount', 'paidAt', 'paymentMethod'
    ],
    contracts: [
        'id', 'title', 'contractNumber', 'customerName', 'placeOfSigning', 'signedAt',
        'startDate', 'endDate', 'netAmount', 'paymentTermDays', 'scopeOfServices'
    ],
    tasks: [
        'id', 'title', 'description', 'customerName', 'assignedUser', 'dueDate',
        'completed', 'priority', 'tags', 'createdAt'
    ],
    meetings: [
        'id', 'topic', 'customerName', 'scheduledAt', 'duration', 'location',
        'participants', 'notes', 'status'
    ],
    notes: [
        'id', 'content', 'customerName', 'createdBy', 'createdAt', 'updatedAt'
    ]
};

const COLUMN_LABELS = {
    id: 'ID',
    name: 'Nazwa',
    email: 'Email',
    phone: 'Telefon',
    company: 'Firma',
    address: 'Adres',
    nip: 'NIP',
    representative: 'Przedstawiciel',
    createdAt: 'Data utworzenia',
    assignedGroup: 'Przypisana grupa',
    assignedUser: 'Przypisany użytkownik',
    tags: 'Tagi',
    contractCount: 'Liczba kontraktów',
    invoiceCount: 'Liczba faktur',
    totalInvoiceValue: 'Wartość wszystkich faktur',
    paidInvoiceValue: 'Wartość opłaconych faktur',
    number: 'Numer',
    customerName: 'Nazwa klienta',
    customerEmail: 'Email klienta',
    totalAmount: 'Kwota całkowita',
    isPaid: 'Opłacona',
    issuedAt: 'Data wystawienia',
    dueDate: 'Termin płatności',
    createdBy: 'Utworzone przez',
    items: 'Pozycje faktury',
    invoiceNumber: 'Numer faktury',
    amount: 'Kwota',
    paidAt: 'Data płatności',
    paymentMethod: 'Metoda płatności',
    title: 'Tytuł',
    contractNumber: 'Numer kontraktu',
    placeOfSigning: 'Miejsce podpisania',
    signedAt: 'Data podpisania',
    startDate: 'Data rozpoczęcia',
    endDate: 'Data zakończenia',
    netAmount: 'Kwota netto',
    paymentTermDays: 'Termin płatności (dni)',
    scopeOfServices: 'Zakres usług',
    description: 'Opis',
    priority: 'Priorytet',
    topic: 'Temat',
    scheduledAt: 'Zaplanowane na',
    duration: 'Czas trwania',
    location: 'Lokalizacja',
    participants: 'Uczestnicy',
    status: 'Status',
    content: 'Treść',
    updatedAt: 'Data aktualizacji'
};

export function ExportsPage() {
    const [config, setConfig] = useState<ExportConfig>({
        type: 'customers',
        format: 'csv',
        includeRelations: true,
        columns: ['id', 'name', 'email', 'phone', 'company', 'createdAt']
    });
    const [groups, setGroups] = useState<Group[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);
    const { openModal, openToast } = useModal();
    const { user } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [groupsRes, tagsRes] = await Promise.all([
                    api.get('/Groups/'),
                    api.get('/Tags/')
                ]);

                // Ensure groups is always an array
                const groupsData = groupsRes.data?.$values || groupsRes.data || [];
                const tagsData = tagsRes.data?.$values || tagsRes.data || [];

                setGroups(Array.isArray(groupsData) ? groupsData : []);
                setTags(Array.isArray(tagsData) ? tagsData : []);
            } catch (error) {
                console.error('Błąd pobierania danych:', error);
            } finally {
                setDataLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        // Resetuj kolumny przy zmianie typu
        const defaultColumns = AVAILABLE_COLUMNS[config.type].slice(0, 6);
        setConfig(prev => ({
            ...prev,
            columns: defaultColumns
        }));
    }, [config.type]);

    const handleExport = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                format: config.format,
                includeRelations: config.includeRelations.toString(),
                columns: config.columns.join(',')
            });

            if (config.dateFrom) params.append('dateFrom', config.dateFrom);
            if (config.dateTo) params.append('dateTo', config.dateTo);
            if (config.groupId) params.append('groupId', config.groupId.toString());
            if (config.tagId) params.append('tagId', config.tagId.toString());

            const response = await api.get(`/reports/export-${config.type}?${params}`, {
                responseType: 'blob',
                headers: {
                    'Accept': '*/*',
                },
                timeout: 30000, // 30 sekund timeout
            });

            // Sprawdź czy odpowiedź jest poprawna
            if (response.status !== 200) {
                throw new Error(`Błąd serwera: ${response.status}`);
            }

            const blob = new Blob([response.data], {
                type: response.headers['content-type'] || 'application/octet-stream'
            });

            // Metoda 1: Standardowe pobieranie
            try {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.style.display = 'none';

                const fileName = `${config.type}_${new Date().toISOString().split('T')[0]}.${config.format}`;
                link.setAttribute('download', fileName);

                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            } catch (downloadError) {
                console.warn('Standardowe pobieranie nie działa, próbuję alternatywnej metody:', downloadError);

                // Metoda 2: Otwórz w nowej karcie
                const url = window.URL.createObjectURL(blob);
                window.open(url, '_blank');

                // Wyczyść URL po 5 sekundach
                setTimeout(() => window.URL.revokeObjectURL(url), 5000);
            }

            openToast(`Dane ${config.type} zostały wyeksportowane w formacie ${config.format.toUpperCase()}.`, 'success');

            // Dodaj informację o możliwych problemach z rozszerzeniami
            if (config.format === 'pdf') {
                setTimeout(() => {
                    openModal({
                        type: 'info',
                        title: 'Wskazówka',
                        message: 'Jeśli PDF nie pobiera się, spróbuj wyłączyć rozszerzenia przeglądarki (AdBlock, uBlock) lub użyj trybu incognito.'
                    });
                }, 2000);
            }
        } catch (error: any) {
            console.error('Błąd eksportu:', error);
            console.error('Status:', error.response?.status);
            console.error('Headers:', error.response?.headers);
            console.error('Data:', error.response?.data);

            let errorMessage = 'Nie udało się wyeksportować danych.';
            if (error.response?.status === 403) {
                errorMessage = 'Brak uprawnień do eksportu. Zaloguj się jako Admin, Manager lub User.';
            } else if (error.response?.status === 401) {
                errorMessage = 'Sesja wygasła. Zaloguj się ponownie.';
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }

            openModal({
                type: 'error',
                title: 'Błąd eksportu',
                message: errorMessage
            });
        } finally {
            setLoading(false);
        }
    };

    const toggleColumn = (column: string) => {
        setConfig(prev => ({
            ...prev,
            columns: prev.columns.includes(column)
                ? prev.columns.filter(c => c !== column)
                : [...prev.columns, column]
        }));
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'customers': return UsersIcon;
            case 'invoices': return DocumentTextIcon;
            case 'payments': return CurrencyDollarIcon;
            case 'contracts': return DocumentTextIcon;
            case 'tasks': return CheckCircleIcon;
            case 'meetings': return ClockIcon;
            case 'notes': return DocumentTextIcon;
            default: return TableCellsIcon;
        }
    };

    const TypeIcon = getTypeIcon(config.type);

    // Sprawdź czy użytkownik ma uprawnienia do eksportu
    const hasExportPermission = user && ['Admin', 'Manager', 'User'].includes(user.role);

    if (dataLoading) {
        return <div className="p-6 text-white text-center">Ładowanie opcji eksportu...</div>;
    }

    if (!hasExportPermission) {
        return (
            <div className="p-6 text-white text-center">
                <h1 className="text-3xl font-bold mb-6">📤 Eksport Danych</h1>
                <div className="bg-red-900 p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-semibold mb-4">Brak uprawnień</h2>
                    <p>Nie masz uprawnień do eksportu danych. Zaloguj się jako Admin, Manager lub User.</p>
                    <p className="mt-2 text-sm text-gray-300">Twoja rola: {user?.role || 'Nieznana'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 text-white">
            <h1 className="text-3xl font-bold mb-6">📤 Eksport Danych</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Panel konfiguracji */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Podstawowa konfiguracja */}
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                        <h2 className="text-xl font-semibold mb-4 flex items-center">
                            <TypeIcon className="w-6 h-6 mr-2" />
                            Konfiguracja eksportu
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Typ danych
                                </label>
                                <select
                                    value={config.type}
                                    onChange={(e) => setConfig(prev => ({ ...prev, type: e.target.value as any }))}
                                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                                >
                                    <option value="customers">Klienci</option>
                                    <option value="invoices">Faktury</option>
                                    <option value="payments">Płatności</option>
                                    <option value="contracts">Kontrakty</option>
                                    <option value="tasks">Zadania</option>
                                    <option value="meetings">Spotkania</option>
                                    <option value="notes">Notatki</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Format eksportu
                                </label>
                                <select
                                    value={config.format}
                                    onChange={(e) => setConfig(prev => ({ ...prev, format: e.target.value as any }))}
                                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                                >
                                    <option value="csv">CSV</option>
                                    <option value="xlsx">Excel (XLSX)</option>
                                    <option value="pdf">PDF</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={config.includeRelations}
                                    onChange={(e) => setConfig(prev => ({ ...prev, includeRelations: e.target.checked }))}
                                    className="mr-2"
                                />
                                <span className="text-sm text-gray-300">Uwzględnij powiązane dane</span>
                            </label>
                        </div>
                    </div>

                    {/* Filtry */}
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                        <h2 className="text-xl font-semibold mb-4 flex items-center">
                            <FunnelIcon className="w-6 h-6 mr-2" />
                            Filtry
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Data od
                                </label>
                                <input
                                    type="date"
                                    value={config.dateFrom || ''}
                                    onChange={(e) => setConfig(prev => ({ ...prev, dateFrom: e.target.value }))}
                                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Data do
                                </label>
                                <input
                                    type="date"
                                    value={config.dateTo || ''}
                                    onChange={(e) => setConfig(prev => ({ ...prev, dateTo: e.target.value }))}
                                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Grupa
                                </label>
                                <select
                                    value={config.groupId || ''}
                                    onChange={(e) => setConfig(prev => ({ ...prev, groupId: e.target.value ? Number(e.target.value) : undefined }))}
                                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                                >
                                    <option value="">Wszystkie grupy</option>
                                    {groups.map(group => (
                                        <option key={group.id} value={group.id}>{group.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Tag
                                </label>
                                <select
                                    value={config.tagId || ''}
                                    onChange={(e) => setConfig(prev => ({ ...prev, tagId: e.target.value ? Number(e.target.value) : undefined }))}
                                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                                >
                                    <option value="">Wszystkie tagi</option>
                                    {tags.map(tag => (
                                        <option key={tag.id} value={tag.id}>{tag.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Wybór kolumn */}
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                        <h2 className="text-xl font-semibold mb-4 flex items-center">
                            <TableCellsIcon className="w-6 h-6 mr-2" />
                            Wybór kolumn
                        </h2>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                            {AVAILABLE_COLUMNS[config.type].map(column => (
                                <label key={column} className="flex items-center p-2 bg-gray-700 rounded hover:bg-gray-600 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={config.columns.includes(column)}
                                        onChange={() => toggleColumn(column)}
                                        className="mr-2"
                                    />
                                    <span className="text-sm text-gray-300">{COLUMN_LABELS[column as keyof typeof COLUMN_LABELS] || column}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Panel podsumowania i eksportu */}
                <div className="space-y-6">
                    {/* Podsumowanie */}
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                        <h2 className="text-xl font-semibold mb-4 flex items-center">
                            <ChartBarIcon className="w-6 h-6 mr-2" />
                            Podsumowanie
                        </h2>

                        <div className="space-y-3 text-sm">
                            <div>
                                <span className="text-gray-400">Typ danych:</span>
                                <span className="ml-2 text-white capitalize">{config.type}</span>
                            </div>
                            <div>
                                <span className="text-gray-400">Format:</span>
                                <span className="ml-2 text-white uppercase">{config.format}</span>
                            </div>
                            <div>
                                <span className="text-gray-400">Kolumny:</span>
                                <span className="ml-2 text-white">{config.columns.length}</span>
                            </div>
                            {config.dateFrom && (
                                <div>
                                    <span className="text-gray-400">Okres:</span>
                                    <span className="ml-2 text-white">
                                        {config.dateFrom} - {config.dateTo || 'teraz'}
                                    </span>
                                </div>
                            )}
                            {config.groupId && (
                                <div>
                                    <span className="text-gray-400">Grupa:</span>
                                    <span className="ml-2 text-white">
                                        {groups.find(g => g.id === config.groupId)?.name}
                                    </span>
                                </div>
                            )}
                            {config.tagId && (
                                <div>
                                    <span className="text-gray-400">Tag:</span>
                                    <span className="ml-2 text-white">
                                        {tags.find(t => t.id === config.tagId)?.name}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Przycisk eksportu */}
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                        <button
                            onClick={handleExport}
                            disabled={loading || config.columns.length === 0}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-colors"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Eksportowanie...
                                </>
                            ) : (
                                <>
                                    <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
                                    Eksportuj dane
                                </>
                            )}
                        </button>

                        {config.columns.length === 0 && (
                            <p className="text-red-400 text-sm mt-2 text-center">
                                Wybierz przynajmniej jedną kolumnę
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
