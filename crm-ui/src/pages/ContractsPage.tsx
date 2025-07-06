import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { TrashIcon, PencilIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { useModal } from '../context/ModalContext';

interface Contract {
    id: number;
    title: string;
    signedAt: string;
    customerName: string;
    contractNumber?: string;
    endDate?: string;
    netAmount?: number;
}
interface Template { id: number; name: string; }

export function ContractsPage() {
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { openModal } = useModal();
    const api = import.meta.env.VITE_API_URL;

    const fetchData = useCallback(async () => {
        const token = localStorage.getItem('token');
        setLoading(true);
        try {
            const [contractsRes, templatesRes] = await Promise.all([
                axios.get(`${api}/contracts`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${api}/templates`, { headers: { Authorization: `Bearer ${token}` } })
            ]);

            const contractsData = contractsRes.data;
            setContracts(contractsData?.$values || (Array.isArray(contractsData) ? contractsData : []));

            const templatesData = templatesRes.data;
            setTemplates(templatesData?.$values || (Array.isArray(templatesData) ? templatesData : []));

        } catch { setError('Nie udało się pobrać danych.'); } finally { setLoading(false); }
    }, [api]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleDeleteContract = async (id: number) => {
        openModal({
            type: 'confirm',
            title: 'Potwierdź usunięcie',
            message: 'Czy na pewno chcesz usunąć ten kontrakt? Tej operacji nie można cofnąć.',
            confirmText: 'Usuń',
            onConfirm: async () => {
                try {
                    await axios.delete(`/api/Contracts/${id}`);
                    // Odśwież listę po usunięciu
                    setContracts(prevContracts => prevContracts.filter(contract => contract.id !== id));
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
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${api}/contracts/${contractId}/generate-document?templateId=${selectedTemplateId}`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `umowa-${contractId}.docx`);
            link.click();
            link.remove();
        } catch {
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
                            {contracts.length > 0 ? (
                                contracts.map((contract) => (
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
                                        Brak kontraktów do wyświetlenia.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}