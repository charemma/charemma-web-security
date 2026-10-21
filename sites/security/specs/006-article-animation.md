# 006 Article animation

Status: approved 2026-10-19, amended 2026-10-19 (chapter player), amended
2026-10-19 (kinds of interactive moment), amended 2026-10-19 (mail client
and assistant chat surfaces), amended 2026-10-20 (controls of the
interactive moment only in its chapter)

History: the first version of this spec put a list of steps into the
article's front matter and played it as boxes and arrows. Branch
`feat/article-animation` implements that version and stays as it is. This
version replaces it with a chapter player on realistic surfaces, derived
from `ANIMATION.md` and `PromptInjectionPlayer.dc.html`.

## Why

The start page replays an engagement as an animated terminal, and it
explains the approach better than the text next to it does. The knowledge
articles explain risks whose essence is also a sequence: an attacker writes
a text, an agent reads it, the text carries an instruction, the agent
follows it, something leaks. In prose the reader has to reconstruct the
order; shown one step at a time, the order is the point.

The first version of this spec showed such a sequence as boxes and arrows.
`ANIMATION.md` records what happened when the prompt injection animation
was designed that way: readers had to translate the picture before they
could follow it. An explanatory panel next to the animation split their
attention, and a diagram driven by the scroll position changed without
their doing anything. What was understood was a sequence of screens the
reader already knows, an issue page and a CI log, in chapters at the
reader's own pace, with one moment where the reader discovers something
by hand.

An article animation is therefore a short, chaptered replay on surfaces
that look like the real thing. The reader controls the pace: a chapter bar,
play and pause, a stop at the end. Movement is rare and tells cause and
effect. One caption under the stage carries the text. One interactive
moment lets the reader discover by hand what the surface hides or what
differs between two states of it; the prompt injection scene uses it to
show what the model sees. One switch shows the same
scene with a countermeasure, so the reader sees which configuration
changed and what it changed. The case is documented or marked as
constructed, the names are generic, and the protection is shown with its
residual risk.

The format is deliberately narrow: one animation per article, four to six
chapters, one caption each, one interactive moment, one switch. What needs
more is prose.

Two parts carry this. A shared player, written once, holds the frame, the
controls, the states and the chapter model, so every animation on the site
behaves the same. A scene per article holds the surfaces, the chapters,
the captions, the interactive moment and the switch, and is content of the
article: its article spec decides what the scene shows, this spec decides
only the format and the mechanics.

## What

### Terms

- Animation: the figure in an article page, made of the stage, the
  controls and the caption.
- Player: the shared code and template that render the frame and the
  controls, hold the states and the chapter model, run the cues and the
  interactive moment.
- Scene: the file of one article and language that holds the surfaces,
  the chapters, the captions, the cues, the interactive moment and the
  switch.
- Stage: the framed area that shows the surface of the current chapter.
- Surface: a rebuilt screen the reader recognises, such as an issue page,
  a CI log, a chat or a terminal.
- Chapter: one unit of the animation: a surface, the cues that change it,
  and one caption.
- Cue: one movement within a chapter, declared on the element it moves.
- Interactive moment: the one place in a scene where the reader discovers
  something by hand; it has a kind, which fixes what the reader does and
  what the player demonstrates.
- Kind: one of the closed list of interactive moments this spec defines
  (`lens`, `compare`, `reveal`), named in `data-aha`.
- Variant: one of the two states of the switch; the scene shows the attack
  without the countermeasure in the first variant and with it in the
  second.
- Storyboard: the scene without JavaScript: the chapters as a static
  sequence of pictures, each with its caption, as the committed page
  carries them.

### Scene file

An article has an animation when a scene file exists next to it:
`src/articles/<slug>-<lang>-scene.j2`, named after the article file
`<slug>-<lang>.md` of spec 003. The scene is in the language of the
article; a translation of the article has its own scene file with the same
chapters, the same cues and translated texts.

The body of the article marks the position of the animation with a line
that consists only of `[animation]`. The generator splits the body at the
first such line, renders the Markdown before and after it separately and
places the figure between them. The line is CommonMark that renders as
plain text when it is left in by mistake, so a build that ignores it
cannot produce broken markup. A scene file without the line fails the
build, and so does the line without a scene file.

The scene file is a template fragment. It carries no `<script>`, no
`<style>`, no `style` attribute, no `<canvas>` and no `<img>`: the web
server's content security policy allows neither inline script nor inline
style, text that has to be read stays HTML, and images in articles are out
of scope per spec 003. Everything the scene shows is markup with the
classes of the stylesheet and the attributes below; everything that moves
is a cue the player runs. The player's template offers macros for the
parts that carry chrome (the chapter frame, the caption, the switch, the
interactive moment), so a scene writes no chrome of its own; the markup
those macros produce is the contract this section states.

### Figure

The scene renders one `<figure>` with `data-animation` and an
`aria-label` in the language of the article that says what the animation
shows, for example `Animierte Illustration: Prompt Injection über ein
Issue`. The figure contains the switch when the scene has one, then the
chapters in order, then the caption area.

### Chapters

A scene has four to six chapters. Fewer than four do not need a player;
more than six exceed what a reader follows in one sitting. Each chapter is
a `<section data-chapter>` with:

| Attribute | Required | Meaning |
| --------- | -------- | ------- |
| `data-label` | yes | One or two words, shown in the chapter bar after the chapter number |
| `data-duration` | yes | Length of the chapter in milliseconds, 7000 to 11000 |
| `data-address` | yes | The text in the address field of the frame, such as `example/app · Issues · #482` |

and in its content:

- one or more panels, `<div data-panel>`: the surface of the chapter. A
  chapter without the switch has exactly one panel. A chapter the switch
  changes has one panel per variant, each with `data-variant` set to the
  variant's identifier. A panel that shows the attack taking effect may
  carry `data-harm`; the chapter bar colours its progress in the alarm
  colour then.
- one caption per variant the chapter shows: a `<p data-caption>`,
  without `data-variant` when it applies to both variants, with it when
  the variants differ. The caption starts with a `<strong>` that holds the
  core statement, followed by one or two sentences. In the first chapter
  of a constructed scenario, a `<span data-scenario>` with the marker
  sentence precedes the `<strong>` and is rendered as a line of its own,
  as the section on realism says. There is no second caption, no side
  panel and no second text column.

The duration is the time the chapter stands on the stage during playback:
long enough to read the caption and to watch the cues, 7 to 11 seconds as
`ANIMATION.md` sets it. A chapter does not change its caption while it
plays; what needs two captions is two chapters.

### Cues

A cue is declared on the element it moves, inside a panel:

| Attribute | Required | Meaning |
| --------- | -------- | ------- |
| `data-cue` | yes | The effect, one of the seven below |
| `data-at` | yes | Start, in milliseconds from the start of the chapter |
| `data-for` | for `type`, `lines`, `merge`; optional for `show` | Length of the movement in milliseconds |

The seven effects are the movements `ANIMATION.md` allows, and no other:

| Effect | Start state | Movement | End state |
| ------ | ----------- | -------- | --------- |
| `show` | hidden | the element fades in; with `data-for`, it stays that long and fades out again | visible, or hidden again with `data-for` |
| `hide` | visible | the element fades out | hidden |
| `swap` | first child visible | the first child gives way to the second: a page change, a status change | second child visible |
| `type` | empty | the element's text is typed in at a constant rate over `data-for`, with a caret; nested spans keep their markup, so a highlighted part is highlighted while it is typed | full text |
| `lines` | no children | the children appear one after another, spread evenly over `data-for`: log lines, chat messages | all children |
| `press` | normal | the element shows its pressed state for a moment: a button being clicked | normal |
| `merge` | children apart | the children move together into one block over `data-for`: two contents become one | children together |

`show`, `hide`, `swap` and `press` take half a second; the length is a
named constant in the player and in the build. There is no other effect:
no particles, no organic shapes, no glitch, no camera movement, no
background animation and nothing that pulses. A scene that needs a
movement outside this table needs a change to this spec first.

Within a chapter and a variant, the cues run one after another: the busy
interval of one cue (its start to its end, `data-for` or the half second)
does not overlap another's, so at no moment two things move. The last cue
of a chapter ends at least three seconds before the chapter does, so the
reader can read what was typed or revealed before the next chapter
begins. Only what the caption of the chapter speaks about moves; the
article spec checks this, the build cannot.

For `type`, the typed text is at most 180 characters, so it is read in the
time the chapter leaves. A line break in the typed text renders as a line
break; whitespace at the start of a line that stems from the template's
indentation is stripped when the scene is rendered, so the storyboard and
the player show the same text without indentation.

The texts a cue types or reveals stand in the markup once, in their end
state. The player takes them from the document and never carries a copy.

### The interactive moment

Every scene has exactly one interactive moment, in which the reader
discovers something by hand. The moment has a kind, chosen by the article
spec after what the scene wants to reveal or compare, from the closed list
below and no other. One element in one panel carries `data-aha` with the
kind's name as its value, `data-at` and `data-for`, and the children the
kind requires. The list is closed in the sense of the types and protocols
of `AGENTS.md`: AI may propose a kind, and a new kind enters this list
through a spec change with explicit approval, never silently with a scene.

| Kind | Use it when | The reader | The demonstration |
| ---- | ----------- | ---------- | ----------------- |
| `lens` | a hidden part sits at one spot inside visible content and the point is where it is | moves a round lens over the element | the lens travels across the element and widens until the raw layer is fully revealed |
| `compare` | the same surface has two complete states that differ and the point is the difference | flips the element between the two states | the element flips to the second state, back, and to the second again, where it stays |
| `reveal` | a surface has a second surface under a cover and the point is that something lies underneath | uncovers and covers the element | the cover dissolves over `data-for` and the covered layer stands |

Rules common to every kind. The demonstration starts at `data-at` and
lasts `data-for`; it runs only the first time the chapter plays within one
playback and counts as a cue for the overlap rule, so nothing else moves
while it runs. When the reader selects the chapter again from the chapter
bar after it has played, the player shows the element in its end state and
waits, paused. Replay starts a new playback and with it the demonstration.
As soon as the reader takes the element (the pointer over the lens, a flip,
an uncovering), the demonstration stops and does not resume, the player
pauses on this chapter, the play button shows the paused state, and the
chapter never continues on its own: the reader presses play to go on. The
element takes the height of the taller of its layers, so no layer is ever
cut off. A control under the caption, created by the player, is the
fallback for keyboard and screen reader for every kind: a button for the
lens and the uncovering, the two state buttons for the comparison. It
stands only while the moment's chapter is the current chapter; in every
other chapter it is hidden, visually, from assistive technology and from
the tab order, and the space it takes collapses. The chapter bar is the
way to the chapter; in the chapter the control is the next stop in the
tab order after the caption. Pressing it pauses the player on the chapter
and toggles the element's end state. Without
JavaScript the fallback does not exist and the element stands in its end
state, as the storyboard section says. A scene has no second interactive
element: nothing else reacts to hover, pointer, click or touch, and no
interaction is hover-only.

**The lens** (`data-aha="lens"`): what the reader sees against what the
model sees. The element contains the rendered content as the surface shows
it and a child with `data-raw` that holds the same content as raw text, in
the monospace font, with the part the surface hides marked up as a block
of its own, as the design section describes it, so that the reader
recognises it as code laid bare.

During playback the lens is first shown automatically: at `data-at` a
round lens appears at the left edge of the element, at the height of the
part the surface hides, and travels in a flat arc from left to right
across the full width of the element, like a gaze reading the line,
revealing the raw layer inside its circle; only then does it widen until
the raw layer is fully revealed. As a guide, the travel takes two thirds
of `data-for` and the widening the remaining third; a short move to the
spot that then stands still is not the demonstration. The lens is the
only movement of its chapter while it runs. The box grows with the raw
text, so the raw layer is never cut off.

The pointer takes precedence. As soon as the mouse or a finger is over
the element, from the start of the chapter and also while the
demonstration runs, the lens follows the pointer; the demonstration stops
there and does not resume. Moving the lens pauses the player on this
chapter, so the chapter does not change under the pointer. When the
pointer leaves the element, the raw layer stays fully revealed, as after
the demonstration, and the player stays paused. On touch, one finger on
the element moves the lens and the page still scrolls vertically.

The fallback button shows the raw layer fully in place of the rendered
content, and a second press hides it again. Its labels come from the
interface texts. End state: the raw layer fully revealed.

**The comparison** (`data-aha="compare"`): the same surface in two states.
The element holds exactly two children `<div data-state>`, each with the
state's identifier as the attribute value, a short English word such as
`reported` and `actual`, and `data-label` with the label in the language
of the article, such as `Was der Agent meldet` and `Was wirklich passiert
ist`. Both children show the same region of the same surface in two
states: what the agent reports against what happened, the rendered answer
against its raw form. The first state is the one the surface shows at
first.

During playback the player flips the element to the second state at
`data-at`, back to the first at the midpoint of `data-for`, and to the
second again at the end of `data-for`, where it stays; each flip is a
crossfade of the half second of `swap`, so `data-for` is at least 4000 ms
and the reader sees both states twice. A click or tap on the element flips
it; the control under the caption is a group of two real buttons with the
states' labels, the shown state pressed, and flips it too. There is no
pointer movement and nothing on hover. End state: the second state. The
storyboard shows both states one after the other, each preceded by its
label as a short muted line, like the variants of a switched chapter.

**The uncovering** (`data-aha="reveal"`): a surface with a second surface
under a cover. The element holds the surface as the reader first sees it,
with the cover as part of it (a redaction bar, a collapsed row, a "3 lines
hidden" fold, a masked field), and one child `<div data-covered>` with the
same region as it is under the cover.

During playback the cover dissolves at `data-at`: the covering layer fades
out and the covered layer fades in over `data-for`, 1000 to 2000 ms, slow
enough to be read as lifting, not as a cut. A click or tap on the element
toggles between cover and covered layer; the button under the caption
toggles too, with labels from the interface texts. There is no travelling
lens and nothing on hover. End state: the covered layer visible.

### The switch

A scene may have one switch with exactly two variants: the first shows
the attack as it works without the countermeasure, the second the same
scene with the countermeasure in place. The switch is a `<div
data-switch>` before the chapters, holding one `<span data-variant>` per
variant with the identifier as the attribute value and the label as the
text, the first variant first. The identifiers are short English words
such as `exposed` and `protected`; the labels are in the language of the
article, such as `ohne Schutz` and `mit minimalen Rechten`.

A chapter the countermeasure does not touch has one panel and one
caption without `data-variant`; a chapter it changes has a panel and a
caption per variant. The countermeasure is visible as configuration on
the surface itself: the permissions line of a workflow, the absence of a
tool, a check on the output. The reader sees which setting changed and
what it changed. The protected variant shows what the protection does
realistically, with the residual risk named in its caption or on the
surface: no claim a specialist can refute, no protection that is total.
A scene prefers countermeasures that remove the effect of the attack
(least privilege, separation of agent and credentials, checks on the
output) over filters that are supposed to prevent it.

Selecting a variant takes the player to the first chapter that has
variant-specific content and plays it from the start; the chapters before
are the same in both variants and stay where they are. The switch is a
group of two real buttons, the chosen one pressed. Without the switch,
the scene has no `data-variant` anywhere; with it, every `data-variant`
in the scene names one of its two identifiers.

### Realism and honesty

The surfaces are the screens the reader knows from work: an issue form
and the rendered issue page, a CI log, a chat window, a terminal, a mail
client. A reader recognises in a few seconds where a scene plays. There
are no abstract metaphors, no diagrams of boxes and no figures standing
for systems.

A surface is recognisable but not a copy: no logos, no brand fonts, no
brand names on the surface; names of accounts, repositories, bots and
hosts are generic and invented (`example/app`, `helpful-dev42`); the
frame carries the label from the interface texts that marks the stage as
an illustration. Secrets and tokens are masked wherever they appear, in
the form `ghs_••••3fA`. The scene states no numbers as facts: no counts,
amounts or dates of the case beyond what its source states; issue
numbers, timestamps and version strings on the surfaces are props and
are visibly generic like the names.

The scene shows either a documented case or a constructed scenario, as
`article-writing.md` defines them for the case from practice. A
documented case is a case a public source describes, played with generic
names in place of the real ones and only with the facts the source
states; the article names the source in the text next to the figure and
lists it in `sources` with its `url`. A constructed scenario is realistic
in the same way, with generic roles and no real companies, products,
people, dates or figures, and is marked where it begins: the marker
sentence `article-writing.md` prescribes for the language stands as the
first line of the caption of the first chapter, before the core
statement, so no reader takes the scene for a report. Which of the two
a scene shows is fixed by the article spec.

The attacker does something concrete and visible on a surface: writes an
issue, sends a mail, pushes a commit. Nothing happens "by magic", and
nothing happens off stage.

The article text around the animation orders it into the article and
does not repeat the chapters. The captions carry the steps; the prose
says what they mean.

### Rendering without JavaScript

The committed page holds the storyboard: the complete figure, readable
without any script. From top to bottom:

1. For each chapter, in order: a frame with the address of the chapter
   and the illustration label, and inside it the panel of the chapter in
   its end state: every cue's element as its end state column above
   says, the interactive moment's element in the end state of its kind:
   the raw layer of the lens fully visible, both states of a comparison
   one after the other with their labels, the covered layer of an
   uncovering uncovered. A chapter the switch
   changes shows both panels one after the other, each preceded by the
   label of its variant as a short muted line.
2. Under each frame, the caption of the chapter with the chapter number in
   a filled circle before it; for a chapter with two variants, the caption
   of each variant under its panel.

Elements that end hidden (`hide`, `show` with `data-for`) are hidden by
the stylesheet on their attributes, not by script. The controls do not
exist without JavaScript; there is nothing to control. The switch's markup
stands in the figure for the player, but the stylesheet hides it without
JavaScript: its variant labels never appear as loose text, the variant
label before each panel is what the storyboard shows of the variants.
The figure carries no script tag, no JSON copy of its texts and no
control in the committed markup. A reader with JavaScript off, a search
engine and a screen reader without the player all read the storyboard,
and the storyboard is the acceptance test of the scene before anything
moves.

### Player

A module `player.js` next to `engagement.js` under `html/assets/js/`
plays the figure. The article template loads it through the page
skeleton's scripts block only when the article has a scene; pages without
one load nothing new. The player reads the figure from the document, not
from data of its own, and adds the frame, the controls and the chrome of
the interactive moment (the lens ring, the state buttons, the fallback
button); the texts stay where the storyboard put them.

With JavaScript, the player turns the storyboard into the stage:

- One frame instead of one per chapter: a window-like box with three
  neutral dots, the address field, the illustration label at the right
  edge, the stage below it and the control bar at its bottom. The stage
  shows the panel of the current chapter and variant; the other panels
  are hidden. The variant labels of the storyboard are hidden.
- The control bar holds, from left to right: the play button, the chapter
  bar, and the switch when the scene has one. The play button shows play,
  pause or replay depending on the state and carries the matching label
  from the interface texts as its accessible name. The chapter bar is a
  list of one button per chapter with the chapter number and its label
  over a thin progress track; the track of the current chapter fills with
  the elapsed time, earlier chapters are full, later ones empty, and the
  current chapter is marked as current. The fill is the accent colour, or
  the alarm colour for a chapter whose shown panel carries `data-harm`.
- The caption under the frame shows the caption of the current chapter
  and variant with the chapter number in its circle, in a live region
  that announces politely when the chapter changes. Under the caption,
  indented to its text, stands the control of the interactive moment, in
  the moment's chapter only. In the other chapters the space collapses:
  the control stands outside the frame, so the stage does not move, and
  the content below the figure already shifts with the height of each
  caption.

States and transitions:

- Before the first play, the stage shows the first chapter at the start of
  its cues: the end state is not spoiled, the frame is not empty.
- Playback starts on its own once when the figure has scrolled into view,
  at least a third of it. It pauses while the figure leaves the view or
  the tab is hidden and resumes when the figure is back, only if it was
  playing before. Nothing is tied to the scroll position beyond that: no
  scrollytelling, no progress by scrolling.
- Playing runs the chapter's cues at their times and advances to the next
  chapter when the duration is over, resetting the cues of the new chapter
  to their start states. After the last chapter the player stops: the
  last end state stays, the chapter bar is full and the play button
  becomes the replay button. Nothing loops; replay starts the first
  chapter from the beginning and a new playback, so the interactive
  moment's demonstration runs again.
- Pause freezes the current chapter where it is; play resumes it.
- A click on a chapter starts that chapter from its beginning and plays,
  with one exception: the interactive moment's chapter, once its
  demonstration has run in this playback, is shown in its end state and
  the player paused, as the interactive moment section says. A click on a
  variant selects it and starts the first chapter with variant-specific
  content, as the switch section says.
- Taking the interactive moment (a pointer over the lens, a flip of a
  comparison, an uncovering) pauses the player on that chapter; the player
  stays paused when the reader lets go, and play resumes the chapter where
  it stands.
- A press on the fallback button pauses the player on the moment's
  chapter in the end state of its kind; a second press returns the
  element to its start state and leaves the player paused there.
- When the chapter changes while a control of the interactive moment has
  the focus, the focus moves to the button of the new current chapter in
  the chapter bar, so it never falls back to the page; playback is not
  stopped by it.

There is no usage hint anywhere: no text that explains the controls. If
the controls need an explanation, they are wrong.

### Reduced motion

When the reader's system asks for reduced motion, the player still
builds the frame and the controls, but:

- nothing plays on its own: no autoplay, and the figure's scrolling into
  view changes nothing;
- the stage shows the end state of the current chapter at once, and a
  click on a chapter shows that chapter's end state; the interactive
  moment stands in its end state in its chapter, and the fallback
  control, shown in that chapter only as in playback, toggles it;
- play steps through the chapters' end states at the chapter durations
  without running any cue, so the reader who presses play gets a slide
  show, not a film;
- the element does not react to pointer, click or touch; the fallback
  button is the interaction.

Without JavaScript nothing moves anyway: the storyboard is the reduced
version of itself.

### Design

The animation uses the light editorial style of the article pages per
spec 003: the light background, the page's sans font for captions,
labels and buttons, the accent of the light pages for the chosen and the
intended. The dark organic look of the start page is not used.

The frame is white with a thin light border and rounded corners and
casts a soft shadow, as `PromptInjectionPlayer.dc.html` shows it. It is
exactly as wide as the article's text column, the 760 px of the article
body per spec 003, never wider, and takes the full content width on
narrow viewports. The stage is between 440 and 500 px high, scaled with
the viewport width in between. The surface of a chapter fills the stage in
height: an editor stretches its body field, an issue page and a log fill
the area, so no empty band remains under a surface. Where a surface's
content is taller than the stage, the surface scrolls inside the stage;
the stage does not grow.

The illustration label from the interface texts stands at the right edge
of the address bar in both renderings, the storyboard's frames and the
player's frame; a frame without it is a defect.

The chapter bar gives every chapter the room of its label: at 760 px
viewport width and above no label is truncated. When the chapters and
the switch do not fit in one line, the switch moves to a line of its own
under the chapters; the chapters never shrink to make room for it. On
phones the surfaces reflow inside the stage (a log drops its timestamp
column, an issue page stacks), the chapter labels may truncate with an
ellipsis, and the chapter bar stays operable; there is no separate mobile
logic.

Colours follow one semantics: red only for what is malicious and for its
effects (the smuggled instruction, the attacker's lines in the log, the
leaked secret, the comment that carries it), blue for what is intended
(the developer's instruction, the countermeasure, the blocked call under
protection), everything else neutral. A surface keeps its own look where
that strengthens recognition: a CI log is dark with the colours a log has,
an issue page is light with the greys and greens such pages have, the
surface chrome is in the system UI font so it looks like the reader's
own windows. Reading text on a surface has the size the real surface
gives it. The caption and every text the reader must read outside the
surfaces are in the sans font at reading size, 16 px or more. Monospace
is used only for code, logs and raw text.

The lens is a circle of 140 to 180 px diameter. Its ring is a 2 px
border in the accent colour at 70 percent opacity, with a soft glow of
6 px outside it in the accent colour at low opacity and a light shadow,
as `PromptInjectionPlayer.dc.html` shows it; a fully opaque 3 px border
reads as a drawn circle, not as glass. Inside the circle the raw layer is
visible on its cream ground, clipped to the circle; outside it the
rendered layer remains. Two thin arcs without a face are not a lens.

In the raw layer the part the surface hides stands as a block of its
own: on a line of its own, with the light alarm tint as background, the
text in the alarm colour, a small padding and rounded corners, as the
design component shows it. Red text alone on the cream ground does not
read as revealed code.

The state buttons of a comparison use the pill shape of the switch in
neutral colours, the pressed state white, with no red or blue: both
states are the same surface, neither is the attack. The two state buttons
stand side by side while both labels fit in one line; when they do not,
they stand one under the other, each as wide as the group, and the group
becomes a rectangle with the corner radius of the pill's ends. A label
never breaks inside its button. The cover of an
uncovering is drawn as the real surface draws it, a black bar on a
document, a fold line in a log, a masked field in a form, so the reader
recognises that something is covered before anything moves. The fallback
button of every kind shares one style.

The chapter bar, the play button, the switch and the fallback button are
in the control style of the design: light grey bar, round white play
button, pill-shaped switch with the chosen variant white and coloured by
its meaning (red for the exposed variant, blue for the protected one),
monospace chapter labels. The surface styles live in the stylesheet,
named by the kind of surface (issue page, CI log), so a later scene on the
same kind of surface reuses them and a new kind adds its styles once.

A surface is recognised by the elements the real page has. Each kind
carries at least these, in the language of the article, with generic
texts the article spec fixes:

- Issue editor: a heading ("Neues Issue"), the line with the signed-in
  account, the title field, the tabs for writing and preview with the
  writing tab active, a body field that takes the remaining height, and
  the green submit button at the bottom right.
- Rendered issue page: the title with the issue number, the green "open"
  badge, the line saying who opened the issue and when, an avatar circle
  with initials, and the comment box with its header line (account,
  "commented" and a relative time) above the body.
- Log, CI or agent: a header line with the name of the job or agent and
  its state or identity, below it the lines in monospace on a dark
  ground, each with a line number or a generic timestamp column that
  drops on phones.
- Prompt surface: a label line that names the surface as the prompt to
  the model, and one block per origin, each with a small uppercase label
  naming where the block comes from.
- Mail client: a folder column with the inbox selected, the message list
  with sender, subject and relative time per row and the selected row
  marked, and a reading pane with the `Von`, `An` and `Betreff` lines above
  the body.
- Assistant chat: a header line naming the assistant and the signed-in
  account, the conversation with the user's message and the assistant's
  answer, a sources bar under the answer listing each retrieved item with
  its origin, and the input field with its send button at the bottom. Where
  a chapter shows how the client treats external content, a configuration
  line and a status strip stand between the answer and the input field.

A new kind of surface adds its list here with the spec change that
introduces it.

### Accessibility

- Every control is a real `<button>`, reachable and operable by keyboard,
  with a touch target of at least 44 px in each direction: the play
  button, each chapter button, each variant button and the fallback
  button. The design component draws some of them smaller; this spec
  sets the minimum. The controls of the interactive moment are hidden
  outside its chapter, as the interactive moment section says, and the
  focus never falls back to the page when they disappear.
- The figure carries the `aria-label` the scene gives it; the caption is a
  live region with polite announcements; the chapter list and the switch
  group carry labels from the interface texts; the current chapter is
  marked as current and the chosen variant as pressed.
- At any moment the document contains the text of every chapter: hidden
  panels are hidden visually and from assistive technology, but nothing
  is removed, so the storyboard remains the content.
- The stage holds text as HTML, never on a canvas.
- Reduced motion is honoured as the section above says.

### Checks in the build

`just build` fails, with the file and the reason, when:

- a scene file exists and the article has no `[animation]` line, or the
  line exists and no scene file does;
- the scene has fewer than four or more than six chapters;
- a chapter lacks `data-label`, `data-duration` or `data-address`, or its
  duration is below 7000 or above 11000;
- a chapter has no panel, or has panels with `data-variant` and panels
  without, or lacks a caption for a variant it shows, or has two captions
  for the same variant, or a caption does not start with a `<strong>`,
  allowing one `<span data-scenario>` before it in the captions of the
  first chapter only;
- the scene has no element with `data-aha` or more than one, or its value
  is not one of `lens`, `compare` and `reveal`, or the element lacks
  `data-at` or `data-for`;
- a `lens` has no `data-raw` child; a `compare` does not have exactly two
  `data-state` children, or one of them lacks `data-label`, or its
  `data-for` is below 4000; a `reveal` has no `data-covered` child, or its
  `data-for` is outside 1000 to 2000;
- the scene has a switch without exactly two variants, or a
  `data-variant` value that is not one of them, or `data-variant` values
  without a switch;
- a cue has an unknown effect, lacks `data-at`, lacks `data-for` where
  the effect needs it, overlaps another cue of the same chapter and
  variant, or ends later than three seconds before the chapter's
  duration;
- a `type` element's text exceeds 180 characters;
- the scene contains `<script>`, `<style>`, a `style` attribute,
  `<canvas>` or `<img>`.

The checks run on the rendered scene, so the macros of the player's
template are checked with it.

### What this version drops

- The `animation` field in the front matter with `case`, `source` and
  `steps`, and the build checks on it. The scene file carries what the
  steps carried, and the article spec and `sources` carry the case.
- The ordered step list as the figure, the stage of actor boxes and
  arrows, and the kinds `action`, `injection` and `effect`.
- `animation.js` as the list player. The chapter player is `player.js`.
- The marker sentence as the first line of the figure; for a constructed
  scenario it stands in the first caption instead.
- The rule that each language version carries its own steps: it carries
  its own scene instead.
- The `[animation]` line stays as the position of the figure, but no
  longer pairs with a front matter field; it pairs with the scene file.

### Sequence of implementation

Each scene is built in the order `ANIMATION.md` sets, and this spec's
player comes into being with the first scene:

1. Spec: the article spec of the article names the audience, the core
   statement in one sentence, the source of the case or that the scenario
   is constructed, the chapters with
   their labels and captions, the interactive moment and the
   countermeasure of the switch.
2. Storyboard: the scene file is written without cues, built and viewed
   as the committed page shows it without JavaScript. It is checked for
   whether the sequence is understood without movement before any cue is
   written.
3. Animation: the cues, the interactive moment and the switch are added
   to the confirmed storyboard; for the first scene, the player, its
   template and the styles are written with it, and a kind the player
   does not yet implement is implemented with the first scene that uses
   it. The storyboard stays the fallback.
4. Review: the finished animation is checked against the review checklist
   of `ANIMATION.md`, ideally by someone who does not know the attack. The
   checklist reaches the project's rules through a rule change after this
   spec, not through this spec.

## Constraints

- The storyboard is the content. Markup and texts of the figure are
  complete in the committed `html/` before any script runs; the player is
  never needed to read the sequence.
- Rendering stays deterministic and offline, as spec 003 requires; the
  player is a static file without dependencies, loaded only on article
  pages that have a scene.
- The content security policy of the web server stays as it is: the
  player sets what it has to change through the CSSOM and classes, the
  scene carries no inline script and no inline style.
- The design files hold no design for article pages beyond this
  animation (spec 003). The figure uses the type and colours of the light
  page, the surfaces their own looks as above, nothing from the dark theme.
- The walkthrough on the start page is not touched: `engagement.js`,
  `engagement.json` and the start page template stay as they are.
- Address, title, alternates, language links and sitemap entry of an
  article do not change because it has an animation.
- The chapters, captions, interactive moment, switch and surfaces of an
  article are fixed by its article spec, as the case from practice is;
  this spec fixes only the format and the mechanics. An article file
  without a spec gets no scene until its spec exists.
- The player implements a kind when the first scene uses it, not ahead
  of it; until then the kind exists in this spec and in the build checks
  only. The lens is implemented with the prompt injection scene.
- The rules for authors this spec implies (what a caption says, how the
  article text relates to the animation, the review checklist, the
  sources of a scene) belong in `article-writing.md` and reach it through
  a rule change after this spec is approved, derived from parts B and C of
  `ANIMATION.md`, not through this spec.

## Out of scope

- Animations on the overview or on the start page; the walkthrough is a
  different thing with its own data and player.
- A kind of interactive moment outside the list of three, a further
  effect, a switch with
  more than two variants, more than one animation per article, sound,
  images, and a figure position other than the `[animation]` line. Each
  is a later change to this spec if wanted.
- The scene of any particular article. The prompt injection scene that
  `PromptInjectionPlayer.dc.html` shows is specified by the article spec
  of that article, which does not exist yet; the first scene to be built
  is the acceptance run of this spec, not its deliverable.
- The author rules in `article-writing.md` and the review checklist as a
  rule; they follow as a rule change.
- The registry type of scene files: whether `article` is widened to cover
  them or a type of their own is added is decided with the first scene's
  registry row.

## Acceptance

1. An article with a scene file and the `[animation]` line renders a
   figure at the line's position: the storyboard with one frame per
   chapter, address and illustration label on each frame, the panel in
   its end state, the numbered caption under each frame, both variants of
   a switched chapter one after the other with their variant labels, for
   a constructed scenario the marker sentence as the first line of the
   first caption, no control and no script in the figure's markup, no
   visible text of the switch, and the Markdown before and after the line
   rendered as before.
2. `just build` fails for each condition in the checks section, with a
   scene that violates exactly that condition.
3. An article without a scene file renders exactly as before: no figure,
   no player script. `just check-generated` passes for the existing
   articles.
4. In a browser with JavaScript and without reduced motion, the figure
   shows one frame with address, illustration label, stage and control
   bar, the caption under it; the frame is as wide as the article's text
   column and shows the illustration label at the right edge of its
   address bar; each surface fills the stage in height; the first chapter
   stands at its start when
   the page loads; once a third of the figure is in view the chapters
   play one after another with their cues at their times, the progress
   fills, the caption changes with the chapter; after the last chapter
   the player stops and the play button becomes replay; replay starts at
   the first chapter; scrolling the figure out of view pauses it and back
   into view resumes it.
5. A click on a chapter button starts that chapter; a click on a variant
   starts the first variant-specific chapter in that variant and shows
   its panel and caption; the interactive moment demonstrates itself as
   its kind says (for the lens: it moves across its element on its own
   and widens to the full raw layer) and afterwards obeys the reader (the
   lens follows the mouse and the finger); the fallback button toggles the
   end state and pauses the player on that chapter.
6. With reduced motion requested, nothing plays on its own; chapter
   buttons show end states; play steps through end states; the
   interactive moment stands in its end state and the fallback button,
   shown in the moment's chapter only, toggles it. With JavaScript disabled
   the storyboard of acceptance 1 is what the reader sees.
7. Every control is a `<button>` with a touch target of at least 44 px
   and an accessible name; the figure carries the scene's `aria-label`;
   the caption is a polite live region; at any moment during playback the
   document contains the text of every chapter.
8. At 360 px viewport width the frame fills the content width, the stage
   keeps its height range, the surfaces reflow, and the chapter bar and
   the switch are operable.
9. The sitemap entries, alternates and language links of an article with
   a scene are identical to those of the same article without one.
10. Spec 003 names the animation as the exception to its JavaScript
    constraint and to its "text, code and tables".
11. At 760 px viewport width and above no chapter label is truncated;
    where the switch does not fit beside the chapters it stands in a line
    of its own under them.
12. In a scene whose interactive moment is the lens, the lens is a circle
    with a 2 px accent ring at 70 percent opacity, a soft glow around it and a shadow, the raw layer on its cream ground
    inside it and the rendered layer outside; in the raw layer the hidden
    part stands as a block of its own with the light alarm tint, the alarm
    colour and rounded corners; the demonstration travels across the full
    width of the element at the height of the hidden part before it
    widens; the raw layer is never cut off when fully revealed.
13. Every surface shows the required elements of its kind as the design
    section lists them.
14. After the last cue of each chapter the surface stands still for at
    least three seconds; a typed text over 180 characters fails the
    build; a typed line break renders as a break without leading
    indentation.
15. In a scene whose interactive moment is the lens, in the lens's
    chapter, moving the mouse or a finger over the element
    while the demonstration runs takes the lens over at once and the
    demonstration does not resume; moving the lens pauses the player on
    that chapter and the play button shows the paused state; after the
    pointer leaves, the raw layer is fully revealed and the player stays
    paused until play is pressed; selecting the chapter again from the
    chapter bar after it has played shows the raw layer fully without a
    new demonstration, and replay runs the demonstration again.
16. In the first scene that uses `compare`, the element flips to the
    second state, back and to the second again during `data-for`, a click
    or tap and the state buttons flip it, the shown state is pressed, and
    flipping pauses the player; in the first scene that uses `reveal`,
    the cover dissolves over `data-for`, a click or tap and the fallback
    button toggle it, and uncovering pauses the player. Before such a
    scene exists, acceptance 2 is the acceptance of these kinds.
17. For every kind (lens, compare, reveal), the controls of the
    interactive moment stand under the caption only while the moment's
    chapter is current, with JavaScript, with and without reduced motion;
    in the other chapters they are neither visible nor reachable by Tab
    nor exposed to assistive technology, the space collapses and the
    stage does not move. When the chapter changes while such a control
    has the focus, the focus stands on the current chapter's button in
    the chapter bar. At 390 px viewport width the state buttons of a
    comparison stand in one line or one under the other at equal width,
    with no label broken inside its button. Checked in the scenes of
    prompt injection (lens) and sensitive information disclosure
    (compare); for reveal with its first scene, until then by
    acceptance 2.

## Touches

Orientation for the implementation, not an instruction: the generator
(`build.py`: find the scene file, split the body at the line, render the
scene through the player's macros, run the checks, including the checks on
the kind of the interactive moment and its children), the article template
(the figure and the scripts block), a new player template with the macros
next to the other templates, the stylesheet (frame, control bar, chapter
bar, caption, lens, cue states, and the surface styles of the first
scene), a new player module under `html/assets/js/`, the interface texts
(play, pause, replay, chapter list label, variant group label,
illustration label, the two labels of the lens's fallback button and,
with the first scene that uses `reveal`, the two labels of its button;
content files, changed on explicit instruction), the player's macros for
`compare` and `reveal` with their styles and player code, written with the
first scene that uses them, `article-writing.md` (author rules and
checklist, a rule change under `rule-analysis.md`), spec 003 (wording of
its references to this spec) and the registry: the `.js` extension, a row
for the player module, a row for the player template and, with the first
scene, a row and a type decision for the scene file.
