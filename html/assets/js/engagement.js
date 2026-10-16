// Engagement animation for the "02 / approach" section: a stylised black-box
// assessment. Agents map the target, the pentester takes over, exploits it and
// hands over a report. setPhase, schedule, newLayer, frame and drawNet are
// ported 1:1 from docs/design/design/Main.dc.html; only the component
// plumbing (state, DOM updates, event wiring) is new.

const TYPE_INTERVAL_MS = 55;
const ACCENT = '#268bd2';
const ALERT = '#dc322f';
const ALERT_LABEL = '#f2706c';
const LABEL = '#e4e5e5';
const METER_CURRENT = 'rgba(38, 139, 210, 0.45)';
const METER_IDLE = 'rgba(228, 229, 229, 0.12)';

// Merge a state patch and redraw the glass panel (replaces setState).
function update(s, patch) {
  Object.assign(s, patch);
  renderPanel(s);
}

function statusLabel(s, cur, last) {
  const strike = s.phase === 'strike';
  let label = cur.agent ? (cur.report ? 'drafting report' : 'agents collecting') : 'scanning';
  if (s.step === 2 && s.phase === 'think') label = 'handover · agents → pentester';
  if (s.phase === 'work') label = cur.agent ? (cur.report ? 'human review' : 'agents correlating') : 'probing';
  if (strike) label = cur.pwn ? 'access granted' : (cur.tag ? 'finding confirmed' : 'intel collected');
  if (strike && last) label = 'engagement closed · report delivered';
  return label;
}

function renderPrompts(s) {
  s.dom.prompts.forEach((p, i) => {
    const st = s.steps[i];
    const active = i === s.step;
    p.el.classList.toggle('is-active', active);
    p.el.classList.toggle('is-past', i < s.step);
    p.cmd.textContent = active ? st.cmd.slice(0, s.chars) : st.cmd;
    p.cursor.hidden = !(active && (s.chars < st.cmd.length || s.phase === 'think'));
    p.out.classList.toggle('is-visible', active && s.phase !== 'think');
    p.hit.hidden = !(active && s.phase === 'strike');
  });
}

function renderMeter(s) {
  const strike = s.phase === 'strike';
  s.dom.meter.forEach((seg, i) => {
    const lit = i < s.step || (i === s.step && strike);
    seg.style.background = lit ? (s.steps[i].pwn ? ALERT : ACCENT) : (i === s.step ? METER_CURRENT : METER_IDLE);
  });
  const label = s.T.meter_label.replace('{n}', s.step + 1).replace('{total}', s.steps.length);
  s.dom.meterGroup.setAttribute('aria-label', label);
}

function renderStatus(s) {
  const cur = s.steps[s.step];
  const last = s.step === s.steps.length - 1;
  const alarm = s.phase === 'strike' && cur.pwn;
  const dot = alarm ? ALERT : ACCENT;
  s.dom.statusDot.style.background = dot;
  s.dom.statusDot.style.boxShadow = '0 0 10px ' + dot;
  s.dom.statusLabel.textContent = statusLabel(s, cur, last);
  s.dom.statusLabel.style.color = alarm ? ALERT_LABEL : LABEL;
  s.dom.statusCount.textContent = (s.step + 1) + '/' + s.steps.length;
  s.dom.results.classList.toggle('is-done', last && s.phase === 'strike');
  s.dom.flash.hidden = !s.flash;
}

function renderPanel(s) {
  renderPrompts(s);
  renderMeter(s);
  renderStatus(s);
}

function setPhase(s, p) {
  s.phase = p;
  s.phaseAt = performance.now();
  if (p === 'strike') s.impactAt = s.phaseAt + 600;
  update(s, { phase: p });
}
function schedule(s) {
  const steps = s.steps;
  const cur = steps[s.step];
  const last = s.step === steps.length - 1;
  const key = !!cur.tag;
  const plan = { think: s.step === 2 ? 5800 : (s.step < 2 ? 5200 : (key ? 3600 : 2900)), work: s.step < 2 ? 3400 : (key ? 2800 : 1900), strike: last ? 6000 : (cur.pwn ? 3400 : (key ? 2400 : 1700)) };
  s.timer = setTimeout(() => {
    if (!s.playing) { s.timer = setTimeout(() => schedule(s), 250); return; }
    if (s.phase === 'think') { setPhase(s, 'work'); }
    else if (s.phase === 'work') {
      setPhase(s, 'strike');
      update(s, { chars: 999 });
      if (cur.pwn) { s.flashTimer = setTimeout(() => { update(s, { flash: true }); s.flashTimer = setTimeout(() => update(s, { flash: false }), 1000); }, 600); }
    } else {
      const next = last ? 0 : s.step + 1;
      const now = performance.now();
      s.trans = { from: s.layer, at: now, pwn: !!cur.pwn };
      newLayer(s, next, now);
      s.stepAt = now;
      s.netReset = next === 0;
      update(s, { step: next, chars: 0 });
      setPhase(s, 'think');
    }
    schedule(s);
  }, plan[s.phase]);
}
function newLayer(s, step, now) {
  const blobs = [];
  const n = 30 + step * 3;
  for (let k = 0; k < n; k++) {
    const d = Math.pow(Math.random(), 0.8);
    blobs.push({ a: Math.random() * Math.PI * 2, d: d * 0.85, r: 0.22 + Math.random() * 0.38, ph: Math.random() * 10, sp: 0.15 + Math.random() * 0.35, ox: 0, oy: 0 });
  }
  const base = Math.random() * Math.PI * 2;
  s.layer = { step: step, blobs: blobs, base: base, born: now, cx: (Math.random() - 0.5) * 0.12, cy: (Math.random() - 0.5) * 0.12 };
  s.tip = null;
}
function frame(s, now) {
  if (s.reduce && (s.nFrames = (s.nFrames || 0) + 1) > 120) return;
  if (!s.reduce && !s.playing) { s.raf = null; return; }
  s.raf = requestAnimationFrame((n) => frame(s, n));
  drawNet(s, now);
  const c = s.canvas;
  if (!c) return;
  const box = c.getBoundingClientRect();
  const dpr = c.getBoundingClientRect().width > 900 ? 1 : Math.min(window.devicePixelRatio || 1, 1.25);
  const dt = Math.min(0.05, Math.max(0.001, (now - (s.lastNow || now - 16)) / 1000));
  s.lastNow = now;
  const W = Math.round(box.width * dpr), H = Math.round(box.height * dpr);
  if (!W || !H) return;
  if (c.width !== W || c.height !== H) { c.width = W; c.height = H; }
  const ctx = c.getContext('2d');
  const S = Math.min(W, H) / 2, u = S / 300;
  const wide = W > H * 1.2;
  const wideS = W / H > 1.25;
  const OX = wideS ? W * 0.36 : W / 2, OY = H * 0.5;
  const t = now / 1000;
  const steps = s.steps;
  const L = s.layer;
  const cur = steps[L.step];
  const ph = s.phase;
  const pt = (now - s.phaseAt) / 1000;
  const A = [38, 139, 210], R = [220, 50, 47], T = [150, 160, 168];
  const rgba = (c3, a) => 'rgba(' + c3.map(Math.round).join(',') + ',' + Math.max(0, Math.min(1, a)).toFixed(3) + ')';
  const mix = (p, q, k) => [p[0] + (q[0] - p[0]) * k, p[1] + (q[1] - p[1]) * k, p[2] + (q[2] - p[2]) * k];
  const ease = (x) => (x < 0 ? 0 : x > 1 ? 1 : 1 - Math.pow(1 - x, 3));

  ctx.globalCompositeOperation = 'source-over';
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#282929';
  ctx.fillRect(0, 0, W, H);

  const drawCloud = (layer, scale, alpha, cxp, cyp, infect) => {
    const cR = S * 0.62 * scale;
    layer.blobs.forEach((b) => {
      const wob = 0.07 * Math.sin(t * b.sp * 0.7 + b.ph);
      const ang = b.a + 0.25 * Math.sin(t * b.sp * 0.6 + b.ph);
      const x = cxp + Math.cos(ang) * (b.d + wob) * cR + Math.sin(t * 0.4 + b.ph) * 5 * u;
      const y = cyp + Math.sin(ang) * (b.d + wob) * cR + Math.cos(t * 0.35 + b.ph) * 5 * u;
      const r = b.r * cR * (1 + 0.12 * Math.sin(t * 0.9 + b.ph * 2));
      let col = mix(T, [190, 200, 208], layer.step / 9);
      let k = 0;
      if (infect) {
        const dd = Math.hypot(x - infect.x, y - infect.y);
        k = Math.max(0, Math.min(1, (infect.wave - dd) / (cR * 0.45)));
        col = mix(col, infect.col, k);
      }
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, rgba(col, alpha * (0.075 + 0.07 * k)));
      g.addColorStop(0.55, rgba(col, alpha * (0.035 + 0.04 * k)));
      g.addColorStop(1, rgba(col, 0));
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    });
    return cR;
  };

  ctx.globalCompositeOperation = 'lighter';
  const cx = OX + L.cx * S, cy = OY + L.cy * S;
  if (s.trans) {
    const k = (now - s.trans.at) / 1500;
    if (k >= 1) s.trans = null;
    else {
      const fl = s.trans.from;
      const zc = mix(fl.inf ? [fl.inf.x, fl.inf.y, 0] : [OX, OY, 0], [OX, OY, 0], ease(k));
      drawCloud(fl, 1 + ease(k) * 2.4, 1 - ease(k), zc[0], zc[1], fl.inf ? { x: zc[0], y: zc[1], wave: 9999, col: s.trans.pwn ? R : A } : null);
    }
  }
  const grow = ease((now - L.born) / 1500);
  const impact = s.impactAt && now >= s.impactAt && ph === 'strike';
  const cR = S * 0.62 * (0.45 + 0.55 * grow);
  const baseX = OX + Math.cos(L.base) * S * 1.15, baseY = OY + Math.sin(L.base) * S * 1.15;
  const weakA = L.base;
  const weakX = cx + Math.cos(weakA) * cR * 0.78, weakY = cy + Math.sin(weakA) * cR * 0.78;
  let inf = null;
  if (impact) {
    const wave = (now - s.impactAt) / 1000 * cR * 1.1;
    inf = { x: cx + (weakX - cx) * 0.35, y: cy + (weakY - cy) * 0.35, wave: wave, col: cur.pwn ? R : A };
    L.inf = { x: inf.x, y: inf.y };
  }
  drawCloud(L, 0.45 + 0.55 * grow, grow, cx, cy, inf);

  const hot = impact && cur.pwn;
  const eInOut = (x) => 0.5 - 0.5 * Math.cos(Math.PI * Math.max(0, Math.min(1, x)));
  const eOut = (x) => { x = Math.max(0, Math.min(1, x)); return 1 - Math.pow(1 - x, 3); };
  const AG = [143, 192, 232];
  if (!s.ents) {
    s.ents = [{ id: 'pentester', human: true, idx: 0 }];
    for (let i = 0; i < 4; i++) s.ents.push({ id: 'agent-' + (i + 1), human: false, idx: i });
    s.ents.forEach((e, i) => { e.alpha = 0; e.trail = []; e.vx = 0; e.vy = 0; e.knockN = i * 2; e.move = null; e.tempo = e.human ? 1 : [0.82, 1.18, 0.95, 1.32][e.idx]; e.phaseOff = e.human ? 0 : [0, 0.37, 0.71, 0.19][e.idx]; });
  }
  if (s.entLayer !== L) {
    s.entLayer = L;
    s.ripples = []; s.replies = [];
    s.ents.forEach((e, i) => {
      if (e.sx !== undefined) { e.a = Math.atan2(e.sy - cy, e.sx - cx); e.r = Math.max(1.12, Math.hypot(e.sx - cx, e.sy - cy) / cR); }
      else { e.a = L.base + Math.PI * 0.6 + i * 1.3; e.r = 1.5 + i * 0.05; }
      e.move = null; e.striking = false; e.wait = now + (e.human ? 0 : 300 + e.phaseOff * 2600 + Math.random() * 700);
    });
    const nAg = Math.max(1, (s.steps[L.step].agentNames || [1, 2, 3, 4]).length);
    s.ents.forEach((e) => {
      if (e.human) return;
      e.home = L.base + Math.PI * 0.35 + e.idx * (Math.PI * 2 / nAg) + (e.idx % 2 ? 0.25 : -0.2);
      e.dirSign = e.idx % 2 ? 1 : -1;
      const P0x = s.ents[0];
      if (e.alpha < 0.2 && s.steps[L.step].assist && P0x.sx !== undefined) {
        e.sx = P0x.sx; e.sy = P0x.sy; e.a = Math.atan2(P0x.sy - cy, P0x.sx - cx); e.r = Math.max(1.1, Math.hypot(P0x.sx - cx, P0x.sy - cy) / cR);
        e.trail = []; e.vx = 0; e.vy = 0;
      } else if (e.alpha < 0.2) {
        e.a = e.home; e.r = 1.75;
        e.sx = cx + Math.cos(e.a) * cR * e.r; e.sy = cy + Math.sin(e.a) * cR * e.r;
        e.trail = []; e.vx = 0; e.vy = 0;
      }
    });
  }
  const humanOn = !cur.agent || !!cur.assist;
  const agentCount = cur.agent ? (cur.agentNames || []).length : 0;
  const replyHuman = ['denied', 'closed', '403', 'filtered', 'timeout', '401', 'reset', 'refused'];
  const replyHumanWork = s.T.work;
  const replyAgent = ['dns', 'cert', 'asn', 'whois', 'mx', 'txt', 'host', 'url', 'header', 'repo', 'title', 'tech'];
  const P0 = s.ents[0];
  const briefing = L.step === 2 && ph === 'think' && pt < 3.6;
  s.briefing = briefing;
  if (briefing && !s.briefInit) {
    s.briefInit = true;
    let sxs = 0, sys = 0, n = 0;
    s.ents.forEach((e) => { if (!e.human && e.alpha > 0.2 && e.sx !== undefined) { sxs += Math.cos(e.a); sys += Math.sin(e.a); n++; } });
    s.meetA = n ? Math.atan2(sys, sxs) : L.base + Math.PI * 0.85;
    const H0 = s.ents[0];
    if (H0.alpha < 0.2) { H0.a = s.meetA + 0.9; H0.r = 1.95; H0.sx = undefined; H0.trail = []; }
    H0.move = null;
  }
  if (!briefing) s.briefInit = false;
  const meetA = s.meetA || 0;
  s.ents.forEach((e) => {
    const on = e.human ? humanOn : (e.idx < agentCount || briefing);
    const near = (a) => e.a + Math.atan2(Math.sin(a - e.a), Math.cos(a - e.a));
    const go = (a, r, dur, onEnd) => { e.move = { a0: e.a, r0: e.r, a1: near(a), r1: r, t0: now, dur: dur * (e.tempo || 1) * (0.85 + Math.random() * 0.3), onEnd: onEnd }; };
    const knockAt = (a, work) => {
      const ex = cx + Math.cos(a) * cR * 0.8, ey = cy + Math.sin(a) * cR * 0.8;
      s.ripples.push({ x: ex, y: ey, at: now, big: work && e.human, agent: !e.human });
      const role = (cur.agentNames || [])[e.idx] || '';
      const rolePool = { 'osint': ['repo', 'docs', 'cert', 'people', 'tech', 'jobs'], 'dns-enum': ['mx', 'txt', 'cname', 'ns', 'sub', 'a'], 'port-scanning': ['22/tcp', '443/tcp', '8443', 'open', 'filtered', 'closed'], 'service-discovery': ['banner', 'tls', 'http', 'ssh', 'version', 'title'], 'report': ['finding', 'cvss', 'fix', 'repro'] }[role];
      const pool = e.human ? (work ? replyHumanWork : replyHuman) : (rolePool || replyAgent);
      s.replies.push({ x: cx + Math.cos(a) * cR * 1.04, y: cy + Math.sin(a) * cR * 1.04, at: now, text: pool[(e.knockN++ * 5 + e.idx * 3 + L.step) % pool.length], warm: work || !e.human });
    };
    const fadeK = 1 - Math.exp(-dt * 2.5);
    if (briefing) {
      e.alpha += (1 - e.alpha) * fadeK;
      if (e.human) {
        if (!e.move && (Math.abs(Math.atan2(Math.sin(e.a - meetA), Math.cos(e.a - meetA))) > 0.03 || Math.abs(e.r - 1.42) > 0.03)) { const sv = e.tempo; e.tempo = 1; go(meetA, 1.42, 1500, null); e.tempo = sv; }
      } else if (P0.sx !== undefined) {
        e.move = null;
        const ang = e.idx * (Math.PI / 2) + t * 0.35 + 0.4;
        const rad = (40 + 6 * Math.sin(t * 1.3 + e.idx)) * u;
        const tx2 = P0.sx + Math.cos(ang) * rad, ty2 = P0.sy + Math.sin(ang) * rad;
        const ta = Math.atan2(ty2 - cy, tx2 - cx), tr = Math.hypot(tx2 - cx, ty2 - cy) / cR;
        const k2 = 1 - Math.exp(-dt * (1.4 + e.idx * 0.25));
        e.a += Math.atan2(Math.sin(ta - e.a), Math.cos(ta - e.a)) * k2; e.r += (tr - e.r) * k2;
      }
    } else if (!on) {
      e.alpha += (0 - e.alpha) * fadeK;
      if (!e.human && P0.sx !== undefined && e.sx !== undefined) {
        e.move = null;
        const pa = Math.atan2(P0.sy - cy, P0.sx - cx), pr = Math.hypot(P0.sx - cx, P0.sy - cy) / cR;
        e.a += (e.a + Math.atan2(Math.sin(pa - e.a), Math.cos(pa - e.a)) - e.a) * fadeK; e.r += (pr - e.r) * fadeK;
      }
    } else if (ph === 'strike') {
      if (!e.striking && (e.human || now >= s.phaseAt + 150 + e.phaseOff * 1800)) {
        e.striking = true;
        if (!e.human && (cur.agentNames || [])[e.idx] === 'osint') go(e.home + 0.3, 1.55, 1800, null);
        else if (e.human && cur.pwn) go(weakA, 0.32, 650, null);
        else if (cur.report) go(e.human ? weakA : e.home, 0.55, 1100, null);
        else { const sa = e.human ? weakA : e.home + Math.atan2(Math.sin(weakA - e.home), Math.cos(weakA - e.home)) * 0.55; go(sa, 0.86, 600, () => { knockAt(e.a, true); go(e.a + (e.human ? 0.2 : (e.dirSign || 1) * 0.25), 1.2, 1100, null); }); }
      }
      if (e.human && cur.pwn && pt > 0.65) e.alpha += (0 - e.alpha) * fadeK; else e.alpha += (1 - e.alpha) * fadeK;
    } else {
      e.striking = false;
      e.alpha += (1 - e.alpha) * fadeK;
      if (!e.move && now >= (e.wait || 0)) {
        if (!e.human) {
          const role = (cur.agentNames || [])[e.idx] || 'osint';
          const dHome = Math.atan2(Math.sin(weakA - e.home), Math.cos(weakA - e.home));
          const center = ph === 'work' ? e.home + dHome * 0.3 : e.home;
          const R1 = () => Math.random();
          if (role === 'osint') {
            if (R1() < 0.3) {
              const a = center + (R1() - 0.5) * 1.2;
              go(a, 1.22, 1600, () => { knockAt(a, false); go(a + e.dirSign * 0.4, 1.6 + R1() * 0.2, 2200, null); });
            } else {
              e.dirSign = R1() < 0.5 ? -1 : 1;
              go(center + e.dirSign * (0.3 + R1() * 0.7), 1.5 + R1() * 0.35, 2600 + R1() * 1400, null);
            }
            e.wait = now + 200 + R1() * 1500;
          } else if (role === 'dns-enum') {
            e.dirSign = -e.dirSign;
            const a0 = center + e.dirSign * (0.5 + R1() * 0.3);
            go(a0, 0.93, 900, () => { go(a0 - e.dirSign * (1.0 + R1() * 0.4), 0.94, 2200 + R1() * 600, () => { go(e.a - e.dirSign * 0.15, 1.18, 900, null); }); });
            e.wait = now + 300 + R1() * 900;
          } else if (role === 'port-scanning') {
            e.portA = (e.portA === undefined ? center - 0.6 : e.portA + 0.19);
            if (e.portA > center + 0.7) e.portA = center - 0.7;
            const a = e.portA;
            go(a, 1.06, 420, () => { go(a, 0.85, 260, () => { knockAt(a, ph === 'work'); go(a, 1.06, 300, null); }); });
            e.wait = now + 90 + R1() * 120;
          } else {
            const a = center + (R1() - 0.5) * 0.9;
            go(a, 0.9, 1300, () => { knockAt(a, ph === 'work'); e.wait = now + 900 + R1() * 900; go(a + e.dirSign * 0.08, 0.92, 1400, () => { go(a + e.dirSign * 0.3, 1.25, 1200, null); }); });
            e.wait = now + 400 + R1() * 1200;
          }
        } else if (ph === 'think') {
          const spread = 0;
          const target = ph === 'work' ? weakA + (e.idx - 1.5) * 0.35 : null;
          if (e.r > 1.0 && e.knockN % 3 !== 2) {
            const a = target !== null ? target + (Math.random() - 0.5) * 0.2 : e.a + 0.25 + Math.random() * 0.35;
            go(a, 0.84, e.human ? 700 : 520, () => { knockAt(a, ph === 'work'); go(a + (e.human ? 0.3 : 0.45), e.human ? 1.24 : 1.18, e.human ? 900 : 700, null); });
          } else {
            e.knockN++;
            const a = target !== null ? target : e.a + 0.7 + Math.random() * 0.5 + spread * 0;
            go(a, 1.26 + Math.random() * 0.14, e.human ? 1300 : 900, null);
          }
          if (!e.human) e.wait = now + 80 + Math.random() * 260;
        } else {
          const dd = Math.abs(Math.atan2(Math.sin(e.a - weakA), Math.cos(e.a - weakA)));
          if (dd > 0.05 || e.r > 1.1) {
            const d = Math.atan2(Math.sin(weakA - e.a), Math.cos(weakA - e.a));
            go(e.a + d, 1.05, 700 + Math.abs(d) * 650, null);
          } else {
            go(weakA, 0.84, 380, () => { knockAt(weakA, true); go(weakA + 0.02, 1.02, 480, null); });
          }
        }
      }
    }
    if (!e.human && on && !briefing && ph !== 'strike' && ((cur.agentNames || [])[e.idx] === 'dns-enum') && e.r < 0.97 && now > (e.nextTap || 0)) {
      knockAt(e.a, false);
      e.nextTap = now + 260 + Math.random() * 320;
    }
    if (e.move) {
      const mv = e.move;
      const k = (now - mv.t0) / mv.dur;
      const q = eInOut(k);
      e.a = mv.a0 + (mv.a1 - mv.a0) * q;
      e.r = mv.r0 + (mv.r1 - mv.r0) * q;
      if (k >= 1) { e.move = null; if (mv.onEnd) mv.onEnd(); }
    }
    const drift = (e.human ? 5 : 8) * u;
    let ax = cx + Math.cos(e.a) * cR * e.r + Math.sin(t * 0.55 + 1.3 + e.idx) * drift;
    let ay = cy + Math.sin(e.a) * cR * e.r + Math.cos(t * 0.47 + e.idx * 2) * drift;
    if (e.human && s.mouse && s.follow > 0.001) { ax += (s.mouse.x - ax) * s.follow; ay += (s.mouse.y - ay) * s.follow; }
    if (e.sx === undefined) { e.sx = ax; e.sy = ay; }
    const sm = 1 - Math.exp(-dt * (e.human ? 9 : 11));
    const nx2 = e.sx + (ax - e.sx) * sm, ny2 = e.sy + (ay - e.sy) * sm;
    const vs = 1 - Math.exp(-dt * 6);
    e.vx += ((nx2 - e.sx) - e.vx) * vs; e.vy += ((ny2 - e.sy) - e.vy) * vs;
    e.sx = nx2; e.sy = ny2;
    e.trail.push({ x: e.sx, y: e.sy });
    if (e.trail.length > (e.human ? 34 : 22)) e.trail.shift();
  });
  if (s.mouse && ph !== 'strike' && humanOn) {
    const age = (now - s.mouse.t) / 1000;
    const inf = age < 2.5 ? 0.6 * (1 - age / 2.5) : 0;
    s.follow = (s.follow || 0) + (inf - (s.follow || 0)) * (1 - Math.exp(-dt * 3));
  } else {
    s.follow = (s.follow || 0) * Math.exp(-dt * 3);
  }

  s.ripples = s.ripples.filter((r) => now - r.at < 1400);
  s.ripples.forEach((r) => {
    const k = eOut((now - r.at) / 1400);
    const rad = (r.big ? 40 : (r.agent ? 18 : 26)) * u * (0.25 + k);
    const c3 = r.big ? [200, 220, 240] : (r.agent ? AG : [170, 180, 188]);
    const g = ctx.createRadialGradient(r.x, r.y, 0, r.x, r.y, rad);
    g.addColorStop(0, rgba(c3, 0.3 * (1 - k)));
    g.addColorStop(1, rgba(T, 0));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(r.x, r.y, rad, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = rgba(r.big ? A : c3, 0.4 * (1 - k)); ctx.lineWidth = 1 * dpr;
    ctx.beginPath(); ctx.arc(r.x, r.y, rad * 1.15, 0, Math.PI * 2); ctx.stroke();
  });
  if (ph === 'work' && humanOn && !cur.agent) {
    const pulse = 0.5 + 0.5 * Math.sin(t * 3.2);
    const wx = cx + Math.cos(weakA) * cR * 0.8, wy = cy + Math.sin(weakA) * cR * 0.8;
    const g = ctx.createRadialGradient(wx, wy, 0, wx, wy, (28 + 12 * pulse) * u);
    g.addColorStop(0, rgba(A, (0.18 + 0.16 * pulse) * Math.min(1, pt))); g.addColorStop(1, rgba(A, 0));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(wx, wy, (28 + 12 * pulse) * u, 0, Math.PI * 2); ctx.fill();
  }

  s.mtrail = s.mtrail.filter((q) => now - q.t < 900);
  if (s.mtrail.length > 1) {
    ctx.lineCap = 'round';
    for (let i = 1; i < s.mtrail.length; i++) {
      const q0 = s.mtrail[i - 1], q1 = s.mtrail[i];
      const k = 1 - (now - q1.t) / 900;
      ctx.strokeStyle = rgba(A, 0.55 * k * k);
      ctx.lineWidth = (1 + 7 * k) * u;
      ctx.shadowColor = rgba(A, 0.9); ctx.shadowBlur = 16 * k;
      ctx.beginPath(); ctx.moveTo(q0.x, q0.y); ctx.lineTo(q1.x, q1.y); ctx.stroke();
    }
    ctx.shadowBlur = 0;
  }

  s.ents.forEach((e) => {
    if (e.alpha < 0.01) return;
    const col = e.human ? (hot ? R : A) : AG;
    e.trail.forEach((p, i) => {
      const k = i / e.trail.length;
      ctx.fillStyle = rgba(col, (e.human ? 0.07 : 0.06) * k * k * e.alpha);
      ctx.beginPath(); ctx.arc(p.x, p.y, ((e.human ? 3 : 2) + (e.human ? 8 : 4) * k) * u, 0, Math.PI * 2); ctx.fill();
    });
    const sp = Math.min(1, Math.hypot(e.vx, e.vy) / (6 * u));
    const dir = Math.atan2(e.vy, e.vx);
    const body = (e.human ? 12 : 6.5) * u;
    ctx.save();
    ctx.translate(e.sx, e.sy);
    ctx.rotate(dir);
    ctx.scale(1 + sp * 0.35, 1 - sp * 0.18);
    ctx.beginPath();
    for (let j = 0; j <= 40; j++) {
      const th = (j / 40) * Math.PI * 2;
      const rr = body * (1 + 0.09 * Math.sin(3 * th + t * 1.3 + e.idx) + 0.06 * Math.sin(5 * th - t * 1.7) + 0.035 * Math.sin(7 * th + t * 2.2));
      const x = Math.cos(th) * rr, y = Math.sin(th) * rr;
      if (j === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    const bg = ctx.createRadialGradient(0, 0, 0, 0, 0, body * 1.3);
    bg.addColorStop(0, rgba([235, 242, 250], 0.92 * e.alpha));
    bg.addColorStop(0.35, rgba(col, 0.7 * e.alpha));
    bg.addColorStop(1, rgba(col, 0.04 * e.alpha));
    ctx.fillStyle = bg;
    ctx.shadowColor = rgba(col, 0.85); ctx.shadowBlur = (e.human ? 24 : 14) * dpr;
    ctx.fill();
    ctx.restore();
    ctx.shadowBlur = 0;
  });
  if (briefing && P0.sx !== undefined) {
    const bk = Math.min(1, Math.max(0, pt - 0.9) / 0.8) * Math.min(1, (3.6 - pt) / 0.6);
    s.ents.forEach((e) => {
      if (e.human || e.alpha < 0.05) return;
      const d = Math.hypot(P0.sx - e.sx, P0.sy - e.sy);
      if (d > 90 * u) return;
      ctx.strokeStyle = rgba(AG, 0.35 * bk); ctx.lineWidth = 1 * dpr;
      ctx.beginPath(); ctx.moveTo(e.sx, e.sy); ctx.lineTo(P0.sx, P0.sy); ctx.stroke();
      for (let j = 0; j < 3; j++) {
        const k = ((t * 1.1) + j / 3 + e.idx * 0.13) % 1;
        const x = e.sx + (P0.sx - e.sx) * k, y = e.sy + (P0.sy - e.sy) * k;
        const g = ctx.createRadialGradient(x, y, 0, x, y, 5 * u);
        g.addColorStop(0, rgba([235, 242, 250], 0.9 * bk)); g.addColorStop(1, rgba(AG, 0));
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 5 * u, 0, Math.PI * 2); ctx.fill();
      }
    });
    const g = ctx.createRadialGradient(P0.sx, P0.sy, 0, P0.sx, P0.sy, 40 * u);
    g.addColorStop(0, rgba(AG, 0.22 * bk * (0.7 + 0.3 * Math.sin(t * 5)))); g.addColorStop(1, rgba(AG, 0));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(P0.sx, P0.sy, 40 * u, 0, Math.PI * 2); ctx.fill();
  }
  const wk = { x: cx + Math.cos(weakA) * cR * 0.8, y: cy + Math.sin(weakA) * cR * 0.8 };

  if (impact) {
    const k = Math.min(1, (now - s.impactAt) / 1200);
    const g = ctx.createRadialGradient(inf.x, inf.y, 0, inf.x, inf.y, cR * (0.3 + 1.1 * k));
    g.addColorStop(0, rgba(inf.col, 0.5 * (1 - k) + 0.12));
    g.addColorStop(1, rgba(inf.col, 0));
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(inf.x, inf.y, cR * (0.3 + 1.1 * k), 0, Math.PI * 2); ctx.fill();
    if (k < 1) {
      ctx.strokeStyle = rgba(inf.col, 0.6 * (1 - k)); ctx.lineWidth = 2 * dpr; ctx.shadowColor = rgba(inf.col, 1); ctx.shadowBlur = 18 * dpr;
      ctx.beginPath(); ctx.arc(inf.x, inf.y, k * S * 1.2, 0, Math.PI * 2); ctx.stroke();
    }
  }

  ctx.globalCompositeOperation = 'source-over';
  ctx.shadowBlur = 0;
  const fs = Math.round(12 * u * dpr / Math.max(1, dpr * 0.75)) || 12;
  ctx.font = fs + 'px "IBM Plex Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = rgba([192, 193, 193], 0.85 * grow);
  {
    const sinceS = (now - (s.stepAt || now)) / 1000;
    const fa = Math.min(1, Math.max(0, sinceS / 0.9));
    const lx = 36 * u, ly = 40 * u;
    const st = steps[L.step];
    const ai = st.agent && !st.assist;
    ctx.save();
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    try { ctx.letterSpacing = Math.round(3 * u) + 'px'; } catch (e) {}
    ctx.font = Math.round(11 * u) + 'px "IBM Plex Mono", monospace';
    ctx.fillStyle = 'rgba(151,152,153,' + (0.9 * fa).toFixed(3) + ')';
    ctx.fillText('PHASE ' + String(L.step + 1).padStart(2, '0') + ' / ' + String(steps.length).padStart(2, '0'), lx, ly);
    try { ctx.letterSpacing = Math.round(5 * u) + 'px'; } catch (e) {}
    ctx.font = '500 ' + Math.round(30 * u) + 'px "IBM Plex Mono", monospace';
    const title = st.depth.toUpperCase();
    ctx.fillStyle = 'rgba(228,229,229,' + (0.95 * fa).toFixed(3) + ')';
    ctx.shadowColor = 'rgba(38,139,210,0.45)'; ctx.shadowBlur = 18 * u * fa;
    ctx.fillText(title, lx, ly + 40 * u - (1 - fa) * 8 * u);
    ctx.shadowBlur = 0;
    const tw = Math.min(ctx.measureText(title).width, W * 0.55);
    const prog = (L.step + (ph === 'strike' ? 1 : (ph === 'work' ? 0.6 : 0.25))) / steps.length;
    ctx.fillStyle = 'rgba(228,229,229,0.08)';
    ctx.fillRect(lx, ly + 54 * u, tw, 2 * u);
    ctx.fillStyle = rgba(cur.pwn && ph === 'strike' ? R : A, 0.9 * fa);
    s.phaseBar = (s.phaseBar || 0) + (prog - (s.phaseBar || 0)) * (1 - Math.exp(-dt * 2));
    ctx.fillRect(lx, ly + 54 * u, tw * s.phaseBar, 2 * u);
    try { ctx.letterSpacing = Math.round(2 * u) + 'px'; } catch (e) {}
    ctx.font = Math.round(11 * u) + 'px "IBM Plex Mono", monospace';
    ctx.fillStyle = ai ? 'rgba(143,192,232,' + (0.9 * fa).toFixed(3) + ')' : 'rgba(151,152,153,' + (0.8 * fa).toFixed(3) + ')';
    ctx.fillText(ai ? s.T.cv.ai : (st.assist ? s.T.cv.assist : s.T.cv.manual), lx, ly + 76 * u);
    try { ctx.letterSpacing = '0px'; } catch (e) {}
    ctx.restore();
    ctx.textAlign = 'center';
  }
  if (cur.agentNames) s.lastNames = cur.agentNames;
  s.ents.forEach((e) => {
    if (e.alpha < 0.05) return;
    ctx.fillStyle = e.human ? rgba(hot ? R : A, 0.95 * e.alpha) : rgba([143, 192, 232], 0.8 * e.alpha);
    ctx.font = (e.human ? fs : Math.round(fs * 0.85)) + 'px "IBM Plex Mono", monospace';
    ctx.fillText(e.human ? 'pentester' : ((cur.agentNames || [])[e.idx] || (s.lastNames || [])[e.idx] || 'agent'), e.sx, e.sy - (e.human ? 26 : 16) * u);
  });
  ctx.font = fs + 'px "IBM Plex Mono", monospace';
  if (s.briefing && s.ents[0].sx !== undefined) {
    ctx.fillStyle = rgba([143, 192, 232], 0.85);
    ctx.fillText(s.T.cv.handover, s.ents[0].sx, s.ents[0].sy + 30 * u);
  }
  s.replies = s.replies.filter((r) => now - r.at < 1300);
  s.replies.forEach((r) => {
    const k = (now - r.at) / 1300;
    ctx.fillStyle = r.warm ? rgba([228, 229, 229], 0.9 * (1 - k)) : rgba([151, 152, 153], 0.85 * (1 - k));
    ctx.fillText(r.text, r.x, r.y - k * 14 * u);
  });
  if (ph === 'work' && !cur.agent) {
    ctx.fillStyle = rgba([228, 229, 229], 0.9);
    ctx.fillText(s.T.cv.weak, wk.x, wk.y + 44 * u);
  }
}
function drawNet(s, now) {
  const c = s.net;
  if (!c) return;
  const box = c.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const W = Math.round(box.width * dpr), H = Math.round(box.height * dpr);
  if (!W || !H) return;
  if (c.width !== W || c.height !== H) { c.width = W; c.height = H; }
  const ctx = c.getContext('2d');
  const t = now / 1000;
  const dt = Math.min(0.05, Math.max(0.001, (now - (s.netLast || now - 16)) / 1000));
  s.netLast = now;
  const step = s.step;
  const strike = s.phase === 'strike';
  const since = (now - (s.stepAt || now)) / 1000;
  const A = [38, 139, 210], R = [220, 50, 47];
  const rgba = (c3, a) => 'rgba(' + c3.join(',') + ',' + Math.max(0, Math.min(1, a)).toFixed(3) + ')';
  const N = {
    inet: { x: 0, y: 60, s: -1, o: -1, l: 'internet' },
    dns: { x: 16, y: 64, s: 0, d: 0.2, o: 0, l: 'dns' },
    www: { x: 34, y: 18, s: 0, d: 1.2, l: 'www' },
    mail: { x: 34, y: 42, s: 0, d: 2.6, l: 'mail' },
    portal: { x: 34, y: 66, s: 0, d: 0.7, o: 0, l: 'portal' },
    vpn: { x: 34, y: 104, s: 0, d: 3.8, l: 'vpn' },
    ldap: { x: 120, y: 110, s: 0, d: 5.6, l: 'ldap' },
    cdn: { x: 56, y: 10, s: 1, d: 0.6, l: 'cdn' },
    api: { x: 58, y: 38, s: 1, d: 1.7, l: 'api' },
    host: { x: 58, y: 66, s: 1, d: 2.4, o: 1, l: 'app-host' },
    sso: { x: 56, y: 110, s: 1, d: 3.2, l: 'sso' },
    k8s: { x: 128, y: 20, s: 1, d: 4.1, l: 'k8s' },
    web: { x: 100, y: 74, s: 1, d: 4.9, o: 3, l: 'web-app' },
    svc: { x: 82, y: 50, s: 1, d: 5.8, o: 2, l: 'svc :8443' },
    git: { x: 146, y: 70, s: 1, d: 6.6, l: 'git' },
    ssh: { x: 82, y: 88, s: 1, d: 7.4, l: 'ssh' },
    db: { x: 122, y: 92, s: 3, d: 0.8, o: 3, hot: 1, l: 'db' },
    srv: { x: 106, y: 40, s: 4, d: 0.5, o: 4, hot: 1, l: 'server' },
    u1: { x: 78, y: 8, s: 99 }, u2: { x: 80, y: 112, s: 99 }, u3: { x: 102, y: 16, s: 99 }, u4: { x: 142, y: 36, s: 99 },
    u5: { x: 144, y: 104, s: 99 }, u6: { x: 166, y: 52, s: 99 }, u7: { x: 170, y: 92, s: 99 }, u8: { x: 188, y: 24, s: 99 },
    u9: { x: 192, y: 70, s: 99 }, u10: { x: 186, y: 112, s: 99 }, u11: { x: 124, y: 58, s: 99 }
  };
  const E = [['inet', 'dns'], ['dns', 'www'], ['dns', 'mail'], ['dns', 'portal'], ['dns', 'vpn'], ['www', 'cdn'], ['mail', 'api'], ['portal', 'api'], ['portal', 'host'], ['vpn', 'sso'],
    ['cdn', 'u1'], ['u1', 'u3'], ['api', 'u3'], ['u3', 'k8s'], ['host', 'svc'], ['host', 'ssh'], ['host', 'web'], ['sso', 'u2'], ['u2', 'ldap'], ['ssh', 'u2'],
    ['svc', 'srv'], ['web', 'db'], ['web', 'u11'], ['u11', 'git'], ['k8s', 'u4'], ['srv', 'u4'], ['srv', 'u11'], ['ldap', 'u5'], ['db', 'u5'],
    ['u4', 'u6'], ['git', 'u6'], ['git', 'u7'], ['u5', 'u7'], ['u6', 'u8'], ['u6', 'u9'], ['u7', 'u9'], ['u7', 'u10']];
  const revealT = (n) => (n.s < 0 ? -1 : (n.s < step ? -1 : (n.s === step ? n.d || 0 : Infinity)));
  const known = (n) => n.s < 0 || (n.s < 99 && (n.s < step || (n.s === step && since >= (n.d || 0))));
  const popK = (n) => { const r = revealT(n); return r >= 0 && r !== Infinity ? Math.max(0, Math.min(1, (since - r) / 0.9)) : (known(n) ? 1 : 0); };
  const owned = (n) => n.o !== undefined && (n.o < 0 || n.o < step || (n.o === step && strike));
  const hot = (n) => !!n.hot && owned(n);
  const info = step <= 1 || step >= 5;
  let front = 0;
  Object.keys(N).forEach((k) => { const n = N[k]; if (n.o !== undefined && n.o <= step) front = Math.max(front, n.x); });
  const tgtW = info ? 204 : 118;
  const tgtC = info ? 98 : Math.max(tgtW / 2 - 4, front - tgtW * 0.25);
  if (s.netW === undefined) { s.netW = tgtW; s.netCam = tgtC; }
  const ck = 1 - Math.exp(-dt * 1.2);
  s.netW += (tgtW - s.netW) * ck; s.netCam += (tgtC - s.netCam) * ck;
  const viewW = s.netW;
  const padX = 22 * dpr, padT = 12 * dpr, padB = 28 * dpr;
  const sx = (W - padX * 2) / viewW;
  const P = (n) => ({ x: padX + (n.x - (s.netCam - viewW / 2)) * sx, y: padT + (n.y / 120) * (H - padT - padB) });
  const edgeFade = (x) => Math.max(0, Math.min(1, Math.min(x, W - x) / (36 * dpr)));
  const bez = (pa, pb, k) => {
    const dx = (pb.x - pa.x) * 0.5, u2 = 1 - k;
    return { x: u2 * u2 * u2 * pa.x + 3 * u2 * u2 * k * (pa.x + dx) + 3 * u2 * k * k * (pb.x - dx) + k * k * k * pb.x, y: u2 * u2 * u2 * pa.y + 3 * u2 * u2 * k * pa.y + 3 * u2 * k * k * pb.y + k * k * k * pb.y };
  };
  ctx.clearRect(0, 0, W, H);
  ctx.lineCap = 'round';
  E.forEach(([a, b]) => {
    const na = N[a], nb = N[b], pa = P(na), pb = P(nb);
    const f = Math.min(edgeFade(pa.x), edgeFade(pb.x));
    if (f <= 0) return;
    const both = owned(na) && owned(nb);
    const frontier = owned(na) && nb.o === step && !owned(nb) && known(nb);
    const vis = Math.min(popK(na), popK(nb));
    const dx = (pb.x - pa.x) * 0.5;
    ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.bezierCurveTo(pa.x + dx, pa.y, pb.x - dx, pb.y, pb.x, pb.y);
    ctx.lineWidth = (both ? 1.5 : 1) * dpr;
    if (both) { ctx.strokeStyle = rgba(hot(nb) ? R : A, 0.55 * f); ctx.shadowColor = rgba(hot(nb) ? R : A, 0.8); ctx.shadowBlur = 6 * dpr; }
    else if (frontier) { ctx.strokeStyle = rgba(A, 0.35 * f); ctx.shadowBlur = 0; }
    else { ctx.strokeStyle = 'rgba(228,229,229,' + ((0.035 + 0.1 * vis) * f).toFixed(3) + ')'; ctx.shadowBlur = 0; }
    ctx.stroke();
    ctx.shadowBlur = 0;
    if (frontier) {
      for (let j = 0; j < 2; j++) {
        const q = bez(pa, pb, ((t * 0.45) + j * 0.5) % 1);
        const g = ctx.createRadialGradient(q.x, q.y, 0, q.x, q.y, 7 * dpr);
        g.addColorStop(0, rgba(A, 0.9 * f)); g.addColorStop(1, rgba(A, 0));
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(q.x, q.y, 7 * dpr, 0, Math.PI * 2); ctx.fill();
      }
    }
  });
  ctx.font = Math.round(10.5 * dpr) + 'px "IBM Plex Mono", monospace';
  ctx.textBaseline = 'top';
  ctx.textAlign = 'center';
  Object.keys(N).forEach((key) => {
    const n = N[key], p = P(n);
    const f = edgeFade(p.x);
    if (f <= 0) return;
    const o = owned(n), pk = popK(n), h = hot(n), cur = n.o === step && !o;
    const col = h ? R : A;
    if (pk <= 0) {
      ctx.fillStyle = 'rgba(228,229,229,' + (0.12 * f).toFixed(3) + ')';
      ctx.beginPath(); ctx.arc(p.x, p.y, 1.8 * dpr, 0, Math.PI * 2); ctx.fill();
      return;
    }
    if (pk < 1) {
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, (6 + 20 * pk) * dpr);
      g.addColorStop(0, rgba([143, 192, 232], 0.5 * (1 - pk) * f)); g.addColorStop(1, rgba([143, 192, 232], 0));
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, (6 + 20 * pk) * dpr, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = rgba([143, 192, 232], 0.6 * (1 - pk) * f); ctx.lineWidth = 1 * dpr;
      ctx.beginPath(); ctx.arc(p.x, p.y, (4 + 14 * pk) * dpr, 0, Math.PI * 2); ctx.stroke();
    }
    if (cur && known(n)) {
      const pulse = 0.5 + 0.5 * Math.sin(t * 2.4);
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, (12 + 6 * pulse) * dpr);
      g.addColorStop(0, rgba(A, (0.28 + 0.12 * pulse) * f)); g.addColorStop(1, rgba(A, 0));
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, (12 + 6 * pulse) * dpr, 0, Math.PI * 2); ctx.fill();
    }
    if (o) {
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 11 * dpr);
      g.addColorStop(0, rgba(col, (h ? 0.45 : 0.3) * f)); g.addColorStop(1, rgba(col, 0));
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, 11 * dpr, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = rgba(col, f);
      ctx.beginPath(); ctx.arc(p.x, p.y, 3.6 * dpr, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.strokeStyle = 'rgba(228,229,229,' + (0.55 * pk * f).toFixed(3) + ')';
      ctx.lineWidth = 1 * dpr;
      ctx.beginPath(); ctx.arc(p.x, p.y, 3.4 * pk * dpr, 0, Math.PI * 2); ctx.stroke();
    }
    if (n.l) {
      const la = (o ? 0.9 : 0.72) * pk * f;
      ctx.fillStyle = o && h ? 'rgba(232,129,125,' + la.toFixed(3) + ')' : (o ? 'rgba(228,229,229,' + la.toFixed(3) + ')' : 'rgba(170,171,172,' + la.toFixed(3) + ')');
      ctx.fillText(n.l, p.x, p.y + 9 * dpr);
    }
  });
  ctx.textAlign = 'left';
}

function toCanvas(s, e) {
  if (!s.canvas) return null;
  const r = s.canvas.getBoundingClientRect();
  const sx = s.canvas.width / (r.width || 1), sy = s.canvas.height / (r.height || 1);
  return { x: (e.clientX - r.left) * sx, y: (e.clientY - r.top) * sy };
}

// Mouse: trail and the pentester follows; click = knock on the target.
function bindPointer(s, wrap) {
  wrap.addEventListener('pointermove', (e) => {
    const p = toCanvas(s, e); if (!p) return;
    const now = performance.now();
    s.mouse = { x: p.x, y: p.y, t: now };
    s.mtrail.push({ x: p.x, y: p.y, t: now });
    if (s.mtrail.length > 60) s.mtrail.shift();
  });
  wrap.addEventListener('pointerleave', () => { s.mouse = null; });
  wrap.addEventListener('pointerdown', (e) => {
    const p = toCanvas(s, e); if (!p || !s.ripples) return;
    const now = performance.now();
    s.ripples.push({ x: p.x, y: p.y, at: now, big: true });
    if (s.replies) s.replies.push({ x: p.x, y: p.y - 24, at: now, text: 'ping', warm: true });
  });
}

function resume(s) {
  if (!s.raf) s.raf = requestAnimationFrame((n) => frame(s, n));
}

// Pause timeline and rendering while the stage is off screen or the tab is hidden.
function bindVisibility(s, stage) {
  let inView = true;
  const apply = () => {
    const on = inView && !document.hidden;
    if (on === s.playing) return;
    s.playing = on;
    if (on) resume(s);
  };
  new IntersectionObserver((entries) => { inView = entries[0].isIntersecting; apply(); }).observe(stage);
  document.addEventListener('visibilitychange', apply);
}

function queryDom(root) {
  return {
    wrap: root.querySelector('[data-canvas-wrap]'),
    canvas: root.querySelector('[data-canvas]'),
    net: root.querySelector('[data-net]'),
    flash: root.querySelector('[data-flash]'),
    statusDot: root.querySelector('[data-status-dot]'),
    statusLabel: root.querySelector('[data-status-label]'),
    statusCount: root.querySelector('[data-status-count]'),
    meterGroup: root.querySelector('[data-meter]'),
    meter: Array.from(root.querySelectorAll('[data-meter-seg]')),
    prompts: Array.from(root.querySelectorAll('[data-prompt]')).map((el) => ({
      el,
      cmd: el.querySelector('[data-cmd]'),
      cursor: el.querySelector('[data-cursor]'),
      out: el.querySelector('[data-out]'),
      hit: el.querySelector('[data-hit]'),
    })),
    results: document.querySelector('[data-results]'),
  };
}

function start(s) {
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  s.reduce = reduce;
  s.trans = null;
  s.impactAt = 0;
  newLayer(s, s.step, performance.now());
  if (reduce) {
    const lastStep = s.steps.length - 1;
    update(s, { step: lastStep, phase: 'strike', chars: 999, playing: false });
    newLayer(s, lastStep, performance.now() - 5000);
    s.impactAt = performance.now() - 5000;
  }
  s.raf = requestAnimationFrame((n) => frame(s, n));
  if (reduce) return;
  s.typer = setInterval(() => {
    if (s.playing && s.phase !== 'strike') {
      const st = s.steps[s.step];
      if (s.chars < st.cmd.length) update(s, { chars: s.chars + 1 });
    }
  }, TYPE_INTERVAL_MS);
  s.stepAt = performance.now();
  setPhase(s, 'think');
  schedule(s);
}

export function mount(root) {
  const data = JSON.parse(root.querySelector('[data-engagement-data]').textContent);
  const dom = queryDom(root);
  const s = {
    steps: data.steps,
    T: data.texts,
    dom,
    canvas: dom.canvas,
    net: dom.net,
    step: 0,
    phase: 'think',
    phaseAt: 0,
    chars: 0,
    playing: true,
    flash: false,
    mtrail: [],
  };
  bindPointer(s, dom.wrap);
  start(s);
  if (!s.reduce) bindVisibility(s, root);
  return s;
}

const stage = document.querySelector('[data-engagement]');
if (stage) mount(stage);
