---
lead: "Ein Agent ist ein Sprachmodell mit Werkzeugen und Zugangsdaten. Wie viel Schaden eine falsche Entscheidung anrichtet, hängt nicht vom Modell ab, sondern davon, was das System ihm erlaubt hat."
updated: 2026-10-17
sources:
  - label: "OWASP Top 10 for LLM Applications 2026, LLM03:2026 Excessive Agency"
    url: "https://genai.owasp.org/resource/owasp-genai-llm-top-10-2026/"
  - label: "Steve Wilson: The Developer's Playbook for Large Language Model Security"
  - label: "Kris Kimmerle, David Okeyode: AI Under Attack"
  - label: "Harriet Farlow: Practical AI Security"
---

## Worum es geht

Der Prototyp läuft. Der Agent liest Tickets, durchsucht Logs und startet den hängenden Dienst neu. Er tut das auf dem Laptop des Entwicklers, mit dessen SSH-Schlüssel, dessen Cloud-Token und dessen Shell. Niemand hat ihm diese Rechte eingeräumt. Sie lagen einfach da.

So fangen die meisten Agenten an, und bis hierhin ist nichts passiert. Die Frage ist, wie viel von diesem Zuschnitt mit in Produktion geht. Meist fast alles. Kimmerle und Okeyode nennen das ambiente Autorität: Der Agent findet breiten Zugriff vor und nutzt ihn, sobald ein Plan es nahelegt.

OWASP führt das als LLM03:2026 Excessive Agency. Das System lässt schädliche Aktionen zu, wenn das Modell unerwartet, mehrdeutig oder manipuliert antwortet. Der wichtige Teil ist der Nachsatz: egal, warum das Modell danebenliegt. Halluzination, schlechter Prompt oder Angriff, die Folgen sind dieselben. Das Problem sitzt nicht im Modell. Es sitzt in dem, was Sie dem Modell in die Hand gegeben haben.

## Drei Formen

OWASP nennt drei Ursachen. In der Praxis treffe ich sie selten einzeln an.

**Zu viel Funktion.** Der Agent soll bei einer Störung einen Dienst neu starten. Dafür reicht ein Werkzeug, das `systemctl restart` für eine feste Liste von Diensten ausführt. Stattdessen bekommt er „Shell-Befehl ausführen“, weil das schneller gebaut war. Jetzt kann er auch Pakete installieren, Dateien löschen und Verbindungen nach außen öffnen. Dazu die Werkzeuge aus der Entwicklung, die nie jemand abgebaut hat.

**Zu viele Rechte.** Das Werkzeug ist eng, die Identität dahinter nicht. Der Agent wertet Logs aus und meldet sich dafür per SSH an. Der Schlüssel gehört dem Automationskonto, und das steht in der `sudoers`, weil dasselbe Konto deployt. Oder das Lesewerkzeug nutzt einen Datenbankbenutzer, der neben `SELECT` auch `UPDATE` und `DELETE` darf. Oder der Agent arbeitet für einen Nutzer, greift aber mit einem technischen Konto zu, das alle Nutzer sieht. Wilson sagt es knapp: Behandeln Sie das Modell wie einen weiteren Systembenutzer. Dann fällt auf, was Sie ihm alles gegeben haben.

**Zu viel Autonomie.** Der Agent handelt, ohne dass jemand bestätigt. Er räumt Speicherplatz frei und löscht, was er für Altlasten hält. Er passt Firewall-Regeln an. Er darf `terraform apply`, weil die Rückfrage im Pilotbetrieb genervt hat.

## Der Auslöser: Prompt Injection

Excessive Agency ist selten der Einstieg. Sie ist der Grund, warum der Einstieg teuer wird. Der typische Auslöser ist eine [Prompt Injection](../prompt-injection/): eine Anweisung im Ticket, im Dokument oder in der Antwort eines anderen Werkzeugs, und das Modell setzt seine Werkzeuge für ein Ziel ein, das niemand beauftragt hat. Der Angreifer hat keinen Zugang zur Datenbank. Der Agent schon.

Das ist der Confused Deputy mit einem Sprachmodell in der Mitte. Jeder einzelne Aufruf ist sauber: authentifiziert, gut geformt, auf der erlaubten Liste. Lesen, zusammenfassen, hochladen. Den Angriff sieht nur, wer die Kette neben den ursprünglichen Auftrag legt. Mit wenig Rechten läuft dieselbe Injection ins Leere. Mit vielen Rechten ist aus einem Textproblem ein Vorfall geworden.

## Was ich im Pentest prüfe

1. **Werkzeuginventar.** Welche Werkzeuge kann der Agent aufrufen, und was kann jedes davon wirklich? Ich suche offene Werkzeuge: Shell, HTTP-Abruf, freies SQL. Dann Reste aus der Entwicklung und Funktionen ohne Anwendungsfall.
2. **Identitäten und Rechte.** Mit wessen Zugangsdaten arbeitet jedes Werkzeug? Ich lese die Berechtigungen hinter dem Token nach: Datenbank-Grants, `sudoers`, IAM-Richtlinien, OAuth-Scopes. Dann die Frage, die am meisten bringt: Was kann der Agent, wenn er diese Werkzeuge unter dieser Identität verkettet?
3. **Freigaben.** Welche Aktionen laufen ohne Bestätigung? Was zeigt die Rückfrage an? Und erreicht ein anderes Werkzeug dieselbe Wirkung ohne Rückfrage?
4. **Auslösung.** Ich lege Anweisungen in die Daten, die der Agent liest, und sehe zu, was er daraufhin tut.
5. **Nachvollziehbarkeit.** Ich lese das Protokoll rückwärts. Welches Ziel hat zu dieser Aktion geführt, mit welcher Identität, auf welchem System, mit welcher Freigabe? Fehlt ein Glied, erkennen Sie den Vorfall nicht und grenzen ihn nicht ein.

## Welche Gegenmaßnahmen tragen

- **Geringste Rechte pro Werkzeug.** Wenige Werkzeuge, wenige Funktionen, keine offenen. Statt „Shell-Befehl ausführen“ ein Werkzeug für genau eine Operation mit geprüften Parametern. Zugangsdaten mit Verb, Ziel und Ablauf: dieses Repository lesen, diese Tabelle lesen, bis die Aufgabe fertig ist.
- **Eigene Identitäten für Agenten.** Ein Agent läuft unter eigenem Namen, mit Eigentümer, kurzlebigen Zugangsdaten und einem Schalter zum Widerrufen. Kein geliehenes Entwicklertoken. Handelt er für einen Nutzer, dann mit dessen Rechten, auch über verkettete Aufrufe hinweg.
- **Freigabe durch Menschen bei wirksamen Aktionen.** Löschen, Senden, Deployen, Bezahlen: Davor bestätigt ein Mensch. Die Rückfrage zeigt Aktion, Ziel und Rückweg, nicht „Werkzeug erlauben?“. Was reversibel und klein ist, darf automatisch laufen. Was nicht, geht an einen Menschen.
- **Architektur vor Filtern.** Ob eine Aktion erlaubt ist, entscheidet Code, nicht das Modell. Jede Anfrage an ein nachgelagertes System läuft gegen eine Richtlinie, im Werkzeug, in einer Instanz davor oder im Zielsystem. Filter auf Ein- und Ausgaben behalten Sie, aber OWASP zählt sie nicht zu den Grundmaßnahmen gegen Excessive Agency. Protokolle und Ratenbegrenzung verhindern nichts. Sie begrenzen, wie weit es geht.

Ein Agent, der wenig darf, macht aus einer gelungenen Injection keinen Vorfall. Fangen Sie dort an, nicht beim Filter.
