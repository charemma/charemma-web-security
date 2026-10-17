# charemma-web-security

Pentest landing page: [security.charemma.de](https://security.charemma.de)

Static site in German, English and Greek, served as an nginx container on k3s.
Same setup as [charemma-web](https://github.com/charemma/charemma-web), plus a
small generator that renders the language versions.

## Layout

```
src/            sources for the static pages
  site.json     languages, pages, base URL
  i18n/*.json   texts per language (de, en, el)
  templates/    Jinja2 templates
  build.py      renders src/ into html/
html/           what nginx serves; generated pages are committed
nginx/          server config and security headers
k8s/            Kustomize manifests, image tag managed by ArgoCD Image Updater
docs/design/    design handoff and source components
```

The generated HTML in `html/` is committed and independent of the commit it
sits in. CI fails when `html/` is out of date with `src/`. The image build
copies it and stamps the version identifier in (see below).

## Local dev

```
just dev      # render, stamp and serve on http://localhost:8090 (just dev 9000 for another port)
just build    # render only
just image    # build the container image
```

`just dev` serves a stamped copy of `html/` from `dist/` with Python's
http.server, so the nginx headers (CSP etc.) are not applied locally. Needs
`uv` for the generator.

## Version identifier

Every page names the commit it was built from in the footer, as
`git:(<hash>)` linking to the commit on GitHub, and `/version` returns the
same identifier as plain text:

```
test "$(curl -s https://security.charemma.de/version)" = "$(git rev-parse --short origin/main)"
```

The committed pages carry placeholders; the identifier is stamped in when
the deliverable is built. CI passes the short commit hash as `SITE_VERSION`
to the image build, which matches the `sha-` image tag. `just image` and
`just dev` use `<branch>@<hash>`, with `-dirty` appended while the tree has
uncommitted changes. An image built without the build arg shows `unknown`.

## Languages

`/` is German, `/en/` English, `/el/` Greek. Each page links its translations
via `hreflang`. The language switcher stores the choice in
`localStorage('sec-lang')` and sends returning visitors to that version. There
is no redirect based on the browser language.

## security.txt

`/.well-known/security.txt` follows RFC 9116. CI fails 30 days before the
`Expires` date, so bump it once a year.

## Deployment

1. Push to main triggers GitHub Actions
2. Actions runs the checks, builds the image and pushes it to ghcr.io
3. ArgoCD Image Updater picks up the new tag and writes it to `k8s/`
4. ArgoCD syncs the deployment

The ArgoCD Application lives in the
[platform](https://github.com/charemma/platform) repo under `gitops/apps/`.
