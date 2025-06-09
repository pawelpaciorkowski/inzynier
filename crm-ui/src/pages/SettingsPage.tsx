import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';

interface SettingsData {
    [key: string]: string;
}

export function SettingsPage() {
    const { user } = useAuth();
    const { openModal } = useModal();
    const [settings, setSettings] = useState<SettingsData>({});
    const [loading, setLoading] = useState(true);
    const api = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (user?.role === 'Admin') {
            axios.get(`${api}/settings`, { headers: { Authorization: `Bearer ${token}` } })
                .then(res => {
                    setSettings(res.data);
                })
                .catch(() => openModal({ type: 'error', title: 'Błąd', message: 'Nie udało się pobrać ustawień.' }))
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [api, user, openModal]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveSettings = async () => {
        const token = localStorage.getItem('token');
        try {
            await axios.post(`${api}/settings`, settings, { headers: { Authorization: `Bearer ${token}` } });
            openModal({ type: 'success', title: 'Sukces', message: 'Ustawienia zostały zapisane.' });
        } catch {
            openModal({ type: 'error', title: 'Błąd', message: 'Nie udało się zapisać ustawień.' });
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-8">Ustawienia</h1>

            <div className="space-y-8">
                {/* --- Sekcja dla Admina --- */}
                {user?.role === 'Admin' && (
                    <div className="bg-gray-800 p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold text-indigo-400 mb-4">Dane Firmy (do dokumentów)</h2>
                        {loading ? <p className="text-gray-400">Ładowanie...</p> : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField label="Nazwa Firmy" name="CompanyName" value={settings.CompanyName || ''} onChange={handleChange} />
                                <InputField label="NIP" name="CompanyNIP" value={settings.CompanyNIP || ''} onChange={handleChange} />
                                <InputField label="Adres Firmy" name="CompanyAddress" value={settings.CompanyAddress || ''} onChange={handleChange} />
                                <InputField label="Numer konta bankowego" name="CompanyBankAccount" value={settings.CompanyBankAccount || ''} onChange={handleChange} />
                            </div>
                        )}
                        <div className="flex justify-end mt-6">
                            <button onClick={handleSaveSettings} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition-colors">Zapisz Dane Firmy</button>
                        </div>
                    </div>
                )}

                {/* --- Sekcja dla każdego użytkownika --- */}
                <ChangePasswordForm />
            </div>
        </div>
    );
}

function ChangePasswordForm() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { openModal } = useModal();
    const api = import.meta.env.VITE_API_URL;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword.length < 6) {
            openModal({ type: 'error', title: 'Błąd', message: 'Nowe hasło musi mieć co najmniej 6 znaków.' });
            return;
        }
        if (newPassword !== confirmPassword) {
            openModal({ type: 'error', title: 'Błąd', message: 'Nowe hasła nie są identyczne.' });
            return;
        }

        const token = localStorage.getItem('token');
        try {
            await axios.put(`${api}/profile/change-password`,
                { currentPassword, newPassword },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            openModal({ type: 'success', title: 'Sukces!', message: 'Hasło zostało pomyślnie zmienione.' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch {
            openModal({ type: 'error', title: 'Błąd', message: 'Nie udało się zmienić hasła. Sprawdź swoje bieżące hasło.' });
        }
    };

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-indigo-400 mb-4">Zmień hasło</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <InputField label="Bieżące hasło" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
                <div />
                <InputField label="Nowe hasło" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                <InputField label="Potwierdź nowe hasło" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                <div className="md:col-span-2 flex justify-end mt-2">
                    <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded transition-colors">Zapisz Nowe Hasło</button>
                </div>
            </form>
        </div>
    );
}

const InputField = ({ label, name, value, onChange, type = 'text', required = false }: { label: string, name?: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, type?: string, required?: boolean }) => (
    <div>
        <label htmlFor={name || label} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
        <input id={name || label} name={name} type={type} value={value} onChange={onChange} required={required} className="w-full p-2 rounded bg-gray-700 text-white border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 outline-none transition" />
    </div>
);