importScripts('utils.js');

// --- Configuração do Menu de Contexto ---
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'change_case_parent',
    title: chrome.i18n.getMessage('contextMenuParent') || 'Change Case',
    contexts: ['selection']
  });

  const menuItems = [
    { id: 'ctx_toCapitalize', labelKey: 'btnCapitalize', defaultLabel: 'Sentence case' },
    { id: 'ctx_toTitleCase', labelKey: 'btnTitleCase', defaultLabel: 'Title Case' },
    { id: 'ctx_toUppercase', labelKey: 'btnUppercase', defaultLabel: 'UPPERCASE' },
    { id: 'ctx_toLowercase', labelKey: 'btnLowercase', defaultLabel: 'lowercase' },
    { id: 'ctx_separator_1', type: 'separator' },
    { id: 'ctx_toConstantCase', labelKey: 'btnConstantCase', defaultLabel: 'CONSTANT_CASE' },
    { id: 'ctx_toPascalCase', labelKey: 'btnPascalCase', defaultLabel: 'PascalCase' },
    { id: 'ctx_toCamelCase', labelKey: 'btnCamelCase', defaultLabel: 'camelCase' },
    { id: 'ctx_toSnakeCase', labelKey: 'btnSnakeCase', defaultLabel: 'snake_case' },
    { id: 'ctx_toDotCase', labelKey: 'btnDotCase', defaultLabel: 'dot.case' },
    { id: 'ctx_toParamCase', labelKey: 'btnParamCase', defaultLabel: 'param-case' },
    { id: 'ctx_toNoAccents', labelKey: 'btnNoAccents', defaultLabel: 'No accents' }
  ];

  menuItems.forEach((item) => {
    if (item.type === 'separator') {
      chrome.contextMenus.create({
        id: item.id,
        parentId: 'change_case_parent',
        type: 'separator',
        contexts: ['selection']
      });
    } else {
      chrome.contextMenus.create({
        id: item.id,
        parentId: 'change_case_parent',
        title: chrome.i18n.getMessage(item.labelKey) || item.defaultLabel,
        contexts: ['selection']
      });
    }
  });
});

/**
 * Função injetada na página para aplicar o texto ou copiar com feedback toast discreto
 */
function injectTextOrCopy(convertedText, labelText) {
  const activeEl = document.activeElement;
  const isInput = activeEl && (
    activeEl.tagName === 'INPUT' ||
    activeEl.tagName === 'TEXTAREA' ||
    activeEl.isContentEditable
  );

  let replaced = false;

  if (isInput && !activeEl.isContentEditable && typeof activeEl.selectionStart === 'number') {
    const start = activeEl.selectionStart;
    const end = activeEl.selectionEnd;
    activeEl.setRangeText(convertedText, start, end, 'select');
    activeEl.dispatchEvent(new Event('input', { bubbles: true }));
    replaced = true;
  } else if (document.queryCommandSupported && document.queryCommandSupported('insertText')) {
    replaced = document.execCommand('insertText', false, convertedText);
  }

  if (!replaced) {
    navigator.clipboard.writeText(convertedText).then(() => {
      showToast(labelText ? `${labelText}: Copied!` : 'Copied to clipboard!');
    }).catch(() => {
      showToast('Error copying to clipboard');
    });
  }

  function showToast(message) {
    const existing = document.getElementById('change-case-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'change-case-toast';
    toast.textContent = message;
    Object.assign(toast.style, {
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      backgroundColor: '#1f2937',
      color: '#ffffff',
      padding: '10px 18px',
      borderRadius: '8px',
      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: '13px',
      fontWeight: '500',
      zIndex: '2147483647',
      transition: 'opacity 0.25s ease, transform 0.25s ease',
      opacity: '0',
      transform: 'translateY(10px)',
      pointerEvents: 'none'
    });

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    });

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }
}

// Manipula cliques no Menu de Contexto
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!info.selectionText || !tab?.id) return;

  const actionName = info.menuItemId.replace('ctx_', '');
  const converterFn = converters[actionName];

  if (!converterFn) return;

  const convertedText = converterFn(info.selectionText);

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: injectTextOrCopy,
    args: [convertedText, actionName]
  });
});

// Manipula Atalhos de Teclado (Commands) de forma 100% segura (sem new Function)
chrome.commands.onCommand.addListener(async (command, tab) => {
  if (!tab?.id) return;

  let converterName = '';
  if (command === 'convert-uppercase') converterName = 'toUppercase';
  else if (command === 'convert-lowercase') converterName = 'toLowercase';
  else if (command === 'convert-titlecase') converterName = 'toTitleCase';
  else if (command === 'convert-camelcase') converterName = 'toCamelCase';

  const converterFn = converters[converterName];
  if (!converterFn) return;

  // Primeiro recuperamos o texto selecionado na aba atual
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => window.getSelection().toString()
    });

    const selection = results?.[0]?.result;

    if (selection) {
      const convertedText = converterFn(selection);
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: injectTextOrCopy,
        args: [convertedText, converterName]
      });
    }
  } catch (err) {
    console.error('Change Case shortcut execution failed:', err);
  }
});
