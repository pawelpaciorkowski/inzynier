import { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { TrashIcon, PencilIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { useModal } from '../context/ModalContext';
import Pagination from '../components/Pagination';

interface Contract {
    id: number;
    title: string;
    signedAt: string;
    customerName: string;
    contractNumber?: string;
    endDate?: string;
    netAmount?: number;
}
interface Template {
    id: number;
    name: string;
    fileName: string;
    uploadedAt?: string;
}

export function ContractsPage() {
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [filteredContracts, setFilteredContracts] = useState<Contract[]>([]);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { openModal, openToast } = useModal();
    const [currentPage, setCurrentPage] = useState(1);
    const resultsPerPage = 10;

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [contractsRes, templatesRes] = await Promise.all([
                api.get('/Contracts/'),
                api.get('/Contracts/templates')
            ]);

            const contractsData = contractsRes.data;
            const contractsArray = contractsData?.$values || (Array.isArray(contractsData) ? contractsData : []);
            setContracts(contractsArray);
            setFilteredContracts(contractsArray);

            const templatesData = templatesRes.data;
            setTemplates(templatesData?.$values || (Array.isArray(templatesData) ? templatesData : []));

        } catch { setError('Nie udało się pobrać danych.'); } finally { setLoading(false); }
    }, []); // Usunięto apiUrl z zależności

    useEffect(() => { fetchData(); }, [fetchData]);

    // Filtrowanie kontraktów na podstawie wyszukiwania
    useEffect(() => {
        const filtered = contracts.filter(contract =>
            contract.title.toLowerCase().includes(search.toLowerCase()) ||
            (contract.contractNumber && contract.contractNumber.toLowerCase().includes(search.toLowerCase())) ||
            contract.customerName.toLowerCase().includes(search.toLowerCase()) ||
            (contract.netAmount && contract.netAmount.toString().includes(search))
        );
        setFilteredContracts(filtered);
        setCurrentPage(1); // Resetuj stronę do 1 po zmianie wyszukiwania
    }, [contracts, search]);

    // PAGINACJA
    const totalPages = Math.ceil(filteredContracts.length / resultsPerPage);
    const paginatedContracts = filteredContracts.slice((currentPage - 1) * resultsPerPage, currentPage * resultsPerPage);

    const handleDeleteContract = async (id: number) => {
        openModal({
            type: 'confirm',
            title: 'Potwierdź usunięcie',
            message: 'Czy na pewno chcesz usunąć ten kontrakt? Tej operacji nie można cofnąć.',
            confirmText: 'Usuń',
            onConfirm: async () => {
                try {
                    await api.delete(`/Contracts/${id}`);
                    // Odśwież listę po usunięciu
                    setContracts(prevContracts => prevContracts.filter(contract => contract.id !== id));
                    openToast('Kontrakt został pomyślnie usunięty.', 'success');
                } catch (err) {
                    alert('Nie udało się usunąć kontraktu.');
                    console.error('Błąd usuwania kontraktu:', err);
                }
            },
        });
    };

    const handleGenerate = async (contractId: number) => {
        if (!selectedTemplateId) {
            openModal({ type: 'error', title: 'Brak szablonu', message: 'Proszę wybrać szablon z listy powyżej.' });
            return;
        }
        try {
            const response = await api.post(`/Contracts/${contractId}/generate-from-template`, {
                template_id: parseInt(selectedTemplateId)
            }, {
                responseType: 'blob'
            });

            // Sprawdź czy odpowiedź to JSON z komunikatem błędu
            if (response.data && typeof response.data === 'object' && response.data.error) {
                openModal({
                    type: 'error',
                    title: 'Błąd generowania dokumentu',
                    message: response.data.error
                });
                return;
            }

            // Jeśli to prawdziwy plik DOCX
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;

            // Pobierz nazwę pliku z nagłówka Content-Disposition
            const contentDisposition = response.headers['content-disposition'];
            let filename = `umowa-${contractId}.docx`;
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="(.+)"/);
                if (filenameMatch) {
                    filename = filenameMatch[1];
                }
            }

            link.setAttribute('download', filename);
            link.click();
            link.remove();

            openToast('Dokument został wygenerowany i pobrany.', 'success');
        } catch (error) {
            console.error('Błąd generowania dokumentu:', error);
            openModal({ type: 'error', title: 'Błąd', message: 'Nie udało się wygenerować dokumentu.' });
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">📑 Kontrakty</h1>
                <div className="flex items-center gap-4">
                    <select onChange={(e) => setSelectedTemplateId(e.target.value)} value={selectedTemplateId} className="p-2 rounded bg-gray-700 text-white border-gray-600">
                        <option value="">-- Wybierz szablon do generowania --</option>
                        {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                    <Link to="/kontrakty/dodaj">
                        <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors">
                            + Dodaj kontrakt
                        </button>
                    </Link>
                </div>
            </div>

            {loading && <p className="text-center text-gray-400">Ładowanie danych...</p>}
            {error && <p className="text-center text-red-500">{error}</p>}

            {!loading && !error && (
                <>
                    {/* Wyszukiwarka */}
                    <div className="mb-6">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Wyszukaj kontrakty..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full px-4 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-800 shadow-md rounded-lg overflow-hidden">
                        <table className="min-w-full leading-normal text-white">
                            {/* Zaktualizowany nagłówek tabeli */}
                            <thead>
                                <tr>
                                    <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-700 text-left text-xs font-semibold uppercase tracking-wider">Tytuł / Numer</th>
                                    <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-700 text-left text-xs font-semibold uppercase tracking-wider">Klient</th>
                                    <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-700 text-left text-xs font-semibold uppercase tracking-wider">Daty</th>
                                    <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-700 text-right text-xs font-semibold uppercase tracking-wider">Wartość netto</th>
                                    <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-700 text-center text-xs font-semibold uppercase tracking-wider">Akcje</th>
                                </tr>
                            </thead>
                            {/* Zaktualizowane ciało tabeli */}
                            <tbody>
                                {paginatedContracts.length > 0 ? (
                                    paginatedContracts.map((contract) => (
                                        <tr key={contract.id} className="hover:bg-gray-700">
                                            <td className="px-5 py-4 border-b border-gray-700">
                                                <p className="font-semibold">{contract.title}</p>
                                                <p className="text-xs text-gray-400">{contract.contractNumber || 'Brak numeru'}</p>
                                            </td>
                                            <td className="px-5 py-4 border-b border-gray-700">{contract.customerName}</td>
                                            <td className="px-5 py-4 border-b border-gray-700 text-sm">
                                                <p>Podpisano: {new Date(contract.signedAt).toLocaleDateString()}</p>
                                                {contract.endDate && <p className="text-gray-400">Zakończenie: {new Date(contract.endDate).toLocaleDateString()}</p>}
                                            </td>
                                            <td className="px-5 py-4 border-b border-gray-700 text-right font-semibold">
                                                {contract.netAmount ? `${contract.netAmount.toFixed(2)} PLN` : '-'}
                                            </td>
                                            <td className="px-5 py-4 border-b border-gray-700 text-center">
                                                <div className="flex justify-center gap-4">
                                                    <button onClick={() => handleGenerate(contract.id)} title="Generuj dokument" className="text-blue-400 hover:text-blue-500">
                                                        <DocumentArrowDownIcon className="w-5 h-5 inline" />
                                                    </button>
                                                    <Link to={`/kontrakty/edytuj/${contract.id}`} title="Edytuj"><PencilIcon className="w-5 h-5 text-gray-400 hover:text-yellow-400" /></Link>
                                                    <button onClick={() => handleDeleteContract(contract.id)} title="Usuń"><TrashIcon className="w-5 h-5 text-gray-400 hover:text-red-500" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="text-center py-10 text-gray-500">
                                            {search ? 'Brak kontraktów pasujących do wyszukiwania.' : 'Brak kontraktów do wyświetlenia.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {paginatedContracts.length > 0 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    )}
                </>
            )}
        </div>
    );
}