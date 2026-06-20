/**
 * GET  /api/chat/session?sessionId=xxx   → get session history
 * POST /api/chat/session                 → create new session
 * DELETE /api/chat/session?sessionId=xxx → clear a session
 */

import {
  createSession,
  getSession,
  listSessions,
  deleteSession,
} from '@/lib/sessionStore.js';

export default function handler(req, res) {
  // ── GET: retrieve session or list all ─────────────────────────────────────
  if (req.method === 'GET') {
    const { sessionId } = req.query;

    if (sessionId) {
      const session = getSession(sessionId);
      if (!session) {
        return res.status(404).json({ error: `Session '${sessionId}' not found.` });
      }
      return res.status(200).json({ session });
    }

    // List all sessions (no messages, just metadata)
    return res.status(200).json({ sessions: listSessions() });
  }

  // ── POST: create new session ───────────────────────────────────────────────
  if (req.method === 'POST') {
    const { clientId } = req.body ?? {};
    const sessionId = createSession({ clientId });
    return res.status(201).json({ sessionId, clientId: clientId || null });
  }

  // ── DELETE: delete a session ──────────────────────────────────────────────
  if (req.method === 'DELETE') {
    const { sessionId } = req.query;
    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required for deletion.' });
    }
    const success = deleteSession(sessionId);
    if (!success) {
      return res.status(404).json({ error: `Session '${sessionId}' not found.` });
    }
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed.' });
}
