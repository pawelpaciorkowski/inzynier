/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import axios from 'axios';

type Role = {
    id: number;
    name: string;
};

type UserFormData = {
    username?: string;
    email?: string;
    password?: string;
    role?: Role;
};

export function AddUserPage() {
    const [formData, setFormData] = useState<UserFormData>({});
    const [roles, setRoles] = useState<Role[]>([]);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const api = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem('token');

    useEffect(() => {
        axios.get(`${api}/admin/roles`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => {
                const data = res.data;
                if (data && Array.isArray((data as any).$values)) {
                    setRoles((data as any).$values);
                } else if (Array.isArray(data)) {
                    setRoles(data);
                } else {
                    console.warn("Otrzymano nieoczekiwany format danych dla ról:", data);
                    setRoles([]);
                }
            })
            .catch(() => setError('Błąd ładowania ról'));

    }, [api, token]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selected = roles.find(r => r.id === Number(e.target.value));
        setFormData(prev => ({
            ...prev,
            role: selected
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        try {
            await axios.post(`${api}/admin/users`, {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                roleId: formData.role?.id,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSuccess('Użytkownik dodany!');
            setFormData({});
        } catch (err) {
            console.error('Błąd dodawania użytkownika:', err);
            setError('❌ Błąd dodawania użytkownika');
        }
    };

    return (
        <div className="p-6 max-w-xl mx-auto">
            <h1 className="text-3xl font-bold mb-4">👤 Dodaj użytkownika</h1>

            {success && <div className="mb-4 p-2 bg-green-700 text-white rounded">{success}</div>}
            {error && <div className="mb-4 p-2 bg-red-700 text-white rounded">{error}</div>}

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
                <input
                    className="p-2 rounded bg-gray-700 text-white"
                    type="password"
                    name="password"
                    placeholder="Hasło"
                    value={formData.password || ''}
                    onChange={handleChange}
                    required
                />
                <select
                    className="p-2 rounded bg-gray-700 text-white"
                    value={formData.role?.id || ''}
                    onChange={handleRoleChange}
                    required
                >
                    <option value="">-- Wybierz rolę --</option>
                    {roles.map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                </select>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-bold">
                    ➕ Dodaj użytkownika
                </button>
            </form>
        </div>
    );
}