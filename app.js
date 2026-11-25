/**
 * VELOX.AI - Supersonic Neural Intelligence Engine
 * Client-side inference controller with real-time telemetry HUD
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODELS_URL = 'https://api.groq.com/openai/v1/models';

// Engine details
const MODEL_DETAILS = {
  'llama-3.3-70b-versatile': 'Flagship 70B neural backbone with massive 128k context for versatile problem solving.',
  'llama-3.1-8b-instant': 'Mach speed lightweight engine (~800 T/s throughput), tailored for instant reactions.',
  'llama-3.2-3b-preview': 'Compact 3B architecture balancing small footprint with solid reasoning.',
  'llama-3.2-1b-preview': 'Ultra-lightweight 1B model for rapid low-overhead tasks.',
  'deepseek-r1-distill-llama-70b': 'Reasoning model distilled from DeepSeek R1 onto Llama-70B. Excels at math & logic.',
  'mixtral-8x7b-32768': 'Mixture of Experts architecture by Mistral AI with 32k context.',
  'gemma2-9b-it': 'Google Gemma 2 9B instruction-tuned model with high benchmark scores.'
};

// Persona Presets
const MODES = {
  'all-rounder': {
    name: 'Omni',
    systemPrompt: 'You are VELOX, a state-of-the-art supersonic AI intelligence core powered by Groq LPUs. Provide exceptionally clear, insightful, accurate, and structured answers at lightning speed.',
    temperature: 0.6,
    model: 'llama-3.3-70b-versatile'
  },
  'coder': {
    name: 'Code Matrix',
    systemPrompt: 'You are VELOX CODE MATRIX, an elite principal software architect. Write clean, production-ready, type-safe, and well-commented code. Prioritize modularity, efficiency, and modern best practices.',
    temperature: 0.2,
    model: 'llama-3.3-70b-versatile'
  },
  'thinker': {
    name: 'Deep Logic',
    systemPrompt: 'You are VELOX DEEP LOGIC, an analytical reasoning engine. Break down every problem into rigorous first-principles, examine edge cases, verify assumptions step-by-step, and reach mathematically sound conclusions.',
    temperature: 0.5,
    model: 'deepseek-r1-distill-llama-70b'
  },
  'writer': {
    name: 'Creative',
    systemPrompt: 'You are VELOX CREATIVE, a visionary storyteller and communicator. Craft vivid, evocative, compelling narratives and expressive prose that captivate the imagination.',
    temperature: 0.85,
    model: 'llama-3.3-70b-versatile'
  }
};

// Global App State
const state = {
  apiKey: localStorage.getItem('groq_api_key') || '',
  model: 'llama-3.3-70b-versatile',
  systemPrompt: MODES['all-rounder'].systemPrompt,
  temperature: 0.6,
  maxTokens: 2048,
  topP: 1.0,
  stream: true,
  jsonMode: false,
  activeMode: 'all-rounder',
  messages: [],
  isGenerating: false,
  abortController: null,
  activeCodeLang: 'curl'
};

// DOM References
const elements = {
  headerSpeedValue: document.getElementById('headerSpeedValue'),
  apiKeyBtnText: document.getElementById('apiKeyBtnText'),
  apiKeyStatusDot: document.getElementById('apiKeyStatusDot'),
  btnApiKey: document.getElementById('btnApiKey'),
  btnViewCode: document.getElementById('btnViewCode'),
  btnClearChat: document.getElementById('btnClearChat'),

  // Sidebar Controls
  modelSelect: document.getElementById('modelSelect'),
  modelDescription: document.getElementById('modelDescription'),
  systemPrompt: document.getElementById('systemPrompt'),
  btnResetSystemPrompt: document.getElementById('btnResetSystemPrompt'),
  btnResetParams: document.getElementById('btnResetParams'),
  paramTemperature: document.getElementById('paramTemperature'),
  valTemperature: document.getElementById('valTemperature'),
  paramMaxTokens: document.getElementById('paramMaxTokens'),
  valMaxTokens: document.getElementById('valMaxTokens'),
  paramTopP: document.getElementById('paramTopP'),
  valTopP: document.getElementById('valTopP'),
  toggleStream: document.getElementById('toggleStream'),
  toggleJsonMode: document.getElementById('toggleJsonMode'),

  // Telemetry HUD
  statSpeed: document.getElementById('statSpeed'),
  statTtft: document.getElementById('statTtft'),
  statLatency: document.getElementById('statLatency'),
  statTokens: document.getElementById('statTokens'),

  // Canvas & Chat
  messagesContainer: document.getElementById('messagesContainer'),
  welcomeHero: document.getElementById('welcomeHero'),
  heroApiAlert: document.getElementById('heroApiAlert'),
  btnHeroSetKey: document.getElementById('btnHeroSetKey'),
  messagesList: document.getElementById('messagesList'),
  chatForm: document.getElementById('chatForm'),
  userInput: document.getElementById('userInput'),
  btnSubmit: document.getElementById('btnSubmit'),
  btnStop: document.getElementById('btnStop'),

  // API Key Modal
  apiKeyModal: document.getElementById('apiKeyModal'),
  btnCloseApiKeyModal: document.getElementById('btnCloseApiKeyModal'),
  apiKeyInput: document.getElementById('apiKeyInput'),
  btnToggleKeyVisibility: document.getElementById('btnToggleKeyVisibility'),
  eyeIcon: document.getElementById('eyeIcon'),
  btnTestKey: document.getElementById('btnTestKey'),
  testSpinner: document.getElementById('testSpinner'),
  testKeyText: document.getElementById('testKeyText'),
  btnSaveKey: document.getElementById('btnSaveKey'),
  apiTestFeedback: document.getElementById('apiTestFeedback'),

  // View Code Modal
  viewCodeModal: document.getElementById('viewCodeModal'),
  btnCloseViewCodeModal: document.getElementById('btnCloseViewCodeModal'),
  codeSnippetBox: document.getElementById('codeSnippetBox'),
  btnCopySnippet: document.getElementById('btnCopySnippet'),
  copySnippetText: document.getElementById('copySnippetText')
};

// Initialize Application
function init() {
  if (window.marked) {
    marked.setOptions({
      breaks: true,
      gfm: true
    });
  }

  updateApiKeyStatus();
  updateModelInfo();
  elements.systemPrompt.value = state.systemPrompt;
  elements.apiKeyInput.value = state.apiKey;

  lucide.createIcons();
  attachEventListeners();
}

// Attach Event Listeners
function attachEventListeners() {
  // Mode selection pills
  document.querySelectorAll('.mode-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      const modeKey = pill.getAttribute('data-mode');
      activateMode(modeKey);
    });
  });

  // Sidebar Inputs
  elements.modelSelect.addEventListener('change', (e) => {
    state.model = e.target.value;
    updateModelInfo();
  });

  elements.systemPrompt.addEventListener('input', (e) => {
    state.systemPrompt = e.target.value;
  });

  elements.btnResetSystemPrompt.addEventListener('click', () => {
    state.systemPrompt = MODES[state.activeMode].systemPrompt;
    elements.systemPrompt.value = state.systemPrompt;
  });

  elements.btnResetParams.addEventListener('click', resetParameters);

  elements.paramTemperature.addEventListener('input', (e) => {
    state.temperature = parseFloat(e.target.value);
    elements.valTemperature.textContent = state.temperature.toFixed(2);
  });

  elements.paramMaxTokens.addEventListener('input', (e) => {
    state.maxTokens = parseInt(e.target.value, 10);
    elements.valMaxTokens.textContent = state.maxTokens;
  });

  elements.paramTopP.addEventListener('input', (e) => {
    state.topP = parseFloat(e.target.value);
    elements.valTopP.textContent = state.topP.toFixed(2);
  });

  elements.toggleStream.addEventListener('change', (e) => {
    state.stream = e.target.checked;
  });

  elements.toggleJsonMode.addEventListener('change', (e) => {
    state.jsonMode = e.target.checked;
  });

  // Chat Form
  elements.userInput.addEventListener('input', autoResizeTextarea);
  elements.userInput.addEventListener('keydown', handleTextareaKeydown);
  elements.chatForm.addEventListener('submit', handleChatSubmit);
  elements.btnStop.addEventListener('click', stopGeneration);
  elements.btnClearChat.addEventListener('click', clearChat);

  // Starter Cards
  document.querySelectorAll('.action-card').forEach((card) => {
    card.addEventListener('click', () => {
      const prompt = card.getAttribute('data-prompt');
      if (prompt) {
        elements.userInput.value = prompt;
        autoResizeTextarea();
        submitUserPrompt(prompt);
      }
    });
  });

  // API Key Modal
  elements.btnApiKey.addEventListener('click', openApiKeyModal);
  elements.btnHeroSetKey.addEventListener('click', openApiKeyModal);
  elements.btnCloseApiKeyModal.addEventListener('click', closeApiKeyModal);
  elements.btnToggleKeyVisibility.addEventListener('click', toggleKeyVisibility);
  elements.btnTestKey.addEventListener('click', testApiKey);
  elements.btnSaveKey.addEventListener('click', saveApiKey);

  // Code Export Modal
  elements.btnViewCode.addEventListener('click', openViewCodeModal);
  elements.btnCloseViewCodeModal.addEventListener('click', closeViewCodeModal);
  elements.btnCopySnippet.addEventListener('click', copyCodeSnippet);

  document.querySelectorAll('.cyber-tab').forEach((tab) => {
    tab.addEventListener('click', (e) => {
      document.querySelectorAll('.cyber-tab').forEach((t) => t.classList.remove('active'));
      e.target.classList.add('active');
      state.activeCodeLang = e.target.getAttribute('data-lang');
      updateCodeSnippet();
    });
  });

  // Close modals on background click
  window.addEventListener('click', (e) => {
    if (e.target === elements.apiKeyModal) closeApiKeyModal();
    if (e.target === elements.viewCodeModal) closeViewCodeModal();
  });
}

// Mode Switching Logic
function activateMode(modeKey) {
  if (!MODES[modeKey]) return;
  state.activeMode = modeKey;

  document.querySelectorAll('.mode-pill').forEach((p) => {
    p.classList.toggle('active', p.getAttribute('data-mode') === modeKey);
  });

  const preset = MODES[modeKey];
  state.systemPrompt = preset.systemPrompt;
  elements.systemPrompt.value = state.systemPrompt;

  state.temperature = preset.temperature;
  elements.paramTemperature.value = preset.temperature;
  elements.valTemperature.textContent = preset.temperature.toFixed(2);

  state.model = preset.model;
  elements.modelSelect.value = preset.model;
  updateModelInfo();
}

function updateModelInfo() {
  elements.modelDescription.textContent = MODEL_DETAILS[state.model] || 'High performance neural engine on Groq LPUs.';
}

function resetParameters() {
  const preset = MODES[state.activeMode];
  state.temperature = preset.temperature;
  state.maxTokens = 2048;
  state.topP = 1.0;
  state.stream = true;
  state.jsonMode = false;

  elements.paramTemperature.value = state.temperature;
  elements.valTemperature.textContent = state.temperature.toFixed(2);
  elements.paramMaxTokens.value = 2048;
  elements.valMaxTokens.textContent = '2048';
  elements.paramTopP.value = 1.0;
  elements.valTopP.textContent = '1.00';
  elements.toggleStream.checked = true;
  elements.toggleJsonMode.checked = false;
}

function autoResizeTextarea() {
  elements.userInput.style.height = 'auto';
  elements.userInput.style.height = Math.min(elements.userInput.scrollHeight, 200) + 'px';
}

function handleTextareaKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    elements.chatForm.dispatchEvent(new Event('submit', { cancelable: true }));
  }
}

function updateApiKeyStatus() {
  if (state.apiKey && state.apiKey.trim().startsWith('gsk_')) {
    elements.apiKeyBtnText.textContent = 'Key Active';
    elements.apiKeyStatusDot.classList.add('active');
    elements.heroApiAlert.classList.add('hidden');
  } else {
    elements.apiKeyBtnText.textContent = 'Connect Key';
    elements.apiKeyStatusDot.classList.remove('active');
    elements.heroApiAlert.classList.remove('hidden');
  }
}

function openApiKeyModal() {
  elements.apiKeyInput.value = state.apiKey;
  elements.apiTestFeedback.classList.add('hidden');
  elements.apiKeyModal.classList.remove('hidden');
  elements.apiKeyInput.focus();
}

function closeApiKeyModal() {
  elements.apiKeyModal.classList.add('hidden');
}

function toggleKeyVisibility() {
  const isPass = elements.apiKeyInput.type === 'password';
  elements.apiKeyInput.type = isPass ? 'text' : 'password';
  elements.eyeIcon.setAttribute('data-lucide', isPass ? 'eye-off' : 'eye');
  lucide.createIcons();
}

// Test API Key against Groq endpoint
async function testApiKey() {
  const key = elements.apiKeyInput.value.trim();
  if (!key) {
    showTestFeedback('Please enter your Groq API key first.', false);
    return;
  }

  elements.testSpinner.classList.remove('hidden');
  elements.testKeyText.textContent = 'Pinging...';
  elements.btnTestKey.disabled = true;
  elements.apiTestFeedback.classList.add('hidden');

  const startTime = performance.now();
  try {
    const res = await fetch(GROQ_MODELS_URL, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${key}` }
    });

    const elapsed = Math.round(performance.now() - startTime);

    if (res.ok) {
      const data = await res.json();
      const modelCount = data.data ? data.data.length : 0;
      showTestFeedback(`Gateway verified! Latency: ${elapsed}ms (${modelCount} engines reachable).`, true);
    } else {
      const err = await res.json().catch(() => ({}));
      const msg = err.error ? err.error.message : `HTTP ${res.status}: Unauthorized Key.`;
      showTestFeedback(msg, false);
    }
  } catch (err) {
    showTestFeedback(`Gateway unreachable: ${err.message}`, false);
  } finally {
    elements.testSpinner.classList.add('hidden');
    elements.testKeyText.textContent = 'Ping Gateway';
    elements.btnTestKey.disabled = false;
  }
}

function showTestFeedback(message, isSuccess) {
  elements.apiTestFeedback.textContent = message;
  elements.apiTestFeedback.className = `status-banner ${isSuccess ? 'success' : 'error'}`;
  elements.apiTestFeedback.classList.remove('hidden');
}

function saveApiKey() {
  const key = elements.apiKeyInput.value.trim();
  state.apiKey = key;
  localStorage.setItem('groq_api_key', key);
  updateApiKeyStatus();
  closeApiKeyModal();
}

function clearChat() {
  if (state.isGenerating) stopGeneration();
  state.messages = [];
  elements.messagesList.innerHTML = '';
  elements.welcomeHero.classList.remove('hidden');
  resetTelemetryBar();
}

function resetTelemetryBar() {
  elements.statSpeed.textContent = '0.0 T/s';
  elements.statTtft.textContent = '0 ms';
  elements.statLatency.textContent = '0 ms';
  elements.statTokens.textContent = '0 tokens';
  elements.headerSpeedValue.textContent = '0 T/s';
}

function handleChatSubmit(e) {
  e.preventDefault();
  const text = elements.userInput.value.trim();
  if (!text || state.isGenerating) return;
  submitUserPrompt(text);
}

// Submit User Prompt
async function submitUserPrompt(text) {
  if (!state.apiKey) {
    openApiKeyModal();
    showTestFeedback('Please attach and save your Groq API key to awaken Velox.', false);
    return;
  }

  elements.userInput.value = '';
  autoResizeTextarea();
  elements.welcomeHero.classList.add('hidden');

  appendMessage('user', text);

  const assistantMsgEl = createAssistantMessageElement();
  elements.messagesList.appendChild(assistantMsgEl);
  scrollChatToBottom();

  await executeGroqInference(assistantMsgEl);
}

// Append Message to UI
function appendMessage(role, content, stats = null) {
  state.messages.push({ role, content, stats });

  const card = document.createElement('div');
  card.className = `message-card ${role}`;

  const header = document.createElement('div');
  header.className = 'message-header';

  const sender = document.createElement('div');
  sender.className = 'message-sender';
  sender.innerHTML = `
    <span class="avatar-badge ${role}">${role === 'user' ? 'Operator' : 'Velox Core'}</span>
    ${role === 'assistant' ? `<span class="engine-tag">${state.model}</span>` : ''}
  `;

  const actions = document.createElement('div');
  const copyBtn = document.createElement('button');
  copyBtn.className = 'btn-msg-copy';
  copyBtn.innerHTML = '<i data-lucide="copy" class="icon-xs"></i> <span>Copy</span>';
  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(content);
    copyBtn.innerHTML = '<i data-lucide="check" class="icon-xs"></i> <span>Copied!</span>';
    setTimeout(() => {
      copyBtn.innerHTML = '<i data-lucide="copy" class="icon-xs"></i> <span>Copy</span>';
      lucide.createIcons();
    }, 1800);
  });

  actions.appendChild(copyBtn);
  header.appendChild(sender);
  header.appendChild(actions);

  const body = document.createElement('div');
  body.className = 'message-body';
  if (role === 'assistant') {
    body.innerHTML = renderMarkdown(content);
  } else {
    body.textContent = content;
  }

  card.appendChild(header);
  card.appendChild(body);

  if (stats) {
    const footer = document.createElement('div');
    footer.className = 'telemetry-tagline';
    footer.innerHTML = `
      <span class="telemetry-highlight">⚡ ${stats.speed} T/s</span>
      <span>⏱️ TTFT: ${stats.ttft}ms</span>
      <span>⏳ Latency: ${stats.latency}ms</span>
      <span>📝 ${stats.completionTokens} tokens</span>
    `;
    card.appendChild(footer);
  }

  elements.messagesList.appendChild(card);
  lucide.createIcons();
  scrollChatToBottom();
  return card;
}

// Assistant Streaming Placeholder
function createAssistantMessageElement() {
  const card = document.createElement('div');
  card.className = 'message-card assistant';

  const header = document.createElement('div');
  header.className = 'message-header';

  const sender = document.createElement('div');
  sender.className = 'message-sender';
  sender.innerHTML = `
    <span class="avatar-badge assistant">Velox Core</span>
    <span class="engine-tag">${state.model}</span>
  `;

  const actions = document.createElement('div');
  const copyBtn = document.createElement('button');
  copyBtn.className = 'btn-msg-copy';
  copyBtn.innerHTML = '<i data-lucide="copy" class="icon-xs"></i> <span>Copy</span>';
  actions.appendChild(copyBtn);

  header.appendChild(sender);
  header.appendChild(actions);

  const body = document.createElement('div');
  body.className = 'message-body';
  body.innerHTML = '<span class="streaming-cursor"></span>';

  const footer = document.createElement('div');
  footer.className = 'telemetry-tagline';
  footer.innerHTML = '<span class="telemetry-highlight">⚡ Synthesizing response...</span>';

  card.appendChild(header);
  card.appendChild(body);
  card.appendChild(footer);

  lucide.createIcons();
  return card;
}

// Execute Groq Inference
async function executeGroqInference(assistantCardEl) {
  state.isGenerating = true;
  toggleGeneratingUI(true);

  state.abortController = new AbortController();

  const bodyEl = assistantCardEl.querySelector('.message-body');
  const footerEl = assistantCardEl.querySelector('.telemetry-tagline');
  const copyBtn = assistantCardEl.querySelector('.btn-msg-copy');

  const messagesPayload = [];
  if (state.systemPrompt && state.systemPrompt.trim()) {
    messagesPayload.push({ role: 'system', content: state.systemPrompt.trim() });
  }

  state.messages.forEach((m) => {
    messagesPayload.push({ role: m.role, content: m.content });
  });

  const requestBody = {
    model: state.model,
    messages: messagesPayload,
    temperature: state.temperature,
    max_completion_tokens: state.maxTokens,
    top_p: state.topP,
    stream: state.stream
  };

  if (state.jsonMode) {
    requestBody.response_format = { type: 'json_object' };
  }

  const startTime = performance.now();
  let firstTokenTime = null;
  let fullResponseText = '';
  let tokenCountEstimate = 0;

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${state.apiKey}`
      },
      body: JSON.stringify(requestBody),
      signal: state.abortController.signal
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      const errorMsg = errJson.error ? errJson.error.message : `HTTP ${response.status}: Request failed`;
      throw new Error(errorMsg);
    }

    if (!state.stream) {
      const data = await response.json();
      const endTime = performance.now();
      const latency = Math.round(endTime - startTime);
      fullResponseText = data.choices[0]?.message?.content || '';

      const completionTokens = data.usage?.completion_tokens || estimateTokens(fullResponseText);
      const totalTokens = data.usage?.total_tokens || completionTokens;
      const speed = latency > 0 ? ((completionTokens / (latency / 1000))).toFixed(1) : '0.0';

      bodyEl.innerHTML = renderMarkdown(fullResponseText);
      footerEl.innerHTML = `
        <span class="telemetry-highlight">⚡ ${speed} T/s</span>
        <span>⏳ Latency: ${latency}ms</span>
        <span>📝 ${completionTokens} tokens</span>
      `;
      updateGlobalTelemetry(speed, latency, latency, completionTokens);

      state.messages.push({
        role: 'assistant',
        content: fullResponseText,
        stats: { speed, ttft: latency, latency, completionTokens }
      });

    } else {
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let isDone = false;
      let finalUsage = null;

      while (!isDone) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data:')) continue;

          const dataPayload = trimmed.replace(/^data:\s*/, '');
          if (dataPayload === '[DONE]') {
            isDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(dataPayload);
            const delta = parsed.choices?.[0]?.delta?.content;

            if (parsed.usage) {
              finalUsage = parsed.usage;
            }

            if (delta) {
              const now = performance.now();
              if (firstTokenTime === null) {
                firstTokenTime = now;
              }

              fullResponseText += delta;
              tokenCountEstimate += estimateTokenDelta(delta);

              const currentElapsedSec = (now - startTime) / 1000;
              const liveSpeed = currentElapsedSec > 0 ? (tokenCountEstimate / currentElapsedSec).toFixed(1) : '0.0';
              const ttft = firstTokenTime ? Math.round(firstTokenTime - startTime) : 0;
              const currentLatency = Math.round(now - startTime);

              bodyEl.innerHTML = renderMarkdown(fullResponseText) + '<span class="streaming-cursor"></span>';
              
              footerEl.innerHTML = `
                <span class="telemetry-highlight">⚡ ${liveSpeed} T/s</span>
                <span>⏱️ TTFT: ${ttft}ms</span>
                <span>⏳ ${currentLatency}ms</span>
                <span>📝 ~${tokenCountEstimate} tokens</span>
              `;

              updateGlobalTelemetry(liveSpeed, ttft, currentLatency, tokenCountEstimate);
              scrollChatToBottom();
            }
          } catch (e) {}
        }
      }

      const endTime = performance.now();
      const totalLatency = Math.round(endTime - startTime);
      const ttft = firstTokenTime ? Math.round(firstTokenTime - startTime) : totalLatency;
      const completionTokens = finalUsage?.completion_tokens || tokenCountEstimate || 1;
      const finalSpeed = totalLatency > 0 ? ((completionTokens / (totalLatency / 1000))).toFixed(1) : '0.0';

      bodyEl.innerHTML = renderMarkdown(fullResponseText);
      footerEl.innerHTML = `
        <span class="telemetry-highlight">⚡ ${finalSpeed} T/s</span>
        <span>⏱️ TTFT: ${ttft}ms</span>
        <span>⏳ Latency: ${totalLatency}ms</span>
        <span>📝 ${completionTokens} tokens</span>
      `;

      updateGlobalTelemetry(finalSpeed, ttft, totalLatency, completionTokens);

      state.messages.push({
        role: 'assistant',
        content: fullResponseText,
        stats: { speed: finalSpeed, ttft, latency: totalLatency, completionTokens }
      });
    }

    copyBtn.onclick = () => {
      navigator.clipboard.writeText(fullResponseText);
      copyBtn.innerHTML = '<i data-lucide="check" class="icon-xs"></i> <span>Copied!</span>';
      setTimeout(() => {
        copyBtn.innerHTML = '<i data-lucide="copy" class="icon-xs"></i> <span>Copy</span>';
        lucide.createIcons();
      }, 1800);
    };

  } catch (err) {
    if (err.name === 'AbortError') {
      bodyEl.innerHTML = renderMarkdown(fullResponseText) + ' <em>(Transmission halted)</em>';
      footerEl.innerHTML = '<span style="color:var(--text-dim);">Halted by Operator</span>';
    } else {
      bodyEl.innerHTML = `
        <div style="color:#fb7185; background:rgba(244,63,94,0.1); border:1px solid rgba(244,63,94,0.3); padding:0.85rem; border-radius:8px;">
          <strong>Neural Gateway Error:</strong> ${err.message}
        </div>
      `;
      footerEl.innerHTML = '<span style="color:#fb7185;">Transmission Failed</span>';
    }
  } finally {
    state.isGenerating = false;
    toggleGeneratingUI(false);
    highlightCodeBlocks(bodyEl);
    lucide.createIcons();
    scrollChatToBottom();
  }
}

function stopGeneration() {
  if (state.abortController) {
    state.abortController.abort();
  }
}

function toggleGeneratingUI(isGen) {
  if (isGen) {
    elements.btnSubmit.classList.add('hidden');
    elements.btnStop.classList.remove('hidden');
  } else {
    elements.btnSubmit.classList.remove('hidden');
    elements.btnStop.classList.add('hidden');
  }
}

function updateGlobalTelemetry(speed, ttft, latency, completionTokens) {
  elements.statSpeed.textContent = `${speed} T/s`;
  elements.statTtft.textContent = `${ttft} ms`;
  elements.statLatency.textContent = `${latency} ms`;
  elements.statTokens.textContent = `${completionTokens} tokens`;
  elements.headerSpeedValue.textContent = `${speed} T/s`;
}

function estimateTokens(str) {
  return Math.max(1, Math.ceil(str.trim().length / 4));
}

function estimateTokenDelta(delta) {
  return Math.max(1, Math.ceil(delta.length / 3.8));
}

function renderMarkdown(md) {
  if (!md) return '';
  if (window.marked) {
    return marked.parse(md);
  }
  return md.replace(/\n/g, '<br>');
}

function highlightCodeBlocks(container) {
  if (window.Prism) {
    container.querySelectorAll('pre code').forEach((block) => {
      Prism.highlightElement(block);
    });
  }
}

function scrollChatToBottom() {
  elements.messagesContainer.scrollTop = elements.messagesContainer.scrollHeight;
}

// Blueprint Export Modal
function openViewCodeModal() {
  updateCodeSnippet();
  elements.viewCodeModal.classList.remove('hidden');
}

function closeViewCodeModal() {
  elements.viewCodeModal.classList.add('hidden');
}

function updateCodeSnippet() {
  const currentKey = state.apiKey ? state.apiKey : 'YOUR_GROQ_API_KEY';
  const lastUserMsg = state.messages.filter(m => m.role === 'user').slice(-1)[0]?.content || 'Explain the theory of relativity in one paragraph.';

  let snippet = '';
  if (state.activeCodeLang === 'curl') {
    snippet = `curl -X POST "https://api.groq.com/openai/v1/chat/completions" \\
  -H "Authorization: Bearer ${currentKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "${state.model}",
    "messages": [
      {"role": "system", "content": "${state.systemPrompt}"},
      {"role": "user", "content": "${lastUserMsg.replace(/"/g, '\\"')}"}
    ],
    "temperature": ${state.temperature},
    "max_completion_tokens": ${state.maxTokens},
    "top_p": ${state.topP},
    "stream": ${state.stream}
  }'`;
    elements.codeSnippetBox.className = 'language-bash';
  } else if (state.activeCodeLang === 'python') {
    snippet = `import os
from groq import Groq

# Initialize Velox Core client with Groq backend
client = Groq(
    api_key=os.environ.get("GROQ_API_KEY", "${currentKey}")
)

response = client.chat.completions.create(
    model="${state.model}",
    messages=[
        {"role": "system", "content": "${state.systemPrompt}"},
        {"role": "user", "content": "${lastUserMsg.replace(/"/g, '\\"')}"}
    ],
    temperature=${state.temperature},
    max_completion_tokens=${state.maxTokens},
    top_p=${state.topP},
    stream=${state.stream ? 'True' : 'False'}
)

if ${state.stream ? 'True' : 'False'}:
    for chunk in response:
        print(chunk.choices[0].delta.content or "", end="")
else:
    print(response.choices[0].message.content)`;
    elements.codeSnippetBox.className = 'language-python';
  } else {
    snippet = `import Groq from "groq-sdk";

const groq = new Groq({ 
  apiKey: process.env.GROQ_API_KEY || "${currentKey}",
  dangerouslyAllowBrowser: true 
});

async function runVelox() {
  const stream = await groq.chat.completions.create({
    model: "${state.model}",
    messages: [
      { role: "system", content: "${state.systemPrompt}" },
      { role: "user", content: "${lastUserMsg.replace(/"/g, '\\"')}" }
    ],
    temperature: ${state.temperature},
    max_completion_tokens: ${state.maxTokens},
    top_p: ${state.topP},
    stream: ${state.stream}
  });

  if (${state.stream}) {
    for await (const chunk of stream) {
      process.stdout.write(chunk.choices[0]?.delta?.content || "");
    }
  } else {
    console.log(stream.choices[0]?.message?.content);
  }
}

runVelox();`;
    elements.codeSnippetBox.className = 'language-javascript';
  }

  elements.codeSnippetBox.textContent = snippet;
  if (window.Prism) {
    Prism.highlightElement(elements.codeSnippetBox);
  }
}

function copyCodeSnippet() {
  const code = elements.codeSnippetBox.textContent;
  navigator.clipboard.writeText(code);
  elements.copySnippetText.textContent = 'Copied!';
  setTimeout(() => {
    elements.copySnippetText.textContent = 'Copy Blueprint';
  }, 1800);
}

document.addEventListener('DOMContentLoaded', init);
