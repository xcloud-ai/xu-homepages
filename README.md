# XU Homepages

> [!NOTE] 中文说明
> **启动台**：单一主页启动接管插件——启动时打开主页或恢复上次会话，新标签页直达主页。

English documentation is included below the Chinese section. / 英文说明在本页下半部分。

---

## 简介

XU Homepages（启动台）接管 Obsidian 的启动行为，功能收敛为四件事：

- **单一主页**：在设置里选择一个文件路径作为主页
- **启动接管**：启动时打开该主页（默认），或恢复上次会话（设置里下拉二选一）
- **新标签页直达主页**：点击标签栏「+」或按 Ctrl+T，新标签页直接打开主页（关闭标签不受影响）
- **恢复上次会话**：启动时一键还原上次关闭时打开的全部文件

> [!IMPORTANT] v2.0.0 破坏性变更
> v1.x 的组合主页、星期/时间段条件路由、多窗格布局已移除，设置仅保留单一主页。旧配置中的主页文件路径会自动沿用。

## 安装

**方式一：社区插件目录（推荐）**

设置 → 第三方插件 → 社区插件市场 → 搜索 "XU Homepages" → 安装并启用。

**方式二：手动安装**

1. 前往 [Releases](https://github.com/xcloud-ai/xu-homepages/releases) 下载最新版本的 `main.js`、`manifest.json`、`styles.css`
2. 放入你的库目录：`<你的库>/.obsidian/plugins/xu-homepages/`
3. 重启 Obsidian → 设置 → 第三方插件 → 启用 **XU Homepages**

**方式三：BRAT**

1. 安装并启用 [BRAT](https://github.com/TfTHacker/obsidian42-brat) 插件
2. 命令面板 → `BRAT: Add a beta plugin for testing`
3. 输入 `xcloud-ai/xu-homepages` 确认即可

## 使用方法

1. 启用插件后进入设置页，顶部可切换界面语言（中文 / English）
2. **主页文件**：直接输入 vault 内路径，或点「浏览」从文件列表中选择
3. **启动行为**（下拉二选一）：
   - **打开主页**（默认）：启动时只打开主页文件
   - **恢复上次会话**：启动时还原上次关闭时打开的全部文件
4. **新标签页打开主页**（默认开）：开启后点标签栏「+」或 Ctrl+T，新标签页直接显示主页文件；关闭标签不会误弹主页

**命令**：命令面板（Ctrl+P）搜索「启动台 / Homepages」——打开主页、恢复上次会话。命令名随界面语言即时切换。

## 功能特性

- 启动拦截：接管 Obsidian 原生启动行为，严格按配置执行
- 新标签页直达：精准区分「新建标签」与「关闭标签/合并分屏」，只在新建时打开主页
- 会话采集：防抖记录关闭前打开的文件（含卸载兜底落盘）
- 记忆卫生：主页文件被移动时自动跟随更新路径，被删除时提示重新选择
- 双语界面：中文 / English 随时切换
- 移动端兼容：不依赖桌面专属 API

## 与 Homepage 插件的差异

本项目启动拦截思路借鉴了 [mirnovov/obsidian-homepage](https://github.com/mirnovov/obsidian-homepage)（MIT），但为独立实现，功能定位不同：

| 能力 | Homepage | XU Homepages |
|------|----------|--------------|
| 启动打开 | 1 个主页 | 单一主页或恢复上次会话（可选） |
| 会话恢复 | 无 | 一键恢复上次关闭的全部文件 |
| 新标签页主页 | 无 | 「+」按钮 / Ctrl+T 直达主页 |
| 主页移动跟随 | 无 | 重命名/移动自动同步路径 |

## 兼容提示

- 与 Homepage 插件**同时启用会抢启动行为**，二者选一即可；若检测到 Homepage 已启用，设置页会显示冲突提示
- 与自研系列插件（XU 前缀）无 CSS / 设置键 / 命令冲突

## 致谢

- 启动拦截思路参考 [mirnovov/obsidian-homepage](https://github.com/mirnovov/obsidian-homepage)（MIT License），特此致谢

---

# XU Homepages (English)

> [!NOTE]
> **XU Homepages (启动台)** — A single-homepage startup takeover plugin: open your homepage or restore the last session on launch, and jump straight to the homepage in every new tab.

## About

XU Homepages takes over Obsidian's startup behavior, focused on four things:

- **Single homepage**: pick one file path in settings as your homepage
- **Startup takeover**: open that homepage on startup (default), or restore the last session — a dropdown switch in settings
- **New-tab homepage**: clicking the tab bar "+" or pressing Ctrl+T opens your homepage directly (closing tabs is not affected)
- **Session restore**: reopen everything that was open when Obsidian was last closed

> [!IMPORTANT] Breaking change in v2.0.0
> The v1.x profile layouts, weekday/time-based routing, and multi-pane opening have been removed; only the single homepage remains. Your existing homepage file path carries over automatically.

## Installation

**From the Community Plugins directory (recommended)**

Settings → Community plugins → Browse → search "XU Homepages" → Install & Enable.

**Manual installation**

1. Download `main.js`, `manifest.json` and `styles.css` from the latest [release](https://github.com/xcloud-ai/xu-homepages/releases)
2. Put them into `<your-vault>/.obsidian/plugins/xu-homepages/`
3. Restart Obsidian → Settings → Community plugins → enable **XU Homepages**

**Via BRAT**

1. Install and enable [BRAT](https://github.com/TfTHacker/obsidian42-brat)
2. Command palette → `BRAT: Add a beta plugin for testing`
3. Enter `xcloud-ai/xu-homepages` and confirm

## Usage

1. Open the plugin settings and choose the interface language at the top (中文 / English)
2. **Homepage file**: type a vault path, or click "Browse" to pick from the file list
3. **Startup behavior** (dropdown, pick one):
   - **Open homepage** (default): startup opens only the homepage file
   - **Restore last session**: startup reopens everything from your last session
4. **Open homepage in new tab** (on by default): the "+" button and Ctrl+T open the homepage in the new tab; closing tabs never triggers it by mistake

**Commands**: search "Homepages" in the command palette (Ctrl+P) — open homepage, restore last session. Command names switch instantly with the UI language.

## Features

- Startup interception: replaces Obsidian's native startup behavior
- New-tab redirect: reliably tells "new tab" apart from "closing a tab / merging panes" — only new tabs open the homepage
- Session capture: debounced recording plus an unload-time fallback save
- Memory hygiene: follows renames of the homepage file automatically and prompts on deletion
- Bilingual UI: Chinese / English switchable at any time
- Mobile friendly: no desktop-only APIs

## Differences from the Homepage plugin

The startup-interception idea is inspired by [mirnovov/obsidian-homepage](https://github.com/mirnovov/obsidian-homepage) (MIT), but this is an independent implementation with a different focus:

| Capability | Homepage | XU Homepages |
|------|----------|--------------|
| On startup | Opens 1 homepage | Single homepage or restore last session (optional) |
| Session restore | No | Reopen everything from last session |
| New-tab homepage | No | "+" button / Ctrl+T opens the homepage |
| Follows file renames | No | Homepage path syncs on rename/move |

## Compatibility

- Do not enable this plugin together with the Homepage plugin — both hook startup; the settings page shows a warning when Homepage is detected
- No CSS / settings-key / command conflicts with other XU-prefixed plugins

## Credits

- Startup-interception technique inspired by [mirnovov/obsidian-homepage](https://github.com/mirnovov/obsidian-homepage) (MIT License)

## License

[MIT](https://github.com/xcloud-ai/xu-homepages/blob/main/LICENSE)
