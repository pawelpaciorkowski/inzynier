import { useEffect, useState } from 'react';
import axios from 'axios';

type Customer = {
    id: number;
    name: string;
    email: string;
    phone: string;
    company: string;
    createdAt: string;
};

export default function ClientsPage() {
    const [clients, setClients] = useState<Customer[]>([]);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [formData, setFormData] = useState<Partial<Customer>>({});
    const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
    const api = import.meta.env.VITE_API_URL;

    const handleEdit = (customer: Customer) => {
        setEditingCustomer(customer);
        setFormData(customer);
    };

    const handleDeleteClick = (customer: Customer) => {
        setCustomerToDelete(customer);
    };

    const confirmDelete = async () => {
        if (!customerToDelete) return;
        const token = localStorage.getItem('token');

        try {
            await axios.delete('${api}/customers/${customerToDelete.id}', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setClients(prev => prev.filter(c => c.id !== customerToDelete.id));
            setCustomerToDelete(null); // zamknij modal
        } catch (err) {
            console.error('❌ Błąd usuwania klienta:', err);
        }
    };




    useEffect(() => {
        const token = localStorage.getItem('token');
        axios.get('/api/customers', {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => {
                // Sprawdź, czy response to tablica
                if (Array.isArray(res.data)) setClients(res.data);
                else {
                    console.error("❌ Nieoczekiwany format odpowiedzi:", res.data);
                    setClients([]);
                }
            })
            .catch(err => {
                console.error('❌ Błąd ładowania klientów:', err);
                setClients([]);
            });
    }, []);




    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">📋 Lista klientów</h1>
            <ul className="space-y-2">
                {clients.map(c => (
                    <li key={c.id} className="bg-gray-800 p-4 rounded-md shadow text-white">
                        <strong className="text-xl">{c.name}</strong><br />
                        📧 {c.email} <br />
                        📞 {c.phone} <br />
                        🏢 {c.company} <br />
                        🕒 {new Date(c.createdAt).toLocaleString()} <br />

                        <div className="mt-2 flex gap-2">
                            <button
                                onClick={() => handleEdit(c)}
                                className="bg-yellow-500 text-black px-3 py-1 rounded"
                            >
                                ✏️ Edytuj
                            </button>
                            <button
                                onClick={() => handleDeleteClick(c)}
                                className="bg-red-600 text-white px-3 py-1 rounded"
                            >
                                🗑 Usuń
                            </button>

                        </div>

                        {/* 🔽 Inline formularz edycji */}
                        {editingCustomer?.id === c.id && (
                            <form
                                className="bg-gray-700 p-4 mt-4 rounded"
                                onSubmit={async (e) => {
                                    e.preventDefault();
                                    const token = localStorage.getItem('token');

                                    try {
                                        await axios.put(
                                            `${api}/customers/${editingCustomer.id}`,
                                            formData,
                                            {
                                                headers: { Authorization: `Bearer ${token}` },
                                            }
                                        );
                                        setClients((prev) =>
                                            prev.map((item) =>
                                                item.id === editingCustomer.id ? { ...item, ...formData } : item
                                            )
                                        );
                                        setEditingCustomer(null);
                                    } catch (err) {
                                        console.error('❌ Błąd edycji klienta:', err);
                                    }
                                }}
                            >
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        className="p-2 rounded bg-gray-800 text-white"
                                        placeholder="Imię i nazwisko"
                                        value={formData.name || ''}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                    <input
                                        className="p-2 rounded bg-gray-800 text-white"
                                        placeholder="Email"
                                        value={formData.email || ''}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                    <input
                                        className="p-2 rounded bg-gray-800 text-white"
                                        placeholder="Telefon"
                                        value={formData.phone || ''}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                    <input
                                        className="p-2 rounded bg-gray-800 text-white"
                                        placeholder="Firma"
                                        value={formData.company || ''}
                                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                    />
                                </div>
                                <div className="mt-4 flex gap-2">
                                    <button
                                        type="submit"
                                        className="bg-green-600 px-4 py-2 rounded text-white"
                                    >
                                        💾 Zapisz
                                    </button>
                                    <button
                                        type="button"
                                        className="bg-gray-500 px-4 py-2 rounded text-white"
                                        onClick={() => setEditingCustomer(null)}
                                    >
                                        ❌ Anuluj
                                    </button>
                                </div>
                            </form>
                        )}
                    </li>
                ))}
            </ul>
            {customerToDelete && (
                <div className="fixed inset-0 backdrop-blur-md bg-white/10 flex items-center justify-center z-90">
                    <div className="bg-gray-800 p-6 rounded shadow-lg text-white max-w-md w-full">
                        <h2 className="text-xl font-bold mb-4">🗑 Potwierdź usunięcie</h2>
                        <p className="mb-6">
                            Czy na pewno chcesz usunąć klienta <strong>{customerToDelete.name}</strong>?
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                className="bg-gray-500 px-4 py-2 rounded"
                                onClick={() => setCustomerToDelete(null)}
                            >
                                ❌ Anuluj
                            </button>
                            <button
                                className="bg-red-600 px-4 py-2 rounded"
                                onClick={confirmDelete}
                            >
                                🗑 Usuń
                            </button>
                        </div>
                    </div>
                </div>

            )}



        </div>
    );
}
