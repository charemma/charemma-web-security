// Article animation player, spec 006. Turns the committed storyboard of a
// figure[data-animation] into a chaptered stage with controls, driven only by
// the markup the scene carries. The storyboard stays the fallback: without
// this script the figure reads as a static sequence of frames.
//
// This file is built in the order the spec sets. Core here: the frame, the
// control bar, the chapter bar, play/pause/replay, autoplay on view, pause off
// view, and reduced motion. Cues, the interactive moment (lens, comparison)
// and the switch are added on top.

const FIGURE = 'figure[data-animation]';
const ENHANCED = 'anim--js';
const VIEW_FRACTION = 0.34;
const CUE_FIXED = 500;
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

// Typing preserves nested markup: the full node tree is captured once, then
// rebuilt truncated to the first n visible characters.
function captureFull(node) {
  if (!node._full) {
    node._full = [...node.childNodes].map((child) => child.cloneNode(true));
    node._len = node.textContent.length;
  }
}

function truncate(node, left) {
  if (node.nodeType === Node.TEXT_NODE) {
    const take = Math.max(0, Math.min(node.data.length, left.n));
    left.n -= node.data.length;
    return document.createTextNode(node.data.slice(0, take));
  }
  const copy = node.cloneNode(false);
  node.childNodes.forEach((child) => copy.append(truncate(child, left)));
  return copy;
}

function renderTyped(node, n) {
  captureFull(node);
  node.textContent = '';
  const left = { n };
  node._full.forEach((child) => node.append(truncate(child, left)));
}

function setOff(node, off) {
  node.classList.toggle('anim-off', off);
}

// Apply one cue at time t (ms into the chapter). Idempotent, so it serves
// playback, pause, seeking and the start and end states alike.
function applyCue(cue, t) {
  const { node, effect, at } = cue;
  const span = cue.dur ?? CUE_FIXED;
  const pending = t < at;
  const done = t >= at + span;
  const frac = pending ? 0 : done ? 1 : (t - at) / span;
  switch (effect) {
    case 'type':
      captureFull(node);
      renderTyped(node, Math.round(frac * node._len));
      node.classList.toggle('anim-caret', frac > 0 && frac < 1);
      break;
    case 'lines': {
      const kids = [...node.children];
      const shown = Math.round(frac * kids.length);
      kids.forEach((kid, i) => kid.classList.toggle('anim-pending', i >= shown));
      break;
    }
    case 'show':
      setOff(node, cue.dur ? !(t >= at && !done) : pending);
      break;
    case 'hide':
      setOff(node, t >= at);
      break;
    case 'swap':
      node.classList.toggle('anim-swapped', t >= at);
      break;
    case 'press':
      node.classList.toggle('is-pressed', t >= at && !done);
      break;
    case 'merge':
      node.classList.toggle('anim-apart', pending);
      break;
    default:
      break;
  }
}

function el(tag, cls, parent) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (parent) parent.append(node);
  return node;
}

function readLabels() {
  const host = document.querySelector('.anim-i18n');
  return host ? { ...host.dataset } : {};
}

// The variant a chapter shows for the current selection: the matching panel,
// or the lone panel of a chapter the switch does not touch.
function panelFor(chapter, variant) {
  return (
    chapter.panels.find((p) => p.dataset.variant === variant) ||
    chapter.panels.find((p) => !p.dataset.variant) ||
    chapter.panels[0]
  );
}

function captionFor(chapter, variant) {
  return (
    chapter.captions.find((c) => c.dataset.variant === variant) ||
    chapter.captions.find((c) => !c.dataset.variant) ||
    chapter.captions[0]
  );
}

function model(figure) {
  return [...figure.querySelectorAll('[data-chapter]')].map((section) => ({
    section,
    label: section.dataset.label,
    duration: Number(section.dataset.duration),
    address: section.dataset.address,
    panels: [...section.querySelectorAll('[data-panel]')],
    captions: [...section.querySelectorAll('[data-caption]')],
  }));
}

function firstVariant(figure) {
  const span = figure.querySelector('[data-switch] [data-variant]');
  return span ? span.dataset.variant : null;
}

function buildFrame(figure, labels) {
  const bar = el('div', 'anim-frame__bar');
  const dots = el('span', 'anim-frame__dots', bar);
  for (let i = 0; i < 3; i += 1) el('i', null, dots);
  const address = el('span', 'anim-frame__addr', bar);
  const illus = el('span', 'anim-frame__illus', bar);
  illus.textContent = labels.illustration || '';
  return { bar, address };
}

function buildControls(chapters, labels) {
  const controls = el('div', 'anim-controls');

  const play = el('button', 'anim-play', controls);
  play.type = 'button';

  const bar = el('div', 'anim-chapters', controls);
  bar.setAttribute('role', 'group');
  if (labels.chapters) bar.setAttribute('aria-label', labels.chapters);
  const buttons = chapters.map((chapter, i) => {
    const button = el('button', 'anim-chapter', bar);
    button.type = 'button';
    const head = el('span', 'anim-chapter__head', button);
    el('span', 'anim-chapter__n', head).textContent = String(i + 1);
    el('span', 'anim-chapter__label', head).textContent = chapter.label;
    const track = el('span', 'anim-chapter__track', button);
    const fill = el('span', 'anim-chapter__fill', track);
    return { button, fill };
  });

  return { controls, play, buttons };
}

function create(figure) {
  const labels = readLabels();
  const chapters = model(figure);
  if (chapters.length === 0) return;

  const frame = buildFrame(figure, labels);
  const { controls, play, buttons } = buildControls(chapters, labels);
  const caption = el('div', 'anim-caption');
  caption.setAttribute('aria-live', 'polite');

  // Assemble the window box: bar, the chapter stages, the control bar. The
  // caption sits under the box, outside it.
  const box = el('div', 'anim-frame');
  box.append(frame.bar);
  chapters.forEach((chapter) => box.append(chapter.section));
  box.append(controls);
  figure.append(box, caption);
  figure.classList.add(ENHANCED);

  const state = {
    index: 0,
    variant: firstVariant(figure),
    playing: false,
    done: false,
    elapsed: 0,
    last: 0,
    raf: 0,
    autostarted: false,
  };

  function harmful(chapter) {
    return panelFor(chapter, state.variant)?.hasAttribute('data-harm');
  }

  function cuesFor(chapter) {
    const panel = panelFor(chapter, state.variant);
    if (!panel) return [];
    return [...panel.querySelectorAll('[data-cue]')].map((node) => ({
      node,
      effect: node.dataset.cue,
      at: Number(node.dataset.at),
      dur: node.dataset.for ? Number(node.dataset.for) : null,
    }));
  }

  // The time used for painting: the real elapsed while playing, the full
  // duration once the chapter is done or under reduced motion (end state).
  function effectiveElapsed(chapter) {
    if (reduced.matches || state.done) return chapter.duration;
    return state.elapsed;
  }

  function paintCues(chapter) {
    const t = effectiveElapsed(chapter);
    state.cues.forEach((cue) => applyCue(cue, t));
  }

  function frameUpdate(chapter) {
    renderControls(chapter);
    paintCues(chapter);
    maybePaintMoment();
  }

  // The interactive moment (spec 006): one element with data-aha naming its
  // kind. Its demonstration runs the first time its chapter plays within a
  // playback; taking the element stops the demonstration and pauses the
  // player on the chapter. seen: the demonstration has started in this
  // playback, so a return to the chapter shows the end state and waits.
  // over: the demonstration has finished or the reader took the element.
  const ahaEl = figure.querySelector('[data-aha]');
  const ahaKind = ahaEl ? ahaEl.dataset.aha : null;
  const ahaIdx = ahaEl ? chapters.findIndex((c) => c.section.contains(ahaEl)) : -1;
  const ahaAt = ahaEl ? Number(ahaEl.dataset.at) : 0;
  const ahaDur = ahaEl ? Number(ahaEl.dataset.for) : 0;
  const demo = { seen: false, over: false };

  // The lens: a round reveal of the raw layer. The pointer takes precedence
  // at any time. A fallback button under the caption toggles the full raw
  // layer for keyboard and screen reader. Reduced motion shows the raw layer
  // and lets the button toggle it, with no pointer follow.
  const lensEl = ahaKind === 'lens' ? ahaEl : null;
  const lensIdx = lensEl ? ahaIdx : -1;
  const lensRaw = lensEl ? lensEl.querySelector('[data-raw]') : null;
  const lensAt = ahaAt;
  const lensDur = ahaDur;
  // 160 px diameter, within the 140 to 180 px the spec sets; the
  // demonstration spends two thirds of its time travelling across the
  // element at the height of the hidden part, like a gaze reading the
  // line, and the last third widening until the raw layer is fully shown.
  const LENS_RADIUS = 80;
  const LENS_TRAVEL = 2 / 3;
  const LENS_EDGE = 0.08;
  const LENS_DIP = 0.2;
  const lensMark = lensRaw ? lensRaw.querySelector('.anim-mark') : null;
  const pointer = { active: false, x: 0, y: 0 };
  let revealed = lensEl ? reduced.matches : false;
  let lensRing = null;
  let lensButton = null;

  function lensClip(spec) {
    if (lensRaw) lensRaw.style.clipPath = spec;
    if (lensRing) lensRing.style.display = spec === 'none' || spec.startsWith('circle(0') ? 'none' : 'block';
  }
  function lensRingAt(x, y, r) {
    if (!lensRing) return;
    lensRing.style.left = `${x}px`;
    lensRing.style.top = `${y}px`;
    lensRing.style.width = `${r * 2}px`;
    lensRing.style.height = `${r * 2}px`;
    lensRing.style.opacity = r > LENS_RADIUS * 2.5 ? '0' : '1';
  }
  // The height the demonstration travels at: the centre of the part the
  // surface hides, or the middle of the element when nothing is marked.
  function lensLineY(h) {
    if (!lensMark) return h / 2;
    const box = lensEl.getBoundingClientRect();
    const mark = lensMark.getBoundingClientRect();
    return mark.top - box.top + mark.height / 2;
  }
  // The demonstration's path: a flat arc from the left edge to the right
  // edge of the element, dipping a little below the line in the middle.
  function lensPath(a, w, h) {
    const y = lensLineY(h);
    const dip = Math.min(h * LENS_DIP, LENS_RADIUS / 2);
    return { x: w * (LENS_EDGE + (1 - 2 * LENS_EDGE) * a), y: y + dip * Math.sin(a * Math.PI) };
  }
  function ease(x) {
    return 0.5 - 0.5 * Math.cos(Math.PI * x);
  }
  function lensCircle(x, y, r) {
    lensClip(`circle(${r}px at ${x}px ${y}px)`);
    lensRingAt(x, y, r);
  }
  function lensFull() {
    lensClip('none');
  }
  function lensNone() {
    lensClip('circle(0px at 0px 0px)');
  }

  function paintLens(t) {
    if (!lensEl) return;
    if (revealed) {
      lensFull();
      return;
    }
    if (reduced.matches) {
      lensNone();
      return;
    }
    if (pointer.active) {
      lensCircle(pointer.x, pointer.y, LENS_RADIUS);
      return;
    }
    if (demo.over) {
      lensFull();
      return;
    }
    if (t < lensAt) {
      lensNone();
      return;
    }
    demo.seen = true;
    if (t < lensAt + lensDur) {
      const p = (t - lensAt) / lensDur;
      const w = lensEl.clientWidth || 1;
      const h = lensEl.clientHeight || 1;
      if (p < LENS_TRAVEL) {
        const at = lensPath(ease(p / LENS_TRAVEL), w, h);
        lensCircle(at.x, at.y, LENS_RADIUS);
      } else {
        const end = lensPath(1, w, h);
        const a = ease((p - LENS_TRAVEL) / (1 - LENS_TRAVEL));
        lensCircle(end.x, end.y, LENS_RADIUS + a * Math.hypot(w, h));
      }
      return;
    }
    demo.over = true;
    lensFull();
  }

  // The comparison: the same region of a surface in two states, the first
  // shown at first. The demonstration flips to the second state at data-at,
  // back at the midpoint of data-for and to the second again at its end,
  // where it stays; each flip is the crossfade of swap, in the stylesheet.
  // A click or tap on the element flips it, and so do two state buttons
  // under the caption, which are also the keyboard and screen reader
  // fallback: they take the player to the chapter, paused. Under reduced
  // motion the element stands in its end state and only the buttons flip it.
  const compareEl = ahaKind === 'compare' ? ahaEl : null;
  const compareStates = compareEl ? [...compareEl.children].filter((c) => c.hasAttribute('data-state')) : [];
  const COMPARE_FIRST = 0;
  const COMPARE_SECOND = 1;
  // The state the reader or the buttons chose; null while the demonstration
  // or the end state decides.
  let compareChosen = null;
  let compareButtons = [];

  function compareDemoState(t) {
    if (t < ahaAt) return COMPARE_FIRST;
    demo.seen = true;
    if (t < ahaAt + ahaDur / 2) return COMPARE_SECOND;
    if (t < ahaAt + ahaDur) return COMPARE_FIRST;
    demo.over = true;
    return COMPARE_SECOND;
  }

  function compareShownState() {
    return compareEl.classList.contains('is-second') ? COMPARE_SECOND : COMPARE_FIRST;
  }

  function paintCompare(t) {
    let shown;
    if (compareChosen != null) shown = compareChosen;
    else if (reduced.matches || demo.over) shown = COMPARE_SECOND;
    else shown = compareDemoState(t);
    compareEl.classList.toggle('is-second', shown === COMPARE_SECOND);
    compareStates.forEach((stateEl, i) => stateEl.setAttribute('aria-hidden', i === shown ? 'false' : 'true'));
    compareButtons.forEach((button, i) => button.setAttribute('aria-pressed', i === shown ? 'true' : 'false'));
  }

  // Taking the comparison: show the chosen state, stop the demonstration for
  // this playback and hold the chapter by pausing the player.
  function takeCompare(target) {
    if (state.index !== ahaIdx) enter(ahaIdx);
    demo.seen = true;
    demo.over = true;
    compareChosen = target;
    if (state.playing) pause();
    else render();
  }

  function setupCompare() {
    if (!compareEl) return;
    const host = el('div', 'anim-aha');
    const group = el('div', 'anim-compare', host);
    group.setAttribute('role', 'group');
    compareButtons = compareStates.map((stateEl, i) => {
      const button = el('button', 'anim-compare__btn', group);
      button.type = 'button';
      button.textContent = stateEl.dataset.label;
      button.addEventListener('click', () => takeCompare(i));
      return button;
    });
    figure.append(host);
    compareEl.addEventListener('click', () => {
      if (reduced.matches || state.index !== ahaIdx) return;
      takeCompare(compareShownState() === COMPARE_SECOND ? COMPARE_FIRST : COMPARE_SECOND);
    });
  }

  function resetDemo() {
    demo.seen = false;
    demo.over = false;
    compareChosen = null;
  }

  function maybePaintMoment() {
    if (!ahaEl || state.index !== ahaIdx) return;
    const t = effectiveElapsed(chapters[ahaIdx]);
    if (lensEl) paintLens(t);
    else if (compareEl) paintCompare(t);
  }

  function setupLens() {
    if (!lensEl) return;
    lensRing = el('span', 'anim-lens__ring', lensEl);
    lensRing.setAttribute('aria-hidden', 'true');
    lensRing.style.display = 'none';

    const host = el('div', 'anim-aha');
    lensButton = el('button', 'anim-aha__btn', host);
    lensButton.type = 'button';
    const relabel = () => {
      lensButton.textContent = revealed ? labels.rawHide || '' : labels.rawShow || '';
      lensButton.setAttribute('aria-pressed', revealed ? 'true' : 'false');
    };
    relabel();
    lensButton.addEventListener('click', () => {
      if (state.index !== lensIdx) {
        enter(lensIdx);
      }
      pause();
      revealed = !revealed;
      relabel();
      maybePaintMoment();
    });
    figure.append(host);

    // The pointer takes precedence: it stops the demonstration, holds the
    // chapter by pausing the player, and the lens follows it. Leaving the
    // element leaves the raw layer revealed and the player paused.
    function takeLens(event) {
      if (reduced.matches || revealed || state.index !== lensIdx) return;
      const rect = lensEl.getBoundingClientRect();
      pointer.active = true;
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      demo.seen = true;
      demo.over = true;
      if (state.playing) pause();
      else maybePaintMoment();
    }
    function releaseLens() {
      pointer.active = false;
      maybePaintMoment();
    }
    lensEl.addEventListener('pointerdown', takeLens);
    lensEl.addEventListener('pointermove', takeLens);
    lensEl.addEventListener('pointerleave', releaseLens);
    lensEl.addEventListener('pointercancel', releaseLens);
  }

  function renderCaption(chapter) {
    caption.textContent = '';
    const number = el('span', 'anim-caption__n', caption);
    number.textContent = String(state.index + 1);
    const text = el('div', 'anim-caption__text', caption);
    const source = captionFor(chapter, state.variant);
    text.innerHTML = source ? source.innerHTML : '';
  }

  function renderStage(chapter) {
    chapters.forEach((other, i) => other.section.toggleAttribute('hidden', i !== state.index));
    frame.address.textContent = chapter.address;
    chapter.panels.forEach((panel) => {
      panel.toggleAttribute('hidden', panel !== panelFor(chapter, state.variant));
    });
  }

  function renderControls(chapter) {
    play.setAttribute(
      'aria-label',
      state.done ? labels.replay || '' : state.playing ? labels.pause || '' : labels.play || '',
    );
    play.classList.toggle('is-play', !state.playing && !state.done);
    play.classList.toggle('is-pause', state.playing && !state.done);
    play.classList.toggle('is-replay', state.done);
    buttons.forEach(({ button, fill }, i) => {
      const ratio = i < state.index ? 1 : i > state.index ? 0 : state.elapsed / chapter.duration;
      fill.style.width = `${Math.min(1, ratio) * 100}%`;
      fill.classList.toggle('is-harm', harmful(chapters[i]) && i <= state.index);
      button.toggleAttribute('aria-current', i === state.index);
    });
    switchButtons.forEach((button, i) => {
      button.setAttribute('aria-pressed', variants[i].id === state.variant ? 'true' : 'false');
    });
  }

  function render() {
    const chapter = chapters[state.index];
    renderStage(chapter);
    renderControls(chapter);
    renderCaption(chapter);
    paintCues(chapter);
    maybePaintMoment();
  }

  function enter(index) {
    state.index = index;
    state.elapsed = 0;
    state.done = false;
    state.cues = cuesFor(chapters[index]);
    render();
  }

  function stop() {
    state.playing = false;
    state.done = true;
    cancelAnimationFrame(state.raf);
    render();
  }

  function tick(now) {
    if (!state.playing) return;
    const chapter = chapters[state.index];
    state.elapsed += now - state.last;
    state.last = now;
    if (state.elapsed >= chapter.duration) {
      if (state.index + 1 >= chapters.length) {
        state.elapsed = chapter.duration;
        stop();
        return;
      }
      enter(state.index + 1);
    } else {
      frameUpdate(chapter);
    }
    state.raf = requestAnimationFrame(tick);
  }

  function playFrom(index) {
    if (index != null) enter(index);
    if (state.done) enter(0);
    state.playing = true;
    state.last = performance.now();
    render();
    state.raf = requestAnimationFrame(tick);
  }

  function pause() {
    state.playing = false;
    cancelAnimationFrame(state.raf);
    render();
  }

  function replay() {
    resetDemo();
    playFrom(0);
  }

  function toggle() {
    if (state.done) replay();
    else if (state.playing) pause();
    else playFrom(null);
  }

  // A chapter click plays that chapter from its start, except the
  // interactive moment's chapter once its demonstration has run in this
  // playback: then it is shown in its end state and the player waits.
  function selectChapter(index) {
    if (index === ahaIdx && demo.seen) {
      demo.over = true;
      compareChosen = null;
      enter(index);
      pause();
      return;
    }
    playFrom(index);
  }

  play.addEventListener('click', toggle);
  buttons.forEach(({ button }, i) => button.addEventListener('click', () => selectChapter(i)));

  // The switch (spec 006): two real buttons, the chosen one pressed and
  // coloured by its meaning. Selecting a variant plays from the first chapter
  // that differs between the variants; the chapters before stay as they are.
  const variants = [...figure.querySelectorAll('[data-switch] [data-variant]')].map((span) => ({
    id: span.dataset.variant,
    label: span.textContent,
  }));
  let switchButtons = [];

  function firstVariantChapter() {
    return chapters.findIndex((chapter) => chapter.panels.some((panel) => panel.dataset.variant));
  }

  function selectVariant(id) {
    state.variant = id;
    const index = firstVariantChapter();
    playFrom(index < 0 ? 0 : index);
  }

  function buildSwitch() {
    if (variants.length < 2) return;
    const group = el('div', 'anim-switch', controls);
    group.setAttribute('role', 'group');
    if (labels.variants) group.setAttribute('aria-label', labels.variants);
    switchButtons = variants.map((variant, i) => {
      const button = el('button', `anim-switch__btn anim-switch__btn--${i}`, group);
      button.type = 'button';
      button.textContent = variant.label;
      button.addEventListener('click', () => selectVariant(variant.id));
      return button;
    });
  }

  buildSwitch();
  setupLens();
  setupCompare();
  enter(0);

  // Autoplay once the figure is a third in view; pause off view or on a hidden
  // tab and resume only if it was playing. Reduced motion suppresses autoplay.
  let inView = false;
  const observer = new IntersectionObserver(
    (entries) => {
      inView = entries[0].isIntersecting;
      if (inView && !state.autostarted && !reduced.matches) {
        state.autostarted = true;
        playFrom(null);
      } else if (!inView && state.playing) {
        state.wasPlaying = true;
        pause();
      } else if (inView && state.wasPlaying && !document.hidden) {
        state.wasPlaying = false;
        playFrom(null);
      }
    },
    { threshold: VIEW_FRACTION },
  );
  observer.observe(figure);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && state.playing) {
      state.wasPlaying = true;
      pause();
    } else if (!document.hidden && state.wasPlaying && inView) {
      state.wasPlaying = false;
      playFrom(null);
    }
  });

  return { state, chapters, enter, pause, playFrom, render, panelFor, labels, caption };
}

function init() {
  document.querySelectorAll(FIGURE).forEach(create);
}

init();
