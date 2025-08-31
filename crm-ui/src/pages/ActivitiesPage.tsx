import { useEffect, useState } from 'react';
import axios from 'axios';
import { ListBulletIcon } from '@heroicons/react/24/outline';

interface Activity {
    id: number;
    note: string;
    createdAt: string;
    userName: string;
    customerName: string;
}

export function ActivitiesPage() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const api = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchActivities = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await axios.get(`${api}/activities`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setActivities(response.data.$values || response.data);
            } catch (error) {
                console.error("Błąd pobierania aktywności:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchActivities();
    }, [api]);

    if (loading) return <p className="p-6 text-gray-400">Wczytywanie aktywności...</p>;

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-white mb-6">Ostatnie aktywności</h1>
            <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
                <ul className="divide-y divide-gray-700">
                    {activities.map(activity => (
                        <li key={activity.id} className="py-4">
                            <div className="flex space-x-3">
                                <div className="flex-shrink-0">
                                    <ListBulletIcon className="h-6 w-6 text-gray-400" />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-medium text-white">{activity.note}</h3>
                                        <p className="text-sm text-gray-500">{new Date(activity.createdAt.endsWith('Z') ? activity.createdAt : activity.createdAt + 'Z').toLocaleString('pl-PL')}</p>
                                    </div>
                                    <p className="text-sm text-gray-400">
                                        Użytkownik: <span className="font-semibold">{activity.userName}</span> | Klient: <span className="font-semibold">{activity.customerName}</span>
                                    </p>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default ActivitiesPage;