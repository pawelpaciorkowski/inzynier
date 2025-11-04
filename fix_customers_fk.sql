-- Napraw Foreign Key dla Customers.AssignedUserId
-- Ten skrypt pozwoli usuwać użytkowników bez błędów

USE crm_project;

-- Krok 1: Usuń stary constraint
ALTER TABLE `Customers`
DROP FOREIGN KEY `FK_Customers_users_AssignedUserId`;

-- Krok 2: Dodaj nowy constraint z ON DELETE SET NULL
ALTER TABLE `Customers`
ADD CONSTRAINT `FK_Customers_users_AssignedUserId`
FOREIGN KEY (`AssignedUserId`)
REFERENCES `users` (`id`)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- Krok 3: Sprawdź czy zadziałało
SELECT 'Foreign key został zaktualizowany!' AS Status;

-- Krok 4: Sprawdź nowy constraint
SELECT
    CONSTRAINT_NAME,
    UPDATE_RULE,
    DELETE_RULE
FROM information_schema.REFERENTIAL_CONSTRAINTS
WHERE CONSTRAINT_SCHEMA = 'crm_project'
AND CONSTRAINT_NAME = 'FK_Customers_users_AssignedUserId';
