# 启动台

> [!NOTE] 中文说明
> **启动台**：单一主页启动接管——启动时打开主页或恢复上次会话，新标签页直达主页。

接管 Obsidian 的启动行为，功能收敛为四件事：单一主页（设置里选一个文件路径）、启动接管（打开主页或恢复上次会话，下拉二选一）、新标签页直达主页（点「+」或 Ctrl+T）、会话恢复（一键还原上次关闭时打开的全部文件）。

> [!IMPORTANT] v2.0.0 破坏性变更
> v1.x 的组合主页、星期/时间段条件路由、多窗格布局已移除，设置仅保留单一主页。旧配置中的主页文件路径会自动沿用。

> English description below for review purposes. / 以下为英文说明，用于过审。

XU Homepages takes over Obsidian's startup behavior with a single focus: open one homepage or restore the last session on launch, and jump straight to the homepage in every new tab. v2.0.0 breaking change: v1.x profile layouts, weekday/time-based routing and multi-pane opening have been removed; only the single homepage remains and existing homepage paths carry over.

## 功能特性

- **启动拦截**：接管 Obsidian 原生启动行为，严格按配置执行
- **新标签页直达**：精准区分「新建标签」与「关闭标签/合并分屏」，只在新建时打开主页
- **会话采集**：防抖记录关闭前打开的文件（含卸载兜底落盘）
- **记忆卫生**：主页文件被移动时自动跟随更新路径，被删除时提示重新选择
- **双语界面**：中文 / English 随时切换
- **移动端兼容**：不依赖桌面专属 API

### Features

- Startup interception: replaces Obsidian's native startup behavior
- New-tab redirect: reliably tells a new tab apart from closing a tab or merging panes
- Session capture: debounced recording plus an unload-time fallback save
- Memory hygiene: homepage path follows renames automatically and prompts on deletion
- Bilingual UI: Chinese / English switchable at any time
- Mobile friendly: no desktop-only APIs

## 安装

### 方式一：从 Obsidian 社区目录安装（推荐）

1. 打开 Obsidian 设置 → 社区插件
2. 点击「浏览」，搜索 XU Homepages
3. 点击「安装」，然后「启用」

### 方式二：手动安装

1. 从 [最新 Release](https://github.com/xcloud-ai/xu-homepages/releases) 下载 main.js、manifest.json、styles.css 三个文件
2. 在库中创建目录 .obsidian/plugins/xu-homepages/
3. 将三个文件放入该目录，重启 Obsidian 后启用

### Installation

**From Obsidian Community Directory:**
1. Open Obsidian Settings → Community Plugins
2. Click Browse and search for XU Homepages
3. Click Install, then Enable

**Manual Installation:**
1. Download main.js, manifest.json, styles.css from the [latest release](https://github.com/xcloud-ai/xu-homepages/releases)
2. Put them into <vault>/.obsidian/plugins/xu-homepages/
3. Enable in Settings → Community Plugins

## 使用方法

1. 启用插件后进入设置页，顶部可切换界面语言（中文 / English）
2. **主页文件**：直接输入 vault 内路径，或点「浏览」从文件列表中选择
3. **启动行为**（下拉二选一）：打开主页（默认）或恢复上次会话
4. **新标签页打开主页**（默认开）：点标签栏「+」或 Ctrl+T 直达主页，关闭标签不受影响

### Usage

1. Open the plugin settings and choose the interface language at the top
2. **Homepage file**: type a vault path, or click Browse to pick from the file list
3. **Startup behavior** (dropdown): Open homepage (default) or Restore last session
4. **Open homepage in new tab** (on by default): the + button and Ctrl+T open the homepage directly

## 设置说明

| 设置项 | 说明 |
|--------|------|
| 界面语言 | 中文 / English 切换，命令名即时跟随 |
| 主页文件 | vault 内路径，可手输或浏览选择；移动/重命名自动跟随 |
| 启动行为 | 打开主页（默认）/ 恢复上次会话 |
| 新标签页打开主页 | 默认开启，仅对「新建标签」生效 |

## 命令列表

| 命令 | 作用 |
|------|------|
| 打开主页 | 打开设置中指定的主页文件 |
| 恢复上次会话 | 还原上次关闭时打开的全部文件 |

## 与 Homepage 插件的差异

启动拦截思路借鉴 [mirnovov/obsidian-homepage](https://github.com/mirnovov/obsidian-homepage)（MIT），独立实现，定位不同：

| 能力 | Homepage | XU Homepages |
|------|----------|--------------|
| 启动打开 | 1 个主页 | 单一主页或恢复上次会话（可选） |
| 会话恢复 | 无 | 一键恢复上次关闭的全部文件 |
| 新标签页主页 | 无 | 「+」按钮 / Ctrl+T 直达主页 |
| 主页移动跟随 | 无 | 重命名/移动自动同步路径 |

## 兼容提示

- 与 Homepage 插件同时启用会抢启动行为，二者选一；检测到 Homepage 已启用时设置页显示冲突提示
- 与自研系列插件（XU 前缀）无 CSS / 设置键 / 命令冲突

## 技术说明

- 纯 JavaScript 实现（main.js），main.ts 为 TypeScript 源码参考
- 会话防抖采集 + onunload 兜底落盘；事件注册在 onLayoutReady 内（官方 load-time 规范）
- 兼容移动端（isDesktopOnly: false）

## 致谢 / Credits

- 启动拦截思路参考 [mirnovov/obsidian-homepage](https://github.com/mirnovov/obsidian-homepage)（MIT License）

## 许可证

MIT License - Copyright (c) 2026 旭说
