/**
 * POST /api/seed
 *
 * Seeds all mock clients and memories into the vector store.
 * Generates Gemini embeddings for every memory chunk.
 *
 * Safe to call multiple times — clears and re-seeds each time.
 *
 * Response:
 *   { message, inserted: { clients, memories }, stats }
 */

import { CLIENTS, MEMORIES } from '@/lib/mockData.js';
import { embedBatch } from '@/lib/gemini.js';
import { upsertBatch, clearStore, getStats } from '@/lib/vectorStore.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    console.log('[seed] Starting seed process...');

    // Clear any existing vectors
    clearStore();

    // Extract the raw text from each memory for batch embedding
    const texts = MEMORIES.map((m) => m.content);

    console.log(`[seed] Embedding ${texts.length} memory chunks via Gemini...`);
    const vectors = await embedBatch(texts, 5); // 5 per batch, ~300ms delay between batches

    // Build vector store items
    const items = MEMORIES.map((memory, i) => ({
      clientId:   memory.clientId,
      clientName: memory.clientName,
      sourceType: memory.sourceType,
      sourceRef:  memory.sourceRef,
      content:    memory.content,
      metadata:   memory.metadata,
      vector:     vectors[i],
    }));

    const ids = upsertBatch(items);
    const stats = getStats();

    console.log(`[seed] Done. Stored ${ids.length} embedded memories.`);

    return res.status(200).json({
      message: 'Seed complete. Vector store is ready.',
      inserted: {
        clients: CLIENTS.length,
        memories: ids.length,
      },
      stats,
    });
  } catch (err) {
    console.error('[seed] Error:', err);
    return res.status(500).json({ error: err.message });
  }
}
