import { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { ChartBarIcon, ExclamationTriangleIcon, CurrencyDollarIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

interface CustomerGrowthData {
    month: string;
    count: number;
}

interface SalesData {
    customerName: string;
    totalAmount: number;
}

interface InvoiceStatusData {
    status: string;
    count: number;
}

export function ReportsPage() {
    const [customerGrowthData, setCustomerGrowthData] = useState<CustomerGrowthData[]>([]);
    const [salesData, setSalesData] = useState<SalesData[]>([]);
    const [invoiceStatusData, setInvoiceStatusData] = useState<InvoiceStatusData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeReport, setActiveReport] = useState('customerGrowth'); // 'customerGrowth', 'sales', 'invoiceStatus'
    const api = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchReportData = async () => {
            const token = localStorage.getItem('token');
            setLoading(true);
            setError(null);
            try {
                if (activeReport === 'customerGrowth') {
                    const response = await axios.get(`${api}/reports/customer-growth`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const responseData = response.data.$values || response.data;
                    setCustomerGrowthData(responseData);
                } else if (activeReport === 'sales') {
                    const response = await axios.get(`${api}/reports/sales-by-customer`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const responseData = response.data.$values || response.data;
                    setSalesData(responseData);
                } else if (activeReport === 'invoiceStatus') {
                    const response = await axios.get(`${api}/reports/invoice-status`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const responseData = response.data.$values || response.data;
                    setInvoiceStatusData(responseData);
                }
            } catch (err) {
                console.error("Błąd pobierania danych do raportu:", err);
                setError("Nie udało się załadować danych raportu.");
            } finally {
                setLoading(false);
            }
        };
        fetchReportData();
    }, [api, activeReport]);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-white mb-6">📊 Raporty</h1>

            <div className="mb-6 flex space-x-4">
                <button
                    onClick={() => setActiveReport('customerGrowth')}
                    className={`px-4 py-2 rounded-lg font-semibold ${activeReport === 'customerGrowth' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                >
                    Wzrost Klientów
                </button>
                <button
                    onClick={() => setActiveReport('sales')}
                    className={`px-4 py-2 rounded-lg font-semibold ${activeReport === 'sales' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                >
                    Sprzedaż wg Klienta
                </button>
                <button
                    onClick={() => setActiveReport('invoiceStatus')}
                    className={`px-4 py-2 rounded-lg font-semibold ${activeReport === 'invoiceStatus' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                >
                    Status Faktur
                </button>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                {loading && <p className="text-gray-400 text-center">Generowanie raportu...</p>}

                {error && (
                    <div className="text-center text-red-400">
                        <ExclamationTriangleIcon className="w-12 h-12 mx-auto text-red-500" />
                        <p className="mt-4">{error}</p>
                    </div>
                )}

                {!loading && !error && activeReport === 'customerGrowth' && (
                    <>
                        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                            <ChartBarIcon className="w-6 h-6 mr-3 text-green-400" />
                            Wzrost liczby klientów w czasie
                        </h2>
                        <div className="flex justify-center items-center" style={{ height: 400 }}>
                            <BarChart
                                width={700}
                                height={400}
                                data={customerGrowthData}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                                <XAxis dataKey="month" stroke="#A0AEC0" />
                                <YAxis stroke="#A0AEC0" />
                                <Tooltip contentStyle={{ backgroundColor: '#2D3748', border: 'none' }} />
                                <Legend />
                                <Bar dataKey="count" fill="#4299E1" name="Nowi klienci" />
                            </BarChart>
                        </div>
                    </>
                )}

                {!loading && !error && activeReport === 'sales' && (
                    <>
                        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                            <CurrencyDollarIcon className="w-6 h-6 mr-3 text-yellow-400" />
                            Sprzedaż według klienta
                        </h2>
                        <div className="flex justify-center items-center" style={{ height: 400 }}>
                            <BarChart
                                width={700}
                                height={400}
                                data={salesData}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                                <XAxis dataKey="customerName" stroke="#A0AEC0" />
                                <YAxis stroke="#A0AEC0" />
                                <Tooltip contentStyle={{ backgroundColor: '#2D3748', border: 'none' }} />
                                <Legend />
                                <Bar dataKey="totalAmount" fill="#F6AD55" name="Całkowita kwota" />
                            </BarChart>
                        </div>
                    </>
                )}

                {!loading && !error && activeReport === 'invoiceStatus' && (
                    <>
                        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                            <DocumentTextIcon className="w-6 h-6 mr-3 text-purple-400" />
                            Status faktur
                        </h2>
                        <div className="flex justify-center items-center" style={{ height: 400 }}>
                            <PieChart width={400} height={400}>
                                <Pie
                                    data={invoiceStatusData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={150}
                                    fill="#8884d8"
                                    dataKey="count"
                                    nameKey="status"
                                >
                                    {invoiceStatusData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#2D3748', border: 'none' }} />
                                <Legend />
                            </PieChart>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
