'use strict';
// GTA's moving backdrops, plain 2D canvas, in a neon Miami-sunset style: a striped sun, palm trees, a night skyline and a car cruising by.
// GridBg is the quiet scene behind the pages; GridIntro is the loading-screen style intro with the most wanted line-up.
// Both stop when the page is hidden and respect reduced motion. Everything here is original art drawn in code.
(function (root) {
  var PINK = '#ff3d9a', TEAL = '#2ef2e6', RED = '#ff3b4e', BLUE = '#3b7bff', GOLD = '#ffd24a';
  var reduce = !!(root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches);
  root.caveReduce = reduce;

  // the skyline is laid out on a 1280 wide board: [x, width, height]
  var BLD = [[0, 70, 210], [70, 90, 290], [160, 60, 190], [220, 100, 330], [320, 70, 240], [390, 80, 350], [470, 90, 210], [560, 70, 280], [630, 100, 340], [730, 70, 210], [800, 90, 310], [890, 80, 250], [970, 100, 350], [1070, 70, 220], [1140, 140, 290]];
  var LOGS = ['> new mission: make your move', '> wanted level: 5 stars', '> 4 suspects in custody', '> 8 still at large', '> radio: sirens on ocean drive', '> everybody is a suspect'];

  function sizeCanvas(cv) {
    var dpr = Math.min(root.devicePixelRatio || 1, 2), w = cv.clientWidth || root.innerWidth, h = cv.clientHeight || root.innerHeight;
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
    return { w: w, h: h, dpr: dpr };
  }
  function loop(self, fps, draw) {
    var last = 0, raf = 0, on = false;
    function tick(t) {
      if (!on) return;
      raf = root.requestAnimationFrame(tick);
      if (t - last < 1000 / fps) return;
      last = t;
      draw(t / 1000);
    }
    self.start = function () { if (on) return; on = true; raf = root.requestAnimationFrame(tick); };
    self.stop = function () { on = false; root.cancelAnimationFrame(raf); };
    root.document.addEventListener('visibilitychange', function () { if (root.document.hidden) { if (on) root.cancelAnimationFrame(raf); } else if (on) { raf = root.requestAnimationFrame(tick); } });
  }
  function star(ctx, cx, cy, r) {
    ctx.beginPath();
    for (var i = 0; i < 10; i++) { var rr = i % 2 ? r * 0.4 : r, a = -Math.PI / 2 + i * Math.PI / 5; ctx[i ? 'lineTo' : 'moveTo'](cx + rr * Math.cos(a), cy + rr * Math.sin(a)); }
    ctx.closePath();
  }

  // ---- scenery, all on the 1280 x 720 board ----
  function sky(ctx, W, H, dim) {
    var g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#0d051a'); g.addColorStop(0.42, '#2d0b52'); g.addColorStop(0.64, '#b4217a'); g.addColorStop(0.8, '#ff6a3d'); g.addColorStop(1, '#ffc15a');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    if (dim) { ctx.fillStyle = 'rgba(8,3,16,' + dim + ')'; ctx.fillRect(0, 0, W, H); }
  }
  // a big striped sun sitting on the skyline
  function sun(ctx, cx, cy, r, t) {
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.clip();
    var g = ctx.createLinearGradient(0, cy - r, 0, cy + r); g.addColorStop(0, '#fff07a'); g.addColorStop(0.5, '#ff9a3d'); g.addColorStop(1, '#ff2d95');
    ctx.fillStyle = g; ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    ctx.fillStyle = 'rgba(40,6,70,.9)';
    for (var i = 0; i < 7; i++) { var y = cy + r * 0.05 + i * r * 0.15 + (t ? (Math.sin(t * 0.4) * 2) : 0); ctx.fillRect(cx - r, y, r * 2, 3 + i * 2.6); }
    ctx.restore();
    var h = ctx.createRadialGradient(cx, cy, r, cx, cy, r * 2); h.addColorStop(0, 'rgba(255,90,160,.28)'); h.addColorStop(1, 'rgba(255,90,160,0)');
    ctx.fillStyle = h; ctx.beginPath(); ctx.arc(cx, cy, r * 2, 0, 7); ctx.fill();
  }
  function skyline(ctx, base, lit, t) {
    BLD.forEach(function (b, i) {
      var g = ctx.createLinearGradient(0, base - b[2], 0, base); g.addColorStop(0, '#2a0c46'); g.addColorStop(1, '#0c0418');
      ctx.fillStyle = g; ctx.fillRect(b[0], base - b[2], b[1], b[2]);
      ctx.fillStyle = 'rgba(255,61,154,.55)'; ctx.fillRect(b[0], base - b[2], b[1], 2);
      for (var y = base - b[2] + 22; y < base - 20; y += 30) for (var x = b[0] + 10; x < b[0] + b[1] - 14; x += 24) {
        var h = (x * 7 + y * 13 + i * 5) % 11;
        if (h > 3) continue;
        var blink = h === 0 && Math.sin(t * 1.3 + x) < -0.55;
        ctx.fillStyle = blink ? 'rgba(255,210,74,.1)' : (h === 1 ? 'rgba(46,242,230,' + lit + ')' : (h === 2 ? 'rgba(255,61,154,' + lit + ')' : 'rgba(255,210,74,' + lit + ')'));
        ctx.fillRect(x, y, 8, 10);
      }
    });
  }
  // a palm tree: a leaning trunk and a crown of fronds that sway a little
  function palm(ctx, x, base, h, lean, t, ph) {
    var topx = x + lean, topy = base - h, sw = Math.sin(t * 0.8 + ph) * 5;
    ctx.fillStyle = '#080212'; ctx.strokeStyle = '#080212';
    ctx.lineWidth = Math.max(6, h * 0.035); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x, base); ctx.quadraticCurveTo(x + lean * 0.2, base - h * 0.55, topx + sw * 0.4, topy); ctx.stroke();
    for (var i = 0; i < 8; i++) {
      var a = -Math.PI / 2 + (i - 3.5) * 0.46, len = h * 0.36 + (i % 2) * h * 0.04, wob = Math.sin(t * 0.9 + ph + i) * 0.05;
      var ex = topx + sw * 0.4 + Math.cos(a + wob) * len, ey = topy + Math.sin(a + wob) * len * 0.5 + len * 0.42;
      ctx.lineWidth = Math.max(3, h * 0.02);
      ctx.beginPath(); ctx.moveTo(topx + sw * 0.4, topy); ctx.quadraticCurveTo((topx + ex) / 2, topy - len * 0.34, ex, ey); ctx.stroke();
      ctx.lineWidth = 1.4;
      for (var k = 1; k < 6; k++) { var f = k / 6, px = topx + (ex - topx) * f, py = topy + (ey - topy) * f - Math.sin(f * Math.PI) * len * 0.17; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + (ex > topx ? 1 : -1) * 4, py + len * 0.1); ctx.stroke(); }
    }
  }
  // a low convertible, side on, with its lights on
  function car(ctx, x, y, s, on) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.fillStyle = '#07020f';
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(8, -16); ctx.lineTo(54, -20); ctx.lineTo(72, -34); ctx.lineTo(100, -34); ctx.lineTo(112, -20); ctx.lineTo(150, -16); ctx.lineTo(160, 0); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(34, 0, 13, 0, 7); ctx.arc(126, 0, 13, 0, 7); ctx.fill();
    ctx.fillStyle = on ? '#fff7c2' : '#a89a60'; ctx.fillRect(152, -14, 8, 5);
    ctx.fillStyle = RED; ctx.fillRect(0, -14, 6, 4);
    var g = ctx.createLinearGradient(160, 0, 320, 0); g.addColorStop(0, 'rgba(255,247,194,.3)'); g.addColorStop(1, 'rgba(255,247,194,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(160, -14); ctx.lineTo(320, -40); ctx.lineTo(320, 20); ctx.lineTo(160, -9); ctx.fill();
    ctx.fillStyle = PINK; ctx.fillRect(14, -9, 132, 2);
    ctx.restore();
  }

  // ---- the quiet backdrop: the sunset, a dim skyline and palms at the edges ----
  function GridBg(cv, o) {
    o = o || {};
    var ctx = cv.getContext('2d'), self = this, fps = o.fps || 10;
    function draw(t) {
      sizeCanvas(cv); var W = cv.width, H = cv.height;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      sky(ctx, W, H, 0.38);
      var sc = Math.max(W / 1280, H / 720) * 0.95;
      ctx.setTransform(sc, 0, 0, sc, (W - 1280 * sc) * 0.5, H - 720 * sc);
      sun(ctx, 860, 520, 150, t);
      skyline(ctx, 720, 0.28, t);
      palm(ctx, 60, 740, 520, 70, t, 0); palm(ctx, 150, 740, 380, 50, t, 2); palm(ctx, 1230, 740, 540, -80, t, 1); palm(ctx, 1130, 740, 360, -40, t, 3);
    }
    loop(self, fps, draw);
    if (reduce) { self.start = function () { draw(0); }; }
  }

  // ---- the intro: a loading screen. Sunset, palms, a car cruising by, and four of the most wanted in tilted frames ----
  function GridIntro(cv, o) {
    o = o || {};
    var ctx = cv.getContext('2d'), self = this, faces = o.faces || [], t0 = 0;
    function draw(t) {
      if (!t0) t0 = t;
      var e = t - t0;
      sizeCanvas(cv); var W = cv.width, H = cv.height;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      sky(ctx, W, H, 0);
      var sc = Math.max(W / 1280, H / 720), ox = (W - 1280 * sc) * 0.5, oy = (H - 720 * sc);
      ctx.setTransform(sc, 0, 0, sc, ox, oy);
      sun(ctx, 640, 500, 190, e);
      skyline(ctx, 700, 0.8, e);
      palm(ctx, 70, 740, 600, 90, e, 0); palm(ctx, 190, 740, 440, 60, e, 2); palm(ctx, 1220, 740, 620, -90, e, 1); palm(ctx, 1100, 740, 420, -60, e, 3);
      // the road and the car
      ctx.fillStyle = '#07020f'; ctx.fillRect(0, 690, 1280, 30);
      ctx.fillStyle = 'rgba(255,210,74,.7)'; for (var x = -((e * 120) % 90); x < 1280; x += 90) ctx.fillRect(x, 703, 46, 4);
      var cx = ((e * 90) % 1700) - 340; car(ctx, cx, 688, 0.9, Math.floor(e * 3) % 2 === 0);
      // police lights wash over everything
      var on = Math.floor(e * 1.6) % 2 === 0;
      ctx.fillStyle = on ? 'rgba(255,59,78,.10)' : 'rgba(59,123,255,.10)'; ctx.fillRect(0, 0, 1280, 720);
      // four of the most wanted in tilted frames, like a loading-screen collage
      var xs = [770, 880, 990, 1100], ys = [150, 190, 140, 180], rot = [-0.1, 0.06, -0.05, 0.1], plates = ['0412', '0415', '0416', '0413'];
      ctx.imageSmoothingEnabled = true;
      xs.forEach(function (x, i) {
        var im = faces[i], w = 150, bob = Math.sin(e * 0.9 + i) * 4;
        ctx.save(); ctx.translate(x + w / 2, ys[i] + w / 2 + bob + 130); ctx.rotate(rot[i]);
        ctx.shadowColor = i % 2 ? PINK : TEAL; ctx.shadowBlur = 24; ctx.fillStyle = '#f6f0ff'; ctx.fillRect(-w / 2 - 7, -w / 2 - 7, w + 14, w + 46); ctx.shadowBlur = 0;
        if (im && im.complete && im.naturalWidth) ctx.drawImage(im, -w / 2, -w / 2, w, w); else { ctx.fillStyle = '#2a0c46'; ctx.fillRect(-w / 2, -w / 2, w, w); }
        ctx.fillStyle = '#1a0830'; ctx.font = '600 20px "Special Elite", monospace'; ctx.fillText(plates[i], -w / 2 + 6, w / 2 + 26);
        ctx.restore();
      });
      // the wanted level fills up star by star, then holds at five
      var lit = Math.min(5, 2 + Math.floor(e / 1.2));
      for (var k = 0; k < 5; k++) { star(ctx, 1000 + k * 44, 70, 18); ctx.fillStyle = k < lit ? GOLD : 'rgba(255,255,255,.18)'; ctx.fill(); }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      var v = ctx.createRadialGradient(W * 0.55, H * 0.5, Math.min(W, H) * 0.35, W * 0.55, H * 0.5, Math.max(W, H) * 0.9); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(8,2,16,.65)');
      ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
    }
    loop(self, o.fps || 30, draw);
    if (reduce) { self.start = function () { draw(0); }; }
  }
  GridIntro.LOGS = LOGS;
  GridIntro.create = function (cv, o) { return new GridIntro(cv, o); };

  root.GridBg = GridBg; root.GridIntro = GridIntro;
})(window);
