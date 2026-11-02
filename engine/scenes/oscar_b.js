// 奥斯卡最佳动画短片 · 皮影版（第二批）
//   《包宝宝》Bao（2019 第91届）：母爱·放手·成长
//   《发之爱》Hair Love（2020 第92届）：父爱·家庭·责任
//   《美味盛宴》Feast（2015 第87届）：爱·分享·陪伴
//   《失物招领》The Lost Thing（2011 第83届）：自我认同·纯真·合群
// 共用皮件库 scenes/piying_base2.js（window.PY）
(() => {
  const { W, H, C, K, P, step, poly, ell, piece, rivet, rod, stamp, screen, frame, ground, figure, beast, bird, wave, tree, house, cloud, title, clamp, lerp, rng } = PY;
  const bowl = (g, x, y, s, col) => { g.save(); g.translate(x, y); g.scale(s, s); piece(g, poly([[-70, 0], [70, 0], [52, 56], [-52, 56]]), col, (k) => K.dots(k, -60, 6, 60, 50, 14, 2.6), 3); g.restore(); };
  const bao = (g, x, y, s, col = C.PAPER, face = 1) => {   // 包子：圆身＋顶褶＋（可选）小脸
    g.save(); g.translate(x, y); g.scale(s, s);
    piece(g, ell(0, 0, 66, 58), col, (k) => K.dots(k, -56, -48, 56, 48, 16, 2.6));
    for (let i = 0; i < 5; i++) piece(g, ell(-40 + i * 20, -46, 9, 13, i * 0.5), C.PAPER, null, 2);
    if (face) {
      g.fillStyle = C.EDGE; g.beginPath(); g.arc(-20, -4, 4.6, 0, 7); g.arc(20, -4, 4.6, 0, 7); g.fill();
      g.strokeStyle = C.EDGE; g.lineWidth = 2.6; g.beginPath(); g.arc(0, 14, 13, 0.2, Math.PI - 0.2); g.stroke();
    }
    g.restore();
  };
  const teapot = (g, x, y, s, col = C.BLU) => {            // 巨型茶壶（失物招领里的"东西"）
    g.save(); g.translate(x, y); g.scale(s, s);
    piece(g, ell(0, 0, 200, 160), col, (k) => K.clouds(k, -170, -130, 170, 130, 40));
    piece(g, poly([[-210, -30], [-300, -90], [-286, -20], [-206, 20]]), col, null, 4);   // 壶嘴
    piece(g, poly([[170, -20], [280, -120], [230, -10], [180, 40]]), col, null, 4);       // 把手
    piece(g, poly([[-70, -150], [70, -150], [56, -196], [-56, -196]]), col, (k) => K.dots(k, -50, -190, 50, -156, 14, 2.6), 3);
    piece(g, ell(0, -206, 26, 12), C.YEL, null, 3);
    g.fillStyle = C.EDGE; g.beginPath(); g.arc(-60, -20, 12, 0, 7); g.arc(60, -20, 12, 0, 7); g.fill();
    g.restore();
  };
  const bottlecap = (g, x, y, s, col) => { g.save(); g.translate(x, y); g.scale(s, s); piece(g, ell(0, 0, 26, 12), col, (k) => K.dots(k, -20, -8, 20, 8, 10, 2), 2); g.restore(); };

  // =====《包宝宝》=====
  SCENES['b1_zhenglong'] = {
    draw(c, lt, t) {
      screen(c, t); const ts = step(t);
      const L = P.scratch('b1'), g = L.getContext('2d'); g.reset();
      ground(g, 900);
      // 蒸笼（叠三层，冒白气）
      for (let i = 0; i < 3; i++) {
        piece(g, poly([[560 - i * 10, 780 - i * 90], [1360 + i * 10, 780 - i * 90], [1350 + i * 10, 690 - i * 90], [570 - i * 10, 690 - i * 90]]), C.BRN, (k) => K.lattice(k, 580, 700 - i * 90, 1340, 770 - i * 90, 30, 16), 4);
      }
      for (let i = 0; i < 4; i++) {   // 白气（纸白线）
        const x = 800 + i * 130, ph = t * 1.3 + i;
        g.save(); g.strokeStyle = 'rgba(250,248,240,.85)'; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath();
        for (let k2 = 0; k2 <= 12; k2++) { const u = k2 / 12; const xx = x + Math.sin(ph + u * 3) * 22 * u, yy = 660 - u * 210; k2 ? g.lineTo(xx, yy) : g.moveTo(xx, yy); }
        g.stroke(); g.restore();
      }
      // 母亲（包包子）
      figure(g, 1500, 800, 0.72, C.PINK, { armRaise: 0.4 + 0.1 * Math.sin(ts * 6), headTilt: 0.04 * Math.sin(ts * 3) });
      bowl(g, 380, 860, 1.0, C.BRN);
      bao(g, 380, 830, 0.5, C.PAPER, 0);
      stamp(c, L, 7, 5);
      rod(c, [1500, 740], [1620, 1080]);
      title(c, '包宝宝 · 一个包子活了过来', clamp(lt * 1.5));
      frame(c);
    }
  };
  SCENES['b2_baobao'] = {
    draw(c, lt, t) {
      screen(c, t); const ts = step(t);
      const L = P.scratch('b2'), g = L.getContext('2d'); g.reset();
      ground(g, 900);
      piece(g, poly([[300, 900], [1620, 900], [1620, 860], [300, 860]]), C.BRN, (k) => K.dots(k, 320, 868, 1600, 892, 30, 3), 3);
      // 母亲
      figure(g, 620, 800, 0.8, C.PINK, { armRaise: 0.55, headTilt: 0.05 * Math.sin(ts * 3) });
      // 包宝宝（会跳）
      const hop = Math.abs(Math.sin(ts * 4)) * 24;
      bao(g, 1180, 800 - hop, 1.1, C.PAPER, 1);
      // 母亲伸出的手（喂）
      g.save(); g.strokeStyle = C.EDGE; g.lineWidth = 6;
      g.beginPath(); g.moveTo(760, 720); g.lineTo(980, 760 - hop * 0.4); g.stroke(); g.restore();
      stamp(c, L, 7, 5);
      rod(c, [620, 730], [480, 1080]); rod(c, [1180, 760], [1300, 1080]);
      title(c, '捧在手里怕化了', clamp(lt * 1.5));
      frame(c);
    }
  };
  SCENES['b3_zhangda'] = {
    draw(c, lt, t) {
      screen(c, t); const ts = step(t);
      const L = P.scratch('b3'), g = L.getContext('2d'); g.reset();
      ground(g, 900);
      // 门（宝宝要出门）
      piece(g, poly([[1240, 900], [1620, 900], [1620, 400], [1240, 400]]), C.BRN, (k) => K.lattice(k, 1256, 420, 1604, 880, 36, 20), 4);
      // 母亲（张开双臂拦在门前）
      figure(g, 1180, 800, 0.9, C.PINK, { armRaise: 0.9, lean: -0.1, headTilt: -0.08 });
      // 长大的宝宝（人形了）
      figure(g, 760, 800, 0.62, C.YEL, { armRaise: 0.5, lean: 0.12, headTilt: 0.06 });
      stamp(c, L, 8, 5);
      rod(c, [1180, 720], [1040, 1080]); rod(c, [760, 750], [640, 1080]);
      title(c, '爱得太紧 · 就成了握住不放', clamp(lt * 1.5));
      frame(c);
    }
  };
  SCENES['b4_hejie'] = {
    draw(c, lt, t) {
      screen(c, t); const ts = step(t);
      const L = P.scratch('b4'), g = L.getContext('2d'); g.reset();
      ground(g, 900);
      // 留白暗写：不画"吞下"，只用一团暗影＋一圈光晕暗示那一瞬的失控，随后是团圆
      const dark = clamp((lt - 1.0) / 1.2) * (1 - clamp((lt - 2.6) / 1.2));
      if (dark > 0.01) {
        c.save(); c.globalAlpha = dark * 0.5; c.fillStyle = 'rgba(26,26,28,.9)';
        c.beginPath(); c.ellipse(960, 720, 300, 220, 0, 0, 7); c.fill(); c.restore();
      }
      // 团圆：一家人围坐
      piece(g, poly([[420, 900], [1500, 900], [1500, 830], [420, 830]]), C.BRN, (k) => K.dots(k, 440, 842, 1480, 892, 30, 3), 3);
      figure(g, 700, 800, 0.56, C.PINK, { headTilt: 0.05 * Math.sin(ts * 2.4) });
      figure(g, 960, 800, 0.56, C.YEL, { headTilt: -0.05 * Math.sin(ts * 2.4) });
      figure(g, 1220, 800, 0.56, C.BLU, { headTilt: 0.05 * Math.sin(ts * 2 + 1) });
      for (let i = 0; i < 3; i++) bowl(g, 720 + i * 260, 840, 0.6, C.PAPER);
      // 暖光晕（和解的温度）
      c.save(); c.globalCompositeOperation = 'screen';
      const hg = c.createRadialGradient(960, 700, 30, 960, 700, 520);
      hg.addColorStop(0, 'rgba(255,226,160,.45)'); hg.addColorStop(1, 'rgba(255,226,160,0)');
      c.fillStyle = hg; c.fillRect(0, 0, W, H); c.restore();
      stamp(c, L, 6, 4);
      rod(c, [960, 740], [880, 1080]);
      title(c, '松手也是一种爱', clamp(lt * 1.6));
      frame(c);
    }
  };

  // =====《发之爱》=====
  SCENES['h1_zaochen'] = {
    draw(c, lt, t) {
      screen(c, t); const ts = step(t);
      const L = P.scratch('h1'), g = L.getContext('2d'); g.reset();
      ground(g, 900);
      // 镜子/窗
      piece(g, poly([[1200, 880], [1620, 880], [1620, 380], [1200, 380]]), C.BRN, (k) => K.lattice(k, 1216, 400, 1604, 860, 34, 18), 4);
      // 女儿（爆炸头：一圈蓬松弧）
      figure(g, 760, 800, 0.62, C.YEL, { headTilt: 0.06 * Math.sin(ts * 2.6) });
      for (let i = 0; i < 14; i++) {
        const a = i / 14 * Math.PI * 2;
        piece(g, ell(760 + Math.cos(a) * 62, 800 - 300 + Math.sin(a) * 50, 26, 20, a), C.EDGE, null, 2);
      }
      // 父亲（在后，手足无措）
      figure(g, 1300, 800, 0.7, C.BLU, { armRaise: 0.3, headTilt: -0.1 });
      stamp(c, L, 7, 5);
      rod(c, [760, 740], [620, 1080]); rod(c, [1300, 740], [1440, 1080]);
      title(c, '发之爱 · 妈妈不在的早晨', clamp(lt * 1.5));
      frame(c);
    }
  };
  SCENES['h2_shibai'] = {
    draw(c, lt, t) {
      screen(c, t); const ts = step(t);
      const L = P.scratch('h2'), g = L.getContext('2d'); g.reset();
      ground(g, 900);
      piece(g, poly([[300, 900], [900, 900], [900, 820], [300, 820]]), C.BRN, (k) => K.dots(k, 320, 832, 880, 892, 28, 3), 3);
      figure(g, 1000, 800, 0.68, C.YEL, { headTilt: -0.12 });
      for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; piece(g, ell(1000 + Math.cos(a) * 58, 800 - 320 + Math.sin(a) * 46, 24, 18, a), C.EDGE, null, 2); }
      // 父亲：梳子掉了（一次次失败）
      figure(g, 1500, 800, 0.78, C.BLU, { armRaise: 0.75, lean: 0.14, headTilt: 0.16 });
      const drop = clamp((lt - 1.0) / 1.6);
      g.save(); g.translate(1240, 700 + drop * 180); g.rotate(drop * 7);
      piece(g, poly([[-34, 0], [34, 0], [34, 20], [-34, 20]]), C.BRN, null, 3);
      for (let i = 0; i < 5; i++) piece(g, poly([[-34 + i * 14, 20], [-28 + i * 14, 20], [-28 + i * 14, 56], [-34 + i * 14, 56]]), C.BRN, null, 2);
      g.restore();
      stamp(c, L, 7, 5);
      rod(c, [1000, 740], [860, 1080]); rod(c, [1500, 720], [1640, 1080]);
      title(c, '第一次 · 总是笨拙的', clamp(lt * 1.5));
      frame(c);
    }
  };
  SCENES['h3_zailai'] = {
    draw(c, lt, t) {
      screen(c, t); const ts = step(t);
      const L = P.scratch('h3'), g = L.getContext('2d'); g.reset();
      ground(g, 900);
      figure(g, 960, 800, 0.74, C.YEL, { headTilt: 0.03 * Math.sin(ts * 3) });
      // 头发：一次次重来（从乱到顺，随时间收紧）
      const tame = clamp(lt / 4.2);
      for (let i = 0; i < 14; i++) {
        const a = i / 14 * Math.PI * 2;
        const r = lerp(70, 44, tame);
        piece(g, ell(960 + Math.cos(a) * r, 800 - 320 + Math.sin(a) * r * 0.8, lerp(28, 18, tame), lerp(22, 15, tame), a), C.EDGE, null, 2);
      }
      // 父亲：认真梳
      figure(g, 1460, 800, 0.82, C.BLU, { armRaise: 0.85, lean: 0.06, headTilt: -0.08 * Math.sin(ts * 4) });
      g.save(); g.translate(1240, 690 + Math.sin(ts * 5) * 18); g.rotate(-0.3);
      piece(g, poly([[-34, 0], [34, 0], [34, 20], [-34, 20]]), C.BRN, null, 3);
      for (let i = 0; i < 5; i++) piece(g, poly([[-34 + i * 14, 20], [-28 + i * 14, 20], [-28 + i * 14, 56], [-34 + i * 14, 56]]), C.BRN, null, 2);
      g.restore();
      stamp(c, L, 7, 5);
      rod(c, [960, 740], [820, 1080]); rod(c, [1460, 720], [1600, 1080]);
      title(c, '再来一次 · 慢慢就顺了', clamp(lt * 1.5));
      frame(c);
    }
  };
  SCENES['h4_chenggong'] = {
    draw(c, lt, t) {
      screen(c, t); const ts = step(t);
      const L = P.scratch('h4'), g = L.getContext('2d'); g.reset();
      ground(g, 900);
      // 医院：母亲在床上，父女来看她
      piece(g, poly([[1100, 900], [1700, 900], [1700, 560], [1100, 560]]), C.PAPER, (k) => K.lattice(k, 1116, 580, 1684, 880, 34, 18), 4);
      figure(g, 1400, 780, 0.6, C.PINK, { headTilt: 0.05 * Math.sin(ts * 2) });
      // 女儿（头发扎好了：两个发髻）
      figure(g, 800, 800, 0.7, C.YEL, { headTilt: 0.04 * Math.sin(ts * 2.4) });
      piece(g, ell(760, 800 - 330, 30, 30), C.EDGE, null, 3);
      piece(g, ell(850, 800 - 330, 30, 30), C.EDGE, null, 3);
      figure(g, 480, 800, 0.72, C.BLU, { armRaise: 0.5, headTilt: -0.04 * Math.sin(ts * 2) });
      // 暖光
      c.save(); c.globalCompositeOperation = 'screen';
      const hg = c.createRadialGradient(1100, 700, 30, 1100, 700, 560);
      hg.addColorStop(0, 'rgba(255,230,170,.42)'); hg.addColorStop(1, 'rgba(255,230,170,0)');
      c.fillStyle = hg; c.fillRect(0, 0, W, H); c.restore();
      stamp(c, L, 6, 4);
      rod(c, [800, 740], [660, 1080]); rod(c, [480, 740], [360, 1080]);
      title(c, '责任就是 · 笨拙也愿意为你学', clamp(lt * 1.6));
      frame(c);
    }
  };

  // =====《美味盛宴》=====
  SCENES['f1_shutiao'] = {
    draw(c, lt, t) {
      screen(c, t); const ts = step(t);
      const L = P.scratch('f1'), g = L.getContext('2d'); g.reset();
      ground(g, 900);
      // 小狗（用 beast 当四足，小巧）
      beast(g, 700, 800, 0.5, C.ORG, ts * 5, { tail: 1 });
      // 主人（蹲下递薯条）
      figure(g, 1240, 800, 0.8, C.BLU, { armRaise: 0.9, lean: 0.12, headTilt: -0.1 });
      // 薯条（一根，黄色）
      piece(g, poly([[980, 700], [1016, 700], [1040, 780], [1000, 790]]), C.YEL, null, 3);
      stamp(c, L, 7, 5);
      rod(c, [700, 780], [560, 1080]); rod(c, [1240, 720], [1380, 1080]);
      title(c, '美味盛宴 · 一根薯条开始的日子', clamp(lt * 1.5));
      frame(c);
    }
  };
  SCENES['f2_lianai'] = {
    draw(c, lt, t) {
      screen(c, t); const ts = step(t);
      const L = P.scratch('f2'), g = L.getContext('2d'); g.reset();
      ground(g, 900);
      piece(g, poly([[500, 900], [1500, 900], [1500, 830], [500, 830]]), C.BRN, (k) => K.dots(k, 520, 842, 1480, 892, 30, 3), 3);
      // 主人与女友对坐，食物升级（意面/牛排＝两盘）
      figure(g, 760, 800, 0.7, C.BLU, { armRaise: 0.4, headTilt: 0.05 * Math.sin(ts * 2) });
      figure(g, 1160, 800, 0.7, C.PINK, { armRaise: 0.4, headTilt: -0.05 * Math.sin(ts * 2) });
      bowl(g, 760, 840, 0.9, C.PAPER); bowl(g, 1160, 840, 0.9, C.PAPER);
      // 小狗在桌下（只露头）
      beast(g, 400, 860, 0.42, C.ORG, ts * 4, { tail: 1 });
      stamp(c, L, 7, 5);
      rod(c, [760, 740], [620, 1080]); rod(c, [1160, 740], [1300, 1080]);
      title(c, '有人来了 · 餐桌就变了', clamp(lt * 1.5));
      frame(c);
    }
  };
  SCENES['f3_digu'] = {
    draw(c, lt, t) {
      screen(c, t); const ts = step(t);
      const L = P.scratch('f3'), g = L.getContext('2d'); g.reset();
      ground(g, 900);
      // 低谷：一人独坐，狗粮（冷色调：只用暗色，去掉暖光）
      c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = 'rgba(60,50,60,.28)'; c.fillRect(0, 0, W, H); c.restore();
      piece(g, poly([[500, 900], [1500, 900], [1500, 830], [500, 830]]), '#4a3a2a', null, 3);
      figure(g, 960, 800, 0.78, C.BLU, { lean: 0.16, headTilt: 0.2, armRaise: 0.1 });
      bowl(g, 960, 846, 0.9, '#6a5a4a');
      beast(g, 620, 860, 0.42, C.ORG, ts * 2, { tail: 1 });
      stamp(c, L, 8, 6);
      rod(c, [960, 740], [840, 1080]);
      title(c, '也有只剩下狗粮的时候', clamp(lt * 1.5));
      frame(c);
    }
  };
  SCENES['f4_jiaren'] = {
    draw(c, lt, t) {
      screen(c, t); const ts = step(t);
      const L = P.scratch('f4'), g = L.getContext('2d'); g.reset();
      ground(g, 900);
      piece(g, poly([[380, 900], [1580, 900], [1580, 820], [380, 820]]), C.BRN, (k) => K.dots(k, 400, 832, 1560, 892, 30, 3), 3);
      // 一家人：父、母、孩子、狗
      figure(g, 620, 800, 0.62, C.BLU, { headTilt: 0.05 * Math.sin(ts * 2.2) });
      figure(g, 900, 800, 0.62, C.PINK, { headTilt: -0.05 * Math.sin(ts * 2.2) });
      figure(g, 1180, 800, 0.44, C.YEL, { headTilt: 0.06 * Math.sin(ts * 3) });
      beast(g, 1420, 840, 0.4, C.ORG, ts * 5, { tail: 1 });
      for (let i = 0; i < 4; i++) bowl(g, 600 + i * 280, 840, 0.7, C.PAPER);
      c.save(); c.globalCompositeOperation = 'screen';
      const hg = c.createRadialGradient(960, 700, 30, 960, 700, 560);
      hg.addColorStop(0, 'rgba(255,228,165,.45)'); hg.addColorStop(1, 'rgba(255,228,165,0)');
      c.fillStyle = hg; c.fillRect(0, 0, W, H); c.restore();
      stamp(c, L, 6, 4);
      rod(c, [900, 740], [780, 1080]); rod(c, [1180, 760], [1300, 1080]);
      title(c, '幸福就是 · 有人把最好的留给你', clamp(lt * 1.6));
      frame(c);
    }
  };

  // =====《失物招领》=====
  SCENES['l1_chengshi'] = {
    draw(c, lt, t) {
      screen(c, t); const ts = step(t);
      const L = P.scratch('l1'), g = L.getContext('2d'); g.reset();
      ground(g, 900, '#5a5a5a');
      // 灰色城市：一排同样的方盒楼（同化感）
      for (let i = 0; i < 7; i++) {
        const x = 120 + i * 270;
        piece(g, poly([[x, 900], [x + 190, 900], [x + 190, 440 - (i % 3) * 60], [x, 440 - (i % 3) * 60]]), '#6a6a6a', (k) => K.lattice(k, x + 14, 460 - (i % 3) * 60, x + 176, 880, 30, 18), 3);
      }
      // 男孩（收集瓶盖）
      figure(g, 700, 800, 0.68, C.GRN, { armRaise: 0.4, walk: ts * 4 });
      for (let i = 0; i < 5; i++) bottlecap(g, 900 + i * 70, 860, 0.8, i % 2 ? C.RED : C.YEL);
      stamp(c, L, 7, 5);
      rod(c, [700, 740], [560, 1080]);
      title(c, '失物招领 · 一座一模一样的城', clamp(lt * 1.5));
      frame(c);
    }
  };
  SCENES['l2_yujian'] = {
    draw(c, lt, t) {
      screen(c, t); const ts = step(t);
      const L = P.scratch('l2'), g = L.getContext('2d'); g.reset();
      ground(g, 900, '#5a5a5a');
      for (let i = 0; i < 6; i++) { const x = 100 + i * 300; piece(g, poly([[x, 900], [x + 200, 900], [x + 200, 460], [x, 460]]), '#6a6a6a', (k) => K.lattice(k, x + 14, 480, x + 186, 880, 30, 18), 3); }
      // 巨型茶壶（谁都不要的"东西"）
      teapot(g, 1180, 720, 1.05);
      // 男孩（仰头看）
      figure(g, 620, 800, 0.7, C.GRN, { headTilt: -0.2, armRaise: 0.3 });
      stamp(c, L, 8, 6);
      rod(c, [1180, 700], [1300, 1080]); rod(c, [620, 740], [480, 1080]);
      title(c, '一个没人要的东西', clamp(lt * 1.5));
      frame(c);
    }
  };
  SCENES['l3_shouliu'] = {
    draw(c, lt, t) {
      screen(c, t); const ts = step(t);
      const L = P.scratch('l3'), g = L.getContext('2d'); g.reset();
      ground(g, 900, '#5a5a5a');
      // 家里：小屋＋茶壶（太大，塞不进）
      house(g, 620, 900, 0.7, '#6a6a6a');
      teapot(g, 1250, 730, 0.85);
      figure(g, 480, 800, 0.62, C.GRN, { armRaise: 0.6, headTilt: 0.1 });
      // "招领"告示（一张纸）
      piece(g, poly([[900, 520], [1140, 520], [1140, 700], [900, 700]]), C.PAPER, (k) => K.lines(k, [[[930, 570], [1110, 570]], [[930, 620], [1110, 620]], [[930, 660], [1060, 660]]], 5), 3);
      stamp(c, L, 7, 5);
      rod(c, [480, 740], [360, 1080]); rod(c, [1250, 700], [1380, 1080]);
      title(c, '带回家 · 可它不属于这里', clamp(lt * 1.5));
      frame(c);
    }
  };
  SCENES['l4_guishu'] = {
    draw(c, lt, t) {
      screen(c, t); const ts = step(t);
      const L = P.scratch('l4'), g = L.getContext('2d'); g.reset();
      ground(g, 900, '#5a6a5a');
      // 那个世界：全是"奇怪的东西"（各色奇异形状）
      for (let i = 0; i < 5; i++) {
        const x = 240 + i * 360, col = [C.RED, C.YEL, C.BLU, C.GRN, C.PINK][i];
        g.save(); g.translate(x, 760); g.rotate(Math.sin(t * 1.2 + i) * 0.12);
        piece(g, ell(0, 0, 90, 70), col, (k) => K.clouds(k, -80, -60, 80, 60, 30));
        piece(g, poly([[-20, -60], [20, -60], [8, -140], [-8, -140]]), col, null, 3);
        piece(g, ell(0, -150, 26, 20), col, null, 3);
        g.restore();
      }
      teapot(g, 960, 690, 0.7);
      figure(g, 620, 800, 0.66, C.GRN, { armRaise: 0.7, headTilt: -0.06 });
      c.save(); c.globalCompositeOperation = 'screen';
      const hg = c.createRadialGradient(960, 640, 30, 960, 640, 620);
      hg.addColorStop(0, 'rgba(255,232,180,.42)'); hg.addColorStop(1, 'rgba(255,232,180,0)');
      c.fillStyle = hg; c.fillRect(0, 0, W, H); c.restore();
      stamp(c, L, 6, 4);
      rod(c, [620, 740], [480, 1080]); rod(c, [960, 660], [1080, 1080]);
      title(c, '总有一个地方 · 收留你的不一样', clamp(lt * 1.6));
      frame(c);
    }
  };
})();
