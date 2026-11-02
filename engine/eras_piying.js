// 皮影复刻片 —— 段落表（复刻 皮影.mp4 的机制与视觉签名）
// 原片 115s，复刻版压到 30s / 6 幕：宫廷庭院 → 卷轴展开 → 俯身特写 → 追兽 → 海浪 → 朝拜受阅
window.SCENE_LIBS = ['scenes/piying_remake.js'];
window.BPM = 120;
window.ERAS = [
  { id: 'p1_gongting', dur: 5.2 },
  { id: 'p2_juanzhou', dur: 4.6, transition: { type: 'pageTurn', dur: 0.36, delay: 0 } },
  { id: 'p3_texie',    dur: 5.0, transition: { type: 'lampGlow', dur: 0.40, delay: 0 } },
  { id: 'p4_zhuizhu',  dur: 5.6, transition: { type: 'cutouts',  dur: 0.34, delay: 0 } },
  { id: 'p5_hailang',  dur: 4.8, transition: { type: 'wave',     dur: 0.44, delay: 0 } },
  { id: 'p6_chaobai',  dur: 5.2, transition: { type: 'ripple',   dur: 0.36, delay: 0 } },
];
