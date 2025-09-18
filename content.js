const SITE_CONFIGS = {
  'chat.openai.com': {
    name: 'ChatGPT',
    inputSelector: 'div.ProseMirror#prompt-textarea, textarea#prompt-textarea',
    buttonContainer: 'div[data-testid="composer-trailing-actions"]',
    fallbackContainer: 'form button[data-testid="send-button"]',
    getText: (el) => el.classList.contains('ProseMirror') ? el.textContent.trim() : el.value.trim(),
    setText: (el, text) => {
      if (el.classList.contains('ProseMirror')) {
        el.textContent = text;
        el.dispatchEvent(new Event('input', { bubbles: true }));
      } else {
        el.value = text;
        el.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
  },
  'chatgpt.com': {
    name: 'ChatGPT',
    inputSelector: 'div.ProseMirror#prompt-textarea, textarea#prompt-textarea',
    buttonContainer: 'div[data-testid="composer-trailing-actions"]',
    fallbackContainer: 'form button[data-testid="send-button"]',
    getText: (el) => el.classList.contains('ProseMirror') ? el.textContent.trim() : el.value.trim(),
    setText: (el, text) => {
      if (el.classList.contains('ProseMirror')) {
        el.textContent = text;
        el.dispatchEvent(new Event('input', { bubbles: true }));
      } else {
        el.value = text;
        el.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
  },
  'claude.ai': {
    name: 'Claude',
    inputSelector: 'div.ProseMirror[contenteditable="true"], textarea[placeholder*="message"], div[contenteditable="true"][role="textbox"]',
    buttonContainer: 'div[data-testid="composer-trailing-actions"], div[class*="composer"] div[class*="actions"], div[class*="send-button-container"]',
    fallbackContainer: 'button[aria-label*="Send"], button[title*="Send"], form button[type="submit"]',
    getText: (el) => {
      if (el.contentEditable === 'true') return el.textContent.trim();
      return el.value.trim();
    },
    setText: (el, text) => {
      if (el.contentEditable === 'true') {
        el.textContent = text;
        el.dispatchEvent(new Event('input', { bubbles: true }));
      } else {
        el.value = text;
        el.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
  },
  'gemini.google.com': {
    name: 'Gemini',
    inputSelector: 'div.ql-editor[contenteditable="true"], textarea[aria-label*="prompt"], div[contenteditable="true"][role="textbox"]',
    buttonContainer: 'div[data-test-id="send-button-container"], div[class*="send-button"], div[class*="composer-controls"]',
    fallbackContainer: 'button[aria-label*="Send"], button[data-test-id="send-button"]',
    getText: (el) => {
      if (el.contentEditable === 'true') return el.textContent.trim();
      return el.value.trim();
    },
    setText: (el, text) => {
      if (el.contentEditable === 'true') {
        el.textContent = text;
        el.dispatchEvent(new Event('input', { bubbles: true }));
      } else {
        el.value = text;
        el.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
  },
  'chat.deepseek.com': {
    name: 'DeepSeek',
    inputSelector: 'textarea[placeholder*="message"], div[contenteditable="true"], textarea.chat-input',
    buttonContainer: 'div[class*="send-button"], div[class*="composer-actions"]',
    fallbackContainer: 'button[title*="Send"], button[aria-label*="Send"]',
    getText: (el) => el.contentEditable === 'true' ? el.textContent.trim() : el.value.trim(),
    setText: (el, text) => {
      if (el.contentEditable === 'true') {
        el.textContent = text;
        el.dispatchEvent(new Event('input', { bubbles: true }));
      } else {
        el.value = text;
        el.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
  },
  'perplexity.ai': {
    name: 'Perplexity',
    inputSelector: 'textarea[placeholder*="Ask"], div[contenteditable="true"], textarea.search-input',
    buttonContainer: 'div[class*="submit"], div[class*="send-button"]',
    fallbackContainer: 'button[aria-label*="Submit"], button[type="submit"]',
    getText: (el) => el.contentEditable === 'true' ? el.textContent.trim() : el.value.trim(),
    setText: (el, text) => {
      if (el.contentEditable === 'true') {
        el.textContent = text;
        el.dispatchEvent(new Event('input', { bubbles: true }));
      } else {
        el.value = text;
        el.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
  },
  'copilot.microsoft.com': {
    name: 'Copilot',
    inputSelector: 'textarea[placeholder*="Ask"], div[contenteditable="true"], cib-text-input textarea',
    buttonContainer: 'div[class*="submit-button"], div[class*="send-container"]',
    fallbackContainer: 'button[aria-label*="Submit"], button[title*="Send"]',
    getText: (el) => el.contentEditable === 'true' ? el.textContent.trim() : el.value.trim(),
    setText: (el, text) => {
      if (el.contentEditable === 'true') {
        el.textContent = text;
        el.dispatchEvent(new Event('input', { bubbles: true }));
      } else {
        el.value = text;
        el.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
  }
};

function cleanupResponse(text) {
  return text
    .replace(/^\*\*Prompt:\*\*\s*/i, '')  // Remove **Prompt:** from start
    .replace(/\*\*/g, '')                  // Remove all ** markers
    .trim();
}
function structureResponse(text) {
  // Remove any existing markdown code blocks
  let structuredText = text
    .replace(/^```(?:markdown|text)?\s*/, '')
    .replace(/```$/, '')
    .trim();

  // Clean up the response first
  structuredText = cleanupResponse(structuredText);

  // Split into paragraphs and process
  const paragraphs = structuredText.split(/\n\s*\n/).filter(p => p.trim());

  if (paragraphs.length === 0) return structuredText;

  let result = [];

  for (let i = 0; i < paragraphs.length; i++) {
    let paragraph = paragraphs[i].trim();

    // Skip if empty
    if (!paragraph) continue;

    // Check if it's a title/heading (first paragraph or starts with certain patterns)
    if (i === 0 && paragraph.length < 100 && !paragraph.includes('.') &&
      (paragraph.match(/^[A-Z][^.!?]*$/) || paragraph.includes(':'))) {
      result.push(paragraph + '\n'); // Add single line break after title
    }
    // Check for list items or bullet points - keep as is
    else if (paragraph.match(/^[-•*]\s+/) || paragraph.match(/^\d+\.\s+/)) {
      result.push(paragraph);
    }
    // Check for section headers (short lines ending with colon)
    else if (paragraph.length < 80 && paragraph.endsWith(':')) {
      result.push(paragraph + '\n'); // Add line break after section header
    }
    // Regular paragraph
    else {
      // Break long paragraphs into sentences for better readability
      if (paragraph.length > 300) {
        const sentences = paragraph.match(/[^.!?]+[.!?]+/g) || [paragraph];
        const chunks = [];
        let currentChunk = '';

        for (const sentence of sentences) {
          if (currentChunk.length + sentence.length > 250 && currentChunk) {
            chunks.push(currentChunk.trim());
            currentChunk = sentence;
          } else {
            currentChunk += sentence;
          }
        }
        if (currentChunk) chunks.push(currentChunk.trim());

        // Join chunks with single line break (like Shift+Enter)
        result.push(chunks.join('\n'));
      } else {
        result.push(paragraph);
      }
    }
  }

  // Join sections with double line breaks (like pressing Enter twice)
  return result.join('\n\n').trim();
}

class TypingEffect {
  constructor(element, config, onComplete = null) {
    this.element = element;
    this.config = config;
    this.onComplete = onComplete;
    this.currentTypingId = null;
    this.isTyping = false;
  }
  simulateGenericLineBreak(element) {
    const event = new KeyboardEvent('keydown', {
      key: 'Enter',
      code: 'Enter',
      shiftKey: true,
      bubbles: true,
      cancelable: true,
    });
    console.log('Dispatched Shift+Enter keydown event', element.dispatchEvent(event));
    return element.dispatchEvent(event);
  }
  simulateClaudeLineBreak(element) {
    const keyboardEvent = new KeyboardEvent('keydown', {
      key: 'Enter',
      code: 'Enter',
      keyCode: 13,
      which: 13,
      shiftKey: true,
      bubbles: true,
      cancelable: true
    });

    element.dispatchEvent(keyboardEvent);

    // Fallback DOM insertion
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const br = document.createElement('br');
      range.insertNode(br);
      range.setStartAfter(br);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }

    element.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  }

  simulateGeminiLineBreak(element) {
    // Gemini uses Quill editor, different approach needed
    const inputEvent = new InputEvent('beforeinput', {
      inputType: 'insertLineBreak',
      bubbles: true,
      cancelable: true
    });

    element.dispatchEvent(inputEvent);

    // Manual insertion for Gemini's Quill editor
    if (element.classList.contains('ql-editor')) {
      const br = document.createElement('br');
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      range.insertNode(br);
      range.setStartAfter(br);
      selection.removeAllRanges();
      selection.addRange(range);
    }

    element.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  }
  // Simulate Shift+Enter key press for proper line breaks
  simulateShiftEnter(element) {

    element.focus();
    const hostname = window.location.hostname;

    if (hostname.includes('claude.ai')) {
      // Claude-specific line break
      return this.simulateClaudeLineBreak(element);
    } else if (hostname.includes('gemini.google.com')) {
      // Gemini-specific line break
      return this.simulateGeminiLineBreak(element);
    } else {
      // Generic approach
      return this.simulateGenericLineBreak(element);
    }


  }

  // Insert text at current cursor position
  insertTextAtCursor(element, text) {
    if (element.contentEditable === 'true') {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        const textNode = document.createTextNode(text);
        range.insertNode(textNode);

        // Move cursor after inserted text
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        // Fallback: append to end
        element.appendChild(document.createTextNode(text));
        this.moveCursorToEnd(element);
      }

      element.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
      // For textarea, use traditional method
      const start = element.selectionStart;
      const end = element.selectionEnd;
      const current = element.value;
      element.value = current.substring(0, start) + text + current.substring(end);
      element.selectionStart = element.selectionEnd = start + text.length;
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  // Move cursor to end of element
  moveCursorToEnd(element) {
    if (element.contentEditable === 'true') {
      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(element);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    } else if (element.setSelectionRange) {
      element.setSelectionRange(element.value.length, element.value.length);
    }
  }

  async typeText(text, speed = 30) {
    // Generate unique ID for this typing session
    const typingId = Math.random().toString(36).substr(2, 9);
    this.currentTypingId = typingId;
    this.isTyping = true;

    // Clear current content
    this.config.setText(this.element, '');

    // Focus element and position cursor at start
    this.element.focus();

    // Convert text to array of characters, handling special characters and emojis properly
    const characters = Array.from(text);

    for (let i = 0; i < characters.length; i++) {
      // Check if this typing session was cancelled
      if (this.currentTypingId !== typingId) {
        console.log('Typing cancelled');
        return false;
      }

      const char = characters[i];
      const isNumberedList = /\d\./.test(char);
      // Handle line breaks specially
      if (char === '\n' || isNumberedList) {
        this.simulateShiftEnter(this.element);
      } else {
        // Insert regular character
        this.insertTextAtCursor(this.element, char);
      }

      // Variable speed based on character type
      let currentSpeed = speed;

      if (char === ' ') {
        currentSpeed = speed * 0.5; // Faster for spaces
      } else if (char === '.' || char === '!' || char === '?') {
        currentSpeed = speed * 2; // Slower for sentence endings
      } else if (char === ',' || char === ';' || char === ':') {
        currentSpeed = speed * 1.5; // Slightly slower for punctuation
      } else if (char === '\n') {
        currentSpeed = speed * 1.8; // Slower for line breaks (more dramatic pause)
      }

      // Add some randomness to make it feel more natural
      const randomVariation = (Math.random() - 0.5) * 0.3;
      currentSpeed = Math.max(10, currentSpeed + (currentSpeed * randomVariation));

      await this.delay(currentSpeed);
    }

    this.isTyping = false;

    // Final focus and cursor positioning
    this.element.focus();
    this.moveCursorToEnd(this.element);

    if (this.onComplete) {
      this.onComplete();
    }

    return true;
  }

  stop() {
    this.currentTypingId = null;
    this.isTyping = false;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}


class EnhanceButtonInjector {
  constructor() {
    this.currentSite = this.detectSite();
    this.config = SITE_CONFIGS[this.currentSite];
    this.observer = null;
    this.injected = false;
    this.retryCount = 0;
    this.maxRetries = 20;
    this.typingEffect = null;

    console.log(`Prompt Enhancer: Detected site: ${this.currentSite}`);
    if (!this.config) {
      console.warn(`Prompt Enhancer: Unsupported site: ${this.currentSite}`);
      return;
    }

    this.init();
  }

  detectSite() {
    const hostname = window.location.hostname;

    // Check for exact matches first
    if (SITE_CONFIGS[hostname]) {
      return hostname;
    }

    // Check for partial matches
    for (const site in SITE_CONFIGS) {
      if (hostname.includes(site.replace(/^[^.]+\./, '')) || hostname.endsWith(site)) {
        return site;
      }
    }

    return hostname;
  }

  init() {
    // Try immediate injection
    this.attemptInjection();

    // Set up observers for dynamic content
    this.setupObservers();

    // Retry mechanism for SPAs
    this.setupRetryMechanism();
  }

  setupObservers() {
    // Observe DOM changes
    this.observer = new MutationObserver((mutations) => {
      if (this.injected) return;

      const hasRelevantChanges = mutations.some(mutation => {
        return Array.from(mutation.addedNodes).some(node => {
          return node.nodeType === Node.ELEMENT_NODE &&
            (node.matches && (
              node.matches('form') ||
              node.matches('[class*="composer"]') ||
              node.matches('[class*="input"]') ||
              node.matches('textarea') ||
              node.matches('[contenteditable]')
            ));
        });
      });

      if (hasRelevantChanges) {
        setTimeout(() => this.attemptInjection(), 100);
      }
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false
    });

    // Also observe for URL changes (SPA navigation)
    let currentUrl = window.location.href;
    const urlObserver = new MutationObserver(() => {
      if (window.location.href !== currentUrl) {
        currentUrl = window.location.href;
        this.injected = false;
        this.retryCount = 0;
        // Stop any ongoing typing effect
        if (this.typingEffect) {
          this.typingEffect.stop();
          this.typingEffect = null;
        }
        setTimeout(() => this.attemptInjection(), 500);
      }
    });

    urlObserver.observe(document.body, { childList: true, subtree: true });
  }

  setupRetryMechanism() {
    const retryInterval = setInterval(() => {
      if (this.injected || this.retryCount >= this.maxRetries) {
        clearInterval(retryInterval);
        return;
      }

      this.retryCount++;
      console.log(`Prompt Enhancer: Retry attempt ${this.retryCount}/${this.maxRetries}`);
      this.attemptInjection();
    }, 2000);
  }

  findElement(selector) {
    const selectors = selector.split(', ');
    for (const sel of selectors) {
      const element = document.querySelector(sel.trim());
      if (element) return element;
    }
    return null;
  }

  findInputElement() {
    return this.findElement(this.config.inputSelector);
  }

  findButtonContainer() {
    let container = this.findElement(this.config.buttonContainer);

    if (!container && this.config.fallbackContainer) {
      const fallbackElement = this.findElement(this.config.fallbackContainer);
      if (fallbackElement) {
        container = fallbackElement.parentElement;
      }
    }

    return container;
  }

  attemptInjection() {
    if (this.injected) return;

    const inputElement = this.findInputElement();
    const buttonContainer = this.findButtonContainer();

    console.log('Prompt Enhancer: Attempting injection...', {
      input: !!inputElement,
      container: !!buttonContainer,
      site: this.currentSite
    });

    if (inputElement && buttonContainer) {
      this.injectButton(buttonContainer, inputElement);
    } else {
      console.log('Prompt Enhancer: Elements not found yet, will retry...');
    }
  }

  injectButton(container, inputElement) {
    // Check if button already exists
    if (container.querySelector('.enhance-button')) {
      console.log('Prompt Enhancer: Button already exists');
      this.injected = true;
      return;
    }

    // Create button
    const enhanceButton = document.createElement('button');
    enhanceButton.className = 'enhance-button';
    enhanceButton.setAttribute('aria-label', 'Enhance prompt');
    enhanceButton.setAttribute('title', 'Enhance your prompt');
    enhanceButton.type = 'button'; // Prevent form submission

    enhanceButton.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z"
              fill="currentColor" stroke="currentColor" stroke-width="1"/>
      </svg>
    `;

    // Add click handler
    enhanceButton.addEventListener('click', (event) => {
      this.handleButtonClick(event, inputElement, enhanceButton);
    });

    // Insert button
    try {
      if (container.querySelector('button[type="submit"], button[data-testid="send-button"]')) {
        const sendButton = container.querySelector('button[type="submit"], button[data-testid="send-button"]');
        container.insertBefore(enhanceButton, sendButton);
      } else {
        container.appendChild(enhanceButton);
      }

      console.log('Prompt Enhancer: Button injected successfully');
      this.injected = true;

      if (this.observer) {
        this.observer.disconnect();
      }
    } catch (error) {
      console.error('Prompt Enhancer: Failed to inject button:', error);
    }
  }

  async handleButtonClick(event, inputElement, button) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    console.log('Prompt Enhancer: Button clicked');


    // Stop any ongoing typing effect
    if (this.typingEffect && this.typingEffect.isTyping) {
      this.typingEffect.stop();
      button.disabled = false;
      const originalHTML = button.innerHTML;
      button.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z"
                fill="currentColor" stroke="currentColor" stroke-width="1"/>
        </svg>
      `;
      return;
    }

    // Get current text
    const originalPrompt = this.config.getText(inputElement);
    if (!originalPrompt) {
      alert('Please enter a prompt first!');
      return;
    }

    // Show loading state
    button.disabled = true;
    const originalHTML = button.innerHTML;
    button.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"
                fill="none" stroke-dasharray="31.416" stroke-dashoffset="31.416">
          <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
          <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
        </circle>
      </svg>
    `;

    try {
      // Get settings
      const settings = await new Promise((resolve) => {
        chrome.storage.sync.get(['apiUrl', 'userRole', 'optimizationLevel', 'typingSpeed'], resolve);
      });

      const apiUrl = 'https://apiprompter.visionpanel.site/enhance';
      const userRole = settings.userRole || 'general';
      const optimizationLevel = settings.optimizationLevel || 'conservative';
      const typingSpeed = settings.typingSpeed || 0.5; // Default 30ms per character

      console.log('Prompt Enhancer: Making API request...');

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          original_prompt: originalPrompt,
          user_role: userRole,
          optimization_level: optimizationLevel
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      let enhancedPrompt = data.enhanced_prompt || data.result || data.response;

      if (typeof enhancedPrompt !== 'string') {
        throw new Error('Invalid response format');
      }

      // Clean up the enhanced prompt
      enhancedPrompt = enhancedPrompt
        .replace(/^```(?:markdown)?\s*/, '')
        .replace(/```$/, '')
        .trim();

      // Add this line to clean up the response
      //enhancedPrompt = structureResponse(enhancedPrompt);
      enhancedPrompt = cleanupResponse(enhancedPrompt);

      console.log('Prompt Enhancer: Received enhanced prompt, starting typing effect...');

      // Change button to stop icon during typing
      button.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="6" y="6" width="12" height="12" fill="currentColor" rx="2"/>
        </svg>
      `;

      // Create typing effect
      this.typingEffect = new TypingEffect(inputElement, this.config, () => {
        // Reset button after typing completes
        button.disabled = false;
        button.innerHTML = originalHTML;
        this.typingEffect = null;
      });

      // Start typing effect
      const typingCompleted = await this.typingEffect.typeText(enhancedPrompt, typingSpeed);

      if (!typingCompleted) {
        // Typing was cancelled, reset button
        button.disabled = false;
        button.innerHTML = originalHTML;
        this.typingEffect = null;
      }

    } catch (error) {
      console.error('Prompt Enhancer: API error:', error);
      alert(`Error enhancing prompt: ${error.message}`);

      // Reset button on error
      button.disabled = false;
      button.innerHTML = originalHTML;
      if (this.typingEffect) {
        this.typingEffect.stop();
        this.typingEffect = null;
      }
    }
  }

}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new EnhanceButtonInjector();
  });
} else {
  new EnhanceButtonInjector();
}

// Also initialize on page navigation for SPAs
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    setTimeout(() => new EnhanceButtonInjector(), 1000);
  }
}).observe(document, { subtree: true, childList: true });