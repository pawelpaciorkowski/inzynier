-- Prosta migracja: Dodanie kolumny RepresentativeUserId do tabeli Customers
-- Uruchom: mysql -u root -p crm_project < migrate_representative_simple.sql

USE crm_project;

-- Krok 1: Dodaj nową kolumnę RepresentativeUserId (jeśli nie istnieje)
ALTER TABLE `Customers`
ADD COLUMN `RepresentativeUserId` INT NULL
AFTER `NIP`;

-- Krok 2: Dodaj Foreign Key constraint (jeśli nie istnieje)
-- Sprawdź czy constraint już istnieje przed dodaniem
SET @constraint_exists = (
    SELECT COUNT(*) 
    FROM information_schema.TABLE_CONSTRAINTS 
    WHERE TABLE_SCHEMA = 'crm_project' 
    AND TABLE_NAME = 'Customers' 
    AND CONSTRAINT_NAME = 'FK_Customers_users_RepresentativeUserId'
);

SET @add_fk_sql = IF(@constraint_exists = 0, 
    'ALTER TABLE `Customers` ADD CONSTRAINT `FK_Customers_users_RepresentativeUserId` FOREIGN KEY (`RepresentativeUserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE', 
    'SELECT "Constraint już istnieje, pomijam dodawanie" AS info'
);

PREPARE stmt FROM @add_fk_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Krok 3: Usuń starą kolumnę Representative (jeśli istnieje)
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

PREPARE stmt2 FROM @drop_sql;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;

-- Krok 4: Sprawdź wynik
SELECT 
    'Migracja zakończona!' AS Status,
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'crm_project'
AND TABLE_NAME = 'Customers'
AND COLUMN_NAME = 'RepresentativeUserId';

