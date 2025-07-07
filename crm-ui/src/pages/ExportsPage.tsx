/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import axios from 'axios';
import { useModal } from '../context/ModalContext';

export function ExportsPage() {
    const [exportType, setExportType] = useState('customers'); // Domyślny typ eksportu
    const [loading, setLoading] = useState(false);
    const { openModal } = useModal();

    const handleExport = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/Reports/export-${exportType}`, {
                responseType: 'blob', // Ważne dla pobierania plików
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${exportType}.csv`); // Nazwa pliku
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            openModal({ type: 'success', title: 'Sukces', message: `Dane ${exportType} zostały wyeksportowane.` });
        } catch (error: any) {
            console.error('Błąd eksportu:', error);
            openModal({ type: 'error', title: 'Błąd', message: error.response?.data?.message || 'Nie udało się wyeksportować danych.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 text-white">
            <h1 className="text-3xl font-bold mb-6">📤 Eksport danych</h1>

            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <div className="mb-4">
                    <label
                        htmlFor="exportType"
                        className="block text-gray-300 text-sm font-bold mb-2"
                    >
                        Wybierz typ danych do eksportu:
                    </label>
                    <select
                        id="exportType"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600"
                        value={exportType}
                        onChange={(e) => setExportType(e.target.value)}
                    >
                        <option value="customers">Klienci</option>
                        <option value="contracts">Kontrakty</option>
                        <option value="payments">Płatności</option>
                        <option value="invoices">Faktury</option>
                    </select>
                </div>

                <button
                    onClick={handleExport}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    disabled={loading}
                >
                    {loading ? "Eksportowanie..." : "Eksportuj"}
                </button>
            </div>
        </div>
    );
}
