# 🔧 Naprawa Foreign Keys w Bazie Danych CRM

## Problem
Nie możesz usunąć użytkowników z bazy, bo dostajes błąd:
```
Cannot delete or update a parent row: a foreign key constraint fails
(crm_project.Customers, CONSTRAINT FK_Customers_users_AssignedUserId)
```

## Rozwiązanie

Zmień foreign key constraint z domyślnego (`RESTRICT`) na `ON DELETE SET NULL`.

---

## 📝 Instrukcja Krok po Kroku

### Krok 1: Sprawdź obecne foreign keys

Otwórz MySQL i uruchom:

```bash
mysql -u root -p crm_project < check_foreign_keys.sql
```

LUB w MySQL Workbench/DBeaver:
```sql
USE crm_project;

SELECT
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'crm_project'
AND REFERENCED_TABLE_NAME = 'users';
```

### Krok 2: Napraw constraint dla Customers (podstawowy)

```bash
mysql -u root -p crm_project < fix_customers_fk.sql
```

LUB w MySQL Workbench/DBeaver - skopiuj i uruchom zawartość pliku `fix_customers_fk.sql`.

### Krok 3: Napraw wszystkie constrainty (opcjonalne, ale zalecane)

```bash
mysql -u root -p crm_project < fix_foreign_keys.sql
```

---

## 🎯 Co Dokładnie Robi Ten Fix?

### PRZED:
```sql
FK_Customers_users_AssignedUserId
FOREIGN KEY (AssignedUserId) REFERENCES users(id)
-- Domyślnie: ON DELETE RESTRICT
```
**Problem:** Nie możesz usunąć użytkownika, jeśli ma przypisanych klientów.

### PO:
```sql
FK_Customers_users_AssignedUserId
FOREIGN KEY (AssignedUserId) REFERENCES users(id)
ON DELETE SET NULL
ON UPDATE CASCADE
```
**Rozwiązanie:**
- Gdy usuniesz użytkownika, `AssignedUserId` w Customers zostanie ustawiony na `NULL`
- Klienci NIE zostaną usunięci
- Dane pozostają bezpieczne

---

## ✅ Weryfikacja

Po wykonaniu skryptu sprawdź czy działa:

```sql
-- Sprawdź constraint
SELECT
    CONSTRAINT_NAME,
    DELETE_RULE
FROM information_schema.REFERENTIAL_CONSTRAINTS
WHERE CONSTRAINT_SCHEMA = 'crm_project'
AND CONSTRAINT_NAME = 'FK_Customers_users_AssignedUserId';

-- Powinno pokazać: DELETE_RULE = 'SET NULL'
```

Teraz spróbuj usunąć użytkownika:

```sql
-- To powinno działać bez błędów
DELETE FROM users WHERE id = [ID_TESTOWEGO_USERA];
```

---

## 🚀 Szybka Naprawa (One-liner)

Jeśli chcesz naprawić tylko problem z Customers, uruchom w MySQL:

```sql
USE crm_project;

ALTER TABLE `Customers`
DROP FOREIGN KEY `FK_Customers_users_AssignedUserId`;

ALTER TABLE `Customers`
ADD CONSTRAINT `FK_Customers_users_AssignedUserId`
FOREIGN KEY (`AssignedUserId`)
REFERENCES `users` (`id`)
ON DELETE SET NULL
ON UPDATE CASCADE;
```

---

## 📊 Jakie Tabele Mogą Mieć Ten Problem?

Sprawdź te tabele (mogą mieć podobne problemy):

- ✅ **Customers** - AssignedUserId (naprawione)
- ⚠️ Invoices - CreatedByUserId
- ⚠️ Contracts - CreatedByUserId/AssignedUserId
- ⚠️ Activities - UserId
- ⚠️ Notes - CreatedByUserId
- ⚠️ Messages - SenderUserId/RecipientUserId
- ⚠️ Notifications - UserId
- ⚠️ Reminders - UserId

Użyj `fix_foreign_keys.sql` aby naprawić wszystkie naraz.

---

## ⚠️ Uwaga

**Backup przed zmianami!**

Zawsze przed modyfikacją struktury bazy zrób backup:

```bash
mysqldump -u root -p crm_project > crm_backup_$(date +%Y%m%d).sql
```

---

## 🆘 Pomoc

### Problem: "Cannot drop foreign key - constraint doesn't exist"
**Rozwiązanie:** Sprawdź dokładną nazwę constraintu:
```sql
SHOW CREATE TABLE Customers;
```

### Problem: "Column cannot be null"
**Rozwiązanie:** Upewnij się, że kolumna `AssignedUserId` jest typu `INT NULL` (nie NOT NULL):
```sql
ALTER TABLE Customers MODIFY AssignedUserId INT NULL;
```

---

## ✅ Po Naprawie

Po naprawie foreign keys:
- ✅ Możesz usuwać użytkowników bez problemów
- ✅ Klienci nie zostaną usunięci
- ✅ `AssignedUserId` zostanie automatycznie ustawiony na NULL
- ✅ Integralność danych zachowana
- ✅ Testy będą przechodzić lepiej

---

**Gotowe! 🎉**

Po wykonaniu tych kroków problem z usuwaniem użytkowników zniknie!
