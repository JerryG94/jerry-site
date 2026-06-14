# 🌐 GLJ 资源导航网站

> 一个现代化、美观的资源聚合导航网站，基于 React + Vite + Tailwind CSS 构建

[![Vercel Deploy](https://img.shields.io/badge/deploy-vercel-black)](https://vercel.com)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![React](https://img.shields.io/badge/react-18.3-61DAFB)](https://react.dev)
[![Tailwind](https://img.shields.io/badge/tailwind-3.4-06B6D4)](https://tailwindcss.com)

---

## ✨ 功能特性

### 🎨 设计与用户体验

| 特性 | 描述 |
|------|------|
| **现代化设计** | Bento Grid 布局，玻璃拟态效果，渐变色彩系统 |
| **响应式设计** | 完美支持桌面/平板/移动端，移动端侧边栏可收起 |
| **明暗主题** | 亮色/暗色模式切换，系统主题自动检测，主题状态持久化 |
| **流畅动画** | 60fps 流畅动画，Framer Motion 集成，GPU 加速 |

### 🔍 导航与搜索

- **智能搜索** - 支持按名称、描述、标签、分类实时搜索过滤
- **标签筛选** - 多维度标签分类筛选系统，标签云展示，已选标签管理
- **分类导航** - 六大一级分类 + 二级分类树形导航，分类图标可视化
- **视图切换** - 支持网格视图 (Grid) 和列表视图 (List) 切换

### 📂 资源展示

- **资源卡片** - 网站 Favicon 自动获取，完整信息展示，悬停动画效果
- **资源详情** - 点击卡片查看详细信息，渐变头部设计，分享功能 (Web Share API)
- **外链跳转** - 一键访问网站，新标签页打开

### 👤 用户系统

- **登录/注册** - 精美的登录/注册模态框，表单验证，密码显示切换
- **用户状态** - localStorage 持久化，用户菜单下拉，头像自动生成
- **社交登录预留** - Google/Facebook 登录接口预留

### 💬 社区功能

- **讨论板块** - 用户交流讨论，发布新帖功能，标签系统
- **互动功能** - 点赞功能，回复计数，帖子详情查看

### ⚡ 性能优化

- **组件优化** - React.memo 防止不必要渲染，代码分割，事件处理优化
- **加载状态** - 骨架屏组件 (Skeleton)，平滑过渡动画
- **错误边界** - 友好错误页面，错误日志记录，重试机制

### 🔧 辅助功能

- **返回顶部** - 浮动按钮，滚动显示/隐藏，平滑动画回顶
- **页脚区域** - 品牌信息，快速链接，分类导航，版权信息
- **PWA 支持** - Web App Manifest，可安装为桌面应用，离线可用预留

### 📈 SEO 优化

- **Meta 标签** - 完善的 SEO Meta 标签，Open Graph 协议，Twitter Card
- **结构化数据** - JSON-LD 结构化数据，Canonical URL
- **爬虫友好** - robots.txt 配置文件

---

## 🎯 六大资源分类

| 序号 | 一级分类 | 二级分类 |
|------|----------|----------|
| 1 | **软件下载网站** | iOS软件、浏览器插件、Windows/Mac软件、Android应用 |
| 2 | **影视音乐游戏** | 在线影视、音乐下载、游戏资源、直播源 |
| 3 | **教育资源汇总** | 在线课程、电子书籍、学术搜索、语言学习 |
| 4 | **设计素材模板** | 图片素材、图标资源、UI模板、字体下载 |
| 5 | **开源项目展示** | 前端项目、后端框架、AI工具、开发工具 |
| 6 | **其他网站收藏** | 实用工具、社交媒体、新闻资讯、生活服务 |

---

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0

### 安装依赖

```bash
cd nav-site
npm install
```

### 开发模式

```bash
npm run dev
```

访问 `http://localhost:5173` 查看网站

### 生产构建

```bash
npm run build
```

构建产物在 `dist/` 目录下

### 预览生产版本

```bash
npm run preview
```

---

## 📦 部署指南

### Vercel 部署（推荐）

1. 推送代码到 GitHub
2. 访问 [Vercel](https://vercel.com)
3. 导入 GitHub 仓库
4. 自动检测 Vite 项目，点击部署
5. 等待 1-2 分钟，获得生产环境 URL

### Netlify 部署

1. 推送代码到 GitHub
2. 访问 [Netlify](https://netlify.com)
3. 导入 GitHub 仓库
4. 构建设置：
   - Build command: `npm run build`
   - Publish directory: `dist`
5. 点击部署

### 传统服务器部署

1. 运行 `npm run build` 构建项目
2. 将 `dist/` 目录上传到服务器
3. 配置 Web 服务器（Nginx/Apache）指向 `dist/` 目录
4. 配置 SPA 回退规则（所有路由指向 index.html）

#### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # 启用 gzip 压缩
    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml;

    # 静态资源缓存
    location ~* \.(css|js|svg|png|jpg|jpeg|gif|webp|avif|ico|woff|woff2|ttf|eot)$ {
        expires 7d;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## 🛠️ 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 18.3 | UI 框架 |
| Vite | 6.0 | 构建工具 |
| Tailwind CSS | 3.4 | 样式框架 |
| Framer Motion | 11.11 | 动画库 |
| React Router DOM | 6.28 | 路由管理 |
| Lucide React | 0.454 | 图标库 |

---

## 📝 数据管理

网站数据存储在 `src/data/bookmarks_data.json`，您可以：

1. **手动编辑** - 直接修改 JSON 文件添加/删除资源
2. **批量导入** - 通过脚本将浏览器书签 HTML 转换为 JSON 格式
3. **后台管理系统**（待开发）- 可视化管理界面

### JSON 数据格式

```json
{
  "name": "网站名称",
  "url": "https://example.com",
  "description": "网站功能介绍（30字以内）",
  "tags": ["标签1", "标签2", "标签3"],
  "category1": "一级分类名称",
  "category2": "二级分类名称"
}
```

---

## 🎨 定制化

### 修改主题色

编辑 `tailwind.config.js` 中的 `colors` 配置

### 添加新的分类图标

在 `src/components/Sidebar.jsx` 中的 `categoryIcons` 对象添加映射

### 修改动画效果

调整 `src/index.css` 中的动画关键帧和 Tailwind 配置

---

## 📱 移动端适配

- ✅ 响应式布局自动适配
- ✅ 移动端侧边栏可收起
- ✅ 触摸友好的交互设计
- ✅ 移动端主题切换优化

---

## 🔒 用户系统说明

当前版本使用 `localStorage` 存储用户信息，适合演示和小型应用。

**生产环境建议：**
- 接入后端 API（Laravel / Express / Django）
- 使用 JWT 或 Session 认证
- 添加数据库存储（MySQL / PostgreSQL / MongoDB）
- 实现邮箱验证、密码重置等功能

---

## 🌐 浏览器支持

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ 移动端浏览器

---

## 📊 项目统计

| 指标 | 数值 |
|------|------|
| 组件数量 | 11 个 |
| 代码行数 | 约 1,500 行 |
| 构建产物 (JS) | 393KB (gzip: 121KB) |
| 构建产物 (CSS) | 28KB (gzip: 5.4KB) |
| 开发耗时 | 约 4 小时 |
| 资源数量 | 196 个 |

---

## 🔮 未来规划

### 功能增强

- [ ] 后端 API 集成 (用户系统持久化)
- [ ] 数据库存储 (MySQL / MongoDB)
- [ ] 资源提交审核系统
- [ ] 用户收藏夹功能
- [ ] 资源评分与评论
- [ ] 个性化推荐算法
- [ ] 访问统计与分析
- [ ] RSS 订阅功能
- [ ] 浏览器扩展开发

### 技术升级

- [ ] TypeScript 迁移
- [ ] 单元测试覆盖
- [ ] E2E 测试
- [ ] CI/CD 流水线
- [ ] Docker 容器化
- [ ] 微服务架构
- [ ] GraphQL API
- [ ] 服务端渲染 (SSR)
- [ ] 静态站点生成 (SSG)

---

## 📄 许可证

MIT License

---

## 🙏 致谢

- 书签数据来源：用户收藏整理
- UI 设计灵感：现代资源导航网站
- 图标库：Lucide React
- 字体：Geist, Outfit

---

**开发者**: Senior Developer (高级开发工程师)  
**构建时间**: 2026年6月  
**版本**: 1.0.0  
**项目状态**: ✅ 生产就绪  

---

## 📞 联系方式

- 问题反馈：[GitHub Issues](https://github.com/yourusername/glj-nav-hub/issues)
- 功能建议：欢迎提交 Pull Request
- 邮件联系：contact@glj.com

---

**⭐ 如果这个项目对你有帮助，请给它一个星标！**
