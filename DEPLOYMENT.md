# GECKO ATLAS — 部署说明

## Phase 6B 状态

部署前整理和 GitHub 发布已完成。

## Phase 6C 进度

- Vercel 项目 `gecko-atlas` 已创建
- 全球生产地址：[gecko-atlas.vercel.app](https://gecko-atlas.vercel.app)
- HTTPS、安全响应头、CSP、视频 Range 请求已在线验证
- Edge / Chrome 桌面、平板、移动端线上回归通过
- 3D 昆虫在三种视口均进入 `insect-cursor-ready`
- GitHub 自动部署连接仍需在 Vercel 账号中添加 GitHub Login Connection

### 已完成

- 本地资源引用完整性审计
- Vercel 发布忽略规则
- Vercel 安全与缓存响应头配置
- 自定义 404 恢复页面
- 视频播放契约自动检查
- Edge / Chrome 桌面、平板与移动端回归
- 发布包体积审计
- Public GitHub 仓库：[heyu02-coder/gecko-atlas](https://github.com/heyu02-coder/gecko-atlas)
- `main` 作为默认生产源码分支
- 完整源素材、旧捕食视频和 FBX 转换资产进入源码仓库

### 发布包

`.vercelignore` 将开发工具、测试截图、文档、源模型和已废弃视频排除出线上文件。当前估算发布包约 11.32MB、56 个文件。

以下文件保留在源码仓库，但不发布：

- `assets/insect-cursor.glb`：重新构建 `cursor.bundle.js` 的源模型
- `assets/gecko-attack.mp4`：旧捕食方案素材，当前网页未引用
- `cursor.js`：3D 光标源代码，生产环境使用构建后的 bundle
- `.review/`：视觉回归截图
- `tools/`：本地部署审计和浏览器测试
- README、案例研究和测试矩阵

### 发布配置

`vercel.json` 配置：

- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-Frame-Options: DENY`
- 禁用摄像头、麦克风与地理位置权限
- Content Security Policy
- CSP 仅额外允许内嵌 GLB 的 `data:`、临时纹理 `blob:` 读取和 Meshopt 所需的 `wasm-unsafe-eval`
- 图片、视频和模型资源的短期缓存与 stale-while-revalidate
- JS/CSS 一小时缓存并要求重新验证

## 发布前本地检查

```powershell
node tools/deployment-audit.js
node tools/browser-smoke-test.js edge
node tools/browser-smoke-test.js chrome
```

预期结果：全部 PASS，无缺失资源、禁用的 `video.play()` 调用或控制台错误。

## Phase 6C 前置条件

进入 Vercel 预览部署前需要确认：

1. 使用 GitHub 账号 `heyu02-coder` 登录 Vercel
2. 从 GitHub 导入 `gecko-atlas`
3. Framework Preset 选择 `Other`
4. 保持项目根目录，不设置构建命令
5. 生成 `.vercel.app` 预览地址后复测响应头、视频 Range 和跨地区访问

## 尚未执行

- Vercel 项目导入
- `.vercel.app` 预览部署
- 自定义域名购买与 DNS
- 中国三网访问测试
- 中国大陆镜像与 ICP 备案

这些事项属于 Phase 6B 及之后的阶段。
