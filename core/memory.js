const MemoryEngine = {
  async compress(session) {
    const msgs = session.messages;
    if (msgs.length < CONFIG.memory.maxTotalRounds) return;

    const l1End = Math.max(msgs.length - CONFIG.memory.l1MaxRounds, 0);
    const l1Messages = msgs.slice(l1End);
    const toCompress = msgs.slice(0, l1End);

    if (toCompress.length === 0) return;

    const summary = await this.generateSummary(toCompress);
    session.memory.l2 = summary;
    session.memory.l3 = await this.extractAnchors(session.memory.l3, summary);
    session.memory.l1 = l1Messages;

    return { l3: session.memory.l3, l2: summary, l1: l1Messages };
  },

  async generateSummary(messages) {
    const prompt = `对以下战略推演对话进行结构化摘要，不超过300字：
【核心前提】【关键概念】【共识点】【未决分歧】【推演链条】【锚点事件】
对话内容：${messages.map(m => `[${m.role}] ${m.content}`).join('\n')}`;

    try {
      const adapter = new DeepSeekAdapter(CONFIG.models.v4pro);
      const res = await adapter.send([{ role: 'user', content: prompt }]);
      return res.content;
    } catch(e) {
      return '摘要生成失败';
    }
  },

  async extractAnchors(existing, summary) {
    const anchors = [...existing];
    const lines = summary.split('\n');
    lines.forEach(line => {
      if (line.includes('【核心前提】') || line.includes('【共识点】')) {
        const text = line.replace(/【.*?】[：:]/, '').trim();
        if (text && !anchors.includes(text)) anchors.push(text);
      }
    });
    return anchors.slice(-10);
  },

  buildContext(session, modelId) {
    const parts = [];
    if (session.memory.l3.length) {
      parts.push({ role: 'system', content: '[L3长期记忆] ' + session.memory.l3.join('；') });
    }
    if (session.memory.l2) {
      parts.push({ role: 'system', content: '[L2短期摘要] ' + session.memory.l2 });
    }

    const recent = session.memory.l1.length 
      ? session.memory.l1 
      : session.messages.slice(-CONFIG.memory.l1MaxRounds);

    recent.forEach(m => {
      const prefix = m.role === 'user' ? '[用户]' : m.role === 'k3' ? '[K3]' : m.role === 'v4' ? '[V4Pro]' : '';
      parts.push({ role: m.role === 'user' ? 'user' : 'assistant', content: prefix + ' ' + m.content });
    });

    return parts;
  }
};