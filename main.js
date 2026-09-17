/* XU Homepages — 启动台：单一主页接管启动（打开主页 / 恢复上次会话 / 新标签页直达主页） */
'use strict';

const { Plugin, PluginSettingTab, Setting, Notice, TFile, FuzzySuggestModal } = require('obsidian');

const PLUGIN_ID = 'xu-homepages';
const LOG_PREFIX = '[' + PLUGIN_ID + ']';
const SESSION_DEBOUNCE_MS = 300;
/* 新标签页劫持判定参数（见 handleNewTabLeaf 注释） */
const CLOSE_SUPPRESS_MS = 400;
const REDIRECT_DELAY_MS = 80;
const REPO_URL = 'https://github.com/xcloud-ai/xu-homepages';
/* 彩色主页图标（渐变描边小房子），用于 ribbon；Obsidian 内置 Lucide 图标为单色 */
const HOME_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="xu-homepages-svg">'
  + '<defs><linearGradient id="xu-homepages-grad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">'
  + '<stop offset="0" stop-color="#4f8cff"/><stop offset="1" stop-color="#ff9f43"/></linearGradient></defs>'
  + '<g stroke="url(#xu-homepages-grad)">'
  + '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/>'
  + '<path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>'
  + '</g></svg>';

/* v1.x 多主页字段：loadSettings 忽略、saveSettings 落盘前剔除，避免残留写回 data.json */
const DEPRECATED_KEYS = ['profileMode', 'profiles', 'rules', 'singleHomepage', 'restoreLastSession'];

/* ---------------- i18n ---------------- */

const I18N = {
  zh: {
    btn_browse: '浏览',
    modal_pick_file: '选择笔记文件（输入过滤）',
    cmd_open: '启动台：打开主页',
    cmd_restore_session: '启动台：恢复上次会话',
    ribbon: '启动台',

    setting_title: 'XU Homepages（启动台）',
    setting_header_desc: '启动台插件：接管 Obsidian 的启动行为——启动时打开主页或恢复上次会话，新标签页直达主页。',
    setting_language: '界面语言',
    setting_language_desc: '切换中文 / English',
    setting_homepage: '主页文件',
    setting_homepage_desc: '启动与新标签页打开的单一主页文件',
    homepage_ph: 'vault 内路径，如 home.md',
    setting_behavior: '启动行为',
    setting_behavior_desc: '启动时打开主页（默认）或恢复上次关闭的会话，二选一',
    behavior_homepage: '打开主页',
    behavior_restore: '恢复上次会话',
    setting_new_tab: '新标签页打开主页',
    setting_new_tab_desc: '开启后，点击标签栏「+」或 Ctrl+T 新建标签页时直接打开主页；关闭标签不受影响；默认开启',

    conflict_warning_title: '⚠️ 检测到 Homepage 插件已启用',
    conflict_warning: 'Homepage 插件同样接管启动行为，两者可能互相覆盖。建议只保留其中一个启动接管插件。',

    setting_docs: '使用文档',
    setting_docs_desc: '在 GitHub 查看完整使用说明',
    btn_github: 'GitHub',

    err_file_not_found: '文件不存在：%s',
    err_homepage_not_set: '请先在设置中选择主页文件',
    notice_session_empty: '没有可恢复的会话记录',
    notice_session_restored: '已恢复上次会话（%d 个文件）',
    notice_homepage_renamed: '主页已随文件移动更新：%s',
    notice_homepage_deleted: '主页文件已被删除，请到设置中重新选择主页',
  },
  en: {
    btn_browse: 'Browse',
    modal_pick_file: 'Choose a note (type to filter)',
    cmd_open: 'Launchpad: open homepage',
    cmd_restore_session: 'Launchpad: restore last session',
    ribbon: 'Launchpad',

    setting_title: 'XU Homepages',
    setting_header_desc: 'Launchpad plugin: takes over Obsidian startup — open your homepage or restore the last session on launch, and jump straight to the homepage in every new tab.',
    setting_language: 'Language',
    setting_language_desc: 'Switch Chinese / English',
    setting_homepage: 'Homepage file',
    setting_homepage_desc: 'The single homepage opened on startup and in new tabs',
    homepage_ph: 'vault path, e.g. home.md',
    setting_behavior: 'Startup behavior',
    setting_behavior_desc: 'Open the homepage on startup (default) or restore the last session — pick one',
    behavior_homepage: 'Open homepage',
    behavior_restore: 'Restore last session',
    setting_new_tab: 'New tab opens homepage',
    setting_new_tab_desc: 'When enabled, the tab bar "+" button or Ctrl+T opens the homepage; closing tabs is not affected; on by default',

    conflict_warning_title: '⚠️ Homepage plugin detected',
    conflict_warning: 'The Homepage plugin also takes over startup behavior and may conflict with this plugin. Keep only one startup plugin enabled.',

    setting_docs: 'Documentation',
    setting_docs_desc: 'View the full usage guide on GitHub',
    btn_github: 'GitHub',

    err_file_not_found: 'File not found: %s',
    err_homepage_not_set: 'Pick a homepage file in settings first',
    notice_session_empty: 'No session to restore',
    notice_session_restored: 'Last session restored (%d files)',
    notice_homepage_renamed: 'Homepage updated to follow the moved file: %s',
    notice_homepage_deleted: 'The homepage file was deleted — please pick a new homepage in settings',
  },
};

/* ---------------- 默认设置 ---------------- */
/* startupBehavior: 'homepage' 启动打开主页（默认）| 'restore-session' 启动恢复上次会话
   homepage: 单主页 vault 路径
   newTabHomepage: 「+」/ Ctrl+T 新建标签页时打开主页
   sessionCache: 上次会话打开的 markdown 路径列表（仅用于「恢复上次会话」） */
const DEFAULT_SETTINGS = {
  language: 'zh',
  startupBehavior: 'homepage',
  newTabHomepage: true,
  homepage: '',
  sessionCache: [],
};

/* ---------------- Modal ---------------- */

class FilePickModal extends FuzzySuggestModal {
  constructor(app, plugin, onPick) {
    super(app);
    this.plugin = plugin;
    this.onPick = onPick;
    this.setPlaceholder(plugin.t('modal_pick_file'));
  }

  getItems() {
    if (this.app.metadataCache && typeof this.app.metadataCache.getCachedFiles === 'function') {
      return this.app.metadataCache.getCachedFiles();
    }
    console.warn(LOG_PREFIX + ' metadataCache.getCachedFiles unavailable');
    return [];
  }

  getItemText(path) {
    return path;
  }

  onChooseItem(path) {
    this.onPick(path);
  }
}

/* ---------------- 主插件 ---------------- */

class XuHomepages extends Plugin {
  t(key) {
    const dict = I18N[this.settings?.language] || I18N.zh;
    return dict[key] || I18N.zh[key] || key;
  }

  async onload() {
    this.startupHandled = false;
    this.sessionDebounceTimer = null;
    this.releaseNotesSkipped = false;
    this.xuLpOrigRunOpeningBehavior = null;
    this.xuLpOrigShowReleaseNotes = null;
    this.xuLpCommands = {};

    // 启动拦截必须在 onload 同步阶段、任何 await 之前打补丁（参考 homepage），
    // 避免 runOpeningBehavior 在设置加载完成前被 Obsidian 调用而漏拦截
    this.patchReleaseNotes();
    this.patchOpeningBehaviour();

    await this.loadSettings();

    const ribbon = this.addRibbonIcon('house', this.t('ribbon'), () => this.openHomepageManual());
    ribbon.addClass('xu-homepages-ribbon');
    ribbon.empty(); // 移除默认单色 Lucide 图标，换自定义渐变小房子
    ribbon.createSpan({ cls: 'xu-homepages-ribbon-icon' }).innerHTML = HOME_SVG;
    this.addSettingTab(new XuHomepagesSettingTab(this.app, this));

    // 命令名动态刷新：保存 addCommand 返回的命令对象引用，语言切换时更新 name（见 refreshCommandNames）
    this.xuLpCommands.open = this.addCommand({
      id: 'open',
      name: this.t('cmd_open'),
      callback: () => this.openHomepageManual(),
    });

    this.xuLpCommands.restore = this.addCommand({
      id: 'restore-session',
      name: this.t('cmd_restore_session'),
      callback: async () => {
        const ok = await this.restoreSession(false);
        if (!ok) new Notice(this.t('notice_session_empty'));
      },
    });

    // 新标签页打开主页（开关开启时监听 active-leaf-change：新空标签页 → 打开主页）
    this.patchNewTab();

    // 会话采集 + 主页文件同步：官方 load-time 指南，启动期事件注册放 onLayoutReady
    this.app.workspace.onLayoutReady(() => {
      this.registerEvent(
        this.app.workspace.on('layout-change', () => {
          if (this.sessionDebounceTimer) clearTimeout(this.sessionDebounceTimer);
          this.sessionDebounceTimer = setTimeout(() => {
            this.sessionDebounceTimer = null;
            this.captureSession().catch((e) => console.error(LOG_PREFIX, 'capture session failed', e));
          }, SESSION_DEBOUNCE_MS);
        })
      );
      // 启动布局多发生在注册之前，布局就绪后补一次初始快照
      this.sessionDebounceTimer = setTimeout(() => {
        this.sessionDebounceTimer = null;
        this.captureSession().catch((e) => console.error(LOG_PREFIX, 'capture session failed', e));
      }, SESSION_DEBOUNCE_MS);

      // 记忆卫生：主页文件被移动/删除时同步设置并提示（registerEvent 自动清理）
      this.registerEvent(
        this.app.vault.on('rename', (file, oldPath) => {
          if (!(file instanceof TFile) || oldPath !== this.settings.homepage) return;
          this.settings.homepage = file.path;
          this.saveSettings().catch((e) => console.error(LOG_PREFIX, 'save after rename failed', e));
          new Notice(this.t('notice_homepage_renamed').replace('%s', file.path));
        })
      );
      this.registerEvent(
        this.app.vault.on('delete', (file) => {
          if (!(file instanceof TFile) || file.path !== this.settings.homepage) return;
          this.settings.homepage = '';
          this.saveSettings().catch((e) => console.error(LOG_PREFIX, 'save after delete failed', e));
          new Notice(this.t('notice_homepage_deleted'));
        })
      );
    });

    if (this.isHomepageEnabled()) {
      console.warn(LOG_PREFIX, this.t('conflict_warning'));
    }
  }

  onunload() {
    if (this.sessionDebounceTimer) {
      clearTimeout(this.sessionDebounceTimer);
      this.sessionDebounceTimer = null;
    }
    try {
      // 卸载兜底：同步刷新会话快照到内存后立即落盘。onunload 无法 await，
      // saveData 的文件写入由存活的 Obsidian 进程完成；防抖已压至 300ms，崩溃丢失窗口极小。
      this.updateSessionCache();
      this.saveSettings().catch((e) => console.error(LOG_PREFIX, 'final save failed', e));
    } catch (e) {
      console.error(LOG_PREFIX, 'final session capture failed', e);
    }
    this.unpatchOpeningBehaviour();
    this.unpatchReleaseNotes();
  }

  async loadSettings() {
    const saved = (await this.loadData()) || {};
    // v1.x 多主页字段（profileMode/profiles/rules 等）直接忽略，不做迁移；
    // 唯一兼容读取：旧版单主页结构 singleHomepage.target（语义相同的一行兜底，避免升级后主页丢失）
    const legacyTarget = saved.singleHomepage && typeof saved.singleHomepage.target === 'string'
      ? saved.singleHomepage.target : '';
    this.settings = {
      language: typeof saved.language === 'string' ? saved.language : DEFAULT_SETTINGS.language,
      startupBehavior: saved.startupBehavior === 'restore-session' ? 'restore-session' : 'homepage',
      newTabHomepage: typeof saved.newTabHomepage === 'boolean' ? saved.newTabHomepage : DEFAULT_SETTINGS.newTabHomepage,
      homepage: typeof saved.homepage === 'string' && saved.homepage ? saved.homepage : legacyTarget,
      sessionCache: Array.isArray(saved.sessionCache) ? saved.sessionCache : [],
    };
  }

  async saveSettings() {
    // 落盘仲裁：写盘前先读磁盘做 union 合并——已知键以内存为准，
    // 磁盘上多出的未知新键拉入（防另一端写入的设置被整体覆盖），
    // v1.x 废弃键剔除（防旧 data.json 残留字段被合并回写）。
    let merged;
    try {
      const disk = (await this.loadData()) || {};
      merged = Object.assign({}, disk, this.settings);
    } catch (e) {
      console.warn(LOG_PREFIX, 'read disk settings for merge failed', e);
      merged = this.settings;
    }
    for (const k of DEPRECATED_KEYS) delete merged[k];
    this.settings = merged;
    await this.saveData(this.settings);
  }

  /* 语言切换后即时刷新命令面板中的命令名（命令对象引用可变，无需重注册） */
  refreshCommandNames() {
    if (this.xuLpCommands.open) this.xuLpCommands.open.name = this.t('cmd_open');
    if (this.xuLpCommands.restore) this.xuLpCommands.restore.name = this.t('cmd_restore_session');
  }

  /* ---------- 新标签页打开主页 ---------- */

  /* 监听 active-leaf-change：新出现的空标签页（标签栏「+」/ Ctrl+T）→ 打开主页。

     🔴 劫持判定（修复「关闭最后一个标签也被劫持成主页」）：
     1) 仅主区（rootSplit）leaf 且 view 为 empty 才是候选；侧栏空 leaf 不碰；
     2) layout-change 里检测主区 leaf 数量减少（用户关闭标签/合并分屏）→ 打开
        CLOSE_SUPPRESS_MS 抑制窗口。关键场景：关闭最后一个标签后 Obsidian 会
        补一个新的空 leaf 并激活，若不抑制，这个被动出现的空 leaf 会被误判为
        「新建标签」而弹出主页；
     3) active-leaf-change 与 layout-change 的先后顺序不保证，故劫持动作延迟
        REDIRECT_DELAY_MS 再决策，给 layout-change 到达并打开抑制窗口留时间；
     4) 已见 leaf 集合防重复处理与劫持循环；layout-change 顺带清理已 detach
        的 leaf，防集合持有已销毁对象。 */
  patchNewTab() {
    this.xuLpSeenEmptyLeaves = new Set();
    this.xuLpMainLeafCount = -1;
    this.xuLpSuppressUntil = 0;
    this.app.workspace.onLayoutReady(() => {
      for (const leaf of this.app.workspace.getLeavesOfType('empty')) {
        if (this.collectMainLeaves().includes(leaf)) this.xuLpSeenEmptyLeaves.add(leaf); // 存量空标签页不算「新出现」
      }
      this.xuLpMainLeafCount = this.collectMainLeaves().length;
      this.registerEvent(this.app.workspace.on('layout-change', () => this.noteLayoutChange()));
      this.registerEvent(this.app.workspace.on('active-leaf-change', (leaf) => this.handleNewTabLeaf(leaf)));
    });
  }

  noteLayoutChange() {
    const mainLeaves = this.collectMainLeaves();
    if (this.xuLpMainLeafCount >= 0 && mainLeaves.length < this.xuLpMainLeafCount) {
      // 主区 leaf 数量减少 = 关闭标签 / 合并分屏（含关闭最后一个标签的时序）
      this.xuLpSuppressUntil = Date.now() + CLOSE_SUPPRESS_MS;
    }
    this.xuLpMainLeafCount = mainLeaves.length;
    for (const leaf of this.xuLpSeenEmptyLeaves) {
      if (!mainLeaves.includes(leaf)) this.xuLpSeenEmptyLeaves.delete(leaf); // 清理已 detach 的 leaf
    }
  }

  handleNewTabLeaf(leaf) {
    if (!this.settings?.newTabHomepage || !this.settings?.homepage) return;
    if (!leaf || !leaf.view || leaf.view.getViewType() !== 'empty') return;
    if (!this.collectMainLeaves().includes(leaf)) return; // 侧栏空 leaf 不劫持
    if (this.xuLpSeenEmptyLeaves.has(leaf)) return;
    this.xuLpSeenEmptyLeaves.add(leaf); // 先标记防循环/防重复
    // 延迟决策：等 layout-change 先到（关闭标签会打开抑制窗口）再决定是否重定向
    setTimeout(() => {
      if (Date.now() < this.xuLpSuppressUntil) return; // 判定为关闭标签产生的被动空 leaf，放行不劫持
      if (!leaf.view || leaf.view.getViewType() !== 'empty') return; // 期间已被打开/关闭
      if (!this.collectMainLeaves().includes(leaf)) return;
      const target = this.settings.homepage;
      const file = this.app.vault.getAbstractFileByPath(target);
      if (!(file instanceof TFile)) {
        new Notice(this.t('err_file_not_found').replace('%s', target));
        return;
      }
      leaf.openFile(file).catch((e) => console.error(LOG_PREFIX, 'new-tab open homepage failed', e));
    }, REDIRECT_DELAY_MS);
  }

  /* ---------- 启动拦截（参考 homepage 的 runOpeningBehavior 重写） ---------- */

  patchOpeningBehaviour() {
    this.xuLpOrigRunOpeningBehavior = this.app.runOpeningBehavior;
    this.app.runOpeningBehavior = async (path) => {
      if (!this.startupHandled) {
        this.startupHandled = true;
        let handled = false;
        try {
          handled = await this.openStartup();
        } catch (e) {
          console.error(LOG_PREFIX, 'startup open failed', e);
        }
        if (handled) {
          // 已接管启动：不再调用原版，避免原生再打开上次文件/欢迎页
        } else {
          await this.xuLpOrigRunOpeningBehavior.call(this.app, path);
        }
        this.unpatchReleaseNotes();
        return;
      }
      await this.xuLpOrigRunOpeningBehavior.call(this.app, path);
    };
  }

  unpatchOpeningBehaviour() {
    if (this.xuLpOrigRunOpeningBehavior) {
      this.app.runOpeningBehavior = this.xuLpOrigRunOpeningBehavior;
      this.xuLpOrigRunOpeningBehavior = null;
    }
  }

  patchReleaseNotes() {
    if (typeof this.app.showReleaseNotes !== 'function') return;
    this.xuLpOrigShowReleaseNotes = this.app.showReleaseNotes;
    this.app.showReleaseNotes = () => {
      this.releaseNotesSkipped = true;
    };
  }

  unpatchReleaseNotes() {
    if (!this.xuLpOrigShowReleaseNotes) return;
    if (this.releaseNotesSkipped) this.xuLpOrigShowReleaseNotes.call(this.app);
    this.app.showReleaseNotes = this.xuLpOrigShowReleaseNotes;
    this.xuLpOrigShowReleaseNotes = null;
  }

  /* ---------- 启动决策流 ---------- */

  async openStartup() {
    if (!this.settings) return false; // 补丁先于设置加载时兜底
    if (this.hasUrlParams()) return false; // obsidian:// 带打开参数时不抢启动
    this.xuLpStartupLeaves = new Set(); // 记录本次启动打开的 leaf，供清屏保留
    if (this.settings.startupBehavior === 'restore-session') {
      const cached = (this.settings.sessionCache || []).filter(
        (p) => this.app.vault.getAbstractFileByPath(p) instanceof TFile
      );
      if (cached.length === 0) return false; // 无可恢复文件 → 交还原版，避免清屏后工作区全空
      await this.closeMainLeaves(null); // 先清空主区，避免与原生恢复的文件重复
      return await this.restoreSession(true);
    }
    if (this.settings.homepage) {
      const ok = await this.openHomepage();
      if (ok) await this.closeMainLeaves(this.xuLpStartupLeaves); // 只留主页，其余全关
      return ok;
    }
    return false; // 未配置 → 交还原版行为
  }

  /* 收集主区（rootSplit）所有 leaf，不触碰左右侧栏 */
  collectMainLeaves(node = this.app.workspace.rootSplit, out = []) {
    if (!node) return out;
    if (Array.isArray(node.children)) for (const c of node.children) this.collectMainLeaves(c, out);
    else out.push(node);
    return out;
  }

  /* 启动清屏：keep=null 全关；传 Set 时保留本次启动打开的主页 leaf */
  closeMainLeaves(keep) {
    const keepSet = keep instanceof Set ? keep : null;
    for (const leaf of this.collectMainLeaves()) {
      if (keepSet && keepSet.has(leaf)) continue;
      try {
        if (leaf.getViewState && leaf.getViewState().pinned) leaf.setPinned(false);
        leaf.detach();
      } catch (e) {
        console.warn(LOG_PREFIX, 'skip closing leaf', e);
      }
    }
  }

  hasUrlParams() {
    try {
      const act = window.OBS_ACT;
      if (!act) return false;
      if (!['open', 'advanced-uri'].includes(act.action)) return false;
      return ['file', 'filepath', 'workspace'].some((k) => k in act);
    } catch (e) {
      return false;
    }
  }

  /* ---------- 主页打开 / 会话恢复 ---------- */

  async openHomepageManual() {
    if (!this.settings.homepage) {
      new Notice(this.t('err_homepage_not_set'));
      return;
    }
    await this.openHomepage();
  }

  /* 打开单一主页：替换当前标签（getLeaf(false) 无 window/split，移动端安全）；
     启动调用时把 leaf 记入 xuLpStartupLeaves 供清屏保留 */
  async openHomepage() {
    const target = this.settings.homepage;
    if (!target) return false;
    const file = this.app.vault.getAbstractFileByPath(target);
    if (!(file instanceof TFile)) {
      new Notice(this.t('err_file_not_found').replace('%s', target));
      return false;
    }
    const leaf = this.app.workspace.getLeaf(false);
    await leaf.openFile(file);
    if (this.xuLpStartupLeaves) this.xuLpStartupLeaves.add(leaf);
    return true;
  }

  async restoreSession(quiet = true) {
    const paths = this.settings.sessionCache || [];
    let opened = 0;
    for (const path of paths) {
      const af = this.app.vault.getAbstractFileByPath(path);
      if (!(af instanceof TFile)) continue;
      try {
        const leaf = this.app.workspace.getLeaf(opened === 0 ? false : 'tab');
        await leaf.openFile(af);
        opened++;
      } catch (e) {
        console.error(LOG_PREFIX, 'restore failed', path, e);
      }
    }
    if (!quiet && opened > 0) {
      new Notice(this.t('notice_session_restored').replace('%d', String(opened)));
    }
    return opened > 0;
  }

  /* 同步刷新内存中的会话快照，返回是否有变化 */
  updateSessionCache() {
    if (!this.app.workspace) return false;
    const paths = [];
    for (const leaf of this.collectMainLeaves()) { // 仅主区：侧栏文件不进会话缓存
      const view = leaf.view;
      if (view && typeof view.getViewType === 'function' && view.getViewType() === 'markdown' && view.file) {
        if (!paths.includes(view.file.path)) paths.push(view.file.path);
      }
    }
    if (JSON.stringify(paths) !== JSON.stringify(this.settings.sessionCache || [])) {
      this.settings.sessionCache = paths;
      return true;
    }
    return false;
  }

  async captureSession() {
    if (this.updateSessionCache()) {
      await this.saveSettings(); // 有变化才落盘（union 合并见 saveSettings）
    }
  }

  isHomepageEnabled() {
    try {
      return !!(this.app.plugins && this.app.plugins.enabledPlugins && this.app.plugins.enabledPlugins.has('homepage'));
    } catch (e) {
      return false;
    }
  }
}

/* ---------------- 设置页 ---------------- */

class XuHomepagesSettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  t(key) {
    return this.plugin.t(key);
  }

  display() {
    const { containerEl } = this;
    const plugin = this.plugin;
    containerEl.empty();
    // 标准头（官方要求 setHeading，禁止直接创建 h2/h3）
    new Setting(containerEl).setName(this.t('setting_title')).setHeading();
    containerEl.createDiv({ cls: 'xu-homepages-hint', text: this.t('setting_header_desc') });

    // 语言切换器必须放最顶部
    new Setting(containerEl)
      .setName(this.t('setting_language'))
      .setDesc(this.t('setting_language_desc'))
      .addDropdown((dd) =>
        dd.addOption('zh', '中文')
          .addOption('en', 'English')
          .setValue(plugin.settings.language)
          .onChange(async (v) => {
            plugin.settings.language = v;
            await plugin.saveSettings();
            plugin.refreshCommandNames(); // 命令面板中的命令名随语言即时刷新
            this.display();
          }));

    // 主页文件（文本 + 浏览选择）
    new Setting(containerEl)
      .setName(this.t('setting_homepage'))
      .setDesc(this.t('setting_homepage_desc'))
      .addText((text) => {
        text.setPlaceholder(this.t('homepage_ph')).setValue(plugin.settings.homepage || '');
        text.inputEl.addEventListener('change', async () => {
          plugin.settings.homepage = text.inputEl.value.trim();
          await plugin.saveSettings();
        });
        return text;
      })
      .addButton((btn) =>
        btn.setIcon('file-search').setTooltip(this.t('btn_browse')).onClick(() => {
          new FilePickModal(this.app, plugin, async (path) => {
            plugin.settings.homepage = path;
            await plugin.saveSettings();
            this.display();
          }).open();
        }));

    // 启动行为：打开主页（默认）/ 恢复上次会话，二选一
    new Setting(containerEl)
      .setName(this.t('setting_behavior'))
      .setDesc(this.t('setting_behavior_desc'))
      .addDropdown((dd) =>
        dd.addOption('homepage', this.t('behavior_homepage'))
          .addOption('restore-session', this.t('behavior_restore'))
          .setValue(plugin.settings.startupBehavior === 'restore-session' ? 'restore-session' : 'homepage')
          .onChange(async (v) => {
            plugin.settings.startupBehavior = v;
            await plugin.saveSettings();
          }));

    // 新标签页打开主页（默认开，开启后「+」/Ctrl+T 打开主页，关闭标签不受影响）
    new Setting(containerEl)
      .setName(this.t('setting_new_tab'))
      .setDesc(this.t('setting_new_tab_desc'))
      .addToggle((tg) =>
        tg.setValue(!!plugin.settings.newTabHomepage)
          .onChange(async (v) => {
            plugin.settings.newTabHomepage = v;
            await plugin.saveSettings();
          }));

    // 与 Homepage 插件共存提示
    if (plugin.isHomepageEnabled()) {
      const warn = containerEl.createDiv('xu-homepages-warning');
      warn.createDiv({ cls: 'xu-homepages-warning-title', text: this.t('conflict_warning_title') });
      warn.createDiv({ cls: 'xu-homepages-warning-body', text: this.t('conflict_warning') });
    }

    // ===== GitHub 使用文档（与其他插件统一格式）=====
    containerEl.createEl('hr', { cls: 'xu-homepages-divider' });
    new Setting(containerEl)
      .setName(this.t('setting_docs'))
      .setDesc(this.t('setting_docs_desc'))
      .addButton((btn) =>
        btn.setButtonText(this.t('btn_github')).onClick(() => {
          window.open(REPO_URL, '_blank');
        }));
  }
}

module.exports = XuHomepages;
