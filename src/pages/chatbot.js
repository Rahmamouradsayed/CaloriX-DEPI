// ═══════════════════════════════════════════
// CALORIX — AI CHATBOT PAGE
// Model selection only — no API keys in the browser.
// Keys live server-side in .env; the frontend just picks
// which configured model to use for the request.
// ═══════════════════════════════════════════

const FALLBACK_MODEL_LIST = [
  { id: 'groq',      label: 'Groq (Llama 3.3 70B — Free)' },
  { id: 'local',     label: '🖥️ Local Model (Llama 3.2 3B)' },
  { id: 'openai',    label: 'OpenAI GPT-4o Mini' },
  { id: 'gemini',    label: 'Google Gemini 1.5 Flash' },
  { id: 'anthropic', label: 'Claude Haiku' },
];

function renderChat() {
  const page = document.createElement('div');
  page.className = 'chatbot-layout';

  const loggedIn = Store.isLoggedIn();
  let selectedModel = Store.get('chatModel') || 'groq';
  let modelList = FALLBACK_MODEL_LIST;
  let history = [];
  let isLoading = false;

  const QUICK_TOPICS = [
    { icon:'🥗', label:'Weight loss meals', q:'What are the best meals for weight loss?' },
    { icon:'💪', label:'High protein ideas', q:'Give me high protein meal ideas under 400 calories' },
    { icon:'🌅', label:'Best breakfasts', q:'What are healthy breakfast options under 300 calories?' },
    { icon:'🌱', label:'Vegan options', q:'What are the best vegan high-protein meals?' },
    { icon:'🔥', label:'Keto recipes', q:'Recommend keto-friendly meals with under 10g carbs' },
    { icon:'🍎', label:'Healthy snacks', q:'What are healthy snacks under 200 calories?' },
  ];

  const CHIPS = ['Calories in avocado', 'Post-workout meal', 'Diabetic-friendly', 'Mediterranean diet', 'Meal prep ideas', 'TDEE calculation', 'BMI & weight'];

  function modelLabel(id) {
    return modelList.find(m => m.id === id)?.label || id;
  }

  function modelSelectHTML() {
    return `
      <select class="input" id="model-select" style="font-size:0.82rem;padding:0.6rem 1rem" ${!loggedIn ? 'disabled' : ''}>
        ${modelList.map(m => `<option value="${m.id}" ${m.id === selectedModel ? 'selected' : ''}>${m.label}</option>`).join('')}
      </select>
    `;
  }

  page.innerHTML = `
    <!-- SIDEBAR -->
    <aside class="chat-sidebar">
      <div class="chat-sidebar-header">
        <h3>CaloriX AI</h3>
        <p>Your personal nutrition expert</p>
      </div>

      <div class="chat-sidebar-body">
        <div class="chat-sidebar-section">
          <h4>AI Model</h4>
          <div id="model-select-wrap">${modelSelectHTML()}</div>
          ${!loggedIn ? `<p style="font-size:0.76rem;color:var(--text3);margin-top:0.5rem;padding:0 0.4rem">Log in to choose a model — you're in offline demo mode.</p>` : ''}
        </div>

        <div class="chat-sidebar-section">
          <h4>Quick Topics</h4>
          ${QUICK_TOPICS.map(t => `
            <button class="quick-topic-btn" onclick="sendFromSidebar('${escHtml(t.q)}')">
              <span class="icon">${t.icon}</span>${t.label}
            </button>
          `).join('')}
        </div>

        <div class="chat-sidebar-section">
          <h4>Try Asking</h4>
          <div class="chip-group">
            ${CHIPS.map(c => `<span class="chip" onclick="sendFromSidebar('${escHtml(c)}')">${c}</span>`).join('')}
          </div>
        </div>
      </div>

      <div class="chat-sidebar-footer">
        <button class="sidebar-action-btn" onclick="clearChatHistory()">🗑 Clear conversation</button>
      </div>
    </aside>

    <!-- MAIN CHAT -->
    <main class="chat-main">
      <div class="chat-topbar">
        <div class="chat-topbar-left">
          <div class="chat-ai-avatar">🤖</div>
          <div>
            <div class="chat-ai-name">CaloriX AI</div>
            <div class="chat-ai-status">
              <span class="status-dot" id="status-dot"></span>
              <span id="status-text">${loggedIn ? modelLabel(selectedModel) : 'Offline demo mode'}</span>
            </div>
          </div>
        </div>
        <div class="chat-topbar-actions">
          <button class="icon-btn" title="Clear chat" onclick="clearChatHistory()">🗑</button>
        </div>
      </div>

      ${!loggedIn ? `
      <div class="api-banner" id="login-banner">
        <p>🔑 <strong>Not logged in.</strong> Chatting in offline demo mode with canned nutrition tips.</p>
        <button class="btn btn-accent btn-sm" onclick="Router.navigate('/login')">Log In →</button>
      </div>
      ` : ''}

      <div class="chat-messages" id="chat-messages">
        <!-- Welcome -->
        <div class="message-group bot bubble-enter">
          <div class="msg-avatar bot">🤖</div>
          <div class="msg-content">
            <div class="msg-bubble bot">
              <strong>Welcome to CaloriX! 👋</strong><br><br>
              I'm your AI nutrition assistant. I can help you with:<br><br>
              <ul>
                <li>🍽️ Personalized meal recommendations</li>
                <li>📊 Calorie & macro calculations</li>
                <li>🥗 Recipes for your dietary goals</li>
                <li>💡 Nutrition science, simply explained</li>
              </ul>
              <br>What would you like to explore today?
            </div>
            <div class="msg-time">${fmtNow()}</div>
          </div>
        </div>
      </div>

      <div class="chat-input-bar">
        <div class="chat-input-wrap">
          <textarea
            class="chat-textarea"
            id="chat-input"
            placeholder="Ask about nutrition, recipes, calories…"
            rows="1"
            onkeydown="handleChatKey(event)"
            oninput="autoGrow(this)"
          ></textarea>
          <button class="chat-send-btn" id="send-btn" onclick="sendChatMessage()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
        </div>
        <div class="chat-input-hint">Press <kbd style="background:var(--cream-dark);padding:0.1rem 0.4rem;border-radius:4px;font-size:0.7rem">Enter</kbd> to send · <kbd style="background:var(--cream-dark);padding:0.1rem 0.4rem;border-radius:4px;font-size:0.7rem">Shift+Enter</kbd> for new line</div>
      </div>
    </main>
  `;

  // ── Load real model list from backend (falls back to the static list above) ──
  if (loggedIn) {
    BackendChat.listModels()
      .then(data => {
        if (data?.models?.length) {
          modelList = data.models;
          const wrap = document.getElementById('model-select-wrap');
          if (wrap) {
            wrap.innerHTML = modelSelectHTML();
            document.getElementById('model-select').addEventListener('change', onModelChange);
          }
          setStatus(false);
        }
      })
      .catch(() => { /* keep the static fallback list silently */ });

    document.getElementById('model-select')?.addEventListener('change', onModelChange);
  }

  function onModelChange(e) {
    selectedModel = e.target.value;
    Store.set('chatModel', selectedModel);
    setStatus(false);
  }

  // ── CHAT FUNCTIONS ──
  function getMessages() { return document.getElementById('chat-messages'); }
  function getSendBtn()  { return document.getElementById('send-btn'); }
  function getInput()    { return document.getElementById('chat-input'); }

  function setStatus(thinking) {
    const dot  = document.getElementById('status-dot');
    const text = document.getElementById('status-text');
    if (!dot || !text) return;
    dot.classList.toggle('thinking', thinking);
    text.textContent = thinking ? 'Thinking…' : (loggedIn ? modelLabel(selectedModel) : 'Offline demo mode');
  }

  function appendMessage(role, html, animate = true, tag = null) {
    const msgs = getMessages();
    const group = document.createElement('div');
    group.className = `message-group ${role}${animate ? ' bubble-enter' : ''}`;
    group.innerHTML = `
      <div class="msg-avatar ${role}">${role === 'user' ? '👤' : '🤖'}</div>
      <div class="msg-content">
        <div class="msg-bubble ${role}">${html}</div>
        <div class="msg-time">${fmtNow()}${tag ? ' · ' + escHtml(tag) : ''}</div>
      </div>
    `;
    msgs.appendChild(group);
    msgs.scrollTop = msgs.scrollHeight;
    return group;
  }

  function showTyping() {
    const msgs = getMessages();
    const el = document.createElement('div');
    el.id = 'typing-indicator';
    el.className = 'message-group bot bubble-enter';
    el.innerHTML = `
      <div class="msg-avatar bot">🤖</div>
      <div class="msg-content">
        <div class="typing-bubble">
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
        </div>
      </div>
    `;
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function removeTyping() {
    document.getElementById('typing-indicator')?.remove();
  }

  async function send(text) {
    if (!text.trim() || isLoading) return;
    isLoading = true;
    getSendBtn().disabled = true;
    setStatus(true);

    appendMessage('user', escHtml(text));
    history.push({ role: 'user', content: text });

    showTyping();

    try {
      let reply, tag;
      if (!loggedIn) {
        await new Promise(r => setTimeout(r, 700 + Math.random() * 500));
        reply = localFallback(text);
        tag = 'offline demo — log in for real AI models';
      } else {
        const data = await BackendChat.send(history, { provider: selectedModel });
        reply = data.reply;
        tag = `via ${modelLabel(data.provider || selectedModel)}`;
      }
      removeTyping();
      appendMessage('bot', formatMd(reply), true, tag);
      history.push({ role: 'assistant', content: reply });
    } catch (err) {
      removeTyping();
      let msg;
      if (err.message === 'NOT_LOGGED_IN' || err.message === 'SESSION_EXPIRED') {
        msg = '🔑 Your session expired. Please log in again to keep chatting.';
        Router.navigate('/login');
      } else {
        msg = `⚠️ ${err.message || 'Something went wrong.'}`;
      }
      appendMessage('bot', msg);
    }

    isLoading = false;
    getSendBtn().disabled = false;
    setStatus(false);
    getInput().focus();
  }

  // Expose to window for sidebar/button clicks
  window.sendChatMessage = () => {
    const input = getInput();
    const val = input.value.trim();
    if (!val) return;
    input.value = '';
    input.style.height = 'auto';
    send(val);
  };

  window.sendFromSidebar = (q) => {
    send(q);
    document.querySelector('.chat-main')?.scrollIntoView({ behavior: 'smooth' });
  };

  window.clearChatHistory = () => {
    history = [];
    const msgs = getMessages();
    msgs.innerHTML = '';
    appendMessage('bot', 'Chat cleared! How can I help you with nutrition today? 🥗', false);
    showToast('Conversation cleared', 'info');
  };

  window.handleChatKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); window.sendChatMessage(); }
  };

  window.autoGrow = (el) => {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  };

  return page;
}
