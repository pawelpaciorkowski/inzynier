-- Sprawdź wszystkie Foreign Keys powiązane z tabelą users
USE crm_project;

SELECT
    TABLE_NAME as 'Tabela',
    COLUMN_NAME as 'Kolumna',
    CONSTRAINT_NAME as 'Nazwa Constraintu',
    REFERENCED_TABLE_NAME as 'Odnosi się do',
    REFERENCED_COLUMN_NAME as 'Odnosi się do kolumny'
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'crm_project'
AND REFERENCED_TABLE_NAME = 'users'
AND CONSTRAINT_NAME != 'PRIMARY'
ORDER BY TABLE_NAME;
