import multer from 'multer';
import path from 'path';
import os from 'os';
import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const config = {
  api: {
    bodyParser: false,
    responseLimit: '4mb',
  },
};

// Gemini accepts these MIME types for audio inline data.
// Map browser-reported types (which can be inconsistent) to Gemini-safe values.
const MIME_MAP = {
  'audio/mpeg':   'audio/mpeg',
  'audio/mp3':    'audio/mpeg',
  'audio/mpga':   'audio/mpeg',
  'audio/wav':    'audio/wav',
  'audio/wave':   'audio/wav',
  'audio/x-wav':  'audio/wav',
  'audio/mp4':    'audio/mp4',
  'audio/x-m4a':  'audio/mp4',
  'audio/m4a':    'audio/mp4',
  'audio/ogg':    'audio/ogg',
  'audio/webm':   'audio/webm',
  'audio/aac':    'audio/aac',
  'audio/x-aac':  'audio/aac',
  'audio/flac':   'audio/flac',
  'audio/x-flac': 'audio/flac',
};

// Fallback: derive Gemini MIME type from file extension when browser type is wrong.
const EXT_MIME = {
  '.mp3':  'audio/mpeg',
  '.wav':  'audio/wav',
  '.m4a':  'audio/mp4',
  '.ogg':  'audio/ogg',
  '.webm': 'audio/webm',
  '.aac':  'audio/aac',
  '.flac': 'audio/flac',
};

const ALLOWED_EXTENSIONS = /\.(mp3|wav|m4a|ogg|webm|aac|flac)$/i;

// Inline data limit: keep well under Gemini's ~20 MB inline cap (base64 adds ~33%).
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB raw

const storage = multer.diskStorage({
  destination: os.tmpdir(),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `audio-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_EXTENSIONS.test(file.originalname)) {
      return cb(
        Object.assign(
          new Error(`Unsupported audio format: "${path.extname(file.originalname)}". Supported: MP3, WAV, M4A, OGG, WEBM, AAC, FLAC`),
          { code: 'UNSUPPORTED_TYPE' }
        )
      );
    }
    cb(null, true);
  },
});

function runUpload(req, res) {
  return new Promise((resolve, reject) => {
    upload.single('file')(req, res, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const PREFERRED_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-2.5-pro',
];

const TRANSCRIPTION_PROMPT = `You are a professional meeting transcriptionist. Transcribe this audio recording completely and accurately.

Format the output as clean Markdown:
- Use ## headings for major topics or agenda items
- Identify speakers as **Speaker 1:**, **Speaker 2:**, etc. if multiple speakers are present
- Include approximate timestamps in [MM:SS] format where you can detect them
- Use bullet points for lists or enumerated items
- Preserve all spoken content faithfully — do not summarise mid-transcript
- After the full transcript, add a ## Key Points section with 3–7 concise bullet points of the main takeaways
- Then add an ## Action Items section listing any tasks, owners, and deadlines mentioned

Return only the formatted transcript document — no preamble or meta-commentary.`;

async function transcribeWithGemini(audioPath, mimeType) {
  const audioBuffer = fs.readFileSync(audioPath);
  const base64Audio = audioBuffer.toString('base64');

  let lastError;
  for (const modelName of PREFERRED_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent([
        { inlineData: { mimeType, data: base64Audio } },
        { text: TRANSCRIPTION_PROMPT },
      ]);
      const response = await result.response;
      return { text: response.text(), model: modelName };
    } catch (err) {
      const status = err?.status;
      const msg = err?.message ?? '';
      const isTransient = status === 429 || status === 404 || status === 503
        || msg.includes('429') || msg.includes('503');

      console.warn(`[transcribe-audio] Model ${modelName} failed (${status ?? '?'}): ${msg.slice(0, 80)}`);

      if (isTransient) {
        lastError = err;
        continue;
      }
      throw err;
    }
  }
  throw lastError ?? new Error('All Gemini models failed');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let tmpPath = null;

  try {
    await runUpload(req, res);

    if (!req.file) {
      return res.status(400).json({
        error: 'No audio file uploaded. Send a multipart/form-data POST with field name "file".',
      });
    }

    tmpPath = req.file.path;
    const originalName = req.file.originalname;
    const ext = path.extname(originalName).toLowerCase();

    // Prefer the extension-derived MIME type over the browser-reported one (more reliable).
    const mimeType = EXT_MIME[ext] ?? MIME_MAP[req.file.mimetype] ?? 'audio/mpeg';

    const { text, model } = await transcribeWithGemini(tmpPath, mimeType);

    return res.status(200).json({
      filename: originalName,
      transcript: text,
      characterCount: text.length,
      model,
    });
  } catch (err) {
    const code = err.code ?? 'UNKNOWN';

    if (code === 'UNSUPPORTED_TYPE') {
      return res.status(415).json({ error: err.message, code });
    }
    if (code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        error: `Audio file exceeds the ${MAX_FILE_SIZE / 1024 / 1024} MB limit`,
        code: 'FILE_TOO_LARGE',
      });
    }
    if (err?.status === 429 || err?.message?.includes('429')) {
      return res.status(429).json({ error: 'AI models are rate-limited. Please wait a moment and try again.', code: 'RATE_LIMITED' });
    }

    console.error('[transcribe-audio] Unhandled error:', err.message);
    return res.status(500).json({ error: 'Audio transcription failed', code: 'TRANSCRIPTION_ERROR' });
  } finally {
    if (tmpPath) fs.unlink(tmpPath, () => {});
  }
}
