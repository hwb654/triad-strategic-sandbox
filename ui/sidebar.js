const SidebarUI = {
  render() {
    const list = document.getElementById('sessionList');
    if (!list) return;
    list.innerHTML = '';

    const sorted = [...SessionManager.sessions].sort((a, b) => b.updatedAt - a.updatedAt);
    sorted.forEach(sess => {
      const item = document.createElement('div');
      item.className = 'session-item' + (sess.id === SessionManager.currentId ? ' active' : '');
      const lastMsg = sess.messages[sess.messages.length - 1];
      const preview = lastMsg ? lastMsg.content.slice(0, 20) + '...' : '暂无消息';
      const timeStr = this.formatTime(sess.updatedAt);
      const cost = CostTracker.getSessionCost(sess).toFixed(2);

      item.innerHTML = `
        <div class="session-name">${this.escape(sess.name)}</div>
        <div class="session-preview">${this.escape(preview)}</div>
        <div class="session-meta">
          <span class="session-time">${timeStr}</span>
          <span class="session-cost">¥${cost}</span>
        </div>
        <button class="session-delete" data-id="${sess.id}">×</button>
      `;

      item.addEventListener('click', e => {
        if (e.target.classList.contains('session-delete')) {
          e.stopPropagation();
          this.handleDelete(sess.id);
        } else {
          this.handleSwitch(sess.id);
        }
      });

      list.appendChild(item);
    });
  },

  handleSwitch(id) {
    SessionManager.currentId = id;
    this.render();
    ChatUI.renderMessages();
    CostUI.update();
  },

  async handleDelete(id) {
    if (!confirm('确定删除此话题？数据不可恢复。')) return;
    await SessionManager.delete(id);
    this.render();
    ChatUI.renderMessages();
    CostUI.update();
  },

  formatTime(ts) {
    const diff = Date.now() - ts;
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return Math.floor(diff/60000) + '分钟前';
    if (diff < 86400000) return Math.floor(diff/3600000) + '小时前';
    const d = new Date(ts);
    return `${d.getMonth()+1}/${d.getDate()}`;
  },

  escape(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};