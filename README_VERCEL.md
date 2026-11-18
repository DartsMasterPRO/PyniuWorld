# Kraina Gier Pyniu – publikacja na Vercelu (PWA)

Aplikacja to jeden plik `index.html` + manifest, service worker i ikony. Po wdrożeniu
można ją zainstalować na telefonie i grać bez internetu.

## 1. Zbuduj pliki
```bash
cd vercel
python3 build_vercel.py            # bierze ../src, wynik w public/
# albo: python3 build_vercel.py /ścieżka/do/src public
```
Powstaje `public/` z: `index.html`, `manifest.webmanifest`, `sw.js` (wersja = hash plików),
`icons/` (192/512, maskable, apple-touch-icon, favicon). Wymaga Pythona 3 i Pillow (`pip install pillow`).

## 2a. Wdrożenie z terminala
```bash
cd vercel
npx vercel           # pierwszy raz: zaloguj się i zatwierdź ustawienia (katalog: ./, output: public)
npx vercel --prod    # wersja produkcyjna
```

## 2b. Wdrożenie przez GitHub
1. Wrzuć katalog `vercel/` (razem z `public/`, `api/`, `lib/`, `package.json` i `vercel.json`) do repozytorium na GitHubie.
   **Nie wrzucaj `VAPID_KLUCZE.txt`** (jest w `.gitignore`).
2. Na vercel.com: **Add New → Project → Import** wybranego repozytorium.
3. Root Directory: `vercel` (jeśli to podkatalog), Framework: **Other**, bez komendy budowania
   (Vercel sam zrobi `npm install` dla funkcji w `api/`),
   Output Directory: `public` (jest też w `vercel.json`).
4. **Deploy**. Każdy push = nowa wersja.

## 3. Aktualizacje
Po zmianach w grach uruchom ponownie `build_vercel.py` i wdroż. Nowy `sw.js` ma nową wersję cache –
w otwartej aplikacji pojawi się pasek **„Nowa wersja Krainy jest gotowa – Odśwież”**.

## 4. Instalacja na telefonie
- **Android (Chrome):** w aplikacji: ⚙ Ustawienia albo 🏆 Profil → **📲 Zainstaluj aplikację**.
- **iPhone (Safari):** **Udostępnij → Do ekranu początkowego** (instrukcja jest pod tym samym przyciskiem).

## Uwagi
- `vercel.json`: `sw.js` i `index.html` bez cache przeglądarki (żeby aktualizacje docierały od razu),
  nagłówek `Service-Worker-Allowed`, a `Permissions-Policy: microphone=(self)` pozwala grom używać mikrofonu.
- Mikrofon i instalacja działają tylko przez HTTPS (Vercel daje HTTPS automatycznie).
- Otwarty z pliku (`file://`) `index.html` nadal działa jak dawniej – service worker i manifest włączają się tylko na http(s).

## 5. 🔔 Powiadomienia push (przypomnienia i zaproszenia)
Aplikacja może wysyłać na telefon: **⭐ Wyzwanie dnia**, **📅 Słowo dnia czeka!** (raz dziennie, wieczorem)
oraz **💌 zaproszenia do gry** od połączonego partnera. Robią to funkcje w `api/` + baza Upstash Redis.

### Jednorazowa konfiguracja na vercel.com
1. **Baza:** projekt → zakładka **Storage** → **Create Database** → **Upstash for Redis** (plan Free) →
   **Connect to Project** (zaznacz Production i Preview). Zmienne `KV_REST_API_URL`/`KV_REST_API_TOKEN`
   (albo `UPSTASH_REDIS_REST_URL`/`_TOKEN`) dodadzą się same.
2. **Klucze:** **Settings → Environment Variables** – dodaj 4 zmienne z pliku **`VAPID_KLUCZE.txt`**
   (leży obok tego README, tylko u Ciebie – nie publikuj go):
   - `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` – skopiuj dokładnie,
   - `VAPID_SUBJECT` – `mailto:` + Twój e-mail (np. `mailto:ania@gmail.com`),
   - `CRON_SECRET` – losowy ciąg z pliku (Vercel sam dołącza go do wywołań crona).
3. **Redeploy:** **Deployments → ⋯ → Redeploy** (zmienne działają dopiero w nowym wdrożeniu).
4. Sprawdź: `https://<twoja-domena>/api/vapid` powinno pokazać `{"ok":true,"key":"B..."}`.

### Na telefonach
- ⚙ Ustawienia → **🔔 Przypomnienia** → **Włącz powiadomienia** → zezwól. Przycisk **🧪 Wyślij powiadomienie próbne** sprawdza, czy działa.
- **💞 Połącz telefony:** na jednym telefonie widać 6-znakowy kod, na drugim wpisz go i stuknij „Połącz”.
  Potem w grze „🌐 Przez internet” → „Utwórz pokój” pojawia się **🔔 Wyślij zaproszenie do: …** – partner dostaje
  powiadomienie, a stuknięcie w nie od razu otwiera grę i dołącza do pokoju.
- **iPhone:** powiadomienia działają tylko w aplikacji dodanej do ekranu początkowego (Safari → Udostępnij →
  „Do ekranu początkowego”), iOS 16.4 lub nowszy. W zwykłej karcie Safari się nie da.

### Ograniczenia
- Plan **Hobby**: cron może działać najwyżej raz dziennie – ustawiony na **17:00 UTC** (`vercel.json` → `crons`),
  czyli ok. 18:00 zimą / 19:00 latem w Polsce (Vercel może go uruchomić w dowolnej minucie tej godziny).
  Kto dziś już zrobił wyzwanie / Słowo dnia, nie dostanie przypomnienia.
- Chcesz, żeby każdy wybierał własną godzinę? Wywołuj `/api/cron` co godzinę zewnętrznym cronem
  (np. cron-job.org z nagłówkiem `Authorization: Bearer <CRON_SECRET>`) i dodaj zmienną `KGP_CRON_HOURLY=1` –
  w aplikacji pojawi się wybór godziny.
- Bez serwera (plik `index.html` albo brak konfiguracji) aplikacja pokazuje przypomnienie o Słowie dnia w menu,
  a zainstalowana w Chrome może raz dziennie przypomnieć sama (Periodic Background Sync – jeśli system pozwoli).
- Jeśli zmienisz klucze VAPID, każdy telefon musi ponownie włączyć przypomnienia.

### Testy lokalne (opcjonalnie)
```bash
cd vercel && npm install
node --test test/           # testy funkcji api (baza w pamięci, push na niby)
node test/serve.js 8765     # public/ + api/ na http://localhost:8765 (KGP_LOCAL_MEMSTORE=1, KGP_FAKE_PUSH=1)
```
