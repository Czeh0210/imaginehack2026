/**
 * POST /api/memory/search
 *
 * Pure semantic search — returns raw retrieved memory chunks with similarity scores.
 * The advisor can use this to drill into the raw knowledge base without going through the LLM.
 *
 * Request body:
 * {
 *   query:      string,   ← natural language query
 *   clientId?:  string,   ← omit for cross-client global search
 *   topK?:      number,   ← default 5
 *   threshold?: number,   ← minimum similarity 0–1, default 0.3
 * }
 *
 * Response:
 * {
 *   query: string,
 *   results: [{
 *     id, clientId, clientName, sourceType, sourceRef,
 *     content, metadata, score (0–1)
 *   }],
 *   total: number,
 *   mode: 'per-client' | 'global'
 * }
 */

import { embedText } from '@/lib/gemini.js';
import { searchMemories, findRelevantClients } from '@/lib/vectorStore.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const {
    query,
    clientId,
    topK = 5,
    threshold = 0.3,
    includeClientRanking = false,
  } = req.body ?? {};

  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return res.status(400).json({ error: 'query is required and must be a non-empty string.' });
  }

  try {
    // Embed the search query
    const queryVector = await embedText(query.trim());

    // Search the vector store
    const results = searchMemories({
      queryVector,
      clientId,
      topK: Math.min(Number(topK) || 5, 20), // cap at 20
      threshold: Number(threshold) || 0.3,
    });

    // Optional: also return cross-client ranking
    let clientRanking = null;
    if (includeClientRanking && !clientId) {
      clientRanking = findRelevantClients({ queryVector, topK: 6, threshold });
    }

    return res.status(200).json({
      query,
      results,
      total: results.length,
      mode: clientId ? 'per-client' : 'global',
      ...(clientRanking ? { clientRanking } : {}),
    });
  } catch (err) {
    console.error('[memory/search] Error:', err);
    return res.status(500).json({ error: err.message });
  }
}
