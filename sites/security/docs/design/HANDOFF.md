# security.charemma.de – Handoff für Claude Code

Design-Quelle: `design/Main.dc.html` (Startseite), `design/Wissen.dc.html` (Themenübersicht KI-Sicherheit),
`design/Theme.dc.html` (Farbtafel), `themes.security.dark.css` (Theme im Format von charemma-web).

Die `.dc.html`-Dateien sind Design-Komponenten aus dem Claude-Canvas: Markup in `<x-dc>`, Logik in
`class Component extends DCLogic` (`renderVals()` liefert die Werte für `{{…}}`, `<sc-for>`/`<sc-if>`
sind Schleifen/Bedingungen). **Nicht 1:1 übernehmen**, sondern als exakte Vorlage für eine statische Seite nutzen.

## Ziel
- Statische Seite (HTML/CSS/Vanilla-JS, kein Framework, kein Build-Schritt nötig) – gleicher Stack wie charemma-web:
  `nginx:alpine`, Dockerfile, GitHub Actions → ghcr.io, ArgoCD Image Updater, k3s/Traefik.
- Neues Repo `charemma/security-web` (oder Unterordner) – Struktur wie `charemma-web` (`html/`, `nginx/`, `k8s/`, `justfile`).

## Inhalte / Struktur
1. Header: `charemma@security:~$`, Navigation, Sprachumschalter DE/EN/EL
2. Hero, Profil-Leiste
3. 01 Leistungen (6 Karten)
4. 02 Vorgehen – Canvas-Animation (Herzstück, s. u.)
5. 03 Zusammenarbeit (heller Abschnitt)
6. 04 Werkzeugkasten
7. 05 Wissen · KI-Sicherheit (heller „Wissen“-Bereich, 6 Themen + Link zur Übersicht)
8. 06 Responsible Disclosure, CTA, Footer
- Unterseite `/wissen/ki-sicherheit/` = Themenübersicht (15 Themen), je Thema eine Fachseite
  `/wissen/ki-sicherheit/<slug>/` (Slugs in `topics()` – Inhalte der Fachseiten sind noch zu schreiben).

## i18n
Alle Texte stehen in `i18n()` und `topics()` (de/en/el). Umsetzen als statische Sprachversionen
(`/`, `/en/`, `/el/`) mit `hreflang`, oder clientseitig – SEO-freundlich bevorzugt: statisch generieren.
Sprachwahl in `localStorage('sec-lang')`, Startsprache aus `navigator.language`.

## Animation (Abschnitt „Vorgehen“)
Logik komplett in `Main.dc.html`: `frame()` (Haupt-Canvas), `drawNet()` (Netzwerkkarte), `schedule()`
(Phasen think → work → strike), `attackStepsBase()` (6 Phasen), Agenten/Pentester in `this.ents`.
In ein eigenes Modul `html/assets/js/engagement.js` überführen; Glas-Panel als HTML-Overlay.
`prefers-reduced-motion` respektieren (statischer Endzustand). Maus: Schweif + Pentester folgt, Klick = Anklopfen.

## Farben (aus charemma-web, invertiert)
Hintergrund #2d2e2e / Sections #2b2c2c, #292a2a, Header #282929 · Linien #404242 · Text #e4e5e5, #c0c1c1, #979899
Akzent #268bd2 (Hover hell #006EC1) · Alarm nur bei Kompromittierung #dc322f · Helle Abschnitte #ffffff / #f8f8f8,
Text #727272, Überschriften #3a3a3a · Schriften: Lato (Text), IBM Plex Mono (Terminal/Labels).

## Offene Punkte
- PGP-Fingerprint eintragen, `/.well-known/security.txt` (RFC 9116) anlegen
- Impressum/Datenschutz-Links (aktuell auf charemma.de)
- Fachseiten zu den Wissensthemen schreiben
- Griechische Texte gegenlesen
