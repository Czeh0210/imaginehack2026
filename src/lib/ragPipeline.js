/**
 * lib/ragPipeline.js
 * Full Retrieval-Augmented Generation (RAG) pipeline.
 *
 * Flow:
 *   1. Embed the advisor's question (Gemini embedding)
 *   2. Semantic search against the vector store
 *        → per-client   (if clientId provided)
 *        → cross-client (if no clientId — finds relevant clients too)
 *   3. Build a context-rich prompt with retrieved memories
 *   4. Generate a grounded reply via Gemini 2.0 Flash
 *   5. Return { reply, sources, relevantClients }
 */

import { embedText } from '@/lib/gemini.js';
import { generateReply } from '@/lib/gemini.js';
import { searchMemories, findRelevantClients } from '@/lib/vectorStore.js';

// ── System prompt ────────────────────────────────────────────────────────────

const BASE_SYSTEM_PROMPT = `You are an expert AI assistant embedded inside a financial advisor's client management platform.
Your job is to help the advisor deeply understand their clients by analysing retrieved memories from client interaction history.

These memories come from CRM notes, meeting summaries, and call transcripts spanning multiple years.
They were retrieved using semantic search — so they may not contain the exact words in the advisor's question,
but they are conceptually relevant.

Guidelines:
- Ground every insight in the provided memories. Do NOT make up information.
- When citing a memory, reference its source type and date (e.g. "In a March 2024 call, the client said…").
- Identify behavioural patterns and trends across multiple memories where possible.
- Provide actionable, specific insights the advisor can use.
- If the memories are insufficient to answer fully, say so honestly and suggest what additional information to gather.
- Use clear, professional language. Be concise but thorough.`;

// ── Main export ──────────────────────────────────────────────────────────────

/**
 * Run the full RAG pipeline and return a grounded AI response.
 *
 * @param {{
 *   message: string,
 *   sessionMessages?: { role: 'user'|'assistant', content: string }[],
 *   clientId?: string,
 *   proposalText?: string,
 *   topK?: number,
 *   threshold?: number
 * }} params
 *
 * @returns {Promise<{
 *   reply: string,
 *   sources: object[],
 *   relevantClients: object[]|null,
 *   queryEmbeddingDim: number
 * }>}
 */
export async function runRAG({
  message,
  sessionMessages = [],
  clientId,
  proposalText,
  topK = 5,
  threshold = 0.3,
}) {
  // ── 1. Embed the query ───────────────────────────────────────────────────
  const queryVector = await embedText(message);

  // ── 2. Retrieve relevant memories ───────────────────────────────────────
  const memories = searchMemories({ queryVector, clientId, topK, threshold });

  // ── 3. Cross-client relevance (global mode only) ─────────────────────────
  let relevantClients = null;
  if (!clientId) {
    const candidates = findRelevantClients({ queryVector, topK: 5, threshold });
    relevantClients = candidates.filter((c) => c.maxScore > 0.35);
  }

  // ── 4. Build context block ───────────────────────────────────────────────
  const memoryBlock =
    memories.length > 0
      ? memories
          .map(
            (m, i) =>
              `[Memory ${i + 1}]
  Client     : ${m.clientName}
  Source     : ${m.sourceType}  |  Ref: ${m.sourceRef || 'n/a'}
  Date       : ${m.metadata?.date || 'unknown'}
  Similarity : ${(m.score * 100).toFixed(1)}%
  Content    : "${m.content}"`
          )
          .join('\n\n')
      : 'No relevant memories were found in the knowledge base for this query.';

  const proposalBlock = proposalText
    ? `\n── UPLOADED PROPOSAL (excerpt) ──\n${proposalText.slice(0, 3000)}\n`
    : '';

  const modeNote = clientId
    ? `[MODE: Per-client query — only memories for this specific client have been retrieved.]`
    : `[MODE: Cross-client query — memories from all clients have been searched to find the most relevant ones.]`;

  const contextualUserMessage = `${modeNote}

── RETRIEVED MEMORIES (semantic search results) ──
${memoryBlock}
${proposalBlock}
── ADVISOR'S QUESTION ──
${message}`;

  // ── 5. Assemble message history ──────────────────────────────────────────
  // Keep last 3 exchanges (6 messages) for conversational context
  const recentHistory = sessionMessages.slice(-6);
  const allMessages = [
    ...recentHistory,
    { role: 'user', content: contextualUserMessage },
  ];

  // ── 6. Generate reply ────────────────────────────────────────────────────
  const systemPrompt =
    BASE_SYSTEM_PROMPT +
    (clientId
      ? '\n\nYou are answering a question about a SPECIFIC client. Focus only on that client\'s memories.'
      : '\n\nYou are answering a CROSS-CLIENT question. You may reference multiple clients and help the advisor identify which clients are most relevant.');

  const reply = await generateReply(systemPrompt, allMessages);

  return {
    reply,
    sources: memories,
    relevantClients,
    queryEmbeddingDim: queryVector.length,
  };
}
