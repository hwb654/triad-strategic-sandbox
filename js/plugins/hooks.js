const Hooks = {
  listeners: {},

  register(name, fn) {
    if (!this.listeners[name]) this.listeners[name] = [];
    this.listeners[name].push(fn);
  },

  trigger(name, data) {
    (this.listeners[name] || []).forEach(fn => {
      try { fn(data); } catch(e) { console.error('Hook error:', e); }
    });
  }
};