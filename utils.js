// --- Utilitários de Conversão de Texto Compartilhados ---

/**
 * Converte para "Sentence case" (suporta caracteres Unicode)
 */
function toCapitalize(text) {
  if (!text) return '';
  let lowerText = text.toLowerCase();
  let sentenceCaseText = lowerText.replace(/^(\s*[\p{L}])/u, (match) => match.toUpperCase());
  return sentenceCaseText.replace(/([.?!]\s+)([\p{L}])/gu, (match, punctuationAndSpace, letter) => {
    return punctuationAndSpace + letter.toUpperCase();
  });
}

/**
 * Converte para "Title Case"
 */
function toTitleCase(text) {
  if (!text) return '';
  return text.split(/(\r\n|\n|\r)/).map((segment) => {
    if (segment === '\n' || segment === '\r' || segment === '\r\n') return segment;
    
    let words = segment.toLowerCase().split(/(\s+)/);
    let wordIndex = 0;
    
    return words.map((chunk) => {
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
 * Converte para UPPERCASE
 */
function toUppercase(text) {
  if (!text) return '';
  return text.toUpperCase();
}

/**
 * Converte para lowercase
 */
function toLowercase(text) {
  if (!text) return '';
  return text.toLowerCase();
}

/**
 * Extrai palavras limpas
 */
function _getWords(text) {
  if (!text) return [];
  const normalizedText = text
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[._\-]+/g, ' ')
    .replace(/[^\w\s]/g, '')
    .toLowerCase();

  return normalizedText.split(/\s+/).filter(Boolean);
}

/**
 * Converte para No Accents
 */
function toNoAccents(text) {
  if (!text) return '';
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/**
 * Capitaliza primeira letra
 */
function _capitalizeWord(word) {
  if (!word) return '';
  return word.charAt(0).toUpperCase() + word.slice(1);
}

/**
 * Converte para CONSTANT_CASE
 */
function toConstantCase(text) {
  return _getWords(text).map(w => w.toUpperCase()).join('_');
}

/**
 * Converte para PascalCase
 */
function toPascalCase(text) {
  const words = _getWords(text);
  return words.map(_capitalizeWord).join('');
}

/**
 * Converte para camelCase
 */
function toCamelCase(text) {
  const words = _getWords(text);
  return words.map((word, index) => {
    if (index === 0) return word.toLowerCase();
    return _capitalizeWord(word);
  }).join('');
}

/**
 * Converte para snake_case
 */
function toSnakeCase(text) {
  return _getWords(text).join('_');
}

/**
 * Converte para dot.case
 */
function toDotCase(text) {
  return _getWords(text).join('.');
}

/**
 * Converte para param-case (kebab-case)
 */
function toParamCase(text) {
  return _getWords(text).join('-');
}

// Mapa de conversores disponíveis
const converters = {
  toCapitalize,
  toTitleCase,
  toUppercase,
  toLowercase,
  toConstantCase,
  toPascalCase,
  toCamelCase,
  toSnakeCase,
  toDotCase,
  toParamCase,
  toNoAccents
};
