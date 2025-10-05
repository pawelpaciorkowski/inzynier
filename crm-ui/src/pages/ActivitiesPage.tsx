import { useEffect, useState } from 'react';
import api from '../services/api';
import { ListBulletIcon } from '@heroicons/react/24/outline';

interface Activity {
    id: number;
    title: string;
    description?: string;
    activityDate: string;
    customerId?: number;
    customerName?: string;
    userId: number;
}

export function ActivitiesPage() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const response = await api.get('/Activities/');
                const data = response.data;

                if (data && Array.isArray((data).$values)) {
                    setActivities((data).$values);
                } else if (Array.isArray(data)) {
                    setActivities(data);
                } else {
                    setActivities([]);
                }
            } catch (error) {
                console.error("Błąd pobierania aktywności:", error);
                setActivities([]);
            } finally {
                setLoading(false);
            }
        };
        fetchActivities();
    }, []);

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
                                        <h3 className="text-sm font-medium text-white">{activity.title}</h3>
                                        <p className="text-sm text-gray-500">{activity.activityDate ? new Date(activity.activityDate.endsWith('Z') ? activity.activityDate : activity.activityDate + 'Z').toLocaleString('pl-PL') : 'Brak daty'}</p>
                                    </div>
                                    {activity.description && (
                                        <p className="text-sm text-gray-300">{activity.description}</p>
                                    )}
                                    <p className="text-sm text-gray-400">
                                        Użytkownik ID: <span className="font-semibold">{activity.userId}</span> | Klient: <span className="font-semibold">{activity.customerName || 'Brak'}</span>
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