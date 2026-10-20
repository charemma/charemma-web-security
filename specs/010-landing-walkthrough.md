# 010 Landing walkthrough

Status: approved 2026-10-20, amended 2026-10-20 (AI pipeline version)

## Why

The section "02 / vorgehen" on the start page shows how an engagement runs:
agents map the target, the pentester takes over, proves the weakness and hands
over a report. Until now an animated terminal next to a small network map told
that story. The design tool now has a new version of the section in which a
swarm of particles forms each phase as a picture: the map, the target, the
attack path, the report. The particles that make up a line dissolve into a
clean drawn line once the picture stands, hence the working title "Schwarm →
Linien".

The design tool has since replaced that version with one that puts AI
security in the foreground, working title "KI-Pipeline". The swarm, the
stage, the timing and the report stay; the story changes. Agents map the
attack surface of an AI application and fire broad batteries of test
prompts; the pentester then follows one chain from a crafted document
through the RAG ingestion and an agent pod into the Kubernetes cluster. The
network carries AI components and infrastructure side by side, told apart by
label colour and a small legend, and the report lists its findings under
their OWASP LLM identifiers. This spec follows that version; the earlier
artboard is gone.

This spec takes the new section over as it is. A later spec revises the
animation; until then the values below are the design's values, without
changes of our own. The section is the only one on the start page whose
design source is the artboard `VorgehenKIPipeline.dc.html`; every other section
keeps following `Main.dc.html`.

Three things of the artboard are left out on purpose:

- The language buttons DE / EN / EL inside the section. The site is
  published in German only (spec 009), and the header owns language
  switching anyway.
- Google Fonts and the design tool's runtime (React, `support.js`). The
  Content-Security-Policy allows scripts, styles and fonts from the site's own
  origin only; the page uses its local Lato and IBM Plex Mono files.
- The component plumbing of the design tool. The section is a plain ES module
  like the rest of the site.

## What

### Terms

- **Stage**: the dark band between the section head and the note, holding the
  canvas, the overlay and the phase rail.
- **Phase**: one of the six steps of the engagement. Each has a mode, a title,
  a hit line, a rail label, a command and a duration.
- **Formation**: the picture the particles form. Formation 0 is the opening
  chaos; formation *i + 1* belongs to phase *i* (phases counted from 0).
- **Unit**: the coordinate system of the formations. The stage maps one unit
  to `S` pixels around the centre `(cx, cy)`, see *Projection*.
- **Stroke**: the smooth vector line (edge, line, node circle or ring) a
  group of particles turns into once a formation has formed.

### Section layout

The section keeps its anchor `#fallbeispiel` (the header links to it) and
consists of three blocks, top to bottom.

**Section**: `border-top: 1px solid #404242`, background `#292a2a`. Body
text is Lato 18px, line height 1.6, colour `#e4e5e5`.

**Head**: a container of at most 1200px, padding `96px 24px 48px`, flex row
with wrap, gap `24px 48px`, items aligned to the bottom.

- Left column, `flex: 1 1 480px`, column with gap 16px:
  - The eyebrow: IBM Plex Mono 14px, colour `#c0c1c1`, a 24 × 2px line in
    `#268bd2` before the text, gap 10px. Text `approach.eyebrow`.
  - The heading `h2`: Lato 900, `clamp(32px, 4vw, 50px)`, line height 1.1,
    colour `#e4e5e5`, no margin. Text `approach.title_a`, followed by
    `approach.title_b` in `#268bd2`.
- Right column, `flex: 1 1 400px`: the lead `approach.lead`, colour
  `#c0c1c1`, no margin. Nothing else; the artboard's language buttons are
  left out.

**Stage**: full width, `position: relative`, height
`clamp(620px, 52vw, 840px)`, background
`radial-gradient(ellipse at 60% 40%, #262727 0%, #1d1e1e 70%, #1a1b1b 100%)`,
`border-top` and `border-bottom` `1px solid #404242`, `overflow: hidden`,
`touch-action: pan-y`. It holds:

- the canvas, absolutely filling the stage, `display: block`;
- the overlay (below);
- the phase rail (below).

**Note**: a container of at most 1200px, padding `20px 24px 96px`, font size
15px, colour `#979899`, text `approach.note`.

The row of three check marks below the old stage ("Proof of Concept …") is
gone; the artboard has no such row.

### Overlay

Absolutely positioned at `left: clamp(20px, 4vw, 56px)`, `right: 24px`,
`bottom: 116px`, `max-width: 560px`; a column with gap 8px;
`pointer-events: none`.

1. **Phase line**: IBM Plex Mono 12px, letter spacing `.14em`, colour
   `#979899`. Text `<phase> <nn> / 06`, for example `PHASE 01 / 06`, then the
   mode label with a left margin of 12px. Mode colour: `#8fc0e8` for `ai`
   and `assist`, `#268bd2` for `manual`.
2. **Title block**: a column with gap 6px.
   - Title: Lato 900, `clamp(28px, 3.2vw, 44px)`, line height 1.08,
     `#e4e5e5`.
   - Hit line: Lato 300, 18px, `#c0c1c1`.
   - The block fades in once when the section is first rendered: `.7s ease`,
     from opacity 0 and `translateY(4px)` to none. A phase change replaces the
     texts without a new fade.
3. **Command box**: `margin-top: 6px`, IBM Plex Mono
   `clamp(13px, 1.2vw, 15px)`, colour `#c0c1c1`, `white-space: pre-wrap`,
   `overflow-wrap: anywhere`, `min-height: 24px`, background
   `rgba(40, 41, 41, 0.55)` with `backdrop-filter: blur(6px)`, border
   `1px solid rgba(228, 229, 229, 0.05)`, radius 10px, padding `8px 12px`,
   `align-self: flex-start`, `max-width: 100%`. Content: the prompt `❯ ` in
   `#268bd2`, the typed part of the command, then the cursor `▌`, which
   blinks with `1s steps(1)` (hidden at 50 %) and is `aria-hidden`.

### Phases

| # | Mode | Title | Hit line | Rail label | Command | Duration |
| - | ---- | ----- | -------- | ---------- | ------- | -------- |
| 1 | `ai` | Angriffsfläche | Eingänge, Modell & Tools erfasst | angriffsfläche | `ai-recon map --app app.[redacted].ai --agents input-mapping,model-fingerprint` | 7600 ms |
| 2 | `ai` | Breitentest | Auffällig: Injection über Upload, Tool-Zugriff im Pod | breitentest | `ai-probe run --suite owasp-llm --agents jailbreak,leak,injection,tool-enum` | 8200 ms |
| 3 | `manual` | Analyse | Zwei Ziele: RAG-Ingestion und Agent-Pod | analyse | `ai-recon brief --to me && triage --chain upload,rag,agent-pod` | 6800 ms |
| 4 | `manual` | Manual Testing | Indirect Prompt Injection, Pod mit cluster-admin | manual testing | `python3 craft_doc.py --hidden-instructions -o angebot.pdf` | 7600 ms |
| 5 | `manual` | Exploit | Über den Agenten in den Cluster: Secrets offen | exploit | `curl -F file=@angebot.pdf https://app.[redacted].ai/upload` | 7400 ms |
| 6 | `assist` | Reporting | Bericht mit Fixes übergeben | reporting | `ai-report draft --map owasp-llm && review` | 13000 ms |

Mode labels (German): `ai` → `AI-DRIVEN WITH SUBAGENTS`, `manual` →
`MANUELL`, `assist` → `AI-ASSISTED · HUMAN REVIEW`. The word `PHASE` and the
rail's label `Phasen` complete the German texts.

There are exactly six phases; the formations are drawn for exactly these six.
The durations belong to the animation and live in the script; mode and
command live in `engagement.json`; titles, hit lines, rail labels and all
other words live in the interface texts (see *Texts*).

### Phase rail

An ordered list with the label `Phasen`, absolutely positioned at
`left` and `right` `clamp(12px, 4vw, 48px)`, `bottom: 18px`; no list style,
no margin or padding; a flex row with gap 6px. Each item has
`flex: 1 1 0; min-width: 0` and holds a button:

- `width: 100%`, `min-height: 48px`, transparent, no border, padding
  `6px 2px`, `cursor: pointer`, left aligned, a column with gap 7px, IBM Plex
  Mono. Focus ring on `:focus-visible`: `2px solid #268bd2`, offset 2px.
- Its accessible name is `<phase> <n>: <rail label>`, for example
  `PHASE 1: angriffsfläche`. The current phase's button carries
  `aria-current="step"`; the others carry no `aria-current`.
- A track: a 2px high block in `rgba(228, 229, 229, 0.12)`,
  `overflow: hidden`, with a fill inside it at full height. Fill width: 100 %
  for passed phases, the current phase's progress rounded to whole percent,
  0 for later phases; `transition: width .12s linear`. Fill colour: `#dc322f`
  for the exploit phase (5) once it is current or passed, otherwise `#268bd2`
  for `manual` phases and `#8fc0e8` for `ai` and `assist` phases.
- The rail label: 11.5px, letter spacing `.06em`, `white-space: nowrap`,
  `overflow: hidden`, `text-overflow: ellipsis`; colour `#e4e5e5` when
  current, `#979899` when passed, `#6f7071` when later.

A click on a button jumps to that phase (see *Playback*).

### Canvas

#### Resolution

The canvas measures the stage's client size `w × h`. Its backing store uses
`dpr = min(3, devicePixelRatio × zoom)`, where `zoom` is the stage's
rendered width over its client width (at least 1); if `w × h × dpr²`
exceeds 9 000 000, `dpr` drops to `sqrt(9 000 000 / (w × h))`. Every 600 ms
the script checks the size and the zoom and recomputes when the client size
changed or the zoom moved by more than 0.08; a window resize recomputes too.

#### Projection

- Wide stage (`w > 860`): `S = min(w / 4.3, h / 2.9)`, `cx = 0.6 w`,
  `cy = 0.42 h`. Otherwise `S = min(w / 3.5, h / 3.6)`, `cx = 0.5 w`,
  `cy = 0.34 h`.
- A point `(x, y, z)` in units turns by `yaw` about the vertical axis
  (`rx = x cos yaw + z sin yaw`, `rz = −x sin yaw + z cos yaw`), then by
  `pitch` about the horizontal axis (`ry = y cos pitch − rz sin pitch`,
  `rz' = y sin pitch + rz cos pitch`). Its scale is
  `s = D / (D − 0.9 rz')` with `D = 4.2`; it lands at
  `(cx + rx S s, cy + ry S s)`. Points with `s ≤ 0` or `s > 6`, or more
  than 20px outside the stage, are not drawn. Strokes, labels and the report
  project with `z = 0`.
- `yaw = (0.16 px + 0.05 sin(0.21 t)) × k` and
  `pitch = (−0.08 py + 0.025 sin(0.17 t)) × k`, with `t` in seconds and
  `k = 0.2` while the report formation shows, otherwise 1.
- Pointer: `(px, py)` follows the pointer's position over the stage,
  normalised to −1 … 1 on both axes; each frame it moves 5 % of the way to
  that target. When the pointer leaves the stage the target returns to
  `(0, 0)`.

#### Particles

- Count `N`, fixed when the page loads from the stage width: 1300 below
  700px, 2000 below 1100px, otherwise 2600. The density factor is
  `d = N / 2600`; every count below that says "× d" is rounded after
  multiplying.
- Random numbers come from the 32-bit generator mulberry32 with fixed seeds,
  so the pictures are the same on every visit. `gauss()` is
  `(R + R + R − 1.5) / 1.5`.
- Per particle, drawn from seed 7 in this order: size
  `0.55 + r⁶ × 2.6`, phase `R × 6.283`; then in a second loop orbit radius
  `oR = 0.008 + R^2.2 × 0.09`, orbit speed
  `oW = ±(1.6 + R × 3.4) / (1 + 8 oR)` (sign negative when `R < 0.5`), tilt
  `oT = (R − 0.5) × 3.1`, lag `oL = R^1.4 × 0.5`.
- Palette: 0 `rgb(112, 132, 150)` haze, 1 `rgb(143, 192, 232)` agents,
  2 `rgb(38, 139, 210)` accent, 3 `rgb(220, 50, 47)` alert,
  4 `rgb(228, 229, 229)` light.
- A dot's radius is `clamp(size × sm × s × 0.92, 0.55, 4.2)`, `sm` being
  the formation's size factor for that particle. Dots draw as filled circles,
  batched by palette colour and opacity in tenths (fill opacity
  `(tenth + 0.5) / 10`). Dots larger than 1.5px also get a halo first: a
  64px sprite with a radial gradient of the colour (opacity 0.55 at the
  centre, 0.18 at 30 %, 0 at the edge), drawn `10 × radius` wide at half the
  dot's opacity.

#### Network layout (units)

| Name | Points |
| ---- | ------ |
| R (root domain) | (−1.5, 0) |
| S (subdomains) | (−0.72, −0.8), (−0.72, −0.27), (−0.72, 0.27), (−0.72, 0.8) |
| H (hosts) | (0.12, −0.9), (0.12, −0.32), (0.12, 0.3), (0.12, 0.88) |
| D (data) | (0.95, −0.6), (0.95, 0.04), (0.95, 0.64) |
| X (servers) | (1.7, −0.22), (1.66, 0.62) |
| P (pentester) | (−1.55, −0.95) |
| T (target) | H2 |

Edges: R to every S; S0–H0, S1–H1, S1–H2, S3–H2, S2–H3; H0–D1, H1–D0,
H2–D1, H3–D2; D1–X0, D2–X1, D0–X0.

An edge from `a` to `b` is a quadratic Bézier curve. Its control point lies
at the midpoint, moved perpendicular by `0.14 × length`, to the left of the
direction `a → b` when `dy ≥ 0` and to the right otherwise. "The middle of an
edge" is the curve's point at `t = 0.5`.

#### Building blocks

Each formation is a list of particle slots `(x, y, z, colour, opacity, role,
parameter, size factor, line flag)`; the defaults are role 0, parameter 0,
size factor 1, line flag 0. Blocks marked *line* set the line flag on their
slots and register a stroke.

| Block | Slots | Stroke |
| ----- | ----- | ------ |
| node(p, c, a, r = 0.055) | 26 × d on a circle of radius r at angles `i/m × 2π + R × 0.1`, z `gauss × 0.02`; 9 × d core points at `gauss × 0.018` | line: circle of radius r with a solid core |
| ghost(p) | 12 × d points at a random angle, radius `0.03 + R × 0.05`, z `gauss × 0.15`, colour 0, opacity 0.22 | none |
| edge(a, b, c, al, dens = 46) | `max(3, L × dens × d)` points at `t = 0.08 + 0.84 × (i + 0.6 R)/m` on the curve, jitter `gauss × 0.004`, z `gauss × 0.008`, opacity `min(1, 1.25 al) × (0.6 + 0.4 sin πt)`, size factor 0.62 | line: the curve |
| ring(p, r, c, al, m) | m × d points evenly on the circle, z `gauss × 0.01`, size factor 0.75 | line: the circle |
| line(a, b, c, al, m) | `max(2, m × d)` points evenly from a to b, z `gauss × 0.01`, size factor 0.7 | line: the segment |
| agent(role, c) | 78 × d points at `gauss × 0.012` in x, y, z, opacity `0.6 + 0.4 R`, size factor 0.75 | none |
| swarm(role, c, m) | like agent with m × d points | none |
| me(sc = 1) | 110 × sc × d points at `gauss × 0.01`, colour 2, opacity `0.7 + 0.3 R`, role 5, size factor 0.85 | none |

`loop(p, r)` gives six waypoints at angles `j/6 × 2π`:
`(p.x + r cos a, p.y + 0.8 r sin a, 0.5 r sin 2a)`.

The dim net, `dimNet(upto)`: node R (colour 0, 0.45); nodes S (0, 0.45);
edges R–S (0, 0.28); nodes H (0, 0.45); edges S–H (0, 0.28); node D1
(0, 0.4); ghosts D0 and D2; edges H–D (0, 0.2, density 30); node X0 (0,
0.35) when `upto`, otherwise a ghost at X0; a ghost at X1.

After its blocks, every formation except 0 fills up to `N` slots with
background haze: x `(R − 0.5) × 6.8`, y `(R − 0.5) × 4.2`,
z `−0.6 − 2.2 R`, colour 2 with probability 0.05 and colour 0 otherwise,
opacity `0.1 + 0.22 R`. Slots beyond `N` are dropped, and the slots are
shuffled (Fisher–Yates) so that particles cross the stage when the picture
changes. Formation `k` draws its numbers from seed `100 + 17 k`. Its drift is
0.008 unless stated otherwise.

#### Formations

**0, chaos.** N points spread uniformly over x `(R − 0.5) × 6.6`,
y `(R − 0.5) × 4.0`, z `(R − 0.5) × 4.2`; colour 2 with probability 0.09,
otherwise 0; opacity `0.3 + 0.6 R`. Drift 0.05. No haze.

**1, attack surface.** The AI application and every way content gets in
or out. Node R (colour 4, 0.95, radius 0.07); nodes S (4, 0.9); edges R–S
(0, 0.55); ghosts at all H, D and X. Agents with roles 1 and 2 in colour 1.
Agent paths (`o` is the offset):

- `input-mapping`: R, S0, (−1.1, −0.5), S3, (−1.1, 0.45), S1; o 0.
- `model-fingerprint`: S0, S1, S2, S3, S2, S1; o 0.5.

Labels: `app.[redacted].ai` at R + (−0.02, 0.13), `#8fc0e8`, centred;
`chat`, `api`, `git`, `docs-upload` at S0 … S3 + (−0.1, 0.012), `#979899`,
right aligned.

**2, broad testing.** Small probe swarms hammer the inputs, and the pipeline
behind them appears. Node R (4, 0.9, 0.07); nodes S (4, 0.85); nodes H (4,
0.9); node D1 (4, 0.75); ghosts D0, D2 and both X; edges R–S and S–H (0,
0.5); edges H0–D1 and H2–D1 (0, 0.35, density 30). No rings around the
hosts. Agents with roles 1 to 4 in colour 1, each with its own time per
waypoint:

- `jailbreak`: S0, R, S1, S0; o 0; 0.8 s.
- `leak`: S1, H0, S0, H1; o 0.3; 0.9 s.
- `injection`: S3, H2, S1, H2; o 0.6; 0.85 s.
- `tool-enum`: H2, D1, H0, D1; o 0.15; 1.1 s.

Labels at H0 … H3 + (0.15, 0.012), left aligned: `llm-gateway`,
`vector-db` and `rag · ingest` in `#8fc0e8`, `ci/cd` in `#c0c1c1`. Further:
`agent · k8s-pod` at D1 + (0.1, 0.012) in `#c0c1c1`; `?` at D0 and at D2 +
(0.1, 0.012) in `#6f7071`; all left aligned.

**3, analysis.** Two suspects: an AI-specific one (the RAG ingestion takes
unvetted documents) and an infrastructure one (the agent pod with broad
rights). `dimNet(false)`; around T a ring of radius 0.17 (2, 0.95, 70
points) and one of radius 0.1 (2, 0.6, 34); four crosshair lines from
`T + 0.21 v` to `T + 0.32 v` for v right, left, down, up (2, 0.95, 9
points); node T (4, 0.95); a ring around D1 of radius 0.13 (2, 0.7, 48);
node D1 (4, 0.9); edge T–D1 (2, 0.5, density 50); me(). Labels, all
`#268bd2`: `<rag>` at T + (0.36, 0.012), left aligned; `<pod>` at
D1 + (0, −0.21), centred; `<me>` at P + (0.12, 0.012), left aligned.

**4, manual testing.** Both suspects are tested by hand: hidden
instructions in a document, and what the pod's service account may do.
`dimNet(false)`; ring around T of radius 0.13 (3, 0.95, 54) and one of
radius 0.2 (2, 0.35, 40); node T (4, 0.9); ring around D1 of radius 0.11
(3, 0.8, 44); node D1 (4, 0.85); me(0.5); swarm(role 1, colour 2, 150);
swarm(role 2, colour 2, 110). Two unnamed agents: role 1 on `loop(T, 0.17)`,
o 0, 0.85 s per waypoint; role 2 on `loop(D1, 0.14)`, o 0.5, 0.95 s per
waypoint. Labels: `indirect prompt injection` at T + (0.25, 0.012) in
`#dc322f`, left aligned; `serviceaccount: cluster-admin` at D1 + (0, −0.2)
in `#dc322f`, centred; `<me>` at P + (0.12, 0.012) in `#268bd2`, left
aligned.

**5, exploit.** The pentester drives the chain: the poisoned document goes
in through the upload, the RAG ingestion hands it to the agent, the agent
runs a command in its pod, the pod's token is cluster-admin, and the
Kubernetes API hands out the secrets. The path turns red only where the
swarm has passed.

- The path is a Catmull-Rom curve through P, (−1.2, 0.2), S3, the middle of
  S3–T, T, the middle of T–D1, D1, the middle of D1–X0 and X0, sampled at 24
  points per segment, measured by length.
- `dimNet(true)`; me(0.55).
- Then, with reveal on: ring around T of radius 0.13 (3, 0.8, 44); node T
  (3, 0.9); edges S3–T, T–D1 and D1–X0 (3, 0.85, density 70); ring around
  D1 of radius 0.11 (3, 0.8, 40); node D1 (3, 0.8); rings around X0 of
  radius 0.17 (3, 0.95, 70) and 0.3 (3, 0.3, 55); node X0 (3, 0.95, radius
  0.075). Reveal gives every slot role 7 and the parameter
  `min(0.95, 0.92 f)`, f being the share of the path length at the path
  point nearest to it; every stroke gets the same value for its middle.
- swarm(role 1, colour 2, 200), reveal off.
- Reveal time `RV = 4.6 s`; haze level 0.1.
- The agent (lag 0.08) waits at the path's start until 0.3 s, moves along
  the path with ease-in-out-quad until `0.92 RV`, wobbling by
  `0.025 sin(5.1 t)` and `0.025 cos(4.3 t)`, and afterwards circles X0 at
  `(0.17 cos 1.9t, 0.13 sin 1.9t, 0.08 sin 3.8t)`.
- Labels: `kubectl get secrets -A` at X0 + (0.1, −0.34), `#dc322f`, right
  aligned, shown from `0.92 RV`; `k8s-api` at X0 + (0, 0.36), `#c0c1c1`,
  centred; `docs-upload` at S3 + (−0.1, 0.012), `#979899`, right aligned;
  `agent · k8s-pod` at D1 + (0.1, −0.12), `#c0c1c1`, left aligned;
  `rag · ingest` at T + (−0.17, 0.012), `#8fc0e8`, right aligned; `<me>` at
  P + (0.12, 0.012), `#268bd2`, left aligned.

**6, reporting.** A glass panel; the swarm swirls over it and the report
appears token by token where it has been (see *Report*).

- Points sampled inside the report's letters, at most 1250 × d: role 7,
  z 0, colour of the line, opacity 0.45, size factor 0.5, parameter
  `(first token of the line + R × tokens of the line) / all tokens × 0.92`.
- A big swarm of 1000 × d points over the panel: x from `x0 − 0.4` to
  `x1 + 0.4`, y from `y0 − 0.22` to `y1 + 0.22`, z `(R − 0.5) × 0.5`;
  colour 1 with probability 0.7, otherwise 4; opacity `0.45 + 0.5 R`; role
  8; size factor 0.7.
- Reveal time `RV = 8 s`. No agents, no labels.

Formations 1 to 4 use the default reveal time of 7.2 s.

#### Report

The panel spans x from −0.36 to 1.12 and y from −0.98 to 0.98; text starts at
`L0 = −0.24`. A character is `0.6 × size` wide. Fonts are IBM Plex Mono.

| Line | x | y | Size | Weight | Text | Colour (palette) |
| ---- | - | - | ---- | ------ | ---- | ---------------- |
| 0 | L0 | −0.8 | 0.075 | 700 | report title | `#e4e5e5` (4) |
| 0 | `1.0 − width` | −0.8 | 0.034 | 500 | confidential mark | `#dc322f` (3) |
| 1 | L0 | −0.68 | 0.038 | 400 | meta line | `#979899` (0) |
| 2 | from L0 | −0.48 | 0.04 | 500 | `■ <count> <severity>` per severity, 0.07 apart | severity colour |
| 3 | L0, L0 + 0.2, L0 + 0.52 | −0.3 | 0.036 | 500 | column heads | `#7d7e7f` (0) |
| 4 + i | L0 | `−0.14 + 0.17 i` | 0.038 | 400 | the row's ID, `F-0<i+1>` if it has none | `#979899` (0) |
| 4 + i | L0 + 0.2 | same | 0.038 | 700 | severity | severity colour |
| 4 + i | L0 + 0.52 | same | 0.05 | 400 | finding | `#e4e5e5` (4) |
| 9 | L0 | 0.76 | 0.038 | 400 | foot line | `#979899` (0) |
| 10 | L0 | 0.88 | 0.04 | 500 | `✓ <review>` | `#268bd2` (2) |

- Severity colour by row: rows 0 and 1 `#dc322f` (3), rows 2 and 3
  `#268bd2` (2), row 4 `#979899` (0). The summary line counts the rows per
  severity name in order of first appearance and colours each group like its
  first row.
- Three rules from L0 to 1.0 at y −0.6, −0.235 and 0.665, drawn in
  `rgba(228, 229, 229, 0.12 f)`, 1px. Each grows in over four tokens from
  60 % of line 1, 50 % of line 3 and 70 % of line 8.
- Tokens: every line splits into words (letters including German umlauts,
  `ß` and Greek, and digits), single other characters and spaces; spaces
  count for nothing. Tokens are numbered in reading order, by line, then by
  x. Written tokens: `pt = tSince / RV / 0.92 × all tokens`. A line shows
  its text up to the last completed token at opacity 0.96 and the token being
  written at `0.96 × (pt − its number)`. Font size `size × S × scale`.
- The writing head is the position of the token being written; a trail
  follows it with smoothing `1 − e^(−9 dt)` (dt at most 0.05 s) and keeps its
  last 45 positions.
- Glass: the panel's projected corners, rounded with radius 16px. Inside, the
  canvas drawn onto itself blurred by 9px, then a linear gradient from the
  first to the third corner, `rgba(70, 72, 72, 0.30)` to
  `rgba(36, 37, 37, 0.34)`; outline `rgba(228, 229, 229, 0.09)`, 1px; a
  highlight along the top edge, 18px in from both corners,
  `rgba(255, 255, 255, 0.07)`. The glass fades in over the first 1.6 s of the
  formation.
- Report done: `smoothstep((tSince − 0.97 RV − 0.2) / 0.9)`.
- The letter points are sampled from an offscreen canvas at 520px per unit
  (832 × 48px, text drawn at `round(size × 520)` px, baseline middle) at
  every second pixel whose alpha exceeds 140, shuffled, then cut to the
  budget. Once IBM Plex Mono 400 has loaded, formation 6 is built again.

#### Per frame

With `p = (now − t0) / 2400 ms`, `tSince = (now − t0) / 1000 − 1.4` and the
formation's reveal time `RV`:

- **Arrival**: each particle waits a random 0 … 0.5 (drawn at every
  formation change), then travels from where it was to its slot over 0.5 of
  `p`, eased in-out-cubic (`e`). Colour, opacity and size factor blend from
  the old values with `e`; while the colours differ the particle draws in
  both, weighted `1 − e` and `e`.
- **Drift**: `x += amp sin(0.5 t + ph)`, `y += amp cos(0.42 t + 1.3 ph)`,
  `z += amp sin(0.37 t + 0.7 ph)`; `amp` blends from the old formation's
  drift to the new one's over `p` 0 … 1.
- **Agents** (roles 1 to 4): the agent's centre moves on a Catmull-Rom curve
  through its waypoints, 1.9 s per waypoint unless stated, starting at
  `o × waypoints`, plus a wander of `0.06 sin(0.9 t + 13 o) + 0.025
  sin(2.3 t + 22.1 o)` in x and `0.05 cos(0.7 t + 16.9 o) + 0.02
  sin(1.9 t + 13 o)` in y. Each particle follows the centre `oL × lag`
  seconds late (lag 1 unless stated) and orbits it at radius
  `oR (1 + 0.3 sin(2.7 t + ph))`, angle `oW t + ph`, tilted by `oT`.
  Named agents show their name at the centre + (−0.11, −0.1), `#8fc0e8`,
  right aligned, at 90 % of the label opacity.
- **Pentester** (role 5): orbits P + (0.02 sin 0.6t, 0.015 cos 0.5t) at
  radius `0.85 oR (1 + 0.2 sin(1.6 t + ph))`, angle `0.45 oW t + ph`.
- **Revealed content** (role 7): `rv = smoothstep((tSince − parameter × RV)
  / 0.9)`. Until revealed it scatters by
  `(0.22 sin(7.1 ph + 0.6 t) + 0.03 sin(1.3 t + ph)) (1 − rv)` in x,
  `0.16 cos(5.3 ph + 0.5 t) (1 − rv)` in y and
  `0.25 sin(3.7 ph + 0.4 t) (1 − rv)` in z; its opacity is multiplied by
  `haze + (1 − haze) rv` (haze 0.5 unless stated) and, in the report, by
  `1 − report done`.
- **Report swarm** (role 8): particles whose `frac(7.3 ph) < 0.68` buzz
  around the trail point `oL × 60` positions back: radius
  `2.4 oR (1 + 0.35 sin(3.3 t + ph))`, angle `1.8 oW t + ph`,
  `x = h.x + 1.4 r cos an + 0.02 sin(5.1 t + ph)`,
  `y = h.y + 0.8 r sin an cos oT`, `z = r sin an sin oT`. The others buzz
  freely around their slot with `w = 1.1 + 0.5 |oW|`:
  `x += 0.2 sin(w t + ph) + 0.06 sin(2.3 w t + 1.7 ph) + 0.08 sin(0.31 t +
  0.2 ph)`, `y += 0.16 cos(0.8 w t + 1.3 ph) + 0.05 sin(2.9 w t + ph) + 0.06
  cos(0.27 t + 0.3 ph)`, `z += 0.15 sin(1.1 w t + 0.7 ph)`. Once the report
  is done both groups fly off by `(1.3 cos 3ph, 0.9 sin 3ph) × done` and fade
  by `1 − done`.
- **Line particles**: once a formation has formed, particles with the line
  flag fade to half their opacity, by `fk = smoothstep((p − 0.55) / 1.15)`
  (times `rv` for revealed slots); the previous formation's line particles
  come back by `pk = 1 − smoothstep(p / 0.95)`.
- **Strokes**: the previous formation's strokes draw fully at opacity `pk`;
  the new ones draw in from their start to the share `fk`, at opacity `fk`.
  A revealed stroke multiplies both by `clamp((tSince − its value × RV) /
  0.9)`. Edges and lines draw in 32 steps at width 0.8 (edge) or 1 (line) in
  the palette colour at `0.5 × opacity`; circles in 48 steps from the top at
  width 0.9 (node) or 1 (ring). A node also gets a filled core of radius
  `max(1.2, 0.012 S scale)` at `0.55 × opacity`. Round line caps.
- **Legend**: while formation 2, 3, 4 or 5 shows, the top right corner
  carries two entries, `<legend 0>` with a dot in `#8fc0e8` and
  `<legend 1>` with a dot in `#c0c1c1`. IBM Plex Mono 500 11px, baseline
  middle, right aligned at `x = w − 28`, the first at `y = 30`, the second
  20px lower; text in `#979899`; the dot, radius 3.5px, sits 10px left of
  the text; everything at opacity 0.85. It appears and disappears with the
  formation change, without a fade.
- **Order**: halos, previous strokes, new strokes, dots; in the report
  formation then the glass, the dots of roles 1 to 4, 7 and 8 above it, and
  the report text; then the legend; labels last.
- **Labels**: IBM Plex Mono 500 12px, baseline middle, opacity rising from 0
  to 1 between 1.5 s and 2.2 s after the formation change.

### Playback

- **Start**: formation 0 shows at once; after 1.6 s phase 1 begins. While the
  intro runs, the command does not type.
- **A phase begins**: the next formation starts forming (2.4 s per `p`), the
  command restarts empty and the rail's progress restarts at 0.
- **Typing**: one character every 42 ms until the command is complete.
- **Progress**: every 120 ms the rail's progress becomes `elapsed /
  duration` (at most 1) when it moved by more than 0.02.
- **Next phase**: when a phase's duration is over, the next begins. After
  phase 6 the picture returns to formation 0 (not instantly), the overlay
  shows phase 1 with an empty command, and after 1.6 s phase 1 begins again.
- **Rail click**: jumps to that phase; under reduced motion the jump is
  instant (picture formed, command complete, progress full).
- **Visibility**: the animation runs only while more than 25 % of the stage
  is visible (observer thresholds 0, 0.25 and 0.5). While hidden, the canvas
  is not redrawn and the timers do not advance a phase; on return, the time
  spent hidden is added to the phase's and the formation's start, so the
  picture continues where it stopped. If no observer reports within 1.2 s,
  the stage counts as visible. Moving the pointer over the stage or clicking
  the rail also counts as visible.

### Phone

Below 761px width (`max-width: 760px`) the stage is 720px high, the overlay
sits at 16px from both sides and 118px from the bottom, the rail at 8px from
both sides, and the rail labels are hidden; the tracks stay.

### Reduced motion

With `prefers-reduced-motion: reduce` the section starts in phase 6 with the
report formation already formed, the command complete and the rail full. It
does not autoplay, the command does not type, the cursor does not blink and
the title block does not fade in. The rail still jumps between phases,
instantly. The canvas keeps drawing every frame, so the gentle drift, the
pointer tilt and the report swarm's departure stay visible (see *Material for
the revision*).

### Without JavaScript

The page renders phase 1 into the overlay (phase line, mode, title, hit line,
the full command) and the rail with empty tracks and phase 1 as current. The
canvas stays empty on the stage background.

### Accessibility

- The canvas has `role="img"` and the label from the texts
  (`Animation: Ein Partikelschwarm formt nacheinander eine KI-Pipeline, das
  Ziel, den Angriffspfad über eine Prompt Injection und den Bericht eines
  Penetrationstests.`).
- The rail is a list of real buttons with names and `aria-current`, as above.
- The cursor is `aria-hidden`.

### Texts

The interface texts of every language carry, under `engagement`:

| Key | German |
| --- | ------ |
| `phase` | `PHASE` |
| `phases_label` | `Phasen` |
| `aria` | the canvas label above |
| `modes` | `ai`, `manual`, `assist` as in *Phases* |
| `titles`, `hits`, `rail` | six entries each, as in *Phases* |
| `labels.rag` / `labels.pod` | `rag · ingest · KI-spezifisch` / `agent-pod · zu viele Rechte?` |
| `labels.me` / `labels.review` | `pentester` / `human review` |
| `labels.legend` | `KI-Komponente`, `Kubernetes / Infrastruktur` |
| `report.title` / `report.conf` | `PENTEST-BERICHT` / `VERTRAULICH` |
| `report.meta` | `Scope: *.[redacted].ai · Black-Box · Okt 2026` |
| `report.cols` | `ID`, `SCHWERE`, `BEFUND` |
| `report.rows` | severity, finding, ID: `KRITISCH` `Prompt Injection · Upload` `LLM01`; `KRITISCH` `Agent führt Befehle aus` `LLM06`; `HOCH` `Pod mit cluster-admin` `K8S`; `MITTEL` `System-Prompt leakt` `LLM07`; `NIEDRIG` `Kein Rate-Limit` `LLM10` |
| `report.foot` | `Jeder Fund mit PoC, Risiko und konkretem Fix.` |

English and Greek carry the design's English and Greek texts for the same
keys, so they are ready when spec 009 publishes them again. The head texts
`approach.eyebrow`, `title_a`, `title_b` and `note` stay as they are; the
German ones equal the design's. `approach.lead` takes the design's lead in
each language; the German one reads `KI-Agenten kartieren die
Angriffsfläche Ihrer KI-Anwendung und feuern breit gestreute Testanfragen
ab. Dann übernehme ich: die eine Kette, die wirklich Schaden anrichtet – vom
präparierten Dokument bis in den Kubernetes-Cluster, manuell und
reproduzierbar.`

The canvas labels that name things in the target (`app.[redacted].ai`,
`chat`, `api`, `git`, `docs-upload`, `llm-gateway`, `vector-db`,
`rag · ingest`, `ci/cd`, `agent · k8s-pod`, `?`, `indirect prompt injection`,
`serviceaccount: cluster-admin`, `kubectl get secrets -A`, `k8s-api`) and the
agent names (`input-mapping`, `model-fingerprint`, `jailbreak`, `leak`,
`injection`, `tool-enum`) are the same in every language and belong to the
formations in the script.

`engagement.json` holds the six phases in order, each with `mode` (`ai`,
`manual` or `assist`) and `cmd`. The generator fails the build when it does
not hold exactly six phases, when a phase has an unknown mode, or when
`titles`, `hits` or `rail` of a published language do not hold six entries.

The generator hands the script one JSON data block (not executed, so the CSP
allows it) with the phases (mode, command, title, hit line and rail label;
the script derives the colours from the mode) and the texts the canvas draws (`phase`,
`modes`, `labels`, `report`).

### The script

`engagement.js` is rewritten for this spec under its old name. It was
`spec-maintained`, which asks for targeted edits instead of regeneration so
that behaviour no spec describes does not get lost. Here nothing of the old
behaviour stays: this spec replaces the whole section, terminal, network map
and all, and describes everything the new script does. A rewrite therefore
loses nothing unspecified. Keeping the name spares spec 008, whose
acceptance names the file.

It stays a plain ES module without dependencies, loaded through `asset_url`
(spec 008), written in functions and plain state rather than a component
class. Widths and colours that change while it runs are set through the DOM's
style properties, which the CSP allows; the markup carries no `style`
attributes.

## Material for the revision

Points the later spec decides; this spec keeps the design's behaviour.

- **Fade per phase.** The artboard computes a key per phase and language for
  the title block's fade but never binds it, so the block fades in only once.
  A fade on every phase change looks intended.
- **Movement under reduced motion.** The canvas keeps drawing: drift of about
  2px, the pointer tilt at 20 %, and the report swarm flying off during the
  first second. A still picture after the report has formed would honour the
  setting fully.
- **Unused design texts.** The artboard carries a report subtitle
  (`*.[redacted].ai · 5 Findings`) and the labels `verdächtig` and
  `bericht · 3 findings` that no formation draws; they are not taken over.
- **Legend on phones.** The legend keeps its place in the top right corner
  on narrow stages, as in the design.
- **Particle count on resize.** The count is fixed when the page loads; a
  phone turned to landscape keeps it.
- **Bold monospace.** The report title and the severities ask for IBM Plex
  Mono 700, which neither the design nor the site loads; browsers embolden
  the 400 face.
- **Symbols.** `❯`, `▌`, `■` and `✓` are not in the site's font files and come
  from a fallback font, as in the design.
- **Fixed date.** The report's meta line names `Okt 2026`.

## Constraints

- Content-Security-Policy as in `nginx/security-headers.conf`: scripts,
  styles and fonts from the site only; no inline scripts, no `style`
  attributes.
- No external fonts or scripts, no framework.
- The page is German only (spec 009); the section has no language buttons.
- Every script and stylesheet reference is versioned (spec 008).

## Out of scope

- The revision of the animation (see *Material for the revision*).
- Other sections of the start page.
- The article animations (spec 006).

## Acceptance

1. `just build` and `just check-generated` pass.
2. At 1280px and 390px width, screenshots of the section 1.5 s, 4.5 s,
   7.5 s, 11.5 s and 16.5 s after the stage comes into view match the
   design's prototype at the same moments, apart from the three exceptions in
   *Why* and random per-load differences (the arrival delays).
3. The section has no language buttons, and no request leaves the site.
4. Under reduced motion the section shows phase 6 with the report formed,
   the command complete and the rail full, and does not advance on its own; a
   rail click jumps instantly.
5. Below 761px the stage is 720px high and the rail shows tracks without
   labels; no page scrolls sideways at 390px.
6. The browser console shows no errors and no CSP violations, with the CSP of
   `nginx/security-headers.conf` applied.
7. A build with `engagement.json` holding five phases fails.
8. The legend shows during phases 2 to 5 and not during phases 1 and 6, the
   report lists the IDs `LLM01`, `LLM06`, `K8S`, `LLM07`, `LLM10`, and the
   lead above the stage reads as in *Texts*.

## Touches

Orientation for the implementation, not an instruction: the start page
template (section markup), the stylesheet (section rules replace the `cx-*`
and `approach__results` rules), `engagement.js` (rewritten),
`engagement.json` and the interface texts (phases and canvas texts), and the
generator (data block and checks).
