# GECKO ATLAS — 部署说明

## Phase 6A 状态

部署前整理已完成，尚未连接 GitHub、Vercel 或任何域名。

### 已完成

- 本地资源引用完整性审计
- Vercel 发布忽略规则
- Vercel 安全与缓存响应头配置
- 自定义 404 恢复页面
- 视频播放契约自动检查
- Edge / Chrome 桌面、平板与移动端回归
- 发布包体积审计

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
- 图片、视频和模型资源的短期缓存与 stale-while-revalidate
- JS/CSS 一小时缓存并要求重新验证

## 发布前本地检查

```powershell
node tools/deployment-audit.js
node tools/browser-smoke-test.js edge
node tools/browser-smoke-test.js chrome
```

预期结果：全部 PASS，无缺失资源、禁用的 `video.play()` 调用或控制台错误。

## Phase 6B 前置条件

进入 GitHub 阶段前需要用户确认：

1. GitHub 账号或组织名称
2. 仓库名，建议 `gecko-atlas`
3. Public 或 Private；作品集建议 Public
4. 是否保留旧捕食视频等源素材在 GitHub
5. README 中是否公开作者姓名、联系方式和求职方向

## 尚未执行

- GitHub 仓库创建与推送
- Vercel 项目导入
- `.vercel.app` 预览部署
- 自定义域名购买与 DNS
- 中国三网访问测试
- 中国大陆镜像与 ICP 备案

这些事项属于 Phase 6B 及之后的阶段。
