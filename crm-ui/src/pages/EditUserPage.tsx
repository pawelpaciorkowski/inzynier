/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

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
    const { user } = useAuth(); // hook zawsze wywoływany
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [formData, setFormData] = useState<UserFormData>({});
    const [roles, setRoles] = useState<Role[]>([]);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem('token');

    // Jeśli użytkownik nie ma uprawnień, zatrzymaj się po hookach
    const isRestricted = user?.role === 'Sprzedawca';

    // Pobieranie danych użytkownika i ról
    useEffect(() => {
        if (!id || isRestricted) return;

        const fetchData = async () => {
            try {
                const [userResponse, rolesResponse] = await Promise.all([
                    api.get(`/admin/Users/${id}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    api.get('/admin/Roles', {
                        headers: { Authorization: `Bearer ${token}` },
                    })
                ]);

                const userData = userResponse.data;
                setFormData({
                    username: userData.username,
                    email: userData.email,
                    roleId: userData.roleId,
                });

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
    }, [id, token, isRestricted]);

    // Obsługa zmian pól tekstowych
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

    // Obsługa formularza
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        try {
            await api.put(`/admin/Users/${id}`, {
                username: formData.username,
                email: formData.email,
                roleId: formData.roleId,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSuccess('✅ Użytkownik zaktualizowany pomyślnie!');
            setTimeout(() => navigate('/uzytkownicy'), 2000);
        } catch (err) {
            console.error('Błąd aktualizacji użytkownika:', err);
            setError('❌ Błąd aktualizacji użytkownika.');
        }
    };

    // Render — najpierw ograniczenia, potem ładowanie, potem formularz
    if (isRestricted) {
        return <div className="p-6 text-center text-red-500">Brak dostępu do tej sekcji.</div>;
    }

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
