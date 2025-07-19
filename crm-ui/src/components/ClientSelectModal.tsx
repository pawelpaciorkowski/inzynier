import React, { useState, useMemo } from 'react';

export interface ClientSelectModalProps {
    clients: Array<{
        id: number;
        name: string;
        company?: string;
        email?: string;
        phone?: string;
    }>;
    onSelect: (client: { id: number; name: string; company?: string; email?: string; phone?: string }) => void;
    onClose: () => void;
}

const RESULTS_PER_PAGE = 10;

const ClientSelectModal: React.FC<ClientSelectModalProps> = ({ clients, onSelect, onClose }) => {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    // Filter out invalid clients and ensure all required properties exist
    const validClients = useMemo(() => {
        if (!clients || !Array.isArray(clients)) {
            return [];
        }
        const filtered = clients.filter(client =>
            client &&
            typeof client === 'object' &&
            typeof client.id === 'number' &&
            typeof client.name === 'string' &&
            client.name.trim() !== ''
        );
        return filtered;
    }, [clients]);

    const filtered = useMemo(() =>
        validClients.filter(c =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            (c.company && c.company.toLowerCase().includes(search.toLowerCase())) ||
            (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
            (c.phone && c.phone.toLowerCase().includes(search.toLowerCase()))
        ),
        [validClients, search]
    );

    const totalPages = Math.ceil(filtered.length / RESULTS_PER_PAGE);
    const paginated = filtered.slice((page - 1) * RESULTS_PER_PAGE, page * RESULTS_PER_PAGE);

    // Defensive check to ensure clients is a valid array
    if (!clients || !Array.isArray(clients)) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                <div className="bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-lg relative">
                    <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-white text-xl">&times;</button>
                    <div className="text-center text-gray-400">Ładowanie klientów...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-lg relative">
                <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-white text-xl">&times;</button>
                <h2 className="text-2xl font-bold mb-4 text-white">Wybierz klienta</h2>
                <input
                    type="text"
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                    placeholder="Szukaj po imieniu, firmie, emailu, telefonie..."
                    className="w-full mb-4 p-2 rounded bg-gray-700 text-white border border-gray-600"
                />
                {validClients.length > 0 ? (
                    <ul className="divide-y divide-gray-700 max-h-64 overflow-y-auto mb-4">
                        {paginated.length === 0 && <li className="text-gray-400 p-2">Brak wyników.</li>}
                        {paginated.map(client => (
                            <li key={client.id} className="p-2 hover:bg-gray-700 cursor-pointer rounded flex flex-col" onClick={() => onSelect(client)}>
                                <span className="font-semibold text-white">{client.name}</span>
                                {client.company && <span className="text-gray-400 text-sm">{client.company}</span>}
                                {client.email && <span className="text-gray-500 text-xs">{client.email}</span>}
                                {client.phone && <span className="text-gray-500 text-xs">{client.phone}</span>}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center text-gray-400">Brak klientów do wyboru.</div>
                )}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-2">
                        <button
                            className="px-2 py-1 rounded bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            &lt;
                        </button>
                        <span className="text-white">{page} / {totalPages}</span>
                        <button
                            className="px-2 py-1 rounded bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                        >
                            &gt;
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClientSelectModal; 