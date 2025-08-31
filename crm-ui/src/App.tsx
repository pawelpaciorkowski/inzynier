// Import komponentów Routes i Route z React Router do definiowania ścieżek aplikacji
import { Routes, Route } from "react-router-dom"; // BrowserRouter is removed from here
// Import kontekstu uwierzytelniania - zarządza stanem zalogowania użytkownika
import { AuthProvider } from "./context/AuthContext";
// Import kontekstu modali - zarządza stanem otwartych okien modalnych
import { ModalProvider } from './context/ModalContext';
// Import komponentu obsługi błędów - łapie błędy JavaScript w drzewie komponentów
import { ErrorBoundary } from './components/ErrorBoundary';
// Import strony logowania - główny punkt wejścia do aplikacji
import LoginPage from "./pages/LoginPage";
// Import strony dashboardu - strona główna po zalogowaniu
import DashboardPage from "./pages/DashboardPage";
// Import strony zarządzania klientami
import ClientsPage from "./pages/ClientsPage";
// Import strony zarządzania użytkownikami systemu
import UsersPage from "./pages/UsersPage";
// Import strony zarządzania zadaniami
import TasksPage from "./pages/TasksPage";
// Import strony aktywności użytkowników
import ActivitiesPage from "./pages/ActivitiesPage";
// Import komponentu chroniącej trasy - sprawdza czy użytkownik jest zalogowany
import PrivateRoute from "./components/PrivateRoute";
// Import głównego layoutu aplikacji - nawigacja i struktura strony
import Layout from "./components/Layout";
// Import strony zarządzania tagami klientów - etykiety do kategoryzacji klientów
import { ClientTagsPage } from "./pages/ClientTagsPage";
// Import strony dodawania nowego klienta do systemu
import { AddClientPage } from "./pages/AddClientPage";
// Import strony dodawania nowego użytkownika do systemu
import { AddUserPage } from "./pages/AddUserPage";
// Import strony zarządzania rolami użytkowników - uprawnienia w systemie
import { RolesPage } from "./pages/RolesPage";
// Import strony zarządzania grupami użytkowników
import { GroupsPage } from "./pages/GroupsPage";
// Import strony szczegółów konkretnej grupy użytkowników
import { GroupDetailsPage } from "./pages/GroupDetailsPage";
// Import strony statystyk grupy - analiza aktywności i wydajności
import { GroupStatisticsPage } from "./pages/GroupStatisticsPage";
// Import strony wyświetlającej wszystkie zadania w systemie
import { AllTasksPage } from "./pages/AllTasksPage";
// Import strony zarządzania kontraktami z klientami
import { ContractsPage } from "./pages/ContractsPage";
// Import strony zarządzania fakturami
import { InvoicesPage } from "./pages/InvoicesPage";
// Import strony zarządzania płatnościami
import { PaymentsPage } from "./pages/PaymentsPage";
// Import strony zarządzania wydarzeniami kalendarzowymi
import { CalendarEventsPage } from "./pages/CalendarEventsPage";
// Import strony zarządzania spotkaniami
import { MeetingsPage } from "./pages/MeetingsPage";
// Import strony zarządzania przypomnieniami
import { RemindersPage } from "./pages/RemindersPage";
// Import strony dodawania nowego wydarzenia do kalendarza
import { AddCalendarEventPage } from "./pages/AddCalendarEventPage";
// Import strony edytowania istniejącego wydarzenia kalendarzowego
import { EditCalendarEventPage } from "./pages/EditCalendarEventPage";
// Import strony zarządzania szablonami dokumentów
import { TemplatesPage } from "./pages/TemplatesPage";
// Import strony generowania raportów z danych systemu
import { ReportsPage } from "./pages/ReportsPage";
// Import strony eksportowania danych do różnych formatów
import { ExportsPage } from "./pages/ExportsPage";
// Import strony zarządzania wiadomościami między użytkownikami
import { MessagesPage } from "./pages/MessagesPage";
// Import strony zarządzania notatkami
import { NotesPage } from "./pages/NotesPage";
// Import strony dodawania nowej notatki
import { AddNotePage } from "./pages/AddNotePage";
// Import strony edytowania istniejącej notatki
import { EditNotePage } from "./pages/EditNotePage";
// Import strony powiadomień systemowych
import { NotificationsPage } from "./pages/NotificationsPage";
// Import strony historii logowań użytkowników
import { LoginHistoryPage } from "./pages/LoginHistoryPage";
// Import strony ogólnych logów systemowych
import { LogsPage } from "./pages/LogsPage";
// Import strony ustawień aplikacji
import { SettingsPage } from "./pages/SettingsPage";
// Import strony dodawania nowej faktury
import { AddInvoicePage } from "./pages/AddInvoicePage";
// Import strony dodawania nowej płatności
import { AddPaymentPage } from "./pages/AddPaymentPage";
// Import strony edytowania istniejącej płatności
import { EditPaymentPage } from "./pages/EditPaymentPage";
// Import strony dodawania nowego spotkania
import { AddMeetingPage } from "./pages/AddMeetingPage";
// Import strony edytowania istniejącego spotkania
import { EditMeetingPage } from "./pages/EditMeetingPage";
// Import strony dodawania nowego kontraktu
import { AddContractPage } from './pages/AddContractPage';
// Import strony edytowania istniejącego kontraktu
import { EditContractPage } from './pages/EditContractPage';
// Import strony edytowania danych klienta
import { EditClientPage } from './pages/EditClientPage';
// Import strony edytowania danych użytkownika
import { EditUserPage } from "./pages/EditUserPage";
// Import strony szczegółów faktury
import { InvoiceDetailsPage } from './pages/InvoiceDetailsPage';
// Import strony edytowania faktury
import EditInvoicePage from './pages/EditInvoicePage';
// Import globalnych stylów CSS aplikacji
import './index.css';

// Główny komponent aplikacji App - definiuje strukturę i routing całej aplikacji CRM
function App() {
  return (
    // ModalProvider - kontekst zarządzający otwartymi oknami modalnymi w aplikacji
    <ModalProvider>
      {/* AuthProvider - kontekst zarządzający uwierzytelnianiem użytkownika */}
      <AuthProvider>
        {/* The <BrowserRouter> wrapper is removed from here */}
        {/* Routes - kontener definiujący wszystkie możliwe ścieżki aplikacji */}
        <Routes>
          {/* Trasa główna "/" - strona logowania, dostępna dla wszystkich */}
          <Route path="/" element={<LoginPage />} />
          {/* Trasa dla wszystkich chronionych stron - wymagają uwierzytelnienia */}
          <Route
            element={ // PrivateRoute sprawdza czy użytkownik jest zalogowany
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            {/* Dashboard - strona główna po zalogowaniu z podsumowaniem */}
            <Route path="/dashboard" element={<DashboardPage />} />
            {/* Lista wszystkich klientów w systemie CRM */}
            <Route path="/klienci" element={<ClientsPage />} />
            {/* Zarządzanie użytkownikami systemu - tylko dla adminów */}
            <Route path="/uzytkownicy" element={<UsersPage />} />
            {/* Lista zadań przypisanych do użytkownika */}
            <Route path="/zadania" element={<TasksPage />} />
            {/* Historia aktywności użytkowników w systemie */}
            <Route path="/aktywnosci" element={<ActivitiesPage />} />
            {/* Zarządzanie tagami do kategoryzacji klientów */}
            <Route path="/klienci/tagi" element={<ClientTagsPage />} />
            {/* Formularz dodawania nowego klienta */}
            <Route path="/klienci/dodaj" element={<AddClientPage />} />
            {/* Formularz edycji klienta - parameter :id określa ID klienta */}
            <Route path="/klienci/edytuj/:id" element={<PrivateRoute><EditClientPage /></PrivateRoute>} />
            {/* Formularz dodawania nowego użytkownika do systemu */}
            <Route path="/uzytkownicy/dodaj" element={<AddUserPage />} />
            {/* Formularz edycji użytkownika - parameter :id określa ID użytkownika */}
            <Route path="/uzytkownicy/edytuj/:id" element={<EditUserPage />} />
            {/* Zarządzanie rolami i uprawnieniami użytkowników */}
            <Route path="/role" element={<RolesPage />} />
            {/* Lista grup użytkowników w systemie */}
            <Route path="/grupy" element={<GroupsPage />} />
            {/* Szczegóły konkretnej grupy - parameter :id określa ID grupy */}
            <Route path="/grupy/:id" element={<GroupDetailsPage />} />
            {/* Statystyki aktywności grupy - parameter :id określa ID grupy */}
            <Route path="/grupy/:id/statystyki" element={<GroupStatisticsPage />} />
            {/* Widok wszystkich zadań w systemie - dla managerów */}
            <Route path="/zadania/wszystkie" element={<AllTasksPage />} />
            {/* Lista kontraktów z klientami */}
            <Route path="/kontrakty" element={<ContractsPage />} />
            {/* Formularz dodawania nowego kontraktu - chroniony przed błędami */}
            <Route path="/kontrakty/dodaj" element={<PrivateRoute><AddContractPage /></PrivateRoute>} />
            {/* Formularz edycji kontraktu z obsługą błędów - parameter :id określa ID kontraktu */}
            <Route path="/kontrakty/edytuj/:id" element={<PrivateRoute><ErrorBoundary><EditContractPage /></ErrorBoundary></PrivateRoute>} />
            {/* Lista wszystkich faktur w systemie */}
            <Route path="/faktury" element={<InvoicesPage />} />
            {/* Formularz tworzenia nowej faktury */}
            <Route path="/faktury/dodaj" element={<AddInvoicePage />} />
            {/* Szczegółowy widok faktury - parameter :id określa ID faktury */}
            <Route path="/faktury/:id" element={<InvoiceDetailsPage />} />
            {/* Formularz edycji faktury - parameter :id określa ID faktury */}
            <Route path="/faktury/edytuj/:id" element={<EditInvoicePage />} />
            {/* Lista płatności w systemie */}
            <Route path="/platnosci" element={<PaymentsPage />} />
            {/* Formularz dodawania nowej płatności - wymaga uwierzytelnienia */}
            <Route path="/platnosci/dodaj" element={<PrivateRoute><AddPaymentPage /></PrivateRoute>} />
            {/* Formularz edycji płatności - parameter :id określa ID płatności */}
            <Route path="/platnosci/edytuj/:id" element={<PrivateRoute><EditPaymentPage /></PrivateRoute>} />
            {/* Kalendarz wydarzeń i terminów */}
            <Route path="/wydarzenia" element={<CalendarEventsPage />} />
            {/* Formularz dodawania nowego wydarzenia do kalendarza */}
            <Route path="/wydarzenia/dodaj" element={<PrivateRoute><AddCalendarEventPage /></PrivateRoute>} />
            {/* Formularz edycji wydarzenia - parameter :id określa ID wydarzenia */}
            <Route path="/wydarzenia/edytuj/:id" element={<PrivateRoute><EditCalendarEventPage /></PrivateRoute>} />
            {/* Lista spotkań z klientami */}
            <Route path="/spotkania" element={<MeetingsPage />} />
            {/* Formularz planowania nowego spotkania */}
            <Route path="/spotkania/dodaj" element={<PrivateRoute><AddMeetingPage /></PrivateRoute>} />
            {/* Formularz edycji spotkania - parameter :id określa ID spotkania */}
            <Route path="/spotkania/edytuj/:id" element={<PrivateRoute><EditMeetingPage /></PrivateRoute>} />
            {/* System przypomnień o terminach i zadaniach */}
            <Route path="/przypomnienia" element={<RemindersPage />} />
            {/* Zarządzanie szablonami dokumentów */}
            <Route path="/szablony" element={<TemplatesPage />} />
            {/* Generowanie raportów z obsługą błędów */}
            <Route path="/raporty" element={<ErrorBoundary><ReportsPage /></ErrorBoundary>} />
            {/* Eksport danych do różnych formatów */}
            <Route path="/eksporty" element={<ExportsPage />} />
            {/* System wiadomości wewnętrznych */}
            <Route path="/wiadomosci" element={<MessagesPage />} />
            {/* Lista notatek użytkownika */}
            <Route path="/notatki" element={<NotesPage />} />
            {/* Formularz tworzenia nowej notatki */}
            <Route path="/notatki/dodaj" element={<AddNotePage />} />
            {/* Formularz edycji notatki - parameter :id określa ID notatki */}
            <Route path="/notatki/edytuj/:id" element={<PrivateRoute><EditNotePage /></PrivateRoute>} />
            {/* Centrum powiadomień systemowych */}
            <Route path="/powiadomienia" element={<NotificationsPage />} />
            {/* Historia logowań użytkowników */}
            <Route path="/logowania" element={<LoginHistoryPage />} />
            {/* Ogólne logi systemowe */}
            <Route path="/logi" element={<LogsPage />} />
            {/* Ustawienia aplikacji i preferencje użytkownika */}
            <Route path="/ustawienia" element={<SettingsPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </ModalProvider>
  );
}

// Eksport domyślny komponentu App - główny punkt wejścia aplikacji
export default App;