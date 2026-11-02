// 皮影戏复刻 —— 参考 皮影.mp4（抖音 @王子源，115s）
// 复刻的是机制与视觉签名，不是逐帧：
//   视觉签名：暖黄纸底＋中央光晕＋四周暗角（灯箱）、黑褐剪影＋镂空刻纹、红/绿点缀、立柱檐廊、云纹、神奈川式大浪
//   机制签名：油灯让整块幕布的光斑跳；皮件是刚体只绕铆钉转；动作按 10fps 一顿一顿；杆子从皮件往下往外走
// 原片情节线：宫廷庭院 → 卷轴展开 → 大人物俯身特写 → 队伍追兽 → 海浪 → 城门朝拜受阅
const W = 1920, H = 1080, { clamp, lerp, rng } = U, P = PAINT;
const RED = '#c0352a', GRN = '#2f7d4c', AMB = '#d99a2e', YEL = '#e2bd4a';
const EDGE = '#3a160a', BLU = '#2c5a8a', ORG = '#d9782a', DKBLU = '#1d3f66';
const K = P.carve;                                    // 刻纹库：鱼子/团花/云纹/方格/刻线
const step = (t, fps = 10) => U.stepTime(t, fps);     // 杆操的「一顿一顿」

const piece = (g, path, col, carve, edge = 5) => P.piece(g, path, col, carve, { edge, line: EDGE });
const rivet = (c, x, y, r = 7) => { c.fillStyle = '#2a1006'; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.fillStyle = '#b07a3a'; c.beginPath(); c.arc(x - 1, y - 1, r * 0.42, 0, 7); c.fill(); };
const rod = (c, A, B) => { c.save(); c.filter = 'blur(1.2px)'; c.globalCompositeOperation = 'multiply'; c.strokeStyle = 'rgba(60,30,12,.85)'; c.lineWidth = 5; c.beginPath(); c.moveTo(...A); c.lineTo(...B); c.stroke(); c.restore(); };
const rot = (p, o, a) => { const c = Math.cos(a), s = Math.sin(a), x = p[0] - o[0], y = p[1] - o[1]; return [o[0] + x * c - y * s, o[1] + x * s + y * c]; };
const stamp = (c, layer, dx = 7, dy = 5) => P.stamp(c, layer, { dx, dy });
const poly = (pts) => { const p = new Path2D(); pts.forEach((q, i) => i ? p.lineTo(q[0], q[1]) : p.moveTo(q[0], q[1])); p.closePath(); return p; };

// ---------- 影窗：油灯在幕后的暖光斑，灯焰让光斑跳 ----------
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
  c.save(); c.globalCompositeOperation = 'multiply'; c.drawImage(P.cached('py_weave2', W, H, (w) => {
    w.fillStyle = '#fff'; w.fillRect(0, 0, W, H); w.strokeStyle = 'rgba(120,90,50,.08)'; w.lineWidth = 1;
    for (let x = 0; x < W; x += 3) { w.beginPath(); w.moveTo(x, 0); w.lineTo(x, H); w.stroke(); }
    for (let y = 0; y < H; y += 3) { w.beginPath(); w.moveTo(0, y); w.lineTo(W, y); w.stroke(); }
    w.drawImage(P.grain('pyg2', 0.06, [120, 80, 40], 0.3), 0, 0);
  }), 0, 0); c.restore();
  return fl;
}
// 木框＋暗角
function frame(c) {
  c.drawImage(P.cached('py_frame2', W, H, (g) => {
    g.fillStyle = '#2a140a'; g.beginPath(); g.rect(0, 0, W, H); g.rect(28, 24, W - 56, H - 48); g.fill('evenodd');
    g.strokeStyle = '#a8742e'; g.lineWidth = 3; g.strokeRect(34, 30, W - 68, H - 60);
    const vg = g.createRadialGradient(960, 500, 500, 960, 540, 1150);
    vg.addColorStop(0, 'rgba(40,15,0,0)'); vg.addColorStop(1, 'rgba(40,15,0,.45)');
    g.fillStyle = vg; g.fillRect(28, 24, W - 56, H - 48);
  }), 0, 0);
}

// ---------- 皮件库：人形 / 兽 / 道具 ----------
// 简化人形：头（空脸＋冠）、身（袍，刻云纹）、两袖、腿。返回关节点供杆子与铆钉用。
function figure(g, x, y, s, robe, opts = {}) {
  const { crown = 0, sleeveCol = GRN, lean = 0, armRaise = 0, walk = 0 } = opts;
  const u = (v) => v * s;
  g.save(); g.translate(x, y); g.scale(s, s); g.rotate(lean);
  // 腿（走动时前后摆）
  const sw = Math.sin(walk) * 16;
  piece(g, poly([[-26, 120], [-8, 120], [-6 + sw * 0.5, 250], [-28 + sw * 0.5, 250]]), EDGE, null, 3);
  piece(g, poly([[10, 120], [28, 120], [30 - sw * 0.5, 250], [12 - sw * 0.5, 250]]), EDGE, null, 3);
  // 袍：梯形身，刻云纹
  const body = poly([[-52, -20], [52, -20], [40, 130], [-40, 130]]);
  piece(g, body, robe, (k) => K.clouds(k, -46, 0, 46, 120, 34));
  // 领襟
  piece(g, poly([[-16, -22], [16, -22], [10, 40], [-10, 40]]), YEL, (k) => K.dots(k, -12, -16, 12, 36, 12, 2.4), 3);
  // 袖：远袖固定，近袖随 armRaise 抬起
  const sh = [-46, -6], el = [-78, 40 + armRaise * -30], hd = [-96, 96 + armRaise * -70];
  piece(g, poly([[sh[0], sh[1]], [sh[0] - 14, sh[1] + 30], [el[0], el[1] + 20], [el[0] + 20, el[1] - 10]]), sleeveCol, (k) => K.clouds(k, -80, 0, -40, 60, 26));
  piece(g, poly([[el[0], el[1]], [el[0] - 12, el[1] + 22], [hd[0], hd[1] + 16], [hd[0] + 22, hd[1] - 12]]), sleeveCol, (k) => K.dots(k, -100, 20, -70, 110, 12, 2.6));
  const hand = new Path2D(); hand.ellipse(hd[0], hd[1], 15, 12, 0, 0, 7);
  g.save(); g.globalCompositeOperation = 'destination-out'; g.fill(hand); g.restore();
  g.strokeStyle = EDGE; g.lineWidth = 2.4; g.stroke(hand);
  // 头：发/冠 → 空脸 → 五官
  const nk = [0, -34];
  g.save(); g.translate(nk[0], nk[1]); g.rotate(opts.headTilt || 0); g.translate(-nk[0], -nk[1]);
  const head = new Path2D(); head.ellipse(0, -66, 40, 46, 0, 0, 7);
  piece(g, head, AMB, (k) => K.clouds(k, -34, -108, 34, -30, 26));
  g.save(); g.globalCompositeOperation = 'destination-out'; g.fill(head); g.restore();
  g.strokeStyle = EDGE; g.lineWidth = 3; g.stroke(head);
  // 凤眼＋眉＋唇
  g.strokeStyle = EDGE; g.lineWidth = 2.6;
  g.beginPath(); g.moveTo(-22, -70); g.quadraticCurveTo(-12, -78, -2, -72); g.stroke();
  g.beginPath(); g.moveTo(6, -72); g.quadraticCurveTo(16, -78, 26, -70); g.stroke();
  g.fillStyle = EDGE; g.beginPath(); g.arc(-12, -71, 2.6, 0, 7); g.arc(16, -71, 2.6, 0, 7); g.fill();
  g.lineWidth = 2.2; g.beginPath(); g.moveTo(-24, -84); g.quadraticCurveTo(-12, -90, 0, -84); g.stroke();
  g.beginPath(); g.moveTo(6, -84); g.quadraticCurveTo(18, -90, 30, -84); g.stroke();
  g.fillStyle = RED; g.beginPath(); g.arc(2, -52, 4, 0, 7); g.fill();
  if (crown) {   // 冠冕：一顶方帽＋两根展翅
    piece(g, poly([[-46, -104], [46, -104], [40, -140], [-40, -140]]), EDGE, (k) => K.dots(k, -38, -136, 38, -108, 14, 3), 3);
    g.strokeStyle = YEL; g.lineWidth = 6;
    g.beginPath(); g.moveTo(-40, -130); g.lineTo(-96, -146); g.stroke();
    g.beginPath(); g.moveTo(40, -130); g.lineTo(96, -146); g.stroke();
  }
  g.restore();
  g.restore();
  return { neck: [x, y + u(-34)], hand: [x + u(hd[0]), y + u(hd[1])] };
}
// 四足兽（猪/狗）：身＋头＋四腿＋尾，跑动时腿摆、身起伏
function beast(g, x, y, s, col, run = 0) {
  g.save(); g.translate(x, y); g.scale(s, s);
  const bob = Math.sin(run * 2) * 6;
  g.translate(0, bob);
  const body = poly([[-90, -10], [70, -26], [96, 6], [60, 46], [-70, 50], [-96, 20]]);
  piece(g, body, col, (k) => { K.dots(k, -80, 0, 80, 40, 16, 3); K.lines(k, [[[-40, -6], [-30, 40]], [[0, -14], [10, 42]]], 5); });
  // 四腿（对角摆动＝小跑）
  [[-60, 1], [-20, -1], [30, 1], [66, -1]].forEach(([lx, ph], i) => {
    const a = Math.sin(run + ph * 2.2 + i) * 0.5;
    g.save(); g.translate(lx, 40); g.rotate(a);
    piece(g, poly([[-12, 0], [12, 0], [10, 76], [-10, 76]]), EDGE, null, 3);
    g.restore();
  });
  // 头
  g.save(); g.translate(-96, 6); g.rotate(Math.sin(run * 0.5) * 0.08);
  const hd = poly([[-10, -40], [40, -30], [56, 4], [30, 34], [-14, 26]]);
  piece(g, hd, col, (k) => { k.beginPath(); k.ellipse(20, 6, 20, 10, 0, 0, 7); k.fill(); K.dots(k, -6, -30, 44, 24, 12, 2.6); });
  g.strokeStyle = EDGE; g.lineWidth = 2.4; g.beginPath(); g.ellipse(20, 6, 20, 10, 0, 0, 7); g.stroke();
  piece(g, poly([[-14, -26], [-40, -44], [-30, -8]]), EDGE, null, 3);        // 耳
  g.fillStyle = EDGE; g.beginPath(); g.arc(24, -12, 4, 0, 7); g.fill();       // 眼
  g.restore();
  // 尾
  g.save(); g.translate(94, 4); g.rotate(Math.sin(run * 1.6) * 0.6);
  piece(g, poly([[0, 0], [52, -18], [46, 6]]), EDGE, null, 3);
  g.restore();
  g.restore();
}
// 立柱（宫廷）：柱身＋斗拱
function pillar(g, x, top, bot, col = '#8a4a22') {
  piece(g, poly([[x - 34, bot], [x + 34, bot], [x + 30, top], [x - 30, top]]), col, (k) => K.lattice(k, x - 26, top + 10, x + 26, bot - 10, 30, 16), 4);
  piece(g, poly([[x - 56, top + 6], [x + 56, top + 6], [x + 44, top - 34], [x - 44, top - 34]]), col, (k) => K.dots(k, x - 48, top - 28, x + 48, top, 14, 3), 3);
}
// 檐廊（顶部横梁＋回纹）
function eave(g, y) {
  piece(g, poly([[0, y], [W, y], [W, y + 46], [0, y + 46]]), '#7a3a1a', (k) => {
    for (let x = 20; x < W; x += 96) K.clouds(k, x, y + 4, x + 76, y + 42, 26);
  }, 4);
  for (let x = 60; x < W; x += 240) { g.fillStyle = RED; g.beginPath(); g.arc(x, y + 68, 12, 0, 7); g.fill(); }
}
// 灯笼（提在杆头，会摆）
function lantern(g, x, y, sway) {
  g.save(); g.translate(x, y); g.rotate(sway);
  piece(g, poly([[-30, 0], [30, 0], [38, 46], [22, 74], [-22, 74], [-38, 46]]), RED, (k) => K.dots(k, -30, 6, 30, 70, 12, 2.6), 4);
  g.strokeStyle = YEL; g.lineWidth = 4; g.beginPath(); g.moveTo(0, 74); g.lineTo(0, 96); g.stroke();
  g.restore();
}
// 神奈川式大浪：多层翻卷浪头＋浪爪
function wave(g, cx, cy, s, ph, col = DKBLU) {
  g.save(); g.translate(cx, cy); g.scale(s, s); g.translate(0, Math.sin(ph) * 14);
  for (let L = 0; L < 3; L++) {
    const o = L * 60, amp = 300 - L * 60;                 // 浪要高，才读得出「翻卷」而不是平缓起伏
    const pts = [];
    for (let i = 0; i <= 26; i++) {
      const u = i / 26, x = -700 + u * 1400;
      const y = -Math.sin(u * Math.PI * 2 + ph + L * 0.8) * amp * 0.5 + o;
      pts.push([x, y]);
    }
    // 浪头卷曲：末端向内勾（勾得深一点，像神奈川的浪爪往回勾）
    pts.push([740, 60 + o], [700, -120 + o], [600, -70 + o], [560, -150 + o]);
    const p = poly(pts.concat([[700, 300 + o], [-700, 300 + o]]));
    piece(g, p, L === 0 ? col : (L === 1 ? BLU : '#3a6a9a'), (k) => {
      K.lines(k, pts.filter((_, i) => i % 4 === 0).map((q, i, arr) => i < arr.length - 1 ? [q, arr[i + 1]] : [q, q]).slice(0, 6), 5);
    }, 4);
    // 浪爪：白色皮件，要够大够多才看得出（原片 signature 就是翻卷的浪爪）
    for (let i = 0; i < 6; i++) {
      const bx = 360 + i * 78, by = -80 + o + Math.sin(ph + i * 0.9) * 22;
      const s2 = 1.0 + 0.25 * Math.sin(ph + i);
      g.save(); g.translate(bx, by); g.scale(s2, s2);
      piece(g, poly([[0, 0], [46, -78], [22, -14], [70, -54], [16, 16], [58, -18], [-6, 22]]), '#f6ecd6', null, 3);
      g.restore();
    }
  }
  g.restore();
}

// ================= ① 宫廷庭院：立柱、高台上端坐者、提灯人走来、跪伏瑞兽 =================
SCENES['p1_gongting'] = (() => ({
  draw(c, lt, t) {
    screen(c, t); const ts = step(t);
    const L = P.scratch('p1'), g = L.getContext('2d'); g.reset();
    eave(g, 120);
    pillar(g, 380, 200, 900); pillar(g, 1560, 200, 900);
    // 高台（右）
    piece(g, poly([[1240, 900], [1720, 900], [1700, 742], [1260, 742]]), '#8a4a22', (k) => K.lattice(k, 1268, 760, 1692, 890, 34, 18), 4);
    for (let i = 0; i < 3; i++) piece(g, poly([[1300 + i * 130, 900], [1420 + i * 130, 900], [1420 + i * 130, 946], [1300 + i * 130, 946]]), '#7a3a1a', null, 3);
    // 端坐者（红袍冠冕）
    figure(g, 1470, 700, 0.94, RED, { crown: 1, headTilt: 0.05 * Math.sin(ts * 2) });
    // 跪伏瑞兽（左，缓慢呼吸）
    beast(g, 700, 830, 0.78, ORG, ts * 0.4);
    // 提灯人：自左向右走，灯笼随步伐摆
    const wk = ts * 6, wx = lerp(420, 1120, clamp(lt / 4.2));
    figure(g, wx, 700, 0.86, GRN, { walk: wk, armRaise: 0.55, headTilt: 0.04 * Math.sin(ts * 3) });
    lantern(g, wx - 150, 560, 0.16 * Math.sin(wk));
    stamp(c, L, 7, 5);
    rod(c, [wx - 150, 640], [wx - 320, 1080]); rod(c, [1470, 660], [1620, 1080]); rod(c, [700, 800], [560, 1080]);
    frame(c);
  }
}))();

// ================= ② 卷轴展开：竹简卷轴缓缓摊开（过场） =================
SCENES['p2_juanzhou'] = (() => ({
  draw(c, lt, t) {
    screen(c, t);
    const L = P.scratch('p2'), g = L.getContext('2d'); g.reset();
    const pr = clamp(lt / 4.0);                    // 展开进度
    const w = lerp(120, 1320, pr);
    const x0 = 960 - w / 2;
    piece(g, poly([[x0, 430], [x0 + w, 430], [x0 + w, 690], [x0, 690]]), AMB, (k) => {
      for (let i = 0; i < 14; i++) { const bx = x0 + 40 + i * (w - 80) / 14; if (bx < x0 + w - 30) k.fillRect(bx, 446, 3, 228); }
    }, 4);
    // 两端卷轴杆
    piece(g, poly([[x0 - 34, 410], [x0 + 6, 410], [x0 + 6, 712], [x0 - 34, 712]]), '#7a3a1a', (k) => K.dots(k, x0 - 28, 420, x0, 700, 16, 2.6), 3);
    piece(g, poly([[x0 + w - 6, 410], [x0 + w + 34, 410], [x0 + w + 34, 712], [x0 + w - 6, 712]]), '#7a3a1a', (k) => K.dots(k, x0 + w, 420, x0 + w + 28, 700, 16, 2.6), 3);
    // 简上字迹痕（短横线，随展开逐条显）
    g.strokeStyle = EDGE; g.lineWidth = 4; g.globalAlpha = 0.7;
    for (let i = 0; i < 14; i++) { const bx = x0 + 52 + i * (w - 100) / 14; if (bx < x0 + w - 30) { g.beginPath(); g.moveTo(bx, 470); g.lineTo(bx, 650); g.stroke(); } }
    g.globalAlpha = 1;
    stamp(c, L, 8, 5);
    rod(c, [x0 - 14, 700], [x0 - 120, 1080]); rod(c, [x0 + w + 14, 700], [x0 + w + 120, 1080]);
    frame(c);
  }
}))();

// ================= ③ 人物特写：大人物俯身向小人（大小悬殊＝压迫感） =================
SCENES['p3_texie'] = (() => ({
  draw(c, lt, t) {
    screen(c, t); const ts = step(t);
    const L = P.scratch('p3'), g = L.getContext('2d'); g.reset();
    const bow = 0.16 * (0.5 - 0.5 * Math.cos(clamp(lt / 3.4) * Math.PI));   // 俯身
    // 大人物（右，占半屏）
    figure(g, 1460, 760, 1.9, RED, { crown: 1, lean: bow, armRaise: 0.7, headTilt: bow * 0.5 });
    // 小人（左下，绿衣，仰视）
    figure(g, 560, 900, 0.78, GRN, { lean: -0.12, headTilt: -0.14 });
    stamp(c, L, 9, 6);
    rod(c, [1460, 500], [1700, 1080]); rod(c, [560, 830], [420, 1080]);
    frame(c);
  }
}))();

// ================= ④ 追逐：一队人挥杆追赶奔兽，翻过山坡 =================
SCENES['p4_zhuizhu'] = (() => ({
  draw(c, lt, t) {
    screen(c, t); const ts = step(t), run = ts * 9;
    const L = P.scratch('p4'), g = L.getContext('2d'); g.reset();
    // 起伏山坡（两层剪影）
    piece(g, poly([[0, 940], [520, 830], [1080, 900], [1600, 810], [W, 880], [W, 1080], [0, 1080]]), '#6a4a22', (k) => K.dots(k, 0, 880, W, 1060, 30, 3), 4);
    piece(g, poly([[0, 1010], [640, 930], [1300, 990], [W, 940], [W, 1080], [0, 1080]]), '#4a3018', null, 4);
    // 奔兽（右→左逃窜）
    const bx = lerp(1560, 700, clamp(lt / 4.4));
    const gy = 880 - Math.sin(bx / 260) * 40;
    beast(g, bx, gy, 0.92, ORG, run * 1.4);
    // 追的人：三人挥长杆
    for (let i = 0; i < 3; i++) {
      const px = bx + 240 + i * 210, py = 880 - Math.sin(px / 260) * 40;
      figure(g, px, py - 40, 0.72, i === 1 ? RED : GRN, { walk: run + i * 1.1, armRaise: 0.85 + 0.12 * Math.sin(run + i) });
      // 长杆
      g.save(); g.strokeStyle = EDGE; g.lineWidth = 7;
      const hx = px - 130, hy = py - 130 + Math.sin(run + i) * 26;
      g.beginPath(); g.moveTo(hx, hy); g.lineTo(hx + 150, hy + 120); g.stroke(); g.restore();
    }
    stamp(c, L, 7, 5);
    for (let i = 0; i < 3; i++) { const px = bx + 240 + i * 210; rod(c, [px, 800], [px - 60, 1080]); }
    rod(c, [bx, gy - 40], [bx + 80, 1080]);
    frame(c);
  }
}))();

// ================= ⑤ 海浪：神奈川式大浪翻卷，远处一叶舟 =================
SCENES['p5_hailang'] = (() => ({
  draw(c, lt, t) {
    screen(c, t); const ph = t * 1.5;
    const L = P.scratch('p5'), g = L.getContext('2d'); g.reset();
    // 远舟
    const bx = 420, by = 470 + Math.sin(ph * 0.8) * 22;
    piece(g, poly([[bx - 90, by], [bx + 90, by], [bx + 66, by + 44], [bx - 66, by + 44]]), '#5a3a1a', null, 3);
    g.strokeStyle = EDGE; g.lineWidth = 5; g.beginPath(); g.moveTo(bx, by); g.lineTo(bx, by - 90); g.stroke();
    piece(g, poly([[bx + 4, by - 88], [bx + 4, by - 20], [bx + 52, by - 30]]), YEL, null, 2);
    wave(g, 1120, 660, 1.15, ph);
    wave(g, 560, 880, 0.9, ph * 0.8 + 1.2);
    stamp(c, L, 8, 6);
    rod(c, [bx, by + 40], [bx - 100, 1080]); rod(c, [1120, 700], [1300, 1080]);
    frame(c);
  }
}))();

// ================= ⑥ 朝拜受阅：红袍高官面对士兵方阵（城楼＋红旗） =================
SCENES['p6_chaobai'] = (() => ({
  draw(c, lt, t) {
    screen(c, t); const ts = step(t);
    const L = P.scratch('p6'), g = L.getContext('2d'); g.reset();
    // 城楼（远景剪影）
    piece(g, poly([[1160, 880], [1780, 880], [1780, 560], [1470, 470], [1160, 560]]), '#7a3a1a', (k) => K.lattice(k, 1180, 590, 1760, 870, 40, 20), 4);
    piece(g, poly([[1140, 566], [1800, 566], [1760, 520], [1180, 520]]), '#5a2a12', null, 3);
    // 红旗（两面，随风摆）
    for (const fx of [1240, 1700]) {
      const sw2 = 0.14 * Math.sin(ts * 3 + fx);
      g.save(); g.translate(fx, 430); g.rotate(sw2);
      piece(g, poly([[0, 0], [150, 16], [128, 96], [0, 78]]), RED, (k) => K.dots(k, 10, 10, 140, 88, 16, 2.8), 3);
      g.restore();
      g.strokeStyle = EDGE; g.lineWidth = 5; g.beginPath(); g.moveTo(fx, 430); g.lineTo(fx, 880); g.stroke();
    }
    // 红袍高官（左，抬手挥袖）
    figure(g, 480, 800, 1.15, RED, { crown: 1, armRaise: 0.5 + 0.25 * Math.sin(ts * 2.4), headTilt: 0.03 * Math.sin(ts * 2) });
    // 士兵方阵：三排举戟
    for (let r = 0; r < 3; r++) for (let i = 0; i < 4; i++) {
      const sx = 900 + i * 200 + r * 60, sy = 800 + r * 46;
      const fig = figure(g, sx, sy, 0.42 - r * 0.02, r === 0 ? ORG : GRN, { armRaise: 0.95 });
      // 长戟
      g.save(); g.strokeStyle = EDGE; g.lineWidth = 5;
      const jx = sx - 60, jy = sy - 40 + Math.sin(ts * 2 + i + r) * 8;
      g.beginPath(); g.moveTo(jx, jy); g.lineTo(jx + 40, jy - 150); g.stroke();
      g.beginPath(); g.moveTo(jx + 40, jy - 150); g.lineTo(jx + 30, jy - 186); g.stroke();
      g.beginPath(); g.moveTo(jx + 40, jy - 150); g.lineTo(jx + 62, jy - 140); g.stroke(); g.restore();
    }
    stamp(c, L, 8, 5);
    rod(c, [480, 620], [340, 1080]); rod(c, [1300, 760], [1180, 1080]);
    frame(c);
  }
}))();
