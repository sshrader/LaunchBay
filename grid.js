'use strict';
// The astronauts for Launch Bay: eight original characters drawn as 48 x 48 portraits behind a helmet visor, plus a one-of-one Titan for the flagship.
// Everything is drawn here with a tiny rasterizer and a PNG encoder: no libraries, no image files.
const crypto = require('crypto');
const { encodePng } = require('./isorender');

const N = 48;
const INK = '#141018';
const SKINS = [['#f0cfae', '#d9a98a'], ['#e8c4a0', '#c99d78'], ['#c99774', '#a87654'], ['#8d5a3a', '#6f4429']];

// ---- looks: each astronaut has four suits, and each look has its own skin tone ----
const mk = (list) => list.map((l, i) => Object.assign({ skin: i }, l));
const lk = (n, suit, trim, glass, cap) => ({ n, suit, trim, glass, cap: cap || '#e9ecf8' });
const SPECIES = {
  ranger: { name: 'Ranger', w: 14, looks: mk([lk('Olive suit', '#5f6b3c', '#c9b458', '#ff8a7a'), lk('Sand suit', '#b79a62', '#5a4a2a', '#ff9a7a'), lk('Rust suit', '#9a4a2a', '#ffd98a', '#ffb07a'), lk('Charcoal suit', '#3a3e4a', '#ff9a5c', '#ff8a7a')]) },
  pilot: { name: 'Pilot', w: 14, looks: mk([lk('Orange suit', '#ff7a2e', '#ffffff', '#8fe3ff'), lk('Teal suit', '#1f9a9a', '#ffd98a', '#8fe3ff'), lk('Red suit', '#c8383f', '#ffffff', '#a8e8ff'), lk('White suit', '#e9ecf6', '#ff7a2e', '#8fe3ff')]) },
  engineer: { name: 'Engineer', w: 14, looks: mk([lk('Yellow suit', '#f2c230', '#2a2a34', '#b9f0ff'), lk('Grey suit', '#7a8094', '#f2c230', '#b9f0ff'), lk('Green suit', '#3f8a5a', '#f2c230', '#c8fff0'), lk('Blue suit', '#3a6ad0', '#f2c230', '#b9f0ff')]) },
  navigator: { name: 'Navigator', w: 14, looks: mk([lk('Violet suit', '#5b3fd0', '#4de3ff', '#4de3ff'), lk('Teal suit', '#1a8f8f', '#ffffff', '#4de3ff'), lk('Magenta suit', '#b0309a', '#4de3ff', '#6fe8ff'), lk('Midnight suit', '#2a2e4a', '#4de3ff', '#4de3ff')]) },
  commander: { name: 'Commander', w: 14, looks: mk([lk('White suit', '#e9ecf6', '#e8b82e', '#ffd98a'), lk('Navy suit', '#27335f', '#ffd98a', '#ffd98a'), lk('Burgundy suit', '#6a1e3a', '#e8b82e', '#ffd98a'), lk('Black suit', '#1c1c2e', '#c9d2ff', '#ffe9a8')]) },
  observer: { name: 'Observer', w: 14, looks: mk([lk('White suit', '#dfe4f2', '#4fb89a', '#9fffd8'), lk('Mint suit', '#4fb89a', '#ffffff', '#9fffd8'), lk('Lilac suit', '#9a86e0', '#ffffff', '#b8ffe8'), lk('Steel suit', '#8a96b4', '#4de3ff', '#9fffd8')]) },
  trooper: { name: 'Trooper', w: 14, looks: mk([lk('Gunmetal suit', '#4a4e5e', '#ff9a5c', '#ff9a5c'), lk('Black suit', '#22222c', '#ff4fd8', '#ff9a5c'), lk('Green suit', '#3c5a3a', '#c9b458', '#ffb07a'), lk('Crimson suit', '#7a2430', '#e9ecf6', '#ff9a5c')]) },
  scientist: { name: 'Scientist', w: 14, looks: mk([lk('White suit', '#f2f4fa', '#9d7bff', '#c9b8ff'), lk('Sky suit', '#7fb4e8', '#ffffff', '#d8ccff'), lk('Pink suit', '#e89ac8', '#ffffff', '#d8ccff'), lk('Lime suit', '#9ac84a', '#2a2a34', '#c9b8ff')]) },
};
const ACCS = [['none', 22], ['plaster', 12], ['beacon', 16], ['patch', 14], ['eyepatch', 8], ['freckles', 12], ['facepaint', 8]];
const HAIR_COLS = ['#2a1a12', '#4a3020', '#141018', '#8a8a8a', '#e8e8f0', '#c8383f', '#ff4fd8', '#4de3ff', '#9d7bff', '#d8b25a'];
const BEARDS = [['none', 34], ['stubble', 16], ['full', 14], ['goatee', 12], ['mustache', 14], ['chops', 10]];
const GLASSES = [['none', 62], ['round', 16], ['shades', 22]];
// roles that wear a comm cap show no hair; the others show a hairstyle picked from their own list
const HAIRDO = { RANGER: ['short', 'mohawk', 'long', 'bald'], ENGINEER: ['short', 'curly', 'bun', 'bald'], NAVIGATOR: ['mohawk', 'long', 'curly', 'bun'], OBSERVER: ['short', 'long', 'afro', 'bun'], TROOPER: ['bald', 'short', 'mohawk'], SCIENTIST: ['wild', 'afro', 'curly', 'bun'] };
const ACC_COL = ['#ffd98a', '#4de3ff', '#ff4fd8', '#e8e8f0', '#ff9a5c', '#9d7bff', '#ff5d7a'];
const BGS = ['#070b1f', '#0d0a26', '#060f22', '#12091f'];
const NAMES = ['ORION', 'VEGA', 'LYRA', 'NOVA', 'COMET', 'ASTRA', 'ZENITH', 'PULSAR', 'QUASAR', 'NEBULA', 'HALLEY', 'TITAN', 'EUROPA', 'CALLISTO', 'RIGEL', 'SIRIUS', 'ALTAIR', 'DENEB', 'ATLAS', 'HYDRA', 'DRACO', 'LUNA', 'APOLLO', 'GEMINI', 'ARTEMIS', 'MERCURY', 'VOYAGER', 'KEPLER', 'HUBBLE', 'CASSINI', 'ECLIPSE', 'METEOR', 'AURORA', 'CYGNUS', 'PHOENIX', 'ROVER', 'CELESTE', 'ZEPHYR', 'COSMO', 'STELLA', 'JUPITER', 'SATURN', 'PERSEUS', 'TAURUS', 'ARIES', 'VIRGO', 'ANDROMEDA', 'ORBIT', 'SOLSTICE', 'EQUINOX', 'ASTEROID', 'GALAXY'];

// ---- classes: each is an ability that works from real chain numbers (fn names the report in report.js) ----
const ROLES = {
  RANGER: { fn: 'HUNTER', blurb: 'Scouts the launch block and spots the wallets that rushed in first.' },
  PILOT: { fn: 'COURIER', blurb: 'Keeps the flight log: the coin’s best days on record.' },
  ENGINEER: { fn: 'AUDITOR', blurb: 'Won’t fly a coin until the mint and freeze authority are revoked.' },
  NAVIGATOR: { fn: 'SCOUT', blurb: 'Plots the chain and counts every wallet holding the coin.' },
  COMMANDER: { fn: 'ARCHIVIST', blurb: 'Keeps the mission log of every milestone the coin hits.' },
  OBSERVER: { fn: 'SENTRY', blurb: 'Never takes their eyes off the dev wallet.' },
  TROOPER: { fn: 'WARDEN', blurb: 'Works out how hard a big sale would hit the curve.' },
  SCIENTIST: { fn: 'ANALYST', blurb: 'Tracks the market cap against the start and the peak.' },
};
const ABILITIES = {
  NAVIGATOR: { name: 'Holder Radar', fn: 'SCOUT', does: 'Tracks how many wallets hold the coin and how that count has changed since it first looked.' },
  COMMANDER: { name: 'Milestone Log', fn: 'ARCHIVIST', does: 'Writes down the moment the coin first passes 25%, 50%, 75% and 90% of the curve, and when it graduates.' },
  RANGER: { name: 'Launch Block Scan', fn: 'HUNTER', does: 'Finds the wallets that bought in the same block as the launch or the next, and how much of the supply they hold now.' },
  PILOT: { name: 'Record Board', fn: 'COURIER', does: 'Keeps the coin’s records: its highest market cap, most holders and furthest curve progress, with when each was seen.' },
  OBSERVER: { name: 'Dev Watch', fn: 'SENTRY', does: 'Watches the dev wallet and the top ten holders, and sounds the alarm if the dev’s share drops.' },
  SCIENTIST: { name: 'Cap Tracker', fn: 'ANALYST', does: 'Follows market cap against where it started and where it peaked, and shows how far it is from the high.' },
  ENGINEER: { name: 'Authority Audit', fn: 'AUDITOR', does: 'Reads the token itself and says whether its mint authority and freeze authority are revoked.' },
  TROOPER: { name: 'Sell Impact', fn: 'WARDEN', does: 'Uses the curve’s real reserves to work out what would happen if the dev or the biggest holder sold everything right now.' },
  FLAGSHIP: { name: 'Command Sweep', fn: 'FLAGSHIP', does: 'Runs every other astronaut’s ability on the coin at once and reports the headline from each.' },
};

function prng(seedBytes) {
  let a = seedBytes.readUInt32LE(0) ^ seedBytes.readUInt32LE(4);
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function pickW(list, r) { const tot = list.reduce((a, x) => a + x[1], 0); let t = r * tot; for (const x of list) { t -= x[1]; if (t < 0) return x; } return list[list.length - 1]; }

// ---- traits: the same look is never handed out twice in one set ----
const traitCache = new Map();
function traitsFor(slot, secret) {
  const ck = String(secret);
  let list = traitCache.get(ck);
  if (!list) { list = { rnd: prng(crypto.createHmac('sha256', ck).update('heist').digest()), items: [], seen: new Set(), names: new Set(), kinds: new Set() }; traitCache.set(ck, list); }
  const keys = Object.keys(SPECIES);
  list.used = list.used || {};
  while (list.items.length <= slot) {
    let t, key, tries = 0;
    do {
      // every role is handed out once before any role repeats
      const low = Math.min(...keys.map((x) => list.used[x] || 0)), pool = keys.filter((x) => (list.used[x] || 0) === low);
      const k = pickW(pool.map((x) => [x, SPECIES[x].w]), list.rnd())[0], look = Math.floor(list.rnd() * SPECIES[k].looks.length);
      const R = k.toUpperCase(), dos = HAIRDO[R];
      t = { species: k, look, acc: pickW(ACCS, list.rnd())[0], accColor: Math.floor(list.rnd() * ACC_COL.length), bg: Math.floor(list.rnd() * 4), seed: Math.floor(list.rnd() * 1e9) };
      t.hair = dos ? dos[Math.floor(list.rnd() * dos.length)] : 'cap'; t.hairCol = Math.floor(list.rnd() * HAIR_COLS.length);
      t.beard = pickW(BEARDS, list.rnd())[0]; t.glasses = R === 'SCIENTIST' ? 'round' : (R === 'NAVIGATOR' || R === 'OBSERVER' || t.acc === 'eyepatch' ? 'none' : pickW(GLASSES, list.rnd())[0]);
      key = [k, look, t.acc, t.acc === 'none' ? 0 : t.accColor, t.hair, t.hairCol, t.beard, t.glasses].join('|');
      tries++;
    } while ((list.seen.has(key) || (tries < 120 && list.kinds.has(t.species + t.look) && list.kinds.size < keys.length * 4)) && tries < 200);
    list.seen.add(key); list.kinds.add(t.species + t.look); list.used[t.species] = (list.used[t.species] || 0) + 1;
    let nm, nt = 0;
    do { nm = NAMES[Math.floor(list.rnd() * NAMES.length)]; nt++; } while (list.names.has(nm) && nt < 200);
    list.names.add(nm);
    t.name = nm; t.role = t.species.toUpperCase();
    list.items.push(t);
  }
  return list.items[slot];
}
function agentFor(slot, secret) {
  const t = traitsFor(slot, secret), sp = SPECIES[t.species];
  return { name: t.name, role: t.role, blurb: ROLES[t.role].blurb, ability: ABILITIES[t.role], chassis: sp.looks[t.look].n, breed: sp.name, accessory: t.acc === 'none' ? null : t.acc, hair: t.hair, beard: t.beard, glasses: t.glasses };
}

// ---- a small vector painter: smooth shapes, soft shadows and gradients, 4 samples per pixel for clean edges ----
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const hx = (h) => { const n = parseInt(h.slice(1, 7), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const dk = (c, k) => [c[0] * k, c[1] * k, c[2] * k];
const lt = (c, k) => mix(c, [255, 255, 255], k);
const hash = (x, y) => { let h = Math.imul(x * 374761393 + y * 668265263, 1274126177); h = Math.imul(h ^ (h >>> 13), 1103515245); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
function spline(pts, closed) {
  const out = [], n = pts.length, seg = 6;
  const g = (i) => pts[closed ? (i + n) % n : clamp(i, 0, n - 1)];
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2);
    for (let k = 0; k < seg; k++) {
      const t = k / seg, t2 = t * t, t3 = t2 * t;
      out.push([0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
        0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)]);
    }
  }
  if (!closed) out.push(pts[n - 1]);
  return out;
}
const inPoly = (pts) => (px, py) => {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const xi = pts[i][0], yi = pts[i][1], xj = pts[j][0], yj = pts[j][1];
    if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
};
const bbox = (pts) => { let a = 1e9, b = 1e9, c = -1e9, d = -1e9; for (const p of pts) { if (p[0] < a) a = p[0]; if (p[1] < b) b = p[1]; if (p[0] > c) c = p[0]; if (p[1] > d) d = p[1]; } return [a, b, c, d]; };

class Canvas {
  constructor(bg, R) { this.R = R || 384; this.K = this.R / N; const b = hx(bg); this.px = new Float32Array(this.R * this.R * 3); for (let i = 0; i < this.R * this.R; i++) { this.px[i * 3] = b[0]; this.px[i * 3 + 1] = b[1]; this.px[i * 3 + 2] = b[2]; } }
  // col is a hex string, an [r,g,b] array, or a function (x, y) returning [r,g,b] or [r,g,b,alpha] (null skips the point)
  paint(bb, test, col, a) {
    const K = this.K, R = this.R, fixed = typeof col === 'string' ? hx(col) : Array.isArray(col) ? col : null, A = a == null ? 1 : a;
    const x0 = Math.max(0, Math.floor(bb[0] * K) - 1), y0 = Math.max(0, Math.floor(bb[1] * K) - 1), x1 = Math.min(R - 1, Math.ceil(bb[2] * K) + 1), y1 = Math.min(R - 1, Math.ceil(bb[3] * K) + 1);
    for (let py = y0; py <= y1; py++) for (let px = x0; px <= x1; px++) {
      let cov = 0;
      cov += test((px + 0.25) / K, (py + 0.25) / K) ? 1 : 0; cov += test((px + 0.75) / K, (py + 0.25) / K) ? 1 : 0; cov += test((px + 0.25) / K, (py + 0.75) / K) ? 1 : 0; cov += test((px + 0.75) / K, (py + 0.75) / K) ? 1 : 0;
      if (!cov) continue;
      let c = fixed, al = A * cov / 4;
      if (!c) { c = col((px + 0.5) / K, (py + 0.5) / K); if (!c) continue; if (c.length > 3) al *= c[3]; }
      const i = (py * R + px) * 3;
      this.px[i] += (c[0] - this.px[i]) * al; this.px[i + 1] += (c[1] - this.px[i + 1]) * al; this.px[i + 2] += (c[2] - this.px[i + 2]) * al;
    }
  }
  rect(x, y, w, h, col, a) { this.paint([x, y, x + w, y + h], (px, py) => px >= x && px < x + w && py >= y && py < y + h, col, a); }
  ell(cx, cy, rx, ry, col, a) { this.paint([cx - rx, cy - ry, cx + rx, cy + ry], (px, py) => ((px - cx) / rx) * ((px - cx) / rx) + ((py - cy) / ry) * ((py - cy) / ry) <= 1, col, a); }
  poly(pts, col, a, smooth) { const p = smooth ? spline(pts, true) : pts; this.paint(bbox(p), inPoly(p), col, a); }
  line(x1, y1, x2, y2, w, col, a) {
    const dx = x2 - x1, dy = y2 - y1, l2 = dx * dx + dy * dy, h = w / 2;
    this.paint([Math.min(x1, x2) - h, Math.min(y1, y2) - h, Math.max(x1, x2) + h, Math.max(y1, y2) + h], (px, py) => { let t = l2 ? ((px - x1) * dx + (py - y1) * dy) / l2 : 0; t = clamp(t, 0, 1); const qx = x1 + t * dx - px, qy = y1 + t * dy - py; return qx * qx + qy * qy <= h * h; }, col, a);
  }
  curve(pts, w, col, a) { const p = spline(pts, false); for (let i = 0; i < p.length - 1; i++) this.line(p[i][0], p[i][1], p[i + 1][0], p[i + 1][1], w, col, a); }
  // a soft shadow or highlight that fades to nothing at its edge
  soft(cx, cy, rx, ry, col, a) {
    const c = typeof col === 'string' ? hx(col) : col;
    this.paint([cx - rx, cy - ry, cx + rx, cy + ry], (px, py) => ((px - cx) / rx) * ((px - cx) / rx) + ((py - cy) / ry) * ((py - cy) / ry) < 1, (x, y) => { const d = Math.sqrt(((x - cx) / rx) * ((x - cx) / rx) + ((y - cy) / ry) * ((y - cy) / ry)); return [c[0], c[1], c[2], Math.pow(Math.max(0, 1 - d), 1.4)]; }, null === a ? 1 : a);
  }
  toRgb(size) {
    const R = this.R, out = Buffer.alloc(size * size * 3), s = R / size;
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const fx = Math.min(R - 1.001, (x + 0.5) * s - 0.5), fy = Math.min(R - 1.001, (y + 0.5) * s - 0.5), x0 = Math.max(0, Math.floor(fx)), y0 = Math.max(0, Math.floor(fy)), tx = fx - x0, ty = fy - y0;
      for (let ch = 0; ch < 3; ch++) {
        const a = this.px[(y0 * R + x0) * 3 + ch], b = this.px[(y0 * R + x0 + 1) * 3 + ch], c2 = this.px[((y0 + 1) * R + x0) * 3 + ch], d = this.px[((y0 + 1) * R + x0 + 1) * 3 + ch];
        out[(y * size + x) * 3 + ch] = clamp(Math.round((a * (1 - tx) + b * tx) * (1 - ty) + (c2 * (1 - tx) + d * tx) * ty), 0, 255);
      }
    }
    return out;
  }
}

// ---- a face: neck, ears, head, soft shading, eyes, brows, nose and mouth, lit from the top left ----
const HEAD = spline([[24, 8.2], [30.4, 10], [33.6, 15], [33.9, 21.5], [32, 27.4], [28, 31.4], [24, 32.4], [20, 31.4], [16, 27.4], [14.1, 21.5], [14.4, 15], [17.6, 10]], true);
const EYE_COLS = ['#3f6e9e', '#5a3a22', '#4a7a52', '#6a4a2a'];
function face(c, o) {
  const sk = [hx(SKINS[o.skin][0]), hx(SKINS[o.skin][1])], skc = (x, y) => mix(sk[0], sk[1], Math.pow(clamp(0.45 + (x - 24) * 0.055 + (y - 20) * 0.012, 0, 1), 1.2));
  const neckW = o.wide ? 4.4 : 3.6;
  c.poly([[24 - neckW, 27], [24 + neckW, 27], [24 + neckW + 0.8, 40], [24 - neckW - 0.8, 40]], (x, y) => mix(skc(x, y), dk(sk[1], 0.6), clamp(1 - (y - 31.5) / 5, 0, 1) * 0.95));
  c.ell(14.2, 21.6, 1.5, 2.7, (x, y) => skc(x, y)); c.ell(33.8, 21.6, 1.5, 2.7, (x, y) => skc(x, y));
  c.ell(14.6, 21.8, 0.7, 1.5, dk(sk[1], 0.8), 0.7); c.ell(33.4, 21.8, 0.7, 1.5, dk(sk[1], 0.8), 0.7);
  c.poly(HEAD, skc);
  c.soft(24, 33.4, 7, 1.8, [0, 0, 0], 0.28);
  c.soft(19, 25.6, 3.4, 2.4, [225, 110, 100], 0.16); c.soft(29, 25.6, 3.4, 2.4, [225, 110, 100], 0.14);
  c.soft(30.5, 28, 5, 4, dk(sk[1], 0.6), 0.22); c.soft(22, 12.5, 6, 2.6, [255, 255, 255], 0.1); c.soft(20.6, 23, 2.6, 1.6, [255, 255, 255], 0.08);
  const ey = 19.4, eyeCol = hx(EYE_COLS[(o.eye || 0) % 4]), look = o.side ? 0.7 : 0;
  if (!o.noEyes) for (const cx of [19.8, 28.2]) {
    c.soft(cx, ey, 3.6, 2.4, dk(sk[1], 0.55), 0.24);
    c.ell(cx, ey, 2.3, 1.1, '#f1ece4'); c.ell(cx + look, ey + 0.05, 1.05, 1.05, eyeCol); c.ell(cx + look, ey + 0.05, 0.5, 0.5, '#0c0a10'); c.ell(cx + look - 0.35, ey - 0.35, 0.28, 0.28, '#ffffff');
    c.soft(cx, ey - 0.6, 2.4, 0.9, [0, 0, 0], 0.18);
    c.curve([[cx - 2.5, ey + 0.15], [cx - 1.2, ey - 0.95], [cx + 1.2, ey - 1.05], [cx + 2.5, ey + 0.1]], 0.38, '#17121a'); c.curve([[cx - 2, ey + 0.8], [cx, ey + 1.2], [cx + 2, ey + 0.8]], 0.16, dk(sk[1], 0.7), 0.5);
    c.curve([[cx - 2.3, ey - 1.7], [cx, ey - 2.2], [cx + 2.3, ey - 1.6]], 0.18, dk(sk[1], 0.7), 0.45);
  }
  if (!o.noBrows) {
    const bc = hx(o.brow || '#3a2a1e'), tl = o.tilt || 0;
    c.poly([[17.1, 17.2 - tl], [19.4, 15.7], [22.4, 16.1 + tl], [22.4, 17 + tl], [19.5, 16.5], [17.2, 18]], bc, 0.92, true);
    c.poly([[30.9, 17.2 - tl], [28.6, 15.7], [25.6, 16.1 + tl], [25.6, 17 + tl], [28.5, 16.5], [30.8, 18]], bc, 0.92, true);
  }
  c.soft(25.7, 22, 0.9, 3, dk(sk[1], 0.55), 0.2); c.soft(24, 24.2, 1.4, 0.8, [255, 255, 255], 0.14); c.soft(24, 25.7, 2.4, 0.9, dk(sk[1], 0.5), 0.22);
  c.ell(22.8, 25.2, 0.55, 0.34, dk(sk[1], 0.45), 0.7); c.ell(25.2, 25.2, 0.55, 0.34, dk(sk[1], 0.45), 0.7);
  const lip = mix(hx('#b2615c'), sk[1], 0.35), fr = o.frown ? 0.5 : -0.1, y0 = 28.4;
  c.poly([[21, y0 + fr], [22.8, y0 - 0.8], [24, y0 - 0.45], [25.2, y0 - 0.8], [27, y0 + fr], [24, y0 + 0.25]], dk(lip, 0.85), 1, true);
  c.poly([[21.2, y0 + fr + 0.1], [24, y0 + 0.3], [26.8, y0 + fr + 0.1], [26, y0 + 1.5], [24, y0 + 1.9], [22, y0 + 1.5]], lip, 1, true);
  c.curve([[21, y0 + fr], [24, y0 + 0.35], [27, y0 + fr]], 0.3, '#3a1a1a'); c.soft(24, 31.3, 3, 0.9, dk(sk[1], 0.55), 0.18);
  if (o.stubble) c.paint([14, 24, 34, 32.5], (x, y) => inPoly(HEAD)(x, y) && y > 24.2 && !(x > 20.5 && x < 27.5 && y > 27.4 && y < 30.6), (x, y) => (hash(Math.floor(x * 16), Math.floor(y * 16)) < 0.5 ? [...hx(o.brow || '#3a2a1e'), 0.34] : null), 1);
}
const SH = spline([[1, 48], [2.4, 41.5], [8, 37], [17, 35], [31, 35], [40, 37], [45.6, 41.5], [47, 48]], true);
function torso(c, cloth, o) {
  o = o || {}; const base = hx(cloth), pts = o.pts || SH;
  c.poly(pts, (x, y) => mix(lt(base, 0.1), dk(base, 0.62), clamp((x - 10) / 34 + (y - 36) / 30, 0, 1)));
  c.soft(24, 37, 7, 3, [0, 0, 0], 0.22); c.soft(8, 44, 4, 6, [0, 0, 0], 0.12); c.soft(40, 44, 4, 6, [0, 0, 0], 0.14);
  for (const f of [[12, 40, 15, 48], [35, 40, 33, 48], [19, 44, 17, 48]]) c.line(f[0], f[1], f[2], f[3], 0.35, [0, 0, 0], 0.16);
  if (o.pin) pinstripes(c, pts, base);
}
function hairShape(c, pts, col, o) {
  o = o || {}; const base = hx(col), p = spline(pts, true);
  c.paint(bbox(p), inPoly(p), (x, y) => { const s = Math.sin(x * 9 + y * 2.2) * 0.1 + Math.sin(x * 21 - y) * 0.05 + (hash(Math.floor(x * 12), Math.floor(y * 5)) - 0.5) * 0.1; return mix(base, s > 0 ? [255, 255, 255] : [0, 0, 0], Math.abs(s) * (o.shine || 1)); });
  c.soft(o.sx || 20, o.sy || 10, 4, 1.4, [255, 255, 255], o.glint == null ? 0.18 : o.glint);
}
function fabricEdge(c, pts, w, col, a) { c.curve(pts, w, col, a); }

// ---- the eight astronauts, then the Admiral ----
const circ = (cx, cy, r, n) => { n = n || 24; const p = []; for (let i = 0; i <= n; i++) { const a = i * Math.PI * 2 / n; p.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } return p; };
const HAIR_PTS = {
  short: [[14.2, 17], [14.6, 11], [18, 8], [24, 7], [30, 8], [33.4, 11], [33.8, 17], [31.4, 12.6], [24, 11], [16.6, 12.6]],
  afro: [[11.6, 17], [12, 9.6], [16.6, 5.4], [24, 4.2], [31.4, 5.4], [36, 9.6], [36.4, 17], [33.6, 13.2], [24, 10.8], [14.4, 13.2]],
  curly: [[13, 17], [13.2, 10.6], [17, 6.6], [24, 5.6], [31, 6.6], [34.8, 10.6], [35, 17], [32.6, 12.4], [24, 10.6], [15.4, 12.4]],
  wild: [[11, 15], [10.4, 8], [14.4, 3.6], [19, 5.6], [24, 2.6], [29, 5.6], [33.6, 3.6], [37.6, 8], [37, 15], [33.8, 11.4], [24, 9.6], [14.2, 11.4]],
  bun: [[14.2, 17], [14.6, 11], [18, 8], [24, 7], [30, 8], [33.4, 11], [33.8, 17], [31.4, 12.6], [24, 11], [16.6, 12.6]],
  long: [[14, 17], [14.4, 10.6], [18, 7.6], [24, 6.8], [30, 7.6], [33.6, 10.6], [34, 17], [31.4, 12.4], [24, 10.8], [16.6, 12.4]],
};
function drawHair(c, style, col) {
  if (!style || style === 'cap' || style === 'bald') { if (style === 'bald') c.soft(22, 10.6, 5.4, 2.4, [255, 255, 255], 0.22); return; }
  const base = hx(col);
  if (style === 'mohawk') { hairShape(c, [[21.8, 12], [21.4, 6], [22.6, 2.4], [24, 1.2], [25.4, 2.4], [26.6, 6], [26.2, 12], [24, 10.8]], col, { sx: 23, sy: 4, glint: 0.3 }); c.soft(24, 12.4, 9, 2.6, dk(base, 0.5), 0.4); return; }
  if (style === 'long') { hairShape(c, [[14, 15], [12.4, 22], [12.8, 31], [15.6, 31.8], [15.6, 22], [16, 15]], col, { sx: 14, sy: 22, glint: 0.12 }); hairShape(c, [[34, 15], [35.6, 22], [35.2, 31], [32.4, 31.8], [32.4, 22], [32, 15]], col, { sx: 34, sy: 22, glint: 0.1 }); }
  hairShape(c, HAIR_PTS[style] || HAIR_PTS.short, col, { sx: 21, sy: 8.6, glint: 0.2 });
  if (style === 'bun') { c.ell(24, 4.4, 3.4, 3.2, (x, y) => mix(lt(base, 0.12), dk(base, 0.7), clamp((x - 20) / 8 + (y - 1) / 6, 0, 1))); c.soft(23, 3.4, 2, 1, [255, 255, 255], 0.2); }
  if (style === 'curly') for (const p of [[16, 8.6], [20, 5.8], [24, 5], [28, 5.8], [32, 8.6], [14, 13], [34, 13]]) c.ell(p[0], p[1], 2.4, 2.2, (x, y) => mix(lt(base, 0.1), dk(base, 0.65), clamp((x - p[0] + 2.4) / 5 + (y - p[1] + 2) / 4, 0, 1)));
}
function drawBeard(c, kind, col) {
  if (!kind || kind === 'none') return; const b = hx(col), sh = (x, y) => mix(lt(b, 0.06), dk(b, 0.7), clamp((x - 16) / 18 + (y - 26) / 12, 0, 1));
  if (kind === 'stubble') return;
  if (kind === 'full') { c.poly(spline([[15.4, 22], [16.4, 28.6], [19.8, 33.6], [24, 35.6], [28.2, 33.6], [31.6, 28.6], [32.6, 22], [31, 27], [27.4, 30.4], [24, 30.8], [20.6, 30.4], [17, 27]], true), sh); c.poly([[20.2, 27], [22.8, 26.2], [24, 26.6], [25.2, 26.2], [27.8, 27], [26.2, 28.2], [24, 27.8], [21.8, 28.2]], sh, 1, true); c.soft(24, 29.6, 2.4, 0.8, [120, 40, 40], 0.5); }
  else if (kind === 'goatee') { c.poly(spline([[21.2, 30.4], [26.8, 30.4], [26.4, 34], [24, 35.8], [21.6, 34]], true), sh); c.poly([[20.4, 27], [22.8, 26.2], [24, 26.6], [25.2, 26.2], [27.6, 27], [26, 28], [24, 27.6], [22, 28]], sh, 1, true); }
  else if (kind === 'mustache') c.poly([[18.6, 27.4], [21.4, 25.8], [24, 26.4], [26.6, 25.8], [29.4, 27.4], [27.4, 28.6], [24, 27.6], [20.6, 28.6]], sh, 1, true);
  else if (kind === 'chops') { c.poly([[14.8, 19], [16.6, 21], [17.4, 28], [16, 30], [14.6, 25]], sh, 1, true); c.poly([[33.2, 19], [31.4, 21], [30.6, 28], [32, 30], [33.4, 25]], sh, 1, true); }
}
function drawGlasses(c, kind) {
  if (kind === 'round') { for (const cx of [19.8, 28.2]) { c.ell(cx, 19.4, 3.1, 2.7, [255, 255, 255], 0.1); c.curve(circ(cx, 19.4, 3.1, 16), 0.34, '#1a1620', 0.95); } c.line(22.9, 19, 25.1, 19, 0.3, '#1a1620'); c.line(16.7, 19.2, 14.2, 18.8, 0.26, '#1a1620'); c.line(31.3, 19.2, 33.8, 18.8, 0.26, '#1a1620'); }
  else if (kind === 'shades') { for (const cx of [19.8, 28.2]) { c.poly([[cx - 3.5, 17.6], [cx + 3.5, 17.6], [cx + 3.1, 21.4], [cx, 22.4], [cx - 3.1, 21.4]], (x, y) => mix([14, 14, 24], [58, 60, 84], clamp((y - 17.6) / 4 + (cx - x) * 0.05, 0, 1))); c.line(cx - 2.6, 18.6, cx - 0.8, 18.2, 0.35, [255, 255, 255], 0.6); } c.line(23.3, 18.4, 24.7, 18.4, 0.4, '#14141c'); c.line(16.4, 18.4, 14.2, 18.2, 0.3, '#14141c'); c.line(31.6, 18.4, 33.8, 18.2, 0.3, '#14141c'); }
}
function astro(c, L, o, ex) {
  ex = ex || {};
  const suit = hx(L.suit), trim = hx(L.trim), cap = hx(L.cap || '#e9ecf8'), glass = hx(L.glass || '#8fe3ff'), shell = ex.shell ? hx(ex.shell) : [226, 230, 244];
  torso(c, L.suit, { pts: ex.pts });
  // chest panel, arm bands and a hose
  c.poly([[18, 41], [30, 41], [29.4, 47.8], [18.6, 47.8]], dk(suit, 0.66), 1, true); c.rect(19.6, 42.4, 2.2, 1.3, trim); c.ell(24.4, 43.1, 0.8, 0.8, '#4de3ff'); c.ell(26.9, 43.1, 0.8, 0.8, '#ff4fd8'); c.rect(19.6, 45.2, 8.2, 0.7, [255, 255, 255], 0.28);
  c.line(11.6, 40.4, 12.6, 48, 1.5, trim, 0.9); c.line(36.4, 40.4, 35.4, 48, 1.5, trim, 0.9);
  c.curve([[17, 38], [14, 43], [15.6, 48]], 0.7, dk(suit, 0.5), 0.8);
  if (ex.body) ex.body(c, suit, trim);
  // inside of the helmet, then the face
  c.ell(24, 20.6, 17.4, 17.6, (x, y) => mix([40, 44, 78], [8, 10, 24], clamp((y - 6) / 30, 0, 1)));
  const hcol = HAIR_COLS[o.hairCol || 0] || '#3a2a1e', nat = [0, 1, 2, 3, 4, 9].indexOf(o.hairCol || 0) >= 0, bcol = nat ? hcol : '#2a1a12';
  face(c, Object.assign({}, o, { brow: o.hairStyle ? bcol : o.brow, stubble: o.beard === 'stubble' || (ex.face && ex.face.stubble) }, ex.face && { wide: ex.face.wide, frown: ex.face.frown, tilt: ex.face.tilt, side: ex.face.side }));
  if (o.hairStyle && o.hairStyle !== 'cap') drawBeard(c, o.beard, bcol);
  if (o.hairStyle && o.hairStyle !== 'cap') { drawHair(c, o.hairStyle, hcol); } else c.poly(spline([[14.1, 16], [15, 10.4], [19.4, 7.4], [24, 6.8], [28.6, 7.4], [33, 10.4], [33.9, 16], [31.6, 12.8], [27.6, 11.2], [24, 10.8], [20.4, 11.2], [16.4, 12.8]], true), (x, y) => mix(lt(cap, 0.15), dk(cap, 0.7), clamp((x - 14) / 22 + (y - 7) / 10, 0, 1)));
  if (!o.hairStyle || o.hairStyle === 'cap') { c.ell(14.3, 21.4, 1.7, 2.6, cap); c.ell(33.7, 21.4, 1.7, 2.6, dk(cap, 0.8)); drawBeard(c, o.beard, bcol); }
  if (o.glasses && o.glasses !== 'none' && !ex.ownGlasses) drawGlasses(c, o.glasses);
  if (ex.inside) ex.inside(c);
  // the glass: a tint, a bright streak and a soft glow, then the rim
  c.ell(24, 20.6, 15.3, 15.5, glass, ex.tint || 0.12);
  c.soft(19, 13.4, 5.4, 3, [255, 255, 255], 0.26);
  c.poly([[15.4, 20], [16.6, 14.4], [19.8, 10.6], [19, 14.6], [17.4, 20.4]], [255, 255, 255], 0.26);
  c.poly([[31.6, 27], [32.8, 23.6], [33.6, 25]], [255, 255, 255], 0.2);
  c.curve(circ(24, 20.6, 16.3), 2.5, (x, y) => mix(lt(shell, 0.2), dk(shell, 0.62), clamp((x - 10) / 28 + (y - 6) / 30, 0, 1)));
  c.curve(circ(24, 20.6, 15), 0.45, [10, 12, 30], 0.55); c.curve(circ(24, 20.6, 17.4), 0.4, [255, 255, 255], 0.3);
  c.soft(24, 38, 11, 2, [0, 0, 0], 0.28);
  // neck ring
  c.ell(24, 37.4, 12.6, 2.9, (x, y) => mix(lt(shell, 0.1), dk(shell, 0.6), clamp((x - 11) / 26, 0, 1))); c.ell(24, 36.9, 10.4, 1.7, dk(shell, 0.5)); c.curve([[12, 37.6], [24, 40.6], [36, 37.6]], 0.5, trim, 0.9);
  if (ex.post) ex.post(c, suit, trim, glass);
}
const DRAW = {
  ranger(c, L, o) {
    astro(c, L, o, { tint: 0.2, inside(c) { c.curve([[14.2, 14.6], [19, 12.4], [24, 11.8], [29, 12.4], [33.8, 14.6]], 1.4, '#c8383f', 0.95); c.line(33.6, 14.8, 36.6, 17.6, 0.9, '#c8383f', 0.95); }, body(c, suit, trim) { c.line(11.6, 36.4, 30, 48, 1.7, '#2e2418', 0.9); c.rect(22.8, 41.6, 2.4, 2, '#c9b458'); },
      post(c) { c.line(36.4, 12, 40.4, 5.4, 0.4, '#c9d2ff'); c.ell(40.6, 5.2, 0.9, 0.9, '#ff5d7a'); c.ell(10.4, 38, 2.1, 1.3, '#ffd98a'); } });
  },
  pilot(c, L, o) {
    astro(c, L, o, { face: { side: false },
      post(c) { c.curve([[14.8, 23.4], [15.4, 28.6], [18.6, 31], [21.8, 30.6]], 0.5, '#15151f'); c.ell(22.2, 30.6, 1, 0.8, '#ff4fd8'); c.ell(14.2, 23.2, 1.1, 1.1, '#15151f'); c.rect(21, 34.4, 6, 1, '#ffffff', 0.5); } });
  },
  engineer(c, L, o) {
    astro(c, L, o, { inside(c) { c.curve([[14.4, 13.4], [24, 11.4], [33.6, 13.4]], 0.9, '#3a2a1a', 0.95); for (const cx of [20, 28]) { c.ell(cx, 11.4, 3.3, 2.7, '#2a2a34'); c.ell(cx, 11.4, 2.4, 1.9, [150, 225, 240], 0.9); c.line(cx - 1.4, 10.6, cx - 0.2, 10.2, 0.3, [255, 255, 255], 0.8); } c.rect(10.4, 44.6, 1, 1, '#c9ccd6', 0); },
      body(c) { c.line(12, 35.4, 34, 47.6, 1.4, '#3a2a1a', 0.9); c.rect(14.6, 44.2, 3, 3.4, '#8a8e9a'); c.rect(15.4, 42.6, 1.4, 2, '#c9ccd6'); },
      post(c) { c.poly([[20.8, 5.6], [27.2, 5.6], [26, 3.4], [22, 3.4]], '#2a2a34'); c.ell(24, 4.5, 1.9, 0.9, '#fff3b0'); c.soft(24, 4, 6, 3.4, [255, 243, 176], 0.4); } });
  },
  navigator(c, L, o) {
    astro(c, L, o, { tint: 0.16,
      inside(c) { c.curve([[17, 25.4], [20, 27.2], [24, 27.8], [28, 27.2], [31, 25.4]], 0.18, '#4de3ff', 0.75); c.curve(circ(30.6, 14.2, 2.2, 16), 0.2, '#4de3ff', 0.85); c.line(30.6, 11, 30.6, 17.4, 0.12, '#4de3ff', 0.7); c.line(27.4, 14.2, 33.8, 14.2, 0.12, '#4de3ff', 0.7); for (const p of [[16.4, 14], [17.6, 16.4], [16.8, 18.2]]) c.ell(p[0], p[1], 0.35, 0.35, '#4de3ff', 0.9); },
      post(c) { c.line(35.4, 8, 38.4, 2, 0.4, '#c9d2ff'); c.ell(38.6, 1.8, 0.9, 0.9, '#ff4fd8'); } });
  },
  commander(c, L, o) {
    astro(c, L, o, { tint: 0.2,
      body(c, suit, trim) { for (const y of [41.2, 43.2, 45.2]) c.rect(9.4, y, 4.6, 0.9, trim); c.poly([[30.4, 43], [34.4, 43], [34.4, 45.6], [30.4, 45.6]], '#c8383f', 1, false); c.ell(32.4, 44.3, 1, 1, '#ffffff', 0.9); },
      inside(c) { c.curve([[14.4, 15.6], [19, 12.6], [24, 11.6], [29, 12.6], [33.6, 15.6]], 0.9, '#e8b82e', 0.95); c.rect(21.4, 8.4, 5.2, 1.2, '#e8b82e'); c.ell(24, 8.9, 0.7, 0.7, '#c8383f'); },
      post(c) { c.ell(10.2, 38.6, 3, 1.5, hx('#e8b82e')); c.ell(37.8, 38.6, 3, 1.5, hx('#e8b82e')); } });
  },
  observer(c, L, o) {
    astro(c, L, o, { face: { side: true },
      post(c) { c.line(36.2, 18.4, 38.4, 18.4, 0.7, '#2a2c3c'); c.poly([[38.2, 16.2], [44.4, 15.2], [44.6, 21.6], [38.4, 20.8]], '#2a2c3c', 1, false); c.ell(44.8, 18.4, 1.3, 3.2, '#4de3ff', 0.9); c.line(39, 17, 43.6, 16.6, 0.3, '#ffffff', 0.45); } });
  },
  trooper(c, L, o) {
    astro(c, L, o, { tint: 0.18, face: { wide: true, frown: true, tilt: 0.55 },
      body(c, suit, trim) { c.ell(8.6, 40.4, 6.4, 4, dk(suit, 0.78)); c.ell(39.4, 40.4, 6.4, 4, dk(suit, 0.66)); c.line(4.4, 40.2, 12.4, 40.2, 0.6, trim, 0.9); c.line(35.6, 40.2, 43.4, 40.2, 0.6, trim, 0.9); },
      inside(c) { c.curve([[30.2, 14.6], [31, 17.6], [30.4, 21]], 0.36, '#8a4a4a', 0.9); c.line(29.2, 17, 32.2, 18.2, 0.2, '#d8b8b0', 0.8); } });
  },
  scientist(c, L, o) {
    astro(c, L, o, {
      body(c, suit, trim) { c.rect(26.2, 42.8, 1.8, 4.6, [77, 227, 255], 0.9); c.rect(26.2, 42.4, 1.8, 0.8, '#ffffff'); c.rect(23, 42.8, 1.8, 4.6, [255, 79, 216], 0.8); },
      post(c) { c.ell(24, 47, 1, 1, '#ffffff', 0); } });
  },
};
// Titan: the flagship. A gold-trimmed white suit, gold glass, silver brows and a captain's patch
function admiral(c) {
  const L = { suit: '#f3f4fa', trim: '#e8b82e', glass: '#ffd98a', cap: '#f3f4fa', skin: 1 };
  astro(c, L, { skin: 1, eye: 1, brow: '#c9ccd6' }, { tint: 0.24, shell: '#f0d98a', face: { wide: true, stubble: true, brow: '#c9ccd6', tilt: 0.4 },
    body(c, suit, trim) { for (const y of [41, 42.8, 44.6, 46.4]) c.rect(9.2, y, 5, 0.8, trim); for (const y of [41, 42.8, 44.6, 46.4]) c.rect(33.8, y, 5, 0.8, trim); c.poly([[21.4, 41.4], [26.6, 41.4], [26.6, 46.6], [24, 47.8], [21.4, 46.6]], '#e8b82e', 1, true); c.ell(24, 44, 1.4, 1.4, '#c8383f'); },
    inside(c) { c.poly([[20, 26.8], [22.8, 26], [24, 26.4], [25.2, 26], [28, 26.8], [26.4, 28.4], [24, 27.8], [21.6, 28.4]], '#c9ccd6', 1, true); c.poly([[18.4, 11.2], [24, 9], [29.6, 11.2], [24, 11.6]], '#e8b82e', 0.95, true); },
    post(c) { c.ell(10.2, 38.4, 3.4, 1.6, hx('#e8b82e')); c.ell(37.8, 38.4, 3.4, 1.6, hx('#e8b82e')); c.ell(24, 4.2, 1.2, 1.2, '#ffd98a'); c.soft(24, 4.2, 4, 3, [255, 217, 138], 0.4); } });
}

// small extras on a face, so two of the same crook still look different
function accessory(c, acc, col) {
  if (acc === 'plaster') { c.poly([[26.6, 22.6], [32, 20.6], [33.2, 23], [27.8, 25.2]], '#ecc89c', 1, true); c.soft(30, 23, 3, 1.4, [0, 0, 0], 0.14); c.poly([[29, 21.4], [30.6, 21], [31.2, 24], [29.6, 24.4]], '#f6dcb8', 0.9); c.ell(29.8, 22.7, 0.25, 0.25, '#c89a68'); c.ell(30.4, 23.1, 0.25, 0.25, '#c89a68'); }
  else if (acc === 'beacon') { const cc = typeof col === 'string' ? col : '#ffd98a'; c.line(33, 7, 35.6, 2.6, 0.4, '#c9d2ff'); c.ell(35.8, 2.4, 1.1, 1.1, cc); c.soft(35.8, 2.4, 3.4, 3.4, hx(cc), 0.35); }
  else if (acc === 'eyepatch') { c.curve([[14.2, 15.6], [19.4, 17], [24.2, 14.6], [33.8, 14.2]], 0.4, '#15151f', 0.95); c.poly(spline([[16.8, 19.4], [19.8, 16.8], [22.8, 19.4], [19.8, 22.2]], true), '#15151f', 1, false); c.line(18.2, 18.4, 19.4, 17.8, 0.3, [255, 255, 255], 0.3); }
  else if (acc === 'freckles') { for (const p of [[17.4, 24.4], [19, 25.6], [20.6, 24.6], [27.4, 24.6], [29, 25.6], [30.6, 24.4], [22.2, 23.2], [25.8, 23.2]]) c.ell(p[0], p[1], 0.3, 0.3, '#9a5a30', 0.75); }
  else if (acc === 'facepaint') { const cc = typeof col === 'string' ? col : '#ff4fd8'; c.line(16.4, 22.8, 21.6, 24.6, 0.9, cc, 0.9); c.line(31.6, 22.8, 26.4, 24.6, 0.9, cc, 0.9); c.line(16.8, 24.4, 20.8, 25.8, 0.5, cc, 0.7); c.line(31.2, 24.4, 27.2, 25.8, 0.5, cc, 0.7); }
  else if (acc === 'patch') { const cc = typeof col === 'string' ? col : '#4de3ff'; c.poly([[9.6, 43], [14.2, 43], [14.2, 47.4], [9.6, 47.4]], cc, 1, false); c.ell(11.9, 45.2, 1.1, 1.1, '#05060f', 0.8); c.line(9.6, 43, 14.2, 47.4, 0.2, '#ffffff', 0.5); }
}

function bgFor(c, bgIdx, seed) {
  const b = hx(BGS[bgIdx]);
  c.rect(0, 0, N, N, (x, y) => mix(lt(b, 0.04), dk(b, 0.6), clamp(y / 48 * 0.8 + (x - 24) * 0.01, 0, 1)));
  c.soft(10, 40, 22, 14, [157, 123, 255], 0.1); c.soft(40, 8, 16, 10, [77, 227, 255], 0.07);
  for (let i = 0; i < 46; i++) { const h1 = hash(i + 1, (seed % 997) + 3), h2 = hash(i + 91, (seed % 991) + 7), r = 0.12 + hash(i, 5) * 0.2; c.ell(h1 * N, h2 * N, r, r, i % 7 === 0 ? '#bfe6ff' : '#ffffff', 0.35 + hash(i, 9) * 0.6); }
  const pc = [[[255, 190, 130], [190, 90, 80]], [[200, 170, 255], [100, 70, 210]], [[150, 230, 255], [60, 130, 210]]][seed % 3];
  c.ell(41.5, 9.5, 4.6, 4.6, (x, y) => mix(pc[0], dk(pc[1], 0.6), clamp(((x - 39) + (y - 7)) / 9, 0, 1)));
}
function paint(slot, secret, opts) {
  const t = traitsFor(slot, secret), L = Object.assign({}, SPECIES[t.species].looks[t.look]);
  if (opts && /^#[0-9a-f]{6}$/.test(opts.suit || '')) L.suit = opts.suit;
  const c = new Canvas(BGS[t.bg]); bgFor(c, t.bg, t.seed);
  DRAW[t.species](c, L, { skin: L.skin, eye: (t.look + t.species.length) % 4, brow: '#3a2a1e', hairStyle: t.hair, hairCol: t.hairCol, beard: t.beard, glasses: t.glasses });
  accessory(c, t.acc, ACC_COL[t.accColor]);
  return c;
}
function paintFlagship() { const c = new Canvas('#070b1f'); bgFor(c, 1, 7); c.soft(24, 20, 26, 26, [255, 214, 90], 0.1); admiral(c); return c; }

// ---- flat pictures for logos and tiles, cached because drawing one takes a moment ----
const picCache = new Map();
function cached(key, size, make) {
  size = Math.max(32, Math.min(2048, Math.round(size) || 512));
  const k = key + ':' + size; let b = picCache.get(k);
  if (!b) { b = encodePng(make().toRgb(size), size, size); picCache.set(k, b); if (picCache.size > 160) picCache.delete(picCache.keys().next().value); }
  return b;
}

const png = (slot, secret, size, opts) => cached('a' + secret + ':' + slot + ':' + ((opts && opts.suit) || ''), size || 512, () => paint(slot, secret, opts));
const founderPng = (size) => cached('prime', size || 512, paintFlagship);

// a five-point star, as runs of squares on a 64 x 64 grid, for the locked tiles and the logo
const STAR = (() => { const p = []; for (let i = 0; i < 10; i++) { const r = i % 2 ? 11 : 28, a = -Math.PI / 2 + i * Math.PI / 5; p.push([32 + r * Math.cos(a), 34 + r * Math.sin(a)]); } return p; })();
const SHAPE_ON = (x, y) => {
  const px = x + 0.5, py = y + 0.5; let inside = false;
  for (let i = 0, j = STAR.length - 1; i < STAR.length; j = i++) {
    const [xi, yi] = STAR[i], [xj, yj] = STAR[j];
    if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
};
function silhouette() {
  const runs = [];
  for (let y = 0; y < 64; y++) { let x = 0; while (x < 64) { if (!SHAPE_ON(x, y)) { x++; continue; } let n = 1; while (x + n < 64 && SHAPE_ON(x + n, y)) n++; runs.push([y, x, n]); x += n; } }
  return runs;
}

module.exports = { png, founderPng, silhouette, traitsFor, agentFor, ROLES, ABILITIES, SPECIES, N };
