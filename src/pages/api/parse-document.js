import multer from 'multer';
import path from 'path';
import os from 'os';
import fs from 'fs';
const { DocumentParserService } = require('../../lib/document-parser');

/**
 * Disable Next.js default body parser — multer owns the request stream.
 * Raise response limit to 8 MB to accommodate large Markdown outputs.
 */
export const config = {
  api: {
    bodyParser: false,
    responseLimit: '8mb',
  },
};

const ALLOWED_EXTENSIONS = /\.(pdf|docx?|pptx?|xlsx?|txt|md|markdown|html?)$/i;
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

const storage = multer.diskStorage({
  destination: os.tmpdir(),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `markitdown-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_EXTENSIONS.test(file.originalname)) {
      return cb(
        Object.assign(
          new Error(`Unsupported file type: "${path.extname(file.originalname)}"`),
          { code: 'UNSUPPORTED_FILE_TYPE' }
        )
      );
    }
    cb(null, true);
  },
});

/** Promisify a single-file multer middleware. */
function runUpload(req, res) {
  return new Promise((resolve, reject) => {
    upload.single('file')(req, res, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

const service = new DocumentParserService();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let tmpPath = null;

  try {
    await runUpload(req, res);

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded. Send a multipart/form-data POST with field name "file".' });
    }

    tmpPath = req.file.path;
    const originalName = req.file.originalname;

    const result = await service.parseDocument(tmpPath);

    return res.status(200).json({
      filename: originalName,
      fileType: result.fileType,
      markdown: result.markdown,
      characterCount: result.characterCount,
    });
  } catch (err) {
    const code = err.code || 'UNKNOWN';

    if (code === 'UNSUPPORTED_FILE_TYPE') {
      return res.status(415).json({ error: err.message, code });
    }

    if (code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        error: `File exceeds the ${MAX_FILE_SIZE / 1024 / 1024} MB size limit`,
        code: 'FILE_TOO_LARGE',
      });
    }

    if (code === 'PARSE_ERROR') {
      return res.status(422).json({ error: err.message, code });
    }

    console.error('[parse-document] Unhandled error:', err.message, err.stderr ?? '');
    return res.status(500).json({ error: 'Document parsing failed', code: 'PROCESS_ERROR' });
  } finally {
    // Always clean up the temp file regardless of success or failure.
    if (tmpPath) {
      fs.unlink(tmpPath, () => {});
    }
  }
}
