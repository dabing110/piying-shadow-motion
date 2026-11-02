# piying-shadow-motion · 皮影动画流水线

用**代码**画皮影戏，批量产出「皮影演奥斯卡」系列短片的完整开源工程：确定性帧引擎 + 13 部短片的段落表与场景 + 逐帧渲染 + TTS 配音烧字幕 + 发布门禁，全部本地完成，不依赖任何云服务。

```
皮影复刻 · 光与影          鹬 · 浪里睁眼          包宝宝 · 一只包子长大        熊的故事 · 八音盒
```

一部片 = 一张段落表（`eras_<key>.js`，只写 `{id, dur, transition}`）+ 几个场景函数（`SCENES[id] = { draw(c, lt, t) }`）。同样的 `t` 永远画出同一帧，所以整片可以从任意时间点重渲、可以只渲一段、可以抽任意静帧。

## 这是什么

| 层 | 内容 | 说明 |
|---|---|---|
| 引擎 | `engine/` | 花叔 [huashu-art-motion](https://github.com/alchaincyf/huashu-art-motion) 的确定性帧引擎（MIT）：`window.renderFrame(t)` 画一帧到 canvas，浏览器预览 / 无头 Chromium 逐帧抓取同一套代码 |
| 皮件库 | `engine/scenes/piying_base2.js` | 自研 `window.PY`：幕布灯箱、人形、四足兽、鸟、浪、树、屋、云、操杆、铆钉、`step()` 定格步进——13 部共用 |
| 剧本 | `engine/scenes/piying_remake.js`、`oscar_a/b/c.js` | 13 部短片的实际绘制代码，含每幕构图与运动 |
| 段落表 | `engine/eras_*.js` | 13 张：幕 id / 时长（秒，含转场）/ 转场类型与时值 |
| 渲染 | `pipeline/render.py` | 起本地 http 服务 → 无头 Chromium → 逐帧读像素 → 管道送 ffmpeg；支持整片 / 单段 / 抽帧 / 分段渲染 |
| 拆解 | `pipeline/breakdown_local.py` | 把参考片拆成「能写代码的地图」：接触表、逐帧差、转场起点、节拍网格拟合、运动热图 |
| 配音 | `voice/build_voice_remake.py` + `ambience.py` | edge-tts 逐句合成 → 句级时间戳 → ASS 字幕（提前 120ms）→ 参数化环境音 → ducking 混轨烧录；语速硬门禁 ≤ +30% |
| 发布 | `voice/prepare_channels_remake.py` | 成片 + 1080×1440 封面（模糊填充 + 楷体 + AI 角标）+ 发布文案 + `manifest.json` 四件套 |
| 元数据 | `voice/发布元数据_复刻.json`、`voice/lines_*.json` | 13 部的标题/副题/推送词/封面帧/环境音/规格；以及逐句旁白与卡片 |

## 片单（13 部）

| key | 片名 | 幕数 | 时长 | 备注 |
|---|---|---|---|---|
| `piying` | 皮影复刻 | 6 | 30.40s | 复刻 `皮影.mp4` 的机制与视觉签名（原片 115s，压到 30s） |
| `piper` | 鹬 | 4 | 19.00s | 水下睁眼一段做「压暗 + 闷响」混音 |
| `cubes` | 回忆积木小屋 | 4 | 19.60s | |
| `bao` | 包宝宝 | 4 | 19.60s | |
| `hair` | 发之爱 | 4 | 19.60s | |
| `feast` | 美味盛宴 | 4 | 19.20s | |
| `lost` | 失物招领 | 4 | 19.40s | |
| `war` | 战争结束了！ | 4 | 19.60s | |
| `boy` | 男孩、鼹鼠、狐狸和马 | 4 | 19.60s | |
| `wiper` | 皆为爱 | 4 | 19.60s | |
| `love` | 无论如何我爱你 | 4 | 19.60s | |
| `bball` | 亲爱的篮球 | 4 | 19.00s | |
| `bear` | 熊的故事 | 4 | 19.40s | |

规格统一 1920×1080@60fps / H.264。12 部短片各 19~19.6s，皮影复刻 30.4s。

## 快速开始

```bash
# 1) 预览（改代码即时看）：起个静态服务，?film=<key> 选片
cd engine && python -m http.server 8000
#    → http://localhost:8000/?film=piying

# 2) 抽静帧（最快验证改动，不用等整片）
python pipeline/render.py --film piying --solo p1_gongting --stills 1.0,2.5,4.0 --out stills/

# 3) 整片渲染
python pipeline/render.py --film piying --fps 60 --out out/piying.mp4

# 4) 配音（逐句 TTS + 字幕 + 环境音 + 混轨烧录）
python voice/build_voice_remake.py --lines voice/lines_piying.json \
    --eras engine/eras_piying.js --video out/piying.mp4 \
    --outdir out/_voice_piying --final out/piying_有声.mp4

# 5) 打包发布四件套
python voice/prepare_channels_remake.py --keys piying
```

依赖：Python 3.10+、`playwright`（`python -m playwright install chromium`）、`numpy`、`pillow`、`ffmpeg`（在 PATH，或用 `FFMPEG_BIN` 指定）、`edge-tts`（仅配音需要）。字体子集已随仓库附带，缺字体会被引擎的 loadCmaps 直接报错——不要删 `engine/lib/fonts/`。

## 皮影视觉签名（13 部共用的配方）

复刻不是逐像素，而是**提取视觉与运动签名再重画**。这套签名就是本项目最可复用的部分：

| 要素 | 实现 |
|---|---|
| 幕布 | 暖黄纸底 + 中央光晕（灯箱抖动）+ 四周暗角 + 纸纹颗粒 |
| 皮件 | 黑褐剪影 + 镂空刻纹（`K.dots` / `K.clouds` / `K.lines` / `K.lattice`） |
| 配色 | 朱红 `#c0352a` / 靛蓝 `#2c5a8a` / 草绿 `#2f7d4c` / 赭黄 `#d99a2e` / 纸白 `#f6ecd6` |
| 关节 | 皮件是刚体，只绕铆钉转，**不做形变** |
| 运动 | `step(t, 10)` 按 10fps 一顿一顿，保留定格感 |
| 操杆 | 从皮件往下、往外走线，`blur + multiply`，做出「有人在外面举着」的道具感 |
| 画框 | 深色木框 + 暗角（`frame(c)`），把画面钉在「一块幕」上 |

## 三条会静默出错的硬规则

踩过的坑，写进代码就不必再踩：

1. **`U.rng(seed)` 返回的是函数**，要 `const r = rng(seed); r();`。当数值用会静默变 `NaN`，元素直接消失且不报错。
2. **离屏 `P.scratch()` 层经 `P.stamp()` 是 `multiply` 合成**，浅色（蒸汽、白气、亮高光）必须画在主画布 `c` 上、且在 `stamp()` 之后，否则等于没画。
3. **场景文件是 IIFE，必须写结尾的 `})();`**。漏掉 `()` 不会报错，但 `SCENES` 不注册，引擎启动时记进 `__bootErrors` 后拒绝启动。

另有一条工程经验：Chromium 长时间逐帧渲染会内存累积，长片要**分段渲染再拼接**（本工程 30s 片 6 段、19s 片 4 段）；渲染完做**活气 QA**——相邻帧「差异 > 8 灰度级的像素占比」在幕内低于 0.10% 判死帧、高于 32% 判跳变（转场区间豁免）。

## 制作方法（一部片的完整链路）

```
参考片 → breakdown_local.py 拆解（接触表/转场点/节拍网格/运动热图）
      → 提取视觉与运动签名（上面那张表）
      → 写段落表 eras_<key>.js（幕 id + 时长 + 转场）
      → 写场景 scenes/<id>.js（draw(c, lt, t) 画满 1920×1080）
      → 抽帧看构图 → 整片渲染 → 写旁白 lines_<key>.json
      → 配音烧字幕 → 抽封面 → 发布门禁
```

`docs/交付清单.md` 保留了 13 部的逐片记录（幕表、封面帧选择理由、时长），`docs/时代作者规范.md` 是场景文件的写作约定。

## 目录结构

```
engine/     帧引擎 + 13 张段落表 + 5 个场景文件 + lib（含 48 个字体子集）
pipeline/   render.py / breakdown_local.py / compare.py
voice/      build_voice_remake.py / ambience.py / prepare_channels_remake.py
            lines_*.json × 13 / 发布元数据_复刻.json
docs/       交付清单 · 时代作者规范
```

成片、字幕、音轨、原片素材、拆解截图**不在仓库内**（体积与版权原因），需本地自行渲染生成。

## 版权与边界

- **引擎与通用库**：`engine/engine.js`、`index.html`、`clip.*`、`transitions.js`、`engine/lib/*`、`pipeline/render.py` 源自花叔 huashu-art-motion（MIT），归属与许可见 `NOTICE`。
- **原创部分**：13 张段落表、`piying_base2.js` 皮件库、13 部场景代码、配音与发布脚本、旁白与文案。以 MIT 授权。
- **不包含第三方素材**：原片《皮影》及 12 部动画短片的任何音视频、截图、拆解产物均未入库；片名与届次只作注释性标注，版权归各原作方。
- 本系列是**学习性致敬复刻**（学机制、重画、自己配音），不是对原片的复制或搬运。若要商用，请自行确认各原作的授权边界。

## 致谢

引擎底座来自花叔 Huashu 的 [huashu-art-motion](https://github.com/alchaincyf/huashu-art-motion)（MIT，"随便用，随便改，随便造"）。皮影视觉语言参考了传统皮影戏的刻纹与操杆逻辑——一门两千年的手艺，被压进 60 行 `draw()`。
