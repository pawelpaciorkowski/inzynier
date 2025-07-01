import { useEffect, useState, type FormEvent } from 'react';
import axios from 'axios';
import { TagIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Tag {
    id: number;
    name: string;
}

export function ClientTagsPage() {
    const [tags, setTags] = useState<Tag[]>([]);
    const [newTagName, setNewTagName] = useState('');
    const api = import.meta.env.VITE_API_URL;

    const fetchTags = async () => {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${api}/tags`, { headers: { Authorization: `Bearer ${token}` } });
        setTags(response.data.$values || response.data);
    };

    useEffect(() => {
        fetchTags();
    }, []);

    const handleAddTag = async (e: FormEvent) => {
        e.preventDefault();
        if (!newTagName) return;
        const token = localStorage.getItem('token');
        await axios.post(`${api}/tags`, { name: newTagName }, { headers: { Authorization: `Bearer ${token}` } });
        setNewTagName('');
        fetchTags(); // Refresh tags list
    };

    const handleDeleteTag = async (id: number) => {
        if (!confirm("Czy na pewno chcesz usunąć ten tag?")) return;
        const token = localStorage.getItem('token');
        await axios.delete(`${api}/tags/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        fetchTags(); // Refresh tags list
    }

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-white mb-6">Zarządzaj tagami</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Formularz dodawania */}
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl text-white mb-4">Dodaj nowy tag</h2>
                    <form onSubmit={handleAddTag} className="flex space-x-2">
                        <input
                            type="text"
                            value={newTagName}
                            onChange={e => setNewTagName(e.target.value)}
                            placeholder="Nazwa tagu..."
                            className="flex-grow p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                        />
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold p-2 rounded-md">
                            Dodaj
                        </button>
                    </form>
                </div>

                {/* Lista tagów */}
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl text-white mb-4">Istniejące tagi</h2>
                    <div className="flex flex-wrap gap-2">
                        {tags.map(tag => (
                            <span key={tag.id} className="bg-gray-700 text-gray-200 text-sm font-medium px-3 py-1 rounded-full flex items-center">
                                <TagIcon className="w-4 h-4 mr-2" />
                                {tag.name}
                                <button onClick={() => handleDeleteTag(tag.id)} className="ml-2 text-gray-400 hover:text-red-500">
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}