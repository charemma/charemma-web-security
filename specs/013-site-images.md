# 013 Site images

Status: approved 2026-10-21

## Why

This repository holds several websites, each in its own site folder under
`sites/<site>/`. Each site goes live on its own domain and on its own
schedule: a change to one site must not rebuild or redeploy another.

Until now the pipeline assumed a single site at the repository root and
named the image after the repository. The repository will be renamed, and
an image name that follows it would leave the cluster pointing at images
that no longer get updates.

## What

### One image per site

- Each site folder builds one container image from the `Dockerfile` in that
  folder, with the site folder as build context.
- The image is named `ghcr.io/charemma/charemma-web-<site>`, where `<site>`
  is the folder name. The pipeline sets the name; it does not derive it from
  the repository name.
- Tags and the version build argument stay as `001-version-display.md` of
  the security site defines them: `latest`, `sha-<short hash>`, and the
  short hash as `SITE_VERSION`.

### Checks per site

Each site's `justfile` offers a recipe `check` that runs every check of that
site. The pipeline runs `just check` inside the site folder and nothing else.

### Which sites run

The pipeline checks and builds a site when its folder changed, or when
`.github/workflows/build.yml` changed, which affects every site. A change
only to `sites/<site>/k8s/` does not count: those commits come from the
image updater and carry no new content.

| Event | Per affected site |
| ----- | ----------------- |
| Pull request | check, build the image, do not publish |
| Push to `main` | check, build and publish the image |

### Deployment

Each site keeps its Kubernetes manifests in `sites/<site>/k8s/`. ArgoCD
reads them from there, and the image updater writes the new tag into
`sites/<site>/k8s/kustomization.yaml`.
