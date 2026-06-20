/**
 * lib/chunker.js
 * Splits long text into overlapping word-based chunks.
 * Overlapping ensures that context near chunk boundaries is not lost.
 */

/**
 * @param {string} text  Raw text to split
 * @param {object} opts
 * @param {number} opts.maxWords     Target max words per chunk (default 150)
 * @param {number} opts.overlapWords Words of overlap between consecutive chunks (default 25)
 * @returns {string[]}
 */
export function chunkText(text, { maxWords = 150, overlapWords = 25 } = {}) {
  // Normalise whitespace
  const words = text
    .replace(/\r\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean);

  if (words.length === 0) return [];
  if (words.length <= maxWords) return [words.join(' ')];

  const chunks = [];
  let start = 0;

  while (start < words.length) {
    const end = Math.min(start + maxWords, words.length);
    chunks.push(words.slice(start, end).join(' '));
    if (end === words.length) break;
    start += maxWords - overlapWords;
  }

  return chunks;
}
