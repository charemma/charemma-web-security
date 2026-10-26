# Site Registry: charemma.de

This file is the site registry of the site folder `sites/www/` per the Sites section of `AGENTS.md`. The Structure and Discipline of the File Registry section of `AGENTS.md` apply to it.

## Site Intent

This site is charemma.de, the main website of Charalambos Emmanouilidis. It currently delivers the imported design mockup as a single static page in German; specs will take it over step by step.

## Registered Files

| Subfolder | File | Type | Protocol | Dependencies | Instructions | Description |
| --- | --- | --- | --- | --- | --- | --- |
| `sites/www/html` | `index.html` | asset | editable |  |  | Start page: the front page of the site, delivered to the browser as is. |
| `sites/www/html/datenschutz` | `index.html` | asset | editable |  |  | Privacy page: the site's privacy notice, delivered to the browser as is. |
| `sites/www/html/impressum` | `index.html` | asset | editable |  |  | Legal notice page: the provider details that apply to every site of this provider, delivered to the browser as is. |
| `sites/www` | `Dockerfile` | code | spec-maintained | `013-site-images.md` |  | Container image recipe: how the delivered site is packaged into the web server image and which build-time values it takes. _Tool-imposed name; see Build-tool exemption rule._ |
| `sites/www` | `justfile` | code | spec-maintained | `013-site-images.md` |  | Task runner recipes: the local and CI entry points for checking, stamping, serving and building the site. _Tool-imposed name; see Build-tool exemption rule._ |
| `sites/www/nginx` | `default.conf` | code | spec-maintained | `013-site-images.md` |  | Web server configuration: how requests are routed and which response headers apply. |
| `sites/www/k8s` | `deployment.yaml` | code | spec-maintained | `013-site-images.md` |  | Kubernetes deployment manifest: which image the cluster runs for the site and how its pod is set up. |
| `sites/www/k8s` | `service.yaml` | code | spec-maintained | `013-site-images.md` |  | Kubernetes service manifest: how the site's pods are reachable inside the cluster. |
| `sites/www/k8s` | `ingress.yaml` | code | spec-maintained | `013-site-images.md` |  | Kubernetes ingress manifest: under which host name and with which TLS settings the site is reachable from outside. |
| `sites/www/k8s` | `kustomization.yaml` | code | spec-maintained | `013-site-images.md` |  | Kustomize entry point: which manifests ArgoCD applies and which image tag they run, the tag being written by the image updater. |
| `sites/www/specs` | `001-imprint.md` | spec | editable |  |  | Spec for the central legal notice page: which domains it covers, which provider details it states and in which order, its footer link on this site, when it may be published, and the reasons for it. |
