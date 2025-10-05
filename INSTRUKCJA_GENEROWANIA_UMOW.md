# 📋 Instrukcja Generowania Umów z Szablonów

## 🎯 Opis Funkcjonalności

System umożliwia generowanie umów na podstawie szablonów z automatycznym wypełnianiem znaczników danymi z bazy danych.

## ✅ Dostępne Znaczniki (17 zmiennych)

Wszystkie znaczniki są wypełniane automatycznie danymi z bazy:

1. **{NUMER_UMOWY}** - Numer umowy z bazy danych
2. **{DATA_PODPISANIA}** - Data podpisania umowy
3. **{MIEJSCE_ZAWARCIA}** - Miejsce zawarcia umowy (domyślnie: Warszawa)
4. **{NAZWA_KLIENTA}** - Nazwa firmy klienta
5. **{ADRES_KLIENTA}** - Adres klienta
6. **{NIP_KLIENTA}** - NIP klienta
7. **{REPREZENTANT_KLIENTA}** - Przedstawiciel klienta
8. **{NAZWA_WYKONAWCY}** - Nazwa Twojej firmy
9. **{ADRES_WYKONAWCY}** - Adres Twojej firmy
10. **{NIP_WYKONAWCY}** - NIP Twojej firmy
11. **{TYTUL_UMOWY}** - Tytuł umowy z bazy danych
12. **{SZCZEGOLOWY_ZAKRES_USLUG}** - Szczegółowy zakres usług
13. **{DATA_ROZPOCZECIA}** - Data rozpoczęcia umowy
14. **{DATA_ZAKONCZENIA}** - Data zakończenia umowy
15. **{KWOTA_WYNAGRODZENIA_NETTO}** - Kwota wynagrodzenia netto
16. **{NUMER_KONTA_BANKOWEGO_WYKONAWCY}** - Numer konta bankowego
17. **{TERMIN_PLATNOSCI}** - Termin płatności w dniach

## 🔧 Jak Używać

### 1. Przesłanie Szablonu
```
POST /api/Templates/upload
Content-Type: multipart/form-data

- file: plik szablonu (.txt, .docx, .doc, .pdf)
- name: nazwa szablonu
```

### 2. Generowanie Umowy
```
POST /api/Contracts/{contract_id}/generate-from-template
Content-Type: application/json

{
  "template_id": 17
}
```

### 3. Pobieranie Listy Szablonów
```
GET /api/Contracts/templates
```

## 📝 Przykład Szablonu

```
UMOWA O ŚWIADCZENIE USŁUG nr {NUMER_UMOWY}
zawarta w dniu {DATA_PODPISANIA} r. w {MIEJSCE_ZAWARCIA} pomiędzy:

1. {NAZWA_KLIENTA}, z siedzibą w {ADRES_KLIENTA}, NIP: {NIP_KLIENTA}, 
   reprezentowaną przez: {REPREZENTANT_KLIENTA}

2. {NAZWA_WYKONAWCY}, z siedzibą w {ADRES_WYKONAWCY}, NIP: {NIP_WYKONAWCY}

§ 1. Przedmiot Umowy
1. Usługi: {TYTUL_UMOWY}
2. Zakres: {SZCZEGOLOWY_ZAKRES_USLUG}

§ 2. Czas Trwania
1. Od: {DATA_ROZPOCZECIA} do: {DATA_ZAKONCZENIA}

§ 3. Wynagrodzenie
1. Kwota: {KWOTA_WYNAGRODZENIA_NETTO} PLN netto
2. Płatność: {TERMIN_PLATNOSCI} dni
3. Konto: {NUMER_KONTA_BANKOWEGO_WYKONAWCY}
```

## 🗂️ Struktura Plików

```
backend-python/app/uploads/templates/
├── 20251005_222521_szablon_umowy.txt
├── wzor_umowy_1.docx
├── wzor_umowy_2.docx
└── ...
```

## 🔄 Proces Wypełniania Znaczników

1. **Pobranie danych z bazy:**
   - Kontrakt: `Contracts` tabela
   - Klient: `Customers` tabela
   - Dane firmy: (można dodać do ustawień)

2. **Zastąpienie znaczników:**
   - Regex: `\{NAZWA_ZNACZNIKA\}`
   - W plikach .txt: bezpośrednie zastąpienie
   - W plikach .docx: zastąpienie w paragrafach i tabelach

3. **Generowanie pliku:**
   - Plik tymczasowy
   - Pobranie jako attachment
   - Automatyczne usunięcie po pobraniu

## ⚙️ Konfiguracja Danych Firmy

Aktualnie dane firmy są hardcoded w kodzie. Można je przenieść do tabeli `Settings`:

```python
# W contracts.py - linie 302-304, 310
'NAZWA_WYKONAWCY': 'Twoja Firma Sp. z o.o.',
'ADRES_WYKONAWCY': 'ul. Przykładowa 123, 00-000 Warszawa',
'NIP_WYKONAWCY': '1234567890',
'NUMER_KONTA_BANKOWEGO_WYKONAWCY': '12 3456 7890 1234 5678 9012 3456',
```

## 🎉 Przykład Wyniku

Po wygenerowaniu umowy otrzymasz plik z wypełnionymi danymi:

```
UMOWA O ŚWIADCZENIE USŁUG nr UM/2024/001
zawarta w dniu 06.08.2025 r. w Warszawa pomiędzy:

1. Kowalski Solutions Sp. z o.o., z siedzibą w ul. Warszawska 15, 00-001 Warszawa, 
   NIP: 1234567890, reprezentowaną przez: Jan Kowalski - Prezes

2. Twoja Firma Sp. z o.o., z siedzibą w ul. Przykładowa 123, 00-000 Warszawa, 
   NIP: 1234567890

§ 1. Przedmiot Umowy
1. Usługi: Umowa o świadczenie usług IT
2. Zakres: Tworzenie i utrzymanie strony internetowej

§ 2. Czas Trwania
1. Od: 06.08.2025 do: 06.08.2026

§ 3. Wynagrodzenie
1. Kwota: 5000 PLN netto
2. Płatność: 14 dni
3. Konto: 12 3456 7890 1234 5678 9012 3456
```

## 🚀 Status Implementacji

✅ **Zakończone:**
- Endpoint upload szablonów
- Endpoint generowania umów z szablonów
- Obsługa 17 znaczników
- Wypełnianie danymi z bazy
- Obsługa plików .txt i .docx
- Test funkcjonalności

✅ **Gotowe do użycia!**
