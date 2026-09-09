# XU Homepages

> [!NOTE] 中文说明
> **启动台**：启动行为接管插件——启动时按布局组合打开多个笔记，按星期与时间段智能路由主页，支持新标签页直达主页与恢复上次关闭的会话。

English documentation is included below the Chinese section. / 英文说明在本页下半部分。

---

## 简介

XU Homepages（启动台）接管 Obsidian 的启动行为，把「打开一个主页」扩展为完整的启动方案：

- **单主页**：启动只打开你指定的一个文件（默认模式）
- **组合主页**：一次打开多个笔记（每日笔记 + 仪表盘 + 日历等），每个条目可指定打开方式与窗格位置
- **条件路由**：按星期几 + 时间段自动选择对应组合（如工作日开工作台、周末开周报），未命中回退默认组合
- **会话恢复**：启动时还原上次关闭的全部文件
- **新标签页**：点击标签栏「+」或 Ctrl+T 时直接打开主页

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
2. **恢复上次关闭的所有文件**（默认关）：开启后启动时还原上次会话；关闭则启动只打开主页
3. **单主页**（默认开）：选择主页文件并设置打开方式（替换当前页 / 新标签页 / 分屏 / 独立窗口）
4. **组合主页**：开启后自动关闭单主页（两者互斥），在设置页创建组合、添加条目（文件 + 打开方式 + 窗格位置：主区 / 左侧栏 / 右侧栏）
5. **条件规则**（组合主页区域内）：为每个组合添加「星期几 + 时间段」规则，自上而下取第一条命中的组合；都不命中则打开默认组合
6. **新标签页打开主页**（默认关）：开启后点标签栏「+」或 Ctrl+T，新标签页直接显示主页文件

**命令**：命令面板（Ctrl+P）搜索「启动台 / Homepages」——打开主页、按规则打开组合、恢复上次会话。

## 功能特性

- 启动拦截：接管 Obsidian 原生启动行为，严格按配置执行
- 布局组合多开：N 个条目，各带打开方式与窗格位置
- 条件路由引擎：星期几 + 时间段（支持跨夜），默认组合回退
- 会话采集：自动记录关闭前的打开文件（含崩溃兜底落盘）
- 双语界面：中文 / English 随时切换
- 移动端兼容：不依赖桌面专属 API

## 与 Homepage 插件的差异

本项目启动拦截思路借鉴了 [mirnovov/obsidian-homepage](https://github.com/mirnovov/obsidian-homepage)（MIT），但为独立实现，功能定位不同：

| 能力 | Homepage | XU Homepages |
|------|----------|--------------|
| 启动打开 | 1 个主页 | 组合多开（N 个文件 + 位置排布） |
| 条件路由 | 无 | 星期几 + 时间段智能路由 |
| 会话恢复 | 无 | 一键恢复上次关闭的全部文件 |
| 新标签页主页 | 无 | 「+」按钮直达主页 |

## 兼容提示

- 与 Homepage 插件**同时启用会抢启动行为**，二者选一即可；若检测到 Homepage 已启用，设置页会显示冲突提示
- 与自研系列插件（XU 前缀）无 CSS / 设置键 / 命令冲突

## 致谢

- 启动拦截思路参考 [mirnovov/obsidian-homepage](https://github.com/mirnovov/obsidian-homepage)（MIT License），特此致谢

---

# XU Homepages (English)

> [!NOTE]
> **XU Homepages (启动台)** — Take over Obsidian's startup behavior: open multiple notes as a startup layout, route homepages by weekday and time ranges, open your homepage in every new tab, and restore the last session.

## About

XU Homepages extends "open one homepage on startup" into a complete startup solution:

- **Single homepage**: open exactly one file on startup (default mode)
- **Homepage profiles**: open several notes at once (e.g. daily note + dashboard + calendar), each with its own open mode and pane position
- **Conditional routing**: pick a profile automatically by weekday and time range (workbench on weekdays, weekly review on weekends), with a default fallback
- **Session restore**: reopen everything that was open when Obsidian was last closed
- **New-tab homepage**: clicking the tab bar "+" or pressing Ctrl+T opens your homepage directly

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
2. **Restore last session** (off by default): when enabled, startup reopens everything from your last session; when disabled, startup opens only the configured homepage
3. **Single homepage** (on by default): pick the homepage file and its open mode (replace current tab / new tab / split / window)
4. **Homepage profiles**: enabling it turns the single homepage off (they are mutually exclusive); create profiles and add items (file + open mode + pane position: main / left sidebar / right sidebar)
5. **Conditional rules** (inside the profiles section): attach "weekday + time range" rules to profiles; the first matching rule wins, otherwise the default profile opens
6. **Open homepage in new tab** (off by default): the "+" button and Ctrl+T open the homepage in the new tab

**Commands**: search "Homepages" in the command palette (Ctrl+P) — open homepage, open profile by rules, restore last session.

## Features

- Startup interception: replaces Obsidian's native startup behavior
- Multi-note layouts: N items, each with open mode and pane position
- Rule engine: weekday + time range (overnight ranges supported) with default fallback
- Session capture: debounced recording plus an unload-time fallback save
- Bilingual UI: Chinese / English switchable at any time
- Mobile friendly: no desktop-only APIs

## Differences from the Homepage plugin

The startup-interception idea is inspired by [mirnovov/obsidian-homepage](https://github.com/mirnovov/obsidian-homepage) (MIT), but this is an independent implementation with a different focus:

| Capability | Homepage | XU Homepages |
|------|----------|--------------|
| On startup | Opens 1 homepage | Opens a whole profile (N files + positions) |
| Conditional routing | No | Weekday + time-range routing |
| Session restore | No | Reopen everything from last session |
| New-tab homepage | No | "+" button opens the homepage |

## Compatibility

- Do not enable this plugin together with the Homepage plugin — both hook startup; the settings page shows a warning when Homepage is detected
- No CSS / settings-key / command conflicts with other XU-prefixed plugins

## Credits

- Startup-interception technique inspired by [mirnovov/obsidian-homepage](https://github.com/mirnovov/obsidian-homepage) (MIT License)

## License

[MIT](https://github.com/xcloud-ai/xu-homepages/blob/main/LICENSE)
