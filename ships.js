'use strict';
// Launch Bay's spaceships: six original designs drawn in code on a 2D canvas, nose up, origin at the middle of the hull.
// The launch form lets you pick one; the coin page shows it; a short lift-off scene plays after a launch.
// This file runs in the browser (window.Ships) and in Node (the server only needs the list of ids).
(function (root) {
  var SHIPS = [
    { id: 'comet', name: 'Comet', tag: 'Sleek and fast. Built to arrive first.' },
    { id: 'nova', name: 'Nova', tag: 'The classic. Nothing fancy, never fails.' },
    { id: 'orbiter', name: 'Orbiter', tag: 'A winged shuttle with twin boosters.' },
    { id: 'saucer', name: 'Saucer', tag: 'No flame, just a hum and a glow.' },
    { id: 'falcon', name: 'Falcon', tag: 'A heavy lifter with three engines.' },
    { id: 'pod', name: 'Pod', tag: 'Small, round and surprisingly quick.' },
  ];
  var ids = SHIPS.map(function (s) { return s.id; });
  if (typeof window === 'undefined') { root.SHIPS = SHIPS; root.isShip = function (v) { return ids.indexOf(v) >= 0; }; return; }

  var CY = '#4de3ff', VI = '#9d7bff', MG = '#ff4fd8', AM = '#ffd98a';
  function lg(ctx, x0, y0, x1, y1, stops) { var g = ctx.createLinearGradient(x0, y0, x1, y1); stops.forEach(function (s, i) { g.addColorStop(s[0], s[1]); }); return g; }
  function flame(ctx, x, y, w, len, t, hot) {
    var l = len * (0.85 + 0.15 * Math.sin(t * 38 + x)), g = ctx.createLinearGradient(0, y, 0, y + l);
    g.addColorStop(0, 'rgba(255,248,220,1)'); g.addColorStop(0.35, hot || 'rgba(255,170,90,.9)'); g.addColorStop(1, 'rgba(255,79,216,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - w, y); ctx.quadraticCurveTo(x, y + l * 1.15, x + w, y); ctx.fill();
  }
  function win(ctx, x, y, r, col) { ctx.fillStyle = '#0a0d22'; ctx.beginPath(); ctx.arc(x, y, r + 2, 0, 7); ctx.fill(); ctx.fillStyle = col || CY; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.beginPath(); ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.3, 0, 7); ctx.fill(); }

  var DRAW = {
    comet: function (ctx, f, t) {
      if (f > 0) flame(ctx, 0, 50, 9, 30 + f * 90, t, 'rgba(120,230,255,.95)');
      ctx.fillStyle = lg(ctx, -14, 0, 14, 0, [[0, '#9ea9e8'], [0.5, '#f2f5ff'], [1, '#8d97d8']]); ctx.beginPath(); ctx.moveTo(0, -118); ctx.bezierCurveTo(16, -70, 18, -10, 12, 50); ctx.lineTo(-12, 50); ctx.bezierCurveTo(-18, -10, -16, -70, 0, -118); ctx.fill();
      ctx.fillStyle = CY; ctx.beginPath(); ctx.moveTo(-12, 8); ctx.lineTo(-44, 58); ctx.lineTo(-12, 44); ctx.fill(); ctx.beginPath(); ctx.moveTo(12, 8); ctx.lineTo(44, 58); ctx.lineTo(12, 44); ctx.fill();
      ctx.fillStyle = VI; ctx.fillRect(-2, 8, 4, 40); win(ctx, 0, -50, 7);
    },
    nova: function (ctx, f, t) {
      if (f > 0) flame(ctx, 0, 40, 13, 34 + f * 90, t);
      ctx.fillStyle = MG; ctx.beginPath(); ctx.moveTo(-24, 10); ctx.lineTo(-50, 54); ctx.lineTo(-24, 40); ctx.fill(); ctx.beginPath(); ctx.moveTo(24, 10); ctx.lineTo(50, 54); ctx.lineTo(24, 40); ctx.fill();
      ctx.fillStyle = lg(ctx, -26, 0, 26, 0, [[0, '#aab4f0'], [0.5, '#f0f3ff'], [1, '#98a2e4']]); ctx.beginPath(); ctx.moveTo(0, -104); ctx.quadraticCurveTo(32, -60, 25, 42); ctx.lineTo(-25, 42); ctx.quadraticCurveTo(-32, -60, 0, -104); ctx.fill();
      ctx.fillStyle = '#7f8cff'; ctx.beginPath(); ctx.moveTo(0, -104); ctx.quadraticCurveTo(13, -84, 15, -54); ctx.lineTo(-15, -54); ctx.quadraticCurveTo(-13, -84, 0, -104); ctx.fill();
      win(ctx, 0, -26, 10); ctx.fillStyle = '#7f8cff'; ctx.fillRect(-25, 14, 50, 5);
    },
    orbiter: function (ctx, f, t) {
      if (f > 0) { flame(ctx, -34, 46, 7, 26 + f * 70, t); flame(ctx, 34, 46, 7, 26 + f * 70, t); flame(ctx, 0, 52, 10, 30 + f * 80, t); }
      ctx.fillStyle = '#ff9a5c'; [-34, 34].forEach(function (x) { ctx.beginPath(); ctx.moveTo(x, -70); ctx.quadraticCurveTo(x + 9, -62, x + 8, 44); ctx.lineTo(x - 8, 44); ctx.quadraticCurveTo(x - 9, -62, x, -70); ctx.fill(); });
      ctx.fillStyle = '#eceffa'; ctx.beginPath(); ctx.moveTo(-20, 20); ctx.lineTo(-56, 54); ctx.lineTo(-20, 48); ctx.fill(); ctx.beginPath(); ctx.moveTo(20, 20); ctx.lineTo(56, 54); ctx.lineTo(20, 48); ctx.fill();
      ctx.fillStyle = lg(ctx, -20, 0, 20, 0, [[0, '#c9cfe8'], [0.5, '#ffffff'], [1, '#bcc3e0']]); ctx.beginPath(); ctx.moveTo(0, -108); ctx.quadraticCurveTo(24, -70, 20, 50); ctx.lineTo(-20, 50); ctx.quadraticCurveTo(-24, -70, 0, -108); ctx.fill();
      ctx.fillStyle = '#2a2e4a'; ctx.beginPath(); ctx.moveTo(0, -108); ctx.quadraticCurveTo(10, -92, 11, -76); ctx.lineTo(-11, -76); ctx.quadraticCurveTo(-10, -92, 0, -108); ctx.fill(); ctx.fillStyle = '#c8383f'; ctx.fillRect(-20, 30, 40, 4); win(ctx, 0, -48, 7, AM);
    },
    saucer: function (ctx, f, t) {
      if (f > 0) { var g = ctx.createLinearGradient(0, 14, 0, 14 + 60 + f * 90); g.addColorStop(0, 'rgba(120,255,220,.55)'); g.addColorStop(1, 'rgba(120,255,220,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-26, 14); ctx.lineTo(26, 14); ctx.lineTo(54 + f * 24, 74 + f * 90); ctx.lineTo(-54 - f * 24, 74 + f * 90); ctx.fill(); }
      ctx.fillStyle = 'rgba(77,227,255,.35)'; ctx.beginPath(); ctx.ellipse(0, -18, 26, 28, 0, Math.PI, 0); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(0, -18, 26, 28, 0, Math.PI, 0); ctx.stroke();
      ctx.fillStyle = lg(ctx, 0, -6, 0, 24, [[0, '#e3e8ff'], [1, '#7d86c8']]); ctx.beginPath(); ctx.ellipse(0, 4, 64, 20, 0, 0, 7); ctx.fill();
      ctx.fillStyle = VI; ctx.beginPath(); ctx.ellipse(0, 10, 64, 10, 0, 0, Math.PI); ctx.fill();
      for (var i = -3; i <= 3; i++) { ctx.fillStyle = (i + 3) % 2 ? MG : CY; ctx.beginPath(); ctx.arc(i * 17, 8 + Math.abs(i) * 0.6, 3.4, 0, 7); ctx.fill(); }
    },
    falcon: function (ctx, f, t) {
      if (f > 0) { flame(ctx, -30, 52, 8, 28 + f * 80, t); flame(ctx, 0, 56, 11, 34 + f * 96, t); flame(ctx, 30, 52, 8, 28 + f * 80, t); }
      ctx.fillStyle = '#b9c0dc'; [-30, 30].forEach(function (x) { ctx.beginPath(); ctx.moveTo(x, -44); ctx.quadraticCurveTo(x + 12, -36, x + 10, 52); ctx.lineTo(x - 10, 52); ctx.quadraticCurveTo(x - 12, -36, x, -44); ctx.fill(); ctx.fillStyle = AM; ctx.fillRect(x - 10, -2, 20, 5); ctx.fillStyle = '#b9c0dc'; });
      ctx.fillStyle = lg(ctx, -20, 0, 20, 0, [[0, '#cfd5ee'], [0.5, '#ffffff'], [1, '#aeb6d8']]); ctx.beginPath(); ctx.moveTo(0, -112); ctx.quadraticCurveTo(24, -76, 20, 54); ctx.lineTo(-20, 54); ctx.quadraticCurveTo(-24, -76, 0, -112); ctx.fill();
      ctx.fillStyle = '#2a2e4a'; ctx.fillRect(-20, 20, 40, 6); ctx.fillStyle = AM; ctx.fillRect(-20, 30, 40, 4); win(ctx, 0, -52, 8, MG);
    },
    pod: function (ctx, f, t) {
      if (f > 0) { flame(ctx, -16, 40, 6, 20 + f * 60, t); flame(ctx, 16, 40, 6, 20 + f * 60, t); }
      ctx.fillStyle = CY; ctx.beginPath(); ctx.moveTo(-30, 0); ctx.lineTo(-50, 42); ctx.lineTo(-24, 34); ctx.fill(); ctx.beginPath(); ctx.moveTo(30, 0); ctx.lineTo(50, 42); ctx.lineTo(24, 34); ctx.fill();
      ctx.fillStyle = lg(ctx, -34, -30, 34, 40, [[0, '#f4f6ff'], [1, '#8d97d8']]); ctx.beginPath(); ctx.moveTo(0, -78); ctx.bezierCurveTo(44, -50, 40, 30, 26, 42); ctx.lineTo(-26, 42); ctx.bezierCurveTo(-40, 30, -44, -50, 0, -78); ctx.fill();
      ctx.fillStyle = VI; ctx.fillRect(-27, 26, 54, 6); win(ctx, 0, -22, 15); ctx.fillStyle = MG; ctx.beginPath(); ctx.arc(0, -66, 3.4, 0, 7); ctx.fill();
    },
  };

  // draw one ship centred on (x, y); fire is 0 to 1
  function draw(ctx, id, x, y, scale, fire, t) {
    var f = DRAW[id] || DRAW.nova; ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale); f(ctx, fire || 0, t || 0); ctx.restore();
  }
  function thumb(cv, id) {
    var dpr = Math.min(window.devicePixelRatio || 1, 2), w = cv.clientWidth || 96, h = cv.clientHeight || 96;
    cv.width = w * dpr; cv.height = h * dpr; var ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
    var g = ctx.createRadialGradient(w / 2, h / 2, 4, w / 2, h / 2, w * 0.6); g.addColorStop(0, 'rgba(157,123,255,.25)'); g.addColorStop(1, 'rgba(157,123,255,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    draw(ctx, id, w / 2, h / 2 - 2, Math.min(w, h) / 230, 0, 0);
  }

  // the lift-off scene: a full-screen canvas with the chosen ship, a countdown, a flame and the pilot's portrait
  function liftoff(cv, id, faceSrc, label, done) {
    var ctx = cv.getContext('2d'), face = new Image(), t0 = 0, raf = 0, stop = false, W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    face.src = faceSrc || '';
    var rnd = function (i) { var s = Math.sin(i * 127.1) * 43758.5453; return s - Math.floor(s); };
    function size() { W = cv.clientWidth || window.innerWidth; H = cv.clientHeight || window.innerHeight; cv.width = W * dpr; cv.height = H * dpr; }
    size();
    function frame(ts) {
      if (stop) return; if (!t0) t0 = ts; var e = (ts - t0) / 1000;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#03040c'); bg.addColorStop(1, '#14103a'); ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
      var lift = e < 3 ? 0 : Math.min(1, (e - 3) / 3), up = lift * lift * (H + 420);
      for (var i = 0; i < 90; i++) { var sy = (rnd(i + 1) * H + up * (0.15 + rnd(i + 7) * 0.5)) % H, sx = rnd(i + 40) * W; ctx.fillStyle = 'rgba(255,255,255,' + (0.3 + rnd(i + 3) * 0.6) + ')'; ctx.fillRect(sx, sy, 1.5, 1.5 + lift * 10 * rnd(i + 9)); }
      var pad = H * 0.82; ctx.fillStyle = '#0a0d22'; ctx.fillRect(W / 2 - 150, pad, 300, H - pad); ctx.fillStyle = 'rgba(157,123,255,.7)'; ctx.fillRect(W / 2 - 150, pad, 300, 2);
      var shake = e > 2 && e < 3.6 ? Math.sin(e * 90) * 1.6 : 0, sc = Math.min(1.7, H / 480), sy2 = pad - 48 * sc - up, fire = e < 1.5 ? 0 : Math.min(1, (e - 1.5) / 2);
      if (fire > 0) { var gl = ctx.createRadialGradient(W / 2, pad, 4, W / 2, pad, 160 * sc); gl.addColorStop(0, 'rgba(255,170,100,' + 0.35 * fire * (1 - lift) + ')'); gl.addColorStop(1, 'rgba(255,170,100,0)'); ctx.fillStyle = gl; ctx.fillRect(0, pad - 160 * sc, W, 320 * sc); }
      draw(ctx, id, W / 2 + shake, sy2, sc, fire, e);
      ctx.textAlign = 'center'; ctx.fillStyle = '#4de3ff'; ctx.font = '500 22px "JetBrains Mono", monospace';
      ctx.fillText(e < 3 ? 'T-' + String(Math.max(0, 3 - Math.floor(e))).padStart(2, '0') : (lift < 1 ? 'LIFTOFF' : 'IN ORBIT'), W / 2, 56);
      ctx.fillStyle = '#eef2ff'; ctx.font = '600 18px Inter, sans-serif'; ctx.fillText(label || '', W / 2, 88);
      if (face.complete && face.naturalWidth) { var r = 40, fx = Math.max(60, W / 2 - 250), fy = 150; ctx.save(); ctx.beginPath(); ctx.arc(fx, fy, r, 0, 7); ctx.clip(); ctx.drawImage(face, fx - r, fy - r, r * 2, r * 2); ctx.restore(); ctx.lineWidth = 4; ctx.strokeStyle = '#4de3ff'; ctx.beginPath(); ctx.arc(fx, fy, r + 2, 0, 7); ctx.stroke(); }
      if (e > 7.2) { stop = true; if (done) done(); return; }
      raf = window.requestAnimationFrame(frame);
    }
    raf = window.requestAnimationFrame(frame);
    return { stop: function () { stop = true; window.cancelAnimationFrame(raf); } };
  }
  root.Ships = { list: SHIPS, draw: draw, thumb: thumb, liftoff: liftoff, isShip: function (v) { return ids.indexOf(v) >= 0; } };
})(typeof window !== 'undefined' ? window : module.exports);
