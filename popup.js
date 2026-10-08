// --- Funções de Conversão de Texto ---

/**
 * Converte "este é um texto. outro texto." para "Este é um texto. Outro texto."
 * (Suporta caracteres Unicode/acentuados após pontuação)
 */
function toCapitalize(text) {
  if (!text) return '';
  
  // 1. Converte tudo para minúsculo para normalizar
  let lowerText = text.toLowerCase();
  
  // 2. Capitaliza a PRIMEIRA letra da string inteira (suporta caracteres unicode)
  let sentenceCaseText = lowerText.replace(/^(\s*[\p{L}])/u, (match) => match.toUpperCase());

  // 3. Capitaliza a letra após pontuação final (., ?, !) incluindo acentuadas
  return sentenceCaseText.replace(/([.?!]\s+)([\p{L}])/gu, (match, punctuationAndSpace, letter) => {
    return punctuationAndSpace + letter.toUpperCase();
  });
}

/**
 * Converte "este é um texto" para "Este é um Texto"
 * Regra: Mantém palavras com 2 ou menos letras em minúsculo,
 * exceto se for a primeira palavra. Lida bem com quebras de linha e múltiplos espaços.
 */
function toTitleCase(text) {
  if (!text) return '';
  
  // Divide por quebras de linha primeiro para preservar parágrafos
  return text.split(/(\r\n|\n|\r)/).map((segment) => {
    if (segment === '\n' || segment === '\r' || segment === '\r\n') return segment;
    
    let words = segment.toLowerCase().split(/(\s+)/);
    let wordIndex = 0;
    
    return words.map((chunk) => {
      // Se for apenas espaços em branco, mantém
      if (/^\s*$/.test(chunk)) return chunk;
      
      let isFirstWord = wordIndex === 0;
      wordIndex++;

      let firstLetterMatch = chunk.match(/[\p{L}]/u);
      if (!firstLetterMatch) return chunk;

      let firstLetterIndex = firstLetterMatch.index;
      let pureWord = chunk.replace(/[^\p{L}]/gu, '');

      if (pureWord.length <= 2 && !isFirstWord) {
        return chunk;
      } else {
        return (
          chunk.slice(0, firstLetterIndex) +
          chunk.charAt(firstLetterIndex).toUpperCase() +
          chunk.slice(firstLetterIndex + 1)
        );
      }
    }).join('');
  }).join('');
}

/**
 * Converte "Este é um Texto" para "ESTE É UM TEXTO"
 */
function toUppercase(text) {
  if (!text) return '';
  return text.toUpperCase();
}

/**
 * Converte "Este é um Texto" para "este é um texto"
 */
function toLowercase(text) {
  if (!text) return '';
  return text.toLowerCase();
}

// --- Funções Auxiliares e Avançadas ---

/**
 * Quebra o texto em array de palavras limpas.
 * @param {string} text
 * @returns {string[]} - Array de palavras em minúsculo
 */
function _getWords(text) {
  if (!text) return [];

  const normalizedText = text
    // Remove acentos
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    // Separa siglas e palavras contíguas: XMLHttp -> XML Http
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    // Insere espaço antes de letra maiúscula: camelCase -> camel Case
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    // Substitui separadores (underscore, traço, ponto) por espaço
    .replace(/[._\-]+/g, ' ')
    // Remove toda pontuação restante (mantém letras e números)
    .replace(/[^\w\s]/g, '') 
    .toLowerCase();

  return normalizedText.split(/\s+/).filter(Boolean);
}

/**
 * Converte "olá mundo" para "ola mundo"
 */
function toNoAccents(text) {
  if (!text) return '';
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/**
 * Capitaliza a primeira letra de uma palavra.
 */
function _capitalizeWord(word) {
  if (!word) return '';
  return word.charAt(0).toUpperCase() + word.slice(1);
}

/**
 * Converte "este é um texto" para "ESTE_E_UM_TEXTO"
 */
function toConstantCase(text) {
  return _getWords(text).map(w => w.toUpperCase()).join('_');
}

/**
 * Converte "este é um texto" para "EsteEUmTexto"
 */
function toPascalCase(text) {
  const words = _getWords(text);
  return words.map(_capitalizeWord).join('');
}

/**
 * Converte "este é um texto" para "esteEUmTexto"
 */
function toCamelCase(text) {
  const words = _getWords(text);
  return words.map((word, index) => {
    if (index === 0) {
      return word.toLowerCase();
    }
    return _capitalizeWord(word);
  }).join('');
}

/**
 * Converte "este é um texto" para "este_e_um_texto"
 */
function toSnakeCase(text) {
  return _getWords(text).join('_');
}

/**
 * Converte "este é um texto" para "este.e.um.texto"
 */
function toDotCase(text) {
  return _getWords(text).join('.');
}

/**
 * Converte "este é um texto" para "este-e-um-texto" (kebab-case)
 */
function toParamCase(text) {
  return _getWords(text).join('-');
}

// --- Lógica Principal da Extensão ---

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
    { id: 'btnCapitalize', fn: toCapitalize },
    { id: 'btnTitleCase', fn: toTitleCase },
    { id: 'btnUppercase', fn: toUppercase },
    { id: 'btnLowercase', fn: toLowercase },
    { id: 'btnConstantCase', fn: toConstantCase },
    { id: 'btnPascalCase', fn: toPascalCase },
    { id: 'btnCamelCase', fn: toCamelCase },
    { id: 'btnSnakeCase', fn: toSnakeCase },
    { id: 'btnDotCase', fn: toDotCase },
    { id: 'btnParamCase', fn: toParamCase },
    { id: 'btnNoAccents', fn: toNoAccents }
  ];

  buttonActions.forEach(({ id, fn }) => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener('click', (event) => {
        processClipboard(fn, event.currentTarget);
      });
    }
  });
});