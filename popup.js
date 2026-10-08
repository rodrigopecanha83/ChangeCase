// --- Lógica Principal do Popup ---

/**
 * Lê o clipboard, aplica uma conversão e dá feedback visual.
 */
async function processClipboard(conversionFunction, buttonElement) {
  try {
    const text = await navigator.clipboard.readText();
    
    if (!text) {
      throw new Error('Clipboard is empty or contains non-text content');
    }

    const convertedText = conversionFunction(text);
    await navigator.clipboard.writeText(convertedText);
    
    // Feedback visual de sucesso
    buttonElement.classList.add('clicked');

    setTimeout(() => {
      window.close();
    }, 400);

  } catch (err) {
    console.error('Falha ao processar o clipboard: ', err);
    buttonElement.classList.add('error');

    setTimeout(() => {
      window.close();
    }, 1000);
  }
}

// --- Inicialização e Tradução (i18n) ---
function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const messageKey = element.getAttribute('data-i18n');
    const message = chrome.i18n.getMessage(messageKey);
    if (message) {
      element.textContent = message;
    }
  });
}

// --- Adicionar Ouvintes de Eventos ---
document.addEventListener('DOMContentLoaded', () => {
  applyTranslations();

  const buttonActions = [
    { id: 'btnCapitalize', fn: converters.toCapitalize },
    { id: 'btnTitleCase', fn: converters.toTitleCase },
    { id: 'btnUppercase', fn: converters.toUppercase },
    { id: 'btnLowercase', fn: converters.toLowercase },
    { id: 'btnConstantCase', fn: converters.toConstantCase },
    { id: 'btnPascalCase', fn: converters.toPascalCase },
    { id: 'btnCamelCase', fn: converters.toCamelCase },
    { id: 'btnSnakeCase', fn: converters.toSnakeCase },
    { id: 'btnDotCase', fn: converters.toDotCase },
    { id: 'btnParamCase', fn: converters.toParamCase },
    { id: 'btnNoAccents', fn: converters.toNoAccents }
  ];

  buttonActions.forEach(({ id, fn }) => {
    const btn = document.getElementById(id);
    if (btn && fn) {
      btn.addEventListener('click', (event) => {
        processClipboard(fn, event.currentTarget);
      });
    }
  });
});