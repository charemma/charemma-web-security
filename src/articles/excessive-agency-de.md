---
lead: "Ein Agent ist ein Sprachmodell mit Werkzeugen und Zugangsdaten. Wie viel Schaden eine falsche Entscheidung anrichtet, hängt nicht vom Modell ab, sondern davon, was das System ihm erlaubt hat."
updated: 2026-10-20
sources:
  - label: "OWASP Top 10 for LLM Applications, LLM03:2026 Excessive Agency"
    url: "https://genai.owasp.org/resource/owasp-genai-llm-top-10-2026/"
  - label: "Steve Wilson: The Developer's Playbook for Large Language Model Security"
  - label: "Kris Kimmerle, David Okeyode: AI Under Attack"
  - label: "Railway: Your AI wants to nuke your database. Guardrails fix that."
    url: "https://blog.railway.com/p/your-ai-wants-to-nuke-your-database"
  - label: "PC Gamer: Here we go again: AI deletes entire company database and all backups in 9 seconds, then cheerfully admits 'I violated every principle I was given'"
    url: "https://www.pcgamer.com/software/ai/here-we-go-again-ai-deletes-entire-company-database-and-all-backups-in-9-seconds-then-cheerfully-admits-i-violated-every-principle-i-was-given/"
  - label: "Cybersecurity News: AI Coding Agent Powered by Claude Opus 4.6 Deletes Production Database in 9 Seconds"
    url: "https://cybersecuritynews.com/ai-coding-agent-deletes-data/"
---

## Worum es geht

Ein Agent (Sprachmodell mit aufrufbaren Funktionen und Zugangsdaten) findet oft breiten Zugriff vor und nutzt ihn, sobald ein Plan es nahelegt. Kimmerle und Okeyode nennen das ambiente Autorität (Zugriffsrechte aus der Umgebung). OWASP führt das als LLM03:2026 Excessive Agency: Das System lässt schädliche Aktionen zu, wenn das Modell unerwartet, mehrdeutig oder manipuliert antwortet, egal warum. Entscheidend ist, was Sie ihm erlauben. [Railway](https://blog.railway.com/p/your-ai-wants-to-nuke-your-database) bestätigt im Blog, dass ein Coding-Agent auf seiner Plattform ein Produktions-Volume löschte. Es traf im April 2026 PocketOS, einen Softwareanbieter für Autovermieter, dessen Agent in Cursor arbeitete. Die Animation zeigt diesen Fall nach Railway und den Berichten von [PC Gamer](https://www.pcgamer.com/software/ai/here-we-go-again-ai-deletes-entire-company-database-and-all-backups-in-9-seconds-then-cheerfully-admits-i-violated-every-principle-i-was-given/) und [Cybersecurity News](https://cybersecuritynews.com/ai-coding-agent-deletes-data/).

[animation]

Niemand griff an, das Modell hatte falsch geraten. Railways API führte die korrekt aufgebaute und authentifizierte Anfrage wie den Aufruf eines Bereitstellungsskripts aus. Ein freies Terminal, ein Token für das ganze Konto und eine unumkehrbare Aktion ohne Freigabe machten den Irrtum wirksam: zu viel Funktion, zu viele Rechte, zu viel Autonomie.

PocketOS arbeitete laut PC Gamer zunächst mit einem drei Monate alten Backup weiter. Railway stellte später die Datenbank wieder her und machte Löschungen über die API für 48 Stunden rückgängig machbar.

## Drei Formen

OWASP nennt drei Ursachen. In der Praxis treffe ich sie selten einzeln an.

**Zu viel Funktion.** Soll der Agent einen Dienst neu starten, reicht ein Werkzeug (aufrufbare Funktion), das `systemctl restart` für eine feste Liste von Diensten ausführt. Bekommt er stattdessen „Shell-Befehl ausführen“, weil das schneller gebaut war, kann er auch Pakete installieren, Dateien löschen und Verbindungen nach außen öffnen. Dazu kommen laut OWASP Werkzeuge aus der Entwicklung, die niemand entfernt hat.

**Zu viele Rechte.** Das Werkzeug ist eng, die Identität dahinter nicht. Wertet der Agent Logs per SSH aus, könnte der Schlüssel zum Automationskonto gehören, das wegen seiner Bereitstellungsaufgaben in der `sudoers` steht. Oder das Lesewerkzeug nutzt einen Datenbankbenutzer, der neben `SELECT` auch `UPDATE` und `DELETE` darf. Oder ein technisches Konto sieht alle Nutzer, obwohl der Agent nur für einen handelt. Wilson rät: Behandeln Sie das Modell wie einen weiteren Systembenutzer. Dann fällt auf, was Sie ihm alles gegeben haben.

**Zu viel Autonomie.** Räumt der Agent Speicherplatz frei, könnte er löschen, was er für Altlasten hält. Er dürfte Firewall-Regeln ändern oder `terraform apply` ausführen, weil die Rückfrage im Pilotbetrieb genervt hat.

## Nachbarn

Excessive Agency ist selten der Einstieg. Sie ist der Grund, warum der Einstieg teuer wird. Auslöser kann eine falsche Vermutung sein wie bei PocketOS oder eine [Prompt Injection](../prompt-injection/) (eingeschleuste Anweisung): im Ticket, Dokument oder in einer Werkzeugantwort. Der Agent setzt dann seine Werkzeuge für ein Ziel ein, das niemand beauftragt hat. Mit wenigen Rechten läuft dieselbe Anweisung ins Leere. Was der Agent über Antworten und Ausgaben preisgibt, gehört zu [Sensitive Information Disclosure](../sensitive-information-disclosure/).

## Was ich im Pentest prüfe

1. **Werkzeuginventar.** Ich prüfe, was jedes Werkzeug wirklich kann: Shell, HTTP-Abruf, freies SQL. Ich suche Entwicklungsreste und Funktionen ohne Anwendungsfall.
2. **Identitäten und Rechte.** Ich ermittle, mit wessen Zugangsdaten jedes Werkzeug arbeitet. Ich prüfe Datenbankrechte, `sudoers`, IAM-Richtlinien, OAuth-Scopes und den Geltungsbereich der API-Tokens. Ich suche Zugangsdaten in Projektdateien, der Konfiguration von Kommandozeilenwerkzeugen und im SSH-Agenten. Was kann der Agent, wenn er Werkzeuge unter dieser Identität verkettet?
3. **Freigaben.** Ich prüfe, welche Aktionen ohne Bestätigung laufen, was die Rückfrage zeigt und ob ein anderes Werkzeug dieselbe Wirkung ohne Rückfrage erreicht.
4. **Auslösung.** Ich stelle mehrdeutige Aufgaben und lege Anweisungen in die Daten, die der Agent liest. Ich beobachte, welche Werkzeuge er einsetzt, nicht nur seine Antwort.
5. **Nachvollziehbarkeit.** Ich lese das Protokoll rückwärts: Welches Ziel führte zur Aktion, mit welcher Identität, auf welchem System, mit welcher Freigabe?

## Welche Gegenmaßnahmen tragen

- **Geringste Rechte pro Werkzeug.** Wenige Werkzeuge, wenige Funktionen: Statt „Shell-Befehl ausführen“ ein Werkzeug für genau eine Operation mit geprüften Parametern. Zugangsdaten begrenzen Sie auf Aktion, Ziel, Umgebung und Laufzeit: Ein Token für Staging erreicht die Produktion nicht.
- **Eigene Identitäten für Agenten.** Ein Agent läuft unter eigenem Namen, mit Eigentümer, kurzlebigen Zugangsdaten und Widerrufsmöglichkeit. Keine geliehenen Entwicklertokens oder langlebigen Tokens auf der Platte. Für einen Nutzer handelt er mit dessen Rechten, auch über verkettete Aufrufe hinweg.
- **Freigabe durch Menschen, im Zielsystem.** Vor Löschen, Senden, Bereitstellen oder Bezahlen bestätigt ein Mensch und sieht dabei Aktion, Ziel und Rückweg. Das Zielsystem oder Werkzeug erzwingt die Freigabe außerhalb der Reichweite des Agenten; eine Regel im Prompt genügt nicht. Kleine, umkehrbare Aktionen dürfen automatisch laufen.
- **Einen Rückweg einbauen.** Löschungen verzögern und umkehrbar machen, wie Railway nach dem Fall. Backups gehören außerhalb der Reichweite der Identität, die Daten löschen darf. Das begrenzt den Schaden, verhindert aber die Aktion nicht.
- **Architektur vor Filtern.** Code prüft jede Anfrage gegen eine Richtlinie, im Werkzeug, in einer unabhängigen Instanz davor oder im Zielsystem. Filter auf Ein- und Ausgaben bleiben, zählen laut OWASP aber nicht zu den Grundmaßnahmen. Protokollierung und Ratenbegrenzung verhindern den Fehlaufruf nicht, begrenzen aber den Schaden.

Bei PocketOS genügte eine falsche Vermutung. Begrenzen Sie, was Ihr Agent darf, damit daraus kein Vorfall wird, egal ob das Modell allein irrt oder ein Angreifer nachhilft.
