# XU Homepages 启动台

> [!NOTE] 中文说明
> **启动台** — 启动时按布局组合打开多个固定笔记，支持按星期/时间段智能路由首页，并可恢复上次关闭的所有文件

Open multiple notes as a startup layout, route homepages by weekday and time ranges, and restore the last session.

中文文档：[README.md](./README.md)

## Installation

1. Open Obsidian Settings → Community Plugins
2. Search "XU Homepages" and install, then enable

Manual install:

1. Download `main.js`, `manifest.json`, `styles.css` from the latest release
2. Put them into `<vault>/.obsidian/plugins/xu-homepages/`

## Usage

1. Open Settings → XU Homepages
2. Choose the homepage source: enable "Single homepage" and pick a note, or enable "Profile homepages" (mutually exclusive)
3. Profiles: create one → add notes → mark the common one as default
4. Optional: add condition rules for weekday/time-range routing (top-down, first match wins)
5. "Restore all files closed last time" is off by default; when enabled it takes priority on startup
6. `Ctrl+P` and search "Launchpad" to open the homepage / restore the session manually

## Features

- Startup profiles: open several notes at launch, each with its own open mode (replace / tab / split / window) and pane position (main / left / right sidebar)
- Condition rules: route startup to different profiles by weekday and time range (overnight ranges supported); unmatched falls back to the default profile
- Session restore: reopen all files from the last session on startup (off by default, takes priority over homepages)
- Manual commands: open homepage / open a chosen profile / restore last session
- Bilingual UI (中文 / English); safe fallback: with nothing configured the plugin does not touch startup

## Differences from the Homepage plugin

- Homepage opens a single homepage on startup; XU Homepages opens a **layout of multiple notes** (profiles), each item with its own open mode and pane position
- XU Homepages adds **condition routing**: weekday + time-range rules pick which profile opens, with default fallback
- XU Homepages can **restore the last session** (all files open when Obsidian was closed)

## Compatibility note

This plugin takes over Obsidian's startup behavior, same as the "Homepage" plugin. Running both may cause conflicts — keep only one enabled.

## Credits

The startup-interception technique (patching `app.runOpeningBehavior`) is inspired by [mirnovov/obsidian-homepage](https://github.com/mirnovov/obsidian-homepage) (MIT). All code in this plugin is written from scratch.
