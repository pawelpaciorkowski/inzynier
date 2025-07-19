import { Link } from "react-router-dom";

interface SalesDashboardProps {
    data: {
        tasksCount: number;
        messagesCount: number;
        remindersCount: number;
        recentMeetings: {
            id: number;
            topic: string;
            scheduledAt: string;
            customerName: string;
        }[];
        recentNotes: {
            id: number;
            content: string;
            createdAt: string;
            customerName: string;
        }[];
        recentCustomers: {
            id: number;
            name: string;
            company: string | null;
            createdAt: string;
        }[];
        recentTasks: {
            id: number;
            title: string;
            dueDate: string | null;
            completed: boolean;
            customerName: string;
        }[];
    };
}

export default function SalesDashboard({ data }: SalesDashboardProps) {
    // Zabezpieczenie przed null/undefined
    if (!data) {
        return (
            <div className="text-center text-gray-400 p-8">
                Ładowanie danych dashboardu...
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Statystyki */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <DashboardWidget title="Twoje zadania" count={data.tasksCount || 0} to="/zadania" />
                <DashboardWidget title="Nowe wiadomości" count={data.messagesCount || 0} to="/wiadomosci" />
                <DashboardWidget title="Przypomnienia" count={data.remindersCount || 0} to="/przypomnienia" />
            </div>

            {/* Sekcje z ostatnimi danymi */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Ostatnie spotkania */}
                <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-semibold text-indigo-400">Ostatnie spotkania</h2>
                        <Link to="/spotkania" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium">
                            Zobacz wszystkie
                        </Link>
                    </div>
                    <ul className="divide-y divide-gray-700 max-h-56 overflow-y-auto">
                        {data.recentMeetings && data.recentMeetings.length > 0 ? (
                            data.recentMeetings.map((meeting) => (
                                <li key={meeting.id} className="py-3">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h3 className="text-sm font-medium text-gray-200">{meeting.topic || 'Brak tematu'}</h3>
                                            <p className="text-xs text-gray-400 mt-1">{meeting.customerName || 'Brak klienta'}</p>
                                        </div>
                                        <span className="text-xs text-gray-500 ml-2">
                                            {new Date(meeting.scheduledAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <li className="py-4 text-center text-gray-400">Brak spotkań</li>
                        )}
                    </ul>
                </div>

                {/* Ostatnie notatki */}
                <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-semibold text-indigo-400">Ostatnie notatki</h2>
                        <Link to="/notatki" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium">
                            Zobacz wszystkie
                        </Link>
                    </div>
                    <ul className="divide-y divide-gray-700 max-h-56 overflow-y-auto">
                        {data.recentNotes && data.recentNotes.length > 0 ? (
                            data.recentNotes.map((note) => (
                                <li key={note.id} className="py-3">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-200 line-clamp-2">{note.content || 'Brak treści'}</p>
                                            <p className="text-xs text-gray-400 mt-1">{note.customerName || 'Brak klienta'}</p>
                                        </div>
                                        <span className="text-xs text-gray-500 ml-2">
                                            {new Date(note.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <li className="py-4 text-center text-gray-400">Brak notatek</li>
                        )}
                    </ul>
                </div>

                {/* Ostatni klienci */}
                <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-semibold text-indigo-400">Ostatni klienci</h2>
                        <Link to="/klienci" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium">
                            Zobacz wszystkich
                        </Link>
                    </div>
                    <ul className="divide-y divide-gray-700 max-h-56 overflow-y-auto">
                        {data.recentCustomers && data.recentCustomers.length > 0 ? (
                            data.recentCustomers.map((customer) => (
                                <li key={customer.id} className="py-3">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h3 className="text-sm font-medium text-gray-200">{customer.name || 'Brak nazwy'}</h3>
                                            {customer.company && (
                                                <p className="text-xs text-gray-400 mt-1">{customer.company}</p>
                                            )}
                                        </div>
                                        <span className="text-xs text-gray-500 ml-2">
                                            {new Date(customer.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <li className="py-4 text-center text-gray-400">Brak klientów</li>
                        )}
                    </ul>
                </div>

                {/* Ostatnie zadania */}
                <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-semibold text-indigo-400">Ostatnie zadania</h2>
                        <Link to="/zadania" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium">
                            Zobacz wszystkie
                        </Link>
                    </div>
                    <ul className="divide-y divide-gray-700 max-h-56 overflow-y-auto">
                        {data.recentTasks && data.recentTasks.length > 0 ? (
                            data.recentTasks.map((task) => (
                                <li key={task.id} className="py-3">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className={`text-sm font-medium ${task.completed ? 'text-gray-500 line-through' : 'text-gray-200'}`}>
                                                    {task.title}
                                                </h3>
                                                {task.completed && (
                                                    <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">✓</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-400 mt-1">{task.customerName}</p>
                                        </div>
                                        {task.dueDate && (
                                            <span className={`text-xs ml-2 px-2 py-1 rounded ${task.completed
                                                ? 'text-gray-500'
                                                : new Date(task.dueDate) < new Date()
                                                    ? 'text-red-400 bg-red-900/20'
                                                    : 'text-gray-500'
                                                }`}>
                                                {new Date(task.dueDate).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                </li>
                            ))
                        ) : (
                            <li className="py-4 text-center text-gray-400">Brak zadań</li>
                        )}
                    </ul>
                </div>
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