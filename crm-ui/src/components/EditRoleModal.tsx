import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useModal } from '../context/ModalContext';

type Role = {
    id: number;
    name: string;
    usersCount: number;
    description?: string;
};

interface EditRoleModalProps {
    role: Role;
    onSaveSuccess: () => void;
    onClose: () => void;
}

export const EditRoleModal: React.FC<EditRoleModalProps> = ({ role, onSaveSuccess, onClose }) => {
    const [editRoleName, setEditRoleName] = useState('');
    const [editRoleDesc, setEditRoleDesc] = useState('');
    const { openModal, openToast } = useModal();
    const api = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem('token');

    useEffect(() => {
        setEditRoleName(role.name);
        setEditRoleDesc(role.description || '');
    }, [role]);

    const handleEditRole = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.put(`${api}/admin/roles/${role.id}`, {
                name: editRoleName,
                description: editRoleDesc,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            openToast('Rola została zaktualizowana.', 'success');
            onSaveSuccess();
            onClose();
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Nie udało się zaktualizować roli.';
            openModal({ type: 'error', title: 'Błąd', message: errorMessage });
        }
    };

    return (
        <div className="bg-gray-900 text-white p-8 rounded shadow max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">✏️ Edytuj rolę</h2>
            <form className="grid gap-4" onSubmit={handleEditRole}>
                <input
                    className="p-2 rounded bg-gray-700 text-white"
                    value={editRoleName}
                    onChange={e => setEditRoleName(e.target.value)}
                    placeholder="Nazwa roli"
                    required
                />
                <input
                    className="p-2 rounded bg-gray-700 text-white"
                    value={editRoleDesc}
                    onChange={e => setEditRoleDesc(e.target.value)}
                    placeholder="Opis (opcjonalnie)"
                />
                <div className="flex gap-2">
                    <button type="submit" className="bg-green-600 px-4 py-1 rounded">💾 Zapisz</button>
                    <button type="button" onClick={onClose} className="bg-gray-500 px-4 py-1 rounded">❌ Anuluj</button>
                </div>
            </form>
        </div>
    );
};