-- Migracja: Zmiana kolumny Representative z VARCHAR na RepresentativeUserId (Foreign Key do users)
-- Ten skrypt zmienia pole "Przedstawiciel" z tekstu na relację z tabelą użytkowników

USE crm_project;

-- Krok 1: Dodaj nową kolumnę RepresentativeUserId
ALTER TABLE `Customers`
ADD COLUMN `RepresentativeUserId` INT NULL
AFTER `NIP`;

-- Krok 2: Dodaj Foreign Key constraint
ALTER TABLE `Customers`
ADD CONSTRAINT `FK_Customers_users_RepresentativeUserId`
FOREIGN KEY (`RepresentativeUserId`)
REFERENCES `users` (`id`)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- Krok 3: Usuń starą kolumnę Representative (jeśli istnieje)
-- UWAGA: To usunie wszystkie istniejące dane tekstowe w polu Representative!
-- Jeśli chcesz zachować dane, najpierw wykonaj backup lub zmapuj dane ręcznie
-- Sprawdź czy kolumna istnieje przed usunięciem
SET @col_exists = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = 'crm_project' 
    AND TABLE_NAME = 'Customers' 
    AND COLUMN_NAME = 'Representative'
);

SET @drop_sql = IF(@col_exists > 0, 
    'ALTER TABLE `Customers` DROP COLUMN `Representative`', 
    'SELECT "Kolumna Representative nie istnieje, pomijam usuwanie" AS info'
);

PREPARE stmt FROM @drop_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Krok 4: Sprawdź czy migracja się powiodła
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'crm_project'
AND TABLE_NAME = 'Customers'
AND COLUMN_NAME IN ('Representative', 'RepresentativeUserId');

-- Sprawdź Foreign Key
SELECT
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME,
    DELETE_RULE,
    UPDATE_RULE
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'crm_project'
AND CONSTRAINT_NAME = 'FK_Customers_users_RepresentativeUserId';

