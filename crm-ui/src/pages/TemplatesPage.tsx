import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useModal } from '../context/ModalContext';
import { TrashIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';

interface Template {
    id: number;
    name: string;
    fileName: string;
    uploadedAt: string;
}

export function TemplatesPage() {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [templateName, setTemplateName] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const { openModal } = useModal();
    const api = import.meta.env.VITE_API_URL;

    const fetchTemplates = useCallback(async () => {
        const token = localStorage.getItem('token');
        setLoading(true);
        try {
            const res = await axios.get(`${api}/templates`, { headers: { Authorization: `Bearer ${token}` } });
            const data = res.data;
            setTemplates(data?.$values || (Array.isArray(data) ? data : []));
        } catch {
            openModal({ type: 'error', title: 'Błąd', message: 'Nie udało się pobrać szablonów.' });
        } finally {
            setLoading(false);
        }
    }, [api, openModal]);

    useEffect(() => {
        fetchTemplates();
    }, [fetchTemplates]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile || !templateName) {
            openModal({ type: 'error', title: 'Błąd', message: 'Nazwa szablonu i plik są wymagane.' });
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('templateName', templateName);

        const token = localStorage.getItem('token');
        try {
            await axios.post(`${api}/templates/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
            });
            openModal({ type: 'success', title: 'Sukces!', message: 'Szablon został wgrany.' });
            setTemplateName('');
            setSelectedFile(null);
            (document.getElementById('file-upload') as HTMLInputElement).value = "";
            fetchTemplates();
        } catch {
            openModal({ type: 'error', title: 'Błąd', message: 'Wystąpił błąd podczas wgrywania pliku.' });
        }
    };

    const handleDelete = (template: Template) => {
        openModal({
            type: 'confirm',
            title: 'Potwierdź usunięcie',
            message: `Czy na pewno chcesz usunąć szablon "${template.name}"?`,
            confirmText: 'Usuń',
            onConfirm: async () => {
                const token = localStorage.getItem('token');
                try {
                    await axios.delete(`<span class="math-inline">{api}/templates/</span>{template.id}`, { headers: { Authorization: `Bearer ${token}` } });
                    fetchTemplates();
                } catch {
                    openModal({ type: 'error', title: 'Błąd', message: 'Nie udało się usunąć szablonu.' });
                }
            }
        });
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-white mb-6">🗂️ Zarządzanie szablonami (.docx)</h1>

            <form onSubmit={handleUpload} className="mb-8 p-4 bg-gray-800 rounded-lg flex items-end gap-4">
                <div className="flex-grow">
                    <label htmlFor="templateName" className="block text-sm font-medium text-gray-300 mb-1">Nazwa szablonu</label>
                    <input id="templateName" type="text" value={templateName} onChange={e => setTemplateName(e.target.value)} required className="w-full p-2 rounded bg-gray-700 text-white border-gray-600" />
                </div>
                <div className="flex-grow">
                    <label htmlFor="file-upload" className="block text-sm font-medium text-gray-300 mb-1">Plik szablonu (.docx)</label>
                    <input id="file-upload" type="file" onChange={handleFileChange} required accept=".docx" className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700" />
                </div>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2">
                    <ArrowUpTrayIcon className="w-5 h-5" /> Wgraj szablon
                </button>
            </form>

            {loading ? <p className="text-center text-gray-400">Ładowanie...</p> : (
                <div className="bg-gray-800 shadow-md rounded-lg overflow-hidden">
                    <table className="min-w-full leading-normal text-white">
                        <thead>
                            <tr>
                                <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-700 text-left text-xs font-semibold uppercase tracking-wider">Nazwa szablonu</th>
                                <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-700 text-left text-xs font-semibold uppercase tracking-wider">Oryginalna nazwa pliku</th>
                                <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-700 text-left text-xs font-semibold uppercase tracking-wider">Data wgrania</th>
                                <th className="px-5 py-3 border-b-2 border-gray-700 bg-gray-700 text-center text-xs font-semibold uppercase tracking-wider">Akcje</th>
                            </tr>
                        </thead>
                        <tbody>
                            {templates.map(template => (
                                <tr key={template.id} className="hover:bg-gray-700">
                                    <td className="px-5 py-4 border-b border-gray-700 font-medium">{template.name}</td>
                                    <td className="px-5 py-4 border-b border-gray-700">{template.fileName}</td>
                                    <td className="px-5 py-4 border-b border-gray-700">{new Date(template.uploadedAt).toLocaleString()}</td>
                                    <td className="px-5 py-4 border-b border-gray-700 text-center">
                                        <button onClick={() => handleDelete(template)} title="Usuń">
                                            <TrashIcon className="w-5 h-5 text-gray-400 hover:text-red-500" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}