/**
 * lib/fileStore.js
 * File-backed persistence for per-client advisory file lists.
 * Stored in data/advisory-files.json — same pattern as sessions.json.
 */

import fs from 'fs';
import path from 'path';

const STORE_PATH = path.join(process.cwd(), 'data', 'advisory-files.json');

function load() {
  try {
    if (!fs.existsSync(STORE_PATH)) return {};
    return JSON.parse(fs.readFileSync(STORE_PATH, 'utf-8'));
  } catch {
    return {};
  }
}

function save(data) {
  const dir = path.dirname(STORE_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(STORE_PATH, JSON.stringify(data));
}

/**
 * Get advisory files for a client.
 * Returns null when no data has been saved yet (caller provides defaults).
 */
export function getClientFiles(clientKey) {
  const data = load();
  return data[clientKey] ?? null;
}

/**
 * Persist the full file list for a client (replace, not patch).
 * Strips binary content fields that are too large to store (audio/video data URLs).
 */
export function saveClientFiles(clientKey, files) {
  const data = load();
  data[clientKey] = files.map((f) => ({
    ...f,
    // Drop large binary data URLs — audio/video content is not useful to persist
    content: f.content && f.content.startsWith('data:audio') ? null
           : f.content && f.content.startsWith('data:video') ? null
           : f.content,
  }));
  save(data);
}
