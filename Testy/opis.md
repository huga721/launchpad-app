# Jak uruchomić testy

Poniżej jest prosty przewodnik jak odpalić testy dla backendu (FastAPI) i frontend’u (Angular).
Testy są tylko „smoke’owe” na start, czyli sprawdzają czy podstawowe rzeczy działają i czy nic nie sypie aplikacji.

## Backend (FastAPI)
1. Wejdź do folderu `backend`
2. Zainstaluj zależności:
   - `py -m pip install -r requirements.txt`
   - `py -m pip install pytest httpx`
3. Odpal testy:
   - `py -m pytest`

Testy są w pliku: `backend/tests/test_api.py`.

Poniżej co sprawdza każdy test:

### 1) `test_health_endpoint_returns_healthy`
- Dlaczego: żeby upewnić się, że API w ogóle działa i endpoint odpowiada jak powinien.
- Czy grozi SQL injection: nie (to endpoint publiczny, bez wprowadzania danych do zapytań).
- Jak to robię: odpalam `GET /health` i sprawdzam odpowiedź JSON.
- Rezultat: dostajesz status `200` i `{"status": "healthy"}`.

### 2) `test_register_login_and_me_flow`
- Dlaczego: żeby sprawdzić, że autoryzacja działa end-to-end (rejestracja, logowanie, odczyt profilu).
- Czy grozi SQL injection: pośrednio sprawdzam, że backend poprawnie przyjmuje dane od użytkownika (email/hasło) i nie sypie się od podstawowych wejść; zapytania do bazy są robione przez ORM (bez budowania SQL stringami).
- Jak to robię:
  - `POST /auth/register`
  - `POST /auth/login` (dostaję token)
  - `GET /auth/me` z nagłówkiem `Authorization: Bearer <token>`
- Rezultat: wszystkie requesty zwracają OK, a w `/auth/me` dostaję dane użytkownika.

### 3) `test_sql_injection_like_search_is_safe`
- Dlaczego: żeby konkretnie sprawdzić ryzyko SQL injection w miejscu, gdzie jest parametr wyszukiwania (`/auth/users?search=...`).
- Czy grozi SQL injection: potencjalnie tak, gdyby backend robił zapytanie przez ręczne sklejenie SQL stringami. Ten test pokazuje, że podany payload nie powoduje błędu i nie „przechwytuje” logiki zapytania.
- Jak to robię:
  - Rejestruję użytkownika i biorę token
  - Wysyłam `GET /auth/users?search=' OR 1=1;--`
  - Oczekuję, że to nie pasuje do żadnego `full_name`
- Rezultat: status `200`, a odpowiedź to pusta lista (`[]`).

## Frontend (Angular)
1. Wejdź do folderu `frontend/launchpad`
2. Zainstaluj zależności:
   - `npm install`
3. Odpal testy:
   - `npm test -- --watch=false --browsers=ChromeHeadless`

Co testy sprawdzają:
- czy podstawowe komponenty da się uruchomić w trybie testowym (czyli czy testy nie wywalają się od razu)
- prosty test strony głównej (czy renderuje oczekiwany tekst)

Uwaga:
- u mnie te testy mają błędy (Angular `HttpClient` / `ActivatedRoute` w środowisku testowym). Mimo tego testy się uruchamiają i widać dokładnie które komponenty/serwisy nie mają poprawnych providerów w testach.

