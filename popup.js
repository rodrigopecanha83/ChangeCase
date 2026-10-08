// --- Funções de Conversão de Texto (Antigas) ---

/**
 * Converte "este é um texto. outro texto." para "Este é um texto. Outro texto."
 * (Implementação corrigida para "Sentence Case")
 */
function toCapitalize(text) {
  if (!text) return '';
  
  // 1. Converte tudo para minúsculo para normalizar
  let lowerText = text.toLowerCase();
  
  // 2. Capitaliza a PRIMEIRA letra da string inteira
  let sentenceCaseText = lowerText.charAt(0).toUpperCase() + lowerText.slice(1);

  // 3. Capitaliza a letra após pontuação final (., ?, !)
  // Usa regex para encontrar (. OU ? OU !) seguido de (espaços) e (uma letra)
  // e capitaliza essa letra.
  return sentenceCaseText.replace(/([.?!]\s+)(\w)/g, (match, punctuationAndSpace, letter) => {
    // Retorna a pontuação + espaço + a letra em maiúsculo
    return punctuationAndSpace + letter.toUpperCase();
  });
}

/**
 * Converte "este é um texto" para "Este é um Texto"
 * Regra: Mantém palavras com 2 ou menos letras em minúsculo,
 * exceto se for a primeira palavra.
 */
function toTitleCase(text) {
  if (!text) return '';
  
  let words = text.toLowerCase().split(' ');
  let titleCasedWords = words.map((word, index) => {
    // Pega a primeira letra da palavra para capitalizar
    let firstLetter = word.charAt(0);
    // Pega o resto da palavra
    let restOfWord = word.slice(1);

    if (word.length <= 2 && index !== 0) {
      return word;
    } else {
      // Recria a palavra com a primeira letra maiúscula
      // Isso preserva a pontuação no final (ex: "texto?")
      return firstLetter.toUpperCase() + restOfWord;
    }
  });
  return titleCasedWords.join(' ');
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


// --- NOVAS FUNÇÕES DE CONVERSÃO ---

/**
 * Função "ajudante" para quebrar o texto em palavras.
 * (Implementação corrigida para remover pontuação)
 * @param {string} text
 * @returns {string[]} - Array de palavras em minúsculo
 */
function _getWords(text) {
  if (!text) return [];

  const normalizedText = text
    // Remove acentos
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    // Insere espaço antes de letra maiúscula (camelCase -> camel Case)
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    // Substitui separadores (underscore, traço, ponto) por espaço
    .replace(/[._\-]+/g, ' ')
    
    // --- MUDANÇA AQUI ---
    // Remove toda pontuação restante (caracteres que NÃO são letras, números ou espaços)
    // Isso limpa os '?' e '.' do final das palavras
    .replace(/[^\w\s]/g, '') 
    
    // Converte tudo para minúsculo
    .toLowerCase();

  // Quebra por espaços e remove itens vazios (ex: múltiplos espaços)
  return normalizedText.split(' ').filter(Boolean);
}

/**
 * Converte "olá mundo" para "ola mundo"
 */
function toNoAccents(text) {
  if (!text) return '';
  // Usa a normalização Unicode NFD para separar a letra do acento
  // e depois remove os acentos (range U+0300 a U+036f)
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/**
 * Capitaliza a primeira letra de uma string.
 * (Função ajudante interna para PascalCase/TitleCase)
 */
function _capitalizeWord(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

/**
 * Converte "este é um texto" para "EsteEUmTexto"
 */
function toPascalCase(text) {
  const words = _getWords(text);
  // Capitaliza cada palavra e junta sem espaço
  return words.map(_capitalizeWord).join('');
}

/**
 * Converte "este é um texto" para "esteEUmTexto"
 */
function toCamelCase(text) {
  const words = _getWords(text);
  // Capitaliza todas, exceto a primeira
  return words.map((word, index) => {
    if (index === 0) {
      return word.toLowerCase(); // A primeira é sempre minúscula
    }
    return _capitalizeWord(word);
  }).join('');
}

/**
 * Converte "este é um texto" para "este_e_um_texto"
 */
function toSnakeCase(text) {
  // Pega as palavras e junta com underscore
  return _getWords(text).join('_');
}

/**
 * Converte "este é um texto" para "este.e.um.texto"
 */
function toDotCase(text) {
  // Pega as palavras e junta com ponto
  return _getWords(text).join('.');
}

/**
 * Converte "este é um texto" para "este-e-um-texto"
 */
function toParamCase(text) {
  // Pega as palavras e junta com traço (também chamado kebab-case)
  return _getWords(text).join('-');
}


// --- Lógica Principal da Extensão (Sem modificação) ---

/**
 * Função principal que lê o clipboard, aplica uma conversão,
 * e dá feedback visual antes de fechar.
 *
 * @param {function} conversionFunction - A função de conversão (ex: toTitleCase)
 * @param {HTMLElement} buttonElement - O elemento do botão que foi clicado
 */
async function processClipboard(conversionFunction, buttonElement) {
  try {
    // 1. Ler o texto da área de transferência
    const text = await navigator.clipboard.readText();
    
    // 2. Aplicar a função de conversão
    const convertedText = conversionFunction(text);
    
    // 3. Escrever o novo texto na área de transferência
    await navigator.clipboard.writeText(convertedText);
    
    // --- FEEDBACK VISUAL DE SUCESSO ---
    
    // 4. Mudar o ESTILO (cor) do botão clicado
    buttonElement.classList.add('clicked');
    // (NÃO mudamos o texto)

    // 5. Esperar 400ms e SÓ ENTÃO fechar o popup
    setTimeout(() => {
      window.close();
    }, 400); // (Um pouco mais rápido)

  } catch (err) {
    console.error('Falha ao processar o clipboard: ', err);
    
    // --- FEEDBACK VISUAL DE ERRO ---
    buttonElement.classList.add('error');
    // (NÃO mudamos o texto)

    // 6. Esperar um pouco no erro para o usuário ver
     setTimeout(() => {
      window.close();
    }, 1000); // 1 segundo
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

// --- Adicionar "Ouvintes" de Eventos ---

// Espera o HTML (popup.html) carregar completamente
document.addEventListener('DOMContentLoaded', () => {
  // Aplica as traduções conforme o idioma do navegador
  applyTranslations();
  
  // Modificamos os 'listeners' para passar o próprio elemento do botão
  // O 'event.currentTarget' é o botão que disparou o evento de clique.

  // Listeners antigos
  document.getElementById('btnCapitalize').addEventListener('click', (event) => {
    processClipboard(toCapitalize, event.currentTarget);
  });
  
  document.getElementById('btnTitleCase').addEventListener('click', (event) => {
    processClipboard(toTitleCase, event.currentTarget);
  });

  document.getElementById('btnUppercase').addEventListener('click', (event) => {
    processClipboard(toUppercase, event.currentTarget);
  });

  document.getElementById('btnLowercase').addEventListener('click', (event) => {
    processClipboard(toLowercase, event.currentTarget);
  });

  // --- NOVOS LISTENERS ---
  // Adiciona os "ouvintes" para os 6 novos botões
  
  document.getElementById('btnPascalCase').addEventListener('click', (event) => {
    processClipboard(toPascalCase, event.currentTarget);
  });

  document.getElementById('btnCamelCase').addEventListener('click', (event) => {
    processClipboard(toCamelCase, event.currentTarget);
  });

  document.getElementById('btnSnakeCase').addEventListener('click', (event) => {
    processClipboard(toSnakeCase, event.currentTarget);
  });

  document.getElementById('btnDotCase').addEventListener('click', (event) => {
    processClipboard(toDotCase, event.currentTarget);
  });

  document.getElementById('btnParamCase').addEventListener('click', (event) => {
    processClipboard(toParamCase, event.currentTarget);
  });

  document.getElementById('btnNoAccents').addEventListener('click', (event) => {
    processClipboard(toNoAccents, event.currentTarget);
  });

});