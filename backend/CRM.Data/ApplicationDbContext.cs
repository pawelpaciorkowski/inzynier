// Importowanie biblioteki Entity Framework Core do obsługi bazy danych
using Microsoft.EntityFrameworkCore;
// Importowanie modeli danych z przestrzeni nazw CRM.Data.Models
using CRM.Data.Models;

namespace CRM.Data
{
    /// <summary>
    /// Główny kontekst bazy danych dla systemu CRM.
    /// Dziedziczy po DbContext z Entity Framework Core i zarządza wszystkimi tabelami w bazie danych.
    /// Odpowiada za mapowanie obiektów C# na tabele bazy danych oraz zarządzanie połączeniami i operacjami CRUD.
    /// </summary>
    public class ApplicationDbContext : DbContext
    {
        /// <summary>
        /// Konstruktor kontekstu bazy danych.
        /// Przyjmuje opcje konfiguracyjne typu DbContextOptions<ApplicationDbContext> które zawierają
        /// informacje o połączeniu z bazą danych, providerze bazy danych i inne ustawienia.
        /// </summary>
        /// <param name="options">Opcje konfiguracyjne dla kontekstu bazy danych</param>
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options) // Wywołanie konstruktora klasy bazowej DbContext z przekazanymi opcjami
        {
            // Konstruktor nie zawiera dodatkowej logiki - wszystkie ustawienia są przekazywane do klasy bazowej
        }

        // === PODSTAWOWE ENCJE SYSTEMU CRM ===
        
        /// <summary>
        /// Zbiór użytkowników systemu. Zawiera dane logowania, role i informacje o pracownikach firmy.
        /// </summary>
        public DbSet<User> Users { get; set; }
        
        /// <summary>
        /// Zbiór klientów firmy. Przechowuje dane kontaktowe, historię współpracy i preferencje klientów.
        /// </summary>
        public DbSet<Customer> Customers { get; set; }
        
        /// <summary>
        /// Zbiór zadań do wykonania. Umożliwia zarządzanie projektami i przypisywanie zadań użytkownikom.
        /// </summary>
        public DbSet<TaskItem> Tasks { get; set; }
        
        /// <summary>
        /// Zbiór ról użytkowników. Definiuje uprawnienia i poziomy dostępu w systemie.
        /// </summary>
        public DbSet<Role> Roles { get; set; }
        
        /// <summary>
        /// Zbiór aktywności w systemie. Loguje działania użytkowników dla celów audytowych.
        /// </summary>
        public DbSet<Activity> Activities { get; set; }

        // === MODUŁ FINANSOWY ===
        
        /// <summary>
        /// Zbiór umów z klientami. Zawiera warunki współpracy, terminy i zobowiązania stron.
        /// </summary>
        public DbSet<Contract> Contracts { get; set; }
        
        /// <summary>
        /// Zbiór faktur wystawionych klientom. Przechowuje informacje o sprzedaży i należnościach.
        /// </summary>
        public DbSet<Invoice> Invoices { get; set; }
        
        /// <summary>
        /// Zbiór płatności otrzymanych od klientów. Śledzi wpłaty i stan rozliczeń.
        /// </summary>
        public DbSet<Payment> Payments { get; set; }
        
        // === ZARZĄDZANIE DOKUMENTAMI I SZABLONAMI ===
        
        /// <summary>
        /// Zbiór plików użytkowników. Przechowuje dokumenty, zdjęcia i inne pliki związane z projektami.
        /// </summary>
        public DbSet<UserFile> Files { get; set; }
        
        /// <summary>
        /// Zbiór szablonów dokumentów. Umożliwia tworzenie ujednoliconych formatów dokumentów.
        /// </summary>
        public DbSet<Template> Templates { get; set; }
        
        // === MODUŁ AUDYTU I LOGOWANIA ===
        
        /// <summary>
        /// Zbiór logów audytowych. Śledzi zmiany w systemie dla zachowania integralności danych.
        /// </summary>
        public DbSet<AuditLog> AuditLogs { get; set; }
        
        /// <summary>
        /// Zbiór historii logowania. Przechowuje informacje o sesjach użytkowników i bezpieczeństwie.
        /// </summary>
        public DbSet<LoginHistory> LoginHistories { get; set; }
        
        /// <summary>
        /// Zbiór logów systemowych. Rejestruje błędy, ostrzeżenia i informacje diagnostyczne.
        /// </summary>
        public DbSet<SystemLog> SystemLogs { get; set; }
        
        // === MODUŁ KOMUNIKACJI ===
        
        /// <summary>
        /// Zbiór powiadomień systemowych. Informuje użytkowników o ważnych wydarzeniach i zadaniach.
        /// </summary>
        public DbSet<Notification> Notifications { get; set; }
        
        /// <summary>
        /// Zbiór wiadomości między użytkownikami. Umożliwia komunikację wewnętrzną w zespole.
        /// </summary>
        public DbSet<Message> Messages { get; set; }
        
        /// <summary>
        /// Zbiór notatek. Przechowuje dodatkowe informacje i komentarze użytkowników.
        /// </summary>
        public DbSet<Note> Notes { get; set; }
        
        // === MODUŁ KALENDARZA I SPOTKAŃ ===
        
        /// <summary>
        /// Zbiór spotkań z klientami. Zarządza harmonogramem i planowaniem wizyt.
        /// </summary>
        public DbSet<Meeting> Meetings { get; set; }
        
        /// <summary>
        /// Zbiór przypomnień o ważnych terminach. Automatycznie powiadamia o zbliżających się datach.
        /// </summary>
        public DbSet<Reminder> Reminders { get; set; }
        
        /// <summary>
        /// Zbiór wydarzeń kalendarzowych. Zarządza harmonogramem pracy i terminami.
        /// </summary>
        public DbSet<CalendarEvent> CalendarEvents { get; set; }
        
        // === MODUŁ USŁUG I ZAMÓWIEŃ ===
        
        /// <summary>
        /// Zbiór usług oferowanych przez firmę. Definiuje katalog produktów i cennik.
        /// </summary>
        public DbSet<Service> Services { get; set; }
        
        /// <summary>
        /// Zbiór zamówień złożonych przez klientów. Zarządza procesem sprzedaży.
        /// </summary>
        public DbSet<Order> Orders { get; set; }
        
        /// <summary>
        /// Zbiór pozycji zamówienia. Szczegółowe informacje o zamówionych produktach/usługach.
        /// </summary>
        public DbSet<OrderItem> OrderItems { get; set; }
        
        /// <summary>
        /// Zbiór pozycji faktury. Szczegółowe elementy każdej wystawionej faktury.
        /// </summary>
        public DbSet<InvoiceItem> InvoiceItems { get; set; }
        
        /// <summary>
        /// Zbiór stawek podatkowych. Definiuje różne rodzaje podatków stosowanych w fakturowaniu.
        /// </summary>
        public DbSet<TaxRate> TaxRates { get; set; }
        
        // === MODUŁ RAPORTOWANIA ===
        
        /// <summary>
        /// Zbiór raportów systemowych. Generuje analizy danych dla zarządu firmy.
        /// </summary>
        public DbSet<Report> Reports { get; set; }
        
        /// <summary>
        /// Zbiór eksportów danych. Zarządza procesem eksportowania informacji do zewnętrznych systemów.
        /// </summary>
        public DbSet<Export> Exports { get; set; }
        
        // === MODUŁ KONFIGURACJI ===
        
        /// <summary>
        /// Zbiór ustawień systemowych. Przechowuje konfigurację aplikacji i preferencje użytkowników.
        /// </summary>
        public DbSet<Setting> Settings { get; set; }
        
        /// <summary>
        /// Zbiór adresów. Zarządza informacjami o lokalizacjach klientów i firm.
        /// </summary>
        public DbSet<Address> Addresses { get; set; }
        
        // === MODUŁ GRUP I TAGOWANIA ===
        
        /// <summary>
        /// Zbiór grup użytkowników. Organizuje użytkowników w zespoły i departamenty.
        /// </summary>
        public DbSet<Group> Groups { get; set; }
        
        /// <summary>
        /// Zbiór przynależności użytkowników do grup. Tabela many-to-many łącząca użytkowników z grupami.
        /// </summary>
        public DbSet<UserGroup> UserGroups { get; set; }
        
        /// <summary>
        /// Zbiór przypisań użytkowników do grup. Zarządza członkostwem w grupach z dodatkowymi informacjami.
        /// </summary>
        public DbSet<UserGroupAssignment> UserGroupAssignments { get; set; }
        
        /// <summary>
        /// Zbiór tagów systemowych. Umożliwia kategoryzowanie i etykietowanie różnych elementów.
        /// </summary>
        public DbSet<Tag> Tags { get; set; }
        
        /// <summary>
        /// Zbiór tagów klientów. Łączy klientów z odpowiednimi etykietami dla lepszej organizacji.
        /// </summary>
        public DbSet<CustomerTag> CustomerTags { get; set; }
        
        /// <summary>
        /// Zbiór tagów umów. Kategoryzuje umowy według różnych kryteriów biznesowych.
        /// </summary>
        public DbSet<ContractTag> ContractTags { get; set; }
        
        /// <summary>
        /// Zbiór tagów faktur. Umożliwia klasyfikację faktur według typu, statusu lub kategorii.
        /// </summary>
        public DbSet<InvoiceTag> InvoiceTags { get; set; }
        
        /// <summary>
        /// Zbiór tagów zadań. Kategoryzuje zadania według priorytet, typu czy departamentu.
        /// </summary>
        public DbSet<TaskTag> TaskTags { get; set; }
        
        /// <summary>
        /// Zbiór tagów spotkań. Klasyfikuje spotkania według typu, ważności czy uczestników.
        /// </summary>
        public DbSet<MeetingTag> MeetingTags { get; set; }


        /// <summary>
        /// Metoda konfiguracji modelu Entity Framework. Wywoływana automatycznie podczas tworzenia kontekstu.
        /// Definiuje mapowanie między obiektami C# a strukturą bazy danych, relacje między tabelami,
        /// nazwy kolumn, klucze obce, indeksy i inne ograniczenia bazy danych.
        /// </summary>
        /// <param name="modelBuilder">Builder modelu służący do konfiguracji encji i ich relacji</param>
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Wywołanie metody bazowej - ważne dla zachowania domyślnej funkcjonalności EF Core
            base.OnModelCreating(modelBuilder);

            // === KONFIGURACJA ENCJI USER (UŻYTKOWNIK) ===
            modelBuilder.Entity<User>(entity =>
            {
                // Mapowanie klasy User na tabelę 'users' w bazie danych
                entity.ToTable("users");

                // Mapowanie właściwości C# na konkretne kolumny w bazie danych
                // Umożliwia używanie nazw w stylu C# w kodzie, a nazw snake_case w bazie
                entity.Property(u => u.Id).HasColumnName("id");
                entity.Property(u => u.Username).HasColumnName("username");
                entity.Property(u => u.Email).HasColumnName("email");
                entity.Property(u => u.PasswordHash).HasColumnName("password_hash");
                entity.Property(u => u.RoleId).HasColumnName("role_id");

                // Definicja relacji jeden-do-wielu między User a Role
                // Jeden użytkownik ma jedną rolę, jedna rola może być przypisana do wielu użytkowników
                entity.HasOne(u => u.Role)           // User ma jedną rolę
                      .WithMany(r => r.Users)        // Rola ma wielu użytkowników
                      .HasForeignKey(u => u.RoleId)  // Klucz obcy w tabeli users
                      .HasConstraintName("FK_users_roles"); // Nazwa ograniczenia w bazie danych
            });

            // === KONFIGURACJA ENCJI ROLE (ROLA) ===
            modelBuilder.Entity<Role>(entity =>
            {
                // Mapowanie klasy Role na tabelę 'roles' w bazie danych
                entity.ToTable("roles");

                // Mapowanie właściwości na kolumny bazy danych
                entity.Property(r => r.Id).HasColumnName("id");
                entity.Property(r => r.Name).HasColumnName("name");
            });

            // === KONFIGURACJA RELACJI MANY-TO-MANY DLA USERGROUP ===
            // Definicja klucza złożonego dla tabeli łączącej użytkowników z grupami
            // Kombinacja UserId i GroupId musi być unikalna - jeden użytkownik może należeć do jednej grupy tylko raz
            modelBuilder.Entity<UserGroup>()
                .HasKey(ug => new { ug.UserId, ug.GroupId });

            // === KONFIGURACJA ENCJI MESSAGE (WIADOMOŚĆ) ===
            modelBuilder.Entity<Message>(entity =>
            {
                // Konfiguracja relacji dla nadawcy wiadomości
                // Ustawienie DeleteBehavior.Restrict zapobiega kaskadowemu usuwaniu
                // Jeśli użytkownik zostanie usunięty, jego wiadomości nie zostaną automatycznie usunięte
                entity.HasOne(m => m.SenderUser)      // Wiadomość ma jednego nadawcę
                      .WithMany()                     // Użytkownik może wysłać wiele wiadomości
                      .HasForeignKey(m => m.SenderUserId)  // Klucz obcy wskazujący nadawcę
                      .OnDelete(DeleteBehavior.Restrict);  // Zapobiega cyklicznemu usuwaniu

                // Konfiguracja relacji dla odbiorcy wiadomości
                // Analogiczne ustawienia jak dla nadawcy
                entity.HasOne(m => m.RecipientUser)   // Wiadomość ma jednego odbiorcę
                      .WithMany()                     // Użytkownik może otrzymać wiele wiadomości
                      .HasForeignKey(m => m.RecipientUserId)  // Klucz obcy wskazujący odbiorcę
                      .OnDelete(DeleteBehavior.Restrict);     // Zapobiega cyklicznemu usuwaniu
            });

            // Miejsce na dodatkowe konfiguracje encji w przyszłości
            // Konfiguracja relacji Customer - Note
            modelBuilder.Entity<Customer>(entity =>
            {
                entity.HasMany(c => c.Notes)
                      .WithOne(n => n.Customer)
                      .HasForeignKey(n => n.CustomerId)
                      .OnDelete(DeleteBehavior.Cascade);
            });
        }


    }
}
