// Plik: crm-ui/src/pages/TemplatesPage.tsx

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
    const [loading, setLoading] = useState(true);
    const { openModal } = useModal();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchTemplates = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get<ApiResponse<Template> | Template[]>('/Templates');
            const data = '$values' in response.data ? response.data.$values : response.data;
            setTemplates(data);
        } catch {
            openModal({ type: 'error', title: 'Błąd', message: 'Nie udało się załadować szablonów.' });
        } finally {
            setLoading(false);
        }
    }, [openModal]);

    useEffect(() => {
        fetchTemplates();
    }, [fetchTemplates]);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            await api.post('/Templates/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            openModal({ type: 'success', title: 'Sukces', message: 'Szablon został przesłany.' });
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
                    openModal({ type: 'success', title: 'Sukces', message: 'Szablon usunięty.' });
                    fetchTemplates();
                } catch {
                    openModal({ type: 'error', title: 'Błąd', message: 'Nie udało się usunąć szablonu.' });
                }
            },
        });
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
            <div className="bg-gray-800 shadow-lg rounded-lg overflow-hidden">
                <ul className="divide-y divide-gray-700">
                    {templates.map((template) => (
                        <li key={template.id} className="p-4 flex justify-between items-center hover:bg-gray-700/50">
                            <div>
                                <p className="font-semibold text-lg">{template.name}</p>
                                <p className="text-sm text-gray-400">Przesłano: {format(new Date(template.uploadedAt), 'dd.MM.yyyy HH:mm')}</p>
                            </div>
                            <div className="flex items-center space-x-3">
                                {/* Funkcja pobierania nie jest jeszcze zaimplementowana w API */}
                                <button className="p-2 text-gray-400 hover:text-white" title="Pobierz">
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