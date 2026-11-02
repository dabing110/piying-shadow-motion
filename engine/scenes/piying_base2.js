// 皮影世界 · 公共皮件库（12 部奥斯卡短片共用）——全部包在 IIFE 里，只往 window.PY 上挂，不污染全局词法环境。
// 视觉签名沿用皮影复刻版：暖黄纸底＋中央光晕＋四周暗角（灯箱）、黑褐剪影＋镂空刻纹、红/绿点缀、杆子操纵、10fps 一顿一顿。
(() => {
  const W = 1920, H = 1080, { clamp, lerp, rng } = U, P = PAINT;
  const C = {
    RED: '#c0352a', GRN: '#2f7d4c', AMB: '#d99a2e', YEL: '#e2bd4a',
    EDGE: '#3a160a', BLU: '#2c5a8a', ORG: '#d9782a', DKBLU: '#1d3f66',
    PAPER: '#f6ecd6', BRN: '#8a4a22', WHT: '#f2ead2', PINK: '#d0506a',
  };
  const K = P.carve;
  const step = (t, fps = 10) => U.stepTime(t, fps);
  const poly = (pts) => { const p = new Path2D(); pts.forEach((q, i) => i ? p.lineTo(q[0], q[1]) : p.moveTo(q[0], q[1])); p.closePath(); return p; };
  const ell = (x, y, rx, ry, a = 0) => { const p = new Path2D(); p.ellipse(x, y, rx, ry, a, 0, Math.PI * 2); return p; };
  const piece = (g, path, col, carve, edge = 5) => P.piece(g, path, col, carve, { edge, line: C.EDGE });
  const rivet = (c, x, y, r = 7) => { c.fillStyle = '#2a1006'; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.fillStyle = '#b07a3a'; c.beginPath(); c.arc(x - 1, y - 1, r * 0.42, 0, 7); c.fill(); };
  const rod = (c, A, B) => { c.save(); c.filter = 'blur(1.2px)'; c.globalCompositeOperation = 'multiply'; c.strokeStyle = 'rgba(60,30,12,.85)'; c.lineWidth = 5; c.beginPath(); c.moveTo(A[0], A[1]); c.lineTo(B[0], B[1]); c.stroke(); c.restore(); };
  const rot = (p, o, a) => { const c = Math.cos(a), s = Math.sin(a), x = p[0] - o[0], y = p[1] - o[1]; return [o[0] + x * c - y * s, o[1] + x * s + y * c]; };
  const stamp = (c, layer, dx = 7, dy = 5) => P.stamp(c, layer, { dx, dy });

  // 影窗：油灯在幕后的暖光斑，灯焰让光斑跳（整片最底层的「活」）
  function screen(c, t) {
    const ft = step(t, 15), fl = 0.5 * P.noise(ft * 3, 1) + 0.3 * P.noise(ft * 9, 4);
    const cx = 960 + fl * 26, cy = 470 + P.noise(ft * 2, 7) * 18;
    const g = c.createRadialGradient(cx, cy, 30, cx, cy + 40, 1150);
    g.addColorStop(0, `rgb(255,${246 + fl * 8},${214 + fl * 20})`); g.addColorStop(0.35, '#f2d7a0');
    g.addColorStop(0.7, '#cf9a58'); g.addColorStop(1, '#7a4a20');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.save(); c.globalCompositeOperation = 'screen';
    const hg = c.createRadialGradient(cx, cy - 10, 0, cx, cy - 10, 260 + fl * 40);
    hg.addColorStop(0, `rgba(255,236,190,${0.55 + fl * 0.25})`); hg.addColorStop(1, 'rgba(255,236,190,0)');
    c.fillStyle = hg; c.fillRect(0, 0, W, H); c.restore();
    c.save(); c.globalCompositeOperation = 'multiply'; c.drawImage(P.cached('py_weave3', W, H, (w) => {
      w.fillStyle = '#fff'; w.fillRect(0, 0, W, H); w.strokeStyle = 'rgba(120,90,50,.08)'; w.lineWidth = 1;
      for (let x = 0; x < W; x += 3) { w.beginPath(); w.moveTo(x, 0); w.lineTo(x, H); w.stroke(); }
      for (let y = 0; y < H; y += 3) { w.beginPath(); w.moveTo(0, y); w.lineTo(W, y); w.stroke(); }
      w.drawImage(P.grain('pyg3', 0.06, [120, 80, 40], 0.3), 0, 0);
    }), 0, 0); c.restore();
    return fl;
  }
  function frame(c) {
    c.drawImage(P.cached('py_frame3', W, H, (g) => {
      g.fillStyle = '#2a140a'; g.beginPath(); g.rect(0, 0, W, H); g.rect(28, 24, W - 56, H - 48); g.fill('evenodd');
      g.strokeStyle = '#a8742e'; g.lineWidth = 3; g.strokeRect(34, 30, W - 68, H - 60);
      const vg = g.createRadialGradient(960, 500, 500, 960, 540, 1150);
      vg.addColorStop(0, 'rgba(40,15,0,0)'); vg.addColorStop(1, 'rgba(40,15,0,.45)');
      g.fillStyle = vg; g.fillRect(28, 24, W - 56, H - 48);
    }), 0, 0);
  }
  // 地面（一条带排线的地平面）
  function ground(g, y, col = '#6a4a22') {
    piece(g, poly([[0, y], [W, y], [W, H], [0, H]]), col, (k) => K.dots(k, 0, y + 10, W, H - 20, 34, 3), 4);
  }

  // ---------- 人形（可配置：袍色、冠、抬手、走动、前倾、头微转） ----------
  function figure(g, x, y, s, robe, opts = {}) {
    const { crown = 0, sleeveCol = C.GRN, lean = 0, armRaise = 0, walk = 0, headTilt = 0, skin = C.WHT } = opts;
    const u = (v) => v * s;
    g.save(); g.translate(x, y); g.scale(s, s); g.rotate(lean);
    const sw = Math.sin(walk) * 16;
    piece(g, poly([[-26, 120], [-8, 120], [-6 + sw * 0.5, 250], [-28 + sw * 0.5, 250]]), C.EDGE, null, 3);
    piece(g, poly([[10, 120], [28, 120], [30 - sw * 0.5, 250], [12 - sw * 0.5, 250]]), C.EDGE, null, 3);
    const body = poly([[-52, -20], [52, -20], [40, 130], [-40, 130]]);
    piece(g, body, robe, (k) => K.clouds(k, -46, 0, 46, 120, 34));
    piece(g, poly([[-16, -22], [16, -22], [10, 40], [-10, 40]]), C.YEL, (k) => K.dots(k, -12, -16, 12, 36, 12, 2.4), 3);
    const sh = [-46, -6], el = [-78, 40 + armRaise * -30], hd = [-96, 96 + armRaise * -70];
    piece(g, poly([[sh[0], sh[1]], [sh[0] - 14, sh[1] + 30], [el[0], el[1] + 20], [el[0] + 20, el[1] - 10]]), sleeveCol, (k) => K.clouds(k, -80, 0, -40, 60, 26));
    piece(g, poly([[el[0], el[1]], [el[0] - 12, el[1] + 22], [hd[0], hd[1] + 16], [hd[0] + 22, hd[1] - 12]]), sleeveCol, (k) => K.dots(k, -100, 20, -70, 110, 12, 2.6));
    const hand = ell(hd[0], hd[1], 15, 12, 0);
    g.save(); g.globalCompositeOperation = 'destination-out'; g.fill(hand); g.restore();
    g.strokeStyle = C.EDGE; g.lineWidth = 2.4; g.stroke(hand);
    const nk = [0, -34];
    g.save(); g.translate(nk[0], nk[1]); g.rotate(headTilt); g.translate(-nk[0], -nk[1]);
    const head = ell(0, -66, 40, 46);
    piece(g, head, C.AMB, (k) => K.clouds(k, -34, -108, 34, -30, 26));
    g.save(); g.globalCompositeOperation = 'destination-out'; g.fill(head); g.restore();
    g.strokeStyle = C.EDGE; g.lineWidth = 3; g.stroke(head);
    g.strokeStyle = C.EDGE; g.lineWidth = 2.6;
    g.beginPath(); g.moveTo(-22, -70); g.quadraticCurveTo(-12, -78, -2, -72); g.stroke();
    g.beginPath(); g.moveTo(6, -72); g.quadraticCurveTo(16, -78, 26, -70); g.stroke();
    g.fillStyle = C.EDGE; g.beginPath(); g.arc(-12, -71, 2.6, 0, 7); g.arc(16, -71, 2.6, 0, 7); g.fill();
    g.lineWidth = 2.2; g.beginPath(); g.moveTo(-24, -84); g.quadraticCurveTo(-12, -90, 0, -84); g.stroke();
    g.beginPath(); g.moveTo(6, -84); g.quadraticCurveTo(18, -90, 30, -84); g.stroke();
    g.fillStyle = C.RED; g.beginPath(); g.arc(2, -52, 4, 0, 7); g.fill();
    if (crown) {
      piece(g, poly([[-46, -104], [46, -104], [40, -140], [-40, -140]]), C.EDGE, (k) => K.dots(k, -38, -136, 38, -108, 14, 3), 3);
      g.strokeStyle = C.YEL; g.lineWidth = 6;
      g.beginPath(); g.moveTo(-40, -130); g.lineTo(-96, -146); g.stroke();
      g.beginPath(); g.moveTo(40, -130); g.lineTo(96, -146); g.stroke();
    }
    g.restore(); g.restore();
    return { neck: [x + u(-34) * 0, y + u(-34)], hand: [x + u(hd[0]), y + u(hd[1])], headTop: [x, y + u(-112)] };
  }

  // ---------- 四足兽（狗/熊/马/猪通用：身＋头＋四腿＋尾） ----------
  function beast(g, x, y, s, col, run = 0, opts = {}) {
    const { tail = 1, ear = 1 } = opts;
    g.save(); g.translate(x, y); g.scale(s, s); g.translate(0, Math.sin(run * 2) * 6);
    const body = poly([[-90, -10], [70, -26], [96, 6], [60, 46], [-70, 50], [-96, 20]]);
    piece(g, body, col, (k) => { K.dots(k, -80, 0, 80, 40, 16, 3); K.lines(k, [[[-40, -6], [-30, 40]], [[0, -14], [10, 42]]], 5); });
    [[-60, 1], [-20, -1], [30, 1], [66, -1]].forEach(([lx, ph], i) => {
      g.save(); g.translate(lx, 40); g.rotate(Math.sin(run + ph * 2.2 + i) * 0.5);
      piece(g, poly([[-12, 0], [12, 0], [10, 76], [-10, 76]]), C.EDGE, null, 3); g.restore();
    });
    g.save(); g.translate(-96, 6); g.rotate(Math.sin(run * 0.5) * 0.08);
    const hd = poly([[-10, -40], [40, -30], [56, 4], [30, 34], [-14, 26]]);
    piece(g, hd, col, (k) => { k.fill(ell(20, 6, 20, 10)); K.dots(k, -6, -30, 44, 24, 12, 2.6); });
    g.strokeStyle = C.EDGE; g.lineWidth = 2.4; g.stroke(ell(20, 6, 20, 10));
    if (ear) piece(g, poly([[-14, -26], [-40, -44], [-30, -8]]), C.EDGE, null, 3);
    g.fillStyle = C.EDGE; g.beginPath(); g.arc(24, -12, 4, 0, 7); g.fill();
    g.restore();
    if (tail) { g.save(); g.translate(94, 4); g.rotate(Math.sin(run * 1.6) * 0.6); piece(g, poly([[0, 0], [52, -18], [46, 6]]), C.EDGE, null, 3); g.restore(); }
    g.restore();
  }

  // ---------- 鸟（鹬/海鸥：身＋翅＋长喙＋细腿） ----------
  function bird(g, x, y, s, col, flap = 0, opts = {}) {
    const { legPhase = 0 } = opts;
    g.save(); g.translate(x, y); g.scale(s, s);
    piece(g, ell(0, 0, 62, 40), col, (k) => K.dots(k, -50, -30, 50, 30, 14, 2.8));
    // 翅（扇动：绕肩转）
    g.save(); g.translate(-6, -12); g.rotate(Math.sin(flap) * 0.55);
    piece(g, poly([[0, 0], [-30, -54], [46, -62], [58, -18]]), col, (k) => K.lines(k, [[[0, -10], [40, -40]], [[10, -6], [44, -30]]], 4), 3);
    g.restore();
    // 头＋长喙
    g.save(); g.translate(58, -26); g.rotate(Math.sin(flap * 0.5) * 0.1);
    piece(g, ell(0, 0, 26, 22), col, (k) => K.dots(k, -18, -14, 18, 14, 10, 2));
    piece(g, poly([[18, -4], [82, 2], [18, 10]]), C.YEL, null, 3);
    g.fillStyle = C.EDGE; g.beginPath(); g.arc(6, -6, 3.4, 0, 7); g.fill();
    g.restore();
    // 细腿（走动交替）
    [[-14, 0], [16, Math.PI]].forEach(([lx, ph]) => {
      const a = Math.sin(legPhase + ph) * 0.42;
      g.save(); g.translate(lx, 34); g.rotate(a);
      g.strokeStyle = C.EDGE; g.lineWidth = 5; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 58); g.stroke();
      g.beginPath(); g.moveTo(-12, 58); g.lineTo(14, 58); g.stroke(); g.restore();
    });
    g.restore();
  }

  // ---------- 神奈川式大浪（复刻版调过的浪高与浪爪） ----------
  function wave(g, cx, cy, s, ph, col = C.DKBLU) {
    g.save(); g.translate(cx, cy); g.scale(s, s); g.translate(0, Math.sin(ph) * 14);
    for (let L = 0; L < 3; L++) {
      const o = L * 60, amp = 300 - L * 60;
      const pts = [];
      for (let i = 0; i <= 26; i++) { const u = i / 26, x = -700 + u * 1400; pts.push([x, -Math.sin(u * Math.PI * 2 + ph + L * 0.8) * amp * 0.5 + o]); }
      pts.push([740, 60 + o], [700, -120 + o], [600, -70 + o], [560, -150 + o]);
      piece(g, poly(pts.concat([[700, 300 + o], [-700, 300 + o]])), L === 0 ? col : (L === 1 ? C.BLU : '#3a6a9a'),
        (k) => K.lines(k, pts.filter((_, i) => i % 4 === 0).map((q, i, arr) => i < arr.length - 1 ? [q, arr[i + 1]] : [q, q]).slice(0, 6), 5), 4);
      for (let i = 0; i < 6; i++) {
        const bx = 360 + i * 78, by = -80 + o + Math.sin(ph + i * 0.9) * 22, s2 = 1.0 + 0.25 * Math.sin(ph + i);
        g.save(); g.translate(bx, by); g.scale(s2, s2);
        piece(g, poly([[0, 0], [46, -78], [22, -14], [70, -54], [16, 16], [58, -18], [-6, 22]]), C.PAPER, null, 3);
        g.restore();
      }
    }
    g.restore();
  }

  // ---------- 通用小件 ----------
  function tree(g, x, y, s, col = C.GRN) {   // 树（皮影剪纸感）
    g.save(); g.translate(x, y); g.scale(s, s);
    piece(g, poly([[-22, 0], [22, 0], [14, -180], [-14, -180]]), C.BRN, (k) => K.lines(k, [[[-10, -20], [-8, -170]], [[8, -30], [6, -160]]], 4), 3);
    for (let i = 0; i < 3; i++) {
      const cy = -170 - i * 56, r = 130 - i * 26;
      const cp = new Path2D();
      for (let k2 = 0; k2 < 12; k2++) { const a = k2 / 12 * Math.PI * 2; cp.moveTo(Math.cos(a) * r * 0.4, cy + Math.sin(a) * r * 0.3); cp.arc(Math.cos(a) * r * 0.6, cy + Math.sin(a) * r * 0.5, r * 0.34, 0, 7); }
      piece(g, cp, col, (k) => K.dots(k, -r, cy - r, r, cy + r, 20, 3), 3);
    }
    g.restore();
  }
  function house(g, x, y, s, col = C.BRN) {  // 小屋（回忆积木小屋用：可层层叠）
    g.save(); g.translate(x, y); g.scale(s, s);
    piece(g, poly([[-140, 0], [140, 0], [140, -180], [-140, -180]]), col, (k) => K.lattice(k, -130, -170, 130, -10, 34, 18), 4);
    piece(g, poly([[-166, -180], [166, -180], [0, -280]]), col, (k) => K.dots(k, -150, -270, 150, -190, 18, 3), 4);
    piece(g, poly([[-38, 0], [38, 0], [38, -100], [-38, -100]]), C.EDGE, null, 3);
    piece(g, poly([[-96, -150], [-34, -150], [-34, -96], [-96, -96]]), C.YEL, (k) => K.lattice(k, -90, -144, -40, -102, 18, 10), 2);
    g.restore();
  }
  function cloud(g, x, y, s, ph) {            // 云纹皮条
    g.save(); g.translate(x, y); g.scale(s, s);
    for (let i = 0; i < 3; i++) {
      const p = new Path2D();
      for (let k2 = 0; k2 < 8; k2++) { const a = k2 / 8 * Math.PI * 2; p.moveTo(Math.cos(a) * 30, Math.sin(a) * 18); p.arc(Math.cos(a) * 46 + i * 74, Math.sin(a) * 26, 30, 0, 7); }
      piece(g, p, C.PAPER, null, 2);
    }
    g.restore();
  }
  // 一行皮影风标题（写在幕布上，不做白底框，保持皮影质感）
  function title(c, text, alpha = 1, y = 150) {
    if (alpha <= 0.01) return;
    c.save(); c.globalAlpha = alpha; c.fillStyle = 'rgba(58,22,10,.86)';
    c.font = '54px "LXGWWenKai-500"'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(text, 960, y); c.restore();
  }

  window.PY = {
    W, H, C, K, P, U, step, poly, ell, piece, rivet, rod, rot, stamp,
    screen, frame, ground, figure, beast, bird, wave, tree, house, cloud, title,
    clamp, lerp, rng,
  };
})();
