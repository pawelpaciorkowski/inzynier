import { useState, type JSX, useCallback } from "react";
import { useRef, useEffect } from "react";
import { Link, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import HomeIcon from '@heroicons/react/24/solid/HomeIcon';
import UsersIcon from '@heroicons/react/24/solid/UsersIcon';
import UserCircleIcon from '@heroicons/react/24/solid/UserCircleIcon';
import CheckCircleIcon from '@heroicons/react/24/solid/CheckCircleIcon';
import { ClipboardDocumentListIcon, CalendarDaysIcon, DocumentDuplicateIcon, ChatBubbleLeftRightIcon, Cog6ToothIcon, BellIcon } from "@heroicons/react/24/solid";
import api from '../services/api';
import { formatDistanceToNow } from 'date-fns';
import { pl } from 'date-fns/locale';
import { parseBackendDate } from '../utils/dateUtils';

interface Notification {
    id: number;
    message: string;
    createdAt: string;
    isRead: boolean;
}

interface Reminder {
    id: number;
    note: string;
    remind_at: string;
    user_id: number;
}

export default function Layout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [newNotificationToast, setNewNotificationToast] = useState<Notification | null>(null);
    const navRef = useRef<HTMLDivElement>(null);
    const notificationsRef = useRef<HTMLDivElement>(null);
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [activeReminder, setActiveReminder] = useState<Reminder | null>(null);
    const [shownReminders, setShownReminders] = useState<number[]>(() => {
        const stored = localStorage.getItem('shownReminders');
        return stored ? JSON.parse(stored) : [];
    });
    const [lastCheckedDate, setLastCheckedDate] = useState<string>(() => {
        return localStorage.getItem('lastCheckedDate') || '';
    });
    const [clock, setClock] = useState<string>("");

    useEffect(() => {
        localStorage.setItem('shownReminders', JSON.stringify(shownReminders));
    }, [shownReminders]);

    useEffect(() => {
        if (lastCheckedDate) {
            localStorage.setItem('lastCheckedDate', lastCheckedDate);
        }
    }, [lastCheckedDate]);

    const resetShownRemindersIfNewDay = useCallback(() => {
        const today = new Date().toDateString();
        if (lastCheckedDate !== today) {
            setShownReminders([]);
            setLastCheckedDate(today);
        }
    }, [lastCheckedDate]);

    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            setClock(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        };
        updateClock();
        const interval = setInterval(updateClock, 1000);
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = useCallback(async () => {
        try {
            const response = await api.get('/Notifications/user');
            const data = response.data.$values || response.data;
            const unreadNotifications = data.filter((n: Notification) => !n.isRead);

            // Check for new notifications using a ref to avoid infinite loop
            setNotifications(prevNotifications => {
                const newNotifications = unreadNotifications.filter(
                    (notification: Notification) =>
                        !prevNotifications.some(prev => prev.id === notification.id)
                );

                if (newNotifications.length > 0) {
                    // Show the newest notification as a toast
                    const newestNotification = newNotifications.sort(
                        (a: Notification, b: Notification) =>
                            parseBackendDate(b.createdAt).getTime() - parseBackendDate(a.createdAt).getTime()
                    )[0];

                    setNewNotificationToast(newestNotification);

                    // Auto-hide the toast after 5 seconds
                    setTimeout(() => {
                        setNewNotificationToast(null);
                    }, 5000);
                }

                return unreadNotifications;
            });
        } catch (err) {
            console.error("Błąd pobierania powiadomień:", err);
        }
    }, []);

    const handleMarkAsRead = async (id: number) => {
        try {
            await api.post(`/Notifications/mark-as-read/${id}`, {});
            fetchNotifications();
        } catch (err) {
            console.error("Błąd oznaczania jako przeczytane:", err);
        }
    };

    useEffect(() => {
        const fetchReminders = async () => {
            try {
                const response = await api.get('/Reminders/');
                const data = response.data.$values || response.data;
                setReminders(data);
                setShownReminders([]);
            } catch (error) {
                console.error('Błąd pobierania przypomnień:', error);
            }
        };
        fetchReminders();
        const interval = setInterval(fetchReminders, 2 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (reminders.length > 0) {
            resetShownRemindersIfNewDay();

            const now = new Date();
            const currentMinute = now.getMinutes();
            const currentHour = now.getHours();
            const currentDate = now.toDateString();

            const found = reminders.find(r => {
                if (shownReminders.includes(r.id)) {
                    return false;
                }

                const reminderDate = parseBackendDate(r.remind_at);
                const reminderMinute = reminderDate.getMinutes();
                const reminderHour = reminderDate.getHours();
                const reminderDateStr = reminderDate.toDateString();

                // Sprawdź czy to dokładnie ta sama minuta (bez sekund)
                return reminderDateStr === currentDate &&
                    reminderHour === currentHour &&
                    reminderMinute === currentMinute;
            });

            if (found) {
                setActiveReminder(found);
                setShownReminders(prev => [...prev, found.id]);
            }
        }
    }, [reminders, shownReminders, resetShownRemindersIfNewDay]);

    useEffect(() => {
        const checkReminders = () => {
            resetShownRemindersIfNewDay();

            const now = new Date();
            const currentMinute = now.getMinutes();
            const currentHour = now.getHours();
            const currentDate = now.toDateString();

            if (reminders.length === 0) {
                return;
            }

            const found = reminders.find(r => {
                if (shownReminders.includes(r.id)) {
                    return false;
                }

                const reminderDate = parseBackendDate(r.remind_at);
                const reminderMinute = reminderDate.getMinutes();
                const reminderHour = reminderDate.getHours();
                const reminderDateStr = reminderDate.toDateString();

                const dateMatches = reminderDateStr === currentDate;
                const hourMatches = reminderHour === currentHour;
                const minuteMatches = reminderMinute === currentMinute;

                return dateMatches && hourMatches && minuteMatches;
            });

            if (found) {
                setActiveReminder(found);
                setShownReminders(prev => [...prev, found.id]);
            }
        };

        checkReminders();
        const interval = setInterval(checkReminders, 60 * 1000);

        return () => clearInterval(interval);
    }, [reminders, shownReminders]);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (navRef.current && !navRef.current.contains(e.target as Node)) {
                setActiveMenu(null);
            }
            if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
                setShowNotificationsDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleMenu = (menu: string) => {
        setActiveMenu(prev => (prev === menu ? null : menu));
    };

    const toggleNotificationsDropdown = () => {
        setShowNotificationsDropdown(prev => !prev);
    };

    const renderMenu = (menu: string, icon: JSX.Element, label: string, links: { to: string, text: string }[]) => (
        <div>
            <button
                onClick={() => toggleMenu(menu)}
                className="w-full text-left cursor-pointer hover:text-indigo-400 transition-colors"
            >
                {icon} {label}
            </button>
            {activeMenu === menu && (
                <ul className="ml-6 mt-2 space-y-1 text-sm">
                    {links.map(link => (
                        <li key={link.to}>
                            <Link to={link.to} className="hover:text-indigo-400">{link.text}</Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );

    return (
        <div className="min-h-screen flex flex-col bg-gray-900 text-gray-300">
            <header className="bg-gray-800 px-8 py-4 flex justify-between items-center shadow-md border-b border-gray-700">
                <Link to="/dashboard" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                    <img src="/crm.png" alt="CRM Logo" className="h-8 w-8" />
                    <h1 className="text-2xl font-extrabold tracking-wide text-indigo-400">
                        CRM Panel
                    </h1>
                </Link>
                <div className="flex items-center gap-6 text-sm">
                    <div className="relative" ref={notificationsRef}>
                        <button onClick={toggleNotificationsDropdown} className="relative p-2 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                            <BellIcon className="h-6 w-6" />
                            {notifications.length > 0 && (
                                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">{notifications.length}</span>
                            )}
                        </button>
                        {showNotificationsDropdown && (
                            <div className="absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-gray-700 ring-1 ring-black ring-opacity-5 z-50">
                                <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                                    {notifications.length === 0 ? (
                                        <p className="block px-4 py-2 text-sm text-gray-300">Brak nowych powiadomień.</p>
                                    ) : (
                                        notifications.slice(0, 5).map((notification) => (
                                            <div key={notification.id} className="block px-4 py-2 text-sm text-gray-300 border-b border-gray-600 last:border-b-0">
                                                <p>{notification.message}</p>
                                                <p className="text-xs text-gray-400">{formatDistanceToNow(parseBackendDate(notification.createdAt), { addSuffix: true, locale: pl })}</p>
                                                {!notification.isRead && (
                                                    <button
                                                        onClick={() => handleMarkAsRead(notification.id)}
                                                        className="mt-1 text-xs text-blue-400 hover:text-blue-300"
                                                    >
                                                        Oznacz jako przeczytane
                                                    </button>
                                                )}
                                            </div>
                                        ))
                                    )}
                                    <Link to="/powiadomienia" className="block px-4 py-2 text-sm text-blue-400 hover:bg-gray-600 text-center">
                                        Zobacz wszystkie powiadomienia
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                    <span>
                        Zalogowano jako: <strong className="text-white">{user?.username}</strong> ({user?.role})
                    </span>
                    <span className="font-mono text-lg text-indigo-300">{clock}</span>
                    <button
                        onClick={() => {
                            logout();
                            navigate("/");
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md shadow-sm transition-colors duration-200"
                    >
                        Wyloguj
                    </button>
                </div>
            </header>

            <div className="flex flex-1">
                <aside ref={navRef} className="w-64 bg-gray-850 p-6 space-y-8 shadow-lg border-r border-gray-700 text-gray-300">
                    <nav className="flex flex-col space-y-4 text-lg font-medium">

                        <Link to="/dashboard" className="hover:text-indigo-400 transition-colors">
                            <HomeIcon className="h-5 w-5 inline mr-2" /> Dashboard
                        </Link>

                        {renderMenu("klienci", <UsersIcon className="h-5 w-5 inline mr-2" />, "Klienci", [
                            { to: "/klienci", text: "Lista klientów" },
                            { to: "/klienci/tagi", text: "Tagi" },
                        ])}

                        {user?.role === 'Admin' && renderMenu("uzytkownicy", <UserCircleIcon className="h-5 w-5 inline mr-2" />, "Użytkownicy", [
                            { to: "/uzytkownicy", text: "Lista użytkowników" },
                            { to: "/uzytkownicy/dodaj", text: "Dodaj użytkownika" },
                            { to: "/role", text: "Role" },
                            { to: "/grupy", text: "Działy/Zespoły" },
                        ])}

                        {renderMenu("zadania", <CheckCircleIcon className="h-5 w-5 inline mr-2" />, "Zadania", [
                            { to: "/zadania", text: "Moje zadania" },
                            ...(user?.role === 'Admin' ? [{ to: "/zadania/wszystkie", text: "Wszystkie zadania" }] : []),
                            { to: "/aktywnosci", text: "Aktywności" },
                        ])}

                        {renderMenu("dokumenty", <ClipboardDocumentListIcon className="h-5 w-5 inline mr-2" />, "Dokumenty", [
                            { to: "/kontrakty", text: "Kontrakty" },
                            { to: "/faktury", text: "Faktury" },
                            { to: "/platnosci", text: "Płatności" },
                        ])}

                        {renderMenu("kalendarz", <CalendarDaysIcon className="h-5 w-5 inline mr-2" />, "Kalendarz", [
                            { to: "/wydarzenia", text: "Wydarzenia" },
                            { to: "/spotkania", text: "Spotkania" },
                            { to: "/przypomnienia", text: "Przypomnienia" },
                        ])}

                        {renderMenu("szablony", <DocumentDuplicateIcon className="h-5 w-5 inline mr-2" />, "Szablony i eksport", [
                            { to: "/szablony", text: "Szablony" },
                            ...(user?.role === 'Admin' ? [{ to: "/raporty", text: "Raporty" }] : []),
                            { to: "/eksporty", text: "Eksporty" },
                        ])}

                        {renderMenu("komunikacja", <ChatBubbleLeftRightIcon className="h-5 w-5 inline mr-2" />, "Komunikacja", [
                            { to: "/wiadomosci", text: "Wiadomości" },
                            { to: "/notatki", text: "Notatki" },
                            { to: "/powiadomienia", text: "Powiadomienia" },
                        ])}

                        {renderMenu("ustawienia", <Cog6ToothIcon className="h-5 w-5 inline mr-2" />, "Ustawienia", [
                            { to: "/ustawienia", text: "Ustawienia i profil" },
                            ...(user?.role === 'Admin' ? [
                                { to: "/logowania", text: "Historia logowań" },
                                { to: "/logi", text: "Logi systemowe" }
                            ] : [])
                        ])}

                    </nav>
                </aside>

                <main className="flex-1 p-10 bg-gray-900 border-l border-gray-700 overflow-auto">
                    <Outlet context={{ fetchNotifications }} />
                </main>
            </div>
            {activeReminder && (
                <div className="fixed top-4 right-4 bg-blue-700 text-white p-4 rounded-lg shadow-lg z-50 animate-fade-in">
                    <strong>⏰ Przypomnienie!</strong>
                    <div className="mt-2">{activeReminder.note}</div>
                    <button className="mt-3 bg-white text-blue-700 px-3 py-1 rounded" onClick={() => setActiveReminder(null)}>
                        Zamknij
                    </button>
                </div>
            )}

            {/* Notification toast */}
            {newNotificationToast && (
                <div className="fixed top-20 right-4 bg-green-700 text-white p-4 rounded-lg shadow-lg z-50 animate-fade-in max-w-sm">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <strong className="block text-sm">🔔 Nowe powiadomienie</strong>
                            <div className="mt-1 text-sm">{newNotificationToast.message}</div>
                            <div className="mt-1 text-xs text-green-200">
                                {formatDistanceToNow(parseBackendDate(newNotificationToast.createdAt), { addSuffix: true, locale: pl })}
                            </div>
                        </div>
                        <button
                            className="ml-2 text-green-200 hover:text-white text-lg"
                            onClick={() => setNewNotificationToast(null)}
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}