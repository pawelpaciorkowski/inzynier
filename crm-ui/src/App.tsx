import { Routes, Route } from "react-router-dom"; // BrowserRouter is removed from here
import { AuthProvider } from "./context/AuthContext";
import { ModalProvider } from './context/ModalContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ClientsPage from "./pages/ClientsPage";
import UsersPage from "./pages/UsersPage";
import TasksPage from "./pages/TasksPage";
import ActivitiesPage from "./pages/ActivitiesPage";
import PrivateRoute from "./components/PrivateRoute";
import Layout from "./components/Layout";
import { ClientTagsPage } from "./pages/ClientTagsPage";
import { AddClientPage } from "./pages/AddClientPage";
import { AddUserPage } from "./pages/AddUserPage";
import { RolesPage } from "./pages/RolesPage";
import { GroupsPage } from "./pages/GroupsPage";
import { GroupDetailsPage } from "./pages/GroupDetailsPage";
import { GroupStatisticsPage } from "./pages/GroupStatisticsPage";
import { AllTasksPage } from "./pages/AllTasksPage";
import { ContractsPage } from "./pages/ContractsPage";
import { InvoicesPage } from "./pages/InvoicesPage";
import { PaymentsPage } from "./pages/PaymentsPage";
import { CalendarEventsPage } from "./pages/CalendarEventsPage";
import { MeetingsPage } from "./pages/MeetingsPage";
import { RemindersPage } from "./pages/RemindersPage";
import { AddCalendarEventPage } from "./pages/AddCalendarEventPage";
import { EditCalendarEventPage } from "./pages/EditCalendarEventPage";
import { TemplatesPage } from "./pages/TemplatesPage";
import { ReportsPage } from "./pages/ReportsPage";
import { ExportsPage } from "./pages/ExportsPage";
import { MessagesPage } from "./pages/MessagesPage";
import { NotesPage } from "./pages/NotesPage";
import { AddNotePage } from "./pages/AddNotePage";
import { EditNotePage } from "./pages/EditNotePage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { LoginHistoryPage } from "./pages/LoginHistoryPage";
import { LogsPage } from "./pages/LogsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { AddInvoicePage } from "./pages/AddInvoicePage";
import { AddPaymentPage } from "./pages/AddPaymentPage";
import { EditPaymentPage } from "./pages/EditPaymentPage";
import { AddMeetingPage } from "./pages/AddMeetingPage";
import { EditMeetingPage } from "./pages/EditMeetingPage";
import { AddContractPage } from './pages/AddContractPage';
import { EditContractPage } from './pages/EditContractPage';
import { EditClientPage } from './pages/EditClientPage';
import { EditUserPage } from "./pages/EditUserPage";
import { InvoiceDetailsPage } from './pages/InvoiceDetailsPage';
import EditInvoicePage from './pages/EditInvoicePage';
import './index.css';

function App() {
  return (
    <ModalProvider>
      <AuthProvider>
        {/* The <BrowserRouter> wrapper is removed from here */}
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/klienci" element={<ClientsPage />} />
            <Route path="/uzytkownicy" element={<UsersPage />} />
            <Route path="/zadania" element={<TasksPage />} />
            <Route path="/aktywnosci" element={<ActivitiesPage />} />
            <Route path="/klienci/tagi" element={<ClientTagsPage />} />
            <Route path="/klienci/dodaj" element={<AddClientPage />} />
            <Route path="/klienci/edytuj/:id" element={<PrivateRoute><EditClientPage /></PrivateRoute>} />
            <Route path="/uzytkownicy/dodaj" element={<AddUserPage />} />
            <Route path="/uzytkownicy/edytuj/:id" element={<EditUserPage />} />
            <Route path="/role" element={<RolesPage />} />
            <Route path="/grupy" element={<GroupsPage />} />
            <Route path="/grupy/:id" element={<GroupDetailsPage />} />
            <Route path="/grupy/:id/statystyki" element={<GroupStatisticsPage />} />
            <Route path="/zadania/wszystkie" element={<AllTasksPage />} />
            <Route path="/kontrakty" element={<ContractsPage />} />
            <Route path="/kontrakty/dodaj" element={<PrivateRoute><AddContractPage /></PrivateRoute>} />
            <Route path="/kontrakty/edytuj/:id" element={<PrivateRoute><ErrorBoundary><EditContractPage /></ErrorBoundary></PrivateRoute>} />
            <Route path="/faktury" element={<InvoicesPage />} />
            <Route path="/faktury/dodaj" element={<AddInvoicePage />} />
            <Route path="/faktury/:id" element={<InvoiceDetailsPage />} />
            <Route path="/faktury/edytuj/:id" element={<EditInvoicePage />} />
            <Route path="/platnosci" element={<PaymentsPage />} />
            <Route path="/platnosci/dodaj" element={<PrivateRoute><AddPaymentPage /></PrivateRoute>} />
            <Route path="/platnosci/edytuj/:id" element={<PrivateRoute><EditPaymentPage /></PrivateRoute>} />
            <Route path="/wydarzenia" element={<CalendarEventsPage />} />
            <Route path="/wydarzenia/dodaj" element={<PrivateRoute><AddCalendarEventPage /></PrivateRoute>} />
            <Route path="/wydarzenia/edytuj/:id" element={<PrivateRoute><EditCalendarEventPage /></PrivateRoute>} />
            <Route path="/spotkania" element={<MeetingsPage />} />
            <Route path="/spotkania/dodaj" element={<PrivateRoute><AddMeetingPage /></PrivateRoute>} />
            <Route path="/spotkania/edytuj/:id" element={<PrivateRoute><EditMeetingPage /></PrivateRoute>} />
            <Route path="/przypomnienia" element={<RemindersPage />} />
            <Route path="/szablony" element={<TemplatesPage />} />
            <Route path="/raporty" element={<ErrorBoundary><ReportsPage /></ErrorBoundary>} />
            <Route path="/eksporty" element={<ExportsPage />} />
            <Route path="/wiadomosci" element={<MessagesPage />} />
            <Route path="/notatki" element={<NotesPage />} />
            <Route path="/notatki/dodaj" element={<AddNotePage />} />
            <Route path="/notatki/edytuj/:id" element={<PrivateRoute><EditNotePage /></PrivateRoute>} />
            <Route path="/powiadomienia" element={<NotificationsPage />} />
            <Route path="/logowania" element={<LoginHistoryPage />} />
            <Route path="/logi" element={<LogsPage />} />
            <Route path="/ustawienia" element={<SettingsPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </ModalProvider>
  );
}

export default App;