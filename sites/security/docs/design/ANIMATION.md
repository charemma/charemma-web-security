# Regel: Animationen in Wissensartikeln

> Gilt für alle interaktiven Illustrationen und Animationen in Wissensartikeln
> (security.charemma.de/wissen/…). Nicht für die Startseite – deren organische
> Animation ist Markenbild, keine Erklärung.

---

## Teil A – Prinzip für die Constitution

Zum Einfügen in `.specify/memory/constitution.md` als neues Prinzip.

### Prinzip: Erklären vor Beeindrucken (Wissens-Animationen)

Animationen in Wissensartikeln MÜSSEN einen Mechanismus so zeigen, dass die
Zielgruppe ihn ohne Vorwissen über den Angriff versteht.

- Darstellungen MÜSSEN realitätsnah sein: Sie zeigen die Oberflächen, die die
  Zielgruppe kennt (Issue-Seite, CI-Log, Chat, Terminal, E-Mail), keine
  abstrakten Metaphern.
- Der Leser MUSS das Tempo bestimmen: Kapitel zum Durchklicken, Abspielen/Pause,
  kein Endlos-Loop, keine Steuerung über die Scroll-Position.
- Bewegung MUSS sparsam sein und darf nur Ursache und Wirkung zeigen
  (Text wird getippt, Log läuft ein, Kommentar erscheint). Dekorative Bewegung
  ist verboten.
- Jede Animation MUSS ohne Bewegung vollständig verständlich sein (statische
  Fallback-Fassung, `prefers-reduced-motion`).
- Inhalte MÜSSEN fachlich ehrlich sein: belegte Fälle mit Quelle, keine
  übertriebenen Schutzversprechen, Restrisiko wird benannt.

**Begründung:** In der Entwicklung der Prompt-Injection-Animation sind
abstrakte, filmische und scroll-gesteuerte Varianten gescheitert, weil Leser
erst die Bildsprache übersetzen mussten oder zwischen Text und Bild springen
mussten. Verstanden wurde erst die Variante mit vertrauten Bildschirmen,
selbstbestimmtem Tempo und einem einzigen interaktiven Aha-Moment.

---

## Teil B – Leitfaden

### 1. Realitätsnah statt abstrakt

- Zeige echte Artefakte: das Issue-Formular, die gerenderte Issue-Seite,
  das Actions-Log, den Bot-Kommentar. Der Leser soll *wiedererkennen*,
  nicht *lernen*, was ein Kasten bedeutet.
- Nachbauten sind erkennbar, aber keine Kopie: keine Logos, keine Marken-
  schriften, generische Namen (`example/app`, `helpful-dev42`), Beschriftung
  „Illustration“ am Rand.
- Fließtext in normaler Lesegröße (≥ 16 px, Sans). Monospace nur für echten
  Code, Logs und Rohtext.
- Secrets und Tokens immer maskiert (`ghs_••••3fA`). Keine erfundenen Zahlen.

### 2. Der Leser bestimmt das Tempo

- Gliederung in **4–6 Kapitel**, sichtbar als klickbare Kapitelleiste mit
  Fortschritt (wie ein Video-Player).
- Abspielen/Pause; Autoplay nur, wenn die Animation ins Bild scrollt;
  Pause beim Verlassen des Viewports; am Ende stehen bleiben (↻ statt Loop).
- Pro Kapitel genug Zeit zum Lesen der Bildunterschrift (Richtwert 7–11 s);
  nach jeder Szene kurz stehen bleiben.
- **Keine** Scroll-Synchronisation (Scrollytelling), **keine** Hover-only-
  Interaktion, **kein** Hinweistext wie „Das Diagramm folgt dem Text“ –
  wenn die Bedienung erklärt werden muss, ist sie falsch.

### 3. Wenig Bewegung, nur mit Bedeutung

Erlaubt – weil sie den Ablauf erzählen:
- Text tippt sich ein, ein Button wird gedrückt, eine Seite wechselt.
- Log-Zeilen laufen nacheinander ein, Status wechselt von „in progress“ zu „completed“.
- Zwei Inhalte rücken zusammen (z. B. Systemanweisung + Issue → ein Prompt).
- Ein neues Element erscheint (Benachrichtigung, Kommentar).

Nicht erlaubt:
- Partikel, organische Formen, Glitch, Blitze, Kamerafahrten, Hintergrund-
  animationen, pulsierende Dekoration.
- Gleichzeitige Bewegung an mehreren Stellen. Es bewegt sich immer nur das,
  worüber die Bildunterschrift gerade spricht.

### 4. Ein Aha-Moment, interaktiv

- Jede Animation hat genau **einen** Moment, in dem der Leser selbst etwas
  entdeckt – typischerweise „Was du siehst / Was das Modell sieht“
  (z. B. Lupe über dem Issue, die den versteckten HTML-Kommentar freilegt).
- Dieser Moment wird zuerst automatisch gezeigt und ist danach selbst
  bedienbar (Maus **und** Touch), plus ein Button-Fallback für Tastatur und
  Screenreader („Rohtext anzeigen“).

### 5. Text gehört zur Szene

- Genau **eine** Bildunterschrift pro Kapitel, direkt unter der Bühne:
  fette Kernaussage + ein bis zwei Sätze.
- Keine zweite Textspalte und kein Panel neben der Animation, das parallel
  gelesen werden muss (geteilte Aufmerksamkeit).
- Der Artikeltext rund um die Animation wiederholt die Schritte nicht,
  sondern ordnet ein.

### 6. Fachlich ehrlich

- Szenario aus einem dokumentierten Fall, Quelle im Artikel.
- Der Angreifer greift nie „magisch“ an: Man sieht, was er konkret tut
  (hier: ein Issue schreiben).
- Gegenmaßnahmen als **Schalter auf derselben Szene** („ohne Schutz / mit
  getrennten Rechten“), der zeigt, *welche* Konfiguration sich ändert.
- Schutz realistisch darstellen: Keine Behauptung, die ein Fachpublikum
  widerlegen kann (Beispiel: `secrets: (none)` ist bei GitHub Actions nicht
  realistisch, weil jeder Lauf einen `GITHUB_TOKEN` erhält). Restrisiko
  benennen: „begrenzt, nicht null“.
- Bevorzugt Maßnahmen zeigen, die die Wirkung nehmen (minimale Rechte,
  Trennung von Agent und Credentials, Schema-Prüfung der Ausgabe), statt
  Filter, die den Angriff „verhindern“ sollen.

### 7. Gestaltung

- Wissensartikel nutzen den **hellen, redaktionellen Stil** (Lato, helle
  Flächen, `#006EC1` als Akzent). Der dunkle, organische Startseiten-Look wird
  hier nicht verwendet – er erschwert das Verständnis.
- Farbsemantik: **Rot nur für Bösartiges und seine Folgen**, Blau für das
  Gewollte (Anweisung des Entwicklers, Schutzmaßnahme), sonst neutral.
- Echte Oberflächen (z. B. dunkles CI-Log) dürfen ihren eigenen Look behalten,
  wenn das die Wiedererkennung stärkt.

### 8. Barrierefreiheit und Technik

- Bedienelemente sind echte `<button>`s, per Tastatur erreichbar,
  Touch-Ziele ≥ 44 px.
- Bildunterschrift als `aria-live="polite"`; Illustration mit `aria-label`.
- `prefers-reduced-motion`: kein Autoplay, Kapitel per Klick, Endzustände
  sofort sichtbar.
- Mobil: Bühne skaliert, Kapitelleiste bleibt bedienbar, keine Sonderlogik.
- Kein Canvas für Inhalte, die gelesen werden müssen – Text bleibt HTML.

### 9. Vorgehen (Spec-driven)

1. **Spec:** Zielgruppe, Kernaussage in einem Satz, Quelle des Falls,
   Aha-Moment, Gegenmaßnahme.
2. **Storyboard als statische Bildstrecke** (4–6 Panels mit Bildunterschrift).
   Erst prüfen, ob sie ohne Animation verstanden wird.
3. **Animation** der bestätigten Bildstrecke; die statische Fassung bleibt
   als Fallback erhalten.
4. **Review** mit der Checkliste unten, idealerweise durch jemanden, der den
   Angriff nicht kennt.

---

## Teil C – Review-Checkliste

- [ ] Erkennt jemand ohne Vorwissen in 3 Sekunden, *wo* die Szene spielt?
- [ ] Ist jede Darstellung eine realistische, vertraute Oberfläche?
- [ ] Bestimmt der Leser das Tempo (Kapitel, Pause, kein Loop, kein Scroll-Sync)?
- [ ] Bewegt sich nur, was die aktuelle Bildunterschrift beschreibt?
- [ ] Gibt es genau einen interaktiven Aha-Moment – mit Button-Fallback?
- [ ] Eine Bildunterschrift pro Kapitel, kein Parallel-Panel, kein Bedienhinweis nötig?
- [ ] Rot nur für Bösartiges? Text in Lesegröße, Mono nur für Code?
- [ ] Gegenmaßnahme als Schalter auf derselben Szene, fachlich korrekt, Restrisiko benannt?
- [ ] Quelle des Falls im Artikel? Secrets maskiert, keine erfundenen Daten?
- [ ] Funktioniert ohne Bewegung, mit Tastatur, auf dem Handy?

---

## Anhang – Was nicht funktioniert hat (Prompt Injection, Oktober 2026)

| Versuch | Problem |
|---|---|
| Organische Animation im Startseiten-Stil (Wolke, Partikel, Figuren) | Bildsprache musste erst übersetzt werden; Ablauf nicht erkennbar |
| Animation + Erklär-Panel daneben | Geteilte Aufmerksamkeit, ständiges Hin- und Herlesen |
| Abstraktes Schritt-Diagramm (Kästen mit Mono-Text) | Verständlich für Kenner, für Laien zu abstrakt |
| Scrollytelling (Diagramm folgt dem Text) | Bild ändert sich ohne eigenes Zutun; brauchte Bedienhinweis; technisch fragil |
| **Vertraute Bildschirme + Kapitel + Lupe + Schutz-Schalter** | **Verstanden** |
