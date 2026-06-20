/**
 * /api/clients/[id]/files
 *
 * GET  — return advisory file list for this client
 *         Returns { files, source: "stored"|"default" }
 *         `source` tells the caller whether defaults were bootstrapped.
 *
 * POST — persist (replace) advisory file list for this client
 *         Body: { files: AdvisoryFile[] }
 *         Returns { ok: true, count: number }
 */

import { getClientFiles, saveClientFiles } from '@/lib/fileStore.js';

export const config = {
  api: {
    bodyParser: true,
    responseLimit: '10mb',
  },
};

export default function handler(req, res) {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Missing client id' });

  if (req.method === 'GET') {
    const files = getClientFiles(id);
    if (files !== null) {
      return res.status(200).json({ files, source: 'stored' });
    }
    // No data yet — tell the client to bootstrap with defaults
    return res.status(200).json({ files: null, source: 'default' });
  }

  if (req.method === 'POST') {
    const { files } = req.body ?? {};
    if (!Array.isArray(files)) {
      return res.status(400).json({ error: 'Body must be { files: AdvisoryFile[] }' });
    }
    saveClientFiles(id, files);
    return res.status(200).json({ ok: true, count: files.length });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
