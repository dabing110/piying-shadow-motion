// 《鹬》Piper（2017 第89届奥斯卡最佳动画短片）· 皮影版
// 四幕：不敢靠近 → 被浪打翻 → 水下睁眼 → 再试一次
window.SCENE_LIBS = ['scenes/piying_base2.js', 'scenes/oscar_a.js'];
window.BPM = 120;
window.ERAS = [
  { id: 'q1_qian',     dur: 4.6 },
  { id: 'q2_lang',     dur: 4.4, transition: { type: 'wave',   dur: 0.42, delay: 0 } },
  { id: 'q3_shuixia',  dur: 5.2, transition: { type: 'iris',   dur: 0.44, delay: 0 } },
  { id: 'q4_xia',      dur: 4.8, transition: { type: 'ripple', dur: 0.38, delay: 0 } },
];
