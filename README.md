# Jerry小站 🐭

> 一款现代化的个人资源导航网站，聚合优质网站资源，支持分类筛选、拖拽排序、可视化管理和 GitHub Pages 一键部署。

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-blue?logo=github)](https://jerryg94.github.io/jerry-site/)
[![Tech Stack](https://img.shields.io/badge/React-18-blue?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-purple?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/license-MIT-green)](#license)

---

## 📑 目录

- [在线演示](#-在线演示)
- [功能特性](#-功能特性)
- [技术栈](#-技术栈)
- [项目结构](#-项目结构)
- [快速开始](#-快速开始)
- [使用指南](#-使用指南)
  - [浏览资源](#浏览资源)
  - [管理后台](#管理后台)
- [部署](#-部署)
  - [GitHub Pages](#github-pages-自动部署)
  - [本地部署](#本地部署)
- [常见问题](#-常见问题)
- [维护流程](#-维护流程)
- [English Version](#english-version)

---

## 🌐 在线演示

**线上地址**：[https://jerryg94.github.io/jerry-site/](https://jerryg94.github.io/jerry-site/)

> ⚠️ 管理后台功能需要本地运行 (`npm run dev`)，线上版仅供浏览。

---

## ✨ 功能特性

### 🏠 前台浏览
- **分类导航** — 7 个一级分类 + 50+ 子分类，侧边栏树形展示
- **资源卡片** — 网格/列表双视图，含图标、描述、标签、外链
- **全局搜索** — 顶栏搜索，300ms 防抖，实时过滤
- **深浅主题** — 随系统 / 手动切换，颜色过渡平滑
- **资源详情** — 点击卡片查看完整信息，一键跳转原站

### 🔧 管理后台 (`/admin`)
- **行内编辑** — 点击分类单元格直接修改，下拉选择 + 自定义新增
- **拖拽排序** — 书签顺序拖拽排列 · 分类顺序拖拽排列
- **右键重命名** — 右键侧边栏分类项弹出菜单，内联输入新名称
- **批量操作** — 复选框多选，底部浮动条批量修改分类/删除
- **数据管理** — 新增/编辑/删除书签，JSON/CSV 导入导出

---

## 🛠 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | React 18 |
| 构建工具 | Vite 6 |
| 样式 | Tailwind CSS 3.4 |
| 动画 | Framer Motion |
| 图标 | Lucide React |
| 路由 | React Router v6 |
| 数据存储 | 静态 JSON（196 条书签数据） |
| 后端 API | Vite 插件（dev server 内嵌 REST API，管理后台专用） |
| 部署 | GitHub Pages |

---

## 📁 项目结构

```
nav-site/
├── src/
│   ├── main.jsx              # 入口文件
│   ├── App.jsx               # 根组件（路由/布局/主题）
│   ├── index.css             # Tailwind 全局样式
│   ├── data/
│   │   ├── bookmarks_data.json   # 主数据（196条）
│   │   └── category_config.json  # 分类排序配置
│   ├── components/
│   │   ├── Navbar.jsx        # 顶栏（Jerry小站 Logo）
│   │   ├── Sidebar.jsx       # 侧边栏（分类树/拖拽/右键菜单）
│   │   ├── ResourceGrid.jsx  # 资源卡片网格
│   │   ├── ResourceCard.jsx  # 卡片组件
│   │   ├── ResourceDetail.jsx# 详情弹窗
│   │   ├── Footer.jsx        # 固定底栏
│   │   ├── DiscussionBoard.jsx
│   │   ├── FavoritesPage.jsx
│   │   ├── LoginModal.jsx
│   │   ├── UserProfile.jsx
│   │   └── BackToTop.jsx
│   ├── pages/
│   │   └── Admin.jsx         # 管理后台
│   └── api/                  # API 客户端
├── public/
│   ├── assets/
│   │   └── logo-jerry.png    # Jerry Logo（去背景）
│   └── favicon.svg           # 网站图标
├── admin-api.js              # Vite 插件（开发服 REST API）
├── vite.config.js
├── tailwind.config.js
├── docs/                     # 构建输出（GitHub Pages 部署源）
├── .workbuddy/               # WorkBuddy 项目文档
│   └── PROJECT.md            # 项目规范（AGENTS.md 等价）
└── README.md
```

---

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm 9+

### 安装运行

```bash
# 1. 进入项目目录
cd nav-site

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev

# 4. 打开浏览器
#    前台：    http://localhost:3000
#    管理后台：http://localhost:3000/admin
```

---

## 📖 使用指南

### 浏览资源

1. 打开 [http://localhost:3000](http://localhost:3000)
2. 左侧选择分类（一级 → 二级）筛选资源
3. 顶栏搜索框输入关键词实时过滤
4. 点击资源卡片查看详情或跳转到原站
5. 右上角切换深色/浅色主题

### 管理后台

1. 访问 [http://localhost:3000/admin](http://localhost:3000/admin)
2. **修改分类**：点击表格中的分类单元格 → 下拉选择或输入新分类
3. **拖拽排序**：按住书签行的 `⋮⋮` 图标拖拽 · 按住分类项的 `⋮⋮` 拖拽
4. **重命名分类**：右键侧边栏分类项 → 输入新名称 → 回车确认
5. **批量操作**：勾选多行 → 底部浮动条批量修改/删除
6. **新增书签**：点击「+ 添加」按钮 → 填写表单 → 保存
7. 完成后点击顶栏「👁 查看前台」按钮回到浏览模式

---

## 🚢 部署

### GitHub Pages 自动部署

项目已配置自动部署，推送 `main` 分支即自动更新线上：

```bash
# 本地开发完毕后
npm run build       # 构建到 docs/
git add .
git commit -m "更新网站内容"
git push            # 推送后 GitHub Pages 自动部署
```

> **线上地址**：[https://jerryg94.github.io/jerry-site/](https://jerryg94.github.io/jerry-site/)

### fork 后自行部署

1. Fork 本仓库
2. 修改 `vite.config.js` 中的 `base` 为 `'/<你的仓库名>/'`
3. 在仓库 Settings → Pages 中设置 Source 为 `main` 分支 `/docs` 目录
4. `npm run build && git push` 即可部署

---

## ❓ 常见问题

<details>
<summary><b>Q: 管理后台为什么无法修改数据？</b></summary>

管理后台的数据编辑功能依赖本地 Vite dev server 提供的 REST API。  
线上 GitHub Pages 是纯静态托管，无法执行后端逻辑。  
请本地运行 `npm run dev` 后访问 `localhost:3000/admin` 进行数据维护。
</details>

<details>
<summary><b>Q: 如何添加新的分类？</b></summary>

1. 在管理后台直接使用分类下拉中的「+ 添加新分类」功能，或
2. 编辑 `src/data/bookmarks_data.json` 中对应书签的 `category1` / `category2` 字段
3. 在 `src/components/Sidebar.jsx` 的 `categoryIcons` / `categoryColors` 中添加新分类的图标和颜色配置
</details>

<details>
<summary><b>Q: 如何修改 GitHub Pages 域名？</b></summary>

1. 修改 `vite.config.js` 中的 `base` 路径
2. 修改 `public/CNAME`（如需自定义域名）
3. 重新构建并推送
</details>

<details>
<summary><b>Q: 代码里的 api/ 目录是做什么的？</b></summary>

`src/api/` 包含前端 API 客户端（auth, resources, comments 等），用于连接后端服务。  
当前部署中这些 API 未启用，系统使用 `src/data/bookmarks_data.json` 作为本地数据源。
</details>

---

## 🔄 维护流程

```
本地修改代码/数据
    │
    ▼
npm run build         # 确保构建成功
    │
    ▼
git add . && git commit -m "描述修改"
    │
    ▼
git push              # → GitHub Pages 自动部署
    │
    ▼
更新 README.md                # 功能变化时
更新 .workbuddy/memory/       # 工作日志
更新 .workbuddy/PROJECT.md   # 架构/规范变化时
```

---

## 📝 License

MIT

---

---
# English Version

## Jerry Site 🐭

A modern personal resource navigation site aggregating quality websites with category filtering, drag-and-drop management, visual admin panel, and one-click GitHub Pages deployment.

### Quick Start

```bash
cd nav-site
npm install
npm run dev        # localhost:3000
```

### Live Demo

[https://jerryg94.github.io/jerry-site/](https://jerryg94.github.io/jerry-site/)

### Features

| Feature | Description |
|---------|-------------|
| **Category Navigation** | 7 top-level + 50+ sub-categories, sidebar tree view |
| **Resource Cards** | Grid/list dual view with icons, descriptions, tags |
| **Global Search** | Search bar with 300ms debounce |
| **Dark/Light Theme** | System-following or manual toggle |
| **Admin Panel** | Inline edit, drag-to-reorder, right-click rename, batch ops |
| **Auto Deploy** | Push to main → GitHub Pages auto-deploy |

### Deployment (after fork)

```bash
# Update base path in vite.config.js
# Settings → Pages → Source: main /docs
npm run build && git push
```

---

> **Maintained by**: JerryG94 · See [.workbuddy/PROJECT.md](.workbuddy/PROJECT.md) for detailed specs
