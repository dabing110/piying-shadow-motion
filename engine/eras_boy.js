// 《男孩、鼹鼠、狐狸和马》（2023 第95届）· 皮影版：雪原 → 遇鼹鼠 → 狐狸与马 → 星空同行
window.SCENE_LIBS = ['scenes/piying_base2.js', 'scenes/oscar_c.js'];
window.BPM = 120;
window.ERAS = [
  { id: 'm1_xueyuan', dur: 4.8 },
  { id: 'm2_yanshu',  dur: 4.6, transition: { type: 'dotBloom',  dur: 0.44, delay: 0 } },
  { id: 'm3_huli',    dur: 5.0, transition: { type: 'irisFilm',  dur: 0.46, delay: 0 } },
  { id: 'm4_guijia',  dur: 5.2, transition: { type: 'ripple',    dur: 0.50, delay: 0 } },
];
