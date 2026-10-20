# 001 Version display

Status: approved 2026-10-17, amended 2026-10-20

## Why

The way from a push to a live page has four hand-offs: GitHub Actions builds
the image, pushes it to ghcr.io, ArgoCD Image Updater writes the new tag into
`k8s/kustomization.yaml`, ArgoCD syncs the deployment. Any of them can stall
without a sound. Today the only way to find out which commit is live is to
read logs in three places.

Every delivered page therefore names the commit it was built from, and a
machine-readable copy of that name sits at a fixed URL. One look at the
footer, or one `curl`, answers "is my commit live yet?".

## What

### The version identifier

The identifier names the commit the running image was built from, in the
same abbreviated form that the image tag uses (`sha-b6b42e2` tags a build of
commit `b6b42e2`). Footer, `/version` and image tag can then be compared by
eye and by script.

| Build | Identifier | Example |
| ----- | ---------- | ------- |
| CI build from `main` | short commit hash | `b6b42e2` |
| Local build (`just dev`, `just image`) | branch name, `@`, short commit hash | `feat/spec-001@b6b42e2` |
| Local build with uncommitted changes | as above, suffixed `-dirty` | `feat/spec-001@b6b42e2-dirty` |

The branch name appears only on local builds. Its presence marks a build that
never went through CI, so a local image cannot be mistaken for the live site.
The `-dirty` suffix exists because a hash alone claims a reproducible state
that an uncommitted tree does not have.

The identifier is language-neutral. It is identical on the pages of every
published language (spec 009) and needs no translation.

### Footer display

Every HTML page the site delivers shows the identifier in its footer: the
start page and the knowledge overview in every published language, every future
page built on the same base template, and the 404 page.

The footer entry reads like terminal output, in line with the header prompt
`charemma@security:~$`. It is rendered as `git:(<identifier>)`, the way a
zsh prompt shows a detached checkout. It carries no label such as "version",
"build" or "commit"; those words make it look like a debug line.

Placement and look follow the existing footer: last entry in the footer's
link group, same monospace font, same muted color, accent color on hover and
focus like the neighboring links. It must not change the footer's height or
wrap behavior at any viewport width the site supports.

The entry is a link to the commit on GitHub
(`https://github.com/charemma/charemma-web-security/commit/<hash>`). For a
local build the target may not exist yet; that is acceptable.

### Machine-readable version

`GET /version` on the delivered site returns the identifier as plain text
(`text/plain; charset=utf-8`), one line, newline-terminated, and nothing
else. A check is then one line:

```
test "$(curl -s https://security.charemma.de/version)" = "$(git rev-parse --short origin/main)"
```

`/version` is never served from a long-lived cache; a fresh deployment must
be visible on the next request. It does not appear in `sitemap.xml`.

### One source of truth

For any delivered image, footer, `/version` and image tag name the same
commit. They are derived from one value at build time; nothing is typed by
hand.

## Constraints

- The generated pages in `html/` stay committed and commit-independent.
  The identifier is attached when the deliverable is built, not when `html/`
  is rendered. Otherwise every commit would change `html/`, the
  `check-generated` job would fail, and the hash of a commit would have to
  be known before the commit exists.
- No build step may require network access to determine the identifier; git
  metadata in the checkout is enough.
- The site keeps working when the identifier is missing (for example a
  hand-built image): the footer entry and `/version` then show `unknown`
  rather than breaking the page.

## Out of scope

- Build time, release tags or ArgoCD sync state. The commit hash alone
  answers the question; more fields are a later spec if ever needed.
- Alerting or a monitor that polls `/version`. This spec provides the
  signal, not the watcher.
- Fixing the CI and Image Updater build loop (issue #1). Until it is fixed,
  the live commit is usually an Image Updater bump commit, which is still
  a descendant of the content commit and still shows the chain moving.

## Acceptance

1. Open any page of the live site in any language, including a 404: the
   footer shows `git:(<hash>)`, the hash links to the commit on GitHub.
2. `curl -s https://security.charemma.de/version` prints that hash and a
   newline, nothing else, with `Content-Type: text/plain`.
3. The hash equals the `newTag` suffix in `k8s/kustomization.yaml` for the
   image that is running.
4. `just dev` shows `git:(<branch>@<hash>)` in the footer, with `-dirty`
   appended while the tree has uncommitted changes.
5. `git diff -- html` is empty after `just build` on any commit; the
   identifier never lands in the committed pages.
6. The footer's layout, font and colors on every published language version
   are unchanged except for the added entry.

## Touches

Orientation for the implementation, not an instruction: the base template
and 404 template (footer entry), the stylesheet (footer entry styling), the
Dockerfile and build workflow (attach the identifier at image build), the
nginx config (`/version`), and the justfile (local identifier for `just dev`
and `just image`).
