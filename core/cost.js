const CostTracker = {
  globalCost: 0,
  modelCosts: { k3: 0, v4pro: 0 },

  async init() {
    const saved = await DB.getSetting('globalCost');
    if (saved) this.globalCost = parseFloat(saved);
  },

  add(cost, model) {
    this.globalCost += cost;
    if (this.modelCosts[model] !== undefined) this.modelCosts[model] += cost;
    DB.setSetting('globalCost', String(this.globalCost));
  },

  getSessionCost(session) {
    return session.messages.reduce((sum, m) => sum + (m.cost || 0), 0);
  },

  checkWarning() {
    return this.globalCost > CONFIG.cost.warningThreshold;
  }
};