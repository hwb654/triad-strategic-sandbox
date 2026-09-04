const SessionManager = {
  sessions: [],
  currentId: null,

  async init() {
    await DB.init();
    await CostTracker.init();
    this.sessions = await DB.getAllSessions();

    if (this.sessions.length === 0) {
      this.create('默认推演室');
    }
    this.currentId = this.sessions[0].id;
  },

  create(name) {
    const session = {
      id: 'sess_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      name: name || '新话题',
      messages: [],
      cost: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      memory: { l1: [], l2: '', l3: [] },
      roundCount: 0
    };
    this.sessions.push(session);
    this.currentId = session.id;
    DB.saveSession(session);
    return session;
  },

  async delete(id) {
    this.sessions = this.sessions.filter(s => s.id !== id);
    await DB.deleteSession(id);
    if (this.currentId === id) {
      this.currentId = this.sessions[0]?.id || null;
    }
  },

  get current() {
    return this.sessions.find(s => s.id === this.currentId);
  },

  async saveCurrent() {
    const s = this.current;
    if (s) {
      s.updatedAt = Date.now();
      await DB.saveSession(s);
    }
  }
};