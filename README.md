# GECKO ATLAS

一座以“壁虎追踪昆虫”为入口的可交互壁虎与蜥蜴数字自然博物馆。

项目把视频时间轴、Three.js FBX 昆虫、行为状态机、科普图鉴、开放授权影像和本地实验数据组织在一个无需后端即可运行的网站中。它既是公众科普体验，也是一份展示交互设计、前端工程和内容系统能力的作品集项目。

在线体验：[gecko-atlas.vercel.app](https://gecko-atlas.vercel.app)

## 作者与联系

- 作者：HEYU
- 邮箱：[2212187935@qq.com](mailto:2212187935@qq.com)
- GitHub：[@heyu02-coder](https://github.com/heyu02-coder)
- 项目仓库：[heyu02-coder/gecko-atlas](https://github.com/heyu02-coder/gecko-atlas)

## 在线内容

- 互动首页：昆虫跟随、冲刺、体力、壁虎追踪、警觉、攻击、逃脱与探索结局
- 物种图鉴：7 个首批物种、5 个科级筛选入口
- 身体奥秘：吸附、断尾、夜视、变色、捕食与体温调节
- 行为实验室：捕食追踪、脚趾吸附、伪装测试和体温管理
- 重点档案：蛤蚧、海鬣蜥、科莫多巨蜥长篇内容与示意分布地图
- 栖息地与保护：5 类栖息地、生态价值、共处建议和贸易责任
- 项目透明度：图片许可、本地数据说明、技术架构和设计过程

## 本地运行

环境要求：Python 3，建议使用最新版 Edge 或 Chrome。

Windows 下双击：

```text
启动网页.cmd
```

或在项目目录运行：

```powershell
python server.py
```

然后打开：

```text
http://127.0.0.1:4173/
```

不要直接双击 `index.html`。FBX、JSON、视频和 ES 模块需要通过 HTTP 读取，`file://` 与网站链接的安全策略和资源路径行为不同。

## 核心交互

### 视频切帧

背景视频不自动播放、不循环、不显示控制器，也不调用 `video.play()`。鼠标水平位移被转换为反向的目标时间：

```js
timeOffset = (deltaX / window.innerWidth) * 0.8 * video.duration;
targetTime = clamp(targetTime - timeOffset, 0, video.duration);
```

seek 使用“立即执行 + 最新目标覆盖”的队列，避免连续 `mousemove` 频繁争抢 `currentTime`。

### 3D 昆虫光标

- Three.js 加载 FBX 转换资产并自动计算尺寸、中心和光标缩放
- `part_13`、`part_14` 作为独立翅膀组件，以翅根局部枢轴镜像振翅
- `part_0`、`part_1`、`part_3`、`part_4`、`part_5`、`part_8` 用代码生成交替腿部步态
- 水平转向只围绕竖直轴平滑插值；上下移动仅产生受限轻微俯仰
- WebGL 或模型加载失败时保留轻量跟随光标作为降级方案

### 捕食状态机

```text
tracking → alert → charging → attack
                         ↘ hit → respawn
                         ↘ escape → cooldown
```

状态由距离、移动速度、冲刺、体力与安全区共同决定。攻击目标始终是当前昆虫坐标，不播放独立捕食片段替代命中过程。

## 技术结构

```text
index.html / museum.js       博物馆首页、搜索、图鉴和文章弹窗
species.html / species.js   重点物种长篇档案和代码原生地图
lab.html / lab.js           四个行为实验及本地实验记录
cursor.js                    Three.js 模型加载、翅膀与腿部动画
script.js                    视频时间轴与排队 seek
game.js                      捕食状态机
exploration.js               热点、安全区、彩蛋与多结局
analytics.js                 本地反馈和匿名互动数据面板
assets/museum/               响应式 WebP 与许可清单
```

项目使用原生 HTML、CSS、JavaScript 与 Three.js。页面不依赖框架、账户系统或远程数据库，可静态部署。

## 数据与隐私

实验记录、探索进度、互动指标和反馈只写入当前浏览器的 `localStorage`。项目没有接入第三方行为分析服务，也不会自动上传数据。用户可以从数据面板查看、导出或清除记录。

实验属于教学模型，用于解释变量之间的关系，不替代真实动物实验、力学测量、饲养建议或物种级生理结论。

## 素材与许可证

网站照片只使用 Public Domain、CC0、CC BY 或 CC BY-SA 素材。每张图片均记录：

- 作者
- Wikimedia Commons 原始文件页
- 许可证及许可文本
- 本项目所做的尺寸、WebP 与显示处理

完整登记见 [`credits.html`](credits.html) 和 [`assets/museum/image-manifest.json`](assets/museum/image-manifest.json)。FBX 模型与用户提供的视频不在开放图片素材许可范围内。

## 测试

测试范围和结果见 [`TEST_MATRIX.md`](TEST_MATRIX.md)。浏览器冒烟测试脚本位于 [`tools/browser-smoke-test.js`](tools/browser-smoke-test.js)，需要本地已安装 Playwright：

```powershell
node tools/browser-smoke-test.js edge
node tools/browser-smoke-test.js chrome
```

## 项目文档

- [`CASE_STUDY.md`](CASE_STUDY.md)：问题、迭代、设计决策、架构和结果
- [`TEST_MATRIX.md`](TEST_MATRIX.md)：设备、浏览器、检查项和已知边界
- [`DEPLOYMENT.md`](DEPLOYMENT.md)：发布包、Vercel 配置与部署阶段边界
- [`about.html`](about.html)：面向网站访客的项目说明

## 下一阶段

公开部署被明确留到 Phase 6。该阶段将处理正式域名、HTTPS、缓存策略、静态托管配置、线上性能监控和可分享 Demo 链接；本阶段不执行部署。
