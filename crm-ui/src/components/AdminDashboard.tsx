/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link } from "react-router-dom";

interface AdminDashboardProps {
    data: {
        contractsCount: number;
        tasksCount: number;
        invoicesCount: number;
        paymentsCount: number;
        usersCount: number;
        systemLogsCount: number;
        taskPerUser?: { username: string; totalTasks: number; pendingTasks: number }[] | { $id: string; $values: { username: string; totalTasks: number; pendingTasks: number }[] };
    };
}

export default function AdminDashboard({ data }: AdminDashboardProps) {
    // Sprawdź czy data nie jest null
    if (!data) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <div className="col-span-full text-center text-gray-400">
                    <p>Ładowanie danych...</p>
                </div>
            </div>
        );
    }

    const tasks = (data.taskPerUser && !Array.isArray(data.taskPerUser) && (data.taskPerUser as any).$values)
        ? (data.taskPerUser as any).$values
        : (Array.isArray(data.taskPerUser) ? data.taskPerUser : []);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <DashboardWidget title="Umowy" count={data.contractsCount} to="/kontrakty" />
            <DashboardWidget title="Faktury" count={data.invoicesCount} to="/faktury" />
            <DashboardWidget title="Płatności" count={data.paymentsCount} to="/platnosci" />
            <DashboardWidget title="Użytkownicy" count={data.usersCount} to="/uzytkownicy" />
            <DashboardWidget title="Logi systemowe" count={data.systemLogsCount} to="/logi" />
            <DashboardWidget title="Zadania" count={data.tasksCount} to="/zadania" />

            <div className="col-span-full mt-8">
                <h3 className="text-lg font-semibold text-gray-300 mb-2">
                    Zadania wg użytkownika
                </h3>

                {tasks.length > 0 ? (
                    <ul className="divide-y divide-gray-700 border border-gray-700 rounded-md overflow-hidden">
                        {tasks.map((entry: any, index: any) => (
                            <li
                                key={index}
                                className="flex justify-between px-4 py-2 bg-gray-800 hover:bg-gray-700"
                            >
                                <span className="text-indigo-400 font-medium">
                                    {entry.username || <i>Nieznany</i>}
                                </span>
                                <span className="text-gray-400">{entry.totalTasks || entry.count || 0} zadań</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500 italic">Brak przypisanych zadań.</p>
                )}
            </div>
        </div>
    );
}

function DashboardWidget({
    title,
    count,
    to,
}: {
    title: string;
    count: number;
    to?: string;
}) {
    const content = (
        <div className="p-6 bg-gray-800 rounded-lg border border-gray-700 shadow-lg flex flex-col justify-center items-center text-center transition-transform hover:scale-[1.03]">
            <h2 className="text-xl font-semibold text-indigo-400 mb-2">{title}</h2>
            <p className="text-4xl font-extrabold text-white">{count}</p>
        </div>
    );

    return to ? <Link to={to}>{content}</Link> : content;
}
