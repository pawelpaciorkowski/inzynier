import { Link } from "react-router-dom";

interface UserDashboardProps {
    data: {
        tasksCount: number;
        messagesCount: number;
        remindersCount: number;
        loginHistory: { date: string; ipAddress: string }[];
    };
}

export default function UserDashboard({ data }: UserDashboardProps) {
    // Sprawdź czy data nie jest null
    if (!data) {
        return (
            <div className="space-y-8">
                <div className="text-center text-gray-400">
                    <p>Ładowanie danych...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <DashboardWidget title="Twoje zadania" count={data.tasksCount} to="/zadania" />
                <DashboardWidget title="Nowe wiadomości" count={data.messagesCount} to="/wiadomosci" />
                <DashboardWidget title="Przypomnienia" count={data.remindersCount} to="/przypomnienia" />
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-semibold text-indigo-400 mb-4">Ostatnie logowania</h2>
                <ul className="divide-y divide-gray-700 max-h-56 overflow-y-auto">
                    {Array.isArray(data.loginHistory) && data.loginHistory.length > 0 ? (
                        data.loginHistory.map((entry, index) => (
                            <li
                                key={index}
                                className="py-3 flex justify-between text-sm text-gray-300 hover:bg-gray-700 rounded transition"
                            >
                                <span>{new Date(entry.date.endsWith('Z') ? entry.date : entry.date + 'Z').toLocaleString('pl-PL')}</span>
                                <span>{entry.ipAddress}</span>
                            </li>
                        ))
                    ) : (
                        <li className="py-4 text-center text-gray-400">Brak danych logowania</li>
                    )}
                </ul>

            </div>
        </div>
    );
}

function DashboardWidget({ title, count, to }: { title: string; count: number; to?: string }) {
    const content = (
        <div className="p-6 bg-gray-800 rounded-lg border border-gray-700 shadow-lg flex flex-col justify-center items-center text-center transition-transform hover:scale-[1.03]">
            <h2 className="text-xl font-semibold text-indigo-400 mb-2">{title}</h2>
            <p className="text-4xl font-extrabold text-white">{count}</p>
        </div>
    );

    if (to) {
        return <Link to={to}>{content}</Link>;
    }
    return content;
}
