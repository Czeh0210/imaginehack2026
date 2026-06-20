/**
 * @fileoverview Type definitions for the document parser module.
 * Consumed via JSDoc @typedef to provide IDE autocompletion without TypeScript.
 */

/**
 * The result returned by DocumentParserService.parseDocument().
 *
 * @typedef {Object} DocumentParseResult
 * @property {string} filename        - Original filename (e.g. "report.pdf")
 * @property {string} fileType        - Normalised type label (PDF | DOCX | PPTX | XLSX | TXT | MARKDOWN | HTML)
 * @property {string} markdown        - Full document content converted to Markdown
 * @property {number} characterCount  - Character count of the markdown string
 */

/**
 * Error codes emitted by DocumentParserService.
 *
 * @typedef {'UNSUPPORTED_FILE_TYPE' | 'PARSE_ERROR' | 'PROCESS_ERROR'} DocumentParseErrorCode
 */

/**
 * Enriched Error thrown by DocumentParserService.
 *
 * @typedef {Error & { code: DocumentParseErrorCode, stderr?: string }} DocumentParseError
 */

module.exports = {};
