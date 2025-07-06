import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
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
import { AllTasksPage } from "./pages/AllTasksPage";
import { ContractsPage } from "./pages/ContractsPage";
import { InvoicesPage } from "./pages/InvoicesPage";
import { PaymentsPage } from "./pages/PaymentsPage";
import { CalendarEventsPage } from "./pages/CalendarEventsPage";
import { MeetingsPage } from "./pages/MeetingsPage";
import { RemindersPage } from "./pages/RemindersPage";
import { TemplatesPage } from "./pages/TemplatesPage";
import { ReportsPage } from "./pages/ReportsPage";
import { ExportsPage } from "./pages/ExportsPage";
import { MessagesPage } from "./pages/MessagesPage";
import { NotesPage } from "./pages/NotesPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { LoginHistoryPage } from "./pages/LoginHistoryPage";
import { SystemLogsPage } from "./pages/SystemLogsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { AddInvoicePage } from "./pages/AddInvoicePage";
import { ModalProvider } from './context/ModalContext';
import { AddContractPage } from './pages/AddContractPage';
import { EditContractPage } from './pages/EditContractPage';
import { EditClientPage } from './pages/EditClientPage';
import { EditUserPage } from "./pages/EditUserPage";
import { InvoiceDetailsPage } from "./pages/InvoiceDetailsPage"; // <--- DODANY IMPORT

import './index.css';

function App() {
  return (
    <AuthProvider>
      <ModalProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LoginPage />} />

            <Route
              element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }
            >
              {/* ... (wszystkie inne ścieżki bez zmian) ... */}
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

              <Route path="/zadania/wszystkie" element={<AllTasksPage />} />

              <Route path="/kontrakty" element={<ContractsPage />} />
              <Route path="/kontrakty/dodaj" element={<PrivateRoute><AddContractPage /></PrivateRoute>} />
              <Route path="/kontrakty/edytuj/:id" element={<PrivateRoute><EditContractPage /></PrivateRoute>} />

              <Route path="/faktury" element={<InvoicesPage />} />
              <Route path="/faktury/dodaj" element={<AddInvoicePage />} />
              {/* --- DODANA BRAKUJĄCA ŚCIEŻKA --- */}
              <Route path="/faktury/:id" element={<InvoiceDetailsPage />} />
              {/* --------------------------------- */}
              <Route path="/platnosci" element={<PaymentsPage />} />

              <Route path="/wydarzenia" element={<CalendarEventsPage />} />
              <Route path="/spotkania" element={<MeetingsPage />} />
              <Route path="/przypomnienia" element={<RemindersPage />} />

              <Route path="/szablony" element={<TemplatesPage />} />
              <Route path="/raporty" element={<ReportsPage />} />
              <Route path="/eksporty" element={<ExportsPage />} />

              <Route path="/wiadomosci" element={<MessagesPage />} />
              <Route path="/notatki" element={<NotesPage />} />
              <Route path="/powiadomienia" element={<NotificationsPage />} />

              <Route path="/logowania" element={<LoginHistoryPage />} />
              <Route path="/logi" element={<SystemLogsPage />} />
              <Route path="/ustawienia" element={<SettingsPage />} />

            </Route>
          </Routes>
        </BrowserRouter>
      </ModalProvider>
    </AuthProvider>
  );
}

export default App;