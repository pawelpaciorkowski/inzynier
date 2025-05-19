import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import AdminDashboard from "../components/AdminDashboard";
import UserDashboard from "../components/UserDashboard.tsx";

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




export default function DashboardPage() {
    const { user } = useAuth();
    const [dashboardData, setDashboardData] = useState<AdminDashboardData | UserDashboardData | null>(null);

    const isAdmin = user?.role?.toLowerCase() === "admin";



    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem("token");

            const response = await fetch("/api/dashboard", {
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

    if (!dashboardData) {
        return (
            <p className="p-6 text-center text-gray-400 animate-pulse">
                Ładowanie dashboardu...
            </p>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-tr from-gray-900 via-gray-800 to-gray-900 text-gray-200 p-6">
            <h1 className="text-4xl font-extrabold mb-8 text-center text-indigo-400 tracking-wide">
                Panel Główny
            </h1>

            <div className="max-w-7xl mx-auto bg-gray-850 bg-opacity-70 rounded-xl shadow-lg p-8 backdrop-blur-md border border-indigo-700">
                {isAdmin ? (
                    <AdminDashboard data={dashboardData as AdminDashboardData} />
                ) : (
                    <UserDashboard data={dashboardData as UserDashboardData} />
                )}
            </div>
        </div>
    );

}
