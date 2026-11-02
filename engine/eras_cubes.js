// 《回忆积木小屋》The House of Small Cubes（2009 第81届奥斯卡最佳动画短片）· 皮影版
// 四幕：海涨盖房 → 烟斗落水 → 逐层下潜 → 最底层的旧日子
window.SCENE_LIBS = ['scenes/piying_base2.js', 'scenes/oscar_a.js'];
window.BPM = 120;
window.ERAS = [
  { id: 'm1_zhangshui', dur: 4.8 },
  { id: 'm2_yandou',    dur: 4.6, transition: { type: 'ripple',   dur: 0.40, delay: 0 } },
  { id: 'm3_qian',      dur: 5.2, transition: { type: 'crossfade', dur: 0.44, delay: 0 } },
  { id: 'm4_diceng',    dur: 5.0, transition: { type: 'lampGlow', dur: 0.46, delay: 0 } },
];
