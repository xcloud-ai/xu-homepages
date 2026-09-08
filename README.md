# XU Homepages

> [!NOTE] 中文说明
> **启动台** — 启动时按布局组合打开多个固定笔记，支持按星期/时间段智能路由首页，并可恢复上次关闭的所有文件

启动时按布局组合打开多个笔记，支持按星期与时间段智能路由主页，并可恢复上次关闭的会话。

## Installation / 安装

1. Open Obsidian Settings -> Community Plugins
2. Search "XU Homepages" and install, then enable
3. 打开 Obsidian 设置 -> 第三方插件, 搜索 "XU Homepages" 安装并启用

Manual install / 手动安装:
1. Download `main.js`, `manifest.json`, `styles.css` from the latest release
2. Put them into `<vault>/.obsidian/plugins/xu-homepages/`

## Usage / 使用方法

1. Open Settings -> XU Homepages / 打开 设置 -> 启动台
2. Pick a startup behavior, create a profile, add notes / 选择启动行为，新建启动组合并添加笔记
3. Optional: add weekday/time rules for smart routing / 可选：添加条件规则按星期/时间段智能路由
4. `Ctrl+P` -> "Launchpad" for manual triggers / `Ctrl+P` 搜索「启动台」手动触发

## Features / 功能

- Startup profiles: open several notes at launch, each with its own open mode (replace / tab / split / window) and pane position (main / left / right sidebar)
- Condition rules: route startup to different profiles by weekday and time range (overnight ranges supported); unmatched falls back to the default profile
- Startup behavior: routed homepage profiles (default) or restore all files from the last session
- Manual commands: open routed profile / open a chosen profile / restore last session
- Bilingual UI (中文 / English); safe fallback: with no profile configured the plugin does not touch startup

## Differences from the Homepage plugin / 与 Homepage 插件的差异

- Homepage opens a single homepage on startup; XU Homepages opens a **layout of multiple notes** (profiles), each item with its own open mode and pane position / Homepage 启动只开一个主页；启动台按组合一次打开多个笔记，每项可单独设置打开方式与窗格位置
- XU Homepages adds **condition routing**: weekday + time-range rules pick which profile opens, with default fallback / 启动台支持条件路由：按星期与时间段自动切换组合，未命中回退默认组合
- XU Homepages can **restore the last session** (all files open when Obsidian was closed) / 启动台可恢复上次关闭时的全部文件

## Compatibility note / 兼容提示

This plugin takes over Obsidian's startup behavior, same as the "Homepage" plugin. Running both may cause conflicts — keep only one enabled.

本插件与 Homepage 插件同样接管启动行为，同时启用可能互相冲突，建议只保留一个。

## Credits / 致谢

The startup-interception technique (patching `app.runOpeningBehavior`) is inspired by [mirnovov/obsidian-homepage](https://github.com/mirnovov/obsidian-homepage) (MIT). All code in this plugin is written from scratch.

启动拦截思路（重写 `app.runOpeningBehavior`）借鉴了 [mirnovov/obsidian-homepage](https://github.com/mirnovov/obsidian-homepage)（MIT 许可），本插件全部代码为原创实现。
