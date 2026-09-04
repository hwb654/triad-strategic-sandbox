const CONFIG = {
  // ⚠️ 重要：把下面这行改成你的 Cloudflare Worker 地址
  // 格式：https://triad-proxy.你的用户名.workers.dev
  apiEndpoint: 'https://triad-proxy.2964437816.workers.dev/',

  models: {
    k3: {
      id: 'kimi-k3', name: 'K3', adapter: 'kimi',
      pricing: { input: 20, cachedInput: 2, output: 100 },
      maxTokens: 300, temperature: 0.7,
      systemPrompt: '请用中文回答，保持简洁。输出必须包含【前提】【推论】【结论】【开放点】四个部分，总字数不超过200字，禁止铺垫和客套话。',
      tools: []
    },
    v4pro: {
      id: 'deepseek-v4-pro', name: 'V4 Pro', adapter: 'deepseek',
      pricing: { input: 2, output: 8 },
      maxTokens: 300, temperature: 0.6,
      reasoningMode: 'xhigh',
      systemPrompt: '请用中文回答，保持简洁。输出必须包含【前提】【推论】【结论】【开放点】四个部分，总字数不超过200字，禁止铺垫和客套话。'
    }
  },
  memory: {
    l1MaxRounds: 8,
    l2CompressEvery: 10,
    l3UpdateInterval: 1,
    maxTotalRounds: 25
  },
  cost: { warningThreshold: 100 },
  features: {
    enableNetworkSearch: false,
    enableVoiceInput: false,
    enableExport: false
  }
};
