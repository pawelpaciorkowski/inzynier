import { useEffect, useState, useCallback, useRef } from 'react';
import api from '../services/api';
import { useModal } from '../context/ModalContext';
import { DocumentArrowDownIcon, TrashIcon, ArrowUpOnSquareIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

interface Template {
    id: number;
    name: string;
    fileName: string;
    uploadedAt: string;
}

interface ApiResponse<T> {
    $values: T[];
}

export function TemplatesPage() {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const { openModal, openToast } = useModal();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchTemplates = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get<ApiResponse<Template> | Template[]>('/Templates/');
            const data = '$values' in response.data ? response.data.$values : response.data;
            setTemplates(data);
            setFilteredTemplates(data);
        } catch {
            openModal({ type: 'error', title: 'Błąd', message: 'Nie udało się załadować szablonów.' });
        } finally {
            setLoading(false);
        }
    }, [openModal]);

    useEffect(() => {
        fetchTemplates();
    }, [fetchTemplates]);

    // Filtrowanie szablonów na podstawie wyszukiwania
    useEffect(() => {
        const filtered = templates.filter(template =>
            template.name.toLowerCase().includes(search.toLowerCase()) ||
            template.fileName.toLowerCase().includes(search.toLowerCase())
        );
        setFilteredTemplates(filtered);
    }, [templates, search]);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('templateName', file.name);

        try {
            await api.post('/Templates/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            openToast('Szablon został przesłany.', 'success');
            fetchTemplates();
        } catch {
            openModal({ type: 'error', title: 'Błąd', message: 'Nie udało się przesłać pliku.' });
        }
    };

    const handleDelete = (template: Template) => {
        openModal({
            type: 'confirm',
            title: 'Potwierdź usunięcie',
            message: `Czy na pewno chcesz usunąć szablon "${template.name}"?`,
            confirmText: 'Usuń',
            onConfirm: async () => {
                try {
                    await api.delete(`/Templates/${template.id}`);
                    openToast('Szablon usunięty.', 'success');
                    fetchTemplates();
                } catch {
                    openModal({ type: 'error', title: 'Błąd', message: 'Nie udało się usunąć szablonu.' });
                }
            },
        });
    };

    const handleDownload = async (template: Template) => {
        try {
            const response = await api.get(`/Templates/${template.id}/download`, {
                responseType: 'blob', // Important for downloading files
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', template.fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Błąd pobierania szablonu:', err);
            openModal({ type: 'error', title: 'Błąd', message: 'Nie udało się pobrać szablonu.' });
        }
    };

    if (loading) return <p className="text-center p-8 text-white">Ładowanie...</p>;

    return (
        <div className="p-6 text-white">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">📄 Szablony Dokumentów</h1>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors"
                >
                    <ArrowUpOnSquareIcon className="h-5 w-5 mr-2" />
                    Prześlij nowy szablon
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".doc,.docx"
                />
            </div>

            {/* Wyszukiwarka */}
            <div className="mb-6">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Wyszukaj szablony..."
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

            <div className="bg-gray-800 shadow-lg rounded-lg overflow-hidden">
                <ul className="divide-y divide-gray-700">
                    {filteredTemplates.map((template) => (
                        <li key={template.id} className="p-4 flex justify-between items-center hover:bg-gray-700/50">
                            <div>
                                <p className="font-semibold text-lg">{template.name}</p>
                                <p className="text-sm text-gray-400">Przesłano: {format(new Date(template.uploadedAt), 'dd.MM.yyyy HH:mm')}</p>
                            </div>
                            <div className="flex items-center space-x-3">
                                <button onClick={() => handleDownload(template)} className="p-2 text-gray-400 hover:text-white" title="Pobierz">
                                    <DocumentArrowDownIcon className="h-5 w-5" />
                                </button>
                                <button onClick={() => handleDelete(template)} className="p-2 text-gray-400 hover:text-red-500" title="Usuń">
                                    <TrashIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            {/* Usunęliśmy stąd lokalny, zduplikowany modal */}
        </div>
    );
}