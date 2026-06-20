/**
 * lib/gemini.js
 * Thin wrapper around @google/generative-ai for:
 *   - Text embeddings  (text-embedding-004, 768-dim)
 *   - Chat generation  (gemini-2.0-flash — 1,500 req/day free tier)
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('Missing GEMINI_API_KEY in environment variables');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ── Embedding ────────────────────────────────────────────────────────────────

/**
 * Embed a single piece of text.
 * @param {string} text
 * @returns {Promise<number[]>}
 */
export async function embedText(text) {
  const model = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });
  const result = await model.embedContent(text.trim());
  return result.embedding.values; // number[]
}

/**
 * Embed an array of texts in small batches to respect rate limits.
 * @param {string[]} texts
 * @param {number} batchSize
 * @returns {Promise<number[][]>}
 */
export async function embedBatch(texts, batchSize = 5) {
  const results = [];
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const embeddings = await Promise.all(batch.map((t) => embedText(t)));
    results.push(...embeddings);
    // Small pause between batches to avoid hitting rate limits
    if (i + batchSize < texts.length) {
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }
  return results;
}

// ── Generation ───────────────────────────────────────────────────────────────

/**
 * Generate a chat reply using Gemini 2.0 Flash.
 * @param {string} systemPrompt
 * @param {{ role: 'user'|'assistant', content: string }[]} messages
 * @returns {Promise<string>}
 */
export async function generateReply(systemPrompt, messages) {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: systemPrompt,
  });

  // Gemini roles: 'user' | 'model'  (not 'assistant')
  const history = messages.slice(0, -1).map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const chat = model.startChat({ history });

  const lastMessage = messages[messages.length - 1];
  const result = await chat.sendMessage(lastMessage.content);
  return result.response.text();
}
