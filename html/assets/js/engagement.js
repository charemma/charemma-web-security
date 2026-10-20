// Approach walkthrough for the "02 / vorgehen" section, spec 010: a particle
// swarm forms each phase of an assessment of an AI application (pipeline,
// targets, attack path, report), and the particles of every line dissolve into a drawn stroke once
// the picture stands. Values and formulas follow spec 010 one to one.

const DURATION_MS = [7600, 8200, 6800, 7600, 7400, 13000];
const INTRO_MS = 1600;
const FORM_MS = 2400;
const TYPE_INTERVAL_MS = 42;
const PROGRESS_INTERVAL_MS = 120;
const VISIBLE_FALLBACK_MS = 1200;
const VISIBLE_RATIO = 0.25;
const RESIZE_CHECK_MS = 600;
const LABEL_DELAY_MS = 1500;
const LABEL_FADE_MS = 700;
const GLASS_FADE_MS = 1600;
const EXPLOIT_STEP = 4;
const REPORT_FORM = 6;
const BUCKETS = 50;
const DEPTH = 4.2;
const MAX_PIXELS = 9e6;
const DEFAULT_REVEAL_S = 7.2;
const AGENT_LABEL = '#8fc0e8';
const AI_LABEL = '#8fc0e8';
const INFRA_LABEL = '#c0c1c1';
const LEGEND_FORMS = [2, 5];
const MONO = '"IBM Plex Mono", monospace';

// Palette: haze, agents, accent, alert, light
const PAL = [[112, 132, 150], [143, 192, 232], [38, 139, 210], [220, 50, 47], [228, 229, 229]];

/* ---------- maths ---------- */

// mulberry32
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (v) => v * v * (3 - 2 * v);

function cr(p0, p1, p2, p3, t) {
  const t2 = t * t, t3 = t2 * t;
  return [
    0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
    0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3),
  ];
}

// Control point of the quadratic curve from a to b
function ctrl(a, b) {
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1];
  const L = Math.hypot(dx, dy) || 1, sg = dy >= 0 ? 1 : -1;
  return [mx - (dy / L) * L * 0.14 * sg, my + (dx / L) * L * 0.14 * sg];
}

// Middle of the edge from a to b
function mid(a, b) {
  const q = ctrl(a, b);
  return [0.25 * a[0] + 0.5 * q[0] + 0.25 * b[0], 0.25 * a[1] + 0.5 * q[1] + 0.25 * b[1]];
}

function smoothPath(P) {
  const poly = [];
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
    for (let j = 0; j < 24; j++) { const q = cr(p0, p1, p2, p3, j / 24); poly.push([q[0], q[1], q[2] || 0]); }
  }
  const e = P[P.length - 1]; poly.push([e[0], e[1], e[2] || 0]);
  const cum = [0];
  for (let i = 1; i < poly.length; i++) cum.push(cum[i - 1] + Math.hypot(poly[i][0] - poly[i - 1][0], poly[i][1] - poly[i - 1][1], poly[i][2] - poly[i - 1][2]));
  return { poly, cum, len: cum[cum.length - 1] };
}

function pathAt(pa, f) {
  const d = clamp01(f) * pa.len;
  let i = 1;
  while (i < pa.cum.length - 1 && pa.cum[i] < d) i++;
  const a = pa.poly[i - 1], b = pa.poly[i], seg = pa.cum[i] - pa.cum[i - 1] || 1, u = (d - pa.cum[i - 1]) / seg;
  return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
}

// Share of the path length at the path point nearest to (x, y, z)
function pathFrac(pa, x, y, z) {
  let best = 1e9, bi = 0;
  for (let i = 0; i < pa.poly.length; i++) {
    const p = pa.poly[i];
    const dd = (p[0] - x) ** 2 + (p[1] - y) ** 2 + (p[2] - (z || 0)) ** 2;
    if (dd < best) { best = dd; bi = i; }
  }
  return pa.cum[bi] / pa.len;
}

/* ---------- network layout (units) ---------- */

function buildNet() {
  const n = {
    R: [-1.5, 0],
    S: [[-0.72, -0.8], [-0.72, -0.27], [-0.72, 0.27], [-0.72, 0.8]],
    H: [[0.12, -0.9], [0.12, -0.32], [0.12, 0.3], [0.12, 0.88]],
    D: [[0.95, -0.6], [0.95, 0.04], [0.95, 0.64]],
    X: [[1.7, -0.22], [1.66, 0.62]],
    P: [-1.55, -0.95],
  };
  n.T = n.H[2];
  n.edgesRS = n.S.map((p) => [n.R, p]);
  n.edgesSH = [[n.S[0], n.H[0]], [n.S[1], n.H[1]], [n.S[1], n.H[2]], [n.S[3], n.H[2]], [n.S[2], n.H[3]]];
  n.edgesHD = [[n.H[0], n.D[1]], [n.H[1], n.D[0]], [n.H[2], n.D[1]], [n.H[3], n.D[2]]];
  return n;
}

/* ---------- report ---------- */

function prepTokens(RP) {
  // split every line into tokens (words, numbers, symbols) and number them in reading order
  const re = /[A-Za-z0-9ÄÖÜäöüßΑ-Ωα-ωά-ώ]+|\s+|./g, groups = {};
  RP.lines.forEach((ln) => { (groups[ln.li] = groups[ln.li] || []).push(ln); });
  let k = 0; RP.start = []; RP.cnt = [];
  Object.keys(groups).map(Number).sort((a, b) => a - b).forEach((li) => {
    RP.start[li] = k;
    groups[li].sort((a, b) => a.x - b.x).forEach((ln) => {
      ln.toks = []; let m, ci = 0; re.lastIndex = 0;
      while ((m = re.exec(ln.text))) {
        const tx = m[0]; ci += tx.length;
        if (/\S/.test(tx)) { ln.toks.push({ start: ci - tx.length, end: ci, k }); k++; }
      }
    });
    RP.cnt[li] = k - RP.start[li];
  });
  RP.T = k;
  return RP;
}

function reportLayout(texts) {
  const P = texts.report, L = texts.labels;
  const x0 = -0.36, x1 = x0 + 1.48, y0 = -0.98, y1 = 0.98, L0 = x0 + 0.12;
  const sevC = (i) => (i < 2 ? ['#dc322f', 3] : (i < 4 ? ['#268bd2', 2] : ['#979899', 0]));
  const lines = [], W = (t, sz) => t.length * sz * 0.6;
  const T = (li, x, y, size, w, text, col, ci) => lines.push({ li, x, y, size, w, text, col, ci });
  T(0, L0, -0.8, 0.075, 700, P.title, '#e4e5e5', 4);
  T(0, x1 - 0.12 - W(P.conf, 0.034), -0.8, 0.034, 500, P.conf, '#dc322f', 3);
  T(1, L0, -0.68, 0.038, 400, P.meta, '#979899', 0);
  // severity summary
  const groups = [];
  P.rows.forEach((r, i) => { const g = groups.find((q) => q.n === r[0]); if (g) g.c++; else groups.push({ n: r[0], c: 1, i }); });
  let gx = L0;
  groups.forEach((g) => { const c = sevC(g.i), t = '■ ' + g.c + ' ' + g.n; T(2, gx, -0.48, 0.04, 500, t, c[0], c[1]); gx += W(t, 0.04) + 0.07; });
  T(3, L0, -0.3, 0.036, 500, P.cols[0], '#7d7e7f', 0);
  T(3, L0 + 0.2, -0.3, 0.036, 500, P.cols[1], '#7d7e7f', 0);
  T(3, L0 + 0.52, -0.3, 0.036, 500, P.cols[2], '#7d7e7f', 0);
  P.rows.forEach((r, i) => {
    const y = -0.14 + i * 0.17, c = sevC(i);
    T(4 + i, L0, y, 0.038, 400, r[2] || 'F-0' + (i + 1), '#979899', 0);
    T(4 + i, L0 + 0.2, y, 0.038, 700, r[0], c[0], c[1]);
    T(4 + i, L0 + 0.52, y, 0.05, 400, r[1], '#e4e5e5', 4);
  });
  T(9, L0, 0.76, 0.038, 400, P.foot, '#979899', 0);
  T(10, L0, 0.88, 0.04, 500, '✓ ' + L.review, '#268bd2', 2);
  const rules = [{ li: 1.6, y: -0.6 }, { li: 3.5, y: -0.235 }, { li: 8.7, y: 0.665 }];
  return prepTokens({ x0, x1, y0, y1, L0, span: 1.25, nL: 11, lines, rules });
}

// Draw every line on an offscreen canvas and pick points inside the letters
function sampleText(RP, budget, R) {
  const PX = 520, W = Math.ceil(1.6 * PX), H = 48, out = [];
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d', { willReadFrequently: true });
  RP.lines.forEach((ln) => {
    g.clearRect(0, 0, W, H); g.fillStyle = '#fff'; g.textBaseline = 'middle';
    g.font = ln.w + ' ' + Math.round(ln.size * PX) + 'px ' + MONO;
    g.fillText(ln.text, 0, H / 2);
    const data = g.getImageData(0, 0, W, H).data;
    for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) if (data[(y * W + x) * 4 + 3] > 140) {
      out.push([ln.x + x / PX, ln.y + (y - H / 2) / PX, (RP.start[ln.li] + R() * RP.cnt[ln.li]) / RP.T * 0.92, ln.ci]);
    }
  });
  for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); const t = out[i]; out[i] = out[j]; out[j] = t; }
  return out.slice(0, budget);
}

const repTok = (s, RP) => Math.max(0, s.tSince / s.RV / 0.92 * RP.T);

function repDone(s) {
  if (!s.F || !s.F.report) return 0;
  return smooth(clamp01((s.tSince - 0.97 * s.RV - 0.2) / 0.9));
}

// Position (units) of the token currently being written
function repHeadAt(RP, pt) {
  const k = Math.min(RP.T - 1, Math.max(0, Math.floor(pt)));
  for (const ln of RP.lines) {
    if (!ln.toks) continue;
    for (const tk of ln.toks) if (tk.k === k) {
      const cw = ln.size * 0.6;
      return [ln.x + (tk.start + (tk.end - tk.start) * Math.min(1, pt - k)) * cw, ln.y];
    }
  }
  return [RP.L0, RP.y0 + 0.2];
}

/* ---------- formations ---------- */

function build(s, k) {
  const N = s.N, d = N / 2600, n = s.net;
  const R = rng(100 + k * 17);
  const gauss = () => (R() + R() + R() - 1.5) / 1.5;
  const slots = [], strokes = [];
  let reveal = null;
  const add = (x, y, z, c, a, role, par, sm) => {
    if (reveal && !role) { role = 7; par = reveal(x, y, z); }
    slots.push([x, y, z, c, a, role || 0, par || 0, sm || 1, 0]);
  };
  // everything drawn with these helpers later turns into a smooth stroke; its particles are flagged so they can dissolve into it
  const asLine = (fn, st) => {
    const k0 = slots.length; fn();
    for (let i = k0; i < slots.length; i++) slots[i][8] = 1;
    if (reveal) st.rev = reveal(st.m[0], st.m[1], 0);
    strokes.push(st);
  };
  const node0 = (p, c, a, r) => {
    const m = Math.round(26 * d), q = Math.round(9 * d);
    for (let i = 0; i < m; i++) { const t = (i / m) * 6.283 + R() * 0.1; add(p[0] + Math.cos(t) * r, p[1] + Math.sin(t) * r, gauss() * 0.02, c, a); }
    for (let i = 0; i < q; i++) add(p[0] + gauss() * 0.018, p[1] + gauss() * 0.018, gauss() * 0.02, c, a);
  };
  const node = (p, c, a, r = 0.055) => asLine(() => node0(p, c, a, r), { t: 'n', p, r, c, a, m: p });
  const ghost = (p) => {
    const m = Math.round(12 * d);
    for (let i = 0; i < m; i++) { const t = R() * 6.283, r = 0.03 + R() * 0.05; add(p[0] + Math.cos(t) * r, p[1] + Math.sin(t) * r, gauss() * 0.15, 0, 0.22); }
  };
  const edge0 = (a, b, c, al, dens) => {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), q = ctrl(a, b);
    const m = Math.max(3, Math.round(L * (dens || 46) * d));
    for (let i = 0; i < m; i++) {
      const t = 0.08 + 0.84 * ((i + R() * 0.6) / m), u = 1 - t, fade = Math.sin(Math.PI * t);
      add(u * u * a[0] + 2 * u * t * q[0] + t * t * b[0] + gauss() * 0.004, u * u * a[1] + 2 * u * t * q[1] + t * t * b[1] + gauss() * 0.004, gauss() * 0.008, c, Math.min(1, al * 1.25) * (0.6 + 0.4 * fade), 0, 0, 0.62);
    }
  };
  const edge = (a, b, c, al, dens) => asLine(() => edge0(a, b, c, al, dens), { t: 'e', a, b, q: ctrl(a, b), c, a2: al, m: mid(a, b) });
  const ring0 = (p, r, c, al, m) => {
    m = Math.round(m * d);
    for (let i = 0; i < m; i++) { const t = (i / m) * 6.283; add(p[0] + Math.cos(t) * r, p[1] + Math.sin(t) * r, gauss() * 0.01, c, al, 0, 0, 0.75); }
  };
  const ring = (p, r, c, al, m) => asLine(() => ring0(p, r, c, al, m), { t: 'c', p, r, c, a: al, m: p });
  const line0 = (a, b, c, al, m) => {
    m = Math.max(2, Math.round(m * d));
    for (let i = 0; i < m; i++) { const t = i / (m - 1); add(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, gauss() * 0.01, c, al, 0, 0, 0.7); }
  };
  const line = (a, b, c, al, m) => asLine(() => line0(a, b, c, al, m), { t: 'l', a, b, c, a2: al, m: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] });
  const swarm = (role, c, m) => {
    m = Math.round(m * d);
    for (let i = 0; i < m; i++) add(gauss() * 0.012, gauss() * 0.012, gauss() * 0.012, c, 0.6 + R() * 0.4, role, 0, 0.75);
  };
  const agent = (role, c) => swarm(role, c, 78);
  const loop = (p, r) => [0, 1, 2, 3, 4, 5].map((j) => {
    const a = j / 6 * 6.283;
    return [p[0] + Math.cos(a) * r, p[1] + Math.sin(a) * r * 0.8, (p[2] || 0) + Math.sin(a * 2) * r * 0.5];
  });
  const me = (sc = 1) => {
    const m = Math.round(110 * sc * d);
    for (let i = 0; i < m; i++) add(gauss() * 0.01, gauss() * 0.01, gauss() * 0.01, 2, 0.7 + R() * 0.3, 5, 0, 0.85);
  };
  const dimNet = (upto) => {
    node(n.R, 0, 0.45); n.S.forEach((p) => node(p, 0, 0.45)); n.edgesRS.forEach((e) => edge(e[0], e[1], 0, 0.28));
    n.H.forEach((p) => node(p, 0, 0.45)); n.edgesSH.forEach((e) => edge(e[0], e[1], 0, 0.28));
    node(n.D[1], 0, 0.4); ghost(n.D[0]); ghost(n.D[2]); n.edgesHD.forEach((e) => edge(e[0], e[1], 0, 0.2, 30));
    if (upto) node(n.X[0], 0, 0.35); else ghost(n.X[0]);
    ghost(n.X[1]);
  };
  const F = { drift: 0.008, agents: [], labels: [] };

  if (k === 0) {
    for (let i = 0; i < N; i++) add((R() - 0.5) * 6.6, (R() - 0.5) * 4.0, (R() - 0.5) * 4.2, R() < 0.09 ? 2 : 0, 0.3 + R() * 0.6);
    F.drift = 0.05;
  }
  if (k === 1) {
    // attack surface: the AI app and every way content gets in (inputs) or out (tools)
    node(n.R, 4, 0.95, 0.07); n.S.forEach((p) => node(p, 4, 0.9));
    n.edgesRS.forEach((e) => edge(e[0], e[1], 0, 0.55));
    n.H.forEach(ghost); n.D.forEach(ghost); n.X.forEach(ghost);
    agent(1, 1); agent(2, 1);
    F.agents = [
      { name: 'input-mapping', pts: [n.R, n.S[0], [-1.1, -0.5], n.S[3], [-1.1, 0.45], n.S[1]], o: 0 },
      { name: 'model-fingerprint', pts: [n.S[0], n.S[1], n.S[2], n.S[3], n.S[2], n.S[1]], o: 0.5 },
    ];
    F.labels = [{ p: n.R, t: 'app.[redacted].ai', dx: -0.02, dy: 0.13, c: AI_LABEL, al: 'center' }]
      .concat(['chat', 'api', 'git', 'docs-upload'].map((t, i) => ({ p: n.S[i], t, dx: -0.1, dy: 0.012, c: '#979899', al: 'right' })));
  }
  if (k === 2) {
    // broad automated probing: small probe swarms hammer the inputs, the pipeline behind them appears
    node(n.R, 4, 0.9, 0.07); n.S.forEach((p) => node(p, 4, 0.85)); n.H.forEach((p) => node(p, 4, 0.9));
    node(n.D[1], 4, 0.75); ghost(n.D[0]); ghost(n.D[2]); n.X.forEach(ghost);
    n.edgesRS.forEach((e) => edge(e[0], e[1], 0, 0.5)); n.edgesSH.forEach((e) => edge(e[0], e[1], 0, 0.5));
    edge(n.H[0], n.D[1], 0, 0.35, 30); edge(n.H[2], n.D[1], 0, 0.35, 30);
    agent(1, 1); agent(2, 1); agent(3, 1); agent(4, 1);
    F.agents = [
      { name: 'jailbreak', pts: [n.S[0], n.R, n.S[1], n.S[0]], o: 0, hop: 0.8 },
      { name: 'leak', pts: [n.S[1], n.H[0], n.S[0], n.H[1]], o: 0.3, hop: 0.9 },
      { name: 'injection', pts: [n.S[3], n.H[2], n.S[1], n.H[2]], o: 0.6, hop: 0.85 },
      { name: 'tool-enum', pts: [n.H[2], n.D[1], n.H[0], n.D[1]], o: 0.15, hop: 1.1 },
    ];
    F.labels = [['llm-gateway', AI_LABEL], ['vector-db', AI_LABEL], ['rag · ingest', AI_LABEL], ['ci/cd', INFRA_LABEL]]
      .map((l, i) => ({ p: n.H[i], t: l[0], dx: 0.15, dy: 0.012, c: l[1], al: 'left' }))
      .concat([
        { p: n.D[1], t: 'agent · k8s-pod', dx: 0.1, dy: 0.012, c: INFRA_LABEL, al: 'left' },
        { p: n.D[0], t: '?', dx: 0.1, dy: 0.012, c: '#6f7071', al: 'left' },
        { p: n.D[2], t: '?', dx: 0.1, dy: 0.012, c: '#6f7071', al: 'left' },
      ]);
  }
  if (k === 3) {
    // two suspects: an AI-specific one (RAG takes unvetted documents) and an infrastructure one (agent pod with broad rights)
    dimNet(false);
    ring(n.T, 0.17, 2, 0.95, 70); ring(n.T, 0.1, 2, 0.6, 34);
    [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach((v) => line([n.T[0] + v[0] * 0.21, n.T[1] + v[1] * 0.21], [n.T[0] + v[0] * 0.32, n.T[1] + v[1] * 0.32], 2, 0.95, 9));
    node(n.T, 4, 0.95);
    ring(n.D[1], 0.13, 2, 0.7, 48); node(n.D[1], 4, 0.9);
    edge(n.T, n.D[1], 2, 0.5, 50);
    me();
    F.labels = [
      { p: n.T, dx: 0.36, dy: 0.012, c: '#268bd2', al: 'left', key: 'rag' },
      { p: n.D[1], dx: 0, dy: -0.21, c: '#268bd2', al: 'center', key: 'pod' },
      { p: n.P, dx: 0.12, dy: 0.012, c: '#268bd2', al: 'left', key: 'me' },
    ];
  }
  if (k === 4) {
    // manual testing on both: hidden instructions in a document; what the pod's service account may do
    dimNet(false);
    ring(n.T, 0.13, 3, 0.95, 54); ring(n.T, 0.2, 2, 0.35, 40); node(n.T, 4, 0.9);
    ring(n.D[1], 0.11, 3, 0.8, 44); node(n.D[1], 4, 0.85);
    me(0.5); swarm(1, 2, 150); swarm(2, 2, 110);
    F.agents = [{ name: '', pts: loop(n.T, 0.17), o: 0, hop: 0.85 }, { name: '', pts: loop(n.D[1], 0.14), o: 0.5, hop: 0.95 }];
    F.labels = [
      { p: n.T, t: 'indirect prompt injection', dx: 0.25, dy: 0.012, c: '#dc322f', al: 'left' },
      { p: n.D[1], t: 'serviceaccount: cluster-admin', dx: 0, dy: -0.2, c: '#dc322f', al: 'center' },
      { p: n.P, dx: 0.12, dy: 0.012, c: '#268bd2', al: 'left', key: 'me' },
    ];
  }
  if (k === 5) {
    // the pentester drives the chain: poisoned document via upload -> RAG -> agent runs a command in its pod
    // -> pod token is cluster-admin -> k8s API secrets; the path only turns red where his swarm has passed
    const path = smoothPath([n.P, [-1.2, 0.2], n.S[3], mid(n.S[3], n.T), n.T, mid(n.T, n.D[1]), n.D[1], mid(n.D[1], n.X[0]), n.X[0]]);
    dimNet(true); me(0.55);
    reveal = (x, y, z) => Math.min(0.95, pathFrac(path, x, y, z) * 0.92);
    ring(n.T, 0.13, 3, 0.8, 44); node(n.T, 3, 0.9);
    edge(n.S[3], n.T, 3, 0.85, 70); edge(n.T, n.D[1], 3, 0.85, 70); edge(n.D[1], n.X[0], 3, 0.85, 70);
    ring(n.D[1], 0.11, 3, 0.8, 40); node(n.D[1], 3, 0.8); ring(n.X[0], 0.17, 3, 0.95, 70); ring(n.X[0], 0.3, 3, 0.3, 55); node(n.X[0], 3, 0.95, 0.075);
    reveal = null;
    swarm(1, 2, 200);
    F.rv = 4.6; F.haze = 0.1;
    F.agents = [{ name: '', o: 0, lag: 0.08, fn: (ts, t) => {
      const pr = (ts - 0.3) / (s.RV * 0.92 - 0.3);
      if (pr < 0) return pathAt(path, 0);
      if (pr < 1) {
        const e = pr < 0.5 ? 2 * pr * pr : 1 - Math.pow(-2 * pr + 2, 2) / 2;
        const q = pathAt(path, e);
        return [q[0] + Math.sin(t * 5.1) * 0.025, q[1] + Math.cos(t * 4.3) * 0.025, q[2]];
      }
      const X = n.X[0], a = t * 1.9;
      return [X[0] + Math.cos(a) * 0.17, X[1] + Math.sin(a) * 0.13, Math.sin(a * 2) * 0.08];
    } }];
    F.labels = [
      { p: n.X[0], t: 'kubectl get secrets -A', dx: 0.1, dy: -0.34, c: '#dc322f', al: 'right', key: 'root' },
      { p: n.X[0], t: 'k8s-api', dx: 0, dy: 0.36, c: INFRA_LABEL, al: 'center' },
      { p: n.S[3], t: 'docs-upload', dx: -0.1, dy: 0.012, c: '#979899', al: 'right' },
      { p: n.D[1], t: 'agent · k8s-pod', dx: 0.1, dy: -0.12, c: INFRA_LABEL, al: 'left' },
      { p: n.T, t: 'rag · ingest', dx: -0.17, dy: 0.012, c: AI_LABEL, al: 'right' },
      { p: n.P, dx: 0.12, dy: 0.012, c: '#268bd2', al: 'left', key: 'me' },
    ];
  }
  if (k === 6) {
    // glass panel; the swarm swirls over it and the report appears token by token where it has been
    const RP = reportLayout(s.texts);
    sampleText(RP, Math.round(1250 * d), R).forEach((q) => add(q[0], q[1], 0, q[3], 0.45, 7, q[2], 0.5));
    // a big swarm, like the opening chaos, buzzing over the whole panel
    const m = Math.round(1000 * d);
    for (let i = 0; i < m; i++) add(RP.x0 - 0.4 + R() * (RP.x1 - RP.x0 + 0.8), RP.y0 - 0.22 + R() * (RP.y1 - RP.y0 + 0.44), (R() - 0.5) * 0.5, R() < 0.7 ? 1 : 4, 0.45 + R() * 0.5, 8, 0, 0.7);
    F.report = RP;
    F.rv = 8;
  }

  // background haze (the rest of the swarm)
  if (k !== 0) while (slots.length < N) add((R() - 0.5) * 6.8, (R() - 0.5) * 4.2, -0.6 - R() * 2.2, R() < 0.05 ? 2 : 0, 0.1 + R() * 0.22);
  if (slots.length > N) slots.length = N;
  // shuffle so that particles cross the stage when the picture changes
  for (let i = slots.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); const t = slots[i]; slots[i] = slots[j]; slots[j] = t; }
  F.pos = new Float32Array(3 * N); F.col = new Uint8Array(N); F.al = new Float32Array(N); F.role = new Uint8Array(N);
  F.par = new Float32Array(N); F.sm = new Float32Array(N); F.lf = new Uint8Array(N); F.strokes = strokes;
  for (let i = 0; i < N; i++) {
    const q = slots[i];
    F.pos[3 * i] = q[0]; F.pos[3 * i + 1] = q[1]; F.pos[3 * i + 2] = q[2];
    F.col[i] = q[3]; F.al[i] = q[4]; F.role[i] = q[5]; F.par[i] = q[6]; F.sm[i] = q[7]; F.lf[i] = q[8];
  }
  return F;
}

/* ---------- setup ---------- */

function init(s) {
  const w = s.root.clientWidth || 1280;
  const N = w < 700 ? 1300 : (w < 1100 ? 2000 : 2600);
  s.N = N;
  const R = rng(7);
  s.cur = new Float32Array(3 * N); s.from = new Float32Array(3 * N);
  s.sz = new Float32Array(N); s.ph = new Float32Array(N); s.delay = new Float32Array(N);
  s.cFrom = new Uint8Array(N); s.cTo = new Uint8Array(N);
  s.aFrom = new Float32Array(N); s.aCur = new Float32Array(N);
  s.lfFrom = new Uint8Array(N); s.lastE = new Float32Array(N);
  for (let i = 0; i < N; i++) { const r = R(); s.sz[i] = 0.55 + Math.pow(r, 6) * 2.6; s.ph[i] = R() * 6.283; }
  // per-particle swarm behaviour: orbit radius, angular speed, tilt, lag
  s.oR = new Float32Array(N); s.oW = new Float32Array(N); s.oT = new Float32Array(N); s.oL = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const r = 0.008 + Math.pow(R(), 2.2) * 0.09;
    s.oR[i] = r;
    s.oW[i] = (R() < 0.5 ? -1 : 1) * (1.6 + R() * 3.4) / (1 + r * 8);
    s.oT[i] = (R() - 0.5) * 3.1;
    s.oL[i] = Math.pow(R(), 1.4) * 0.5;
  }
  s.smFrom = new Float32Array(N); s.smCur = new Float32Array(N).fill(1);
  s.bk = []; s.bk2 = [];
  for (let b = 0; b < BUCKETS; b++) { s.bk.push([]); s.bk2.push([]); }
  s.sprites = PAL.map((c) => {
    const sp = document.createElement('canvas'); sp.width = sp.height = 64;
    const g = sp.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(' + c + ',0.55)'); gr.addColorStop(0.3, 'rgba(' + c + ',0.18)'); gr.addColorStop(1, 'rgba(' + c + ',0)');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    return sp;
  });
  s.net = buildNet();
  s.forms = [0, 1, 2, 3, 4, 5, 6].map((k) => build(s, k));
  if (document.fonts) document.fonts.load('400 40px "IBM Plex Mono"').then(() => rebuildReport(s)).catch(() => {});
  resize(s);
}

function rebuildReport(s) {
  s.forms[REPORT_FORM] = build(s, REPORT_FORM);
  if (s.k === REPORT_FORM) s.F = s.forms[REPORT_FORM];
}

function resize(s) {
  const w = s.root.clientWidth, h = s.root.clientHeight;
  const rect = s.root.getBoundingClientRect();
  const zoom = w ? Math.max(1, rect.width / w) : 1;
  s.zoom = rect.width / (w || 1);
  let dpr = Math.min(3, (window.devicePixelRatio || 1) * zoom);
  if (w * h * dpr * dpr > MAX_PIXELS) dpr = Math.sqrt(MAX_PIXELS / (w * h));
  s.cv.width = Math.round(w * dpr); s.cv.height = Math.round(h * dpr);
  s.W = w; s.H = h; s.dpr = dpr;
  const wide = w > 860;
  s.S = wide ? Math.min(w / 4.3, h / 2.9) : Math.min(w / 3.5, h / 3.6);
  s.cx = wide ? w * 0.6 : w * 0.5;
  s.cy = wide ? h * 0.42 : h * 0.34;
}

/* ---------- phase control ---------- */

const cShow = (s, i) => (s.lastE[i] > 0.5 ? s.cTo[i] : s.cFrom[i]);

function setForm(s, k, instant) {
  const N = s.N, F = s.forms[k], now = performance.now(), prev = s.F;
  for (let i = 0; i < N; i++) {
    s.from[3 * i] = s.cur[3 * i]; s.from[3 * i + 1] = s.cur[3 * i + 1]; s.from[3 * i + 2] = s.cur[3 * i + 2];
    s.cFrom[i] = prev ? cShow(s, i) : F.col[i];
    s.aFrom[i] = prev ? s.aCur[i] : F.al[i];
    s.smFrom[i] = prev ? s.smCur[i] : F.sm[i];
    s.delay[i] = Math.random() * 0.5;
  }
  if (instant || !prev) {
    for (let i = 0; i < 3 * N; i++) { s.from[i] = F.pos[i]; s.cur[i] = F.pos[i]; }
    for (let i = 0; i < N; i++) { s.cFrom[i] = F.col[i]; s.aFrom[i] = F.al[i]; s.aCur[i] = F.al[i]; s.smFrom[i] = F.sm[i]; s.smCur[i] = F.sm[i]; }
  }
  for (let i = 0; i < N; i++) s.lfFrom[i] = prev ? prev.lf[i] : 0;
  s.prevF = prev; s.F = F; s.k = k;
  s.t0 = instant ? now - 10000 : now;
}

function toStep(s, i, instant) {
  s.intro = false;
  setForm(s, i + 1, instant);
  s.stepAt = performance.now();
  update(s, { step: i, chars: instant ? s.steps[i].cmd.length : 0, prog: instant ? 1 : 0 });
}

function restartIntro(s, now) {
  setForm(s, 0);
  s.intro = true;
  s.stepAt = now;
  update(s, { step: 0, chars: 0, prog: 0 });
}

// Resume after a pause: shift the phase's and the formation's start by the time spent hidden
function wake(s) {
  if (s.visible) return;
  if (s.pausedAt) { const dt = performance.now() - s.pausedAt; s.stepAt += dt; s.t0 += dt; s.pausedAt = 0; }
  s.visible = true;
}

/* ---------- overlay and rail ---------- */

function update(s, patch) {
  Object.assign(s, patch);
  render(s);
}

function render(s) {
  const st = s.steps[s.step], dom = s.dom, total = String(s.steps.length).padStart(2, '0');
  dom.phaseNo.textContent = s.texts.phase + ' ' + String(s.step + 1).padStart(2, '0') + ' / ' + total;
  dom.mode.textContent = s.texts.modes[st.mode];
  dom.mode.className = 'walk__mode walk__mode--' + st.mode;
  dom.title.textContent = st.title;
  dom.hit.textContent = st.hit;
  dom.cmd.textContent = st.cmd.slice(0, s.chars);
  dom.rail.forEach((btn, i) => {
    const done = i < s.step, cur = i === s.step;
    if (cur) btn.setAttribute('aria-current', 'step'); else btn.removeAttribute('aria-current');
    btn.classList.toggle('is-done', done);
    const fill = dom.fills[i];
    fill.style.width = (done ? 100 : (cur ? Math.round(s.prog * 100) : 0)) + '%';
    fill.classList.toggle('is-alert', i === EXPLOIT_STEP && (cur || done));
  });
}

/* ---------- drawing ---------- */

function drawGlass(s, ctx, RP, proj, alpha) {
  if (alpha <= 0) return;
  const c = [proj([RP.x0, RP.y0, 0]), proj([RP.x1, RP.y0, 0]), proj([RP.x1, RP.y1, 0]), proj([RP.x0, RP.y1, 0])];
  const path = () => {
    ctx.beginPath(); ctx.moveTo((c[0][0] + c[1][0]) / 2, (c[0][1] + c[1][1]) / 2);
    for (let i = 1; i <= 4; i++) ctx.arcTo(c[i % 4][0], c[i % 4][1], c[(i + 1) % 4][0], c[(i + 1) % 4][1], 16);
    ctx.closePath();
  };
  ctx.save(); path(); ctx.clip();
  ctx.globalAlpha = alpha; ctx.filter = 'blur(9px)';
  ctx.drawImage(s.cv, 0, 0, s.cv.width, s.cv.height, 0, 0, s.W, s.H);
  ctx.filter = 'none';
  const g = ctx.createLinearGradient(c[0][0], c[0][1], c[2][0], c[2][1]);
  g.addColorStop(0, 'rgba(70,72,72,0.30)'); g.addColorStop(1, 'rgba(36,37,37,0.34)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, s.W, s.H);
  ctx.restore();
  ctx.save(); ctx.globalAlpha = alpha; path(); ctx.strokeStyle = 'rgba(228,229,229,0.09)'; ctx.lineWidth = 1; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(c[0][0] + 18, c[0][1] + 0.5); ctx.lineTo(c[1][0] - 18, c[1][1] + 0.5);
  ctx.strokeStyle = 'rgba(255,255,255,0.07)'; ctx.stroke(); ctx.restore();
}

function drawStrokes(s, ctx, F, alpha, draw, P2) {
  const col = (c, a) => 'rgba(' + PAL[c][0] + ',' + PAL[c][1] + ',' + PAL[c][2] + ',' + clamp01(a).toFixed(3) + ')';
  ctx.lineCap = 'round';
  F.strokes.forEach((st) => {
    let a = alpha, g = draw;
    if (st.rev != null) { const rv = clamp01((s.tSince - st.rev * s.RV) / 0.9); a *= rv; g = Math.min(g, rv); }
    if (a <= 0.01 || g <= 0.01) return;
    if (st.t === 'e' || st.t === 'l') {
      ctx.strokeStyle = col(st.c, st.a2 * 0.5 * a); ctx.lineWidth = st.t === 'e' ? 0.8 : 1; ctx.beginPath();
      const n = 32;
      for (let i = 0; i <= n * g; i++) {
        const t = i / n, u = 1 - t;
        let x, y;
        if (st.t === 'e') { x = u * u * st.a[0] + 2 * u * t * st.q[0] + t * t * st.b[0]; y = u * u * st.a[1] + 2 * u * t * st.q[1] + t * t * st.b[1]; }
        else { x = st.a[0] + (st.b[0] - st.a[0]) * t; y = st.a[1] + (st.b[1] - st.a[1]) * t; }
        const q = P2([x, y]);
        if (i === 0) ctx.moveTo(q[0], q[1]); else ctx.lineTo(q[0], q[1]);
      }
      ctx.stroke();
    } else {
      // node or ring: a smooth circle (nodes also get a solid core)
      ctx.strokeStyle = col(st.c, st.a * 0.5 * a); ctx.lineWidth = st.t === 'n' ? 0.9 : 1; ctx.beginPath();
      const n = 48;
      for (let i = 0; i <= n * g; i++) {
        const an = -Math.PI / 2 + (i / n) * 6.2832;
        const q = P2([st.p[0] + Math.cos(an) * st.r, st.p[1] + Math.sin(an) * st.r]);
        if (i === 0) ctx.moveTo(q[0], q[1]); else ctx.lineTo(q[0], q[1]);
      }
      ctx.stroke();
      if (st.t === 'n') {
        const q = P2(st.p);
        ctx.fillStyle = col(st.c, st.a * 0.55 * a); ctx.beginPath();
        ctx.arc(q[0], q[1], Math.max(1.2, 0.012 * s.S * q[2]), 0, 6.2832); ctx.fill();
      }
    }
  });
}

// Crisp dots, batched by colour and opacity in tenths
function drawDots(ctx, bk) {
  for (let b = 0; b < BUCKETS; b++) {
    const B = bk[b];
    if (!B.length) continue;
    const c = PAL[Math.floor(b / 10)];
    ctx.fillStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + ((b % 10) + 0.5) / 10 + ')';
    ctx.beginPath();
    for (let j = 0; j < B.length; j += 3) { ctx.moveTo(B[j] + B[j + 2], B[j + 1]); ctx.arc(B[j], B[j + 1], B[j + 2], 0, 6.2832); }
    ctx.fill();
  }
}

function drawReport(s, ctx, RP, proj) {
  const pt = repTok(s, RP);
  RP.rules.forEach((r) => {
    const li = Math.floor(r.li), at = RP.start[li] + (r.li - li) * RP.cnt[li];
    const f = clamp01((pt - at) / 4);
    if (f <= 0) return;
    const a = proj([RP.L0, r.y, 0]), b = proj([RP.x1 - 0.12, r.y, 0]);
    ctx.strokeStyle = 'rgba(228,229,229,' + (0.12 * f).toFixed(3) + ')'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
  });
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  RP.lines.forEach((ln) => {
    if (!ln.toks.length || pt <= ln.toks[0].k) return;
    let end = 0, part = null;
    for (const tk of ln.toks) { if (tk.k + 1 <= pt) end = tk.end; else if (tk.k < pt) part = tk; }
    const cw = ln.size * 0.6, q = proj([ln.x, ln.y, 0]), sc = q[2] || 1;
    ctx.font = ln.w + ' ' + (ln.size * s.S * sc).toFixed(1) + 'px ' + MONO;
    ctx.fillStyle = ln.col;
    if (end > 0) { ctx.globalAlpha = 0.96; ctx.fillText(ln.text.slice(0, end), q[0], q[1]); }
    if (part) { const qp = proj([ln.x + part.start * cw, ln.y, 0]); ctx.globalAlpha = 0.96 * (pt - part.k); ctx.fillText(ln.text.slice(part.start, part.end), qp[0], qp[1]); }
  });
  ctx.globalAlpha = 1;
}

function agentPos(s, a, t) {
  if (a.fn) return a.fn(s.tSince + (t - s.nowT), t);
  // smooth, continuous wander through the waypoints plus a little free roaming
  const hop = a.hop || 1.9, n = a.pts.length;
  const u = t / hop + a.o * n, i = Math.floor(u), f = u - i;
  const P = (k) => a.pts[((k % n) + n) % n];
  const q = cr(P(i - 1), P(i), P(i + 1), P(i + 2), f);
  const o = a.o * 13;
  return [
    q[0] + Math.sin(t * 0.9 + o) * 0.06 + Math.sin(t * 2.3 + o * 1.7) * 0.025,
    q[1] + Math.cos(t * 0.7 + o * 1.3) * 0.05 + Math.sin(t * 1.9 + o) * 0.02,
  ];
}

function labelText(s, lb) {
  if (lb.key === 'rag' || lb.key === 'pod' || lb.key === 'me') return s.texts.labels[lb.key];
  return lb.t;
}

/* ---------- render loop ---------- */

function autoplay(s, now) {
  if (s.reduce) return;
  if (s.intro && now - s.stepAt > INTRO_MS) toStep(s, 0);
  else if (!s.intro && now - s.stepAt > DURATION_MS[s.step]) {
    if (s.step < s.steps.length - 1) toStep(s, s.step + 1);
    else restartIntro(s, now);
  }
}

function frame(s, now) {
  s.raf = requestAnimationFrame((n) => frame(s, n));
  if (!s.F || (!s.visible && s.drawnOnce)) return;
  if (!s.zc || now - s.zc > RESIZE_CHECK_MS) {
    s.zc = now;
    const r = s.root.getBoundingClientRect(), z = r.width / (s.root.clientWidth || 1);
    if (Math.abs(z - (s.zoom || 1)) > 0.08 || s.root.clientWidth !== s.W || s.root.clientHeight !== s.H) resize(s);
  }
  autoplay(s, now);

  const ctx = s.cv.getContext('2d');
  ctx.setTransform(s.dpr, 0, 0, s.dpr, 0, 0);
  ctx.clearRect(0, 0, s.W, s.H);
  const F = s.F, N = s.N, t = now / 1000;
  const dtH = Math.min(0.05, s.lastTH ? t - s.lastTH : 0.016); s.lastTH = t;
  const p = (now - s.t0) / FORM_MS;
  const ptr = s.ptr;
  ptr.x += (ptr.tx - ptr.x) * 0.05; ptr.y += (ptr.ty - ptr.y) * 0.05;
  const tk = F.report ? 0.2 : 1;
  const yaw = (ptr.x * 0.16 + Math.sin(t * 0.21) * 0.05) * tk, pitch = (-ptr.y * 0.08 + Math.sin(t * 0.17) * 0.025) * tk;
  const cyw = Math.cos(yaw), syw = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
  const S = s.S, cx = s.cx, cy = s.cy, D = DEPTH;
  const fk = smooth(clamp01((p - 0.55) / 1.15));
  const pk = 1 - smooth(clamp01(p / 0.95));
  // flat projection (z = 0) for strokes, labels and the report
  const P2 = (q) => {
    const x = q[0], y = q[1], rx = x * cyw, rz0 = -x * syw, ry = y * cp - rz0 * sp, rz = y * sp + rz0 * cp, sc = D / (D - rz * 0.9);
    return [cx + rx * S * sc, cy + ry * S * sc, sc];
  };
  const amp = s.prevF && p < 1.2 ? s.prevF.drift + (F.drift - s.prevF.drift) * Math.min(1, p) : F.drift;
  s.RV = F.rv || DEFAULT_REVEAL_S; s.tSince = (now - s.t0) / 1000 - 1.4; s.nowT = t;
  if (F.report) {
    const hp = repHeadAt(F.report, repTok(s, F.report));
    if (!s.head || s.headF !== F) { s.head = hp.slice(); s.headF = F; s.hist = []; }
    const kh = 1 - Math.exp(-dtH * 9);
    s.head[0] += (hp[0] - s.head[0]) * kh; s.head[1] += (hp[1] - s.head[1]) * kh;
    s.hist.unshift(s.head.slice()); if (s.hist.length > 45) s.hist.length = 45;
  }
  const done = repDone(s);
  const agentC = F.agents.map((a) => agentPos(s, a, t));
  for (let b = 0; b < BUCKETS; b++) { s.bk[b].length = 0; s.bk2[b].length = 0; }
  const glow = [];
  for (let i = 0; i < N; i++) {
    s.cTo[i] = F.col[i];
    const l = clamp01((p - s.delay[i]) / 0.5);
    const e = l < 0.5 ? 4 * l * l * l : 1 - Math.pow(-2 * l + 2, 3) / 2;
    s.lastE[i] = e;
    const role = F.role[i], ph = s.ph[i];
    let tx = F.pos[3 * i], ty = F.pos[3 * i + 1], tz = F.pos[3 * i + 2];
    let aMul = 1, rvI = 1;
    if (role >= 1 && role <= 4 && F.agents[role - 1]) {
      // each agent is its own little swarm: particles orbit the moving centre on tilted paths and trail behind it
      const ag = F.agents[role - 1], c = agentPos(s, ag, t - s.oL[i] * (ag.lag == null ? 1 : ag.lag));
      const r = s.oR[i] * (1 + 0.3 * Math.sin(t * 2.7 + ph)), an = s.oW[i] * t + ph, tl = s.oT[i];
      tx += c[0] + Math.cos(an) * r; ty += c[1] + Math.sin(an) * r * Math.cos(tl); tz += Math.sin(an) * r * Math.sin(tl);
    } else if (role === 7) {
      // revealed content: a faint, scattered haze until the swarm passes, then it settles into place
      const rv = smooth(clamp01((s.tSince - F.par[i] * s.RV) / 0.9)), k7 = 1 - rv;
      tx += (Math.sin(ph * 7.1 + t * 0.6) * 0.22 + Math.sin(t * 1.3 + ph) * 0.03) * k7;
      ty += Math.cos(ph * 5.3 + t * 0.5) * 0.16 * k7;
      tz += Math.sin(ph * 3.7 + t * 0.4) * 0.25 * k7;
      rvI = rv;
      const hz = F.haze == null ? 0.5 : F.haze;
      aMul = hz + (1 - hz) * rv;
      if (F.report) aMul *= 1 - done;
    } else if (role === 8) {
      const w = 1.1 + Math.abs(s.oW[i]) * 0.5;
      if (s.hist && s.hist.length && (ph * 7.3) % 1 < 0.68) {
        // bundled: buzz tightly around the token being written, trailing slightly behind it
        const h = s.hist[Math.min(s.hist.length - 1, Math.floor(s.oL[i] * 60))];
        const r = s.oR[i] * 2.4 * (1 + 0.35 * Math.sin(t * 3.3 + ph)), an = s.oW[i] * 1.8 * t + ph, tl = s.oT[i];
        tx = h[0] + Math.cos(an) * r * 1.4 + Math.sin(t * 5.1 + ph) * 0.02; ty = h[1] + Math.sin(an) * r * Math.cos(tl) * 0.8; tz = Math.sin(an) * r * Math.sin(tl);
      } else {
        // free chaotic buzzing around the slot
        tx += Math.sin(t * w + ph) * 0.2 + Math.sin(t * w * 2.3 + ph * 1.7) * 0.06 + Math.sin(t * 0.31 + ph * 0.2) * 0.08;
        ty += Math.cos(t * w * 0.8 + ph * 1.3) * 0.16 + Math.sin(t * w * 2.9 + ph) * 0.05 + Math.cos(t * 0.27 + ph * 0.3) * 0.06;
        tz += Math.sin(t * w * 1.1 + ph * 0.7) * 0.15;
      }
      // once the report is complete, the swarm scatters and vanishes
      if (done > 0) { tx += Math.cos(ph * 3) * done * 1.3; ty += Math.sin(ph * 3) * done * 0.9; aMul = 1 - done; }
    } else if (role === 5) {
      // the pentester: one calm, dense swarm that breathes in place
      const P = s.net.P, r = s.oR[i] * 0.85 * (1 + 0.2 * Math.sin(t * 1.6 + ph)), an = s.oW[i] * 0.45 * t + ph, tl = s.oT[i];
      tx += P[0] + Math.sin(t * 0.6) * 0.02 + Math.cos(an) * r; ty += P[1] + Math.cos(t * 0.5) * 0.015 + Math.sin(an) * r * Math.cos(tl); tz += Math.sin(an) * r * Math.sin(tl);
    }
    const x = s.from[3 * i] + (tx - s.from[3 * i]) * e + Math.sin(t * 0.5 + ph) * amp;
    const y = s.from[3 * i + 1] + (ty - s.from[3 * i + 1]) * e + Math.cos(t * 0.42 + ph * 1.3) * amp;
    const z = s.from[3 * i + 2] + (tz - s.from[3 * i + 2]) * e + Math.sin(t * 0.37 + ph * 0.7) * amp;
    s.cur[3 * i] = x; s.cur[3 * i + 1] = y; s.cur[3 * i + 2] = z;
    const a = (s.aFrom[i] + (F.al[i] - s.aFrom[i]) * e) * aMul; s.aCur[i] = a;
    const sm = s.smFrom[i] + (F.sm[i] - s.smFrom[i]) * e; s.smCur[i] = sm;
    // rotate and project
    const rx = x * cyw + z * syw; let rz = -x * syw + z * cyw;
    const ry = y * cp - rz * sp; rz = y * sp + rz * cp;
    const sc = D / (D - rz * 0.9);
    if (sc <= 0 || sc > 6) continue;
    const sx = cx + rx * S * sc, sy = cy + ry * S * sc;
    if (sx < -20 || sx > s.W + 20 || sy < -20 || sy > s.H + 20) continue;
    const rad = Math.min(4.2, Math.max(0.55, s.sz[i] * sm * sc * 0.92));
    const c0 = s.cFrom[i], c1 = F.col[i];
    const layer = F.report && (role === 7 || role === 8 || (role >= 1 && role <= 4)) ? s.bk2 : s.bk;
    const put = (c, al) => {
      if (al < 0.02) return;
      layer[c * 10 + Math.min(9, Math.floor(al * 10))].push(sx, sy, rad);
      if (rad > 1.5) glow.push(c, sx, sy, rad, al);
    };
    // once the shape has formed, its line particles fade into the smooth stroke; on the next change they come back as a swarm
    const ad = a * (1 - 0.5 * (s.lfFrom[i] * pk + F.lf[i] * fk * rvI));
    if (c0 === c1 || e >= 1) put(c1, Math.min(1, ad));
    else { put(c0, Math.min(1, ad * (1 - e))); put(c1, Math.min(1, ad * e)); }
  }
  // soft halo behind larger points
  for (let g = 0; g < glow.length; g += 5) {
    const r = glow[g + 3] * 5;
    ctx.globalAlpha = glow[g + 4] * 0.5;
    ctx.drawImage(s.sprites[glow[g]], glow[g + 1] - r, glow[g + 2] - r, 2 * r, 2 * r);
  }
  ctx.globalAlpha = 1;
  // strokes: the new shape draws itself in, the previous one breaks apart quickly
  if (s.prevF && pk > 0.01) drawStrokes(s, ctx, s.prevF, pk, 1, P2);
  if (fk > 0) drawStrokes(s, ctx, F, fk, fk, P2);
  drawDots(ctx, s.bk);
  if (F.report) {
    drawGlass(s, ctx, F.report, P2, clamp01((now - s.t0) / GLASS_FADE_MS));
    drawDots(ctx, s.bk2);
    drawReport(s, ctx, F.report, P2);
  }
  drawLegend(s, ctx);
  drawLabels(s, ctx, F, agentC, now, P2);
  s.drawnOnce = true;
}

// legend: AI components vs. Kubernetes / infrastructure, while the network formations show
function drawLegend(s, ctx) {
  if (s.k < LEGEND_FORMS[0] || s.k > LEGEND_FORMS[1]) return;
  const lg = s.texts.labels.legend, x = s.W - 28;
  ctx.font = '500 11px ' + MONO; ctx.textBaseline = 'middle'; ctx.textAlign = 'right'; ctx.globalAlpha = 0.85;
  [[AI_LABEL, lg[0]], [INFRA_LABEL, lg[1]]].forEach((it, j) => {
    const y = 30 + j * 20;
    ctx.fillStyle = '#979899'; ctx.fillText(it[1], x, y);
    const w = ctx.measureText(it[1]).width;
    ctx.fillStyle = it[0]; ctx.beginPath(); ctx.arc(x - w - 10, y, 3.5, 0, 6.2832); ctx.fill();
  });
  ctx.globalAlpha = 1;
}

function drawLabels(s, ctx, F, agentC, now, P2) {
  const la = clamp01((now - s.t0 - LABEL_DELAY_MS) / LABEL_FADE_MS);
  if (la <= 0) return;
  ctx.font = '500 12px ' + MONO; ctx.textBaseline = 'middle';
  F.labels.forEach((lb) => {
    if (lb.key === 'root' && s.tSince < 0.92 * s.RV) return;
    const q = P2([lb.p[0] + lb.dx, lb.p[1] + lb.dy]);
    ctx.globalAlpha = la; ctx.fillStyle = lb.c; ctx.textAlign = lb.al; ctx.fillText(labelText(s, lb), q[0], q[1]);
  });
  F.agents.forEach((a, j) => {
    if (!a.name) return;
    const c = agentC[j], q = P2([c[0] - 0.11, c[1] - 0.1]);
    ctx.globalAlpha = la * 0.9; ctx.fillStyle = AGENT_LABEL; ctx.textAlign = 'right'; ctx.fillText(a.name, q[0], q[1]);
  });
  ctx.globalAlpha = 1;
}

/* ---------- wiring ---------- */

function bindPointer(s) {
  s.root.addEventListener('pointermove', (e) => {
    wake(s);
    const r = s.root.getBoundingClientRect();
    s.ptr.tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    s.ptr.ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
  });
  s.root.addEventListener('pointerleave', () => { s.ptr.tx = 0; s.ptr.ty = 0; });
}

function bindRail(s) {
  s.dom.rail.forEach((btn, i) => btn.addEventListener('click', () => { wake(s); toStep(s, i, s.reduce); }));
}

function bindVisibility(s) {
  s.visible = false;
  s.ioSeen = false;
  setTimeout(() => { if (!s.ioSeen) s.visible = true; }, VISIBLE_FALLBACK_MS);
  if (!('IntersectionObserver' in window)) { s.visible = true; return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((x) => {
      s.ioSeen = true;
      const was = s.visible;
      const now = x.isIntersecting && x.intersectionRatio > VISIBLE_RATIO;
      if (now && !was) wake(s);
      else if (!now && was) { s.visible = false; s.pausedAt = performance.now(); }
    });
  }, { threshold: [0, 0.25, 0.5] });
  io.observe(s.root);
}

function startTimers(s) {
  setInterval(() => {
    if (s.reduce || !s.visible || s.intro) return;
    if (s.chars < s.steps[s.step].cmd.length) update(s, { chars: s.chars + 1 });
  }, TYPE_INTERVAL_MS);
  setInterval(() => {
    if (!s.visible || s.reduce || s.intro) return;
    const p = Math.min(1, (performance.now() - s.stepAt) / DURATION_MS[s.step]);
    if (Math.abs(p - s.prog) > 0.02) update(s, { prog: p });
  }, PROGRESS_INTERVAL_MS);
}

function queryDom(root) {
  return {
    canvas: root.querySelector('[data-canvas]'),
    phaseNo: root.querySelector('[data-phase-no]'),
    mode: root.querySelector('[data-mode]'),
    title: root.querySelector('[data-title]'),
    hit: root.querySelector('[data-hit]'),
    cmd: root.querySelector('[data-cmd]'),
    rail: [...root.querySelectorAll('[data-rail]')],
    fills: [...root.querySelectorAll('[data-fill]')],
  };
}

export function mount(root) {
  const data = JSON.parse(root.querySelector('[data-engagement-data]').textContent);
  const dom = queryDom(root);
  const s = {
    root, dom, cv: dom.canvas, steps: data.steps, texts: data.texts,
    step: 0, chars: 0, prog: 0,
    ptr: { x: 0, y: 0, tx: 0, ty: 0 },
    reduce: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  };
  init(s);
  bindVisibility(s);
  bindPointer(s);
  bindRail(s);
  window.addEventListener('resize', () => resize(s));
  if (s.reduce) toStep(s, s.steps.length - 1, true);
  else { setForm(s, 0, true); s.stepAt = performance.now(); s.intro = true; update(s, { chars: 0 }); }
  startTimers(s);
  s.raf = requestAnimationFrame((n) => frame(s, n));
  return s;
}

const stage = document.querySelector('[data-engagement]');
if (stage) mount(stage);
