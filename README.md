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

The generated HTML in `html/` is committed, so the image build needs nothing
but `COPY`. CI fails when `html/` is out of date with `src/`.

## Local dev

```
just dev      # render and serve on http://localhost:8090 (just dev 9000 for another port)
just build    # render only
just image    # build the container image
```

`just dev` uses Python's http.server, so the nginx headers (CSP etc.) are not
applied locally. Needs `uv` for the generator.

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
