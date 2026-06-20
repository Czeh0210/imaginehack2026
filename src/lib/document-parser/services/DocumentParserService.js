'use strict';

const { execFile } = require('child_process');
const path = require('path');
const { createDocumentParseResult } = require('../dto/DocumentParseResult');

/**
 * @typedef {import('../interfaces').DocumentParseResult} DocumentParseResult
 * @typedef {import('../interfaces').DocumentParseError} DocumentParseError
 */

const PYTHON_BIN = process.platform === 'win32' ? 'python' : 'python3';
const RUNNER_SCRIPT = path.join(process.cwd(), 'scripts', 'markitdown_runner.py');

/** 50 MB – generous ceiling for large presentations / spreadsheets */
const MAX_BUFFER = 50 * 1024 * 1024;

/** Maps normalised file extensions to human-readable type labels */
const EXT_TO_TYPE = {
  '.pdf':      'PDF',
  '.docx':     'DOCX',
  '.doc':      'DOCX',
  '.pptx':     'PPTX',
  '.ppt':      'PPTX',
  '.xlsx':     'XLSX',
  '.xls':      'XLSX',
  '.txt':      'TXT',
  '.md':       'MARKDOWN',
  '.markdown': 'MARKDOWN',
  '.html':     'HTML',
  '.htm':      'HTML',
};

class DocumentParserService {
  /**
   * Convert a document file to Markdown using Microsoft MarkItDown.
   *
   * @param {string} filePath - Absolute path to the file on disk
   * @returns {Promise<DocumentParseResult>}
   * @throws {DocumentParseError}
   */
  async parseDocument(filePath) {
    if (!filePath || typeof filePath !== 'string') {
      throw Object.assign(new Error('filePath must be a non-empty string'), { code: 'PROCESS_ERROR' });
    }

    const ext = path.extname(filePath).toLowerCase();
    const fileType = EXT_TO_TYPE[ext];

    if (!fileType) {
      throw Object.assign(
        new Error(`Unsupported file type: "${ext || '(none)'}". Supported: ${Object.keys(EXT_TO_TYPE).join(', ')}`),
        { code: 'UNSUPPORTED_FILE_TYPE' }
      );
    }

    const markdown = await this._invokeMarkItDown(filePath);

    return createDocumentParseResult({
      filename: path.basename(filePath),
      fileType,
      markdown,
      characterCount: markdown.length,
    });
  }

  /**
   * @private
   * @param {string} filePath
   * @returns {Promise<string>}
   */
  _invokeMarkItDown(filePath) {
    return new Promise((resolve, reject) => {
      execFile(
        PYTHON_BIN,
        [RUNNER_SCRIPT, filePath],
        { maxBuffer: MAX_BUFFER },
        (error, stdout, stderr) => {
          if (error) {
            return reject(
              Object.assign(
                new Error(`MarkItDown process error: ${error.message}`),
                { code: 'PROCESS_ERROR', stderr }
              )
            );
          }

          let parsed;
          try {
            parsed = JSON.parse(stdout.trim());
          } catch {
            return reject(
              Object.assign(
                new Error('MarkItDown returned invalid JSON'),
                { code: 'PARSE_ERROR' }
              )
            );
          }

          if (!parsed.success) {
            return reject(
              Object.assign(
                new Error(`MarkItDown parse failed: ${parsed.error}`),
                { code: 'PARSE_ERROR' }
              )
            );
          }

          resolve(parsed.markdown ?? '');
        }
      );
    });
  }
}

module.exports = { DocumentParserService };
