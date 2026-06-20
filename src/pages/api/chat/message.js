/**
 * POST /api/chat/message
 *
 * Main RAG-powered chat endpoint.
 * Retrieves semantically relevant memories → builds context → generates a grounded reply.
 *
 * Request body:
 * {
 *   message:       string,    ← advisor's question
 *   sessionId?:    string,    ← pass to maintain conversation history
 *   clientId?:     string,    ← per-client mode; omit for cross-client/global
 *   proposalText?: string,    ← extracted text from an uploaded proposal
 *   topK?:         number,    ← memories to retrieve (default 5)
 *   threshold?:    number,    ← min similarity threshold (default 0.3)
 * }
 *
 * Response:
 * {
 *   sessionId:       string,
 *   reply:           string,
 *   sources:         MemoryChunk[],   ← retrieved memories that grounded the reply
 *   relevantClients: ClientMatch[]|null,  ← only in global/cross-client mode
 *   usage: { memoriesRetrieved, embeddingDim, mode }
 * }
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import { parseDocument } from '@/lib/docParser.js';
import { runRAG } from '@/lib/ragPipeline.js';
import { getSession, appendToSession, createSession } from '@/lib/sessionStore.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const {
    message,
    sessionId,
    clientId,
    proposalText: initialProposalText,
    topK = 5,
    threshold = 0.3,
    file,
  } = req.body ?? {};

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ error: 'message is required and must be a non-empty string.' });
  }

  try {
    let proposalText = initialProposalText;

    // ── Parse uploaded file if present ─────────────────────────────────────
    if (file && file.data) {
      const tempDir = os.tmpdir();
      const tempFilename = `upload_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const tempFilePath = path.join(tempDir, tempFilename);
      fs.writeFileSync(tempFilePath, Buffer.from(file.data, 'base64'));
      try {
        proposalText = await parseDocument(tempFilePath, file.mimeType, file.name);
      } catch (err) {
        console.error('[chat/message] Error parsing uploaded file:', err);
        throw new Error(`Failed to parse file: ${err.message}`);
      } finally {
        try {
          fs.unlinkSync(tempFilePath);
        } catch {}
      }
    }

    // ── Load or create session ─────────────────────────────────────────────
    let sid = sessionId;
    let sessionMessages = [];

    if (sid) {
      const session = getSession(sid);
      if (session) {
        sessionMessages = session.messages;
      } else {
        // Unknown sessionId — start fresh but keep the provided id
        sid = createSession({ clientId });
      }
    } else {
      sid = createSession({ clientId });
    }

    // ── Run RAG pipeline ───────────────────────────────────────────────────
    const { reply, sources, relevantClients, queryEmbeddingDim } = await runRAG({
      message: message.trim(),
      sessionMessages,
      clientId,
      proposalText,
      topK: Math.min(Number(topK) || 5, 10),
      threshold: Number(threshold) || 0.3,
    });

    // ── Persist conversation turn ──────────────────────────────────────────
    appendToSession(sid, [
      { role: 'user',      content: message.trim() },
      { role: 'assistant', content: reply, sources },
    ]);

    return res.status(200).json({
      sessionId: sid,
      reply,
      sources,
      relevantClients,
      usage: {
        memoriesRetrieved: sources.length,
        embeddingDim: queryEmbeddingDim,
        mode: clientId ? 'per-client' : 'global',
      },
    });
  } catch (err) {
    console.error('[chat/message] Error:', err);
    return res.status(500).json({ error: err.message });
  }
}
