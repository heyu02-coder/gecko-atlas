# GECKO ATLAS — 设备与浏览器测试矩阵

测试日期：2026-07-19（Asia/Shanghai）

## 测试环境

| 浏览器 | 版本 | 引擎 | 结果 |
| --- | --- | --- | --- |
| Microsoft Edge | 150.0.4078.65 | Chromium | PASS |
| Google Chrome | 150.0.7871.125 | Chromium | PASS |

本阶段使用真实浏览器可执行文件进行自动化测试，设备尺寸通过浏览器 viewport 模拟。尚未在实体手机、Safari 或 Firefox 上验证；这些项目不会被标记为通过。

## 设备矩阵

| 配置 | Viewport | Edge | Chrome | 主要检查 |
| --- | ---: | --- | --- | --- |
| Desktop | 1440 × 950 | PASS | PASS | 主视觉、视频契约、搜索、实验、长篇档案、地图、来源 |
| Tablet | 768 × 1024 | PASS | PASS | 双列转单列、导航收起、实验控件、地图适配 |
| Mobile | 390 × 844 | PASS | PASS | 搜索入口可见、单列内容、长篇档案、许可页 |
| Physical iOS Safari | — | NOT TESTED | — | 留待下一阶段真机测试 |
| Physical Android Chrome | — | NOT TESTED | — | 留待下一阶段真机测试 |
| Firefox Desktop | — | NOT TESTED | — | 当前设备未安装 Firefox |

## 自动化检查项

脚本：`tools/browser-smoke-test.js`

| ID | 检查项 | 预期结果 | Edge | Chrome |
| --- | --- | --- | --- | --- |
| A01 | 首页 HTTP 响应 | 状态成功 | PASS | PASS |
| A02 | 视频播放契约 | muted；无 autoplay、loop、controls | PASS | PASS |
| A03 | 移动端搜索入口 | 按钮可见且可打开 | PASS | PASS |
| A04 | 全站搜索“体温” | 返回知识专题与体温实验 | PASS | PASS |
| A05 | 体温管理实验 | 控件存在并可见 | PASS | PASS |
| A06 | 蛤蚧长篇档案 | 页面、SVG 地图和至少 4 条来源 | PASS | PASS |
| A07 | 海鬣蜥长篇档案 | 页面、SVG 地图和至少 4 条来源 | PASS | PASS |
| A08 | 科莫多巨蜥长篇档案 | 页面、SVG 地图和至少 4 条来源 | PASS | PASS |
| A09 | 关于项目页 | HTTP 成功 | PASS | PASS |
| A10 | 图片许可页 | HTTP 成功 | PASS | PASS |
| A11 | JavaScript 运行 | 无 `pageerror` | PASS | PASS |
| A12 | 控制台 | 无 error 级消息 | PASS | PASS |
| A13 | 自定义 404 页面 | 恢复说明与返回入口可见 | PASS | PASS |

## 人工视觉检查

| ID | 场景 | 结果 | 说明 |
| --- | --- | --- | --- |
| V01 | 桌面端重点档案首屏 | PASS | 标题、保护状态与主体照片层级清晰 |
| V02 | 桌面端分布地图 | PASS | 范围、岛屿、图例和示意声明同时可见 |
| V03 | 移动端重点档案 | PASS | 标题与状态卡不重叠，正文降为单列 |
| V04 | 保护与共处五项内容 | PASS | 无占位内容，长列表可连续阅读 |
| V05 | 体温实验工作台 | PASS | 变量、模型温度、稳定进度和边界声明完整 |

## 已验证的功能行为

- 体温实验在模型体温进入任务温区后，连续计时 12 秒并写入本地实验记录
- 搜索可同时返回短档案、长篇档案、实验、栖息地、保护内容、关于页与许可页
- 文章弹窗对 3 个重点物种显示长篇档案入口
- 重点档案导航可在 3 个物种之间切换
- 图片通过 800 / 1600 像素 WebP 响应式加载

## 已知边界

1. 触屏设备没有精确鼠标水平位移，因此首页捕食体验不等同于桌面端；内容、地图和表单仍可浏览。
2. WebGL 性能会受 GPU、驱动和系统节能策略影响；FBX 失败时使用降级光标。
3. 分布地图是代码原生科普示意图，不提供 GIS 精确边界。
4. 当前只在 Chromium 系浏览器完成自动化矩阵。
5. 公开部署、HTTPS、CDN 缓存和线上网络性能属于 Phase 6，本阶段不测试。

## 复测命令

启动本地服务器后，在已安装 Playwright 的环境中运行：

```powershell
node tools/browser-smoke-test.js edge
node tools/browser-smoke-test.js chrome
```

可通过 `GECKO_TEST_URL` 指定其他测试地址。公开部署完成后，使用相同脚本对线上 URL 进行回归测试。
