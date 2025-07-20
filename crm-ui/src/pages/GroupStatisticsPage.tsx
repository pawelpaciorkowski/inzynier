
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface GroupStatistics {
    totalMembers: number;
    totalCustomers: number;
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    totalContracts: number;
    totalInvoices: number;
    paidInvoices: number;
    unpaidInvoices: number;
    totalMeetings: number;
    upcomingMeetings: number;
}

// To jest osobny komponent, który będzie używany na stronie statystyk
const StatCard = ({ title, value }: { title: string, value: string | number }) => (
    <div className="bg-gray-700 p-4 rounded-lg shadow-md text-center">
        <p className="text-sm text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
    </div>
);

export function GroupStatisticsPage() {
    const { id } = useParams<{ id: string }>();
    const [stats, setStats] = useState<GroupStatistics | null>(null);
    const [groupName, setGroupName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const api = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const token = localStorage.getItem('token');
        const fetchStats = async () => {
            try {
                const response = await axios.get(`${api}/groups/${id}/statistics`, { headers: { Authorization: `Bearer ${token}` } });
                setStats(response.data);
            } catch {
                setError("Nie udało się pobrać statystyk grupy.");
            }
        };

        const fetchGroupName = async () => {
            try {
                const response = await axios.get(`${api}/groups/${id}`, { headers: { Authorization: `Bearer ${token}` } });
                setGroupName(response.data.name);
            } catch {
                // Ignorujemy błąd, nazwa jest opcjonalna
            }
        };

        setLoading(true);
        Promise.all([fetchStats(), fetchGroupName()]).finally(() => setLoading(false));

    }, [id]);

    if (loading) return <p className="p-6 text-gray-400">Ładowanie statystyk...</p>;
    if (error) return <p className="p-6 text-red-500">{error}</p>;
    if (!stats) return <p className="p-6 text-gray-400">Nie znaleziono statystyk dla tej grupy.</p>;

    return (
        <div className="p-6">
            <div className="flex items-center mb-6">
                <Link to={`/grupy/${id}`} className="text-blue-400 hover:text-blue-300">
                    <ArrowLeftIcon className="w-6 h-6 mr-4" />
                </Link>
                <h1 className="text-3xl font-bold text-white">Statystyki dla grupy: {groupName}</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <StatCard title="Wszyscy członkowie" value={stats.totalMembers} />
                <StatCard title="Przypisani klienci" value={stats.totalCustomers} />
                <StatCard title="Wszystkie zadania" value={stats.totalTasks} />
                <StatCard title="Ukończone zadania" value={stats.completedTasks} />
                <StatCard title="Zadania w toku" value={stats.pendingTasks} />
                <StatCard title="Wszystkie kontrakty" value={stats.totalContracts} />
                <StatCard title="Wszystkie faktury" value={stats.totalInvoices} />
                <StatCard title="Opłacone faktury" value={stats.paidInvoices} />
                <StatCard title="Nieopłacone faktury" value={stats.unpaidInvoices} />
                <StatCard title="Wszystkie spotkania" value={stats.totalMeetings} />
                <StatCard title="Nadchodzące spotkania" value={stats.upcomingMeetings} />
            </div>
        </div>
    );
}
