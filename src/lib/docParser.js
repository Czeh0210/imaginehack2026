/**
 * lib/docParser.js
 * Parses uploaded files of various formats into plain text.
 *
 * Supported formats:
 *   .pdf       → pdf-parse
 *   .docx      → mammoth
 *   .txt/.md   → direct read
 *   others     → best-effort UTF-8 read
 */

import fs from 'fs';
import path from 'path';

/**
 * Extract plain text from a file on disk.
 *
 * @param {string} filePath   Absolute path to the temporary file
 * @param {string} mimeType   MIME type from the upload (e.g. 'application/pdf')
 * @param {string} [filename] Original filename (used for extension fallback)
 * @returns {Promise<string>} Extracted plain text
 */
export async function parseDocument(filePath, mimeType = '', filename = '') {
  const ext = path.extname(filename || filePath).toLowerCase();

  // ── PDF ──────────────────────────────────────────────────────────────────
  if (mimeType === 'application/pdf' || ext === '.pdf') {
    const pdfParse = (await import('pdf-parse')).default;
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return data.text;
  }

  // ── DOCX ─────────────────────────────────────────────────────────────────
  if (
    mimeType ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    ext === '.docx'
  ) {
    const mammoth = (await import('mammoth')).default;
    const { value } = await mammoth.extractRawText({ path: filePath });
    return value;
  }

  // ── Plain text / Markdown ─────────────────────────────────────────────────
  if (
    mimeType.startsWith('text/') ||
    ['.txt', '.md', '.csv', '.json'].includes(ext)
  ) {
    return fs.readFileSync(filePath, 'utf-8');
  }

  // ── Fallback: attempt UTF-8 read ──────────────────────────────────────────
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    throw new Error(
      `Unsupported file type: ${mimeType || ext}. Please upload a PDF, DOCX, or plain text file.`
    );
  }
}
