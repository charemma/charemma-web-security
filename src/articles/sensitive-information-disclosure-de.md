---
lead: "Ein Modell gibt preis, was es sieht. Und es sieht meist mehr, als die Aufgabe braucht: Dokumente, Datenbankzeilen, Zugangsdaten, fremde Sitzungen. Die Antwort im Chat ist dabei nur einer von vielen Wegen nach draußen."
updated: 2026-10-17
sources:
  - label: "OWASP Top 10 for LLM Applications 2026, LLM02:2026 Sensitive Information Disclosure"
    url: "https://genai.owasp.org/resource/owasp-genai-llm-top-10-2026/"
  - label: "Steve Wilson: The Developer's Playbook for Large Language Model Security"
  - label: "Kris Kimmerle, David Okeyode: AI Under Attack"
  - label: "Harriet Farlow: Practical AI Security"
---

## Worum es geht

Stellen Sie sich einen internen Assistenten vor, der Fragen zur Entwicklungsumgebung beantwortet. Jemand fragt: „Wie komme ich auf die Staging-Datenbank?“ Die Antwort enthält Host, Benutzer und Passwort. Niemand hat das Modell angegriffen. Ein Kollege hatte eine Anleitung mit diesen Zugangsdaten in die Teamablage gelegt, und die Ablage wurde komplett indiziert. Das Modell hat die passendste Stelle gefunden und wiedergegeben.

Das ist Sensitive Information Disclosure in ihrer häufigsten Form. OWASP führt sie als LLM02:2026: Ein System mit Sprachmodell gibt vertrauliche, regulierte oder geschützte Daten über einen Kanal preis, den der Eigentümer der Daten nicht freigegeben hat. Der Kanal ist nicht nur die Antwort im Chatfenster. Argumente von Werkzeugaufrufen, Reasoning-Traces, abgerufene Textstücke, Logs, Telemetrie und Embeddings sind ebenfalls Ausgaben und nach OWASP genauso zu klassifizieren und zu schwärzen.

Wilson fragt: Kann Ihr Modell zu viel wissen? Ja. Prüfen Sie jede Datenquelle danach, was passiert, wenn das Modell sie herausgibt.

## Vier Wege nach draußen

**Beim Training.** Was in Trainings- oder Fine-Tuning-Daten gelangt, kann das Modell später wörtlich wiedergeben. Angenommen, Sie trainieren einen Adapter auf alten Tickets, damit der Assistent im Ton des Supports antwortet. In manchen Tickets stehen SSH-Schlüssel, die jemand zum Debuggen eingefügt hat. Schmale Adapter merken sich nach OWASP seltene Beispiele besonders treu. Löschen Sie das Ticket, bleibt der Schlüssel.

**Zur Laufzeit.** Das Modell gibt weiter, was gerade in seinem Kontext liegt: System-Prompt, abgerufene Dokumente, Werkzeugausgaben, Gedächtnis, im schlimmsten Fall die Sitzung eines anderen Nutzers. Die Ursache liegt nach OWASP meist stromaufwärts: offene Ablagen und alte Berechtigungen füllen den Index. Kimmerle und Okeyode zeigen, warum RAG hier schwächelt: Vektorähnlichkeit weiß nicht, wer fragt. Zwei Nutzer mit derselben Frage bekommen dieselben Treffer, wenn nicht vor der Suche nach Identität, Mandant oder Dokumentrechten gefiltert wird. Die zweite Spielart ist Speicher an der falschen Grenze: ein gemeinsamer Cache, ein geteilter Vektor-Namensraum. Dort fließt eine Sitzung in die Ausgabe einer anderen.

**In Pipeline und Betrieb.** Observability-Plattformen protokollieren nach OWASP standardmäßig vollständige Prompts, Antworten und Traces. Angenommen, Ihr Agent liest ein Kundenkonto und schreibt Kundennummer und Adresse in die Argumente eines Werkzeugaufrufs. Der Aufruf landet im Journal auf dem Host, und dort liest ihn jedes Konto in der Gruppe `adm`. Die Antwort an den Nutzer war sauber. Das Log nicht. Auch aus geleakten Embeddings lässt sich der Klartext rekonstruieren. Ein Backup „nur mit Embeddings“ ist nach OWASP ein Dokumentenleck.

**Durch Beobachtung.** Der Angreifer bekommt keinen Inhalt und lernt trotzdem etwas: aus Tokenlängen im verschlüsselten Stream, aus Antwortzeiten, aus Konfidenzwerten. Farlow ordnet das als Seitenkanal ein: weniger zuverlässig als direkte Angriffe, dafür schwer zu entdecken. Auf einem geteilten Inferenz-Server mit Prefix-Cache antwortet ein Prompt, den schon jemand gestellt hat, messbar schneller.

## Nachbarn

Der häufigste Auslöser ist eine [Prompt Injection](../prompt-injection/): Eine Anweisung im Dokument bringt das Modell dazu, den System-Prompt samt API-Key auszugeben oder abgerufene Daten in einen Werkzeugaufruf nach außen zu packen. Wie weit der zweite Teil kommt, entscheidet [Excessive Agency](../excessive-agency/). Das Leck des System-Prompts selbst behandelt OWASP unter LLM08:2026, die Mechanik von Vektorspeichern unter LLM09:2026.

## Was ich im Pentest prüfe

1. **Datenoberfläche.** Ich sehe mir an, was die Anwendung indiziert hat, nicht was sie indizieren sollte: welche Ablagen, mit welchen Rechten, seit wann. Über den Korpus lasse ich einen Secrets-Scanner laufen, wie über ein Repository.
2. **Autorisierung vor dem Abruf.** Zwei Konten mit unterschiedlichen Rechten stellen dieselbe Frage. Dann suche ich die Stelle, an der gefiltert wird: in der Index-Abfrage oder erst nach dem Abruf. Hängt die Berechtigung an Metadaten-Tags, schleuse ich ein Dokument mit falschem Tag ein. Bei mehreren Mandanten suche ich den Namensraum-Fehler.
3. **Ausgabekanäle.** Ich schicke einen markierten Datensatz durch das System und verfolge ihn: Journal, Observability-Plattform, Werkzeugargumente, Cache, Backup. An jeder Stelle frage ich, wer lesen darf.
4. **Mehr als gefragt.** Ich prüfe, ob Zusammenfassen, Übersetzen und Extrahieren mehr zurückgeben als verlangt: den Text unter einem schwarzen Balken im PDF, das Nachbarfeld der Datenbankzeile, den System-Prompt. Bei Fine-Tunes probiere ich, ob sich Trainingsbeispiele vervollständigen lassen.
5. **Sitzungstrennung.** Parallele Sitzungen unter verschiedenen Nutzern, dazu Gedächtnis und Caches: Taucht Kontext aus der einen in der anderen auf?

## Welche Gegenmaßnahmen tragen

- **Datenoberfläche verkleinern.** Was das Modell für seine Aufgabe nicht sehen muss, kommt weder in den Index noch in den Trainingskorpus. Quellen klassifizieren, Secrets und personenbezogene Daten vor der Aufnahme entfernen, Duplikate reduzieren. Die Korrektur liegt nach OWASP an der Datenoberfläche, nicht am Modell.
- **Autorisierung in der Abfrage.** Dokument- und Chunk-Rechte werden in der Index-Abfrage erzwungen, nicht danach. Ein Textstück, das schon im Modell war, holt kein Filter zurück. Sensible Workloads bekommen eigene Indexe pro Mandant.
- **Kontext minimieren.** An einen externen Anbieter gehen nur die Felder, die die Aufgabe braucht, kein automatisch angehängter Kundendatensatz. Im System-Prompt stehen keine Secrets.
- **Speicher an der richtigen Grenze.** Gedächtnis pro Nutzer, Mandanten getrennt, Caches mit Scope und Ablauf. Für Kimmerle und Okeyode ist das die eigentliche Kontrolle: Isolation statt cleverer Prompts.
- **Logs und Traces als Ausgaben.** Vor dem Export in die Observability-Plattform schwärzen, Zugriff auf Logs beschränken, Reasoning-Traces nie roh ablegen. Zusagen wie „kein Training mit Ihren Daten“ technisch erzwingen, nicht nur vertraglich.
- **Filter zuletzt.** Ausgabefilter mit Klassifikatoren und Entitätserkennung statt Regex allein, weil Regex an Base64, Hex und Fremdsprachen scheitert. Als letzte Schicht, nicht als erste.

Was einmal in Gewichten, Adaptern oder Embeddings steckt, bleibt dort, auch wenn die Quelle gelöscht ist. Das Modell am Anfang hat nichts falsch gemacht. Falsch war die Anleitung im Index. Fangen Sie dort an.
