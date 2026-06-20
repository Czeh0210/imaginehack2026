'use strict';

/**
 * @typedef {import('../interfaces').DocumentParseResult} DocumentParseResult
 */

/**
 * Factory for DocumentParseResult value objects.
 * Validates field types and returns a frozen, immutable plain object.
 *
 * @param {Object} params
 * @param {string} params.filename
 * @param {string} params.fileType
 * @param {string} params.markdown
 * @param {number} params.characterCount
 * @returns {DocumentParseResult}
 */
function createDocumentParseResult({ filename, fileType, markdown, characterCount }) {
  if (typeof filename !== 'string' || !filename) throw new TypeError('filename must be a non-empty string');
  if (typeof fileType !== 'string' || !fileType) throw new TypeError('fileType must be a non-empty string');
  if (typeof markdown !== 'string') throw new TypeError('markdown must be a string');
  if (typeof characterCount !== 'number' || !Number.isFinite(characterCount)) {
    throw new TypeError('characterCount must be a finite number');
  }

  return Object.freeze({ filename, fileType, markdown, characterCount });
}

module.exports = { createDocumentParseResult };
