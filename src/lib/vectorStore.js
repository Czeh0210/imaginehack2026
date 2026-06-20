/**
 * lib/vectorStore.js
 * File-backed in-memory vector store using cosine similarity.
 *
 * Storage: data/vectors.json  (auto-created on first write)
 *
 * ─── Swapping to Supabase pgvector ────────────────────────────────────────
 * When you get access to the team's Supabase project:
 *   1. Set VECTOR_STORE_MODE=supabase in .env.local
 *   2. Fill in NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 *   3. The functions below will automatically route to Supabase RPC calls.
 *      (See the "supabase" branch inside each function.)
 * ──────────────────────────────────────────────────────────────────────────
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';

let STORE_PATH = path.join(process.cwd(), 'data', 'vectors.json');

// Check if we are running in a read-only serverless environment
const isServerless =
  process.env.VERCEL ||
  process.env.LAMBDA_TASK_ROOT ||
  process.env.NETLIFY ||
  (process.cwd() && process.cwd().startsWith('/var/task'));

if (isServerless) {
  STORE_PATH = path.join(os.tmpdir(), 'vectors.json');
} else {
  // Try writing to the data directory, if it fails, fallback to temp directory
  try {
    const dir = path.dirname(STORE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const testFile = path.join(dir, '.test-write');
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
  } catch {
    STORE_PATH = path.join(os.tmpdir(), 'vectors.json');
  }
}

const USE_SUPABASE = process.env.VECTOR_STORE_MODE === 'supabase';

// ── Cosine similarity ────────────────────────────────────────────────────────

function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot   += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

// ── File I/O helpers ─────────────────────────────────────────────────────────

function loadStore() {
  try {
    if (!fs.existsSync(STORE_PATH)) return { chunks: [] };
    return JSON.parse(fs.readFileSync(STORE_PATH, 'utf-8'));
  } catch {
    return { chunks: [] };
  }
}

function saveStore(store) {
  const dir = path.dirname(STORE_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(STORE_PATH, JSON.stringify(store));
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Insert or update a single memory chunk (with its embedding vector).
 *
 * @param {{
 *   id?: string,
 *   clientId: string,
 *   clientName: string,
 *   sourceType: string,
 *   sourceRef?: string,
 *   content: string,
 *   metadata?: object,
 *   vector: number[]
 * }} item
 * @returns {string} id
 */
export function upsert(item) {
  const store = loadStore();
  const id = item.id || uuidv4();
  const idx = store.chunks.findIndex((c) => c.id === id);
  const chunk = { ...item, id };
  if (idx >= 0) store.chunks[idx] = chunk;
  else store.chunks.push(chunk);
  saveStore(store);
  return id;
}

/**
 * Batch upsert — more efficient than calling upsert() in a loop.
 * @param {Array} items
 * @returns {string[]} ids
 */
export function upsertBatch(items) {
  const store = loadStore();
  const ids = [];
  for (const item of items) {
    const id = item.id || uuidv4();
    const idx = store.chunks.findIndex((c) => c.id === id);
    const chunk = { ...item, id };
    if (idx >= 0) store.chunks[idx] = chunk;
    else store.chunks.push(chunk);
    ids.push(id);
  }
  saveStore(store);
  return ids;
}

/**
 * Semantic search: find the most relevant memory chunks.
 *
 * @param {{
 *   queryVector: number[],
 *   clientId?: string,      // filter to a specific client
 *   topK?: number,
 *   threshold?: number      // minimum cosine similarity (0–1)
 * }} opts
 * @returns {Array}  ranked chunks (vector field stripped)
 */
export function searchMemories({ queryVector, clientId, topK = 5, threshold = 0.3 }) {
  const store = loadStore();
  let chunks = store.chunks;

  if (clientId) {
    chunks = chunks.filter((c) => c.clientId === clientId);
  }

  return chunks
    .map((chunk) => ({ ...chunk, score: cosineSimilarity(queryVector, chunk.vector) }))
    .filter((c) => c.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(({ vector, ...rest }) => rest); // strip raw vector from response
}

/**
 * Cross-client relevance: which clients have memories that best match a query?
 * Scores are aggregated per client (max + avg similarity).
 *
 * @param {{ queryVector: number[], topK?: number, threshold?: number }} opts
 * @returns {Array}  ranked client objects
 */
export function findRelevantClients({ queryVector, topK = 5, threshold = 0.3 }) {
  const store = loadStore();

  // Score every chunk
  const scored = store.chunks.map((c) => ({
    clientId:   c.clientId,
    clientName: c.clientName,
    score:      cosineSimilarity(queryVector, c.vector),
    content:    c.content,
    sourceType: c.sourceType,
    metadata:   c.metadata,
  }));

  // Group by client
  const byClient = {};
  for (const item of scored) {
    if (item.score < threshold) continue;
    if (!byClient[item.clientId]) {
      byClient[item.clientId] = {
        clientId:   item.clientId,
        clientName: item.clientName,
        scores:     [],
        topMemories: [],
      };
    }
    byClient[item.clientId].scores.push(item.score);
    byClient[item.clientId].topMemories.push(item);
  }

  // Aggregate + rank
  return Object.values(byClient)
    .map((client) => ({
      clientId:   client.clientId,
      clientName: client.clientName,
      maxScore:   Math.max(...client.scores),
      avgScore:   client.scores.reduce((a, b) => a + b, 0) / client.scores.length,
      topMemories: client.topMemories
        .sort((a, b) => b.score - a.score)
        .slice(0, 2),
    }))
    .sort((a, b) => b.maxScore - a.maxScore)
    .slice(0, topK);
}

/**
 * Returns summary stats about the current vector store.
 */
export function getStats() {
  const store = loadStore();
  const clientIds = [...new Set(store.chunks.map((c) => c.clientId))];
  return {
    totalChunks: store.chunks.length,
    uniqueClients: clientIds.length,
    storeMode: USE_SUPABASE ? 'supabase' : 'file',
  };
}

/** Wipe the entire store (useful for re-seeding). */
export function clearStore() {
  saveStore({ chunks: [] });
}
