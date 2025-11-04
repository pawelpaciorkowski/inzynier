-- Migracja: Utworzenie tabeli ContractServices dla relacji many-to-many między kontraktami a usługami
-- Uruchom: mysql -u root -p crm_project < migrate_contract_services.sql

USE crm_project;

-- Krok 1: Utwórz tabelę ContractServices
CREATE TABLE IF NOT EXISTS `ContractServices` (
    `ContractId` INT NOT NULL,
    `ServiceId` INT NOT NULL,
    `Quantity` INT DEFAULT 1,
    PRIMARY KEY (`ContractId`, `ServiceId`),
    CONSTRAINT `FK_ContractServices_Contracts` 
        FOREIGN KEY (`ContractId`) REFERENCES `Contracts` (`Id`) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    CONSTRAINT `FK_ContractServices_Services` 
        FOREIGN KEY (`ServiceId`) REFERENCES `Services` (`Id`) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Krok 2: Sprawdź czy tabela została utworzona
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'crm_project'
AND TABLE_NAME = 'ContractServices'
ORDER BY ORDINAL_POSITION;

-- Sprawdź Foreign Keys
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
AND TABLE_NAME = 'ContractServices';

