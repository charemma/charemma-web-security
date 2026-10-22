# 014 Visitor statistics

Status: approved 2026-10-22

## Why

The sites should show which pages people read and where they come from,
without handing visitor data to an analytics vendor and without a cookie
banner. GoatCounter runs in the own cluster at `stats.charemma.de`, sets no
cookies and stores no IP addresses, so it fits.

One GoatCounter site collects all three domains. Paths alone would mix them
up (`/` exists on every site), so every counted path starts with the host.

Counting visitors is processing of personal data even without cookies, so
every site says what it counts in a privacy notice.

## What

### Sites

This spec applies to every site under `sites/`:

| Site folder | Host |
| ----------- | ---- |
| `sites/www` | `charemma.de` |
| `sites/security` | `security.charemma.de` |
| `sites/ai` | `ai.charemma.de` |

### What is counted

- Each page view of a delivered HTML page counts once, when the page loads.
- The not-found page does not count.
- Nothing else counts: no clicks, no events, no scroll depth.
- Page views from `localhost` and other local addresses do not count
  (GoatCounter's default, `allow_local` stays off).
- No cookies, no local storage, no fingerprinting beyond what GoatCounter
  does on its own.

### Counted path

- The counted path is the site's host followed by the page's URL path, for
  example `security.charemma.de/wissen/ki-sicherheit/` or `charemma.de/`.
- The host is the site's fixed host from the table above, not the host the
  browser happens to use, so the same page always counts under one name.
- The path is written into the page as static JSON in the script tag's
  `data-goatcounter-settings` attribute, as `{"path": "<host><url path>"}`.
  No inline script sets `window.goatcounter`; the pages keep working under a
  Content-Security-Policy that allows only external scripts.

### Snippet

Every counted page carries exactly one tag, at the end of `<head>`:

```html
<script data-goatcounter="https://stats.charemma.de/count"
        data-goatcounter-settings='{"path": "<host><url path>"}'
        async src="https://stats.charemma.de/count.js"></script>
```

- Both addresses use `https://`, never protocol-relative.
- `async` keeps the script off the page's critical path; a failing or
  blocked counter changes nothing on the page.

### Content-Security-Policy

Where a site sends a Content-Security-Policy, it allows
`https://stats.charemma.de` in `script-src`, `connect-src` and `img-src`
and nothing more for the counter. Sites without a policy get none from this
spec.

### Privacy notice

- Every site has a privacy page at `/datenschutz/`, linked from the footer
  of every page with the label `Datenschutz`.
- The privacy page is counted like every other page.
- It names the person responsible for the data, Charalambos Emmanouilidis,
  with the e-mail address `me@charemma.de`. The postal address is not known
  yet; the page leaves it out until it is added to this spec.
- It states on the visitor statistics:
  - the site measures reach with GoatCounter, self-hosted at
    `stats.charemma.de` on the operator's own server;
  - no cookies are set and nothing is stored on the device;
  - GoatCounter stores no IP addresses; it records the page path, the
    referring page, browser and operating system, screen size and the
    country derived from the IP address;
  - the statistics data is not passed on to third parties;
  - the legal basis is the legitimate interest in knowing how the site is
    used (Art. 6 (1) (f) GDPR).
- It states on the server logs: the web server logs each request (time,
  requested address, status, browser) to keep the site running and to find
  errors; the logs are not stored permanently and are lost when the server
  restarts; the legal basis is Art. 6 (1) (f) GDPR.
- It states on hosting: the sites and the statistics run on servers of
  Hetzner Online GmbH, Germany, in the EU, as processor.
- On `ai.charemma.de` only, it states that requests pass through the proxy
  of Cloudflare, Inc., which processes the visitor's IP address to deliver
  the page and fend off attacks, as processor.
- It lists the visitor's rights: access, rectification, erasure,
  restriction, objection, and complaint to a supervisory authority.
- The page is German on `charemma.de` and `ai.charemma.de`. On
  `security.charemma.de` it is a page like the others, rendered for every
  configured language.
- The privacy page uses the site's existing look: on `security.charemma.de`
  the page skeleton, on the other two the styles of their start page.

## Out of scope

- An imprint (Impressum).
