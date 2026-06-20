/**
 * POST /api/memory/ingest
 *
 * Ingests arbitrary memory items into the vector store.
 * Use this after adding a new CRM note, uploading a transcript, etc.
 *
 * Request body:
 * {
 *   clientId:   string,
 *   clientName: string,
 *   items: [{
 *     sourceType: 'crm_note' | 'transcript' | 'meeting_summary' | 'proposal' | string,
 *     sourceRef?: string,
 *     content:    string,       ← raw text (will be auto-chunked if long)
 *     metadata?:  object,       ← { date, tags, ... }
 *   }]
 * }
 *
 * Response:
 * { ingested: number, ids: string[] }
 */

import { embedBatch } from '@/lib/gemini.js';
import { chunkText } from '@/lib/chunker.js';
import { upsertBatch } from '@/lib/vectorStore.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const { clientId, clientName, items } = req.body ?? {};

  if (!clientId || !clientName) {
    return res.status(400).json({ error: 'clientId and clientName are required.' });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'items must be a non-empty array.' });
  }

  try {
    // Expand items into chunks (long content → multiple vectors)
    const expanded = [];
    for (const item of items) {
      if (!item.content || typeof item.content !== 'string') continue;
      const chunks = chunkText(item.content);
      for (let i = 0; i < chunks.length; i++) {
        expanded.push({
          clientId,
          clientName,
          sourceType: item.sourceType || 'unknown',
          sourceRef:  item.sourceRef,
          content:    chunks[i],
          metadata:   { ...item.metadata, chunkIndex: i, totalChunks: chunks.length },
        });
      }
    }

    if (expanded.length === 0) {
      return res.status(400).json({ error: 'No valid content found in items.' });
    }

    // Embed all chunks
    const texts = expanded.map((e) => e.content);
    const vectors = await embedBatch(texts, 5);

    // Store
    const storeItems = expanded.map((item, i) => ({ ...item, vector: vectors[i] }));
    const ids = upsertBatch(storeItems);

    return res.status(200).json({
      ingested: ids.length,
      ids,
      chunksFromItems: expanded.length,
      originalItems: items.length,
    });
  } catch (err) {
    console.error('[memory/ingest] Error:', err);
    return res.status(500).json({ error: err.message });
  }
}
