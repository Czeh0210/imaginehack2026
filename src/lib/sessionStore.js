/**
 * lib/sessionStore.js
 * Simple file-backed session store for chat history.
 *
 * Sessions persist across server restarts (stored in data/sessions.json).
 * For production: swap this out for Supabase `chat_sessions` table.
 */

import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const SESSIONS_PATH = path.join(process.cwd(), 'data', 'sessions.json');

function loadSessions() {
  try {
    if (!fs.existsSync(SESSIONS_PATH)) return {};
    return JSON.parse(fs.readFileSync(SESSIONS_PATH, 'utf-8'));
  } catch {
    return {};
  }
}

function saveSessions(sessions) {
  const dir = path.dirname(SESSIONS_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(SESSIONS_PATH, JSON.stringify(sessions));
}

/**
 * Create a new session. Returns the new sessionId.
 * @param {{ clientId?: string }} opts
 * @returns {string} sessionId
 */
export function createSession({ clientId } = {}) {
  const sessions = loadSessions();
  const id = uuidv4();
  sessions[id] = {
    id,
    clientId: clientId || null,
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  saveSessions(sessions);
  return id;
}

/**
 * Get an existing session by ID.
 * @param {string} sessionId
 * @returns {object|null}
 */
export function getSession(sessionId) {
  const sessions = loadSessions();
  return sessions[sessionId] || null;
}

/**
 * Append new messages to a session's history.
 * @param {string} sessionId
 * @param {{ role: string, content: string, sources?: object[] }[]} messages
 */
export function appendToSession(sessionId, messages) {
  const sessions = loadSessions();
  if (!sessions[sessionId]) return;
  sessions[sessionId].messages.push(...messages);
  sessions[sessionId].updatedAt = new Date().toISOString();
  saveSessions(sessions);
}

/**
 * List all sessions (with messages included for search and loading).
 * @returns {object[]}
 */
export function listSessions() {
  const sessions = loadSessions();
  return Object.values(sessions).map((session) => ({
    ...session,
    messageCount: session.messages.length,
  }));
}

/**
 * Delete an existing session.
 * @param {string} sessionId
 * @returns {boolean}
 */
export function deleteSession(sessionId) {
  const sessions = loadSessions();
  if (sessions[sessionId]) {
    delete sessions[sessionId];
    saveSessions(sessions);
    return true;
  }
  return false;
}
