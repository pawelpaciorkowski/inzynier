import { useEffect, useState, type ReactNode } from 'react';
import api from '../services/api';
import { UsersIcon, DocumentTextIcon, CurrencyDollarIcon, CheckCircleIcon, ClockIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { useModal } from '../context/ModalContext';
import { useAuth } from '../context/AuthContext';

// --- HELPER: Rozpakowywanie $values z obiektów .NET --- 
interface DotNetObject {
    $values?: unknown[];
    [key: string]: unknown;
}

const unwrapValues = (obj: unknown): unknown => {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(unwrapValues);
    }

    const dotNetObj = obj as DotNetObject;
    if (dotNetObj.$values && Array.isArray(dotNetObj.$values)) {
        return dotNetObj.$values.map(unwrapValues);
    }

    const newObj: { [key: string]: unknown } = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            newObj[key] = unwrapValues((obj as Record<string, unknown>)[key]);
        }
    }
    return newObj;
};

// --- INTERFEJSY DANYCH --- 

interface DashboardData {
    totalCustomers: number;
    invoicesCount: number;
    tasksCount: number;
    contractsCount: number;
    paidInvoices: number;
    pendingTasks: number;
    usersCount: number;
    paymentsCount: number;
    systemLogsCount: number;
    totalInvoicesValue: number;
    taskPerUser: Array<{
        username: string;
        totalTasks: number;
        pendingTasks: string;
    }>;
    topGroups: Array<{
        id: number;
        name: string;
        customerCount: number;
        invoiceCount: number;
        taskCount: number;
        contractCount: number;
    }>;
    topTags: Array<{
        id: number;
        name: string;
        color?: string;
        totalUsage: number;
    }>;
}

interface Group {
    id: number;
    name: string;
    memberCount: number;
}

interface Tag {
    id: number;
    name: string;
    totalUsage: number;
}

// Nowe, poprawione interfejsy dla raportów grupowych i tagowych
interface GroupReport {
    summary: {
        totalCustomers: number;
        totalInvoicesSales: number; // Zmienione z totalInvoices
        totalAmount: number;
        totalTasks: number;
        // Dodatkowe pola z sales report summary
        paidAmount: number;
        unpaidAmount: number;
        paidCount: number;
        unpaidCount: number;
        completedTasks: number;
        pendingTasks: number;
        completionRate: number;
        totalContracts: number;
        totalInvoiceValue: number;
        totalPaidValue: number;
    };
    customers: Array<{
        id: number;
        name: string;
        email: string;
        company: string;
        phone: string;
        createdAt: string;
        assignedUser: string;
        tags: string[];
        contractCount: number;
        invoiceCount: number;
        totalInvoiceValue: number;
        paidInvoiceValue: number;
    }>;
    invoices: Array<{
        id: number;
        number: string;
        totalAmount: number;
        isPaid: boolean;
        issuedAt: string;
        dueDate: string;
        customerName: string;
        customerEmail: string;
        createdBy: string;
        tags: string[];
    }>;
    tasks: Array<{
        id: number;
        title: string;
        description: string;
        dueDate: string;
        completed: boolean;
        assignedUser: string;
        customerName: string;
        tags: string[];
    }>;
}

interface TagReport {
    customers: Array<{
        id: number;
        name: string;
        email: string;
        groupName?: string;
    }>;
    invoices: Array<{
        id: number;
        number: string;
        customerName: string;
        totalAmount: number;
        isPaid: boolean; // Dodane pole isPaid
    }>;
    tasks: Array<{
        id: number;
        title: string;
        customerName: string;
        completed: boolean;
    }>;
    contracts: Array<{
        id: number;
        title: string;
        customerName: string;
        contractNumber: string;
    }>;
    meetings: Array<{
        id: number;
        topic: string;
        customerName: string;
        scheduledAt: string;
    }>;
}

// --- KOMPONENT GŁÓWNY --- 

export function ReportsPage() {
    const { user } = useAuth();
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [groups, setGroups] = useState<Group[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
    const [selectedTag, setSelectedTag] = useState<number | null>(null);
    const [groupReport, setGroupReport] = useState<GroupReport | null>(null);
    const [tagReport, setTagReport] = useState<TagReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { openToast } = useModal();

    // --- POBIERANIE DANYCH --- 

    const fetchData = async () => {
        setLoading(true);
        try {
            // Wybierz odpowiedni endpoint dashboard w zależności od roli użytkownika
            const dashboardEndpoint = user?.role === 'Admin' ? '/admin/dashboard' : '/dashboard/user';
            
            const [dashboardRes, groupsRes, tagsRes] = await Promise.all([
                api.get(dashboardEndpoint),
                api.get('/Groups/'),
                api.get('/Tags/')
            ]);

            setDashboardData(unwrapValues(dashboardRes.data) as DashboardData);
            setGroups(unwrapValues(groupsRes.data) as Group[]);
            setTags(unwrapValues(tagsRes.data) as Tag[]);
            setError(null);

        } catch (err) {
            console.error('Błąd podczas ładowania danych początkowych:', err);
            setError('Nie udało się załadować danych. Spróbuj odświeżyć stronę.');
            openToast('Błąd ładowania danych', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchGroupReport = async (groupId: number) => {
        try {
            const [customersRes, salesRes, tasksRes] = await Promise.all([
                api.get(`/reports/groups/${groupId}/customers`),
                api.get(`/reports/groups/${groupId}/sales`),
                api.get(`/reports/groups/${groupId}/tasks`)
            ]);

            // Backend zwraca dane w różnych strukturach
            const customers = Array.isArray(customersRes.data) ? customersRes.data : [];
            const salesData = salesRes.data;
            const tasksData = tasksRes.data;

            setGroupReport({
                summary: {
                    totalCustomers: customers.length,
                    totalInvoicesSales: salesData.totalInvoices || 0,
                    totalAmount: salesData.totalAmount || 0,
                    paidAmount: salesData.paidAmount || 0,
                    unpaidAmount: salesData.unpaidAmount || 0,
                    totalTasks: tasksData.totalTasks || 0,
                    completedTasks: tasksData.completedTasks || 0,
                    pendingTasks: tasksData.pendingTasks || 0,
                    paidCount: 0,
                    unpaidCount: 0,
                    completionRate: 0,
                    totalContracts: 0,
                    totalInvoiceValue: 0,
                    totalPaidValue: 0
                },
                customers: customers,
                invoices: salesData.invoices || [],
                tasks: tasksData.tasks || [],
            });
        } catch (err) {
            console.error(`Błąd ładowania raportu dla grupy ${groupId}:`, err);
            openToast('Nie udało się pobrać raportu grupy', 'error');
        }
    };

    const fetchTagReport = async (tagId: number) => {
        try {
            const [customersRes, invoicesRes, tasksRes, contractsRes, meetingsRes] = await Promise.all([
                api.get(`/reports/tags/${tagId}/customers`),
                api.get(`/reports/tags/${tagId}/invoices`),
                api.get(`/reports/tags/${tagId}/tasks`),
                api.get(`/reports/tags/${tagId}/contracts`),
                api.get(`/reports/tags/${tagId}/meetings`)
            ]);

            setTagReport({
                customers: unwrapValues(customersRes.data) as TagReport['customers'],
                invoices: unwrapValues(invoicesRes.data) as TagReport['invoices'],
                tasks: unwrapValues(tasksRes.data) as TagReport['tasks'],
                contracts: unwrapValues(contractsRes.data) as TagReport['contracts'],
                meetings: unwrapValues(meetingsRes.data) as TagReport['meetings'],
            });
        } catch (err) {
            console.error(`Błąd ładowania raportu dla taga ${tagId}:`, err);
            openToast('Nie udało się pobrać raportu taga', 'error');
        }
    };

    const handleDownloadGroupReportPdf = async (groupId: number, groupName: string) => {
        try {
            const response = await api.get(`/reports/groups/${groupId}/pdf`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `raport_grupy_${groupName.replace(/ /g, '_')}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            openToast('Raport PDF został pobrany', 'success');
        } catch (err) {
            console.error('Błąd podczas pobierania raportu PDF:', err);
            openToast('Nie udało się pobrać raportu PDF', 'error');
        }
    };

    const handleDownloadTagReportPdf = async (tagId: number, tagName: string) => {
        try {
            const response = await api.get(`/reports/tags/${tagId}/pdf`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `raport_taga_${tagName.replace(/ /g, '_')}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            openToast('Raport PDF został pobrany', 'success');
        } catch (err) {
            console.error('Błąd podczas pobierania raportu PDF:', err);
            openToast('Nie udało się pobrać raportu PDF', 'error');
        }
    };

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    useEffect(() => {
        if (selectedGroup) {
            setTagReport(null); // Resetuj raport taga
            fetchGroupReport(selectedGroup);
        } else {
            setGroupReport(null); // Czyść raport po odznaczeniu
        }
    }, [selectedGroup]);

    useEffect(() => {
        if (selectedTag) {
            setGroupReport(null); // Resetuj raport grupy
            fetchTagReport(selectedTag);
        } else {
            setTagReport(null); // Czyść raport po odznaczeniu
        }
    }, [selectedTag]);

    // --- RENDEROWANIE --- 

    if (loading) return <p className="p-6 text-gray-400">Ładowanie raportów...</p>;
    if (error) return <p className="p-6 text-red-500">{error}</p>;
    if (!dashboardData) return <p className="p-6 text-red-500">Brak danych do wyświetlenia.</p>;

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-white mb-8">Raporty i Analizy</h1>

            {/* --- SEKCJA GŁÓWNEGO DASHBOARDU --- */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
                <h2 className="text-xl text-white font-semibold mb-4">Podsumowanie Ogólne</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {/* Kafelki z podsumowaniem */}
                    <StatTile icon={UsersIcon} value={dashboardData.totalCustomers} label="Klienci" color="text-blue-400" />
                    <StatTile icon={DocumentTextIcon} value={dashboardData.invoicesCount} label="Faktury" color="text-green-400" />
                    <StatTile icon={CheckCircleIcon} value={dashboardData.tasksCount} label="Zadania" color="text-yellow-400" />
                    <StatTile icon={CurrencyDollarIcon} value={dashboardData.contractsCount} label="Kontrakty" color="text-purple-400" />
                    <StatTile icon={ClockIcon} value="0" label="Spotkania" color="text-indigo-400" />
                    <StatTile icon={CurrencyDollarIcon} value={`${(dashboardData.totalInvoicesValue || 0).toFixed(2)} PLN`} label="Wartość Faktur" color="text-pink-400" />
                </div>
            </div>

            {/* --- SEKCJA FILTROWANIA --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Filtrowanie po grupach */}
                <div>
                    <label className="block text-lg font-medium text-gray-300 mb-2">Wybierz grupę do analizy</label>
                    <select onChange={(e) => setSelectedGroup(e.target.value ? Number(e.target.value) : null)} className="w-full p-2 bg-gray-700 rounded-md text-white">
                        <option value="">-- Brak --</option>
                        {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                </div>
                {/* Filtrowanie po tagach */}
                <div>
                    <label className="block text-lg font-medium text-gray-300 mb-2">Wybierz tag do analizy</label>
                    <select onChange={(e) => setSelectedTag(e.target.value ? Number(e.target.value) : null)} className="w-full p-2 bg-gray-700 rounded-md text-white">
                        <option value="">-- Brak --</option>
                        {tags.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                </div>
            </div>

            {/* --- SEKCJA WYNIKÓW FILTROWANIA --- */}
            {groupReport && <GroupReportDisplay report={groupReport} groupName={groups.find(g => g.id === selectedGroup)?.name || 'Wybrana Grupa'} onDownloadPdf={() => handleDownloadGroupReportPdf(selectedGroup!, groups.find(g => g.id === selectedGroup)?.name || 'raport_grupy')} />}
            {tagReport && <TagReportDisplay report={tagReport} tagName={tags.find(t => t.id === selectedTag)?.name || 'Wybrany Tag'} onDownloadPdf={() => handleDownloadTagReportPdf(selectedTag!, tags.find(t => t.id === selectedTag)?.name || 'raport_taga')} />}

        </div>
    );
}

// --- KOMPONENTY POMOCNICZE ---

const StatTile = ({ icon: Icon, value, label, color }: { icon: React.ElementType, value: ReactNode, label: string, color: string }) => (
    <div className="bg-gray-700 p-4 rounded-lg text-center">
        <Icon className={`w-8 h-8 ${color} mx-auto mb-2`} />
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className="text-gray-400 text-sm">{label}</div>
    </div>
);

const GroupReportDisplay = ({ report, groupName, onDownloadPdf }: { report: GroupReport, groupName: string, onDownloadPdf: () => void }) => (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg mt-4">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl text-white font-semibold">Raport dla grupy: {groupName}</h2>
            <button onClick={onDownloadPdf} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md flex items-center">
                <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                Pobierz PDF
            </button>
        </div>

        {/* Podsumowanie raportu grupowego */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            <StatTile icon={UsersIcon} value={report.summary.totalCustomers} label="Klienci" color="text-blue-400" />
            <StatTile icon={DocumentTextIcon} value={report.summary.totalInvoicesSales} label="Faktury (Sprzedaż)" color="text-green-400" />
            <StatTile icon={CurrencyDollarIcon} value={`${(report.summary.totalAmount || 0).toLocaleString()} PLN`} label="Wartość Sprzedaży" color="text-purple-400" />
            <StatTile icon={CheckCircleIcon} value={report.summary.totalTasks} label="Zadania" color="text-yellow-400" />
            <StatTile icon={CurrencyDollarIcon} value={`${(report.summary.paidAmount || 0).toLocaleString()} PLN`} label="Opłacone Faktury" color="text-green-400" />
            <StatTile icon={CurrencyDollarIcon} value={`${(report.summary.unpaidAmount || 0).toLocaleString()} PLN`} label="Nieopłacone Faktury" color="text-red-400" />
            <StatTile icon={CheckCircleIcon} value={report.summary.completedTasks} label="Ukończone Zadania" color="text-green-400" />
            <StatTile icon={ClockIcon} value={report.summary.pendingTasks} label="Zadania w toku" color="text-orange-400" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ReportCard title="Klienci" data={report.customers} renderItem={(item: ReportItem) => (
                <div>
                    <div className="font-medium">{item.name as string} ({item.company as string})</div>
                    <div className="text-gray-400 text-sm">{item.email as string} | {item.phone as string}</div>
                    <div className="text-gray-400 text-xs">Faktur: {item.invoiceCount as number} ({(item.totalInvoiceValue as number || 0).toLocaleString()} PLN)</div>
                    {(item.tags as string[])?.length > 0 && <div className="text-gray-500 text-xs">Tagi: {(item.tags as string[]).join(', ')}</div>}
                </div>
            )} />
            <ReportCard title="Faktury" data={report.invoices} renderItem={(item: ReportItem) => (
                <div>
                    <div className="font-medium">{item.number as string} ({(item.totalAmount as number || 0).toLocaleString()} PLN)</div>
                    <div className="text-gray-400 text-sm">{item.customerName as string} ({item.customerEmail as string})</div>
                    <div className={`text-xs ${item.isPaid ? 'text-green-400' : 'text-red-400'}`}>
                        {item.isPaid ? 'Opłacona' : 'Nieopłacona'} | {new Date(item.issuedAt as string).toLocaleDateString()} - {new Date(item.dueDate as string).toLocaleDateString()}
                    </div>
                    {(item.tags as string[])?.length > 0 && <div className="text-gray-500 text-xs">Tagi: {(item.tags as string[]).join(', ')}</div>}
                </div>
            )} />
            <ReportCard title="Zadania" data={report.tasks} renderItem={(item: ReportItem) => (
                <div>
                    <div className="font-medium">{item.title as string}</div>
                    <div className="text-gray-400 text-sm">{item.customerName as string} | {item.assignedUser as string}</div>
                    <div className={`text-xs ${item.completed ? 'text-green-400' : 'text-yellow-400'}`}>
                        {item.completed ? 'Ukończone' : 'Oczekujące'} | Termin: {item.dueDate ? new Date(item.dueDate as string).toLocaleDateString() : 'Brak'}
                    </div>
                    {(item.tags as string[])?.length > 0 && <div className="text-gray-500 text-xs">Tagi: {(item.tags as string[]).join(', ')}</div>}
                </div>
            )} />
        </div>
    </div>
);

const TagReportDisplay = ({ report, tagName, onDownloadPdf }: { report: TagReport, tagName: string, onDownloadPdf: () => void }) => {
    // --- Obliczenia summary ---
    const totalCustomers = report.customers.length;
    const totalInvoices = report.invoices.length;
    const totalAmount = report.invoices.reduce((acc, i) => acc + i.totalAmount, 0);
    const paidInvoices = report.invoices.filter(i => i.isPaid);
    const unpaidInvoices = report.invoices.filter(i => !i.isPaid);
    const paidAmount = paidInvoices.reduce((acc, i) => acc + i.totalAmount, 0);
    const unpaidAmount = unpaidInvoices.reduce((acc, i) => acc + i.totalAmount, 0);
    const totalTasks = report.tasks.length;
    const completedTasks = report.tasks.filter(t => t.completed).length;
    const pendingTasks = totalTasks - completedTasks;

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg mt-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl text-white font-semibold">Raport dla taga: {tagName}</h2>
                <button onClick={onDownloadPdf} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md flex items-center">
                    <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                    Pobierz PDF
                </button>
            </div>

            {/* Podsumowanie raportu tagowego */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                <StatTile icon={UsersIcon} value={totalCustomers} label="Klienci" color="text-blue-400" />
                <StatTile icon={DocumentTextIcon} value={totalInvoices} label="Faktury" color="text-green-400" />
                <StatTile icon={CurrencyDollarIcon} value={`${(totalAmount || 0).toLocaleString()} PLN`} label="Wartość Faktur" color="text-purple-400" />
                <StatTile icon={CheckCircleIcon} value={totalTasks} label="Zadania" color="text-yellow-400" />
                <StatTile icon={CurrencyDollarIcon} value={`${paidAmount.toLocaleString()} PLN`} label="Opłacone Faktury" color="text-green-400" />
                <StatTile icon={CurrencyDollarIcon} value={`${unpaidAmount.toLocaleString()} PLN`} label="Nieopłacone Faktury" color="text-red-400" />
                <StatTile icon={CheckCircleIcon} value={completedTasks} label="Ukończone Zadania" color="text-green-400" />
                <StatTile icon={ClockIcon} value={pendingTasks} label="Zadania w toku" color="text-orange-400" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <ReportCard title="Klienci" data={report.customers} renderItem={(item: ReportItem) => <div>{item.name as string}</div>} />
                <ReportCard title="Faktury" data={report.invoices} renderItem={(item: ReportItem) => (
                    <div>
                        <div className="font-medium">{item.number as string} ({(item.totalAmount as number || 0).toLocaleString()} PLN)</div>
                        <div className="text-gray-400 text-sm">{item.customerName as string}</div>
                        <div className={`text-xs ${item.isPaid ? 'text-green-400' : 'text-red-400'}`}>{item.isPaid ? 'Opłacona' : 'Nieopłacona'}</div>
                    </div>
                )} />

                <ReportCard title="Kontrakty" data={report.contracts} renderItem={(item: ReportItem) => <div>{item.title as string}</div>} />

            </div>
        </div>
    );
};


interface ReportItem {
    id?: number;
    [key: string]: unknown;
}

const ReportCard = ({ title, data, renderItem }: { title: string, data: unknown[], renderItem: (item: ReportItem) => ReactNode }) => (
    <div className="bg-gray-700 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-4">{title} ({data?.length || 0})</h3>
        <div className="space-y-2 max-h-60 overflow-y-auto">
            {data && data.length > 0 ? (
                data.map((item, index) => <div key={(item as ReportItem)?.id || index} className="bg-gray-600 p-2 rounded">{renderItem(item as ReportItem)}</div>)
            ) : (
                <p className="text-gray-400">Brak danych.</p>
            )}
        </div>
    </div>
);