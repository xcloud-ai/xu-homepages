/* XU Homepages — 启动台：启动行为接管插件（单主页/组合主页/条件路由/会话恢复） */
'use strict';

const { Plugin, PluginSettingTab, Setting, Notice, TFile, FuzzySuggestModal } = require('obsidian');

const PLUGIN_ID = 'xu-homepages';
const LOG_PREFIX = '[' + PLUGIN_ID + ']';
const ALLOWED_MODES = ['replace', 'tab', 'split', 'window'];
const ALLOWED_POSITIONS = ['main', 'left', 'right'];
const SESSION_DEBOUNCE_MS = 3000;
const REPO_URL = 'https://github.com/xu-obsidian-plugin/xu-homepages';
/* 彩色主页图标（渐变描边小房子），用于 ribbon；Obsidian 内置 Lucide 图标为单色 */
const HOME_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="xu-homepages-svg">'
  + '<defs><linearGradient id="xu-homepages-grad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">'
  + '<stop offset="0" stop-color="#4f8cff"/><stop offset="1" stop-color="#ff9f43"/></linearGradient></defs>'
  + '<g stroke="url(#xu-homepages-grad)">'
  + '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/>'
  + '<path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>'
  + '</g></svg>';

/* ---------------- i18n ---------------- */

const I18N = {
  zh: {
    cmd_open: '启动台：打开主页',
    cmd_open_profile: '启动台：打开指定组合…',
    cmd_restore_session: '启动台：恢复上次会话',
    ribbon: '启动台',

    setting_language: '界面语言',
    setting_language_desc: '切换中文 / English',
    setting_restore_session: '恢复上次关闭的所有文件',
    setting_restore_session_desc: '开启后，启动时重新打开上次关闭的全部文件（优先于主页）；默认关闭',
    setting_new_tab: '新标签页打开主页',
    setting_new_tab_desc: '开启后，点击标签栏「+」或 Ctrl+T 新建标签页时，直接打开主页（单主页；未配置则用默认组合第一项）；默认关闭',
    section_single: '单主页',
    single_enable: '开启单主页',
    single_enable_desc: '启动时只打开这一个主页文件',
    single_target: '主页文件',
    section_profile: '组合主页',
    profile_enable: '开启组合主页',
    profile_enable_desc: '启动时按下方规则路由打开一组笔记（与单主页互斥）',
    notice_mutual_single: '组合主页已开启，单主页已自动关闭：只能开单主页或组合主页',
    notice_mutual_profile: '单主页已开启，组合主页已自动关闭：只能开单主页或组合主页',
    profile_usage_hint: '组合主页用法：在「启动组合」里添加笔记并把常用组合设为默认；再在「条件规则」里按星期/时间段绑定组合（自上而下取第一条命中的规则，未命中打开默认组合，时间与规则联动）。详见 ',
    err_single_not_set: '请先在设置中选择单主页文件',
    err_no_mode: '请先在设置中开启单主页或组合主页',

    conflict_warning_title: '⚠️ 检测到 Homepage 插件已启用',
    conflict_warning: 'Homepage 插件同样接管启动行为，两者可能互相覆盖。建议只保留其中一个启动接管插件。',

    section_profiles: '启动组合',
    section_profiles_desc: '启动或手动触发时按顺序打开的一组笔记。规则未命中时打开默认组合。',
    btn_add_profile: '新建组合',
    btn_add_item: '添加笔记',
    btn_browse: '浏览',
    profile_name: '组合名称',
    profile_name_ph: '如：工作日工作台',
    profile_default: '默认组合',
    profile_default_desc: '开启后作为默认组合（规则未命中时打开）',
    profile_unnamed: '未命名组合',
    item_target: '笔记',
    item_target_ph: 'vault 内路径，如 Daily/2026-09-08.md',
    mode_replace: '替换当前页',
    mode_tab: '新标签页',
    mode_split: '分屏',
    mode_window: '独立窗口',
    pos_main: '主区',
    pos_left: '左侧栏',
    pos_right: '右侧栏',

    section_rules: '条件规则',
    section_rules_desc: '自上而下取第一条命中的规则，把启动路由到对应组合。不选星期 = 每天命中；时间段格式 HH:mm，结束早于开始表示跨夜。',
    btn_add_rule: '新建规则',
    rule_weekdays: '星期',
    rule_weekdays_hint: '不选 = 每天',
    rule_time: '时间段',
    rule_time_desc: '格式 HH:mm，留空表示不限',
    rule_profile: '命中时打开',
    rule_profile_none: '（未选择）',

    tip_usage: '<b>使用方法</b><br>1. 开启「单主页」并选择主页文件，或开启「组合主页」（两者互斥）<br>2. 组合主页：新建组合 → 添加笔记 → 设默认；条件规则按星期/时间段联动路由<br>3. 「恢复上次关闭的所有文件」开启后启动时优先恢复会话<br>4. Ctrl+P 搜索「启动台」手动打开主页 / 恢复会话',

    err_file_not_found: '文件不存在：%s',
    err_no_profile: '没有可打开的组合，请先在设置中创建',
    err_need_profile: '请先创建启动组合',
    err_need_default: '请先将某个组合设为默认组合',
    notice_session_empty: '没有可恢复的会话记录',
    notice_session_restored: '已恢复上次会话（%d 个文件）',
    notice_profile_opened: '已打开组合：%s',
    modal_pick_profile: '选择要打开的组合',
    modal_pick_file: '选择笔记文件',
    delete: '删除',
  },
  en: {
    cmd_open: 'Launchpad: open homepage',
    cmd_open_profile: 'Launchpad: open a profile…',
    cmd_restore_session: 'Launchpad: restore last session',
    ribbon: 'Launchpad',

    setting_language: 'Language',
    setting_language_desc: 'Switch Chinese / English',
    setting_restore_session: 'Restore all files closed last time',
    setting_restore_session_desc: 'When enabled, reopen all files from the last session on startup (takes priority over homepages); off by default',
    setting_new_tab: 'New tab opens homepage',
    setting_new_tab_desc: 'When enabled, clicking the "+" button or pressing Ctrl+T opens the homepage (single homepage; fallback: first item of the default profile); off by default',
    section_single: 'Single homepage',
    single_enable: 'Enable single homepage',
    single_enable_desc: 'Open only this note on startup',
    single_target: 'Homepage note',
    section_profile: 'Profile homepages',
    profile_enable: 'Enable profile homepages',
    profile_enable_desc: 'Open a set of notes on startup via the rules below (mutually exclusive with single homepage)',
    notice_mutual_single: 'Profile homepages enabled — single homepage turned off (only one can be active)',
    notice_mutual_profile: 'Single homepage enabled — profile homepages turned off (only one can be active)',
    profile_usage_hint: 'How to use: add notes to a profile below and mark one as default; then bind profiles to rules by weekday/time range (top-down, first match wins; falls back to the default profile). See ',
    err_single_not_set: 'Pick a homepage note in settings first',
    err_no_mode: 'Enable single homepage or profile homepages in settings first',

    conflict_warning_title: '⚠️ Homepage plugin detected',
    conflict_warning: 'The Homepage plugin also takes over startup behavior and may conflict with this plugin. Keep only one startup plugin enabled.',

    section_profiles: 'Startup profiles',
    section_profiles_desc: 'A list of notes opened in order on startup or manual trigger. The default profile is used when no rule matches.',
    btn_add_profile: 'New profile',
    btn_add_item: 'Add note',
    btn_browse: 'Browse',
    profile_name: 'Profile name',
    profile_name_ph: 'e.g. Workday dashboard',
    profile_default: 'Default profile',
    profile_default_desc: 'Use as default profile (opened when no rule matches)',
    profile_unnamed: 'Untitled profile',
    item_target: 'Note',
    item_target_ph: 'vault path, e.g. Daily/2026-09-08.md',
    mode_replace: 'Replace current',
    mode_tab: 'New tab',
    mode_split: 'Split',
    mode_window: 'Window',
    pos_main: 'Main area',
    pos_left: 'Left sidebar',
    pos_right: 'Right sidebar',

    section_rules: 'Condition rules',
    section_rules_desc: 'Rules are evaluated top-down; the first match routes startup to its profile. No weekday selected = every day. Time format HH:mm; end before start means overnight.',
    btn_add_rule: 'New rule',
    rule_weekdays: 'Weekdays',
    rule_weekdays_hint: 'none = every day',
    rule_time: 'Time range',
    rule_time_desc: 'Format HH:mm, empty means any time',
    rule_profile: 'Open profile',
    rule_profile_none: '(none)',

    tip_usage: '<b>Usage</b><br>1. Enable "Single homepage" and pick a note, or enable "Profile homepages" (mutually exclusive)<br>2. Profiles: create one, add notes, mark default; rules route by weekday/time<br>3. "Restore last session" takes priority over homepages when enabled<br>4. Ctrl+P and search "Launchpad" to open homepage / restore session',

    err_file_not_found: 'File not found: %s',
    err_no_profile: 'No profile available. Create one in settings first.',
    err_need_profile: 'Create a startup profile first',
    err_need_default: 'Set one profile as default first',
    notice_session_empty: 'No session to restore',
    notice_session_restored: 'Last session restored (%d files)',
    notice_profile_opened: 'Profile opened: %s',
    modal_pick_profile: 'Choose a profile to open',
    modal_pick_file: 'Choose a note',
    delete: 'Delete',
  },
};

const WEEKDAY_LABELS = {
  zh: ['一', '二', '三', '四', '五', '六', '日'],
  en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
};

/* ---------------- 默认设置 ---------------- */
/* restoreLastSession: 启动时恢复上次关闭的所有文件（默认关，开启后优先于主页）
   newTabHomepage: 点击「+」/ Ctrl+T 新建标签页时打开主页（默认关）
   singleHomepage: 单主页 { enabled, target, mode }，与组合主页互斥
   profileMode: 组合主页开关 { enabled }
   profiles: [{ id, name, items: [{ target, mode, position }], isDefault }]
   rules: [{ id, condition: { weekdays: [1-7], timeStart, timeEnd }, profileId }]
   sessionCache: 上次会话打开的 markdown 路径列表 */
const DEFAULT_SETTINGS = {
  language: 'zh',
  restoreLastSession: false,
  newTabHomepage: false,
  singleHomepage: { enabled: true, target: '', mode: 'replace' },
  profileMode: { enabled: false },
  profiles: [],
  rules: [],
  sessionCache: [],
};

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function parseTimeToMinutes(str) {
  if (!str) return null;
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(str).trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}

function arrayRemove(arr, item) {
  const idx = arr.indexOf(item);
  if (idx >= 0) arr.splice(idx, 1);
}

/* ---------------- Modal ---------------- */

class FilePickModal extends FuzzySuggestModal {
  constructor(app, plugin, onPick) {
    super(app);
    this.plugin = plugin;
    this.onPick = onPick;
    this.setPlaceholder(plugin.t('modal_pick_file'));
  }

  getItems() {
    return this.app.vault.getMarkdownFiles();
  }

  getItemText(file) {
    return file.path;
  }

  onChooseItem(file) {
    this.onPick(file.path);
  }
}

class ProfilePickModal extends FuzzySuggestModal {
  constructor(app, plugin, onPick) {
    super(app);
    this.plugin = plugin;
    this.onPick = onPick;
    this.setPlaceholder(plugin.t('modal_pick_profile'));
  }

  getItems() {
    return this.plugin.settings.profiles;
  }

  getItemText(profile) {
    return profile.name || profile.id;
  }

  onChooseItem(profile) {
    this.onPick(profile);
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

    this.addCommand({
      id: 'open',
      name: this.t('cmd_open'),
      callback: () => this.openHomepageManual(),
    });

    this.addCommand({
      id: 'open-profile',
      name: this.t('cmd_open_profile'),
      callback: () => {
        if (this.settings.profiles.length === 0) {
          new Notice(this.t('err_no_profile'));
          return;
        }
        new ProfilePickModal(this.app, this, (profile) => this.openProfile(profile, false)).open();
      },
    });

    this.addCommand({
      id: 'restore-session',
      name: this.t('cmd_restore_session'),
      callback: async () => {
        const ok = await this.restoreSession(false);
        if (!ok) new Notice(this.t('notice_session_empty'));
      },
    });

    // 新标签页打开主页（开关开启时监听 active-leaf-change：新空标签页 → 打开主页）
    this.patchNewTab();

    // 会话采集：layout-change 防抖记录当前打开的 markdown 文件
    // 官方 load-time 指南：启动期事件注册放 onLayoutReady，不参与启动事件风暴
    this.app.workspace.onLayoutReady(() => {
      this.registerEvent(
        this.app.workspace.on('layout-change', () => {
          if (this.sessionDebounceTimer) clearTimeout(this.sessionDebounceTimer);
          this.sessionDebounceTimer = setTimeout(() => {
            this.sessionDebounceTimer = null;
            this.captureSession();
          }, SESSION_DEBOUNCE_MS);
        })
      );
      // 启动布局（含组合打开）多发生在注册之前，布局就绪后补一次初始快照
      this.sessionDebounceTimer = setTimeout(() => {
        this.sessionDebounceTimer = null;
        this.captureSession();
      }, SESSION_DEBOUNCE_MS);
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
      this.captureSession(); // onunload 兜底落盘（覆盖崩溃前的最后状态）
    } catch (e) {
      console.error(LOG_PREFIX, 'final session capture failed', e);
    }
    this.unpatchOpeningBehaviour();
    this.unpatchReleaseNotes();
  }

  async loadSettings() {
    const data = await this.loadData();
    this.settings = Object.assign({}, DEFAULT_SETTINGS, data || {});
    this.settings.singleHomepage = Object.assign({}, DEFAULT_SETTINGS.singleHomepage, this.settings.singleHomepage || {});
    this.settings.profileMode = Object.assign({}, DEFAULT_SETTINGS.profileMode, this.settings.profileMode || {});
    if (!Array.isArray(this.settings.profiles)) this.settings.profiles = [];
    if (!Array.isArray(this.settings.rules)) this.settings.rules = [];
    if (!Array.isArray(this.settings.sessionCache)) this.settings.sessionCache = [];
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  /* ---------- 新标签页打开主页 ---------- */

  /* 监听 active-leaf-change：新出现的空标签页（+/Ctrl+T/命令面板通用）→ 打开主页。
     用已见 leaf 集合防重复；registerEvent 自动清理，无需手动 unpatch */
  patchNewTab() {
    this.xuLpSeenEmptyLeaves = new Set();
    this.app.workspace.onLayoutReady(() => {
      for (const leaf of this.app.workspace.getLeavesOfType('empty')) {
        this.xuLpSeenEmptyLeaves.add(leaf); // 存量空标签页不算「新出现」
      }
      this.registerEvent(
        this.app.workspace.on('active-leaf-change', (leaf) => {
          this.handleNewTabLeaf(leaf);
        })
      );
    });
  }

  handleNewTabLeaf(leaf) {
    if (!this.settings?.newTabHomepage) return;
    if (!leaf || !leaf.view || leaf.view.getViewType() !== 'empty') return;
    if (this.xuLpSeenEmptyLeaves.has(leaf)) return;
    this.xuLpSeenEmptyLeaves.add(leaf); // 先标记防循环
    const target = this.getNewTabTarget();
    if (!target) return;
    const file = this.app.vault.getAbstractFileByPath(target);
    if (!(file instanceof TFile)) {
      new Notice(this.t('err_file_not_found').replace('%s', target));
      return;
    }
    leaf.openFile(file).catch((e) => console.error(LOG_PREFIX, 'new-tab open homepage failed', e));
  }

  /* 新标签页的目标：单主页优先，未配置时回退默认组合第一项 */
  getNewTabTarget() {
    const s = this.settings;
    if (!s) return null;
    if (s.singleHomepage?.enabled && s.singleHomepage.target) return s.singleHomepage.target;
    if (s.profileMode?.enabled) {
      const profiles = Array.isArray(s.profiles) ? s.profiles : [];
      const def = profiles.find((p) => p.isDefault) || profiles[0];
      const item = (def?.items || []).find((it) => it.target);
      return item ? item.target : null;
    }
    return null;
  }

  /* ---------- 启动拦截（抄 homepage 的 runOpeningBehavior 重写） ---------- */

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
          this.openedStartupLayout = true;
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
    if (this.settings.restoreLastSession) {
      return await this.restoreSession(true);
    }
    const single = this.settings.singleHomepage;
    if (single && single.enabled && single.target) {
      return await this.openSingle(true);
    }
    if (this.settings.profileMode && this.settings.profileMode.enabled) {
      const profile = this.resolveProfile();
      if (profile) return await this.openProfile(profile, true);
    }
    return false; // 未配置 → 交还原版行为
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

  /* ---------- 条件路由引擎 ---------- */

  resolveProfile() {
    const ruleProfileId = this.matchRule();
    if (ruleProfileId) {
      const hit = this.settings.profiles.find((p) => p.id === ruleProfileId);
      if (hit) return hit;
    }
    return this.settings.profiles.find((p) => p.isDefault) || null;
  }

  matchRule() {
    const now = new Date();
    const day = now.getDay() === 0 ? 7 : now.getDay(); // 1=周一 … 7=周日
    const minutes = now.getHours() * 60 + now.getMinutes();

    for (const rule of this.settings.rules) {
      const cond = rule.condition || {};
      if (!rule.profileId) continue; // 未绑定组合的规则跳过
      const weekdays = Array.isArray(cond.weekdays) ? cond.weekdays : [];
      if (weekdays.length > 0 && !weekdays.includes(day)) continue;
      const start = parseTimeToMinutes(cond.timeStart);
      const end = parseTimeToMinutes(cond.timeEnd);
      if (start !== null && end !== null) {
        const inRange = start <= end
          ? minutes >= start && minutes <= end
          : minutes >= start || minutes <= end; // 跨夜
        if (!inRange) continue;
      }
      return rule.profileId;
    }
    return null;
  }

  /* ---------- 主页打开 / 会话恢复 ---------- */

  async openHomepageManual() {
    const s = this.settings;
    if (s.singleHomepage && s.singleHomepage.enabled) {
      if (!s.singleHomepage.target) {
        new Notice(this.t('err_single_not_set'));
        return;
      }
      await this.openSingle(false);
      return;
    }
    if (s.profileMode && s.profileMode.enabled) {
      const profile = this.resolveProfile();
      if (profile) {
        await this.openProfile(profile, false);
        return;
      }
      if (s.profiles.length === 0) new Notice(this.t('err_no_profile'));
      else new Notice(this.t('err_need_default'));
      return;
    }
    new Notice(this.t('err_no_mode'));
  }

  async openSingle(quiet = true) {
    const cfg = this.settings.singleHomepage || {};
    if (!cfg.target) return false;
    return await this.openItem({ target: cfg.target, mode: cfg.mode || 'replace', position: 'main' });
  }

  async openProfile(profile, quiet = true) {
    let opened = 0;
    const items = profile.items || [];
    for (const item of items) {
      try {
        if (await this.openItem(item)) opened++;
      } catch (e) {
        console.error(LOG_PREFIX, 'open item failed', item, e);
      }
    }
    if (!quiet && opened > 0) {
      new Notice(this.t('notice_profile_opened').replace('%s', profile.name || profile.id));
    }
    return opened > 0;
  }

  async openItem(item) {
    const af = this.app.vault.getAbstractFileByPath(item.target);
    if (!(af instanceof TFile)) {
      new Notice(this.t('err_file_not_found').replace('%s', item.target || ''));
      return false;
    }
    let leaf;
    if (item.position === 'left') {
      leaf = this.app.workspace.getLeftLeaf(true);
    } else if (item.position === 'right') {
      leaf = this.app.workspace.getRightLeaf(true);
    } else {
      const mode = ALLOWED_MODES.includes(item.mode) ? item.mode : 'tab';
      leaf = this.app.workspace.getLeaf(mode === 'replace' ? false : mode);
    }
    await leaf.openFile(af);
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

  captureSession() {
    if (!this.app.workspace) return;
    const paths = [];
    this.app.workspace.iterateAllLeaves((leaf) => {
      const view = leaf.view;
      if (view && typeof view.getViewType === 'function' && view.getViewType() === 'markdown' && view.file) {
        if (!paths.includes(view.file.path)) paths.push(view.file.path);
      }
    });
    if (JSON.stringify(paths) !== JSON.stringify(this.settings.sessionCache || [])) {
      this.settings.sessionCache = paths;
      void this.saveSettings();
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
    containerEl.createEl('h2', { text: 'XU Homepages 启动台' });

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
            this.display();
          }));

    // 恢复上次关闭的所有文件（默认关，开启后优先于主页）
    new Setting(containerEl)
      .setName(this.t('setting_restore_session'))
      .setDesc(this.t('setting_restore_session_desc'))
      .addToggle((tg) =>
        tg.setValue(!!plugin.settings.restoreLastSession)
          .onChange(async (v) => {
            plugin.settings.restoreLastSession = v;
            await plugin.saveSettings();
          }));

    // 新标签页打开主页（默认关，开启后「+」/Ctrl+T 打开主页）
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

    // ===== 单主页 =====
    containerEl.createEl('h3', { text: this.t('section_single') });
    new Setting(containerEl)
      .setName(this.t('single_enable'))
      .setDesc(this.t('single_enable_desc'))
      .addToggle((tg) =>
        tg.setValue(!!plugin.settings.singleHomepage.enabled)
          .onChange(async (v) => {
            if (v && plugin.settings.profileMode.enabled) {
              plugin.settings.profileMode.enabled = false;
              new Notice(this.t('notice_mutual_profile'));
            }
            plugin.settings.singleHomepage.enabled = v;
            await plugin.saveSettings();
            this.display();
          }));
    new Setting(containerEl)
      .setName(this.t('single_target'))
      .addText((text) => {
        text.setPlaceholder(this.t('item_target_ph')).setValue(plugin.settings.singleHomepage.target || '');
        text.inputEl.addEventListener('change', async () => {
          plugin.settings.singleHomepage.target = text.inputEl.value.trim();
          await plugin.saveSettings();
        });
        return text;
      })
      .addButton((btn) =>
        btn.setIcon('file-search').setTooltip(this.t('btn_browse')).onClick(() => {
          new FilePickModal(this.app, plugin, async (path) => {
            plugin.settings.singleHomepage.target = path;
            await plugin.saveSettings();
            this.display();
          }).open();
        }))
      .addDropdown((dd) =>
        dd.addOption('replace', this.t('mode_replace'))
          .addOption('tab', this.t('mode_tab'))
          .addOption('split', this.t('mode_split'))
          .addOption('window', this.t('mode_window'))
          .setValue(ALLOWED_MODES.includes(plugin.settings.singleHomepage.mode) ? plugin.settings.singleHomepage.mode : 'replace')
          .onChange(async (v) => {
            plugin.settings.singleHomepage.mode = v;
            await plugin.saveSettings();
          }));

    // ===== 组合主页 =====
    containerEl.createEl('h3', { text: this.t('section_profile') });
    const usage = containerEl.createDiv('xu-homepages-hint');
    usage.createSpan({ text: this.t('profile_usage_hint') });
    usage.createEl('a', { text: REPO_URL, href: REPO_URL });
    new Setting(containerEl)
      .setName(this.t('profile_enable'))
      .setDesc(this.t('profile_enable_desc'))
      .addToggle((tg) =>
        tg.setValue(!!plugin.settings.profileMode.enabled)
          .onChange(async (v) => {
            if (v && plugin.settings.singleHomepage.enabled) {
              plugin.settings.singleHomepage.enabled = false;
              new Notice(this.t('notice_mutual_single'));
            }
            plugin.settings.profileMode.enabled = v;
            await plugin.saveSettings();
            this.display();
          }));

    // ===== 启动组合 =====
    containerEl.createEl('h3', { text: this.t('section_profiles') });
    const profilesDesc = containerEl.createDiv('setting-item-description');
    profilesDesc.setText(this.t('section_profiles_desc'));

    for (const profile of plugin.settings.profiles) {
      this.renderProfile(containerEl, profile);
    }

    new Setting(containerEl).addButton((btn) =>
      btn.setButtonText(this.t('btn_add_profile')).setCta().onClick(async () => {
        plugin.settings.profiles.push({
          id: uid(),
          name: this.t('profile_unnamed') + ' ' + (plugin.settings.profiles.length + 1),
          items: [],
          isDefault: plugin.settings.profiles.length === 0, // 首个组合自动设为默认
        });
        await plugin.saveSettings();
        this.display();
      }));

    // ===== 条件规则 =====
    containerEl.createEl('h3', { text: this.t('section_rules') });
    const rulesDesc = containerEl.createDiv('setting-item-description');
    rulesDesc.setText(this.t('section_rules_desc'));

    for (const rule of plugin.settings.rules) {
      this.renderRule(containerEl, rule);
    }

    new Setting(containerEl).addButton((btn) =>
      btn.setButtonText(this.t('btn_add_rule')).setCta().onClick(async () => {
        if (plugin.settings.profiles.length === 0) {
          new Notice(this.t('err_need_profile'));
          return;
        }
        plugin.settings.rules.push({
          id: uid(),
          condition: { weekdays: [], timeStart: '', timeEnd: '' },
          profileId: '',
        });
        await plugin.saveSettings();
        this.display();
      }));

    const tip = containerEl.createEl('div');
    tip.addClass('xu-homepages-hint');
    tip.innerHTML = this.t('tip_usage');
  }

  renderProfile(containerEl, profile) {
    const plugin = this.plugin;
    if (!Array.isArray(profile.items)) profile.items = [];
    const card = containerEl.createDiv('xu-homepages-card');

    new Setting(card)
      .setName(this.t('profile_name'))
      .setDesc(this.t('profile_default_desc'))
      .addText((text) =>
        text.setPlaceholder(this.t('profile_name_ph'))
          .setValue(profile.name || '')
          .onChange(async (v) => {
            profile.name = v;
            await plugin.saveSettings();
          }))
      .addToggle((tg) =>
        tg.setTooltip(this.t('profile_default'))
          .setValue(!!profile.isDefault)
          .onChange(async (v) => {
            if (v) plugin.settings.profiles.forEach((p) => { p.isDefault = false; });
            profile.isDefault = v;
            await plugin.saveSettings();
            this.display();
          }))
      .addButton((btn) =>
        btn.setIcon('trash-2').setTooltip(this.t('delete')).onClick(async () => {
          arrayRemove(plugin.settings.profiles, profile);
          await plugin.saveSettings();
          this.display();
        }));

    profile.items.forEach((item, index) => {
      new Setting(card)
        .setName(this.t('item_target') + ' ' + (index + 1))
        .addText((text) => {
          text.setPlaceholder(this.t('item_target_ph')).setValue(item.target || '');
          text.inputEl.addEventListener('change', async () => {
            item.target = text.inputEl.value.trim();
            await plugin.saveSettings();
          });
          return text;
        })
        .addButton((btn) =>
          btn.setIcon('file-search').setTooltip(this.t('btn_browse')).onClick(() => {
            new FilePickModal(this.app, plugin, async (path) => {
              item.target = path;
              await plugin.saveSettings();
              this.display();
            }).open();
          }))
        .addDropdown((dd) =>
          dd.addOption('replace', this.t('mode_replace'))
            .addOption('tab', this.t('mode_tab'))
            .addOption('split', this.t('mode_split'))
            .addOption('window', this.t('mode_window'))
            .setValue(ALLOWED_MODES.includes(item.mode) ? item.mode : 'tab')
            .onChange(async (v) => {
              item.mode = v;
              await plugin.saveSettings();
            }))
        .addDropdown((dd) =>
          dd.addOption('main', this.t('pos_main'))
            .addOption('left', this.t('pos_left'))
            .addOption('right', this.t('pos_right'))
            .setValue(ALLOWED_POSITIONS.includes(item.position) ? item.position : 'main')
            .onChange(async (v) => {
              item.position = v;
              await plugin.saveSettings();
            }))
        .addButton((btn) =>
          btn.setIcon('trash-2').setTooltip(this.t('delete')).onClick(async () => {
            arrayRemove(profile.items, item);
            await plugin.saveSettings();
            this.display();
          }));
    });

    new Setting(card).addButton((btn) =>
      btn.setButtonText(this.t('btn_add_item')).onClick(async () => {
        profile.items.push({ target: '', mode: 'tab', position: 'main' });
        await plugin.saveSettings();
        this.display();
      }));
  }

  renderRule(containerEl, rule) {
    const plugin = this.plugin;
    if (!rule.condition) rule.condition = { weekdays: [], timeStart: '', timeEnd: '' };
    if (!Array.isArray(rule.condition.weekdays)) rule.condition.weekdays = [];
    const cond = rule.condition;
    const card = containerEl.createDiv('xu-homepages-card');

    // 星期多选 chips（不选 = 每天）
    const daysRow = card.createDiv('xu-homepages-weekdays');
    daysRow.createSpan({ cls: 'xu-homepages-weekdays-label', text: this.t('rule_weekdays') });
    const labels = WEEKDAY_LABELS[plugin.settings.language] || WEEKDAY_LABELS.zh;
    for (let day = 1; day <= 7; day++) {
      const chip = daysRow.createEl('button', { cls: 'xu-homepages-day-chip', text: labels[day - 1] });
      chip.setAttribute('type', 'button');
      if (cond.weekdays.includes(day)) chip.addClass('is-active');
      chip.addEventListener('click', async () => {
        if (cond.weekdays.includes(day)) arrayRemove(cond.weekdays, day);
        else cond.weekdays.push(day);
        cond.weekdays.sort((a, b) => a - b);
        chip.toggleClass('is-active', cond.weekdays.includes(day));
        await plugin.saveSettings();
      });
    }
    daysRow.createSpan({ cls: 'xu-homepages-hint', text: this.t('rule_weekdays_hint') });

    // 时间段
    new Setting(card)
      .setName(this.t('rule_time'))
      .setDesc(this.t('rule_time_desc'))
      .addText((text) => {
        text.setPlaceholder('08:30').setValue(cond.timeStart || '');
        text.inputEl.addEventListener('change', async () => {
          cond.timeStart = text.inputEl.value.trim();
          await plugin.saveSettings();
        });
        return text;
      })
      .addText((text) => {
        text.setPlaceholder('18:00').setValue(cond.timeEnd || '');
        text.inputEl.addEventListener('change', async () => {
          cond.timeEnd = text.inputEl.value.trim();
          await plugin.saveSettings();
        });
        return text;
      });

    // 命中时打开的组合
    new Setting(card)
      .setName(this.t('rule_profile'))
      .addDropdown((dd) => {
        dd.addOption('', this.t('rule_profile_none'));
        plugin.settings.profiles.forEach((p) => dd.addOption(p.id, p.name || p.id));
        dd.setValue(rule.profileId || '').onChange(async (v) => {
          rule.profileId = v;
          await plugin.saveSettings();
        });
      })
      .addButton((btn) =>
        btn.setIcon('trash-2').setTooltip(this.t('delete')).onClick(async () => {
          arrayRemove(plugin.settings.rules, rule);
          await plugin.saveSettings();
          this.display();
        }));
  }
}

module.exports = XuHomepages;
