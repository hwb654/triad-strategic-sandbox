const ChatEngine = {
  adapters: {
    k3: new KimiAdapter(CONFIG.models.k3),
    v4pro: new DeepSeekAdapter(CONFIG.models.v4pro)
  },

  async sendUserMessage(text) {
    const session = SessionManager.current;
    if (!session) return;

    session.messages.push({
      id: 'msg_' + Date.now(),
      role: 'user',
      content: text,
      cost: 0,
      timestamp: Date.now()
    });
    session.roundCount++;
    await SessionManager.saveCurrent();
    Hooks.trigger('afterUserSend', session);

    const mode = await DB.getSetting('mode') || 'A';
    const round = session.roundCount;
    let callK3 = false, callV4 = false;

    switch(mode) {
      case 'A': callK3 = true; callV4 = true; break;
      case 'B': callV4 = true; break;
      case 'C': callK3 = true; break;
      case 'D': callV4 = true; if (round % 3 === 1) callK3 = true; break;
    }

    if (callK3) {
      Hooks.trigger('beforeModelCall', { model: 'k3', session });
      await this.callModel('k3', session);
    }

    if (callV4) {
      Hooks.trigger('beforeModelCall', { model: 'v4pro', session });
      await this.callModel('v4pro', session);
    }

    if (session.roundCount >= CONFIG.memory.maxTotalRounds) {
      await MemoryEngine.compress(session);
      Hooks.trigger('afterMemoryCompress', session);
    }

    await SessionManager.saveCurrent();
  },

  async callModel(modelKey, session) {
    const adapter = this.adapters[modelKey];
    const context = MemoryEngine.buildContext(session, modelKey);

    try {
      const res = await adapter.send(context);
      session.messages.push({
        id: 'msg_' + Date.now(),
        role: modelKey === 'k3' ? 'k3' : 'v4',
        content: res.content,
        cost: res.cost,
        usage: res.usage,
        timestamp: Date.now()
      });
      CostTracker.add(res.cost, modelKey);
      Hooks.trigger('afterModelResponse', { model: modelKey, session, response: res });
    } catch(err) {
      session.messages.push({
        id: 'msg_' + Date.now(),
        role: 'system',
        content: `[${modelKey.toUpperCase()} 调用失败] ${err.message}`,
        cost: 0,
        timestamp: Date.now()
      });
    }
  }
};