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

## Phase 6D：自定义域名（已完成）

根域名为 `gongheyu-ai.com`，作为 HEYU 求职作品集及多个项目的统一入口；个人作为域名实名认证及 ICP 备案主体。

- `gongheyu-ai.com`：保留给个人作品集总站
- `www.gongheyu-ai.com`：保留给个人作品集总站
- `gecko.gongheyu-ai.com`：Gecko Atlas 全球站，已绑定 Vercel Production
- `cn-gecko.gongheyu-ai.com`：预留给备案后的中国大陆镜像

Gecko Atlas 当前正式地址为 <https://gecko.gongheyu-ai.com>。DNSPod 使用 Vercel 分配的项目专属 CNAME，Vercel 域名验证、HTTPS 证书、主页响应和视频 Range 请求均已通过。

### 个人备案一致性要求

- 腾讯云账号实名认证、域名所有者和 ICP 备案主体必须为同一位个人
- 姓名、证件类型与证件号码必须一致
- 域名实名认证通过并同步至管局后，再提交 ICP 备案
- 备案需要账号内符合要求的中国大陆云资源
- 备案通过后，在大陆镜像页脚展示备案号并链接工信部备案系统

### DNS 分工

域名继续使用腾讯云 DNSPod 管理，不切换到 Vercel Nameserver。`gecko` 当前通过 CNAME 指向 Vercel；根域名与 `www` 暂不占用，等待作品集总站部署。

## Phase 6E：ICP 备案与大陆资源（进行中）

- 等待域名实名认证信息同步至备案系统（通常约 3 天）
- 在同一实名认证腾讯云账号购买符合备案条件的中国大陆资源
- 推荐轻量应用服务器：中国大陆节点、包年包月、购买时长至少 3 个月，备案期间剩余有效期至少 1 个月
- 在腾讯云 ICP 备案控制台提交个人首次备案
- 个人网站名称使用与内容一致的中文名称，不直接使用域名、纯英文或个人姓名
- 收到工信部短信后在 24 小时内完成短信核验
- 审核通过前不把大陆镜像子域名解析到中国大陆服务器

## Phase 6F：大陆镜像（备案通过后）

- 将同一套静态发布包部署到腾讯云中国大陆节点
- 为 `cn-gecko.gongheyu-ai.com` 添加大陆源站解析与 HTTPS
- 在页面底部展示 ICP 备案号并链接工信部备案系统
- 执行中国电信、联通、移动三网及桌面/移动端回归测试
