const App = {
  state: {
    pin: '',
    storedHash: localStorage.getItem('triad_pin_hash'),
    isFirstTime: !localStorage.getItem('triad_pin_hash'),
    isProcessing: false
  },

  async init() {
    await SessionManager.init();
    this.renderApp();
    this.bindGlobalEvents();
  },

  renderApp() {
    const app = document.getElementById('app');
    const hash = this.state.storedHash;
    const isFirst = this.state.isFirstTime;

    app.innerHTML = `
      <div class="triad-app">
        <!-- Lock Screen -->
        <div class="lock-screen" id="lockScreen">
          <div class="seal"><div class="seal-text">绝密</div></div>
          <div class="lock-title" id="lockTitle">${isFirst ? '设置访问密码' : '绝密推演区域'}</div>
          <div class="lock-subtitle" id="lockSubtitle">${isFirst ? '首次启动，请设置四位数字密码' : '未授权禁止接入'}</div>
          ${isFirst ? '<div class="first-time-setup active"><div class="setup-text">此密码仅存储于本地，无找回机制</div></div>' : ''}
          <div class="pin-display" id="pinDisplay">
            <div class="pin-dot" data-index="0"></div>
            <div class="pin-dot" data-index="1"></div>
            <div class="pin-dot" data-index="2"></div>
            <div class="pin-dot" data-index="3"></div>
          </div>
          <div class="pin-pad" id="pinPad">
            ${[1,2,3,4,5,6,7,8,9].map(n => `<button class="pin-btn" data-num="${n}">${n}</button>`).join('')}
            <button class="pin-btn" style="visibility:hidden"> </button>
            <button class="pin-btn" data-num="0">0</button>
            <button class="pin-btn" data-action="backspace">←</button>
          </div>
          <div class="lock-error" id="lockError"></div>
        </div>

        <!-- Transition Screen -->
        <div class="transition-screen" id="transitionScreen">
          <div class="transition-ink">不谋全局者，不足谋一域。</div>
          <div class="transition-sub">三角战略推演系统 · 初始化完成</div>
        </div>

        <!-- Main App -->
        <div class="main-app" id="mainApp">
          <!-- Sidebar -->
          <div class="sidebar" id="sidebar">
            <div class="sidebar-header">
              <span class="sidebar-title">推演话题</span>
              <div style="display:flex;gap:8px;">
                <button class="sidebar-close" id="sidebarClose">✕</button>
                <button class="new-session-btn" id="newSessionBtn">+</button>
              </div>
            </div>
            <div class="session-list" id="sessionList"></div>
            <div class="sidebar-footer">三角战略推演 · 本地加密存储</div>
          </div>

          <!-- Chat Area -->
          <div class="chat-area">
            <div class="chat-header">
              <div class="chat-header-left">
                <button class="menu-toggle" id="menuToggle">☰</button>
                <span class="chat-header-title" id="chatTitle">新话题</span>
                <span class="mode-indicator" id="modeIndicator">三角全开</span>
              </div>
              <div class="cost-display">
                <div class="cost-item"><div class="cost-label">当前话题</div><div class="cost-value" id="sessionCost">¥0.00</div></div>
                <div class="cost-item"><div class="cost-label">全局累计</div><div class="cost-value" id="globalCost">¥0.00</div></div>
                <button class="settings-toggle" id="settingsToggle">⚙</button>
              </div>
            </div>
            <div class="messages-container" id="messagesContainer"></div>
            <div class="typing-indicator" id="typingIndicator">
              <span id="typingName">K3</span>
              <div class="typing-dots"><span></span><span></span><span></span></div>
            </div>
            <div class="input-area">
              <div class="input-wrapper">
                <textarea class="chat-input" id="chatInput" placeholder="输入战略推演指令..." rows="1"></textarea>
                <button class="send-btn" id="sendBtn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Overlay -->
        <div class="overlay" id="overlay"></div>

        <!-- Settings Panel -->
        <div class="settings-panel" id="settingsPanel">
          <div class="settings-header">
            <span class="settings-title">推演配置</span>
            <button class="settings-close" id="settingsClose">×</button>
          </div>
          <div class="settings-body">
            <div class="setting-group">
              <label class="setting-label">轮值策略</label>
              <p class="setting-desc">选择模型参与推演的频率模式，控制成本与深度</p>
              <div class="mode-options" id="modeOptions">
                <div class="mode-option active" data-mode="A">
                  <div class="mode-radio"></div>
                  <div class="mode-info">
                    <div class="mode-name">模式 A：三角全开</div>
                    <div class="mode-desc">每轮先后调用 K3 → V4 Pro，完整三角推演</div>
                  </div>
                </div>
                <div class="mode-option" data-mode="B">
                  <div class="mode-radio"></div>
                  <div class="mode-info">
                    <div class="mode-name">模式 B：V4 Pro 单聊</div>
                    <div class="mode-desc">仅调用 V4 Pro，深度推理模式</div>
                  </div>
                </div>
                <div class="mode-option" data-mode="C">
                  <div class="mode-radio"></div>
                  <div class="mode-info">
                    <div class="mode-name">模式 C：K3 单聊</div>
                    <div class="mode-desc">仅调用 K3，快速响应模式</div>
                  </div>
                </div>
                <div class="mode-option" data-mode="D">
                  <div class="mode-radio"></div>
                  <div class="mode-info">
                    <div class="mode-name">模式 D：节制红队</div>
                    <div class="mode-desc">每 3 轮 K3 参与 1 次，成本优先</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="setting-group">
              <label class="setting-label">记忆层状态</label>
              <p class="setting-desc">L1 工作记忆 + L2 短期摘要 + L3 长期锚点</p>
              <div class="memory-display">
                <div class="memory-layer">
                  <div class="memory-layer-header">
                    <span class="memory-layer-name">L1 工作记忆</span>
                    <span class="memory-layer-status">实时</span>
                  </div>
                  <div class="memory-layer-content" id="l1Content">保留最近 8 轮完整对话原文</div>
                </div>
                <div class="memory-layer">
                  <div class="memory-layer-header">
                    <span class="memory-layer-name">L2 短期记忆</span>
                    <span class="memory-layer-status" id="l2Status">待压缩</span>
                  </div>
                  <div class="memory-layer-content">第 8-20 轮对话的压缩摘要，每 10 轮触发一次</div>
                </div>
                <div class="memory-layer">
                  <div class="memory-layer-header">
                    <span class="memory-layer-name">L3 长期记忆</span>
                    <span class="memory-layer-status" id="l3Status">待萃取</span>
                  </div>
                  <div class="memory-layer-content">核心前提、关键概念、共识点锚点列表</div>
                </div>
              </div>
            </div>

            <div class="setting-group">
              <label class="setting-label">成本预警阈值</label>
              <p class="setting-desc">当月累计成本超过此值时弹窗提醒</p>
              <div style="display:flex;align-items:center;gap:8px;">
                <span style="font-size:14px;color:var(--ink);">¥</span>
                <input type="number" id="costThreshold" value="100" style="width:80px;padding:6px 10px;border:1px solid rgba(0,0,0,0.1);border-radius:8px;font-size:14px;font-family:inherit;background:rgba(255,255,255,0.5);color:var(--ink);" />
              </div>
            </div>

            <div class="danger-zone">
              <button class="danger-btn" id="clearAllBtn">清空所有数据（不可恢复）</button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindLockEvents();
  },

  bindLockEvents() {
    let pin = '';
    const hash = this.state.storedHash;
    const isFirst = this.state.isFirstTime;

    document.getElementById('pinPad').addEventListener('click', e => {
      if (!e.target.classList.contains('pin-btn')) return;
      const num = e.target.dataset.num;
      const action = e.target.dataset.action;

      if (num !== undefined && pin.length < 4) {
        pin += num;
        this.updatePinDisplay(pin);
        if (pin.length === 4) {
          setTimeout(() => this.checkPin(pin, isFirst, hash), 200);
        }
      } else if (action === 'backspace') {
        pin = pin.slice(0, -1);
        this.updatePinDisplay(pin);
      }
    });
  },

  updatePinDisplay(pin) {
    document.querySelectorAll('.pin-dot').forEach((dot, i) => {
      dot.classList.toggle('filled', i < pin.length);
    });
    document.getElementById('lockError').classList.remove('show', 'shake');
  },

  simpleHash(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = ((h << 5) - h) + str.charCodeAt(i);
    return String(h);
  },

  checkPin(pin, isFirst, storedHash) {
    const hash = this.simpleHash(pin);
    if (isFirst) {
      localStorage.setItem('triad_pin_hash', hash);
      this.state.storedHash = hash;
      this.state.isFirstTime = false;
      this.unlock();
    } else if (hash === storedHash) {
      this.unlock();
    } else {
      const err = document.getElementById('lockError');
      err.textContent = '访问被拒绝';
      err.classList.add('show', 'shake');
      setTimeout(() => err.classList.remove('shake'), 400);
      this.updatePinDisplay('');
    }
  },

  unlock() {
    document.getElementById('lockScreen').classList.add('hidden');
    setTimeout(() => {
      document.getElementById('transitionScreen').classList.add('active');
      setTimeout(() => {
        document.getElementById('transitionScreen').classList.remove('active');
        document.getElementById('mainApp').classList.add('active');
        this.initMainApp();
      }, 2000);
    }, 300);
  },

  initMainApp() {
    SidebarUI.render();
    ChatUI.renderMessages();
    CostUI.update();
    InputUI.init();
    this.bindMainEvents();
  },

  bindMainEvents() {
    // New session
    document.getElementById('newSessionBtn').addEventListener('click', () => {
      const name = prompt('输入话题名称：', '新推演话题');
      if (name) {
        SessionManager.create(name);
        SidebarUI.render();
        ChatUI.renderMessages();
        CostUI.update();
      }
    });

    // Sidebar close (mobile)
    document.getElementById('sidebarClose').addEventListener('click', () => {
      document.getElementById('sidebar').classList.remove('open');
    });

    // Settings toggle
    document.getElementById('settingsToggle').addEventListener('click', () => {
      document.getElementById('settingsPanel').classList.add('open');
      document.getElementById('overlay').classList.add('active');
    });

    document.getElementById('settingsClose').addEventListener('click', () => {
      document.getElementById('settingsPanel').classList.remove('open');
      document.getElementById('overlay').classList.remove('active');
    });

    document.getElementById('overlay').addEventListener('click', () => {
      document.getElementById('settingsPanel').classList.remove('open');
      document.getElementById('sidebar').classList.remove('open');
      document.getElementById('overlay').classList.remove('active');
    });

    // Mode selection
    document.querySelectorAll('.mode-option').forEach(opt => {
      opt.addEventListener('click', () => {
        document.querySelectorAll('.mode-option').forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        const mode = opt.dataset.mode;
        DB.setSetting('mode', mode);
        const modeNames = { A: '三角全开', B: 'V4 Pro 单聊', C: 'K3 单聊', D: '节制红队' };
        document.getElementById('modeIndicator').textContent = modeNames[mode];
      });
    });

    // Cost threshold
    document.getElementById('costThreshold').addEventListener('change', e => {
      CONFIG.cost.warningThreshold = parseFloat(e.target.value) || 100;
    });

    // Clear all
    document.getElementById('clearAllBtn').addEventListener('click', () => {
      if (confirm('确定清空所有数据？此操作不可恢复。')) {
        indexedDB.deleteDatabase('TriadSandbox');
        localStorage.clear();
        location.reload();
      }
    });

    // Mobile menu
    document.getElementById('menuToggle').addEventListener('click', () => {
      document.getElementById('sidebar').classList.add('open');
    });

    // Mode indicator click
    document.getElementById('modeIndicator').addEventListener('click', () => {
      document.getElementById('settingsPanel').classList.add('open');
      document.getElementById('overlay').classList.add('active');
    });
  },

  bindGlobalEvents() {
    window.addEventListener('beforeunload', () => {
      SessionManager.saveCurrent();
    });
  }
};

// ChatUI
const ChatUI = {
  renderMessages() {
    const session = SessionManager.current;
    const container = document.getElementById('messagesContainer');
    if (!session || !container) return;

    container.innerHTML = '';
    document.getElementById('chatTitle').textContent = session.name;

    if (session.messages.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'message-group system';
      empty.innerHTML = `
        <div class="message-content"><div class="bubble system">
          推演室已就绪。输入战略议题，K3 与 V4 Pro 将基于共享上下文进行三角推演。<br>
          <span style="opacity:0.6;font-size:11px;margin-top:4px;display:block;">格式规范：【前提】→【推论】→【结论】→【开放点】</span>
        </div></div>
      `;
      container.appendChild(empty);
      return;
    }

    session.messages.forEach(msg => {
      container.appendChild(BubbleUI.render(msg));
    });

    container.scrollTop = container.scrollHeight;
  }
};

// CostUI
const CostUI = {
  update() {
    const session = SessionManager.current;
    const sessionCost = session ? CostTracker.getSessionCost(session) : 0;
    document.getElementById('sessionCost').textContent = '¥' + sessionCost.toFixed(2);
    document.getElementById('globalCost').textContent = '¥' + CostTracker.globalCost.toFixed(2);
    if (CostTracker.checkWarning()) {
      document.getElementById('globalCost').classList.add('warning');
    } else {
      document.getElementById('globalCost').classList.remove('warning');
    }
  }
};

// Start
document.addEventListener('DOMContentLoaded', () => App.init());