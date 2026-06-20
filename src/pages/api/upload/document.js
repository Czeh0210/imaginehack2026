/**
 * POST /api/upload/document
 *
 * Accepts a file upload (any format), parses it to plain text,
 * optionally chunks + embeds + stores it as proposal memories.
 *
 * Form fields:
 *   file      (required) — the uploaded file
 *   clientId  (required) — which client this document belongs to
 *   clientName (required) — client's display name
 *   store     (optional) — "true" to persist as embedded memory (default: "false")
 *   sourceRef (optional) — label for this document (e.g. "proposal_v2.pdf")
 *
 * Response:
 * {
 *   filename:       string,
 *   mimeType:       string,
 *   extractedText:  string,
 *   wordCount:      number,
 *   chunks:         string[],      ← text split into chunks
 *   stored:         boolean,
 *   memoryIds?:     string[],      ← if stored=true
 * }
 */

import formidable from 'formidable';
import fs from 'fs';
import { parseDocument } from '@/lib/docParser.js';
import { chunkText } from '@/lib/chunker.js';
import { embedBatch } from '@/lib/gemini.js';
import { upsertBatch } from '@/lib/vectorStore.js';

// Must disable Next.js body parser so formidable can handle multipart
export const config = {
  api: {
    bodyParser: false,
    responseLimit: '25mb',
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  // ── Parse multipart form ─────────────────────────────────────────────────
  const form = formidable({
    maxFileSize: 20 * 1024 * 1024, // 20 MB
    keepExtensions: true,
  });

  let fields, files;
  try {
    [fields, files] = await form.parse(req);
  } catch (err) {
    return res.status(400).json({ error: `File parse error: ${err.message}` });
  }

  const clientId   = Array.isArray(fields.clientId)   ? fields.clientId[0]   : fields.clientId;
  const clientName = Array.isArray(fields.clientName) ? fields.clientName[0] : fields.clientName;
  const store      = (Array.isArray(fields.store)     ? fields.store[0]      : fields.store) === 'true';
  const sourceRef  = Array.isArray(fields.sourceRef)  ? fields.sourceRef[0]  : fields.sourceRef;

  if (!clientId || !clientName) {
    return res.status(400).json({ error: 'clientId and clientName are required form fields.' });
  }

  const uploadedFile = files.file?.[0] ?? files.file;
  if (!uploadedFile) {
    return res.status(400).json({ error: 'No file uploaded. Send file as "file" field.' });
  }

  const { filepath, mimetype, originalFilename, size } = uploadedFile;

  try {
    // ── Extract text ─────────────────────────────────────────────────────
    const extractedText = await parseDocument(filepath, mimetype, originalFilename);

    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(422).json({ error: 'Could not extract any text from the uploaded file.' });
    }

    // ── Chunk the text ───────────────────────────────────────────────────
    const chunks = chunkText(extractedText, { maxWords: 150, overlapWords: 25 });
    const wordCount = extractedText.split(/\s+/).filter(Boolean).length;

    let memoryIds = undefined;

    // ── Optionally embed + store ─────────────────────────────────────────
    if (store) {
      const vectors = await embedBatch(chunks, 5);
      const items = chunks.map((chunk, i) => ({
        clientId,
        clientName,
        sourceType: 'proposal',
        sourceRef:  sourceRef || originalFilename || 'uploaded_document',
        content:    chunk,
        metadata: {
          originalFilename,
          uploadedAt: new Date().toISOString(),
          chunkIndex: i,
          totalChunks: chunks.length,
          fileSize: size,
        },
        vector: vectors[i],
      }));
      memoryIds = upsertBatch(items);
    }

    // ── Clean up temp file ───────────────────────────────────────────────
    try { fs.unlinkSync(filepath); } catch { /* ignore */ }

    return res.status(200).json({
      filename:      originalFilename,
      mimeType:      mimetype,
      extractedText,
      wordCount,
      chunks,
      chunkCount:    chunks.length,
      stored:        store,
      ...(memoryIds ? { memoryIds } : {}),
    });
  } catch (err) {
    // Clean up temp file on error
    try { fs.unlinkSync(filepath); } catch { /* ignore */ }
    console.error('[upload/document] Error:', err);
    return res.status(500).json({ error: err.message });
  }
}
