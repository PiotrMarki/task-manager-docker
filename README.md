# Lista przepisów kulinarnych – aplikacja webowa

## Temat projektu
Aplikacja webowa do zarządzania przepisami kulinarnymi z podziałem na kategorie
oraz oceną przepisów w skali od 1 do 5.  

Projekt wykorzystuje Docker, Docker Compose, Node.js (Express) oraz bazę danych PostgreSQL.

---

## Autorzy
- Piotr Markiewicz – nr indeksu: 50873

## Opis projektu
Aplikacja umożliwia:
- Dodawanie, edytowanie i usuwanie kategorii przepisów,
- Dodawanie, edytowanie i usuwanie przepisów kulinarnych,
- Przypisywanie przepisów do kategorii,
- Ocenianie przepisów w skali od 1 do 5.

Interfejs użytkownika został wykonany w HTML, CSS oraz JavaScript i komunikuje się
z backendem za pomocą zapytań HTTP (fetch API).
Dane są przechowywane w relacyjnej bazie danych PostgreSQL.

## Uruchomienie projektu

### Wymagania
- Docker
- Docker Compose

### Kroki uruchomienia
1. Sklonuj repozytorium lub pobierz projekt na komputer.
2. Otwórz terminal w katalogu głównym projektu.
3. Uruchom polecenie:
   ```bash
   docker compose up --build
4. Aplikacja zostanie uruchomiona na:
   http://localhost:3000
