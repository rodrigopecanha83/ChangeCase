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

// Helper de injeção na página
function applyTextReplacement(text) {
  const activeEl = document.activeElement;
  const isInput = activeEl && (
    activeEl.tagName === 'INPUT' ||
    activeEl.tagName === 'TEXTAREA' ||
    activeEl.isContentEditable
  );

  if (isInput && !activeEl.isContentEditable && typeof activeEl.selectionStart === 'number') {
    const start = activeEl.selectionStart;
    const end = activeEl.selectionEnd;
    activeEl.setRangeText(text, start, end, 'select');
    activeEl.dispatchEvent(new Event('input', { bubbles: true }));
  } else if (document.queryCommandSupported && document.queryCommandSupported('insertText')) {
    const success = document.execCommand('insertText', false, text);
    if (!success) {
      navigator.clipboard.writeText(text);
    }
  } else {
    navigator.clipboard.writeText(text);
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
    func: applyTextReplacement,
    args: [convertedText]
  });
});

// --- Configuração dos Atalhos de Teclado (Commands) ---
chrome.commands.onCommand.addListener(async (command, tab) => {
  let converterName = '';
  if (command === 'convert-uppercase') converterName = 'toUppercase';
  else if (command === 'convert-lowercase') converterName = 'toLowercase';
  else if (command === 'convert-titlecase') converterName = 'toTitleCase';
  else if (command === 'convert-camelcase') converterName = 'toCamelCase';

  const converterFn = converters[converterName];
  if (!converterFn) return;

  if (tab?.id) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (fnSource) => {
        const converter = new Function('text', 'return (' + fnSource + ')(text);');
        const selected = window.getSelection().toString();
        
        if (selected) {
          const result = converter(selected);
          
          const activeEl = document.activeElement;
          const isInput = activeEl && (
            activeEl.tagName === 'INPUT' ||
            activeEl.tagName === 'TEXTAREA' ||
            activeEl.isContentEditable
          );

          if (isInput && !activeEl.isContentEditable && typeof activeEl.selectionStart === 'number') {
            const start = activeEl.selectionStart;
            const end = activeEl.selectionEnd;
            activeEl.setRangeText(result, start, end, 'select');
            activeEl.dispatchEvent(new Event('input', { bubbles: true }));
          } else if (document.queryCommandSupported && document.queryCommandSupported('insertText')) {
            const success = document.execCommand('insertText', false, result);
            if (!success) {
              navigator.clipboard.writeText(result);
            }
          } else {
            navigator.clipboard.writeText(result);
          }
        } else {
          // Se não houver seleção, atualiza o clipboard diretamente
          navigator.clipboard.readText().then(clipText => {
            if (clipText) {
              navigator.clipboard.writeText(converter(clipText));
            }
          }).catch(console.error);
        }
      },
      args: [converterFn.toString()]
    });
  }
});
