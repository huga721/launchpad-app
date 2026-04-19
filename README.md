# 🚀 Launchpad – System Zarządzania Projektami

**Launchpad** to nowoczesny klon narzędzi takich jak Jira czy Trello, skupiający się na maksymalnej efektywności pracy zespołowej dzięki interaktywnej tablicy Kanban.

## 🎯 Cel projektu
Stworzenie w pełni funkcjonalnego MVP (Minimum Viable Product) w ciągu **2 tygodni**, umożliwiającego zespołom planowanie, śledzenie i realizację zadań w ustrukturyzowany sposób.

---

## 👥 Zespół projektowy

| Rola | Osoba | Zadania |
| :--- | :--- | :--- |
| **Frontend** | Cristiano Ronaldo, Marcin | React/Vue UI, Integracja API, Kanban |
| **Backend** | Wrona, Bartek, Hubert | API, Baza danych, Autoryzacja |
| **QA** | Mikołaj | Testy automatyczne, Manualna weryfikacja |
| **UX/UI** | Maciek | Makiety, Design System, Logika przepływu |

---

## 🛠 Lista Funkcjonalności

### 🟥 Must Have (MVP — Tydzień 1–2)
- [ ] **Tablica Kanban** – kolumny: `Backlog`, `In Progress`, `Done`.
- [ ] **Zarządzanie zadaniami (CRUD)** – dodawanie, edycja i usuwanie zadań.
- [ ] **Przypisywanie osób** – możliwość przypisania członka zespołu do konkretnego taska.
- [ ] **Terminy** – pola `Start date` oraz `End date` na każdym zadaniu.
- [ ] **Priorytety** – system rang: `Low`, `Medium`, `High`, `Critical` (kolorowe odznaki).
- [ ] **Etykiety (Labels)** – tworzenie własnych tagów (nazwa + kolor).
- [ ] **System użytkowników** – rejestracja, logowanie oraz prosta edycja profilu.
- [ ] **Uprawnienia (Role)** – podział na `Administratora` oraz `Usera`.
- [ ] **Panel Admina** – zarządzanie użytkownikami i ich rolami.
- [ ] **Projekty** – grupowanie zadań wewnątrz konkretnych projektów.

### 🟧 Should Have (Tydzień 3)
- [ ] **System komentarzy** – komunikacja pod zadaniami (z timestampem).
- [ ] **Historia zmian (Audit Log)** – śledzenie kto i kiedy zmodyfikował zadanie.
- [ ] **Relacje zadań** – powiązania typu: `blokuje`, `blokowane przez`, `powiązane z`.
- [ ] **Zaawansowane filtrowanie** – filtry: "tylko moje", wg priorytetu, etykiet czy osób.
- [ ] **Wykres Gantta** – automatyczna wizualizacja harmonogramu na osi czasu.
- [ ] **Powiadomienia** – alerty mailowe o przypisaniach i nowych komentarzach.
- [ ] **Interakcja Drag & Drop** – intuicyjne przesuwanie kart między kolumnami.

### 🟩 Nice to Have (Tydzień 4+)
- [ ] **Markdown** – wsparcie dla formatowania tekstu w komentarzach.
- [ ] **Personalizacja** – avatary użytkowników oraz **Dark Mode**.
- [ ] **Wyszukiwarka** – szybkie wyszukiwanie zadań po słowach kluczowych.
- [ ] **Eksport danych** – generowanie raportów do formatu CSV.

---

## 📈 Roadmapa
1. **Faza 1 (MVP):** Fundamenty bazy danych, podstawowy UI tablicy, autoryzacja.
2. **Faza 2 (Stabilizacja):** Testy QA, poprawki UX, funkcje "Should have".
3. **Faza 3 (Szlif):** Optymalizacja wydajności, "Nice to have".

---

## 🚀 Uruchomienie backendu

```bash
cd backend
python -m venv venv          # tylko za pierwszym razem
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

API dostępne pod `http://localhost:8000`, dokumentacja Swagger: `http://localhost:8000/docs`

Opcjonalnie — załaduj dane testowe:
```bash
python -m app.database
```

Przy pierwszym starcie serwer automatycznie tworzy konto admina (jeśli żaden admin nie istnieje):

| pole | domyślnie |
|------|-----------|
| email | `admin@admin.com` |
| hasło | `admin` |

Nadpisz przez zmienne środowiskowe `DEFAULT_ADMIN_EMAIL` i `DEFAULT_ADMIN_PASSWORD` (patrz `.env.example`).

---

## 🔐 Autoryzacja

API używa JWT Bearer Token — token uzyskasz przez `POST /auth/login` lub `POST /auth/register`, a następnie dołączasz go do każdego chronionego żądania jako nagłówek `Authorization: Bearer <token>`. Endpointy `/admin/*` wymagają dodatkowo roli `admin`. Szczegóły w [Swagger UI](http://localhost:8000/docs).

---

## 📁 Projekty i role

Każdy zalogowany użytkownik może tworzyć projekty (`POST /projects`). Twórca automatycznie otrzymuje rolę `owner`.

| Rola | Uprawnienia |
|------|-------------|
| `owner` | CRUD projektu, zarządzanie członkami, edycja i dodawanie tasków |
| `editor` | edycja i dodawanie tasków |
| `viewer` | tylko odczyt projektu i tasków |

Globalny `admin` ma dostęp do wszystkich operacji owner-level niezależnie od swojej roli w projekcie.

---

## 📄 Dokumentacja

- [Baza danych](backend/docs/DATABASE.md) – tabele, relacje, seed
