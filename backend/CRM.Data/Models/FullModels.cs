/// <summary>
/// Przestrzeń nazw zawierająca wszystkie modele danych systemu CRM
/// Definicje encji odpowiadających tabelom w bazie danych aplikacji
/// Zawiera klasy reprezentujące strukturę bazy danych i relacje między tabelami
/// Używana przez Entity Framework do mapowania obiektowo-relacyjnego
/// Centralne miejsce dla wszystkich definicji modeli biznesowych systemu
/// </summary>
namespace CRM.Data.Models
{
    /// <summary>
    /// Model reprezentujący kontrakt/umowę w systemie CRM
    /// Przechowuje informacje o umowach zawartych z klientami
    /// Służy do zarządzania dokumentami prawno-biznesowymi z klientami
    /// Zawiera powiązania z klientami, grupami, użytkownikami i tagami
    /// </summary>
    public class Contract
    {
        /// <summary>
        /// Unikalny identyfikator kontraktu
        /// Klucz główny tabeli - automatycznie generowany przez bazę danych
        /// Używany do identyfikacji konkretnego kontraktu w systemie
        /// </summary>
        public int Id { get; set; }
        
        /// <summary>
        /// Tytuł kontraktu - krótki opis umowy
        /// Wymagane pole - główna identyfikacja kontraktu dla użytkowników
        /// Przykłady: "Umowa serwisowa", "Kontrakt na dostarczenie oprogramowania"
        /// Wyświetlany w listach kontraktów i raportach
        /// </summary>
        public string Title { get; set; } = default!;
        
        /// <summary>
        /// Data podpisania kontraktu
        /// Określa kiedy kontrakt został formalnie zawarty
        /// Używana do sortowania, filtrowania i analiz czasowych
        /// Ważna data dla prawnych aspektów umowy
        /// </summary>
        public DateTime SignedAt { get; set; }
        
        /// <summary>
        /// ID klienta z którym zawarto kontrakt
        /// Wymagane pole - każdy kontrakt musi być przypisany do klienta
        /// Powiązanie z tabelą Customers przez klucz obcy
        /// Pozwala na grupowanie kontraktów według klientów
        /// </summary>
        public int CustomerId { get; set; }
        
        /// <summary>
        /// Właściwość nawigacyjna do klienta związanego z kontraktem
        /// Pozwala na łatwe pobieranie informacji o kliencie bez dodatkowych zapytań
        /// Wymagana relacja - każdy kontrakt musi być powiązany z klientem
        /// Używana do dostępu do danych klienta (nazwa, email, dane firmowe)
        /// </summary>
        public virtual Customer Customer { get; set; } = null!;

        /// <summary>
        /// Numer kontraktu - unikalny identyfikator tekstowy umowy
        /// Opcjonalne pole - może być generowane automatycznie lub wpisywane ręcznie
        /// Używane do zewnętrznej identyfikacji kontraktu w korespondencji
        /// Format może być dostosowany do standardów firmy (np. "KTR/2024/001")
        /// </summary>
        public string? ContractNumber { get; set; }
        
        /// <summary>
        /// Miejsce podpisania kontraktu
        /// Opcjonalne pole - przechowuje informację o lokalizacji zawarcia umowy
        /// Ważne dla aspektów prawnych i jurisdykcji kontraktu
        /// Przykłady: "Warszawa", "Biuro klienta w Krakowie", "Online"
        /// </summary>
        public string? PlaceOfSigning { get; set; }
        
        /// <summary>
        /// Zakres usług określony w kontrakcie
        /// Opcjonalne pole - szczegółowy opis świadczonych usług
        /// Może zawierać długi tekst opisujący wszystkie elementy umowy
        /// Używane do weryfikacji czy dane działania mieszczą się w zakresie kontraktu
        /// </summary>
        public string? ScopeOfServices { get; set; }
        
        /// <summary>
        /// Data rozpoczęcia obowiązywania kontraktu
        /// Opcjonalne pole - może różnić się od daty podpisania
        /// Określa od kiedy świadczone są usługi lub obowiązują postanowienia umowy
        /// Używana do kalkulacji okresów rozliczeniowych i planowania pracy
        /// </summary>
        public DateTime? StartDate { get; set; }
        
        /// <summary>
        /// Data zakończenia kontraktu
        /// Opcjonalne pole - dla umów bezterminowych może być puste
        /// Określa do kiedy obowiązuje umowa
        /// Używana do generowania alertów o wygasających kontraktach
        /// </summary>
        public DateTime? EndDate { get; set; }
        
        /// <summary>
        /// Wartość netto kontraktu w walucie systemowej
        /// Opcjonalne pole - całkowita wartość umowy bez podatków
        /// Używane do raportowania, analizy rentowności i planowania budżetu
        /// Podstawa do kalkulacji prowizji i bonusów dla pracowników
        /// </summary>
        public decimal? NetAmount { get; set; }
        
        /// <summary>
        /// Termin płatności w dniach
        /// Opcjonalne pole - określa ile dni klient ma na zapłatę
        /// Standardowe wartości: 7, 14, 30 dni
        /// Używane do automatycznego ustawiania terminów płatności na fakturach
        /// </summary>
        public int? PaymentTermDays { get; set; }

        /// <summary>
        /// ID grupy odpowiedzialnej za obsługę kontraktu
        /// Opcjonalne pole - pozwala przypisać kontrakt do konkretnego zespołu
        /// Umożliwia podział obowiązków między różne działy lub zespoły projektowe
        /// Używane do filtrowania i raportowania kontraktów według grup
        /// </summary>
        public int? ResponsibleGroupId { get; set; }
        
        /// <summary>
        /// Właściwość nawigacyjna do grupy odpowiedzialnej za kontrakt
        /// Pozwala na dostęp do informacji o zespole bez dodatkowych zapytań
        /// Opcjonalna relacja - kontrakt może nie mieć przypisanej grupy
        /// Używana do wyświetlania nazwy grupy i kontaktów zespołu
        /// </summary>
        public virtual Group? ResponsibleGroup { get; set; }
        
        /// <summary>
        /// ID użytkownika który utworzył kontrakt w systemie
        /// Opcjonalne pole - identyfikuje autora wpisu
        /// Używane do śledzenia kto wprowadził dane i za co odpowiada
        /// Pozwala na kontakt z osobą znającą szczegóły kontraktu
        /// </summary>
        public int? CreatedByUserId { get; set; }
        
        /// <summary>
        /// Właściwość nawigacyjna do użytkownika który utworzył kontrakt
        /// Wymagana relacja jeśli podano CreatedByUserId
        /// Pozwala na dostęp do danych użytkownika (imię, nazwisko, email)
        /// Używana do wyświetlania informacji o autorze i możliwości kontaktu
        /// </summary>
        public virtual User CreatedByUser { get; set; } = null!;

        /// <summary>
        /// Kolekcja powiązań kontraktu z tagami
        /// Relacja wiele-do-wielu przez tabelę łączącą ContractTag
        /// Pozwala na kategoryzowanie i tagowanie kontraktów
        /// Ułatwia wyszukiwanie i filtrowanie kontraktów według różnych kryteriów
        /// Inicjalizowana pustą listą aby uniknąć błędów null reference
        /// </summary>
        public virtual ICollection<ContractTag> ContractTags { get; set; } = new List<ContractTag>();
    }

    /// <summary>
    /// Model reprezentujący fakturę w systemie CRM
    /// Przechowuje informacje o dokumentach rozliczeniowych wystawianych klientom
    /// Służy do zarządzania płatnościami, raportowania finansowego i kontroli należności
    /// Zawiera powiązania z klientami, pozycjami faktury, płatnościami, grupami i tagami
    /// </summary>
    public class Invoice
    {
        /// <summary>
        /// Unikalny identyfikator faktury
        /// Klucz główny tabeli - automatycznie generowany przez bazę danych
        /// Używany do identyfikacji konkretnej faktury w systemie
        /// Podstawa dla relacji z innymi tabelami (płatności, pozycje)
        /// </summary>
        public int Id { get; set; }
        
        /// <summary>
        /// Numer faktury - unikalny identyfikator tekstowy dokumentu
        /// Wymagane pole - musi być zgodne z przepisami krajowymi o numeracji
        /// Format często zawiera: seria, rok, numer porządkowy (np. "FV/2024/001")
        /// Używany w korespondencji, raportach i dokumentach księgowych
        /// </summary>
        public string Number { get; set; } = null!;
        
        /// <summary>
        /// ID klienta dla którego wystawiono fakturę
        /// Wymagane pole - każda faktura musi być przypisana do konkretnego klienta
        /// Klucz obcy do tabeli Customers - zapewnia integralność danych
        /// Używane do grupowania faktur według klientów i analiz należności
        /// </summary>
        public int CustomerId { get; set; }
        
        /// <summary>
        /// Właściwość nawigacyjna do klienta związanego z fakturą
        /// Wymagana relacja - umożliwia dostęp do danych klienta bez dodatkowych zapytań
        /// Zawiera informacje o nabywcy: nazwa firmy, adres, NIP, dane kontaktowe
        /// Używana do generowania dokumentów PDF i wyświetlania szczegółów faktury
        /// </summary>
        public virtual Customer Customer { get; set; } = null!;
        
        /// <summary>
        /// Data wystawienia faktury
        /// Wymagane pole - określa kiedy dokument został utworzony
        /// Ważna dla przepisów podatkowych i terminów płatności
        /// Używana do sortowania, filtrowania i raportowania chronologicznego
        /// </summary>
        public DateTime IssuedAt { get; set; }

        /// <summary>
        /// Termin płatności faktury
        /// Wymagane pole - określa do kiedy klient musi dokonać zapłaty
        /// Obliczany na podstawie daty wystawienia i terminu płatności z kontraktu
        /// Używany do generowania przypomnień, alertów i raportów zaległości
        /// </summary>
        public DateTime DueDate { get; set; }
        
        /// <summary>
        /// Flaga określająca czy faktura została zapłacona
        /// Wymagane pole - wskazuje status płatności dokumentu
        /// True = zapłacona w pełni, False = niezapłacona lub częściowo zapłacona
        /// Używana do filtrowania zaległości i raportowania wpłat
        /// </summary>
        public bool IsPaid { get; set; }

        /// <summary>
        /// Całkowita kwota faktury włączając podatek
        /// Wymagane pole - suma wszystkich pozycji faktury z VAT
        /// Wyrażona w walucie systemowej (zwykle PLN)
        /// Używana do raportowania obrotów, analiz finansowych i kontroli płatności
        /// </summary>
        public decimal TotalAmount { get; set; }
        
        /// <summary>
        /// Kolekcja pozycji (wierszy) na fakturze
        /// Relacja jeden-do-wielu z tabelą InvoiceItem
        /// Każda pozycja zawiera: nazwę usługi/produktu, ilość, cenę jednostkową, wartość
        /// Inicjalizowana pustą listą aby uniknąć błędów null reference przy dodawaniu pozycji
        /// </summary>
        public virtual ICollection<InvoiceItem> Items { get; set; } = new List<InvoiceItem>();
        
        /// <summary>
        /// Kolekcja płatności związanych z fakturą
        /// Relacja jeden-do-wielu z tabelą Payment
        /// Każda płatność zawiera: datę, kwotę, sposób płatności
        /// Pozwala na śledzenie częściowych wpłat i rozliczeń faktur
        /// </summary>
        public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();

        /// <summary>
        /// ID grupy przypisanej do obsługi faktury
        /// Opcjonalne pole - pozwala przypisać fakturę do konkretnego zespołu
        /// Umożliwia podział odpowiedzialności między działy (sprzedaż, księgowość)
        /// Używane do filtrowania faktury według zespołów i raportowania grupowego
        /// </summary>
        public int? AssignedGroupId { get; set; }
        
        /// <summary>
        /// Właściwość nawigacyjna do grupy przypisanej do faktury
        /// Opcjonalna relacja - pozwala na dostęp do informacji o zespole
        /// Używana do wyświetlania nazwy grupy odpowiedzialnej za fakturę
        /// Ułatwia kontakt z odpowiednim działem w sprawie dokumentu
        /// </summary>
        public virtual Group? AssignedGroup { get; set; }
        
        /// <summary>
        /// ID użytkownika który utworzył fakturę w systemie
        /// Opcjonalne pole - identyfikuje autora dokumentu
        /// Używane do śledzenia kto wystawił fakturę i ponosi za nią odpowiedzialność
        /// Pozwala na kontakt z osobą znającą szczegóły faktury w przypadku pytań
        /// </summary>
        public int? CreatedByUserId { get; set; }
        
        /// <summary>
        /// Właściwość nawigacyjna do użytkownika który utworzył fakturę
        /// Wymagana relacja jeśli podano CreatedByUserId
        /// Pozwala na dostęp do danych użytkownika (imię, nazwisko, kontakt)
        /// Używana do wyświetlania informacji o autorze faktury i możliwości kontaktu
        /// </summary>
        public virtual User CreatedByUser { get; set; } = null!;

        /// <summary>
        /// Kolekcja powiązań faktury z tagami
        /// Relacja wiele-do-wielu przez tabelę łączącą InvoiceTag
        /// Pozwala na kategoryzowanie faktur (pilne, eksport, stałe, jednorazowe)
        /// Ułatwia wyszukiwanie i filtrowanie faktur według różnych kryteriów biznesowych
        /// Inicjalizowana pustą listą aby uniknąć błędów null reference
        /// </summary>
        public virtual ICollection<InvoiceTag> InvoiceTags { get; set; } = new List<InvoiceTag>();
    }

    /// <summary>
    /// Model reprezentujący płatność związaną z fakturą
    /// Przechowuje informacje o wpłatach dokonywanych przez klientów
    /// Pozwala na śledzenie częściowych płatności i pełną historię rozliczeń
    /// Każda płatność jest powiązana z konkretną fakturą przez klucz obcy
    /// </summary>
    public class Payment
    {
        /// <summary>
        /// Unikalny identyfikator płatności
        /// Klucz główny tabeli - automatycznie generowany przez bazę danych
        /// Używany do identyfikacji konkretnej płatności w systemie
        /// Pozwala na śledzenie i referencje do płatności w raportach i audytach
        /// </summary>
        public int Id { get; set; }
        
        /// <summary>
        /// ID faktury której dotyczy płatność
        /// Wymagane pole - każda płatność musi być powiązana z fakturą
        /// Klucz obcy do tabeli Invoice - zapewnia integralność relacyjną
        /// Pozwala na grupowanie płatności według faktur i kontrolę sald
        /// </summary>
        public int InvoiceId { get; set; }
        
        /// <summary>
        /// Właściwość nawigacyjna do faktury związanej z płatnością
        /// Wymagana relacja - umożliwia dostęp do szczegółów faktury
        /// Pozwala na pobieranie informacji o dokumencie bez dodatkowych zapytań
        /// Używana do weryfikacji czy płatność pokrywa należność faktury
        /// </summary>
        public virtual Invoice Invoice { get; set; } = null!;
        
        /// <summary>
        /// Data i czas dokonania płatności
        /// Wymagane pole - określa kiedy środki wpłynęły na konto
        /// Używana do chronologicznego sortowania płatności
        /// Ważna dla raportowania przepływów finansowych i analizy płynności
        /// </summary>
        public DateTime PaidAt { get; set; }
        
        /// <summary>
        /// Kwota płatności w walucie systemowej
        /// Wymagane pole - określa ile zostało zapłacone
        /// Może być mniejsza od kwoty faktury (płatność częściowa)
        /// Używana do kalkulacji salda faktury i kontroli zaległości
        /// </summary>
        public decimal Amount { get; set; }
    }

    /// <summary>
    /// Model reprezentujący plik przesłany przez użytkownika
    /// Służy do przechowywania informacji o dokumentach, załącznikach i innych plikach
    /// Pozwala na śledzenie kto, kiedy i jakie pliki wprowadził do systemu
    /// Używany do zarządzania dokumentacją projektów, umów i korespondencji
    /// </summary>
    public class UserFile
    {
        /// <summary>
        /// Unikalny identyfikator pliku w systemie
        /// Klucz główny tabeli - automatycznie generowany przez bazę danych
        /// Używany do referencji pliku w innych częściach aplikacji
        /// Pozwala na tworzenie powiązań między plikami a innymi encjami
        /// </summary>
        public int Id { get; set; }
        
        /// <summary>
        /// Oryginalna nazwa pliku podana przez użytkownika
        /// Wymagane pole - zachowuje pierwotną nazwę z rozszerzeniem
        /// Wyświetlana użytkownikom w interfejsie do rozpoznawania plików
        /// Używana przy pobieraniu pliku do zachowania oryginalnej nazwy
        /// </summary>
        public string FileName { get; set; } = default!;
        
        /// <summary>
        /// Ścieżka do pliku w systemie plików serwera
        /// Wymagane pole - lokalizacja fizycznego pliku na dysku
        /// Może być relatywna lub absolutna względem katalogu aplikacji
        /// Używana do odczytu i udostępniania pliku użytkownikom
        /// </summary>
        public string FilePath { get; set; } = default!;
        
        /// <summary>
        /// Data i czas przesłania pliku do systemu
        /// Wymagane pole - znacznik czasowy dodania pliku
        /// Używany do sortowania chronologicznego i archiwizacji
        /// Pozwala na śledzenie aktywności użytkowników w zakresie plików
        /// </summary>
        public DateTime UploadedAt { get; set; }
    }

    /// <summary>
    /// Model reprezentujący szablon dokumentu w systemie
    /// Służy do przechowywania wzorców dokumentów (faktury, umowy, listy)
    /// Pozwala na standaryzację dokumentów wychodzących z firmy
    /// Szablony mogą zawierać zmienne zastępowane danymi z systemu CRM
    /// </summary>
    public class Template
    {
        /// <summary>
        /// Unikalny identyfikator szablonu
        /// Klucz główny tabeli - automatycznie generowany przez bazę danych
        /// Używany do wyboru szablonu przy generowaniu dokumentów
        /// Podstawa dla relacji z innymi encjami wykorzystującymi szablony
        /// </summary>
        public int Id { get; set; }
        
        /// <summary>
        /// Nazwa szablonu wyświetlana w systemie
        /// Wymagane pole - opisowa nazwa dla użytkowników
        /// Przykłady: "Faktura standardowa", "Umowa serwisowa", "List informacyjny"
        /// Używana w listach wyboru szablonów i zarządzaniu dokumentami
        /// </summary>
        public string Name { get; set; } = null!;
        
        /// <summary>
        /// Nazwa pliku szablonu w systemie plików
        /// Wymagane pole - rzeczywista nazwa pliku z rozszerzeniem
        /// Może różnić się od nazwy wyświetlanej dla celów organizacyjnych
        /// Używana do identyfikacji pliku w katalogu szablonów
        /// </summary>
        public string FileName { get; set; } = null!;
        
        /// <summary>
        /// Ścieżka do pliku szablonu na serwerze
        /// Wymagane pole - lokalizacja fizycznego pliku szablonu
        /// Zwykle w dedykowanym katalogu templates/ aplikacji
        /// Używana do odczytu szablonu przy generowaniu dokumentów
        /// </summary>
        public string FilePath { get; set; } = null!;
        
        /// <summary>
        /// Data i czas przesłania szablonu do systemu
        /// Wymagane pole - znacznik czasowy dodania lub ostatniej aktualizacji
        /// Używany do śledzenia wersji szablonów i ich aktualności
        /// Pozwala na zarządzanie cyklem życia szablonów dokumentów
        /// </summary>
        public DateTime UploadedAt { get; set; }
    }

    /// <summary>
    /// Model reprezentujący log audytu działań w systemie
    /// Służy do śledzenia wszystkich ważnych operacji wykonywanych przez użytkowników
    /// Zapewnia kontrolę bezpieczeństwa i możliwość odtworzenia historii zmian
    /// Wymagany do zgodności z regulacjami dotyczącymi ochrony danych (RODO)
    /// </summary>
    public class AuditLog
    {
        /// <summary>
        /// Unikalny identyfikator wpisu audytu
        /// Klucz główny tabeli - automatycznie generowany przez bazę danych
        /// Używany do sortowania chronologicznego i referencji logów
        /// Pozwala na precyzyjne śledzenie kolejności operacji w systemie
        /// </summary>
        public int Id { get; set; }
        
        /// <summary>
        /// Nazwa encji której dotyczy operacja
        /// Wymagane pole - określa na jakiej tabeli/modelu wykonano akcję
        /// Przykłady: "Customer", "Invoice", "Contract", "User"
        /// Używane do filtrowania logów według typu danych
        /// </summary>
        public string Entity { get; set; } = default!;
        
        /// <summary>
        /// Typ wykonanej akcji/operacji
        /// Wymagane pole - opisuje rodzaj wykonanej czynności
        /// Standardowe wartości: "Create", "Update", "Delete", "Login", "Logout"
        /// Używane do kategoryzacji działań i analizy bezpieczeństwa
        /// </summary>
        public string Action { get; set; } = default!;
        
        /// <summary>
        /// Znacznik czasowy wykonania operacji
        /// Wymagane pole - precyzyjna data i czas akcji
        /// Używany do chronologicznego sortowania i raportowania aktywności
        /// Kluczowy dla rekonstrukcji sekwencji zdarzeń w systemie
        /// </summary>
        public DateTime Timestamp { get; set; }
        
        /// <summary>
        /// ID użytkownika który wykonał operację
        /// Wymagane pole - identyfikuje odpowiedzialnego za akcję
        /// Klucz obcy do tabeli Users - zapewnia powiązanie z kontem
        /// Używany do śledzenia aktywności poszczególnych użytkowników
        /// </summary>
        public int UserId { get; set; }
    }

    /// <summary>
    /// Model reprezentujący historię logowań użytkowników
    /// Służy do monitorowania dostępu do systemu i bezpieczeństwa kont
    /// Pozwala na wykrywanie podejrzanych prób logowania i analiz użytkowania
    /// Ważny element systemu bezpieczeństwa i raportowania aktywności
    /// </summary>
    public class LoginHistory
    {
        /// <summary>
        /// Unikalny identyfikator wpisu historii logowania
        /// Klucz główny tabeli - automatycznie generowany przez bazę danych
        /// Używany do chronologicznego sortowania sesji logowania
        /// Pozwala na referencje do konkretnych sesji w analizach bezpieczeństwa
        /// </summary>
        public int Id { get; set; }
        
        /// <summary>
        /// ID użytkownika który się logował
        /// Wymagane pole - identyfikuje użytkownika sesji
        /// Klucz obcy do tabeli Users - łączy historię z kontem użytkownika
        /// Używany do grupowania sesji według użytkowników i analizy wzorców
        /// </summary>
        public int UserId { get; set; }
        public virtual User User { get; set; } = null!;
        public DateTime LoggedInAt { get; set; }
        
        /// <summary>
        /// Adres IP z którego nastąpiło logowanie
        /// Wymagane pole - identyfikuje źródło połączenia
        /// Używany do wykrywania podejrzanych logowań z nieznanych lokalizacji
        /// Pozwala na geograficzną analizę dostępów i bezpieczeństwo kont
        /// </summary>
        public string IpAddress { get; set; } = default!;
        public string? UserAgent { get; set; }
        public string? Browser { get; set; }
        public string? OperatingSystem { get; set; }
        public string? DeviceType { get; set; }
        public bool IsSuccessful { get; set; } = true;
        public string? FailureReason { get; set; }
        public string? Location { get; set; }
    }

    /// <summary>
    /// Model reprezentujący powiadomienie dla użytkownika
    /// Służy do komunikowania ważnych informacji, alertów i aktualizacji
    /// Pozwala na centralne zarządzanie komunikacją w systemie CRM
    /// Może być powiązane z wiadomościami lub być niezależnym alertem
    /// </summary>
    public class Notification
    {
        /// <summary>
        /// Unikalny identyfikator powiadomienia
        /// Klucz główny tabeli - automatycznie generowany przez bazę danych
        /// Używany do zarządzania stanem powiadomień (przeczytane/nieprzeczytane)
        /// Pozwala na referencje powiadomień w interfejsie użytkownika
        /// </summary>
        public int Id { get; set; }
        
        /// <summary>
        /// Treść powiadomienia wyświetlana użytkownikowi
        /// Wymagane pole - główna wiadomość powiadomienia
        /// Powinna być zwięzła i jasno komunikować cel powiadomienia
        /// Wyświetlana w liście powiadomień i popup'ach systemowych
        /// </summary>
        public string Message { get; set; } = default!;
        
        /// <summary>
        /// Tytuł powiadomienia - opcjonalny nagłówek
        /// Opcjonalne pole - krótki tytuł wyświetlany ponad treścią
        /// Używany do kategoryzacji powiadomień (np. "Nowa faktura", "Reminder")
        /// Pomaga użytkownikowi szybko zidentyfikować typ powiadomienia
        /// </summary>
        public string? Title { get; set; }
        
        /// <summary>
        /// Szczegółowe informacje o powiadomieniu
        /// Opcjonalne pole - dodatkowy kontekst lub instrukcje
        /// Może zawierać dłuższy opis, linki lub dane techniczne
        /// Wyświetlane po rozwinięciu powiadomienia przez użytkownika
        /// </summary>
        public string? Details { get; set; }
        
        /// <summary>
        /// ID powiązanej wiadomości jeśli powiadomienie dotyczy wiadomości
        /// Opcjonalne pole - tworzy związek powiadomienia z konkretną wiadomością
        /// Pozwala na nawigację z powiadomienia bezpośrednio do wiadomości
        /// Używane gdy powiadomienie informuje o nowej wiadomości w systemie
        /// </summary>
        public int? MessageId { get; set; }
        
        /// <summary>
        /// Właściwość nawigacyjna do powiązanej wiadomości
        /// Opcjonalna relacja - umożliwia dostęp do szczegółów wiadomości
        /// Używana do wyświetlania kontekstu powiadomienia pochodzącego z wiadomości
        /// Pozwala na jednoczesne pobieranie danych powiadomienia i wiadomości
        /// </summary>
        public virtual Message? RelatedMessage { get; set; }
        
        /// <summary>
        /// Data i czas utworzenia powiadomienia
        /// Wymagane pole - znacznik czasowy generacji powiadomienia
        /// Używany do sortowania chronologicznego i archiwizacji starych powiadomień
        /// Pozwala na śledzenie częstotliwości powiadomień systemowych
        /// </summary>
        public DateTime CreatedAt { get; set; }
        
        /// <summary>
        /// Flaga określająca czy powiadomienie zostało przeczytane
        /// Wymagane pole - wskazuje status powiadomienia dla użytkownika
        /// False = nieprzeczytane (wyświetlane w interfejsie), True = przeczytane
        /// Używana do wyróżniania nowych powiadomień i liczenia nieprzeczytanych
        /// </summary>
        public bool IsRead { get; set; }
        
        /// <summary>
        /// ID użytkownika który ma otrzymać powiadomienie
        /// Wymagane pole - określa adresata powiadomienia
        /// Klucz obcy do tabeli Users - zapewnia dostarczenie do właściwego użytkownika
        /// Używany do filtrowania powiadomień dla konkretnego użytkownika
        /// </summary>
        public int UserId { get; set; }
        
        /// <summary>
        /// Właściwość nawigacyjna do użytkownika odbiorcy powiadomienia
        /// Wymagana relacja - umożliwia dostęp do danych adresata
        /// Pozwala na pobieranie informacji o użytkowniku (imię, email, preferencje)
        /// Używana do personalizacji dostarczania powiadomień
        /// </summary>
        public virtual User User { get; set; } = null!;
    }

    /// <summary>
    /// Model reprezentujący spotkanie/wizytę z klientem
    /// Służy do planowania i zarządzania kalendarzem kontaktów biznesowych
    /// Pozwala na organizację pracy zespołów sprzedażowych i serwisowych
    /// Zawiera powiązania z klientami, grupami roboczymi i systemem tagowania
    /// </summary>
    public class Meeting
    {
        /// <summary>
        /// Unikalny identyfikator spotkania
        /// Klucz główny tabeli - automatycznie generowany przez bazę danych
        /// Używany do referencji spotkania w kalendarzu i raportach
        /// Podstawa dla relacji z innymi encjami systemu
        /// </summary>
        public int Id { get; set; }
        
        /// <summary>
        /// Temat/tytuł spotkania
        /// Wymagane pole - krótki opis celu spotkania
        /// Przykłady: "Prezentacja oferty", "Spotkanie serwisowe", "Negocjacje kontraktu"
        /// Wyświetlany w kalendarzu i listach spotkań dla szybkiej identyfikacji
        /// </summary>
        public string Topic { get; set; } = default!;
        
        /// <summary>
        /// Data i czas zaplanowanego spotkania
        /// Wymagane pole - określa kiedy ma się odbyć spotkanie
        /// Używane do sortowania chronologicznego i integracji z kalendarzem
        /// Podstawa dla przypomnień i powiadomień o nadchodzących spotkaniach
        /// </summary>
        public DateTime ScheduledAt { get; set; }
        
        /// <summary>
        /// ID klienta z którym odbywa się spotkanie
        /// Wymagane pole - każde spotkanie musi być przypisane do klienta
        /// Klucz obcy do tabeli Customers - zapewnia integralność danych
        /// Używane do grupowania spotkań według klientów i analizy kontaktów
        /// </summary>
        public int CustomerId { get; set; }
        
        /// <summary>
        /// Właściwość nawigacyjna do klienta związanego ze spotkaniem
        /// Wymagana relacja - umożliwia dostęp do danych klienta
        /// Pozwala na pobieranie informacji kontaktowych bez dodatkowych zapytań
        /// Używana do wyświetlania nazwy klienta w kalendarzu i szczegółach spotkania
        /// </summary>
        public virtual Customer Customer { get; set; } = null!;

        /// <summary>
        /// ID grupy przypisanej do obsługi spotkania
        /// Opcjonalne pole - pozwala przypisać spotkanie do konkretnego zespołu
        /// Umożliwia organizację pracy między różne działy (sprzedaż, serwis, wsparcie)
        /// Używane do filtrowania spotkań według zespołów i planowania zasobów
        /// </summary>
        public int? AssignedGroupId { get; set; }
        
        /// <summary>
        /// Właściwość nawigacyjna do grupy przypisanej do spotkania
        /// Opcjonalna relacja - pozwala na dostęp do informacji o zespole
        /// Używana do wyświetlania nazwy grupy odpowiedzialnej za spotkanie
        /// Ułatwia koordynację działań między członkami zespołu
        /// </summary>
        public virtual Group? AssignedGroup { get; set; }
        
        /// <summary>
        /// ID użytkownika który utworzył/zaplanował spotkanie
        /// Opcjonalne pole - identyfikuje organizatora spotkania
        /// Używane do śledzenia kto odpowiada za przygotowanie i przeprowadzenie
        /// Pozwala na kontakt z osobą znającą szczegóły spotkania
        /// </summary>
        public int? CreatedByUserId { get; set; }
        
        /// <summary>
        /// Właściwość nawigacyjna do użytkownika który utworzył spotkanie
        /// Wymagana relacja jeśli podano CreatedByUserId
        /// Pozwala na dostęp do danych organizatora (imię, nazwisko, kontakt)
        /// Używana do wyświetlania informacji o odpowiedzialnym za spotkanie
        /// </summary>
        public virtual User CreatedByUser { get; set; } = null!;

        /// <summary>
        /// Kolekcja powiązań spotkania z tagami
        /// Relacja wiele-do-wielu przez tabelę łączącą MeetingTag
        /// Pozwala na kategoryzowanie spotkań (pilne, prezentacja, serwis, follow-up)
        /// Ułatwia wyszukiwanie i filtrowanie spotkań według różnych kryteriów
        /// Inicjalizowana pustą listą aby uniknąć błędów null reference
        /// </summary>
        public virtual ICollection<MeetingTag> MeetingTags { get; set; } = new List<MeetingTag>();
    }

    /// <summary>
    /// Model reprezentujący przypomnienie dla użytkownika
    /// Służy do planowania i zarządzania zadaniami czasowymi
    /// Pozwala użytkownikom na tworzenie osobistych alertów i powiadomień
    /// Zintegrowany z systemem powiadomień dla automatycznego dostarczania
    /// </summary>
    public class Reminder
    {
        /// <summary>
        /// Unikalny identyfikator przypomnienia
        /// Klucz główny tabeli - automatycznie generowany przez bazę danych
        /// Używany do zarządzania przypomnieniami i ich statusem
        /// Podstawa dla operacji edycji, usuwania i wyzwalania alertów
        /// </summary>
        public int Id { get; set; }
        
        /// <summary>
        /// Treść notatki/przypomnienia
        /// Wymagane pole - wiadomość którą użytkownik chce sobie przypomnieć
        /// Może zawierać opis zadania, ważne informacje lub instrukcje
        /// Wyświetlana w powiadomieniu gdy przypomnienie zostanie wyzwolone
        /// </summary>
        public string Note { get; set; } = default!;
        
        /// <summary>
        /// ID użytkownika dla którego przeznaczone jest przypomnienie
        /// Wymagane pole - określa właściciela przypomnienia
        /// Klucz obcy do tabeli Users - zapewnia prywatność przypomnień
        /// Używany do filtrowania przypomnień dla konkretnego użytkownika
        /// </summary>
        public int UserId { get; set; }

        /// <summary>
        /// Data i czas kiedy ma zostać wyświetlone przypomnienie
        /// Wymagane pole - określa moment wyzwolenia alertu
        /// Używane przez system powiadomień do sprawdzania terminów
        /// Podstawa dla chronologicznego sortowania i planowania przypomnień
        /// </summary>
        public DateTime RemindAt { get; set; }
    }

    /// <summary>
    /// Model reprezentujący usługę oferowaną przez firmę
    /// Służy do zarządzania katalogiem produktów i usług w systemie CRM
    /// Używany przy tworzeniu ofert, faktur i analizie sprzedaży
    /// Podstawa dla kalkulacji wartości zamówień i raportowania przychodów
    /// </summary>
    public class Service
    {
        /// <summary>
        /// Unikalny identyfikator usługi
        /// Klucz główny tabeli - automatycznie generowany przez bazę danych
        /// Używany do referencji usługi w zamówieniach i pozycjach faktur
        /// Podstawa dla relacji z innymi encjami dotyczącymi sprzedaży
        /// </summary>
        public int Id { get; set; }
        
        /// <summary>
        /// Nazwa usługi wyświetlana w systemie
        /// Wymagane pole - opisowa nazwa produktu/usługi
        /// Przykłady: "Konsultacje IT", "Serwis oprogramowania", "Szkolenie użytkowników"
        /// Wyświetlana w katalogach, ofertach i dokumentach sprzedażowych
        /// </summary>
        public string Name { get; set; } = default!;
        
        /// <summary>
        /// Cena jednostkowa usługi w walucie systemowej
        /// Wymagane pole - bazowa stawka za jednostkę usługi
        /// Używana do kalkulacji wartości pozycji w zamówieniach i fakturach
        /// Podstawa dla analiz rentowności i raportowania przychodów
        /// </summary>
        public decimal Price { get; set; }
    }

    /// <summary>
    /// Model reprezentujący zamówienie złożone przez klienta
    /// Służy do zarządzania procesem sprzedaży od zapytania do realizacji
    /// Poprzedza wystawienie faktury i może być podstawą dla umów
    /// Zawiera powiązanie z klientem i pozycjami zamówienia
    /// </summary>
    public class Order
    {
        /// <summary>
        /// Unikalny identyfikator zamówienia
        /// Klucz główny tabeli - automatycznie generowany przez bazę danych
        /// Używany do referencji zamówienia w całym procesie sprzedażowym
        /// Podstawa dla relacji z pozycjami zamówienia i faktorami
        /// </summary>
        public int Id { get; set; }
        
        /// <summary>
        /// ID klienta który złożył zamówienie
        /// Wymagane pole - każde zamówienie musi być przypisane do klienta
        /// Klucz obcy do tabeli Customers - zapewnia integralność danych
        /// Używane do grupowania zamówień według klientów i analizy sprzedaży
        /// </summary>
        public int CustomerId { get; set; }
        
        /// <summary>
        /// Data i czas utworzenia zamówienia
        /// Wymagane pole - znacznik czasowy złożenia zamówienia
        /// Używany do sortowania chronologicznego i analizy trendów sprzedaży
        /// Podstawa dla raportowania okresów sprzedażowych i planowania
        /// </summary>
        public DateTime CreatedAt { get; set; }
    }

    /// <summary>
    /// Model reprezentujący pozycję zamówienia
    /// Zawiera szczegóły dotyczące konkretnej usługi w ramach zamówienia
    /// Pozwala na zamówienia wielopozycyjne z różnymi usługami
    /// Relacja jeden-do-wielu z zamówieniami i referencja do katalogu usług
    /// </summary>
    public class OrderItem
    {
        /// <summary>
        /// Unikalny identyfikator pozycji zamówienia
        /// Klucz główny tabeli - automatycznie generowany przez bazę danych
        /// Używany do zarządzania poszczególnymi wierszami zamówienia
        /// Pozwala na edycję i usuwanie konkretnych pozycji
        /// </summary>
        public int Id { get; set; }
        
        /// <summary>
        /// ID zamówienia do którego należy pozycja
        /// Wymagane pole - tworzy związek pozycji z konkretnym zamówieniem
        /// Klucz obcy do tabeli Order - zapewnia integralność relacji
        /// Używane do grupowania pozycji według zamówień
        /// </summary>
        public int OrderId { get; set; }
        
        /// <summary>
        /// ID usługi z katalogu która jest zamawiana
        /// Wymagane pole - referencja do konkretnej usługi
        /// Klucz obcy do tabeli Service - łączy zamówienie z katalogiem
        /// Używane do pobierania nazwy, ceny i szczegółów usługi
        /// </summary>
        public int ServiceId { get; set; }
        
        /// <summary>
        /// Ilość zamawianej usługi
        /// Wymagane pole - liczba jednostek danej usługi
        /// Używana do kalkulacji całkowitej wartości pozycji (ilość × cena)
        /// Podstawa dla zarządzania zasobami i planowania realizacji
        /// </summary>
        public int Quantity { get; set; }
    }

    /// <summary>
    /// Model reprezentujący raport wygenerowany w systemie
    /// Służy do przechowywania informacji o stworzonych analizach i zestawieniach
    /// Pozwala na śledzenie historii raportowania i zarządzanie dokumentami
    /// Może być podstawą dla automatycznego generowania raportów cyklicznych
    /// </summary>
    public class Report
    {
        /// <summary>
        /// Unikalny identyfikator raportu
        /// Klucz główny tabeli - automatycznie generowany przez bazę danych
        /// Używany do referencji raportu w systemie zarządzania dokumentami
        /// Pozwala na katalogowanie i wyszukiwanie wygenerowanych raportów
        /// </summary>
        public int Id { get; set; }
        
        /// <summary>
        /// Tytuł raportu opisujący jego zawartość
        /// Wymagane pole - nazwa identyfikująca typ i zakres raportu
        /// Przykłady: "Sprzedaż miesięczna", "Analiza należności", "Ranking klientów"
        /// Wyświetlana w listach raportów i systemach archiwizacji
        /// </summary>
        public string Title { get; set; } = default!;
        
        /// <summary>
        /// Data i czas utworzenia raportu
        /// Wymagane pole - znacznik czasowy generacji raportu
        /// Używany do sortowania chronologicznego i zarządzania archiwum
        /// Pozwala na śledzenie częstotliwości generowania różnych typów raportów
        /// </summary>
        public DateTime CreatedAt { get; set; }
    }

    /// <summary>
    /// Model reprezentujący eksport danych z systemu
    /// Służy do śledzenia operacji eksportowania danych do plików zewnętrznych
    /// Pozwala na monitoring aktywności eksportowej i zarządzanie formatami
    /// Ważny dla audytu bezpieczeństwa i kontroli dostępu do danych
    /// </summary>
    public class Export
    {
        /// <summary>
        /// Unikalny identyfikator operacji eksportu
        /// Klucz główny tabeli - automatycznie generowany przez bazę danych
        /// Używany do śledzenia poszczególnych operacji eksportowych
        /// Pozwala na logowanie i audyt ekspor tów danych
        /// </summary>
        public int Id { get; set; }
        
        /// <summary>
        /// Format pliku eksportu
        /// Wymagane pole - określa typ wygenerowanego pliku
        /// Standardowe wartości: "PDF", "Excel", "CSV", "XML", "JSON"
        /// Używane do kategoryzacji eksportów i zarządzania kompatybilnością
        /// </summary>
        public string Format { get; set; } = default!;
        
        /// <summary>
        /// Data i czas wykonania eksportu
        /// Wymagane pole - znacznik czasowy operacji eksportowej
        /// Używany do sortowania chronologicznego i analizy aktywności
        /// Ważny dla audytu bezpieczeństwa i monitorowania dostępu do danych
        /// </summary>
        public DateTime ExportedAt { get; set; }
    }

    /// <summary>
    /// Model reprezentujący wiadomość między użytkownikami systemu
    /// Służy do wewnętrznej komunikacji w zespole i z klientami
    /// Pozwala na śledzenie korespondencji i historii kontaktów
    /// Może generować powiadomienia dla odbiorców o nowych wiadomościach
    /// </summary>
    public class Message
    {
        /// <summary>
        /// Unikalny identyfikator wiadomości
        /// Klucz główny tabeli - automatycznie generowany przez bazę danych
        /// Używany do referencji wiadomości w powiadomieniach i odpowiedziach
        /// Pozwala na tworzenie wątków konwersacji i śledzenie historii
        /// </summary>
        public int Id { get; set; }
        
        /// <summary>
        /// Temat wiadomości
        /// Wymagane pole - krótki opis treści wiadomości
        /// Wyświetlany w skrzynce odbiorczej dla szybkiej identyfikacji
        /// Może zawierać prefiksy typu "RE:" dla odpowiedzi lub "FWD:" dla przekazań
        /// </summary>
        public string Subject { get; set; } = default!;
        
        /// <summary>
        /// Treść wiadomości
        /// Wymagane pole - główna zawartość komunikatu
        /// Może zawierać tekst sformatowany, linki i podstawowe formatowanie
        /// Wyświetlana po otwarciu wiadomości przez odbiorcę
        /// </summary>
        public string Body { get; set; } = default!;
        
        /// <summary>
        /// ID użytkownika który wysłał wiadomość
        /// Wymagane pole - identyfikuje nadawcę komunikatu
        /// Klucz obcy do tabeli Users - zapewnia powiązanie z kontem nadawcy
        /// Używany do wyświetlania informacji o autorze w skrzynce odbiorczej
        /// </summary>
        public int SenderUserId { get; set; }
        
        /// <summary>
        /// Właściwość nawigacyjna do użytkownika nadawcy
        /// Wymagana relacja - umożliwia dostęp do danych nadawcy
        /// Pozwala na pobieranie imienia, nazwiska i zdjęcia nadawcy
        /// Używana do wyświetlania informacji kontaktowych nadawcy
        /// </summary>
        public virtual User SenderUser { get; set; } = null!;
        
        /// <summary>
        /// ID użytkownika który ma otrzymać wiadomość
        /// Wymagane pole - identyfikuje odbiorcę komunikatu
        /// Klucz obcy do tabeli Users - zapewnia dostarczenie do właściwego użytkownika
        /// Używany do filtrowania wiadomości dla konkretnego użytkownika
        /// </summary>
        public int RecipientUserId { get; set; }
        
        /// <summary>
        /// Właściwość nawigacyjna do użytkownika odbiorcy
        /// Wymagana relacja - umożliwia dostęp do danych odbiorcy
        /// Pozwala na pobieranie informacji o adresacie wiadomości
        /// Używana do personalizacji dostarczania i wyświetlania wiadomości
        /// </summary>
        public virtual User RecipientUser { get; set; } = null!;
        
        /// <summary>
        /// Data i czas wysłania wiadomości
        /// Wymagane pole - znacznik czasowy utworzenia komunikatu
        /// Używany do sortowania chronologicznego w skrzynce odbiorczej
        /// Podstawa dla określania świeżości wiadomości i archiwizacji
        /// </summary>
        public DateTime SentAt { get; set; }
        
        /// <summary>
        /// Flaga określająca czy wiadomość została przeczytana przez odbiorcę
        /// Wymagane pole - wskazuje status wiadomości dla odbiorcy
        /// False = nieprzeczytana, True = przeczytana
        /// Używana do wyróżniania nowych wiadomości i potwierdzenia odczytu
        /// </summary>
        public bool IsRead { get; set; }
    }

    /// <summary>
    /// Model reprezentujący notatkę w systemie CRM
    /// Służy do przechowywania nieoficjalnych informacji i komentarzy
    /// Może być powiązana z klientem lub być notatką ogólną użytkownika
    /// Pozwala na dodawanie kontekstu i historii interakcji
    /// </summary>
    public class Note
    {
        /// <summary>
        /// Unikalny identyfikator notatki
        /// Klucz główny tabeli - automatycznie generowany przez bazę danych
        /// Używany do zarządzania notatkami i ich edycji
        /// Pozwala na referencje notatek w innych częściach systemu
        /// </summary>
        public int Id { get; set; }
        
        /// <summary>
        /// Treść notatki
        /// Wymagane pole - główna zawartość notatki
        /// Może zawierać nieformalne komentarze, obserwacje i przypomnienia
        /// Wyświetlana w kontekście klienta lub w osobistych notatkach użytkownika
        /// </summary>
        public string Content { get; set; } = null!;
        
        /// <summary>
        /// Data i czas utworzenia notatki
        /// Wymagane pole - znacznik czasowy dodania notatki
        /// Używany do sortowania chronologicznego i śledzenia aktualności informacji
        /// Pozwala na analizę częstotliwości dodawania notatek przez użytkowników
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// ID klienta z którym powiązana jest notatka
        /// Opcjonalne pole - może być puste dla notatek ogólnych
        /// Klucz obcy do tabeli Customers - łączy notatkę z konkretnym klientem
        /// Używane do wyświetlania notatek w profilu klienta
        /// </summary>
        public int? CustomerId { get; set; }
        
        /// <summary>
        /// Właściwość nawigacyjna do klienta związanego z notatką
        /// Opcjonalna relacja - notatka może nie być powiązana z klientem
        /// Pozwala na dostęp do informacji o kliencie bez dodatkowych zapytań
        /// Używana do wyświetlania kontekstu notatki w interfejsie użytkownika
        /// </summary>
        public virtual Customer? Customer { get; set; }

        /// <summary>
        /// ID użytkownika który utworzył notatkę
        /// Opcjonalne pole - identyfikuje autora notatki
        /// Klucz obcy do tabeli Users - pozwala na śledzenie autorstwa
        /// Używane do filtrowania notatek według autora i personalizacji
        /// </summary>
        public int? UserId { get; set; }
        
        /// <summary>
        /// Właściwość nawigacyjna do użytkownika autora notatki
        /// Opcjonalna relacja - pozwala na dostęp do danych autora
        /// Używana do wyświetlania informacji o tym kto dodał notatkę
        /// Pozwala na kontakt z autorem w przypadku pytań o szczegóły
        /// </summary>
        public virtual User? User { get; set; }
    }

    /// <summary>
    /// Model reprezentujący ustawienie systemu
    /// Służy do przechowywania konfiguracji aplikacji w bazie danych
    /// Pozwala na dynamiczną zmianę parametrów bez restartu systemu
    /// Używany do personalizacji zachowania systemu według preferencji użytkowników
    /// </summary>
    public class Setting
    {
        /// <summary>
        /// Unikalny identyfikator ustawienia
        /// Klucz główny tabeli - automatycznie generowany przez bazę danych
        /// Używany do zarządzania ustawieniami i ich edycji
        /// Pozwala na organizację konfiguracji w interfejsie administracyjnym
        /// </summary>
        public int Id { get; set; }
        
        /// <summary>
        /// Klucz identyfikujący ustawienie
        /// Wymagane pole - unikalny identyfikator tekstowy parametru
        /// Przykłady: "company_name", "default_currency", "email_notifications"
        /// Używany w kodzie aplikacji do pobierania konkretnych wartości konfiguracji
        /// </summary>
        public string Key { get; set; } = default!;
        
        /// <summary>
        /// Wartość ustawienia
        /// Wymagane pole - przechowuje faktyczną wartość parametru konfiguracyjnego
        /// Może zawierać tekst, liczby, wartości boolean jako string
        /// Interpretowana przez aplikację zgodnie z typem oczekiwanym dla danego klucza
        /// </summary>
        public string Value { get; set; } = default!;
    }

    /// <summary>
    /// Model reprezentujący grupę użytkowników w systemie
    /// Służy do organizacji zespołów roboczych i przydzielania obowiązków
    /// Pozwala na grupowanie użytkowników według działu, projektu lub roli
    /// Umożliwia zbiorowe przypisywanie zadań i uprawnień do zespołów
    /// </summary>
    public class Group
    {
        /// <summary>
        /// Unikalny identyfikator grupy
        /// Klucz główny tabeli - automatycznie generowany przez bazę danych
        /// Używany do referencji grupy w przypisaniach i relacjach
        /// Podstawa dla zarządzania uprawnieniami i organizacji pracy zespołowej
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Nazwa grupy
        /// Wymagane pole - opisowa nazwa zespołu lub działu
        /// Przykłady: "Sprzedaż", "Serwis techniczny", "Księgowość", "Zarząd"
        /// Wyświetlana w interfejsie użytkownika i raportach organizacyjnych
        /// </summary>
        public required string Name { get; set; }

        /// <summary>
        /// Opis grupy - dodatkowe informacje o zespole
        /// Opcjonalne pole - szczegółowy opis zakresu odpowiedzialności
        /// Może zawierać informacje o celach, zadaniach i kompetencjach grupy
        /// Używane w dokumentacji organizacyjnej i szkoleń nowych pracowników
        /// </summary>
        public string? Description { get; set; }

        /// <summary>
        /// Kolekcja powiązań użytkowników z grupą
        /// Relacja wiele-do-wielu przez tabelę łączącą UserGroup
        /// Pozwala na przypisywanie wielu użytkowników do grupy i vice versa
        /// Inicjalizowana pustą listą aby uniknąć błędów null reference
        /// </summary>
        public virtual ICollection<UserGroup> UserGroups { get; set; } = new List<UserGroup>();

        /// <summary>
        /// Kolekcja klientów przypisanych do grupy
        /// Relacja jeden-do-wielu - grupa może obsługiwać wielu klientów
        /// Pozwala na podział klientów między różne zespoły specjalistyczne
        /// Używana do filtrowania klientów według odpowiedzialnych zespołów
        /// </summary>
        public virtual ICollection<Customer> AssignedCustomers { get; set; } = new List<Customer>();
        
        /// <summary>
        /// Kolekcja kontraktów za które odpowiada grupa
        /// Relacja jeden-do-wielu - grupa może zarządzać wieloma kontraktami
        /// Pozwala na przypisanie odpowiedzialności za realizację umów
        /// Używana do raportowania i śledzenia obciążenia zespołów
        /// </summary>
        public virtual ICollection<Contract> ResponsibleContracts { get; set; } = new List<Contract>();
        
        /// <summary>
        /// Kolekcja faktur przypisanych do grupy
        /// Relacja jeden-do-wielu - grupa może obsługiwać wiele faktur
        /// Pozwala na podział obowiązków księgowych między zespoły
        /// Używana do kontroli przepływu dokumentów finansowych
        /// </summary>
        public virtual ICollection<Invoice> AssignedInvoices { get; set; } = new List<Invoice>();
        
        /// <summary>
        /// Kolekcja spotkań przypisanych do grupy
        /// Relacja jeden-do-wielu - grupa może być odpowiedzialna za wiele spotkań
        /// Pozwala na organizację kalendarza zespołowego i planowanie zasobów
        /// Używana do koordynacji działań między członkami zespołu
        /// </summary>
        public virtual ICollection<Meeting> AssignedMeetings { get; set; } = new List<Meeting>();
        
        /// <summary>
        /// Kolekcja zadań przypisanych do grupy
        /// Relacja jeden-do-wielu - grupa może mieć przypisane wiele zadań
        /// Pozwala na zbiorowe zarządzanie obowiązkami zespołu
        /// Używana do śledzenia postępu pracy i obciążenia grup
        /// </summary>
        public virtual ICollection<TaskItem> AssignedTasks { get; set; } = new List<TaskItem>();
    }

    /// <summary>
    /// Model reprezentujący powiązanie użytkownika z grupą
    /// Tabela łącząca dla relacji wiele-do-wielu między użytkownikami a grupami
    /// Pozwala użytkownikowi należeć do wielu grup jednocześnie
    /// Umożliwia elastyczną organizację zespołów projektowych i funkcjonalnych
    /// </summary>
    public class UserGroup
    {
        /// <summary>
        /// ID użytkownika należącego do grupy
        /// Wymagane pole - część klucza złożonego tabeli łączącej
        /// Klucz obcy do tabeli Users - zapewnia integralność danych
        /// Używany do identyfikacji członka zespołu w relacji
        /// </summary>
        public int UserId { get; set; }
        
        /// <summary>
        /// Właściwość nawigacyjna do użytkownika w grupie
        /// Wymagana relacja - umożliwia dostęp do danych członka zespołu
        /// Pozwala na pobieranie informacji o użytkowniku bez dodatkowych zapytań
        /// Używana do wyświetlania listy członków grupy w interfejsie
        /// </summary>
        public required User User { get; set; }

        /// <summary>
        /// ID grupy do której należy użytkownik
        /// Wymagane pole - część klucza złożonego tabeli łączącej
        /// Klucz obcy do tabeli Group - zapewnia integralność relacji
        /// Używany do identyfikacji zespołu w powiązaniu użytkownik-grupa
        /// </summary>
        public int GroupId { get; set; }
        
        /// <summary>
        /// Właściwość nawigacyjna do grupy w relacji
        /// Wymagana relacja - umożliwia dostęp do danych zespołu
        /// Pozwala na pobieranie informacji o grupie bez dodatkowych zapytań
        /// Używana do wyświetlania nazwy grupy w profilu użytkownika
        /// </summary>
        public required Group Group { get; set; }
    }

    /// <summary>
    /// Model reprezentujący przypisanie użytkownika do grupy użytkowników
    /// Alternatywna struktura dla zarządzania członkostwem w grupach
    /// Może służyć do przechowywania dodatkowych metadanych o przynależności
    /// Używany w bardziej złożonych scenariuszach zarządzania zespołami
    /// </summary>
    public class UserGroupAssignment
    {
        /// <summary>
        /// Unikalny identyfikator przypisania
        /// Klucz główny tabeli - automatycznie generowany przez bazę danych
        /// Używany do zarządzania przypisaniami i ich historią
        /// Pozwala na śledzenie zmian w składzie zespołów
        /// </summary>
        public int Id { get; set; }
        
        /// <summary>
        /// ID użytkownika w przypisaniu
        /// Wymagane pole - identyfikuje członka zespołu
        /// Klucz obcy do tabeli Users - łączy przypisanie z kontem użytkownika
        /// Używany do grupowania przypisań według użytkowników
        /// </summary>
        public int UserId { get; set; }
        
        /// <summary>
        /// ID grupy użytkowników w przypisaniu
        /// Wymagane pole - identyfikuje docelowy zespół
        /// Referencja do tabeli UserGroup lub Group w zależności od implementacji
        /// Używany do zarządzania składem zespołów i rotacji członków
        /// </summary>
        public int UserGroupId { get; set; }
    }

    /// <summary>
    /// Model reprezentujący tag (etykietę) w systemie CRM
    /// Służy do kategoryzowania i organizowania różnych encji systemu
    /// Pozwala na elastyczne grupowanie danych według dowolnych kryteriów
    /// Uniwersalny system tagowania zwiększający możliwości wyszukiwania i filtrowania
    /// </summary>
    public class Tag
    {
        /// <summary>
        /// Unikalny identyfikator tagu
        /// Klucz główny tabeli - automatycznie generowany przez bazę danych
        /// Używany do referencji tagu w powiązaniach z innymi encjami
        /// Podstawa dla systemu kategoryzacji w całej aplikacji
        /// </summary>
        public int Id { get; set; }
        
        /// <summary>
        /// Nazwa tagu wyświetlana w interfejsie użytkownika
        /// Wymagane pole - tekstowa etykieta identyfikująca tag
        /// Przykłady: "VIP Klient", "Pilne", "Eksport", "Stały klient", "Duża firma"
        /// Używana w interfejsie do wyświetlania i wyszukiwania tagów
        /// </summary>
        public string Name { get; set; } = default!;
        
        /// <summary>
        /// Kolor tagu dla wizualnej identyfikacji
        /// Opcjonalne pole - kod koloru w formacie hex (np. "#FF5733")
        /// Używany do kolorowego wyróżniania tagów w interfejsie użytkownika
        /// Pomaga w szybkiej identyfikacji kategorii i priorytetów wizualnie
        /// </summary>
        public string? Color { get; set; }
        
        /// <summary>
        /// Szczegółowy opis znaczenia i zastosowania tagu
        /// Opcjonalne pole - dodatkowy kontekst dla administratorów i użytkowników
        /// Może zawierać instrukcje kiedy stosować tag i jego znaczenie biznesowe
        /// Używane w dokumentacji systemu i szkoleniach użytkowników
        /// </summary>
        public string? Description { get; set; }

        /// <summary>
        /// Kolekcja powiązań tagu z klientami
        /// Relacja wiele-do-wielu przez tabelę łączącą CustomerTag
        /// Pozwala na tagowanie klientów według różnych kryteriów biznesowych
        /// Inicjalizowana pustą listą aby uniknąć błędów null reference
        /// </summary>
        public virtual ICollection<CustomerTag> CustomerTags { get; set; } = new List<CustomerTag>();
        
        /// <summary>
        /// Kolekcja powiązań tagu z kontraktami
        /// Relacja wiele-do-wielu przez tabelę łączącą ContractTag  
        /// Pozwala na kategoryzowanie kontraktów (typ, status, priorytet)
        /// Ułatwia zarządzanie portfelem umów i raportowanie
        /// </summary>
        public virtual ICollection<ContractTag> ContractTags { get; set; } = new List<ContractTag>();
        
        /// <summary>
        /// Kolekcja powiązań tagu z fakturami
        /// Relacja wiele-do-wielu przez tabelę łączącą InvoiceTag
        /// Pozwala na tagowanie faktur według typu, pilności lub statusu
        /// Używana do organizacji procesów księgowych i kontroli płatności
        /// </summary>
        public virtual ICollection<InvoiceTag> InvoiceTags { get; set; } = new List<InvoiceTag>();
        
        /// <summary>
        /// Kolekcja powiązań tagu z zadaniami
        /// Relacja wiele-do-wielu przez tabelę łączącą TaskTag
        /// Pozwala na kategoryzowanie zadań według typu, priorytetu lub działu
        /// Używana do organizacji pracy i śledzenia postępów projektów
        /// </summary>
        public virtual ICollection<TaskTag> TaskTags { get; set; } = new List<TaskTag>();
        
        /// <summary>
        /// Kolekcja powiązań tagu ze spotkaniami
        /// Relacja wiele-do-wielu przez tabelę łączącą MeetingTag
        /// Pozwala na kategoryzowanie spotkań według typu, celu lub działu
        /// Używana do organizacji kalendarza i analizy aktywności zespołów
        /// </summary>
        public virtual ICollection<MeetingTag> MeetingTags { get; set; } = new List<MeetingTag>();
    }

    /// <summary>
    /// Model reprezentujący powiązanie klienta z tagiem
    /// Tabela łącząca dla relacji wiele-do-wielu między klientami a tagami
    /// Pozwala na przypisywanie wielu tagów do jednego klienta i vice versa
    /// Używana do kategoryzowania klientów według różnych kryteriów biznesowych
    /// </summary>
    public class CustomerTag
    {
        /// <summary>
        /// Unikalny identyfikator powiązania klient-tag
        /// Klucz główny tabeli łączącej - automatycznie generowany
        /// Używany do zarządzania indywidualnymi powiązaniami tagów z klientami
        /// Pozwala na dodawanie i usuwanie konkretnych tagów dla klientów
        /// </summary>
        public int Id { get; set; }
        
        /// <summary>
        /// ID klienta w powiązaniu z tagiem
        /// Wymagane pole - identyfikuje klienta w relacji
        /// Klucz obcy do tabeli Customers - zapewnia integralność danych
        /// Używany do grupowania tagów według klientów
        /// </summary>
        public int CustomerId { get; set; }
        
        /// <summary>
        /// ID tagu w powiązaniu z klientem
        /// Wymagane pole - identyfikuje tag w relacji
        /// Klucz obcy do tabeli Tag - zapewnia integralność relacji
        /// Używany do znajdowania wszystkich klientów z danym tagiem
        /// </summary>
        public int TagId { get; set; }
        
        /// <summary>
        /// Właściwość nawigacyjna do klienta w powiązaniu
        /// Wymagana relacja - umożliwia dostęp do danych klienta
        /// Pozwala na pobieranie informacji o kliencie bez dodatkowych zapytań
        /// Używana do wyświetlania szczegółów klienta przy przeglądaniu tagów
        /// </summary>
        public virtual Customer Customer { get; set; } = null!;
        
        /// <summary>
        /// Właściwość nawigacyjna do tagu w powiązaniu
        /// Wymagana relacja - umożliwia dostęp do danych tagu
        /// Pozwala na pobieranie nazwy i koloru tagu bez dodatkowych zapytań
        /// Używana do wyświetlania tagów w profilu klienta
        /// </summary>
        public virtual Tag Tag { get; set; } = null!;
    }

    /// <summary>
    /// Model reprezentujący powiązanie kontraktu z tagiem
    /// Tabela łącząca dla relacji wiele-do-wielu między kontraktami a tagami
    /// Pozwala na kategoryzowanie kontraktów według typu, statusu lub priorytetu
    /// Ułatwia zarządzanie portfelem umów i organizację procesów biznesowych
    /// </summary>
    public class ContractTag
    {
        /// <summary>
        /// Unikalny identyfikator powiązania kontrakt-tag
        /// Klucz główny tabeli łączącej - automatycznie generowany
        /// Używany do zarządzania tagowaniem poszczególnych kontraktów
        /// Pozwala na precyzyjne dodawanie i usuwanie tagów dla umów
        /// </summary>
        public int Id { get; set; }
        
        /// <summary>
        /// ID kontraktu w powiązaniu z tagiem
        /// Wymagane pole - identyfikuje kontrakt w relacji
        /// Klucz obcy do tabeli Contract - zapewnia integralność danych
        /// Używany do grupowania tagów według kontraktów
        /// </summary>
        public int ContractId { get; set; }
        
        /// <summary>
        /// ID tagu w powiązaniu z kontraktem
        /// Wymagane pole - identyfikuje tag w relacji
        /// Klucz obcy do tabeli Tag - zapewnia integralność relacji
        /// Używany do znajdowania wszystkich kontraktów z danym tagiem
        /// </summary>
        public int TagId { get; set; }
        
        /// <summary>
        /// Właściwość nawigacyjna do kontraktu w powiązaniu
        /// Wymagana relacja - umożliwia dostęp do danych kontraktu
        /// Pozwala na pobieranie szczegółów umowy bez dodatkowych zapytań
        /// Używana do wyświetlania informacji o kontrakcie przy analizie tagów
        /// </summary>
        public virtual Contract Contract { get; set; } = null!;
        
        /// <summary>
        /// Właściwość nawigacyjna do tagu w powiązaniu
        /// Wymagana relacja - umożliwia dostęp do danych tagu
        /// Pozwala na pobieranie nazwy i koloru tagu bez dodatkowych zapytań
        /// Używana do wyświetlania tagów w szczegółach kontraktu
        /// </summary>
        public virtual Tag Tag { get; set; } = null!;
    }

    /// <summary>
    /// Model reprezentujący powiązanie faktury z tagiem
    /// Tabela łącząca dla relacji wiele-do-wielu między fakturami a tagami
    /// Pozwala na kategoryzowanie faktur według typu, pilności lub statusu płatności
    /// Ułatwia organizację procesów księgowych i kontrolę należności
    /// </summary>
    public class InvoiceTag
    {
        /// <summary>
        /// Unikalny identyfikator powiązania faktura-tag
        /// Klucz główny tabeli łączącej - automatycznie generowany
        /// Używany do zarządzania tagowaniem poszczególnych faktur
        /// Pozwala na elastyczne dodawanie i usuwanie kategorii dla dokumentów
        /// </summary>
        public int Id { get; set; }
        
        /// <summary>
        /// ID faktury w powiązaniu z tagiem
        /// Wymagane pole - identyfikuje fakturę w relacji
        /// Klucz obcy do tabeli Invoice - zapewnia integralność danych
        /// Używany do grupowania tagów według dokumentów finansowych
        /// </summary>
        public int InvoiceId { get; set; }
        
        /// <summary>
        /// ID tagu w powiązaniu z fakturą
        /// Wymagane pole - identyfikuje tag w relacji
        /// Klucz obcy do tabeli Tag - zapewnia integralność relacji
        /// Używany do znajdowania wszystkich faktur z daną kategorią
        /// </summary>
        public int TagId { get; set; }
        
        /// <summary>
        /// Właściwość nawigacyjna do faktury w powiązaniu
        /// Wymagana relacja - umożliwia dostęp do danych faktury
        /// Pozwala na pobieranie szczegółów dokumentu bez dodatkowych zapytań
        /// Używana do wyświetlania informacji o fakturze przy analizie tagów
        /// </summary>
        public virtual Invoice Invoice { get; set; } = null!;
        
        /// <summary>
        /// Właściwość nawigacyjna do tagu w powiązaniu
        /// Wymagana relacja - umożliwia dostęp do danych tagu
        /// Pozwala na pobieranie nazwy i koloru tagu bez dodatkowych zapytań
        /// Używana do wyświetlania kategorii w szczegółach faktury
        /// </summary>
        public virtual Tag Tag { get; set; } = null!;
    }

    /// <summary>
    /// Model reprezentujący powiązanie zadania z tagiem
    /// Tabela łącząca dla relacji wiele-do-wielu między zadaniami a tagami
    /// Pozwala na kategoryzowanie zadań według typu, priorytetu lub działu
    /// Ułatwia organizację pracy i śledzenie postępów w projektach
    /// </summary>
    public class TaskTag
    {
        /// <summary>
        /// Unikalny identyfikator powiązania zadanie-tag
        /// Klucz główny tabeli łączącej - automatycznie generowany
        /// Używany do zarządzania kategoryzacją poszczególnych zadań
        /// Pozwala na dynamiczne dodawanie i usuwanie etykiet dla zadań
        /// </summary>
        public int Id { get; set; }
        
        /// <summary>
        /// ID zadania w powiązaniu z tagiem
        /// Wymagane pole - identyfikuje zadanie w relacji
        /// Klucz obcy do tabeli TaskItem - zapewnia integralność danych
        /// Używany do grupowania tagów według zadań projektowych
        /// </summary>
        public int TaskId { get; set; }
        
        /// <summary>
        /// ID tagu w powiązaniu z zadaniem
        /// Wymagane pole - identyfikuje tag w relacji
        /// Klucz obcy do tabeli Tag - zapewnia integralność relacji
        /// Używany do znajdowania wszystkich zadań z daną kategorią
        /// </summary>
        public int TagId { get; set; }
        
        /// <summary>
        /// Właściwość nawigacyjna do zadania w powiązaniu
        /// Wymagana relacja - umożliwia dostęp do danych zadania
        /// Pozwala na pobieranie szczegółów zadania bez dodatkowych zapytań
        /// Używana do wyświetlania informacji o zadaniu przy analizie tagów
        /// </summary>
        public virtual TaskItem Task { get; set; } = null!;
        
        /// <summary>
        /// Właściwość nawigacyjna do tagu w powiązaniu
        /// Wymagana relacja - umożliwia dostęp do danych tagu
        /// Pozwala na pobieranie nazwy i koloru tagu bez dodatkowych zapytań
        /// Używana do wyświetlania kategorii w szczegółach zadania
        /// </summary>
        public virtual Tag Tag { get; set; } = null!;
    }

    /// <summary>
    /// Model reprezentujący powiązanie spotkania z tagiem
    /// Tabela łącząca dla relacji wiele-do-wielu między spotkaniami a tagami
    /// Pozwala na kategoryzowanie spotkań według typu, celu lub uczestników
    /// Ułatwia organizację kalendarza i analizę aktywności zespołów
    /// </summary>
    public class MeetingTag
    {
        /// <summary>
        /// Unikalny identyfikator powiązania spotkanie-tag
        /// Klucz główny tabeli łączącej - automatycznie generowany
        /// Używany do zarządzania kategoryzacją poszczególnych spotkań
        /// Pozwala na elastyczne tagowanie wydarzeń kalendarzowych
        /// </summary>
        public int Id { get; set; }
        
        /// <summary>
        /// ID spotkania w powiązaniu z tagiem
        /// Wymagane pole - identyfikuje spotkanie w relacji
        /// Klucz obcy do tabeli Meeting - zapewnia integralność danych
        /// Używany do grupowania tagów według wydarzeń kalendarzowych
        /// </summary>
        public int MeetingId { get; set; }
        
        /// <summary>
        /// ID tagu w powiązaniu ze spotkaniem
        /// Wymagane pole - identyfikuje tag w relacji
        /// Klucz obcy do tabeli Tag - zapewnia integralność relacji
        /// Używany do znajdowania wszystkich spotkań z daną kategorią
        /// </summary>
        public int TagId { get; set; }
        
        /// <summary>
        /// Właściwość nawigacyjna do spotkania w powiązaniu
        /// Wymagana relacja - umożliwia dostęp do danych spotkania
        /// Pozwala na pobieranie szczegółów wydarzenia bez dodatkowych zapytań
        /// Używana do wyświetlania informacji o spotkaniu przy analizie tagów
        /// </summary>
        public virtual Meeting Meeting { get; set; } = null!;
        
        /// <summary>
        /// Właściwość nawigacyjna do tagu w powiązaniu
        /// Wymagana relacja - umożliwia dostęp do danych tagu
        /// Pozwala na pobieranie nazwy i koloru tagu bez dodatkowych zapytań
        /// Używana do wyświetlania kategorii w szczegółach spotkania
        /// </summary>
        public virtual Tag Tag { get; set; } = null!;
    }

    /// <summary>
    /// Model reprezentujący adres klienta w systemie CRM
    /// Służy do przechowywania informacji o lokalizacji klienta
    /// Pozwala na zarządzanie wieloma adresami dla jednego klienta
    /// Używany do generowania dokumentów, planowania wizyt i wysyłek
    /// </summary>
    public class Address
    {
        /// <summary>
        /// Unikalny identyfikator adresu
        /// Klucz główny tabeli - automatycznie generowany przez bazę danych
        /// Używany do referencji adresu w innych częściach systemu
        /// Pozwala na zarządzanie wieloma adresami jednego klienta
        /// </summary>
        public int Id { get; set; }
        
        /// <summary>
        /// ID klienta do którego należy adres
        /// Wymagane pole - każdy adres musi być przypisany do konkretnego klienta
        /// Klucz obcy do tabeli Customers - zapewnia integralność relacyjną
        /// Używany do grupowania adresów według klientów w systemie
        /// </summary>
        public int CustomerId { get; set; }
        
        /// <summary>
        /// Nazwa ulicy wraz z numerem budynku
        /// Wymagane pole - główna część adresu pocztowego
        /// Przykłady: "ul. Warszawska 15", "Al. Jerozolimskie 123A/5"
        /// Używana w dokumentach, etykietach wysyłkowych i nawigacji GPS
        /// </summary>
        public string Street { get; set; } = default!;
        
        /// <summary>
        /// Nazwa miasta w którym znajduje się adres
        /// Wymagane pole - lokalizacja geograficzna klienta
        /// Używana do planowania tras, analizy geograficznej klientów
        /// Podstawa dla raportowania regionalnego i organizacji wizyt
        /// </summary>
        public string City { get; set; } = default!;
    }

    /// <summary>
    /// Model reprezentujący wydarzenie kalendarzowe w systemie
    /// Służy do zarządzania kalendarzem firmowym i planowania działań
    /// Różni się od spotkań tym że może być bardziej ogólnym wydarzeniem
    /// Używany do organizacji czasu pracy i planowania zasobów zespołu
    /// </summary>
    public class CalendarEvent
    {
        /// <summary>
        /// Unikalny identyfikator wydarzenia kalendarzowego
        /// Klucz główny tabeli - automatycznie generowany przez bazę danych
        /// Używany do referencji wydarzenia w kalendarzu i powiadomieniach
        /// Pozwala na zarządzanie i edycję poszczególnych wydarzeń
        /// </summary>
        public int Id { get; set; }
        
        /// <summary>
        /// Tytuł wydarzenia wyświetlany w kalendarzu
        /// Wymagane pole - krótki opis wydarzenia
        /// Przykłady: "Prezentacja kwartalna", "Szkolenie zespołu", "Urlop Jan Kowalski"
        /// Wyświetlany w widoku kalendarzowym dla szybkiej identyfikacji
        /// </summary>
        public string Title { get; set; } = default!;
        
        /// <summary>
        /// Data i czas rozpoczęcia wydarzenia
        /// Wymagane pole - określa kiedy wydarzenie się rozpoczyna
        /// Używane do sortowania chronologicznego w kalendarzu
        /// Podstawa dla alertów i przypomnień o nadchodzących wydarzeniach
        /// </summary>
        public DateTime Start { get; set; }
        
        /// <summary>
        /// Data i czas zakończenia wydarzenia
        /// Wymagane pole - określa kiedy wydarzenie się kończy
        /// Używane do kalkulacji czasu trwania i planowania nakładających się wydarzeń
        /// Pozwala na precyzyjne zarządzanie czasem i zasobami zespołu
        /// </summary>
        public DateTime End { get; set; }
    }
}
