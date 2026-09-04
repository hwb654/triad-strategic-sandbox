class BaseAdapter {
  constructor(config) { this.config = config; }

  async send(messages) {
    throw new Error('send() must be implemented by subclass');
  }

  calculateCost(usage) {
    const p = this.config.pricing;
    const inputCost = (usage.prompt_tokens * p.input) / 1e6;
    const cachedCost = ((usage.cached_tokens || 0) * (p.cachedInput || 0)) / 1e6;
    const outputCost = (usage.completion_tokens * p.output) / 1e6;
    return +(inputCost + cachedCost + outputCost).toFixed(6);
  }
}