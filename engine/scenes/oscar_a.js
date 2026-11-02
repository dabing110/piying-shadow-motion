// 奥斯卡最佳动画短片 · 皮影版（第一批）
//   《鹬》Piper（2017，第89届）：勇气·独立·成长 —— 小矶鹬被浪打翻后，在水下睁开眼，发现贝壳世界
//   《回忆积木小屋》The House of Small Cubes（2009，第81届）：记忆·陪伴·珍惜 —— 老人潜入被海水淹没的层层老屋
// 共用皮件库 scenes/piying_base2.js（window.PY），eras 里 SCENE_LIBS 必须先加载它。
(() => {
  const { W, H, C, K, P, step, poly, ell, piece, rivet, rod, stamp, screen, frame, ground, figure, beast, bird, wave, tree, house, cloud, title, clamp, lerp, rng } = PY;

  // ================= 《鹬》· 四幕 =================
  // q1 沙滩巢边：小鹬不敢靠近海浪，浪线在远处来回
  SCENES['q1_qian'] = (() => ({
    draw(c, lt, t) {
      screen(c, t); const ts = step(t);
      const L = P.scratch('q1'), g = L.getContext('2d'); g.reset();
      ground(g, 860, '#c8a86a');
      // 海（远处浪线来回）
      piece(g, poly([[0, 700], [W, 700], [W, 862], [0, 862]]), '#3a6a9a', (k) => K.lines(k, [[[0, 740], [W, 740]], [[0, 790], [W, 790]]], 4));
      wave(g, 1400, 720, 0.5, t * 1.1, '#2c5a8a');
      // 巢（草窝）
      piece(g, ell(560, 830, 120, 46), C.BRN, (k) => K.dots(k, 450, 790, 670, 870, 16, 2.6), 3);
      // 小鹬：在巢边探头，犹豫
      const peek = Math.sin(ts * 3) * 0.14;
      bird(g, 560, 800, 0.62, C.AMB, ts * 3, { legPhase: ts * 2 });
      // 远处几只成鸟（飞过）：翅扇动
      for (let i = 0; i < 3; i++) bird(g, 1180 + i * 220, 420 + Math.sin(t * 2 + i) * 26, 0.4, C.WHT, t * 9 + i, {});
      stamp(c, L, 7, 5);
      rod(c, [560, 790], [420, 1080]);
      title(c, '鹬 · 不敢靠近的浪', clamp(lt * 1.6));
      frame(c);
    }
  }))();

  // q2 浪打翻：大浪扑来，小鹬被掀翻（幽默的一摔）
  SCENES['q2_lang'] = (() => ({
    draw(c, lt, t) {
      screen(c, t); const ts = step(t);
      const L = P.scratch('q2'), g = L.getContext('2d'); g.reset();
      ground(g, 880, '#c8a86a');
      const hit = clamp((lt - 1.2) / 1.1);        // 浪扑到的进度
      wave(g, 620 + (1 - hit) * 900, 700, 1.25, t * 1.6);
      // 小鹬被掀翻：绕身位翻转
      const tip = hit * 1.5;
      g.save(); g.translate(760, 830); g.rotate(-tip); g.translate(-760, -830);
      bird(g, 760, 830, 0.78, C.AMB, ts * 12 + hit * 6, { legPhase: ts * 8 });
      g.restore();
      // 溅起的水花（白色皮条）
      for (let i = 0; i < 6; i++) {
        const a = -0.9 + i * 0.32, d = 60 + (i % 3) * 40 + Math.sin(t * 8 + i) * 18;
        piece(g, ell(760 + Math.cos(a) * d, 810 + Math.sin(a) * d, 14, 10, a), C.PAPER, null, 2);
      }
      stamp(c, L, 8, 6);
      rod(c, [760, 800], [640, 1080]);
      title(c, '被浪打翻', clamp(lt * 1.4));
      frame(c);
    }
  }))();

  // q3 水下：小鹬睁开眼，看见贝壳世界（本片最亮的一幕）
  SCENES['q3_shuixia'] = (() => ({
    draw(c, lt, t) {
      screen(c, t); const ts = step(t);
      const L = P.scratch('q3'), g = L.getContext('2d'); g.reset();
      // 水下：整片偏蓝，气泡上升
      c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = 'rgba(50,100,155,.55)'; c.fillRect(0, 0, W, H); c.restore();
      piece(g, poly([[0, 940], [W, 940], [W, H], [0, H]]), '#b9a06a', (k) => K.dots(k, 0, 950, W, 1070, 26, 3), 3);
      // 贝壳（大小不一，随浪轻摆）
      for (let i = 0; i < 9; i++) {
        const bx = 200 + (i * 190) % 1600, by = 880 + Math.sin(i * 2.3) * 60, s = 0.5 + (i % 3) * 0.28;
        const sw2 = Math.sin(t * 1.6 + i) * 0.1;
        g.save(); g.translate(bx, by); g.rotate(sw2); g.scale(s, s);
        const sh = new Path2D();
        for (let k2 = 0; k2 < 7; k2++) { const a = k2 / 7 * Math.PI; sh.moveTo(Math.cos(a) * -60, 0); sh.arc(0, 0, 62, Math.PI + a * 0.9, Math.PI * 2); }
        piece(g, sh, i % 2 ? C.PINK : C.YEL, (k) => K.lines(k, [[[-50, -6], [-8, -34]], [[-40, -10], [-4, -30]], [[50, -6], [8, -34]]], 4), 3);
        g.restore();
      }
      // 气泡
      for (let i = 0; i < 14; i++) {
        const bx = ((i * 137) % W), by = 900 - ((t * 90 + i * 80) % 800);
        piece(g, ell(bx, by, 9 + (i % 3) * 5, 9 + (i % 3) * 5), C.PAPER, null, 2);
      }
      // 小鹬：睁眼（眼点变大）
      bird(g, 960, 700, 0.85, C.AMB, ts * 6, { legPhase: ts * 4 });
      stamp(c, L, 7, 5);
      rod(c, [900, 790], [1010, 1080]);     // 杆子从身下外侧走，别穿过鸟嘴/头
      title(c, '睁开眼 · 水下有另一个世界', clamp(lt * 1.5));
      frame(c);
    }
  }))();

  // q4 夕阳：小鹬勇敢地在浪间觅食（成长）
  SCENES['q4_xia'] = (() => ({
    draw(c, lt, t) {
      screen(c, t); const ts = step(t);
      const L = P.scratch('q4'), g = L.getContext('2d'); g.reset();
      ground(g, 880, '#c8a86a');
      // 夕阳（大红圆）
      piece(g, ell(1500, 380, 130, 130), C.RED, (k) => K.dots(k, 1380, 270, 1620, 490, 22, 3), 4);
      for (let i = 0; i < 3; i++) wave(g, 400 + i * 520, 760, 0.72, t * 1.2 + i * 0.8, i === 1 ? C.DKBLU : C.BLU);
      // 小鹬：在浪间跳，啄贝壳
      const hop = Math.abs(Math.sin(ts * 5)) * 26;
      bird(g, 700, 840 - hop, 0.8, C.AMB, ts * 5, { legPhase: ts * 5 });
      // 贝壳在它面前
      piece(g, ell(860, 856, 40, 30), C.YEL, (k) => K.lines(k, [[[-30, -4], [-4, -20]], [[30, -4], [4, -20]]], 3), 3);
      stamp(c, L, 7, 5);
      rod(c, [700, 800], [560, 1080]);
      title(c, '再试一次 · 就不那么怕了', clamp(lt * 1.5));
      frame(c);
    }
  }))();

  // ================= 《回忆积木小屋》· 四幕 =================
  // m1 海水上涨：老人一层层加盖房子
  SCENES['m1_zhangshui'] = (() => ({
    draw(c, lt, t) {
      screen(c, t); const ts = step(t);
      const L = P.scratch('m1'), g = L.getContext('2d'); g.reset();
      // 层层小屋（自下而上叠，越上越小＝记忆的层）
      for (let i = 0; i < 5; i++) {
        const y = 940 - i * 150, s = 0.9 - i * 0.1;
        house(g, 700 + (i % 2) * 60, y, s, i % 2 ? C.BRN : '#6a3a18');
      }
      // 海水（上涨：水面随时间上升）
      const wl = lerp(1010, 780, clamp(lt / 4.2));
      piece(g, poly([[0, wl], [W, wl], [W, H], [0, H]]), '#2c5a8a', (k) => K.lines(k, [[[0, wl + 30], [W, wl + 30]], [[0, wl + 80], [W, wl + 80]]], 4));
      wave(g, 300, wl + 40, 0.5, t * 1.1, '#2c5a8a');
      wave(g, 1500, wl + 60, 0.5, t * 1.1 + 1, '#2c5a8a');
      // 老人（顶层窗口）
      figure(g, 760, 480, 0.5, C.BLU, { headTilt: 0.05 * Math.sin(ts * 2) });
      stamp(c, L, 7, 5);
      rod(c, [760, 440], [620, 1080]);
      title(c, '海在涨 · 房子一层层往上盖', clamp(lt * 1.5));
      frame(c);
    }
  }))();

  // m2 烟斗掉落：老人为了烟斗潜入水中
  SCENES['m2_yandou'] = (() => ({
    draw(c, lt, t) {
      screen(c, t); const ts = step(t);
      const L = P.scratch('m2'), g = L.getContext('2d'); g.reset();
      for (let i = 0; i < 3; i++) house(g, 700 + (i % 2) * 60, 940 - i * 150, 0.9 - i * 0.1, i % 2 ? C.BRN : '#6a3a18');
      const wl = 800;
      piece(g, poly([[0, wl], [W, wl], [W, H], [0, H]]), '#2c5a8a', (k) => K.lines(k, [[[0, wl + 40], [W, wl + 40]]], 4));
      // 烟斗：从顶层往下掉（旋转下落）
      const dp = clamp(lt / 4.0), dy = lerp(420, 900, dp);
      g.save(); g.translate(880, dy); g.rotate(dp * 5);
      piece(g, poly([[-30, 0], [30, 0], [22, 54], [-22, 54]]), C.BRN, null, 3);
      piece(g, poly([[26, -14], [96, -34], [92, -8], [24, 4]]), C.EDGE, null, 3);
      g.restore();
      // 老人探身看
      figure(g, 760, 520, 0.5, C.BLU, { lean: 0.18, headTilt: 0.2 });
      stamp(c, L, 7, 5);
      rod(c, [880, dy], [980, 1080]);
      title(c, '烟斗掉进了水里', clamp(lt * 1.5));
      frame(c);
    }
  }))();

  // m3 逐层下潜：每下一层，都是一段回忆（妻子、女儿、一家三口）
  SCENES['m3_qian'] = (() => ({
    draw(c, lt, t) {
      screen(c, t); const ts = step(t);
      const L = P.scratch('m3'), g = L.getContext('2d'); g.reset();
      // 水下的层：三层屋，每层一个回忆场景
      c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = 'rgba(60,110,160,.3)'; c.fillRect(0, 0, W, H); c.restore();
      const lv = Math.floor(clamp(lt / 4.6) * 3);          // 当前第几层
      for (let i = 0; i < 4; i++) {
        const y = 300 + i * 220, s = 0.55;
        const on = i <= lv;
        g.save(); g.globalAlpha = on ? 1 : 0.35;
        house(g, 640, y, s, i % 2 ? C.BRN : '#6a3a18');
        // 每层的回忆人物
        if (i === 1) { figure(g, 500, y + 40, 0.46, C.PINK, {}); figure(g, 780, y + 40, 0.46, C.BLU, {}); }
        if (i === 2) { figure(g, 640, y + 30, 0.44, C.YEL, {}); figure(g, 480, y + 50, 0.38, C.PINK, {}); figure(g, 800, y + 50, 0.38, C.BLU, {}); }
        if (i === 3) { figure(g, 640, y + 30, 0.44, C.BLU, {}); }
        g.restore();
      }
      // 气泡
      for (let i = 0; i < 10; i++) piece(g, ell(((i * 191) % W), 1000 - ((t * 80 + i * 90) % 900), 8 + (i % 3) * 4, 8 + (i % 3) * 4), C.PAPER, null, 2);
      // 老人（潜行，缓慢）
      figure(g, 1300, 400 + Math.sin(t * 1.2) * 40, 0.46, C.BLU, { lean: 0.3, headTilt: 0.1 });
      stamp(c, L, 7, 5);
      rod(c, [1300, 380], [1420, 1080]);
      title(c, '每下一层 · 都是一段旧日子', clamp(lt * 1.5));
      frame(c);
    }
  }))();

  // m4 最底层：最初的那一层，老伴递来的烟斗（收束）
  SCENES['m4_diceng'] = (() => ({
    draw(c, lt, t) {
      screen(c, t); const ts = step(t);
      const L = P.scratch('m4'), g = L.getContext('2d'); g.reset();
      c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = 'rgba(60,110,160,.22)'; c.fillRect(0, 0, W, H); c.restore();
      // 最底的小屋（最初的家）
      house(g, 960, 780, 0.8, C.BRN);
      // 老伴（递烟斗）
      figure(g, 760, 740, 0.66, C.PINK, { armRaise: 0.6, headTilt: 0.06 * Math.sin(ts * 2) });
      figure(g, 1160, 740, 0.66, C.BLU, { armRaise: 0.5, headTilt: -0.05 * Math.sin(ts * 2) });
      // 烟斗（递在中间）
      piece(g, poly([[920, 690], [1000, 690], [994, 730], [926, 730]]), C.BRN, null, 3);
      piece(g, poly([[1000, 676], [1064, 656], [1060, 682], [996, 696]]), C.EDGE, null, 3);
      // 光晕（最暖的一层）
      c.save(); c.globalCompositeOperation = 'screen';
      const hg = c.createRadialGradient(960, 700, 20, 960, 700, 420);
      hg.addColorStop(0, 'rgba(255,230,170,.5)'); hg.addColorStop(1, 'rgba(255,230,170,0)');
      c.fillStyle = hg; c.fillRect(0, 0, W, H); c.restore();
      stamp(c, L, 6, 4);
      rod(c, [780, 700], [640, 1080]); rod(c, [1140, 700], [1280, 1080]);
      title(c, '回忆很重 · 要潜到最底才看得清', clamp(lt * 1.6));
      frame(c);
    }
  }))();
})();
