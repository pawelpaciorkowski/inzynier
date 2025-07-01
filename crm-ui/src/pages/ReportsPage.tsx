import { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'; // Usunięto ResponsiveContainer
import { ChartBarIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface ReportData {
    month: string;
    count: number;
}

export function ReportsPage() {
    const [data, setData] = useState<ReportData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const api = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchReportData = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await axios.get(`${api}/reports/customer-growth`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const responseData = response.data.$values || response.data;
                setData(responseData);
            } catch (err) {
                console.error("Błąd pobierania danych do raportu:", err);
                setError("Nie udało się załadować danych raportu.");
            } finally {
                setLoading(false);
            }
        };
        fetchReportData();
    }, [api]);

    // Renderowanie komponentu
    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-white mb-6">Raporty</h1>

            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <ChartBarIcon className="w-6 h-6 mr-3 text-green-400" />
                    Wzrost liczby klientów w czasie
                </h2>

                <div className="flex justify-center items-center" style={{ height: 400 }}>
                    {loading && <p className="text-gray-400">Generowanie raportu...</p>}

                    {error && (
                        <div className="text-center text-red-400">
                            <ExclamationTriangleIcon className="w-12 h-12 mx-auto text-red-500" />
                            <p className="mt-4">{error}</p>
                        </div>
                    )}

                    {!loading && !error && (
                        // Używamy BarChart ze stałym rozmiarem
                        <BarChart
                            width={700} // Stała szerokość
                            height={400} // Stała wysokość
                            data={data}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                            <XAxis dataKey="month" stroke="#A0AEC0" />
                            <YAxis stroke="#A0AEC0" />
                            <Tooltip contentStyle={{ backgroundColor: '#2D3748', border: 'none' }} />
                            <Legend />
                            <Bar dataKey="count" fill="#4299E1" name="Nowi klienci" />
                        </BarChart>
                    )}
                </div>
            </div>
        </div>
    );
}