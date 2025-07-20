import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import AdminDashboard from "../components/AdminDashboard";
import UserDashboard from "../components/UserDashboard.tsx";
import SalesDashboard from "../components/SalesDashboard";

type AdminDashboardData = {
    contractsCount: number;
    tasksCount: number;
    invoicesCount: number;
    paymentsCount: number;
    usersCount: number;
    systemLogsCount: number;
    taskPerUser: { username: string; count: number }[];
};

type UserDashboardData = {
    tasksCount: number;
    messagesCount: number;
    remindersCount: number;
    loginHistory: { date: string; ipAddress: string }[];
};

type SalesDashboardData = {
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




export default function DashboardPage() {
    const { user } = useAuth();
    const [dashboardData, setDashboardData] = useState<AdminDashboardData | UserDashboardData | SalesDashboardData | null>(null);

    const isAdmin = user?.role?.toLowerCase() === "admin";
    const isSales = user?.role?.toLowerCase() === "sprzedawca";



    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem("token");

            const response = await fetch("/api/admin/dashboard", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                console.error("Błąd HTTP", response.status);
                return;
            }

            const data = await response.json();
            console.log("Dashboard data:", data);
            setDashboardData(data);
        };

        fetchData();
    }, []);



    return (
        <div className="min-h-screen bg-gradient-to-tr from-gray-900 via-gray-800 to-gray-900 text-gray-200 p-6">
            <h1 className="text-4xl font-extrabold mb-8 text-center text-indigo-400 tracking-wide">
                Panel Główny
            </h1>

            <div className="max-w-7xl mx-auto bg-gray-850 bg-opacity-70 rounded-xl shadow-lg p-8 backdrop-blur-md border border-indigo-700">
                {isAdmin ? (
                    <AdminDashboard data={dashboardData as AdminDashboardData} />
                ) : isSales ? (
                    <SalesDashboard data={dashboardData as SalesDashboardData} />
                ) : (
                    <UserDashboard data={dashboardData as UserDashboardData} />
                )}
            </div>
        </div>
    );

}
