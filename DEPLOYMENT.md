# GECKO ATLAS — 部署说明

## Phase 6B 状态

部署前整理和 GitHub 发布已完成。

## Phase 6C 进度

- Vercel 项目 `gecko-atlas` 已创建
- 全球生产地址：[gecko-atlas.vercel.app](https://gecko-atlas.vercel.app)
- HTTPS、安全响应头、CSP、视频 Range 请求已在线验证
- Edge / Chrome 桌面、平板、移动端线上回归通过
- 3D 昆虫在三种视口均进入 `insect-cursor-ready`
- GitHub App 已获得 `gecko-atlas` 权限，Vercel 项目已连接 `main`

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

## Phase 6D：自定义域名

计划注册的根域名为 `gecko-atlas-hy.com`，个人作为域名实名认证及 ICP 备案主体。

- `www.gecko-atlas-hy.com`：全球站，绑定 Vercel Production
- `gecko-atlas-hy.com`：跳转到 `www.gecko-atlas-hy.com`
- `cn.gecko-atlas-hy.com`：保留给后续中国大陆备案镜像，不指向 Vercel

只需购买一次根域名。`www` 与 `cn` 均为购买根域名后创建的免费 DNS 子域名。

### 个人备案一致性要求

- 腾讯云账号实名认证、域名所有者和 ICP 备案主体必须为同一位个人
- 姓名、证件类型与证件号码必须一致
- 域名实名认证通过并同步至管局后，再提交 ICP 备案
- 备案需要账号内符合要求的中国大陆云资源
- 备案通过后，在大陆镜像页脚展示备案号并链接工信部备案系统

### DNS 分工

域名继续使用腾讯云 DNSPod 管理，不切换到 Vercel Nameserver。完成购买后，根据 Vercel 项目 Domains 页面给出的实时记录配置全球站；不要提前硬编码可能变化的 CNAME 或 A 记录。

## 当前待办

- 在腾讯云购买并完成 `gecko-atlas-hy.com` 个人实名认证
- 将根域名和 `www` 添加到 Vercel，配置规范域名跳转
- 在腾讯云 DNSPod 添加 Vercel 要求的验证与解析记录
- 购买符合备案要求的中国大陆云资源
- 提交个人 ICP 首次备案
- 部署 `cn` 中国大陆镜像并执行中国三网访问测试
