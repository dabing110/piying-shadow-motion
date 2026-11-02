// 奥斯卡最佳动画短片 · 皮影版（第三批）
//   《战争结束了！》War Is Over!（2024 第96届）：反战·童心·连接
//   《男孩、鼹鼠、狐狸和马》（2023 第95届）：善良·家·同行
//   《皆为爱》The Windshield Wiper（2022 第94届）：爱的定义·烟火人间
//   《无论如何我爱你》If Anything Happens I Love You（2021 第93届）：丧失·回忆·和解
//   《亲爱的篮球》Dear Basketball（2018 第90届）：热爱·一生·告别
// 共用皮件库 scenes/piying_base2.js（window.PY）
(() => {
  const { W, H, C, K, P, step, poly, ell, piece, rivet, rod, rot, stamp, screen, frame, ground, figure, beast, bird, wave, tree, house, cloud, title, clamp, lerp, rng } = PY;

  // ---------- 本批专用小件 ----------
  // 确定性哈希：U.h(seed) 返回的是函数（要 r() 才取值），这里直接用数值版
  const h = (x) => { const v = Math.sin(x * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
  // 雪（皮影里雪是纸白点，落在暖黄幕布上很显）
  const snow = (g, t, n = 130, seed = 3) => {
    for (let i = 0; i < n; i++) {
      const sx = (h(i * 3 + seed) * W + t * 12 * (0.5 + h(i + seed))) % (W + 40) - 20;
      const sy = ((h(i * 7 + seed) * H) + t * 70 * (0.6 + h(i * 2 + seed) * 0.8)) % (H + 60) - 30;
      const r = 5.5 + h(i * 11 + seed) * 6;
      g.fillStyle = `rgba(250,242,224,${0.6 + h(i * 5 + seed) * 0.35})`;
      g.beginPath(); g.arc(sx, sy, r, 0, 7); g.fill();
    }
  };
  // 椅子（坐姿必备：靠背＋座面，人坐在其上）
  const chair = (g, x, y, s, col = C.BRN) => {
    g.save(); g.translate(x, y); g.scale(s, s);
    piece(g, poly([[-70, -20], [-56, -20], [-56, -270], [-70, -270]]), col, null, 3);
    piece(g, poly([[56, -20], [70, -20], [70, -270], [56, -270]]), col, null, 3);
    piece(g, poly([[-70, -250], [70, -250], [70, -180], [-70, -180]]), col, (k) => K.lattice(k, -60, -240, 60, -190, 22, 12), 3);
    piece(g, poly([[-90, -20], [90, -20], [90, 6], [-90, 6]]), col, (k) => K.dots(k, -80, -14, 80, 0, 14, 2.4), 3);
    piece(g, poly([[-76, 6], [-58, 6], [-62, 120], [-80, 120]]), col, null, 3);
    piece(g, poly([[58, 6], [76, 6], [80, 120], [62, 120]]), col, null, 3);
    g.restore();
  };
  // 星（夜空）
  const star = (g, x, y, s, col = C.YEL) => {
    g.save(); g.translate(x, y); g.scale(s, s);
    const p = new Path2D();
    for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 - Math.PI / 2, r = i % 2 ? 5 : 13; p.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
    p.closePath(); piece(g, p, col, null, 2); g.restore();
  };
  // 信封（鸽子传信）
  const letter = (g, x, y, s, a = 0) => {
    g.save(); g.translate(x, y); g.scale(s, s); g.rotate(a);
    piece(g, poly([[-40, -26], [40, -26], [40, 26], [-40, 26]]), C.PAPER, (k) => K.lines(k, [[[-40, -26], [0, 4]], [[40, -26], [0, 4]]], 3), 3);
    g.restore();
  };
  // 铁丝网（战壕边界：交叉斜线 + 立柱）
  const wireFence = (g, x0, x1, y) => {
    g.save(); g.globalCompositeOperation = 'multiply';
    g.strokeStyle = 'rgba(58,22,10,.75)'; g.lineWidth = 3;
    for (let x = x0; x <= x1; x += 46) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - 96); g.stroke(); }
    for (let k = 0; k < 4; k++) {
      const yy = y - 14 - k * 24;
      g.beginPath(); g.moveTo(x0, yy);
      for (let x = x0 + 46; x <= x1; x += 46) g.lineTo(x, yy + (k % 2 ? -14 : 14));
      g.stroke();
    }
    g.restore();
  };
  // 旗（战旗 / 白旗）
  const banner = (g, x, y, s, col, ph = 0, txt) => {
    g.save(); g.translate(x, y); g.scale(s, s);
    piece(g, poly([[-8, 0], [8, 0], [8, -300], [-8, -300]]), C.EDGE, null, 3);
    const sw = Math.sin(ph) * 8;
    piece(g, poly([[8, -300], [150, -286 + sw], [150, -190 + sw * 0.6], [8, -180]]), col, (k) => K.dots(k, 20, -280, 140, -196, 16, 3), 3);
    if (txt) { g.fillStyle = C.PAPER; g.font = '46px "LXGWWenKai-500"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, 82, -238); }
    g.restore();
  };
  // 篮球（带弧线）
  const basket = (g, x, y, s) => {
    g.save(); g.translate(x, y); g.scale(s, s);
    piece(g, ell(0, 0, 46, 46), C.ORG, (k) => {
      k.beginPath(); k.moveTo(-46, 0); k.lineTo(46, 0); k.lineWidth = 3; k.stroke();
      k.beginPath(); k.moveTo(0, -46); k.lineTo(0, 46); k.stroke();
      k.beginPath(); k.arc(0, 0, 32, -1.1, 1.1); k.stroke();
      k.beginPath(); k.arc(0, 0, 32, Math.PI - 1.1, Math.PI + 1.1); k.stroke();
    }, 4);
    g.restore();
  };
  // 篮筐（板＋圈＋网）
  const hoop = (g, x, y, s) => {
    g.save(); g.translate(x, y); g.scale(s, s);
    piece(g, poly([[-110, -150], [110, -150], [110, -60], [-110, -60]]), C.BRN, (k) => K.lattice(k, -100, -140, 100, -70, 30, 16), 4);
    piece(g, poly([[-52, -74], [52, -74], [52, -58], [-52, -58]]), C.RED, null, 3);
    g.save(); g.globalCompositeOperation = 'multiply'; g.strokeStyle = 'rgba(58,22,10,.7)'; g.lineWidth = 2.6;
    for (let i = 0; i <= 8; i++) { const u = i / 8, px = -52 + u * 104; g.beginPath(); g.moveTo(px, -56); g.lineTo(-26 + u * 52, 34); g.stroke(); }
    for (let k = 1; k <= 3; k++) { g.beginPath(); g.moveTo(-52 + k * 6, -56 + k * 22); g.lineTo(52 - k * 6, -56 + k * 22); g.stroke(); }
    g.restore(); g.restore();
  };
  // 球衣（挂起的 8 号 / 24 号）
  const jersey = (g, x, y, s, num = '24') => {
    g.save(); g.translate(x, y); g.scale(s, s);
    piece(g, poly([[-70, -60], [-40, -110], [40, -110], [70, -60], [56, 60], [-56, 60]]), C.YEL, (k) => K.dots(k, -50, -100, 50, 50, 18, 3), 4);
    g.fillStyle = C.RED; g.font = '58px "LXGWWenKai-700"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(num, 0, -10);
    g.restore();
  };
  // 情侣群像（都为爱：多对剪影，抽象成两个并肩人形）
  const couple = (g, x, y, s, colA, colB) => {
    figure(g, x - 46, y, s, colA, { armRaise: 0.2, lean: 0.06 });
    figure(g, x + 46, y, s, colB, { armRaise: 0.2, lean: -0.06 });
  };
  // 雨（斜线）
  const rain = (g, t, n = 70, seed = 5) => {
    g.save(); g.globalCompositeOperation = 'multiply'; g.strokeStyle = 'rgba(60,90,120,.5)'; g.lineWidth = 2.4;
    for (let i = 0; i < n; i++) {
      const sx = (h(i * 3 + seed) * W + t * 260) % (W + 200) - 100;
      const sy = ((h(i * 7 + seed) * H) + t * 620) % (H + 200) - 100;
      g.beginPath(); g.moveTo(sx, sy); g.lineTo(sx - 16, sy + 52); g.stroke();
    }
    g.restore();
  };
  // 车窗（矩形框，内含雨刷）
  const carWindow = (g, x, y, w, h) => {
    g.save(); g.globalCompositeOperation = 'multiply';
    g.strokeStyle = 'rgba(58,22,10,.85)'; g.lineWidth = 8; g.strokeRect(x, y, w, h);
    g.restore();
  };
  // 书包 / 校服（丧女幕：静物侧写，绝不画血腥）
  const schoolbag = (g, x, y, s) => {
    g.save(); g.translate(x, y); g.scale(s, s);
    piece(g, poly([[-56, -10], [56, -10], [64, 70], [-64, 70]]), C.GRN, (k) => K.lattice(k, -50, 0, 50, 60, 22, 12), 4);
    piece(g, poly([[-40, -50], [40, -50], [56, -6], [-56, -6]]), C.GRN, (k) => K.dots(k, -46, -44, 46, -12, 14, 2.6), 3);
    piece(g, poly([[-18, -50], [18, -50], [18, -30], [-18, -30]]), C.EDGE, null, 2);
    g.restore();
  };
  // 时钟（那通电话）
  const clock = (g, x, y, s, a) => {
    g.save(); g.translate(x, y); g.scale(s, s);
    piece(g, ell(0, 0, 70, 70), C.PAPER, (k) => K.dots(k, -60, -60, 60, 60, 16, 2.6), 4);
    g.strokeStyle = C.EDGE; g.lineWidth = 5;
    g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * 44, Math.sin(a) * 44); g.stroke();
    g.lineWidth = 7; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a * 0.3) * 28, Math.sin(a * 0.3) * 28); g.stroke();
    g.restore();
  };

  const TAU = Math.PI * 2;

  // ================= 《战争结束了！》=================
  // w1 战壕对峙
  SCENES['w1_zhanhao'] = {
    draw(c, lt, t) {
      screen(c, t); const ts = step(t);
      const L = P.scratch('w1'), g = L.getContext('2d'); g.reset();
      ground(g, 900);
      // 两侧战壕土坡
      piece(g, poly([[0, 900], [300, 900], [340, 700], [0, 660]]), C.BRN, (k) => K.dots(k, 0, 700, 320, 900, 24, 3), 4);
      piece(g, poly([[1620, 900], [1920, 900], [1920, 660], [1580, 700]]), C.BRN, (k) => K.dots(k, 1600, 700, 1920, 900, 24, 3), 4);
      wireFence(g, 380, 860, 900); wireFence(g, 1060, 1540, 900);
      // 焦土中的枯树
      tree(g, 960, 900, 0.5, '#6a4020');
      // 两名士兵隔网对峙（各举一旗）
      banner(g, 520, 900, 0.62, C.RED, ts * 2);
      banner(g, 1400, 900, 0.62, C.DKBLU, ts * 2 + 1.4);
      figure(g, 620, 740, 0.64, C.GRN, { armRaise: 0.5, headTilt: Math.sin(ts) * 0.05 });
      figure(g, 1300, 740, 0.64, C.BLU, { armRaise: 0.5, headTilt: -Math.sin(ts) * 0.05 });
      // 远处炮火（暗红光晕，克制不血腥）
      for (let i = 0; i < 3; i++) {
        const fx = 700 + i * 260, fy = 420 + Math.sin(ts * 2 + i) * 30;
        const rg = g.createRadialGradient(fx, fy, 6, fx, fy, 90);
        rg.addColorStop(0, 'rgba(200,90,40,.30)'); rg.addColorStop(1, 'rgba(200,90,40,0)');
        g.fillStyle = rg; g.beginPath(); g.arc(fx, fy, 90, 0, 7); g.fill();
      }
      stamp(c, L, 7, 5);
      rod(c, [620, 700], [480, 1080]); rod(c, [1300, 700], [1460, 1080]);
      title(c, '同一片焦土 · 两道战壕', clamp(lt * 1.6));
      frame(c);
    }
  };
  // w2 鸽子传信
  SCENES['w2_gezi'] = {
    draw(c, lt, t) {
      screen(c, t); const ts = step(t);
      const L = P.scratch('w2'), g = L.getContext('2d'); g.reset();
      ground(g, 900);
      cloud(g, 420, 380, 1.0, ts); cloud(g, 1500, 320, 0.86, ts + 1);
      // 鸽子横越画面（衔信）
      const u = clamp(lt / 4.6), px = lerp(220, 1700, u), py = 420 + Math.sin(ts * 1.6) * 40;
      bird(g, px, py, 0.9, C.PAPER, ts * 7);
      letter(g, px + 60, py + 18, 0.9, Math.sin(ts * 2) * 0.2);
      // 飞行虚线轨迹
      g.save(); g.globalCompositeOperation = 'multiply'; g.strokeStyle = 'rgba(58,22,10,.35)';
      g.lineWidth = 3; g.setLineDash([14, 16]);
      g.beginPath(); g.moveTo(220, 430);
      for (let i = 1; i <= 12; i++) { const xx = 220 + i * 123; g.lineTo(xx, 420 + Math.sin(i * 0.8) * 46); }
      g.stroke(); g.setLineDash([]); g.restore();
      // 下方两人抬头望
      figure(g, 620, 750, 0.6, C.GRN, { armRaise: 0.85, headTilt: -0.12 });
      figure(g, 1300, 750, 0.6, C.BLU, { armRaise: 0.85, headTilt: 0.12 });
      stamp(c, L, 7, 5);
      rod(c, [px, py], [px - 90, 1080]);
      title(c, '一只鸽子 · 替他们做了笔友', clamp(lt * 1.6));
      frame(c);
    }
  };
  // w3 笔友（两侧各自读信）
  SCENES['w3_biyou'] = {
    draw(c, lt, t) {
      screen(c, t); const ts = step(t);
      const L = P.scratch('w3'), g = L.getContext('2d'); g.reset();
      ground(g, 900);
      // 中缝：一纸之隔（竖线把画面分成两个世界）
      g.save(); g.globalCompositeOperation = 'multiply'; g.strokeStyle = 'rgba(58,22,10,.5)';
      g.lineWidth = 5; g.setLineDash([10, 12]);
      g.beginPath(); g.moveTo(960, 120); g.lineTo(960, 900); g.stroke(); g.setLineDash([]); g.restore();
      // 左：读信的士兵
      figure(g, 520, 745, 0.62, C.GRN, { armRaise: 0.45, headTilt: 0.08 * Math.sin(ts) });
      letter(g, 700, 740, 1.1, Math.sin(ts) * 0.12);
      // 右：写信的士兵
      figure(g, 1400, 745, 0.62, C.BLU, { armRaise: 0.45, headTilt: -0.08 * Math.sin(ts) });
      letter(g, 1220, 745, 1.1, -Math.sin(ts) * 0.12);
      // 两地同一轮月（连接感）
      piece(g, ell(960, 240, 92, 92), C.YEL, (k) => K.dots(k, -80, -80, 80, 80, 20, 3), 4);
      cloud(g, 620, 300, 0.7, ts + 2); cloud(g, 1320, 330, 0.7, ts + 3);
      stamp(c, L, 7, 5);
      rod(c, [520, 700], [400, 1080]); rod(c, [1400, 700], [1520, 1080]);
      title(c, '月亮照着两个写信的人', clamp(lt * 1.6));
      frame(c);
    }
  };
  // w4 战争结束
  SCENES['w4_jieshu'] = {
    draw(c, lt, t) {
      screen(c, t); const ts = step(t);
      const L = P.scratch('w4'), g = L.getContext('2d'); g.reset();
      ground(g, 900);
      // 白旗（停战）
      banner(g, 960, 900, 1.0, C.PAPER, ts * 2);
      // 铁丝网已被剪开（只留残段）
      wireFence(g, 380, 620, 900); wireFence(g, 1300, 1540, 900);
      // 两人在中央相向而行、伸手
      const meet = clamp((lt - 0.6) / 3.4);
      const gx = lerp(560, 880, meet), hx = lerp(1360, 1040, meet);
      figure(g, gx, 745, 0.66, C.GRN, { armRaise: 0.9 * meet, walk: ts * 3 });
      figure(g, hx, 745, 0.66, C.BLU, { armRaise: 0.9 * meet, walk: ts * 3 + 1 });
      // 光：从中央升起（和平）
      const lg = g.createRadialGradient(960, 620, 40, 960, 620, 640);
      lg.addColorStop(0, 'rgba(255,238,196,.5)'); lg.addColorStop(1, 'rgba(255,238,196,0)');
      g.fillStyle = lg; g.fillRect(0, 0, W, H);
      for (let i = 0; i < 7; i++) star(g, 300 + i * 230, 200 + Math.sin(ts + i) * 26, 0.8, C.YEL);
      stamp(c, L, 7, 5);
      rod(c, [gx, 700], [gx - 110, 1080]); rod(c, [hx, 700], [hx + 110, 1080]);
      title(c, '战争结束了 · 他们终于见面', clamp(lt * 1.6));
      frame(c);
    }
  };

  // ================= 《男孩、鼹鼠、狐狸和马》=================
  // m1 雪原独行
  SCENES['m1_xueyuan'] = {
    draw(c, lt, t) {
      screen(c, t); const ts = step(t);
      const L = P.scratch('m1'), g = L.getContext('2d'); g.reset();
      ground(g, 900, '#7a6a4a');
      // 雪丘起伏
      piece(g, poly([[0, 900], [0, 780], [340, 720], [700, 800], [1100, 730], [1500, 790], [1920, 740], [1920, 900]]), C.PAPER, (k) => K.dots(k, 0, 760, 1920, 900, 40, 3), 4);
      tree(g, 420, 900, 0.72, '#3d6b4a'); tree(g, 1560, 900, 0.6, '#3d6b4a');
      figure(g, 900, 750, 0.58, C.RED, { walk: ts * 3, headTilt: Math.sin(ts) * 0.06 });
      stamp(c, L, 7, 5);
      rod(c, [900, 710], [780, 1080]);
      snow(c, t, 230, 3);            // 雪必须画在主画布：离屏层是 multiply，浅色会被吃掉
      title(c, '雪很大 · 男孩独自走着', clamp(lt * 1.6));
      frame(c);
    }
  };
  // m2 遇鼹鼠
  SCENES['m2_yanshu'] = {
    draw(c, lt, t) {
      screen(c, t); const ts = step(t);
      const L = P.scratch('m2'), g = L.getContext('2d'); g.reset();
      ground(g, 900, '#7a6a4a');
      piece(g, poly([[0, 900], [0, 790], [420, 730], [900, 800], [1400, 740], [1920, 790], [1920, 900]]), C.PAPER, (k) => K.dots(k, 0, 770, 1920, 900, 40, 3), 4);
      // 鼹鼠：小兽（深褐、短耳、粉鼻）
      const pop = clamp(lt / 1.6);
      g.save(); g.translate(1180, 900 - 40 * pop);
      piece(g, ell(0, 0, 74, 62), '#5a3a1e', (k) => K.dots(k, -60, -50, 60, 50, 14, 2.6), 4);
      piece(g, poly([[-16, -56], [16, -56], [10, -108], [-10, -108]]), '#5a3a1e', null, 3);  // 鼻
      piece(g, ell(0, -112, 16, 13), C.PINK, null, 3);
      g.fillStyle = C.EDGE; g.beginPath(); g.arc(-26, -18, 5, 0, 7); g.arc(26, -18, 5, 0, 7); g.fill();
      piece(g, poly([[60, -20], [110, -40], [104, 6]]), '#5a3a1e', null, 3);                  // 爪
      g.restore();
      figure(g, 780, 750, 0.58, C.RED, { armRaise: 0.35, headTilt: 0.1 });
      // 对话：一句话浮在鼹鼠上方
      title(c, '「家，是有人等你回去」', clamp((lt - 0.8) * 1.4), 260);
      stamp(c, L, 7, 5);
      rod(c, [780, 710], [660, 1080]); rod(c, [1180, 860], [1260, 1080]);
      snow(c, t, 210, 7);
      frame(c);
    }
  };
  // m3 狐狸与马
  SCENES['m3_huli'] = {
    draw(c, lt, t) {
      screen(c, t); const ts = step(t);
      const L = P.scratch('m3'), g = L.getContext('2d'); g.reset();
      ground(g, 900, '#7a6a4a');
      piece(g, poly([[0, 900], [0, 800], [600, 740], [1100, 810], [1600, 750], [1920, 800], [1920, 900]]), C.PAPER, (k) => K.dots(k, 0, 780, 1920, 900, 40, 3), 4);
      tree(g, 300, 900, 0.66, '#3d6b4a');
      // 狐狸（橙、四足、大尾）
      beast(g, 700, 800, 0.62, C.ORG, ts * 2.2, { ear: 1 });
      // 马（大、深褐）
      beast(g, 1400, 770, 1.24, C.BRN, ts * 1.2, { ear: 1 });
      figure(g, 1000, 745, 0.56, C.RED, { armRaise: 0.5, headTilt: -0.05 * Math.sin(ts) });
      title(c, '「你最勇敢的时候，是我看见你的时候」', clamp((lt - 0.8) * 1.4), 250);
      stamp(c, L, 7, 5);
      // 只给男孩留操杆：兽身上再插杆会被误读成"线框/未渲染完"
      rod(c, [1000, 700], [880, 1080]);
      snow(c, t, 195, 11);
      frame(c);
    }
  };
  // m4 归家（星空下的同行）
  SCENES['m4_guijia'] = {
    draw(c, lt, t) {
      screen(c, t); const ts = step(t);
      const L = P.scratch('m4'), g = L.getContext('2d'); g.reset();
      ground(g, 900, '#7a6a4a');
      piece(g, poly([[0, 900], [0, 790], [500, 730], [1000, 800], [1500, 740], [1920, 790], [1920, 900]]), C.PAPER, (k) => K.dots(k, 0, 770, 1920, 900, 40, 3), 4);
      // 夜空：星与月
      for (let i = 0; i < 14; i++) star(g, 120 + i * 135, 130 + Math.sin(ts + i * 1.7) * 26, 0.62 + (i % 3) * 0.18, C.YEL);
      piece(g, ell(1640, 210, 78, 78), C.YEL, (k) => K.dots(k, -66, -66, 66, 66, 18, 2.6), 4);
      // 远处小屋（家）
      house(g, 1580, 900, 0.62, C.BRN);
      // 四人同行（男孩 + 鼹鼠 + 狐狸 + 马）
      const walk = ts * 2.4;
      figure(g, 620, 750, 0.56, C.RED, { walk, armRaise: 0.25 });
      g.save(); g.translate(880, 880); piece(g, ell(0, 0, 62, 52), '#5a3a1e', (k) => K.dots(k, -50, -42, 50, 42, 12, 2.6), 4);
      piece(g, poly([[-14, -48], [14, -48], [9, -94], [-9, -94]]), '#5a3a1e', null, 3); piece(g, ell(0, -98, 13, 11), C.PINK, null, 3); g.restore();
      beast(g, 1080, 800, 0.58, C.ORG, walk, { ear: 1 });
      beast(g, 1420, 770, 1.1, C.BRN, walk * 0.6, { ear: 1 });
      stamp(c, L, 7, 5);
      rod(c, [620, 706], [500, 1080]); rod(c, [1080, 756], [1000, 1080]);
      snow(c, t, 170, 13);
      title(c, '家不在地图上 · 在同行的人身上', clamp(lt * 1.6));
      frame(c);
    }
  };

  // ================= 《皆为爱》=================
  // v1 咖啡馆
  SCENES['v1_kafei'] = {
    draw(c, lt, t) {
      screen(c, t); const ts = step(t);
      const L = P.scratch('v1'), g = L.getContext('2d'); g.reset();
      ground(g, 900);
      // 桌 + 咖啡杯 + 烟
      piece(g, poly([[640, 900], [1280, 900], [1290, 830], [630, 830]]), C.BRN, (k) => K.lattice(k, 650, 840, 1270, 890, 30, 16), 4);
      piece(g, poly([[-24, 0], [24, 0], [19, 56], [-19, 56]].map(q => [q[0] + 860, q[1] + 774])), C.PAPER, (k) => K.dots(k, 838, 780, 882, 824, 10, 2), 3);
      piece(g, poly([[900, 780], [944, 780], [950, 826], [894, 826]]), C.PAPER, null, 3);
      // 烟（袅袅上升的细曲线）
      g.save(); g.globalCompositeOperation = 'multiply'; g.strokeStyle = 'rgba(58,22,10,.42)'; g.lineWidth = 3.4;
      for (let k = 0; k < 3; k++) {
        g.beginPath(); g.moveTo(922, 770);
        for (let i = 1; i <= 8; i++) g.lineTo(922 + Math.sin(ts * 1.6 + i * 0.7 + k) * 26 * (i / 8), 770 - i * 34);
        g.stroke();
      }
      g.restore();
      // 人：坐在椅子上（先椅子后人在前，形成坐姿）
      chair(g, 620, 792, 0.9, C.BRN);
      figure(g, 620, 745, 0.62, C.BLU, { armRaise: 0.3, headTilt: 0.05 * Math.sin(ts) });
      // 窗（雨夜）：外框 + 十字窗格 + 玻璃里的雨丝
      piece(g, poly([[1330, 270], [1810, 270], [1810, 730], [1330, 730]]), C.BRN, (k) => K.dots(k, 1345, 285, 1795, 715, 26, 3), 5);
      piece(g, poly([[1370, 310], [1770, 310], [1770, 690], [1370, 690]]), C.DKBLU, (k) => {
        k.beginPath(); k.moveTo(1570, 310); k.lineTo(1570, 690); k.lineWidth = 6; k.stroke();
        k.beginPath(); k.moveTo(1370, 500); k.lineTo(1770, 500); k.lineWidth = 6; k.stroke();
      }, 3);
      rain(g, t, 40, 5);
      stamp(c, L, 7, 5);
      // 窗内雨丝：浅色必须画在主画布上（离屏层 multiply 会吃掉浅色）
      c.save(); c.beginPath(); c.rect(1377, 317, 386, 366); c.clip();
      c.strokeStyle = 'rgba(226,238,248,.72)'; c.lineWidth = 3;
      for (let i = 0; i < 18; i++) {
        const sx = 1385 + h(i * 3 + 31) * 370;
        const sy = 320 + ((h(i * 7 + 31) * 360) + t * 300) % 360;
        c.beginPath(); c.moveTo(sx, sy); c.lineTo(sx - 12, sy + 38); c.stroke();
      }
      c.restore();
      rod(c, [620, 700], [500, 1080]);
      title(c, '他抽完这根烟 · 想给爱一个定义', clamp(lt * 1.6));
      frame(c);
    }
  };
  // v2 雨刷（车里）
  SCENES['v2_yushua'] = {
    draw(c, lt, t) {
      screen(c, t); const ts = step(t);
      const L = P.scratch('v2'), g = L.getContext('2d'); g.reset();
      rain(g, t, 90, 9);
      // 车窗
      carWindow(g, 300, 220, 1320, 520);
      // 两把雨刷（左右对称摆动）
      const a = Math.sin(ts * 1.5) * 0.72;
      [[470, 0.9], [1180, -0.9]].forEach(([bx, dir]) => {
        g.save(); g.translate(bx, 740); g.rotate(a * dir);
        g.strokeStyle = C.EDGE; g.lineWidth = 11; g.lineCap = 'round';
        g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -450); g.stroke();
        g.lineWidth = 6; g.beginPath(); g.moveTo(-16, -430); g.lineTo(16, -430); g.stroke();
        g.restore();
      });
      // 车内：两个人的肩部剪影（后视镜视角）
      piece(g, poly([[520, 900], [860, 900], [820, 700], [560, 700]]), C.GRN, (k) => K.clouds(k, 570, 720, 810, 880, 30), 4);
      piece(g, poly([[1060, 900], [1400, 900], [1360, 700], [1100, 700]]), C.PINK, (k) => K.clouds(k, 1110, 720, 1350, 880, 30), 4);
      stamp(c, L, 7, 5);
      title(c, '雨刷来回 · 刮不干净人間事', clamp(lt * 1.6));
      frame(c);
    }
  };
  // v3 爱的群像
  SCENES['v3_qunxiang'] = {
    draw(c, lt, t) {
      screen(c, t); const ts = step(t);
      const L = P.scratch('v3'), g = L.getContext('2d'); g.reset();
      ground(g, 900);
      // 五组并肩的人（爱有千万种样子）
      const cols = [[C.RED, C.PINK], [C.GRN, C.YEL], [C.BLU, C.ORG], [C.PINK, C.BLU], [C.YEL, C.RED]];
      for (let i = 0; i < 5; i++) {
        const x = 260 + i * 350, ph = ts + i * 0.6;
        couple(g, x, 760 + Math.sin(ph) * 6, 0.42, cols[i][0], cols[i][1]);
      }
      // 天上飘的纸片（爱的碎片）
      for (let i = 0; i < 12; i++) {
        const px = (h(i * 3 + 21) * W + t * 40) % (W + 60) - 30;
        const py = 140 + h(i * 7 + 21) * 420 + Math.sin(ts + i) * 22;
        piece(g, poly([[px, py], [px + 34, py + 8], [px + 6, py + 40]]), C.PAPER, null, 2);
      }
      stamp(c, L, 7, 5);
      title(c, '爱是排队 · 是让座 · 是一起淋雨', clamp(lt * 1.6));
      frame(c);
    }
  };
  // v4 定义
  SCENES['v4_dingyi'] = {
    draw(c, lt, t) {
      screen(c, t); const ts = step(t);
      const L = P.scratch('v4'), g = L.getContext('2d'); g.reset();
      ground(g, 900);
      // 中央：一个大大的"爱"字（皮影刻纸感）
      const s = 1 + clamp(lt / 4.6) * 0.12;
      g.save(); g.translate(960, 520); g.scale(s, s);
      piece(g, poly([[-190, -190], [190, -190], [190, 190], [-190, 190]]), C.RED, (k) => K.lattice(k, -180, -180, 180, 180, 40, 22), 5);
      g.fillStyle = C.PAPER; g.font = '220px "LXGWWenKai-700"'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText('爱', 0, 6); g.restore();
      // 字下：两个人并肩
      couple(g, 960, 780, 0.5, C.GRN, C.YEL);
      for (let i = 0; i < 9; i++) star(g, 160 + i * 200, 180 + Math.sin(ts + i) * 24, 0.6, C.YEL);
      stamp(c, L, 7, 5);
      title(c, '爱没有标准答案 · 只有具体的动作', clamp(lt * 1.6));
      frame(c);
    }
  };

  // ================= 《无论如何我爱你》=================
  // i1 空房间（父母背对）
  SCENES['i1_kongfang'] = {
    draw(c, lt, t) {
      screen(c, t); const ts = step(t);
      const L = P.scratch('i1'), g = L.getContext('2d'); g.reset();
      ground(g, 900);
      // 房间：窗与门（空）
      piece(g, poly([[420, 240], [760, 240], [760, 560], [420, 560]]), C.DKBLU, (k) => K.lattice(k, 440, 260, 740, 540, 34, 20), 4);
      piece(g, poly([[1160, 300], [1500, 300], [1500, 900], [1160, 900]]), C.EDGE, (k) => K.dots(k, 1180, 320, 1480, 880, 26, 3), 4);
      // 三把椅子：中间那把空着（缺席的核心意象，比"背对"更好读）
      chair(g, 700, 790, 0.95, C.BRN);
      chair(g, 960, 790, 0.95, C.GRN);
      chair(g, 1220, 790, 0.95, C.BRN);
      // 父母：坐在左右两把上，各自低头、身体向外侧倾
      figure(g, 700, 745, 0.66, C.BLU, { lean: 0.1, headTilt: 0.16 });
      figure(g, 1220, 745, 0.66, C.PINK, { lean: -0.1, headTilt: -0.16 });
      // 中间的空：一道冷光（缺席感）
      g.save(); g.globalCompositeOperation = 'multiply';
      const vg = g.createLinearGradient(880, 120, 1040, 900);
      vg.addColorStop(0, 'rgba(70,90,120,.28)'); vg.addColorStop(1, 'rgba(70,90,120,0)');
      g.fillStyle = vg; g.fillRect(880, 120, 160, 780); g.restore();
      stamp(c, L, 7, 5);
      rod(c, [700, 700], [580, 1080]); rod(c, [1220, 700], [1340, 1080]);
      title(c, '屋子还在 · 中间空了一块', clamp(lt * 1.6));
      frame(c);
    }
  };
  // i2 回忆（女儿成长：三个尺寸同台）
  SCENES['i2_huiyi'] = {
    draw(c, lt, t) {
      screen(c, t); const ts = step(t);
      const L = P.scratch('i2'), g = L.getContext('2d'); g.reset();
      ground(g, 900);
      // 暖光（回忆是暖的）
      const wg = g.createRadialGradient(960, 540, 60, 960, 540, 760);
      wg.addColorStop(0, 'rgba(255,232,180,.45)'); wg.addColorStop(1, 'rgba(255,232,180,0)');
      g.fillStyle = wg; g.fillRect(0, 0, W, H);
      // 三段成长：小、中、大（横向排开，像翻相册）
      const sizes = [[520, 0.34], [960, 0.48], [1400, 0.62]];
      sizes.forEach(([x, s], i) => {
        const ph = clamp((lt - 0.4 - i * 0.9) / 1.2);
        if (ph <= 0.01) return;
        g.save(); g.globalAlpha = ph;
        figure(g, x, 900 - 250 * s, s, C.YEL, { walk: ts * 2 + i, armRaise: 0.3 + i * 0.2, headTilt: Math.sin(ts + i) * 0.06 });
        g.restore();
      });
      // 学步 / 骑车 / 上学：三段下方各一件静物
      piece(g, ell(520, 880, 34, 14), C.RED, null, 3);                       // 小鞋
      piece(g, ell(960, 860, 56, 56), C.GRN, (k) => K.dots(k, -46, -46, 46, 46, 12, 2.4), 3);  // 皮球
      schoolbag(g, 1400, 830, 0.7);
      stamp(c, L, 7, 5);
      title(c, '学步 · 骑车 · 上学 · 一帧一帧', clamp(lt * 1.6));
      frame(c);
    }
  };
  // i3 那通电话（静物侧写，绝不直白）
  SCENES['i3_dianhua'] = {
    draw(c, lt, t) {
      screen(c, t); const ts = step(t);
      const L = P.scratch('i3'), g = L.getContext('2d'); g.reset();
      ground(g, 900);
      // 桌 + 时钟 + 书包 + 一只空椅子
      piece(g, poly([[560, 900], [1360, 900], [1370, 820], [550, 820]]), C.BRN, (k) => K.lattice(k, 570, 830, 1350, 890, 30, 16), 4);
      clock(g, 760, 720, 1.0, ts * 1.1);
      schoolbag(g, 1120, 760, 0.86);
      // 空椅子（缺席）
      piece(g, poly([[520, 900], [520, 760], [560, 760], [560, 620], [660, 620], [660, 700], [640, 700], [640, 900]]), C.GRN, (k) => K.dots(k, 530, 630, 650, 890, 20, 3), 4);
      // 冷色调：这一幕压暗（不画事件，只画余下之物）
      g.save(); c.save(); g.globalCompositeOperation = 'multiply';
      g.fillStyle = 'rgba(40,60,90,.26)'; g.fillRect(0, 0, W, H); g.restore();
      c.globalCompositeOperation = 'multiply'; c.fillStyle = 'rgba(40,60,90,.22)'; c.fillRect(0, 0, W, H); c.restore();
      stamp(c, L, 7, 5);
      title(c, '桌上剩下的东西 · 替她说完了一生', clamp(lt * 1.6));
      frame(c);
    }
  };
  // i4 影子相拥（和解）
  SCENES['i4_yongbao'] = {
    draw(c, lt, t) {
      screen(c, t); const ts = step(t);
      const L = P.scratch('i4'), g = L.getContext('2d'); g.reset();
      ground(g, 900);
      // 女儿的影子（居中、半透明、暖色）
      const fade = clamp(lt / 3.0);
      g.save(); g.globalAlpha = 0.55 * fade;
      figure(g, 960, 745, 0.62, C.YEL, { armRaise: 0.7, headTilt: Math.sin(ts) * 0.05 });
      g.restore();
      // 父母从两侧靠近、合抱
      const meet = clamp((lt - 0.5) / 3.2);
      const px = lerp(600, 856, meet), mx = lerp(1320, 1064, meet);
      figure(g, px, 745, 0.66, C.BLU, { armRaise: 0.85 * meet, lean: -0.06 * meet, walk: ts * 2 });
      figure(g, mx, 745, 0.66, C.PINK, { armRaise: 0.85 * meet, lean: 0.06 * meet, walk: ts * 2 + 1 });
      // 光：三个人合成一团暖光
      const lg = g.createRadialGradient(960, 640, 40, 960, 640, 660);
      lg.addColorStop(0, `rgba(255,236,190,${0.34 + 0.3 * meet})`); lg.addColorStop(1, 'rgba(255,236,190,0)');
      g.fillStyle = lg; g.fillRect(0, 0, W, H);
      for (let i = 0; i < 6; i++) star(g, 240 + i * 290, 200 + Math.sin(ts + i) * 22, 0.7, C.YEL);
      stamp(c, L, 7, 5);
      rod(c, [px, 700], [px - 110, 1080]); rod(c, [mx, 700], [mx + 110, 1080]);
      title(c, '无论如何 · 我爱你', clamp(lt * 1.6));
      frame(c);
    }
  };

  // ================= 《亲爱的篮球》=================
  // k1 童年（卷起的袜子当球）
  SCENES['k1_tongnian'] = {
    draw(c, lt, t) {
      screen(c, t); const ts = step(t);
      const L = P.scratch('k1'), g = L.getContext('2d'); g.reset();
      ground(g, 900);
      hoop(g, 1480, 780, 0.86);
      // 男孩（小）
      figure(g, 720, 775, 0.5, C.RED, { armRaise: 0.8, headTilt: Math.sin(ts) * 0.06 });
      // 卷起的袜子（当球用）：横放卷筒 + 袜口 + 彩条 + 螺旋纹
      g.save(); g.translate(700, 690); g.rotate(-0.18);
      piece(g, poly([[-58, -34], [58, -34], [58, 34], [-58, 34]]), C.PAPER, (k) => {
        k.beginPath(); k.moveTo(-40, -34); k.lineTo(-24, 34); k.lineWidth = 4; k.stroke();
        k.beginPath(); k.moveTo(-6, -34); k.lineTo(10, 34); k.stroke();
        k.beginPath(); k.moveTo(28, -34); k.lineTo(44, 34); k.stroke();
      }, 4);
      piece(g, poly([[-58, -34], [-30, -34], [-30, 34], [-58, 34]]), C.GRN, null, 3);      // 袜口罗纹
      piece(g, poly([[16, -34], [34, -34], [34, 34], [16, 34]]), C.RED, null, 2);          // 彩条
      g.restore();
      // 抛物线（从袜子出发，落向篮筐）
      g.save(); g.globalCompositeOperation = 'multiply'; g.strokeStyle = 'rgba(58,22,10,.4)';
      g.lineWidth = 3.2; g.setLineDash([12, 14]);
      g.beginPath(); g.moveTo(720, 672); g.quadraticCurveTo(1120, 320, 1440, 620); g.stroke(); g.setLineDash([]); g.restore();
      tree(g, 320, 900, 0.6, '#3d6b4a');
      stamp(c, L, 7, 5);
      rod(c, [720, 732], [600, 1080]);
      title(c, '六岁那年 · 我把袜子卷成了你', clamp(lt * 1.6));
      frame(c);
    }
  };
  // k2 苦练（反复投）
  SCENES['k2_kulian'] = {
    draw(c, lt, t) {
      screen(c, t); const ts = step(t);
      const L = P.scratch('k2'), g = L.getContext('2d'); g.reset();
      ground(g, 900);
      hoop(g, 1500, 760, 1.0);
      // 少年（三次残影：一次动作的三个定格）
      for (let i = 0; i < 3; i++) {
        g.save(); g.globalAlpha = 0.34 + i * 0.22;
        figure(g, 620 + i * 130, 745, 0.6 + i * 0.04, C.YEL, { armRaise: 0.5 + i * 0.2, walk: ts * 4 + i });
        g.restore();
      }
      // 球（随 ts 上下）
      const by = 640 - Math.abs(Math.sin(ts * 1.6)) * 300;
      basket(g, 900 + Math.sin(ts * 1.6) * 160, by, 0.9);
      // 汗（地面上的点）
      for (let i = 0; i < 8; i++) { g.fillStyle = 'rgba(58,22,10,.4)'; g.beginPath(); g.arc(560 + i * 90, 920 + h(i) * 30, 6 + h(i * 3) * 4, 0, 7); g.fill(); }
      stamp(c, L, 7, 5);
      rod(c, [750, 700], [640, 1080]);
      title(c, '每一次出手 · 我都赌上全部', clamp(lt * 1.6));
      frame(c);
    }
  };
  // k3 巅峰（聚光灯下）
  SCENES['k3_dianfeng'] = {
    draw(c, lt, t) {
      screen(c, t); const ts = step(t);
      const L = P.scratch('k3'), g = L.getContext('2d'); g.reset();
      ground(g, 900);
      // 聚光灯（两道锥形光）
      [[620, 300], [1300, 300]].forEach(([lx], i) => {
        g.save(); g.globalCompositeOperation = 'screen';
        const lg2 = g.createLinearGradient(lx, 120, lx + (i ? 180 : -180), 900);
        lg2.addColorStop(0, 'rgba(255,238,196,.55)'); lg2.addColorStop(1, 'rgba(255,238,196,0)');
        g.fillStyle = lg2; g.beginPath(); g.moveTo(lx, 120); g.lineTo(lx - 190, 900); g.lineTo(lx + 190, 900); g.closePath(); g.fill(); g.restore();
      });
      // 球员（腾空扣篮：抬手 + 上移）
      const air = Math.abs(Math.sin(ts * 1.4)) * 90;
      figure(g, 960, 745 - air, 0.78, C.YEL, { armRaise: 1.0, headTilt: 0.06 * Math.sin(ts) });
      basket(g, 1080, 560 - air, 1.0);
      hoop(g, 1420, 740, 0.9);
      // 观众（一排小剪影）
      for (let i = 0; i < 12; i++) { g.save(); g.globalAlpha = .5; figure(g, 90 + i * 168, 900, 0.2, i % 2 ? C.BLU : C.GRN, { armRaise: 0.7 + Math.sin(ts + i) * 0.2 }); g.restore(); }
      stamp(c, L, 7, 5);
      rod(c, [960, 700 - air], [900, 1080]);
      title(c, '你把最好的 · 都给了我', clamp(lt * 1.6));
      frame(c);
    }
  };
  // k4 告别（球衣、转身、书信）
  SCENES['k4_gaobie'] = {
    draw(c, lt, t) {
      screen(c, t); const ts = step(t);
      const L = P.scratch('k4'), g = L.getContext('2d'); g.reset();
      ground(g, 900);
      // 挂起的球衣（8 与 24）
      jersey(g, 700, 520, 0.9, '8');
      jersey(g, 1220, 520, 0.9, '24');
      // 球员背身走去（越走越小）
      const u = clamp(lt / 5.0), bx = lerp(960, 1560, u), bs = lerp(0.72, 0.4, u);
      figure(g, bx, 900 - 250 * bs, bs, C.YEL, { walk: ts * 3, armRaise: 0.2 });
      // 留在场上的球
      basket(g, 620, 860, 0.8);
      // 告别的光（斜射）
      g.save(); g.globalCompositeOperation = 'screen';
      const lg3 = g.createLinearGradient(200, 120, 1200, 900);
      lg3.addColorStop(0, 'rgba(255,236,190,.42)'); lg3.addColorStop(1, 'rgba(255,236,190,0)');
      g.fillStyle = lg3; g.fillRect(0, 0, W, H); g.restore();
      for (let i = 0; i < 7; i++) star(g, 220 + i * 250, 180 + Math.sin(ts + i) * 20, 0.66, C.YEL);
      stamp(c, L, 7, 5);
      rod(c, [bx, 900 - 250 * bs - 60], [bx - 100, 1080]);
      title(c, '亲爱的篮球 · 我该放手了', clamp(lt * 1.6));
      frame(c);
    }
  };

  // ================= 《熊的故事》Bear Story（2016 第88届）=================
  // 直立熊：在 figure 之上补圆耳与吻部
  const bearFig = (g, x, y, s, robe, opts = {}) => {
    figure(g, x, y, s, robe, opts);
    const u = (v) => v * s, hx = x, hy = y + u(-66);
    piece(g, ell(hx - u(42), hy - u(28), u(22), u(22)), C.BRN, (k) => K.dots(k, hx - u(58), hy - u(44), hx - u(26), hy - u(12), 8, 2), 3);
    piece(g, ell(hx + u(42), hy - u(28), u(22), u(22)), C.BRN, (k) => K.dots(k, hx + u(26), hy - u(44), hx + u(58), hy - u(12), 8, 2), 3);
    piece(g, ell(hx, hy + u(20), u(26), u(17)), C.AMB, (k) => K.dots(k, hx - u(22), hy + u(6), hx + u(22), hy + u(34), 10, 2.4), 3);
    g.fillStyle = C.EDGE; g.beginPath(); g.arc(hx + u(6), hy + u(13), u(5), 0, 7); g.fill();
  };
  // 机械立体镜（街角摊位：箱体＋观景窗＋摇柄＋顶棚）
  const diorama = (g, x, y, s) => {
    g.save(); g.translate(x, y); g.scale(s, s);
    piece(g, poly([[-230, 0], [230, 0], [230, -330], [-230, -330]]), C.BRN, (k) => K.lattice(k, -220, -320, 220, -10, 40, 22), 5);
    piece(g, poly([[-186, -280], [186, -280], [186, -100], [-186, -100]]), C.DKBLU, (k) => K.dots(k, -170, -270, 170, -110, 22, 3), 4);
    piece(g, ell(150, -50, 32, 32), C.YEL, null, 3);
    g.strokeStyle = C.EDGE; g.lineWidth = 9; g.beginPath(); g.moveTo(150, -50); g.lineTo(220, -8); g.stroke();
    piece(g, poly([[-240, -330], [240, -330], [196, -404], [-196, -404]]), C.RED, (k) => K.dots(k, -180, -394, 180, -340, 20, 3), 4);
    g.restore();
  };
  // 马戏团帐篷
  const tent = (g, x, y, s) => {
    g.save(); g.translate(x, y); g.scale(s, s);
    piece(g, poly([[-260, 0], [260, 0], [260, -170], [-260, -170]]), C.PAPER, (k) => K.lines(k, [[[-180, -10], [-180, -160]], [[-60, -10], [-60, -160]], [[60, -10], [60, -160]], [[180, -10], [180, -160]]], 5), 4);
    for (let i = 0; i < 6; i++) piece(g, poly([[-300 + i * 100, -170], [-200 + i * 100, -170], [-250 + i * 100, -410]]), i % 2 ? C.RED : C.YEL, null, 3);
    piece(g, poly([[-16, -410], [16, -410], [16, -510], [-16, -510]]), C.EDGE, null, 3);
    piece(g, poly([[16, -510], [92, -486], [16, -462]]), C.RED, null, 3);
    g.restore();
  };
  // 独轮车（马戏团熊）
  const unicycle = (g, x, y, s) => {
    g.save(); g.translate(x, y); g.scale(s, s);
    piece(g, ell(0, 0, 78, 78), C.EDGE, (k) => { k.ellipse(0, 0, 48, 48, 0, 0, 7); }, 4);
    piece(g, poly([[-9, -78], [9, -78], [9, -174], [-9, -174]]), C.BRN, null, 3);
    piece(g, poly([[-48, -174], [48, -174], [48, -192], [-48, -192]]), C.BRN, null, 3);
    g.restore();
  };

  // x1 街角摆摊
  SCENES['x1_jiaoluo'] = {
    draw(c, lt, t) {
      screen(c, t); const ts = step(t);
      const L = P.scratch('x1'), g = L.getContext('2d'); g.reset();
      ground(g, 900);
      // 街景：一排房子
      house(g, 380, 900, 0.6, C.BRN); house(g, 880, 900, 0.5, C.BRN); house(g, 1620, 900, 0.58, C.BRN);
      tree(g, 660, 900, 0.5, '#3d6b4a');
      // 摊位 + 熊
      diorama(g, 1180, 900, 0.92);
      bearFig(g, 900, 745, 0.62, C.BRN, { armRaise: 0.55, headTilt: 0.04 * Math.sin(ts) });
      // 招牌（挂在箱顶）
      g.save(); g.fillStyle = 'rgba(58,22,10,.86)'; g.font = '46px "LXGWWenKai-500"'; g.textAlign = 'center';
      g.fillText('一枚硬币 · 看一段往事', 1180, 470); g.restore();
      stamp(c, L, 7, 5);
      rod(c, [900, 700], [780, 1080]); rod(c, [1180, 800], [1300, 1080]);
      title(c, '街角有个盒子 · 投币就能看见故事', clamp(lt * 1.6));
      frame(c);
    }
  };
  // x2 盒中故事（观景窗内：一家被拆散）
  SCENES['x2_hezi'] = {
    draw(c, lt, t) {
      screen(c, t); const ts = step(t);
      const L = P.scratch('x2'), g = L.getContext('2d'); g.reset();
      ground(g, 900);
      // 大观景窗（圆窗：下移让开顶部标题）
      piece(g, ell(960, 580, 470, 350), C.DKBLU, (k) => K.dots(k, 520, 250, 1400, 900, 30, 4), 6);
      // 窗内小景：熊爸爸 + 小熊 + 一辆马戏团马车带走一只
      g.save(); g.beginPath(); g.arc(960, 580, 460, 0, 7); g.clip();
      ground(g, 830, '#4a3a1a');
      bearFig(g, 780, 705, 0.5, C.BRN, { armRaise: 0.7, headTilt: -0.06 * Math.sin(ts) });
      bearFig(g, 1000, 720, 0.44, C.AMB, { armRaise: 0.5 });
      // 马车（带走另一只）
      const cx2 = 1140 + clamp(lt / 4.6) * 120;
      piece(g, poly([[cx2 - 90, 780], [cx2 + 90, 780], [cx2 + 90, 660], [cx2 - 90, 660]]), C.RED, (k) => K.lattice(k, cx2 - 80, 670, cx2 + 80, 770, 26, 14), 4);
      piece(g, ell(cx2 - 80, 800, 34, 34), C.EDGE, (k) => { k.ellipse(cx2 - 80, 800, 20, 20, 0, 0, 7); }, 3);
      piece(g, ell(cx2 + 80, 800, 34, 34), C.EDGE, (k) => { k.ellipse(cx2 + 80, 800, 20, 20, 0, 0, 7); }, 3);
      beast(g, cx2 + 170, 790, 0.5, C.BRN, ts * 1.4);   // 拉车的马
      g.restore();
      // 窗框（铜圈）
      g.save(); g.strokeStyle = C.YEL; g.lineWidth = 14; g.beginPath(); g.arc(960, 580, 470, 0, 7); g.stroke(); g.restore();
      stamp(c, L, 7, 5);
      title(c, '盒子里的故事 · 讲的是他自己', clamp(lt * 1.6));
      frame(c);
    }
  };
  // x3 马戏团（熊在台上）
  SCENES['x3_maxituan'] = {
    draw(c, lt, t) {
      screen(c, t); const ts = step(t);
      const L = P.scratch('x3'), g = L.getContext('2d'); g.reset();
      ground(g, 900);
      tent(g, 1520, 900, 0.86);
      // 熊骑独轮车（上下颠簸）
      const bob = Math.sin(ts * 3) * 14;
      unicycle(g, 880, 860, 0.9);
      // 熊必须站在轮顶（脚底 ≈ 轮上沿 790），否则读成"站在地上的底座上"
      bearFig(g, 880, 640 + bob, 0.6, C.BRN, { armRaise: 0.9, headTilt: 0.05 * Math.sin(ts) });
      // 观众（一排小剪影）
      for (let i = 0; i < 10; i++) { g.save(); g.globalAlpha = .5; figure(g, 120 + i * 150, 900, 0.2, i % 2 ? C.BLU : C.GRN, { armRaise: 0.6 + Math.sin(ts + i) * 0.2 }); g.restore(); }
      // 聚光
      g.save(); g.globalCompositeOperation = 'screen';
      const lg2 = g.createLinearGradient(880, 100, 880, 900);
      lg2.addColorStop(0, 'rgba(255,238,196,.45)'); lg2.addColorStop(1, 'rgba(255,238,196,0)');
      g.fillStyle = lg2; g.beginPath(); g.moveTo(880, 100); g.lineTo(700, 900); g.lineTo(1060, 900); g.closePath(); g.fill(); g.restore();
      stamp(c, L, 7, 5);
      rod(c, [880, 596 + bob], [780, 1080]);
      title(c, '他在台上逗人笑 · 台下没有家人', clamp(lt * 1.6));
      frame(c);
    }
  };
  // x4 回家（微缩之家）
  SCENES['x4_huijia'] = {
    draw(c, lt, t) {
      screen(c, t); const ts = step(t);
      const L = P.scratch('x4'), g = L.getContext('2d'); g.reset();
      ground(g, 900);
      // 夜空
      for (let i = 0; i < 10; i++) star(g, 160 + i * 180, 150 + Math.sin(ts + i * 1.3) * 22, 0.6 + (i % 3) * 0.16, C.YEL);
      piece(g, ell(1660, 200, 74, 74), C.YEL, (k) => K.dots(k, -62, -62, 62, 62, 16, 2.6), 4);
      // 小屋 + 窗里的家（熊与两只小熊剪影）
      house(g, 1140, 900, 0.9, C.BRN);
      piece(g, poly([[1030, 700], [1250, 700], [1250, 560], [1030, 560]]), C.YEL, (k) => K.lattice(k, 1040, 570, 1240, 690, 24, 14), 4);
      g.save(); g.globalAlpha = .78;
      bearFig(g, 1110, 690, 0.2, C.EDGE, { armRaise: 0.4 });
      bearFig(g, 1170, 694, 0.15, C.EDGE, { armRaise: 0.3 });
      g.restore();
      // 熊站在屋外，抬头看窗
      bearFig(g, 620, 745, 0.62, C.BRN, { armRaise: 0.3, headTilt: -0.12 });
      // 暖光（家的光）
      const wg = g.createRadialGradient(1140, 630, 40, 1140, 630, 620);
      wg.addColorStop(0, 'rgba(255,232,180,.45)'); wg.addColorStop(1, 'rgba(255,232,180,0)');
      g.fillStyle = wg; g.fillRect(0, 0, W, H);
      stamp(c, L, 7, 5);
      rod(c, [620, 700], [500, 1080]); rod(c, [1140, 840], [1240, 1080]);
      title(c, '他讲了一辈子故事 · 只为回家', clamp(lt * 1.6));
      frame(c);
    }
  };
})();
