/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Definicja typów dla przejrzystości
type Role = {
    id: number;
    name: string;
};

type UserFormData = {
    username?: string;
    email?: string;
    roleId?: number;
};

export function EditUserPage() {
    // Pobieranie ID użytkownika z URL, np. /users/101/edit
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // Stany formularza i komunikaty
    const [formData, setFormData] = useState<UserFormData>({});
    const [roles, setRoles] = useState<Role[]>([]);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const api = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem('token');

    // Efekt do pobrania danych użytkownika i ról po załadowaniu strony
    useEffect(() => {
        if (!id) return; // Zabezpieczenie, jeśli ID nie jest dostępne

        const fetchData = async () => {
            try {
                // Równoległe pobieranie danych użytkownika i listy ról
                const [userResponse, rolesResponse] = await Promise.all([
                    axios.get(`${api}/auth/users/${id}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get(`${api}/admin/roles`, {
                        headers: { Authorization: `Bearer ${token}` },
                    })
                ]);

                // Ustawienie danych formularza na podstawie odpowiedzi API
                const userData = userResponse.data;
                setFormData({
                    username: userData.username,
                    email: userData.email,
                    roleId: userData.roleId,
                });

                // Ustawienie listy ról
                const rolesData = rolesResponse.data;
                if (rolesData && Array.isArray((rolesData as any).$values)) {
                    setRoles((rolesData as any).$values);
                } else if (Array.isArray(rolesData)) {
                    setRoles(rolesData);
                } else {
                    console.warn("Otrzymano nieoczekiwany format danych dla ról:", rolesData);
                    setRoles([]);
                }

            } catch (err) {
                console.error("Błąd ładowania danych:", err);
                setError('❌ Błąd ładowania danych użytkownika.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, api, token]); // Zależności efektu

    // Obsługa zmian w polach tekstowych
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Obsługa zmiany roli
    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            roleId: Number(e.target.value)
        }));
    };

    // Obsługa wysłania formularza
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        try {
            await axios.put(`${api}/auth/users/${id}`, {
                username: formData.username,
                email: formData.email,
                roleId: formData.roleId,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSuccess('✅ Użytkownik zaktualizowany pomyślnie!');
            // Opcjonalnie: przekieruj po chwili
            setTimeout(() => navigate('/users'), 2000); // Przekierowanie na listę użytkowników
        } catch (err) {
            console.error('Błąd aktualizacji użytkownika:', err);
            setError('❌ Błąd aktualizacji użytkownika.');
        }
    };

    // Wyświetlanie stanu ładowania
    if (loading) {
        return <div className="p-6 text-center">Ładowanie...</div>;
    }

    return (
        <div className="p-6 max-w-xl mx-auto">
            <h1 className="text-3xl font-bold mb-4">👤 Edytuj użytkownika</h1>

            {success && <div className="mb-4 p-3 bg-green-700 text-white rounded">{success}</div>}
            {error && <div className="mb-4 p-3 bg-red-700 text-white rounded">{error}</div>}

            <form className="grid gap-4" onSubmit={handleSubmit}>
                <input
                    className="p-2 rounded bg-gray-700 text-white"
                    name="username"
                    placeholder="Nazwa użytkownika"
                    value={formData.username || ''}
                    onChange={handleChange}
                    required
                />
                <input
                    className="p-2 rounded bg-gray-700 text-white"
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email || ''}
                    onChange={handleChange}
                    required
                />
                <select
                    className="p-2 rounded bg-gray-700 text-white"
                    value={formData.roleId || ''}
                    onChange={handleRoleChange}
                    required
                >
                    <option value="">-- Wybierz rolę --</option>
                    {roles.map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                </select>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-bold">
                    💾 Zapisz Zmiany
                </button>
            </form>
        </div>
    );
}