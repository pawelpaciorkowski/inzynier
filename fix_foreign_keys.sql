-- Skrypt do naprawy Foreign Keys w bazie CRM
-- Ten skrypt zmienia constrainty na ON DELETE SET NULL
-- aby móc usuwać użytkowników bez problemów

USE crm_project;

-- 1. CUSTOMERS - AssignedUserId
-- Usuń stary constraint
ALTER TABLE `Customers`
DROP FOREIGN KEY `FK_Customers_users_AssignedUserId`;

-- Dodaj nowy z ON DELETE SET NULL
ALTER TABLE `Customers`
ADD CONSTRAINT `FK_Customers_users_AssignedUserId`
FOREIGN KEY (`AssignedUserId`)
REFERENCES `users` (`id`)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- 2. INVOICES - CreatedByUserId (jeśli istnieje)
-- Sprawdź czy constraint istnieje i usuń go
SET @constraint_name = (
    SELECT CONSTRAINT_NAME
    FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = 'crm_project'
    AND TABLE_NAME = 'Invoices'
    AND COLUMN_NAME = 'CreatedByUserId'
    AND CONSTRAINT_NAME != 'PRIMARY'
    LIMIT 1
);

SET @sql = IF(@constraint_name IS NOT NULL,
    CONCAT('ALTER TABLE `Invoices` DROP FOREIGN KEY `', @constraint_name, '`'),
    'SELECT "No FK for Invoices.CreatedByUserId" AS Info'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Dodaj nowy constraint z ON DELETE SET NULL
ALTER TABLE `Invoices`
ADD CONSTRAINT `FK_Invoices_users_CreatedByUserId`
FOREIGN KEY (`CreatedByUserId`)
REFERENCES `users` (`id`)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- 3. CONTRACTS - CreatedByUserId lub AssignedUserId (jeśli istnieje)
SET @constraint_name = (
    SELECT CONSTRAINT_NAME
    FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = 'crm_project'
    AND TABLE_NAME = 'Contracts'
    AND REFERENCED_TABLE_NAME = 'users'
    AND CONSTRAINT_NAME != 'PRIMARY'
    LIMIT 1
);

SET @sql = IF(@constraint_name IS NOT NULL,
    CONCAT('ALTER TABLE `Contracts` DROP FOREIGN KEY `', @constraint_name, '`'),
    'SELECT "No FK for Contracts" AS Info'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 4. ACTIVITIES - UserId (jeśli istnieje)
SET @constraint_name = (
    SELECT CONSTRAINT_NAME
    FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = 'crm_project'
    AND TABLE_NAME = 'Activities'
    AND COLUMN_NAME = 'UserId'
    AND CONSTRAINT_NAME != 'PRIMARY'
    LIMIT 1
);

SET @sql = IF(@constraint_name IS NOT NULL,
    CONCAT('ALTER TABLE `Activities` DROP FOREIGN KEY `', @constraint_name, '`'),
    'SELECT "No FK for Activities" AS Info'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 5. NOTES - CreatedByUserId (jeśli istnieje)
SET @constraint_name = (
    SELECT CONSTRAINT_NAME
    FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = 'crm_project'
    AND TABLE_NAME = 'Notes'
    AND REFERENCED_TABLE_NAME = 'users'
    AND CONSTRAINT_NAME != 'PRIMARY'
    LIMIT 1
);

SET @sql = IF(@constraint_name IS NOT NULL,
    CONCAT('ALTER TABLE `Notes` DROP FOREIGN KEY `', @constraint_name, '`'),
    'SELECT "No FK for Notes" AS Info'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Wyświetl podsumowanie
SELECT 'Foreign keys zostały zaktualizowane!' AS Status;

-- Sprawdź aktualne constrainty
SELECT
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'crm_project'
AND REFERENCED_TABLE_NAME = 'users'
ORDER BY TABLE_NAME;
