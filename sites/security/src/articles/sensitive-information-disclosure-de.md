---
lead: "Ein Modell gibt preis, was es sieht. Und es sieht meist mehr, als die Aufgabe braucht: Dokumente, Datenbankzeilen, Zugangsdaten, fremde Sitzungen. Die Antwort im Chat ist dabei nur einer von vielen Wegen nach draußen."
updated: 2026-10-20
sources:
  - label: "OWASP Top 10 for LLM Applications 2026, LLM02:2026 Sensitive Information Disclosure"
    url: "https://genai.owasp.org/resource/owasp-genai-llm-top-10-2026/"
  - label: "Steve Wilson: The Developer's Playbook for Large Language Model Security"
  - label: "Kris Kimmerle, David Okeyode: AI Under Attack"
  - label: "Harriet Farlow: Practical AI Security"
  - label: "The Hacker News: Zero-Click AI Vulnerability Exposes Microsoft 365 Copilot Data Without User Interaction"
    url: "https://thehackernews.com/2025/06/zero-click-ai-vulnerability-exposes.html"
  - label: "Pavan Reddy, Aditya Sanjay Gujral: EchoLeak: The First Real-World Zero-Click Prompt Injection Exploit in a Production LLM System"
    url: "https://arxiv.org/abs/2509.10540"
  - label: "NIST NVD: CVE-2025-32711"
    url: "https://nvd.nist.gov/vuln/detail/CVE-2025-32711"
---

## Worum es geht

Ein System mit Sprachmodell gibt vertrauliche, regulierte oder geschützte Daten über einen Kanal preis, den der Dateneigentümer nicht freigegeben hat. OWASP führt dieses Risiko als LLM02:2026 Sensitive Information Disclosure (Offenlegung sensibler Informationen). Dazu zählen neben Chatantworten auch Werkzeugargumente, abgerufene Textstücke, Logs, Telemetrie, Reasoning-Traces (ausgegebene Denkzwischenschritte) und Embeddings (Zahlendarstellungen von Texten). Nach OWASP müssen Sie alle diese Ausgaben klassifizieren und schwärzen. Die Animation zeigt ein nachgestelltes Szenario: Jemand stellt nur eine Frage.

[animation]

Niemand musste einbrechen, eine Frage genügte. Die Suche reichte weiter als die Rechte der fragenden Person.

Aim Security entdeckte in Microsoft 365 Copilot die Lücke EchoLeak (CVE-2025-32711), über die [The Hacker News](https://thehackernews.com/2025/06/zero-click-ai-vulnerability-exposes.html) und [Reddy und Gujral](https://arxiv.org/abs/2509.10540) berichten. Vertrauliche Daten aus der Reichweite des Assistenten verließen die Umgebung über die Adresse eines automatisch geladenen Bildes, nachdem eine [Prompt Injection](../prompt-injection/) (eingeschleuste Anweisung) in einer Mail den Abfluss ausgelöst hatte. Diesen Kanal hatte niemand als Ausgabe behandelt.

## Vier Wege nach draußen

**Beim Training.** Was ein Modell im Training oder beim Nachtrainieren (Fine-Tuning) sieht, kann es später wörtlich ausgeben. Angenommen, Sie trainieren einen Adapter, eine kleine Modellerweiterung, auf alten Tickets, damit der Assistent im Ton Ihres Supports antwortet. Darin stehen SSH-Schlüssel aus früheren Fehlersuchen. Solche spezialisierten Adapter merken sich nach OWASP seltene Beispiele besonders treu. Was einmal in den gelernten Modellparametern (Gewichten), Adaptern oder Embeddings steckt, bleibt nach dem Löschen der Quelle erhalten.

**Zur Laufzeit.** Das Modell kann Dokumente, Systemvorgaben, Werkzeugausgaben, gespeicherte Erinnerungen oder fremde Sitzungsdaten weitergeben. Angenommen, Sie fragen einen internen Assistenten „Wie komme ich auf die Staging-Datenbank?“ Er nennt Host, Benutzer und Passwort aus einer Anleitung, die ein Kollege in der vollständig indizierten, für Sie lesbaren Teamablage abgelegt hat. Niemand musste das Modell angreifen. Offene Ablagen und alte Berechtigungen sind nach OWASP häufig die Ursache. Beim Verfahren RAG lädt die Anwendung passende Textstellen vor der Antwort nach. Deren Ähnlichkeit sagt nichts über Leserechte, betonen Kimmerle und Okeyode. Ohne Filter nach Identität, Mandant und Dokumentrechten bekommen Nutzer mit derselben Frage dieselben Treffer. Ein gemeinsamer Cache oder Suchspeicher kann zusätzlich Sitzungen vermischen.

**In Pipeline und Betrieb.** Überwachungsplattformen protokollieren nach OWASP standardmäßig vollständige Modelleingaben, Antworten und Ablaufspuren. Angenommen, ein Assistent ruft ein Kundenkonto ab. Kundennummer und Adresse gelangen als Werkzeugargumente ins Host-Journal, lesbar für die Gruppe `adm`. Die Chatantwort war sauber, das Log enthält die Daten. Aus geleakten Embeddings lässt sich nach OWASP Klartext rekonstruieren: Auch ein Backup „nur mit Embeddings“ kann Dokumente preisgeben.

**Durch Beobachtung.** Auch ohne Klartext verraten die Länge verschlüsselter Antworten, Antwortzeiten und Konfidenzwerte (Sicherheitseinschätzungen des Modells) etwas. Auf einem gemeinsam genutzten Modellserver mit Prefix-Cache, einem Zwischenspeicher für bereits verarbeitete Eingabeanfänge, werden wiederholte Fragen messbar schneller beantwortet. Farlow beschreibt solche Nebenkanäle als weniger zuverlässig und schwerer erkennbar als direkte Angriffe.

## Nachbarn

Der häufigste Auslöser ist eine [Prompt Injection](../prompt-injection/): Eine Anweisung im Dokument lässt das Modell seine Systemvorgaben samt Zugangsschlüssel ausgeben oder Daten über ein Werkzeug nach außen senden. Wie weit das reicht, entscheidet [Excessive Agency](../excessive-agency/).

## Was ich im Pentest prüfe

1. **Datenoberfläche.** Ich prüfe, welche Ablagen seit wann und mit welchen Rechten tatsächlich indiziert sind. Über die Textsammlung lasse ich einen Scanner für Zugangsdaten laufen, wie über ein Repository.
2. **Autorisierung vor dem Abruf.** Ich stelle dieselbe Frage unter zwei unterschiedlich berechtigten Konten. Ich prüfe, ob die Rechteprüfung in der Suchabfrage oder erst danach greift. Mit falschen Rechteangaben an Dokumenten teste ich den Filter und prüfe, ob ein Mandant Treffer eines anderen erhält.
3. **Ausgabekanäle.** Ich verfolge einen markierten Datensatz durch Journal, Überwachungsplattform, Werkzeugargumente, Cache und Backup. Überall prüfe ich die Leserechte.
4. **Mehr als gefragt.** Ich prüfe Zusammenfassen, Übersetzen und Extrahieren: Erscheinen verdeckter PDF-Text, benachbarte Datenbankfelder oder Systemvorgaben? Bei nachtrainierten Modellen versuche ich, Trainingsbeispiele vervollständigen zu lassen.
5. **Sitzungstrennung.** Ich betreibe parallele Sitzungen unter verschiedenen Nutzern und prüfe, ob gespeicherte Erinnerungen oder Caches Inhalte zwischen ihnen übertragen.

## Welche Gegenmaßnahmen tragen

- **Datenoberfläche verkleinern.** Wilson fragt bei jeder Quelle, was passiert, wenn das Modell sie ausgibt. Klassifizieren Sie Quellen, entfernen Sie unnötige Inhalte, Zugangsdaten, personenbezogene Daten und Duplikate vor der Aufnahme.
- **Autorisierung in der Abfrage.** Erzwingen Sie Rechte auf Dokumente und Textstücke schon bei der Suche. Ein nachträglicher Filter holt einmal übermittelte Inhalte nicht zurück. Für sensible Daten nutzen Sie eigene Indexe pro Mandant.
- **Kontext minimieren.** Senden Sie externen Anbietern nur die benötigten Felder. Zugangsdaten gehören nicht in die Systemvorgaben.
- **Speicher an der richtigen Grenze.** Trennen Sie Erinnerungen nach Nutzer und Mandant, begrenzen Sie Geltungsbereich und Lebensdauer der Caches. Kimmerle und Okeyode setzen auf diese Isolation.
- **Logs und Traces als Ausgaben.** Schwärzen Sie vor dem Export und begrenzen Sie Leserechte; legen Sie Denkzwischenschritte nie roh ab. Erzwingen Sie Zusagen wie „kein Training mit Ihren Daten“ technisch.
- **Filter zuletzt.** Ergänzen Sie reguläre Ausdrücke um Filter, die Inhalte einordnen und sensible Angaben erkennen. Bloße Textmuster scheitern an Kodierungen und anderen Sprachen.

Weder im Szenario noch bei EchoLeak musste jemand einbrechen. Das System gab weiter, was in seiner Reichweite lag: einmal an eine Person ohne Recht darauf, einmal über einen übersehenen Ausgabekanal. Setzen Sie dort an, bei der Reichweite und bei den Kanälen.
