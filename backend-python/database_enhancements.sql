-- ============================================
-- ROZSZERZENIA BAZY DANYCH DLA WYMAGAŃ PROJEKTU
-- ============================================
-- Ten plik zawiera widoki, procedury, funkcje i indeksy
-- wymagane dla Projektu Inżynierskiego

USE crm_project;

-- ============================================
-- 1. WIDOKI (VIEWS) - minimum 2-3 widoki
-- ============================================

-- Widok 1: Klienci z podsumowaniem faktur
CREATE OR REPLACE VIEW v_customer_invoice_summary AS
SELECT 
    c.Id AS CustomerId,
    c.Name AS CustomerName,
    c.Email AS CustomerEmail,
    c.Company AS CustomerCompany,
    COUNT(DISTINCT i.Id) AS TotalInvoices,
    COALESCE(SUM(i.TotalAmount), 0) AS TotalInvoiceValue,
    COALESCE(SUM(CASE WHEN i.IsPaid = 1 THEN i.TotalAmount ELSE 0 END), 0) AS PaidInvoiceValue,
    COALESCE(SUM(CASE WHEN i.IsPaid = 0 THEN i.TotalAmount ELSE 0 END), 0) AS UnpaidInvoiceValue,
    COUNT(DISTINCT CASE WHEN i.IsPaid = 1 THEN i.Id ELSE NULL END) AS PaidInvoicesCount,
    COUNT(DISTINCT CASE WHEN i.IsPaid = 0 THEN i.Id ELSE NULL END) AS UnpaidInvoicesCount,
    COUNT(DISTINCT ct.Id) AS TotalContracts,
    COUNT(DISTINCT t.Id) AS TotalTasks
FROM Customers c
LEFT JOIN Invoices i ON c.Id = i.CustomerId
LEFT JOIN Contracts ct ON c.Id = ct.CustomerId
LEFT JOIN Tasks t ON c.Id = t.CustomerId
GROUP BY c.Id, c.Name, c.Email, c.Company;

-- Widok 2: Faktury z pełnymi danymi klienta i płatnościami
CREATE OR REPLACE VIEW v_invoice_details AS
SELECT 
    i.Id AS InvoiceId,
    i.Number AS InvoiceNumber,
    i.IssuedAt,
    i.DueDate,
    i.TotalAmount,
    i.IsPaid,
    i.CreatedByUserId,
    i.AssignedGroupId,
    c.Id AS CustomerId,
    c.Name AS CustomerName,
    c.Email AS CustomerEmail,
    c.Company AS CustomerCompany,
    c.Phone AS CustomerPhone,
    COALESCE(SUM(p.Amount), 0) AS PaidAmount,
    (i.TotalAmount - COALESCE(SUM(p.Amount), 0)) AS RemainingAmount,
    COUNT(DISTINCT p.Id) AS PaymentsCount,
    CASE 
        WHEN i.DueDate < CURDATE() AND i.IsPaid = 0 THEN 'Overdue'
        WHEN i.IsPaid = 1 THEN 'Paid'
        ELSE 'Pending'
    END AS PaymentStatus
FROM Invoices i
INNER JOIN Customers c ON i.CustomerId = c.Id
LEFT JOIN Payments p ON i.Id = p.InvoiceId
GROUP BY i.Id, i.Number, i.IssuedAt, i.DueDate, i.TotalAmount, i.IsPaid, 
         i.CreatedByUserId, i.AssignedGroupId, c.Id, c.Name, c.Email, c.Company, c.Phone;

-- Widok 3: Statystyki grup z podsumowaniem
CREATE OR REPLACE VIEW v_group_statistics AS
SELECT 
    g.Id AS GroupId,
    g.Name AS GroupName,
    g.Description AS GroupDescription,
    COUNT(DISTINCT ug.UserId) AS TotalMembers,
    COUNT(DISTINCT c.Id) AS TotalCustomers,
    COUNT(DISTINCT i.Id) AS TotalInvoices,
    COALESCE(SUM(i.TotalAmount), 0) AS TotalInvoiceValue,
    COUNT(DISTINCT CASE WHEN i.IsPaid = 1 THEN i.Id ELSE NULL END) AS PaidInvoicesCount,
    COUNT(DISTINCT CASE WHEN i.IsPaid = 0 THEN i.Id ELSE NULL END) AS UnpaidInvoicesCount,
    COUNT(DISTINCT ct.Id) AS TotalContracts,
    COUNT(DISTINCT t.Id) AS TotalTasks,
    COUNT(DISTINCT CASE WHEN t.Completed = 1 THEN t.Id ELSE NULL END) AS CompletedTasksCount,
    COUNT(DISTINCT CASE WHEN t.Completed = 0 THEN t.Id ELSE NULL END) AS PendingTasksCount,
    COUNT(DISTINCT m.Id) AS TotalMeetings
FROM Groups g
LEFT JOIN UserGroups ug ON g.Id = ug.GroupId
LEFT JOIN Customers c ON g.Id = c.AssignedGroupId
LEFT JOIN Invoices i ON g.Id = i.AssignedGroupId
LEFT JOIN Contracts ct ON g.Id = ct.ResponsibleGroupId
LEFT JOIN Tasks t ON g.Id = t.AssignedGroupId
LEFT JOIN Meetings m ON g.Id = m.AssignedGroupId
GROUP BY g.Id, g.Name, g.Description;

-- ============================================
-- 2. PROCEDURY SKŁADOWANE (STORED PROCEDURES) - minimum 2-3 procedury
-- ============================================

DELIMITER //

-- Procedura 1: Tworzenie faktury z automatycznym przeliczeniem kwot
CREATE PROCEDURE sp_create_invoice(
    IN p_invoice_number VARCHAR(100),
    IN p_customer_id INT,
    IN p_issued_at DATETIME,
    IN p_due_date DATETIME,
    IN p_assigned_group_id INT,
    IN p_created_by_user_id INT,
    OUT p_invoice_id INT
)
BEGIN
    DECLARE v_total_amount DECIMAL(65, 30) DEFAULT 0;
    DECLARE v_item_count INT DEFAULT 0;
    
    -- Utwórz fakturę z początkową kwotą 0
    INSERT INTO Invoices (Number, CustomerId, IssuedAt, DueDate, TotalAmount, IsPaid, AssignedGroupId, CreatedByUserId)
    VALUES (p_invoice_number, p_customer_id, p_issued_at, p_due_date, 0, 0, p_assigned_group_id, p_created_by_user_id);
    
    SET p_invoice_id = LAST_INSERT_ID();
    
    -- Oblicz sumę z pozycji faktury
    SELECT COALESCE(SUM(GrossAmount), 0), COUNT(*)
    INTO v_total_amount, v_item_count
    FROM InvoiceItems
    WHERE InvoiceId = p_invoice_id;
    
    -- Zaktualizuj TotalAmount faktury
    UPDATE Invoices
    SET TotalAmount = v_total_amount
    WHERE Id = p_invoice_id;
    
    SELECT p_invoice_id AS invoice_id, v_total_amount AS total_amount, v_item_count AS items_count;
END //

-- Procedura 2: Aktualizacja statusu płatności faktury
CREATE PROCEDURE sp_update_invoice_payment_status(
    IN p_invoice_id INT
)
BEGIN
    DECLARE v_total_paid DECIMAL(65, 30) DEFAULT 0;
    DECLARE v_invoice_amount DECIMAL(65, 30) DEFAULT 0;
    DECLARE v_is_paid BOOLEAN DEFAULT 0;
    
    -- Pobierz kwotę faktury
    SELECT TotalAmount INTO v_invoice_amount
    FROM Invoices
    WHERE Id = p_invoice_id;
    
    -- Oblicz sumę płatności
    SELECT COALESCE(SUM(Amount), 0) INTO v_total_paid
    FROM Payments
    WHERE InvoiceId = p_invoice_id;
    
    -- Sprawdź czy faktura jest opłacona
    IF v_total_paid >= v_invoice_amount THEN
        SET v_is_paid = 1;
    ELSE
        SET v_is_paid = 0;
    END IF;
    
    -- Zaktualizuj status faktury
    UPDATE Invoices
    SET IsPaid = v_is_paid
    WHERE Id = p_invoice_id;
    
    SELECT p_invoice_id AS invoice_id, v_total_paid AS paid_amount, v_invoice_amount AS invoice_amount, v_is_paid AS is_paid;
END //

-- Procedura 3: Generowanie raportu sprzedażowego dla okresu
CREATE PROCEDURE sp_generate_sales_report(
    IN p_date_from DATE,
    IN p_date_to DATE,
    IN p_group_id INT
)
BEGIN
    SELECT 
        i.Id AS InvoiceId,
        i.Number AS InvoiceNumber,
        i.IssuedAt,
        i.TotalAmount,
        i.IsPaid,
        c.Name AS CustomerName,
        c.Company AS CustomerCompany,
        g.Name AS GroupName,
        COALESCE(SUM(p.Amount), 0) AS PaidAmount,
        (i.TotalAmount - COALESCE(SUM(p.Amount), 0)) AS RemainingAmount
    FROM Invoices i
    INNER JOIN Customers c ON i.CustomerId = c.Id
    LEFT JOIN Groups g ON i.AssignedGroupId = g.Id
    LEFT JOIN Payments p ON i.Id = p.InvoiceId
    WHERE i.IssuedAt BETWEEN p_date_from AND p_date_to
      AND (p_group_id IS NULL OR i.AssignedGroupId = p_group_id)
    GROUP BY i.Id, i.Number, i.IssuedAt, i.TotalAmount, i.IsPaid, c.Name, c.Company, g.Name
    ORDER BY i.IssuedAt DESC;
END //

DELIMITER ;

-- ============================================
-- 3. FUNKCJE (FUNCTIONS) - minimum 1-2 funkcje
-- ============================================

DELIMITER //

-- Funkcja 1: Obliczanie sumy faktury z podatkami
CREATE FUNCTION fn_calculate_invoice_total(
    p_net_amount DECIMAL(65, 30),
    p_tax_rate DECIMAL(5, 2)
)
RETURNS DECIMAL(65, 30)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_gross_amount DECIMAL(65, 30);
    SET v_gross_amount = p_net_amount * (1 + COALESCE(p_tax_rate, 0.23));
    RETURN v_gross_amount;
END //

-- Funkcja 2: Formatowanie daty w stylu polskim
CREATE FUNCTION fn_format_date_polish(
    p_date DATETIME
)
RETURNS VARCHAR(50)
DETERMINISTIC
READS SQL DATA
BEGIN
    IF p_date IS NULL THEN
        RETURN NULL;
    END IF;
    RETURN DATE_FORMAT(p_date, '%d.%m.%Y %H:%i');
END //

-- Funkcja 3: Sprawdzanie czy faktura jest przeterminowana
CREATE FUNCTION fn_is_invoice_overdue(
    p_invoice_id INT
)
RETURNS BOOLEAN
READS SQL DATA
BEGIN
    DECLARE v_due_date DATETIME;
    DECLARE v_is_paid BOOLEAN;
    DECLARE v_is_overdue BOOLEAN DEFAULT 0;
    
    SELECT DueDate, IsPaid INTO v_due_date, v_is_paid
    FROM Invoices
    WHERE Id = p_invoice_id;
    
    IF v_due_date IS NOT NULL AND v_due_date < NOW() AND v_is_paid = 0 THEN
        SET v_is_overdue = 1;
    END IF;
    
    RETURN v_is_overdue;
END //

DELIMITER ;

-- ============================================
-- 4. INDEKSY (INDEXES) - na kluczowych kolumnach
-- ============================================

-- Indeksy dla tabeli Customers
CREATE INDEX idx_customers_email ON Customers(Email);
CREATE INDEX idx_customers_company ON Customers(Company);
CREATE INDEX idx_customers_created_at ON Customers(CreatedAt);
CREATE INDEX idx_customers_assigned_group ON Customers(AssignedGroupId);
CREATE INDEX idx_customers_assigned_user ON Customers(AssignedUserId);

-- Indeksy dla tabeli Invoices
CREATE INDEX idx_invoices_customer_id ON Invoices(CustomerId);
CREATE INDEX idx_invoices_issued_at ON Invoices(IssuedAt);
CREATE INDEX idx_invoices_due_date ON Invoices(DueDate);
CREATE INDEX idx_invoices_is_paid ON Invoices(IsPaid);
CREATE INDEX idx_invoices_assigned_group ON Invoices(AssignedGroupId);
CREATE INDEX idx_invoices_number ON Invoices(Number);

-- Indeksy dla tabeli Payments
CREATE INDEX idx_payments_invoice_id ON Payments(InvoiceId);
CREATE INDEX idx_payments_paid_at ON Payments(PaidAt);

-- Indeksy dla tabeli Contracts
CREATE INDEX idx_contracts_customer_id ON Contracts(CustomerId);
CREATE INDEX idx_contracts_signed_at ON Contracts(SignedAt);
CREATE INDEX idx_contracts_start_date ON Contracts(StartDate);
CREATE INDEX idx_contracts_end_date ON Contracts(EndDate);
CREATE INDEX idx_contracts_responsible_group ON Contracts(ResponsibleGroupId);

-- Indeksy dla tabeli Tasks
CREATE INDEX idx_tasks_user_id ON Tasks(UserId);
CREATE INDEX idx_tasks_customer_id ON Tasks(CustomerId);
CREATE INDEX idx_tasks_due_date ON Tasks(DueDate);
CREATE INDEX idx_tasks_completed ON Tasks(Completed);
CREATE INDEX idx_tasks_assigned_group ON Tasks(AssignedGroupId);

-- Indeksy dla tabeli Meetings
CREATE INDEX idx_meetings_scheduled_at ON Meetings(ScheduledAt);
CREATE INDEX idx_meetings_assigned_group ON Meetings(AssignedGroupId);

-- Indeksy dla tabeli Users
CREATE INDEX idx_users_role_id ON users(role_id);

-- Indeksy dla tabeli LoginHistory
CREATE INDEX idx_login_history_user_id ON LoginHistory(UserId);
CREATE INDEX idx_login_history_login_time ON LoginHistory(LoginTime);

-- Indeksy dla tabeli SystemLogs
CREATE INDEX idx_system_logs_timestamp ON SystemLogs(Timestamp);
CREATE INDEX idx_system_logs_level ON SystemLogs(Level);

-- ============================================
-- KONIEC SKRYPTU
-- ============================================

