# 🔧 Naprawka Danych Firmy w Umowach

## 🎯 Problem
Dane firmy w generowanych umowach były hardcoded w kodzie zamiast być pobierane z tabeli `Settings` w bazie danych.

**Przed poprawką:**
```
Twoja Firma Sp. z o.o., ul. Przykładowa 123, 00-000 Warszawa, NIP: 1234567890
```

**Po poprawce:**
```
Moja Firma IT Sp. z o.o, ul. Przykładowa 1, 00-001 Warszawa, NIP: 123-456-78-90
```

## ✅ Rozwiązanie

### 1. **Dodano Import Modelu Setting**
```python
from app.models import Contract, Customer, User, Template, Setting
```

### 2. **Pobieranie Danych Firmy z Bazy**
```python
# Pobierz dane firmy z bazy danych
company_settings = {}
settings = Setting.query.all()
for setting in settings:
    company_settings[setting.Key] = setting.Value
```

### 3. **Użycie Danych z Bazy w Znacznikach**
```python
template_variables = {
    'NAZWA_WYKONAWCY': company_settings.get('CompanyName', 'Twoja Firma Sp. z o.o.'),
    'ADRES_WYKONAWCY': company_settings.get('CompanyAddress', 'ul. Przykładowa 123, 00-000 Warszawa'),
    'NIP_WYKONAWCY': company_settings.get('CompanyNIP', '1234567890'),
    'NUMER_KONTA_BANKOWEGO_WYKONAWCY': company_settings.get('CompanyBankAccount', '12 3456 7890 1234 5678 9012 3456'),
    'TERMIN_PLATNOSCI': str(contract.PaymentTermDays) if contract.PaymentTermDays else str(company_settings.get('payment_terms_default', '14')),
    'NUMER_UMOWY': contract.ContractNumber or f"{company_settings.get('contract_prefix', 'UM')}/{datetime.now().year}/{contract.Id}",
}
```

## 📋 Mapowanie Danych z Bazy

| Znacznik w Umowie | Klucz w Settings | Wartość z Bazy |
|------------------|------------------|----------------|
| `{NAZWA_WYKONAWCY}` | `CompanyName` | `Moja Firma IT Sp. z o.o` |
| `{ADRES_WYKONAWCY}` | `CompanyAddress` | `ul. Przykładowa 1, 00-001 Warszawa` |
| `{NIP_WYKONAWCY}` | `CompanyNIP` | `123-456-78-90` |
| `{NUMER_KONTA_BANKOWEGO_WYKONAWCY}` | `CompanyBankAccount` | `PL 11 2222 3333 4444 5555 6666 7777` |
| `{TERMIN_PLATNOSCI}` | `payment_terms_default` | `14` |
| `{NUMER_UMOWY}` | `contract_prefix` | `UMW` |

## 🎉 Rezultat

### **Przed:**
```
UMOWA ŚWIADCZENIA USŁUG UM/2024/005
Zawarta dnia 20.09.2025 w Warszawa
MIĘDZY:
StartupTech, ul. Łódzka 55, 90-001 Łódź, NIP: 5678901234, reprezentowana przez Tomasz Zieliński - Founder („Klient")
A:
Twoja Firma Sp. z o.o., ul. Przykładowa 123, 00-000 Warszawa, NIP: 1234567890, reprezentowana przez Jana Nowaka - Prezesa Zarządu („Usługodawca")
```

### **Po:**
```
UMOWA O ŚWIADCZENIE USŁUG nr UM/2024/001
zawarta w dniu 06.08.2025 r. w Warszawa pomiędzy:
1. Kowalski Solutions Sp. z o.o., z siedzibą w ul. Warszawska 15, 00-001 Warszawa, NIP: 1234567890, reprezentowaną przez: Jan Kowalski - Prezes
2. Moja Firma IT Sp. z o.o, z siedzibą w ul. Przykładowa 1, 00-001 Warszawa, NIP: 123-456-78-90, reprezentowaną przez: Jana Nowaka – Prezesa Zarządu
```

## 🚀 **GOTOWE!**

Teraz wszystkie umowy będą generowane z prawidłowymi danymi firmy pobieranymi z tabeli `Settings` w bazie danych. Możesz zmieniać dane firmy w ustawieniach, a wszystkie nowe umowy będą automatycznie używać aktualnych danych!

### **Jak zmienić dane firmy:**
1. Idź do sekcji **Ustawienia** w aplikacji
2. Zmień dane firmy (nazwa, adres, NIP, konto bankowe)
3. Zapisz zmiany
4. Wszystkie nowe umowy będą używać nowych danych

🎯 **Problem rozwiązany!** ✅
