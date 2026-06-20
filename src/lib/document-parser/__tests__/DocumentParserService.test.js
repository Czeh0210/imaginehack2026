'use strict';

const path = require('path');

// Mock child_process before the service module loads so execFile is replaced.
jest.mock('child_process');
const { execFile } = require('child_process');
const { DocumentParserService } = require('../services/DocumentParserService');
const { createDocumentParseResult } = require('../dto/DocumentParseResult');

const RUNNER_SCRIPT = path.join(process.cwd(), 'scripts', 'markitdown_runner.py');
const MOCK_MARKDOWN = '# Hello World\n\nThis is a test document.\n\n- Item one\n- Item two';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mockSuccess(markdown = MOCK_MARKDOWN) {
  execFile.mockImplementation((_cmd, _args, _opts, cb) => {
    cb(null, JSON.stringify({ success: true, markdown }), '');
  });
}

function mockProcessError(message = 'python crashed') {
  execFile.mockImplementation((_cmd, _args, _opts, cb) => {
    cb(Object.assign(new Error(message), { code: 'ERR_CHILD_PROCESS' }), '', 'Traceback...');
  });
}

function mockParseFailure(error = 'Cannot open file') {
  execFile.mockImplementation((_cmd, _args, _opts, cb) => {
    cb(null, JSON.stringify({ success: false, error }), '');
  });
}

function mockInvalidJson() {
  execFile.mockImplementation((_cmd, _args, _opts, cb) => {
    cb(null, 'not valid json at all', '');
  });
}

// ─── DocumentParserService ────────────────────────────────────────────────────

describe('DocumentParserService', () => {
  let service;

  beforeEach(() => {
    service = new DocumentParserService();
  });

  // ── Supported file types ────────────────────────────────────────────────────

  describe('parseDocument – supported extensions', () => {
    test.each([
      ['/tmp/report.pdf',       'PDF'],
      ['/tmp/contract.docx',    'DOCX'],
      ['/tmp/legacy.doc',       'DOCX'],
      ['/tmp/slides.pptx',     'PPTX'],
      ['/tmp/deck.ppt',        'PPTX'],
      ['/tmp/data.xlsx',       'XLSX'],
      ['/tmp/data.xls',        'XLSX'],
      ['/tmp/notes.txt',       'TXT'],
      ['/tmp/readme.md',       'MARKDOWN'],
      ['/tmp/guide.markdown',  'MARKDOWN'],
      ['/tmp/page.html',       'HTML'],
      ['/tmp/page.htm',        'HTML'],
    ])('%s → fileType "%s"', async (filePath, expectedType) => {
      mockSuccess();
      const result = await service.parseDocument(filePath);
      expect(result.fileType).toBe(expectedType);
    });
  });

  // ── Successful parse ────────────────────────────────────────────────────────

  describe('parseDocument – successful parse', () => {
    test('returns correct DocumentParseResult shape', async () => {
      mockSuccess();
      const result = await service.parseDocument('/tmp/report.pdf');
      expect(result).toMatchObject({
        filename: 'report.pdf',
        fileType: 'PDF',
        markdown: MOCK_MARKDOWN,
        characterCount: MOCK_MARKDOWN.length,
      });
    });

    test('characterCount equals markdown string length', async () => {
      const md = '# Short\nA';
      mockSuccess(md);
      const result = await service.parseDocument('/tmp/doc.docx');
      expect(result.characterCount).toBe(md.length);
    });

    test('handles empty markdown from MarkItDown', async () => {
      mockSuccess('');
      const result = await service.parseDocument('/tmp/empty.pdf');
      expect(result.markdown).toBe('');
      expect(result.characterCount).toBe(0);
    });

    test('result object is frozen (immutable)', async () => {
      mockSuccess();
      const result = await service.parseDocument('/tmp/doc.txt');
      expect(Object.isFrozen(result)).toBe(true);
    });

    test('calls Python runner with correct arguments', async () => {
      mockSuccess();
      await service.parseDocument('/tmp/test.pdf');
      expect(execFile).toHaveBeenCalledWith(
        expect.any(String),
        [RUNNER_SCRIPT, '/tmp/test.pdf'],
        expect.objectContaining({ maxBuffer: expect.any(Number) }),
        expect.any(Function)
      );
    });
  });

  // ── Error handling ──────────────────────────────────────────────────────────

  describe('parseDocument – error handling', () => {
    test('throws UNSUPPORTED_FILE_TYPE for unknown extension', async () => {
      await expect(service.parseDocument('/tmp/file.xyz')).rejects.toMatchObject({
        code: 'UNSUPPORTED_FILE_TYPE',
      });
      // Python must not be invoked for unsupported types
      expect(execFile).not.toHaveBeenCalled();
    });

    test('throws UNSUPPORTED_FILE_TYPE for no extension', async () => {
      await expect(service.parseDocument('/tmp/nodotfile')).rejects.toMatchObject({
        code: 'UNSUPPORTED_FILE_TYPE',
      });
    });

    test('throws PROCESS_ERROR for invalid filePath argument', async () => {
      await expect(service.parseDocument('')).rejects.toMatchObject({
        code: 'PROCESS_ERROR',
      });
      await expect(service.parseDocument(null)).rejects.toMatchObject({
        code: 'PROCESS_ERROR',
      });
    });

    test('throws PROCESS_ERROR when Python process fails', async () => {
      mockProcessError('python not found');
      await expect(service.parseDocument('/tmp/doc.pdf')).rejects.toMatchObject({
        code: 'PROCESS_ERROR',
      });
    });

    test('throws PARSE_ERROR when MarkItDown reports failure', async () => {
      mockParseFailure('Cannot parse corrupted PDF');
      await expect(service.parseDocument('/tmp/corrupt.pdf')).rejects.toMatchObject({
        code: 'PARSE_ERROR',
        message: expect.stringContaining('Cannot parse corrupted PDF'),
      });
    });

    test('throws PARSE_ERROR when Python outputs invalid JSON', async () => {
      mockInvalidJson();
      await expect(service.parseDocument('/tmp/doc.pdf')).rejects.toMatchObject({
        code: 'PARSE_ERROR',
      });
    });
  });
});

// ─── createDocumentParseResult DTO ───────────────────────────────────────────

describe('createDocumentParseResult', () => {
  const VALID = {
    filename: 'report.pdf',
    fileType: 'PDF',
    markdown: '# Hello',
    characterCount: 7,
  };

  test('creates a frozen value object with all fields', () => {
    const result = createDocumentParseResult(VALID);
    expect(result).toEqual(VALID);
    expect(Object.isFrozen(result)).toBe(true);
  });

  test.each([
    ['filename', { ...VALID, filename: '' }],
    ['fileType', { ...VALID, fileType: 123 }],
    ['markdown', { ...VALID, markdown: null }],
    ['characterCount', { ...VALID, characterCount: 'seven' }],
  ])('throws TypeError for invalid "%s"', (_field, params) => {
    expect(() => createDocumentParseResult(params)).toThrow(TypeError);
  });
});
