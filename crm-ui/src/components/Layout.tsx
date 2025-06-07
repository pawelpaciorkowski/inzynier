import { useState, type JSX } from "react";
import { useRef, useEffect } from "react";
import { Link, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import HomeIcon from '@heroicons/react/24/solid/HomeIcon';
import UsersIcon from '@heroicons/react/24/solid/UsersIcon';
import UserCircleIcon from '@heroicons/react/24/solid/UserCircleIcon';
import CheckCircleIcon from '@heroicons/react/24/solid/CheckCircleIcon';
import { ClipboardDocumentListIcon, CalendarDaysIcon, DocumentDuplicateIcon, ChatBubbleLeftRightIcon, Cog6ToothIcon } from "@heroicons/react/16/solid";
import { Modal } from './Modal';

export default function Layout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const navRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (navRef.current && !navRef.current.contains(e.target as Node)) {
                setActiveMenu(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleMenu = (menu: string) => {
        setActiveMenu(prev => (prev === menu ? null : menu));
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
                <h1 className="text-2xl font-extrabold tracking-wide text-indigo-400">
                    CRM Panel
                </h1>
                <div className="flex items-center gap-6 text-sm">
                    <span>
                        Zalogowano jako: <strong className="text-white">{user?.username}</strong> ({user?.role})
                    </span>
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
                            { to: "/klienci/dodaj", text: "Dodaj klienta" },
                        ])}

                        {renderMenu("uzytkownicy", <UserCircleIcon className="h-5 w-5 inline mr-2" />, "Użytkownicy", [
                            { to: "/uzytkownicy", text: "Lista użytkowników" },
                            { to: "/uzytkownicy/dodaj", text: "Dodaj użytkownika" },
                            { to: "/role", text: "Role" },
                            { to: "/grupy", text: "Grupy" },
                        ])}

                        {renderMenu("zadania", <CheckCircleIcon className="h-5 w-5 inline mr-2" />, "Zadania", [
                            { to: "/zadania", text: "Moje zadania" },
                            { to: "/zadania/wszystkie", text: "Wszystkie zadania" },
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
                            { to: "/raporty", text: "Raporty" },
                            { to: "/eksporty", text: "Eksporty" },
                        ])}

                        {renderMenu("komunikacja", <ChatBubbleLeftRightIcon className="h-5 w-5 inline mr-2" />, "Komunikacja", [
                            { to: "/wiadomosci", text: "Wiadomości" },
                            { to: "/notatki", text: "Notatki" },
                            { to: "/powiadomienia", text: "Powiadomienia" },
                        ])}

                        {renderMenu("system", <Cog6ToothIcon className="h-5 w-5 inline mr-2" />, "System", [
                            { to: "/logowania", text: "Historia logowań" },
                            { to: "/logi", text: "Logi systemowe" },
                            { to: "/ustawienia", text: "Ustawienia" },
                        ])}
                    </nav>
                </aside>

                <main className="flex-1 p-10 bg-gray-900 border-l border-gray-700 overflow-auto">
                    <Outlet />
                </main>
                <Modal />
            </div>
        </div>
    );
}