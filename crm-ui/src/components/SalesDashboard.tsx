import { Link } from "react-router-dom";
import {
    CheckCircleIcon,
    ChartBarIcon,
    CalendarDaysIcon,
    DocumentTextIcon,
    CreditCardIcon,
    Cog6ToothIcon
} from "@heroicons/react/24/outline";

interface SalesDashboardProps {
    data: {
        tasksCount: number;
        messagesCount: number;
        remindersCount: number;
        invoicesCount: number;
        paymentsCount: number;
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
        <div className="space-y-64">
            {/* Klikalne kafelki funkcji */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <DashboardWidget
                    title="Zadania"
                    count={data.tasksCount || 0}
                    to="/zadania"
                    icon={CheckCircleIcon}
                    color="text-blue-400"
                />
                <DashboardWidget
                    title="Raporty"
                    count={0}
                    to="/raporty"
                    icon={ChartBarIcon}
                    color="text-green-400"
                />
                <DashboardWidget
                    title="Kalendarz"
                    count={data.remindersCount || 0}
                    to="/wydarzenia"
                    icon={CalendarDaysIcon}
                    color="text-purple-400"
                />
                <DashboardWidget
                    title="Faktury"
                    count={data.invoicesCount || 0}
                    to="/faktury"
                    icon={DocumentTextIcon}
                    color="text-yellow-400"
                />
                <DashboardWidget
                    title="Płatności"
                    count={data.paymentsCount || 0}
                    to="/platnosci"
                    icon={CreditCardIcon}
                    color="text-pink-400"
                />
                <DashboardWidget
                    title="Ustawienia"
                    count={0}
                    to="/ustawienia"
                    icon={Cog6ToothIcon}
                    color="text-gray-400"
                />
            </div>



        </div>


    );
}

function DashboardWidget({
    title,
    count,
    to,
    icon: Icon,
    color
}: {
    title: string;
    count: number;
    to?: string;
    icon: React.ElementType;
    color: string;
}) {
    const content = (
        <div className="p-6 bg-gray-800 rounded-lg border border-gray-700 shadow-lg flex flex-col justify-center items-center text-center transition-transform hover:scale-[1.03] hover:bg-gray-750 cursor-pointer">
            <Icon className={`w-8 h-8 ${color} mb-2`} />
            <h2 className="text-lg font-semibold text-indigo-400 mb-1">{title}</h2>
            <p className="text-2xl font-extrabold text-white">{count}</p>
        </div>
    );

    if (to) {
        return <Link to={to}>{content}</Link>;
    }
    return content;
} 