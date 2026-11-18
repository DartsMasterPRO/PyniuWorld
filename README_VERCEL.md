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
1. Wrzuć katalog `vercel/` (razem z `public/` i `vercel.json`) do repozytorium na GitHubie.
2. Na vercel.com: **Add New → Project → Import** wybranego repozytorium.
3. Root Directory: `vercel` (jeśli to podkatalog), Framework: **Other**, bez komendy budowania,
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
