class KimiAdapter extends BaseAdapter {
  async send(messages) {
    const res = await fetch(CONFIG.apiEndpoint + '/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Model': 'kimi' },
      body: JSON.stringify({
        model: this.config.id,
        messages,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        tools: this.config.tools
      })
    });
    if (!res.ok) throw new Error('K3 API error: ' + res.status);
    const data = await res.json();
    return {
      content: data.choices[0].message.content,
      usage: data.usage,
      cost: this.calculateCost(data.usage)
    };
  }
}