import { useEffect, useState, type FormEvent } from 'react';
import api from '../services/api';
import { TagIcon, TrashIcon, PlusIcon, PencilIcon } from '@heroicons/react/24/outline';
import { useModal } from '../context/ModalContext';

interface Tag {
    id: number;
    name: string;
    color?: string;
    description?: string;
    customerCount: number;
    contractCount: number;
    invoiceCount: number;
    taskCount: number;
    meetingCount: number;
}

interface TagDetails {
    id: number;
    name: string;
    color?: string;
    description?: string;
    customers: Array<{ id: number; name: string; email: string }>;
    contracts: Array<{ id: number; title: string; contractNumber: string }>;
    invoices: Array<{ id: number; number: string; totalAmount: number }>;
    tasks: Array<{ id: number; title: string; completed: boolean }>;
    meetings: Array<{ id: number; topic: string; scheduledAt: string }>;
}

export function ClientTagsPage() {
    const [tags, setTags] = useState<Tag[]>([]);
    const [filteredTags, setFilteredTags] = useState<Tag[]>([]);
    const [newTagName, setNewTagName] = useState('');
    const [newTagColor, setNewTagColor] = useState('#3B82F6');
    const [newTagDescription, setNewTagDescription] = useState('');
    const [search, setSearch] = useState('');
    const [selectedTag, setSelectedTag] = useState<TagDetails | null>(null);
    const [editingTag, setEditingTag] = useState<Tag | null>(null);
    const [editName, setEditName] = useState('');
    const [editColor, setEditColor] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const { openToast } = useModal();

    const fetchTags = async () => {
        try {
            const response = await api.get('/Tags/');
            const tagsData = response.data.$values || response.data;
            const tagsArray = Array.isArray(tagsData) ? tagsData : [];
            setTags(tagsArray);
            setFilteredTags(tagsArray);
        } catch {
            openToast('Nie udało się pobrać tagów', 'error');
        }
    };

    useEffect(() => {
        fetchTags();
    }, []);

    // Filtrowanie tagów na podstawie wyszukiwania
    useEffect(() => {
        const filtered = tags.filter(tag =>
            tag.name.toLowerCase().includes(search.toLowerCase()) ||
            (tag.description && tag.description.toLowerCase().includes(search.toLowerCase()))
        );
        setFilteredTags(filtered);
    }, [tags, search]);

    const handleAddTag = async (e: FormEvent) => {
        e.preventDefault();
        if (!newTagName) return;

        try {
            await api.post('/Tags/', {
                name: newTagName,
                color: newTagColor,
                description: newTagDescription
            });
            setNewTagName('');
            setNewTagColor('#3B82F6');
            setNewTagDescription('');
            fetchTags();
            openToast('Tag został utworzony pomyślnie', 'success');
        } catch {
            openToast('Wystąpił błąd podczas tworzenia tagu', 'error');
        }
    };

    const handleDeleteTag = async (id: number) => {
        if (!confirm("Czy na pewno chcesz usunąć ten tag? Spowoduje to usunięcie wszystkich powiązań.")) return;

        try {
            await api.delete(`/Tags/${id}`);
            fetchTags();
            openToast('Tag został usunięty pomyślnie', 'success');
        } catch {
            openToast('Wystąpił błąd podczas usuwania tagu', 'error');
        }
    };


    const handleEditTag = (tag: Tag) => {
        setEditingTag(tag);
        setEditName(tag.name);
        setEditColor(tag.color || '#3B82F6');
        setEditDescription(tag.description || '');
    };

    const handleUpdateTag = async () => {
        if (!editingTag || !editName) return;

        try {
            await api.put(`/Tags/${editingTag.id}`, {
                name: editName,
                color: editColor,
                description: editDescription
            });

            setEditingTag(null);
            setEditName('');
            setEditColor('#3B82F6');
            setEditDescription('');
            fetchTags();
            openToast('Tag został zaktualizowany pomyślnie', 'success');
        } catch {
            openToast('Wystąpił błąd podczas aktualizacji tagu', 'error');
        }
    };

    const getTagStyle = (color?: string) => {
        return {
            backgroundColor: color || '#3B82F6',
            color: 'white'
        };
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-white mb-6">Zarządzaj tagami</h1>

            {/* Formularz dodawania tagu */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
                <h2 className="text-xl text-white font-semibold mb-4">Dodaj nowy tag</h2>
                <form onSubmit={handleAddTag} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Nazwa tagu</label>
                        <input
                            type="text"
                            value={newTagName}
                            onChange={e => setNewTagName(e.target.value)}
                            placeholder="Nazwa tagu..."
                            className="mt-1 w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Kolor</label>
                        <input
                            type="color"
                            value={newTagColor}
                            onChange={e => setNewTagColor(e.target.value)}
                            className="mt-1 w-full h-10 bg-gray-700 border border-gray-600 rounded-md"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Opis (opcjonalnie)</label>
                        <input
                            type="text"
                            value={newTagDescription}
                            onChange={e => setNewTagDescription(e.target.value)}
                            placeholder="Opis tagu..."
                            className="mt-1 w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                        />
                    </div>
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold p-2 rounded-md flex justify-center items-center h-10">
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Dodaj
                    </button>
                </form>
            </div>

            {/* Wyszukiwarka */}
            <div className="mb-6">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Wyszukaj tagi..."
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

            {/* Lista tagów */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTags.map(tag => (
                    <div key={tag.id} className="bg-gray-800 p-5 rounded-lg shadow-lg">
                        <div className="flex items-center justify-between mb-3">
                            <span
                                className="text-sm font-medium px-3 py-1 rounded-full flex items-center"
                                style={getTagStyle(tag.color)}
                            >
                                <TagIcon className="w-4 h-4 mr-2" />
                                {tag.name}
                            </span>
                            <div className="flex space-x-2">

                                <button
                                    onClick={() => handleEditTag(tag)}
                                    className="p-1 bg-green-600 hover:bg-green-700 rounded-md"
                                    title="Edytuj"
                                >
                                    <PencilIcon className="w-4 h-4 text-white" />
                                </button>
                                <button
                                    onClick={() => handleDeleteTag(tag.id)}
                                    className="p-1 bg-red-800 hover:bg-red-700 rounded-md"
                                    title="Usuń"
                                >
                                    <TrashIcon className="w-4 h-4 text-white" />
                                </button>
                            </div>
                        </div>

                        {tag.description && (
                            <p className="text-gray-400 text-sm mb-3">{tag.description}</p>
                        )}

                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                            <div>Klienci: {tag.customerCount}</div>
                            <div>Kontrakty: {tag.contractCount}</div>
                            <div>Faktury: {tag.invoiceCount}</div>
                            <div>Zadania: {tag.taskCount}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal edycji tagu */}
            {editingTag && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-white mb-4">Edytuj tag</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300">Nazwa</label>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300">Kolor</label>
                                <input
                                    type="color"
                                    value={editColor}
                                    onChange={(e) => setEditColor(e.target.value)}
                                    className="w-full h-10 bg-gray-700 border border-gray-600 rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300">Opis</label>
                                <input
                                    type="text"
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end space-x-2 mt-6">
                            <button
                                onClick={() => {
                                    setEditingTag(null);
                                    setEditName('');
                                    setEditColor('#3B82F6');
                                    setEditDescription('');
                                }}
                                className="px-4 py-2 bg-gray-600 text-white rounded-md"
                            >
                                Anuluj
                            </button>
                            <button
                                onClick={handleUpdateTag}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md"
                            >
                                Zapisz
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal szczegółów tagu */}
            {selectedTag && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 p-6 rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center">
                                <span
                                    className="text-lg font-bold px-3 py-1 rounded-full mr-3"
                                    style={getTagStyle(selectedTag.color)}
                                >
                                    {selectedTag.name}
                                </span>
                                {selectedTag.description && (
                                    <span className="text-gray-400">{selectedTag.description}</span>
                                )}
                            </div>
                            <button
                                onClick={() => setSelectedTag(null)}
                                className="text-gray-400 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Klienci */}
                            <div className="bg-gray-700 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold text-white mb-4">Klienci ({selectedTag.customers.length})</h3>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {selectedTag.customers.map(customer => (
                                        <div key={customer.id} className="bg-gray-600 p-2 rounded">
                                            <div className="text-white font-medium">{customer.name}</div>
                                            <div className="text-gray-400 text-sm">{customer.email}</div>
                                        </div>
                                    ))}
                                    {selectedTag.customers.length === 0 && (
                                        <p className="text-gray-400 text-center py-4">Brak klientów z tym tagiem</p>
                                    )}
                                </div>
                            </div>

                            {/* Kontrakty */}
                            <div className="bg-gray-700 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold text-white mb-4">Kontrakty ({selectedTag.contracts.length})</h3>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {selectedTag.contracts.map(contract => (
                                        <div key={contract.id} className="bg-gray-600 p-2 rounded">
                                            <div className="text-white font-medium">{contract.title}</div>
                                            <div className="text-gray-400 text-sm">{contract.contractNumber}</div>
                                        </div>
                                    ))}
                                    {selectedTag.contracts.length === 0 && (
                                        <p className="text-gray-400 text-center py-4">Brak kontraktów z tym tagiem</p>
                                    )}
                                </div>
                            </div>

                            {/* Faktury */}
                            <div className="bg-gray-700 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold text-white mb-4">Faktury ({selectedTag.invoices.length})</h3>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {selectedTag.invoices.map(invoice => (
                                        <div key={invoice.id} className="bg-gray-600 p-2 rounded">
                                            <div className="text-white font-medium">{invoice.number}</div>
                                            <div className="text-gray-400 text-sm">{invoice.totalAmount} PLN</div>
                                        </div>
                                    ))}
                                    {selectedTag.invoices.length === 0 && (
                                        <p className="text-gray-400 text-center py-4">Brak faktur z tym tagiem</p>
                                    )}
                                </div>
                            </div>

                            {/* Zadania */}
                            <div className="bg-gray-700 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold text-white mb-4">Zadania ({selectedTag.tasks.length})</h3>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {selectedTag.tasks.map(task => (
                                        <div key={task.id} className="bg-gray-600 p-2 rounded">
                                            <div className="text-white font-medium">{task.title}</div>
                                            <div className={`text-sm ${task.completed ? 'text-green-400' : 'text-yellow-400'}`}>
                                                {task.completed ? 'Ukończone' : 'Oczekujące'}
                                            </div>
                                        </div>
                                    ))}
                                    {selectedTag.tasks.length === 0 && (
                                        <p className="text-gray-400 text-center py-4">Brak zadań z tym tagiem</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}