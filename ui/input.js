const InputUI = {
  init() {
    const input = document.getElementById('chatInput');
    const btn = document.getElementById('sendBtn');

    btn.addEventListener('click', () => this.send());
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.send();
      }
    });
    input.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });
  },

  async send() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text || input.disabled) return;

    input.disabled = true;
    document.getElementById('sendBtn').disabled = true;
    input.value = '';
    input.style.height = 'auto';

    await ChatEngine.sendUserMessage(text);

    input.disabled = false;
    document.getElementById('sendBtn').disabled = false;
    input.focus();
  }
};