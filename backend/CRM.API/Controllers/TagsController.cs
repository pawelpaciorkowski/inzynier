// Plik: backend/CRM.API/Controllers/TagsController.cs
using CRM.Data; // Importuje przestrzeń nazw z danymi CRM
using CRM.Data.Models; // Importuje modele danych CRM
using Microsoft.AspNetCore.Authorization; // Importuje funkcjonalności autoryzacji
using Microsoft.AspNetCore.Mvc; // Importuje podstawowe klasy kontrolerów MVC
using Microsoft.EntityFrameworkCore; // Importuje Entity Framework Core
using System.Threading.Tasks; // Importuje klasy do programowania asynchronicznego
using System.Linq; // Importuje metody LINQ

namespace CRM.API.Controllers // Przestrzeń nazw dla kontrolerów API
{
    /// <summary>
    /// Kontroler do zarządzania tagami w systemie CRM
    /// Klasa obsługuje operacje CRUD na tagach oraz przypisywanie tagów do różnych encji (klienci, faktury, zadania, etc.)
    /// Tagi służą do kategoryzacji i organizacji danych w systemie
    /// </summary>
    [ApiController] // Oznacza klasę jako kontroler API - automatycznie waliduje model i zwraca odpowiednie błędy
    [Route("api/[controller]")] // Definiuje ścieżkę routingu - [controller] zostanie zastąpione nazwą klasy (Tags)
    [Authorize] // Wymaga autoryzacji - dostęp tylko dla zalogowanych użytkowników
    public class TagsController : ControllerBase // Dziedziczy po ControllerBase - podstawowa klasa dla kontrolerów API
    {
        /// <summary>
        /// Kontekst bazy danych Entity Framework
        /// Pozwala na wykonywanie operacji na bazie danych (zapytania, zapisywanie, usuwanie)
        /// </summary>
        private readonly ApplicationDbContext _context; // Pole tylko do odczytu - nie można zmienić po inicjalizacji

        /// <summary>
        /// Konstruktor klasy TagsController
        /// Inicjalizuje kontroler z kontekstem bazy danych przekazanym przez dependency injection
        /// </summary>
        /// <param name="context">Kontekst bazy danych przekazany przez system dependency injection</param>
        public TagsController(ApplicationDbContext context)
        {
            _context = context; // Przypisuje przekazany kontekst do pola prywatnego - inicjalizacja pola
        }

        /// <summary>
        /// Metoda HTTP GET - pobiera listę wszystkich tagów z liczbą użyć w różnych encjach
        /// Endpoint: GET /api/Tags
        /// Zwraca tagi wraz z informacją o tym, ile razy każdy tag jest używany w różnych typach encji
        /// </summary>
        /// <returns>Lista tagów z liczbą użyć w klientach, kontraktach, fakturach, zadaniach i spotkaniach</returns>
        [HttpGet] // Oznacza metodę jako obsługującą żądania HTTP GET
        public async Task<IActionResult> GetTags() // Metoda asynchroniczna zwracająca IActionResult
        {
            // Wykonuje zapytanie do bazy danych - pobiera tagi z liczbą użyć w różnych encjach
            var tags = await _context.Tags
                .Select(t => new // Projektuje wyniki do anonimowego typu z liczbą użyć
                {
                    t.Id, // ID tagu
                    t.Name, // Nazwa tagu
                    t.Color, // Kolor tagu
                    t.Description, // Opis tagu
                    CustomerCount = t.CustomerTags.Count, // Liczba klientów z tym tagiem
                    ContractCount = t.ContractTags.Count, // Liczba kontraktów z tym tagiem
                    InvoiceCount = t.InvoiceTags.Count, // Liczba faktur z tym tagiem
                    TaskCount = t.TaskTags.Count, // Liczba zadań z tym tagiem
                    MeetingCount = t.MeetingTags.Count // Liczba spotkań z tym tagiem
                })
                .ToListAsync(); // Wykonuje zapytanie asynchronicznie i zwraca listę wyników
                //ToListAsync - pobiera listę wyników z bazy danych asynchronicznie
                // asynchronicznie - bez blokowania wątku głównego
            
            return Ok(tags); // Zwraca status HTTP 200 OK z listą tagów
        }

        /// <summary>
        /// Metoda HTTP GET - pobiera szczegóły pojedynczego tagu wraz z powiązanymi encjami
        /// Endpoint: GET /api/Tags/{id}
        /// Zwraca szczegóły tagu oraz listę wszystkich encji, które mają przypisany ten tag
        /// </summary>
        /// <param name="id">ID tagu do pobrania</param>
        /// <returns>Szczegóły tagu z listą powiązanych encji lub NotFound jeśli tag nie istnieje</returns>
        [HttpGet("{id}")] // Oznacza metodę jako obsługującą żądania HTTP GET z parametrem id w ścieżce
        public async Task<IActionResult> GetTag(int id) // Metoda asynchroniczna zwracająca IActionResult
        {
            // Wykonuje zapytanie do bazy danych - pobiera tag z wszystkimi powiązanymi encjami
            var tag = await _context.Tags
                .Include(t => t.CustomerTags) // Dołącza tagi klientów do tagów a następnie dołącza szczegóły klientów do tagów
                    .ThenInclude(ct => ct.Customer) // Dołącza szczegóły klientów
                .Include(t => t.ContractTags) // Dołącza tagi kontraktów
                    .ThenInclude(ct => ct.Contract) // Dołącza szczegóły kontraktów
                    //ThenInclude - dołącza szczegóły kontraktów do tagów, a następnie dołącza szczegóły klientów do kontraktów
                .Include(t => t.InvoiceTags) // Dołącza tagi faktur
                //ThenInclude - dołącza szczegóły faktur do tagów, a następnie dołącza szczegóły klientów do faktur
                    .ThenInclude(it => it.Invoice) // Dołącza szczegóły faktur
                .Include(t => t.TaskTags) // Dołącza tagi zadań
                    .ThenInclude(tt => tt.Task) // Dołącza szczegóły zadań
                .Include(t => t.MeetingTags) // Dołącza tagi spotkań
                    .ThenInclude(mt => mt.Meeting) // Dołącza szczegóły spotkań
                .FirstOrDefaultAsync(t => t.Id == id); // Wyszukuje tag po ID

            if (tag == null) return NotFound(); // Zwraca NotFound jeśli tag nie został znaleziony

            // Tworzy obiekt wynikowy z szczegółami tagu i powiązanymi encjami
            var result = new
            {
                tag.Id, // ID tagu
                tag.Name, // Nazwa tagu
                tag.Color, // Kolor tagu
                tag.Description, // Opis tagu
                Customers = tag.CustomerTags.Select(ct => new { ct.Customer.Id, ct.Customer.Name, ct.Customer.Email }), // Lista klientów z tagiem
                Contracts = tag.ContractTags.Select(ct => new { ct.Contract.Id, ct.Contract.Title, ct.Contract.ContractNumber }), // Lista kontraktów z tagiem
                Invoices = tag.InvoiceTags.Select(it => new { it.Invoice.Id, it.Invoice.Number, it.Invoice.TotalAmount }), // Lista faktur z tagiem
                Tasks = tag.TaskTags.Select(tt => new { tt.Task.Id, tt.Task.Title, tt.Task.Completed }), // Lista zadań z tagiem
                Meetings = tag.MeetingTags.Select(mt => new { mt.Meeting.Id, mt.Meeting.Topic, mt.Meeting.ScheduledAt }) // Lista spotkań z tagiem
            };

            return Ok(result); // Zwraca status HTTP 200 OK ze szczegółami tagu
        }

        /// <summary>
        /// Metoda HTTP POST - tworzy nowy tag w systemie
        /// Endpoint: POST /api/Tags
        /// Tworzy nowy tag z podanymi danymi (nazwa, kolor, opis)
        /// </summary>
        /// <param name="tag">Dane nowego tagu (nazwa, kolor, opis)</param>
        /// <returns>Nowo utworzony tag z statusem HTTP 201 Created lub BadRequest jeśli nazwa jest pusta</returns>
        [HttpPost] // Oznacza metodę jako obsługującą żądania HTTP POST
        public async Task<IActionResult> CreateTag([FromBody] Tag tag) // Metoda asynchroniczna przyjmująca dane tagu z body żądania
        {
            if (string.IsNullOrWhiteSpace(tag.Name)) // Sprawdza czy nazwa tagu nie jest pusta lub zawiera tylko białe znaki
                return BadRequest("Nazwa tagu jest wymagana."); // Zwraca błąd 400 Bad Request z komunikatem

            _context.Tags.Add(tag); // Dodaje nowy tag do kontekstu Entity Framework
            await _context.SaveChangesAsync(); // Zapisuje tag w bazie danych asynchronicznie
            // asynchronicznie - bez blokowania wątku głównego
            return CreatedAtAction(nameof(GetTags), new { id = tag.Id }, tag); // Zwraca status HTTP 201 Created z lokalizacją nowego zasobu
        }

        /// <summary>
        /// Metoda HTTP PUT - aktualizuje istniejący tag
        /// Endpoint: PUT /api/Tags/{id}
        /// Aktualizuje dane tagu o podanym ID (nazwa, kolor, opis)
        /// </summary>
        /// <param name="id">ID tagu do aktualizacji</param>
        /// <param name="updatedTag">Nowe dane tagu</param>
        /// <returns>Zaktualizowany tag lub NotFound jeśli tag nie istnieje</returns>
        [HttpPut("{id}")] // Oznacza metodę jako obsługującą żądania HTTP PUT z parametrem id w ścieżce
        public async Task<IActionResult> UpdateTag(int id, [FromBody] Tag updatedTag) // Metoda asynchroniczna przyjmująca ID i nowe dane tagu
        {
            var tag = await _context.Tags.FindAsync(id); // Wyszukuje tag po ID w bazie danych
            if (tag == null) return NotFound(); // Zwraca NotFound jeśli tag nie został znaleziony

            tag.Name = updatedTag.Name; // Aktualizuje nazwę tagu
            tag.Color = updatedTag.Color; // Aktualizuje kolor tagu
            tag.Description = updatedTag.Description; // Aktualizuje opis tagu

            await _context.SaveChangesAsync(); // Zapisuje zmiany w bazie danych
            return Ok(tag); // Zwraca status HTTP 200 OK ze zaktualizowanym tagiem
        }

        /// <summary>
        /// Metoda HTTP DELETE - usuwa tag z systemu
        /// Endpoint: DELETE /api/Tags/{id}
        /// Usuwa tag o podanym ID z bazy danych
        /// </summary>
        /// <param name="id">ID tagu do usunięcia</param>
        /// <returns>Status HTTP 204 No Content po pomyślnym usunięciu lub NotFound jeśli tag nie istnieje</returns>
        [HttpDelete("{id}")] // Oznacza metodę jako obsługującą żądania HTTP DELETE z parametrem id w ścieżce
        public async Task<IActionResult> DeleteTag(int id) // Metoda asynchroniczna przyjmująca ID tagu do usunięcia
        {
            var tag = await _context.Tags.FindAsync(id); // Wyszukuje tag po ID w bazie danych
            if (tag == null) return NotFound(); // Zwraca NotFound jeśli tag nie został znaleziony
            
            _context.Tags.Remove(tag); // Usuwa tag z kontekstu Entity Framework
            await _context.SaveChangesAsync(); // Zapisuje zmiany w bazie danych (fizyczne usunięcie tagu)
            return NoContent(); // Zwraca status HTTP 204 No Content po pomyślnym usunięciu
        }

        // ✅ NOWE ENDPOINTY DLA ZARZĄDZANIA TAGAMI RÓŻNYCH ENCJI

        /// <summary>
        /// Metoda HTTP POST - przypisuje tag do klienta
        /// Endpoint: POST /api/Tags/customers/{customerId}/tags/{tagId}
        /// Tworzy powiązanie między klientem a tagiem
        /// </summary>
        /// <param name="customerId">ID klienta</param>
        /// <param name="tagId">ID tagu</param>
        /// <returns>Komunikat o pomyślnym dodaniu tagu lub błąd jeśli klient/tag nie istnieje lub tag już jest przypisany</returns>
        [HttpPost("customers/{customerId}/tags/{tagId}")] // Oznacza metodę jako obsługującą żądania HTTP POST na ścieżce customers/{customerId}/tags/{tagId}
        public async Task<IActionResult> AddTagToCustomer(int customerId, int tagId) // Metoda asynchroniczna przyjmująca ID klienta i ID tagu
        {
            var customer = await _context.Customers.FindAsync(customerId); // Wyszukuje klienta po ID
            var tag = await _context.Tags.FindAsync(tagId); // Wyszukuje tag po ID

            if (customer == null || tag == null) return NotFound(); // Zwraca NotFound jeśli klient lub tag nie istnieje

            // Sprawdza czy tag już jest przypisany do klienta
            var existingTag = await _context.CustomerTags
                .FirstOrDefaultAsync(ct => ct.CustomerId == customerId && ct.TagId == tagId); // Wyszukuje istniejące powiązanie

            if (existingTag != null) // Jeśli powiązanie już istnieje
                return BadRequest("Klient już ma ten tag."); // Zwraca błąd 400 Bad Request z komunikatem

            var customerTag = new CustomerTag { CustomerId = customerId, TagId = tagId }; // Tworzy nowy obiekt powiązania
            _context.CustomerTags.Add(customerTag); // Dodaje powiązanie do kontekstu Entity Framework
            await _context.SaveChangesAsync(); // Zapisuje powiązanie w bazie danych

            return Ok(new { message = "Tag został dodany do klienta." }); // Zwraca status HTTP 200 OK z komunikatem
        }

        /// <summary>
        /// Metoda HTTP DELETE - usuwa tag z klienta
        /// Endpoint: DELETE /api/Tags/customers/{customerId}/tags/{tagId}
        /// Usuwa powiązanie między klientem a tagiem
        /// </summary>
        /// <param name="customerId">ID klienta</param>
        /// <param name="tagId">ID tagu</param>
        /// <returns>Komunikat o pomyślnym usunięciu tagu lub NotFound jeśli powiązanie nie istnieje</returns>
        [HttpDelete("customers/{customerId}/tags/{tagId}")] // Oznacza metodę jako obsługującą żądania HTTP DELETE na ścieżce customers/{customerId}/tags/{tagId}
        public async Task<IActionResult> RemoveTagFromCustomer(int customerId, int tagId) // Metoda asynchroniczna przyjmująca ID klienta i ID tagu
        {
            // Wyszukuje powiązanie między klientem a tagiem
            var customerTag = await _context.CustomerTags
                .FirstOrDefaultAsync(ct => ct.CustomerId == customerId && ct.TagId == tagId); // Wyszukuje istniejące powiązanie

            if (customerTag == null) return NotFound(); // Zwraca NotFound jeśli powiązanie nie istnieje

            _context.CustomerTags.Remove(customerTag); // Usuwa powiązanie z kontekstu Entity Framework
            await _context.SaveChangesAsync(); // Zapisuje zmiany w bazie danych

            return Ok(new { message = "Tag został usunięty z klienta." }); // Zwraca status HTTP 200 OK z komunikatem
        }

        /// <summary>
        /// Metoda HTTP POST - przypisuje tag do kontraktu
        /// Endpoint: POST /api/Tags/contracts/{contractId}/tags/{tagId}
        /// Tworzy powiązanie między kontraktem a tagiem
        /// </summary>
        /// <param name="contractId">ID kontraktu</param>
        /// <param name="tagId">ID tagu</param>
        /// <returns>Komunikat o pomyślnym dodaniu tagu lub błąd jeśli kontrakt/tag nie istnieje lub tag już jest przypisany</returns>
        [HttpPost("contracts/{contractId}/tags/{tagId}")] // Oznacza metodę jako obsługującą żądania HTTP POST na ścieżce contracts/{contractId}/tags/{tagId}
        public async Task<IActionResult> AddTagToContract(int contractId, int tagId) // Metoda asynchroniczna przyjmująca ID kontraktu i ID tagu
        {
            var contract = await _context.Contracts.FindAsync(contractId); // Wyszukuje kontrakt po ID
            var tag = await _context.Tags.FindAsync(tagId); // Wyszukuje tag po ID

            if (contract == null || tag == null) return NotFound(); // Zwraca NotFound jeśli kontrakt lub tag nie istnieje

            // Sprawdza czy tag już jest przypisany do kontraktu
            var existingTag = await _context.ContractTags
                .FirstOrDefaultAsync(ct => ct.ContractId == contractId && ct.TagId == tagId); // Wyszukuje istniejące powiązanie

            if (existingTag != null) // Jeśli powiązanie już istnieje
                return BadRequest("Kontrakt już ma ten tag."); // Zwraca błąd 400 Bad Request z komunikatem

            var contractTag = new ContractTag { ContractId = contractId, TagId = tagId }; // Tworzy nowy obiekt powiązania
            _context.ContractTags.Add(contractTag); // Dodaje powiązanie do kontekstu Entity Framework
            await _context.SaveChangesAsync(); // Zapisuje powiązanie w bazie danych

            return Ok(new { message = "Tag został dodany do kontraktu." }); // Zwraca status HTTP 200 OK z komunikatem
        }

        /// <summary>
        /// Metoda HTTP DELETE - usuwa tag z kontraktu
        /// Endpoint: DELETE /api/Tags/contracts/{contractId}/tags/{tagId}
        /// Usuwa powiązanie między kontraktem a tagiem
        /// </summary>
        /// <param name="contractId">ID kontraktu</param>
        /// <param name="tagId">ID tagu</param>
        /// <returns>Komunikat o pomyślnym usunięciu tagu lub NotFound jeśli powiązanie nie istnieje</returns>
        [HttpDelete("contracts/{contractId}/tags/{tagId}")] // Oznacza metodę jako obsługującą żądania HTTP DELETE na ścieżce contracts/{contractId}/tags/{tagId}
        public async Task<IActionResult> RemoveTagFromContract(int contractId, int tagId) // Metoda asynchroniczna przyjmująca ID kontraktu i ID tagu
        {
            // Wyszukuje powiązanie między kontraktem a tagiem
            var contractTag = await _context.ContractTags
                .FirstOrDefaultAsync(ct => ct.ContractId == contractId && ct.TagId == tagId); // Wyszukuje istniejące powiązanie

            if (contractTag == null) return NotFound(); // Zwraca NotFound jeśli powiązanie nie istnieje

            _context.ContractTags.Remove(contractTag); // Usuwa powiązanie z kontekstu Entity Framework
            await _context.SaveChangesAsync(); // Zapisuje zmiany w bazie danych

            return Ok(new { message = "Tag został usunięty z kontraktu." }); // Zwraca status HTTP 200 OK z komunikatem
        }

        /// <summary>
        /// Metoda HTTP POST - przypisuje tag do faktury
        /// Endpoint: POST /api/Tags/invoices/{invoiceId}/tags/{tagId}
        /// Tworzy powiązanie między fakturą a tagiem
        /// </summary>
        /// <param name="invoiceId">ID faktury</param>
        /// <param name="tagId">ID tagu</param>
        /// <returns>Komunikat o pomyślnym dodaniu tagu lub błąd jeśli faktura/tag nie istnieje lub tag już jest przypisany</returns>
        [HttpPost("invoices/{invoiceId}/tags/{tagId}")] // Oznacza metodę jako obsługującą żądania HTTP POST na ścieżce invoices/{invoiceId}/tags/{tagId}
        public async Task<IActionResult> AddTagToInvoice(int invoiceId, int tagId) // Metoda asynchroniczna przyjmująca ID faktury i ID tagu
        {
            var invoice = await _context.Invoices.FindAsync(invoiceId); // Wyszukuje fakturę po ID
            var tag = await _context.Tags.FindAsync(tagId); // Wyszukuje tag po ID

            if (invoice == null || tag == null) return NotFound(); // Zwraca NotFound jeśli faktura lub tag nie istnieje

            // Sprawdza czy tag już jest przypisany do faktury
            var existingTag = await _context.InvoiceTags
                .FirstOrDefaultAsync(it => it.InvoiceId == invoiceId && it.TagId == tagId); // Wyszukuje istniejące powiązanie

            if (existingTag != null) // Jeśli powiązanie już istnieje
                return BadRequest("Faktura już ma ten tag."); // Zwraca błąd 400 Bad Request z komunikatem

            var invoiceTag = new InvoiceTag { InvoiceId = invoiceId, TagId = tagId }; // Tworzy nowy obiekt powiązania
            _context.InvoiceTags.Add(invoiceTag); // Dodaje powiązanie do kontekstu Entity Framework
            await _context.SaveChangesAsync(); // Zapisuje powiązanie w bazie danych

            return Ok(new { message = "Tag został dodany do faktury." }); // Zwraca status HTTP 200 OK z komunikatem
        }

        /// <summary>
        /// Metoda HTTP DELETE - usuwa tag z faktury
        /// Endpoint: DELETE /api/Tags/invoices/{invoiceId}/tags/{tagId}
        /// Usuwa powiązanie między fakturą a tagiem
        /// </summary>
        /// <param name="invoiceId">ID faktury</param>
        /// <param name="tagId">ID tagu</param>
        /// <returns>Komunikat o pomyślnym usunięciu tagu lub NotFound jeśli powiązanie nie istnieje</returns>
        [HttpDelete("invoices/{invoiceId}/tags/{tagId}")] // Oznacza metodę jako obsługującą żądania HTTP DELETE na ścieżce invoices/{invoiceId}/tags/{tagId}
        public async Task<IActionResult> RemoveTagFromInvoice(int invoiceId, int tagId) // Metoda asynchroniczna przyjmująca ID faktury i ID tagu
        {
            // Wyszukuje powiązanie między fakturą a tagiem
            var invoiceTag = await _context.InvoiceTags
                .FirstOrDefaultAsync(it => it.InvoiceId == invoiceId && it.TagId == tagId); // Wyszukuje istniejące powiązanie

            if (invoiceTag == null) return NotFound(); // Zwraca NotFound jeśli powiązanie nie istnieje

            _context.InvoiceTags.Remove(invoiceTag); // Usuwa powiązanie z kontekstu Entity Framework
            await _context.SaveChangesAsync(); // Zapisuje zmiany w bazie danych

            return Ok(new { message = "Tag został usunięty z faktury." }); // Zwraca status HTTP 200 OK z komunikatem
        }

        /// <summary>
        /// Metoda HTTP POST - przypisuje tag do zadania
        /// Endpoint: POST /api/Tags/tasks/{taskId}/tags/{tagId}
        /// Tworzy powiązanie między zadaniem a tagiem
        /// </summary>
        /// <param name="taskId">ID zadania</param>
        /// <param name="tagId">ID tagu</param>
        /// <returns>Komunikat o pomyślnym dodaniu tagu lub błąd jeśli zadanie/tag nie istnieje lub tag już jest przypisany</returns>
        [HttpPost("tasks/{taskId}/tags/{tagId}")] // Oznacza metodę jako obsługującą żądania HTTP POST na ścieżce tasks/{taskId}/tags/{tagId}
        public async Task<IActionResult> AddTagToTask(int taskId, int tagId) // Metoda asynchroniczna przyjmująca ID zadania i ID tagu
        {
            var task = await _context.Tasks.FindAsync(taskId); // Wyszukuje zadanie po ID
            var tag = await _context.Tags.FindAsync(tagId); // Wyszukuje tag po ID

            if (task == null || tag == null) return NotFound(); // Zwraca NotFound jeśli zadanie lub tag nie istnieje

            // Sprawdza czy tag już jest przypisany do zadania
            var existingTag = await _context.TaskTags
                .FirstOrDefaultAsync(tt => tt.TaskId == taskId && tt.TagId == tagId); // Wyszukuje istniejące powiązanie

            if (existingTag != null) // Jeśli powiązanie już istnieje
                return BadRequest("Zadanie już ma ten tag."); // Zwraca błąd 400 Bad Request z komunikatem

            var taskTag = new TaskTag { TaskId = taskId, TagId = tagId }; // Tworzy nowy obiekt powiązania
            _context.TaskTags.Add(taskTag); // Dodaje powiązanie do kontekstu Entity Framework
            await _context.SaveChangesAsync(); // Zapisuje powiązanie w bazie danych

            return Ok(new { message = "Tag został dodany do zadania." }); // Zwraca status HTTP 200 OK z komunikatem
        }

        /// <summary>
        /// Metoda HTTP DELETE - usuwa tag z zadania
        /// Endpoint: DELETE /api/Tags/tasks/{taskId}/tags/{tagId}
        /// Usuwa powiązanie między zadaniem a tagiem
        /// </summary>
        /// <param name="taskId">ID zadania</param>
        /// <param name="tagId">ID tagu</param>
        /// <returns>Komunikat o pomyślnym usunięciu tagu lub NotFound jeśli powiązanie nie istnieje</returns>
        [HttpDelete("tasks/{taskId}/tags/{tagId}")] // Oznacza metodę jako obsługującą żądania HTTP DELETE na ścieżce tasks/{taskId}/tags/{tagId}
        public async Task<IActionResult> RemoveTagFromTask(int taskId, int tagId) // Metoda asynchroniczna przyjmująca ID zadania i ID tagu
        {
            // Wyszukuje powiązanie między zadaniem a tagiem
            var taskTag = await _context.TaskTags
                .FirstOrDefaultAsync(tt => tt.TaskId == taskId && tt.TagId == tagId); // Wyszukuje istniejące powiązanie

            if (taskTag == null) return NotFound(); // Zwraca NotFound jeśli powiązanie nie istnieje

            _context.TaskTags.Remove(taskTag); // Usuwa powiązanie z kontekstu Entity Framework
            await _context.SaveChangesAsync(); // Zapisuje zmiany w bazie danych

            return Ok(new { message = "Tag został usunięty z zadania." }); // Zwraca status HTTP 200 OK z komunikatem
        }

        /// <summary>
        /// Metoda HTTP POST - przypisuje tag do spotkania
        /// Endpoint: POST /api/Tags/meetings/{meetingId}/tags/{tagId}
        /// Tworzy powiązanie między spotkaniem a tagiem
        /// </summary>
        /// <param name="meetingId">ID spotkania</param>
        /// <param name="tagId">ID tagu</param>
        /// <returns>Komunikat o pomyślnym dodaniu tagu lub błąd jeśli spotkanie/tag nie istnieje lub tag już jest przypisany</returns>
        [HttpPost("meetings/{meetingId}/tags/{tagId}")] // Oznacza metodę jako obsługującą żądania HTTP POST na ścieżce meetings/{meetingId}/tags/{tagId}
        public async Task<IActionResult> AddTagToMeeting(int meetingId, int tagId) // Metoda asynchroniczna przyjmująca ID spotkania i ID tagu
        {
            var meeting = await _context.Meetings.FindAsync(meetingId); // Wyszukuje spotkanie po ID
            var tag = await _context.Tags.FindAsync(tagId); // Wyszukuje tag po ID

            if (meeting == null || tag == null) return NotFound(); // Zwraca NotFound jeśli spotkanie lub tag nie istnieje

            // Sprawdza czy tag już jest przypisany do spotkania
            var existingTag = await _context.MeetingTags
                .FirstOrDefaultAsync(mt => mt.MeetingId == meetingId && mt.TagId == tagId); // Wyszukuje istniejące powiązanie

            if (existingTag != null) // Jeśli powiązanie już istnieje
                return BadRequest("Spotkanie już ma ten tag."); // Zwraca błąd 400 Bad Request z komunikatem

            var meetingTag = new MeetingTag { MeetingId = meetingId, TagId = tagId }; // Tworzy nowy obiekt powiązania
            _context.MeetingTags.Add(meetingTag); // Dodaje powiązanie do kontekstu Entity Framework
            await _context.SaveChangesAsync(); // Zapisuje powiązanie w bazie danych

            return Ok(new { message = "Tag został dodany do spotkania." }); // Zwraca status HTTP 200 OK z komunikatem
        }

        /// <summary>
        /// Metoda HTTP DELETE - usuwa tag ze spotkania
        /// Endpoint: DELETE /api/Tags/meetings/{meetingId}/tags/{tagId}
        /// Usuwa powiązanie między spotkaniem a tagiem
        /// </summary>
        /// <param name="meetingId">ID spotkania</param>
        /// <param name="tagId">ID tagu</param>
        /// <returns>Komunikat o pomyślnym usunięciu tagu lub NotFound jeśli powiązanie nie istnieje</returns>
        [HttpDelete("meetings/{meetingId}/tags/{tagId}")] // Oznacza metodę jako obsługującą żądania HTTP DELETE na ścieżce meetings/{meetingId}/tags/{tagId}
        public async Task<IActionResult> RemoveTagFromMeeting(int meetingId, int tagId) // Metoda asynchroniczna przyjmująca ID spotkania i ID tagu
        {
            // Wyszukuje powiązanie między spotkaniem a tagiem
            var meetingTag = await _context.MeetingTags
                .FirstOrDefaultAsync(mt => mt.MeetingId == meetingId && mt.TagId == tagId); // Wyszukuje istniejące powiązanie

            if (meetingTag == null) return NotFound(); // Zwraca NotFound jeśli powiązanie nie istnieje

            _context.MeetingTags.Remove(meetingTag); // Usuwa powiązanie z kontekstu Entity Framework
            await _context.SaveChangesAsync(); // Zapisuje zmiany w bazie danych

            return Ok(new { message = "Tag został usunięty ze spotkania." }); // Zwraca status HTTP 200 OK z komunikatem
        }

        /// <summary>
        /// Metoda HTTP GET - pobiera statystyki użycia tagów
        /// Endpoint: GET /api/Tags/statistics
        /// Zwraca listę tagów z informacją o liczbie użyć w różnych typach encji, posortowaną według popularności
        /// </summary>
        /// <returns>Lista tagów z liczbą użyć w różnych encjach, posortowana według całkowitej liczby użyć (malejąco)</returns>
        [HttpGet("statistics")] // Oznacza metodę jako obsługującą żądania HTTP GET na ścieżce statistics
        public async Task<IActionResult> GetTagStatistics() // Metoda asynchroniczna zwracająca IActionResult
        {
            // Wykonuje zapytanie do bazy danych - pobiera tagi z liczbą użyć w różnych encjach
            var statistics = await _context.Tags
                .Select(t => new // Projektuje wyniki do anonimowego typu ze statystykami
                {
                    t.Id, // ID tagu
                    t.Name, // Nazwa tagu
                    t.Color, // Kolor tagu
                    CustomerCount = t.CustomerTags.Count, // Liczba klientów z tym tagiem
                    ContractCount = t.ContractTags.Count, // Liczba kontraktów z tym tagiem
                    InvoiceCount = t.InvoiceTags.Count, // Liczba faktur z tym tagiem
                    TaskCount = t.TaskTags.Count, // Liczba zadań z tym tagiem
                    MeetingCount = t.MeetingTags.Count, // Liczba spotkań z tym tagiem
                    TotalUsage = t.CustomerTags.Count + t.ContractTags.Count + t.InvoiceTags.Count + t.TaskTags.Count + t.MeetingTags.Count // Całkowita liczba użyć tagu
                })
                .OrderByDescending(s => s.TotalUsage) // Sortuje według całkowitej liczby użyć (malejąco)
                .ToListAsync(); // Wykonuje zapytanie asynchronicznie i zwraca listę wyników

            return Ok(statistics); // Zwraca status HTTP 200 OK ze statystykami tagów
        }
    }
}