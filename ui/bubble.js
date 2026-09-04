const BubbleUI = {
  render(msg) {
    const group = document.createElement('div');
    group.className = `message-group ${msg.role}`;

    const configs = {
      user: { text: '我', name: '战略制定者', cls: 'user' },
      k3: { text: 'K3', name: 'Kimi K3', cls: 'k3' },
      v4: { text: 'V4', name: 'DeepSeek V4 Pro', cls: 'v4' },
      system: { text: '系', name: '系统', cls: 'system' }
    };
    const cfg = configs[msg.role] || configs.system;

    let content = this.escape(msg.content)
      .replace(/【前提】[:：]/g, '<span class="tag premise">前提</span>')
      .replace(/【推论】[:：]/g, '<span class="tag inference">推论</span>')
      .replace(/【结论】[:：]/g, '<span class="tag conclusion">结论</span>')
      .replace(/【开放点】[:：]/g, '<span class="tag open">开放点</span>');

    const costHtml = msg.cost > 0 
      ? `<div class="message-cost">¥${msg.cost.toFixed(4)} · ${msg.usage?.total_tokens || 0} tokens</div>` 
      : '';

    group.innerHTML = `
      <div class="avatar ${cfg.cls}">${cfg.text}</div>
      <div class="message-content">
        <div class="message-sender">${cfg.name}</div>
        <div class="bubble ${cfg.cls}">${content}</div>
        ${costHtml}
      </div>
    `;
    return group;
  },

  escape(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};