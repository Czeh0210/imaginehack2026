/**
 * GET /api/clients
 * Returns all synthetic client profiles (without embeddings).
 */
import { CLIENTS } from '@/lib/mockData.js';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  return res.status(200).json({ clients: CLIENTS, total: CLIENTS.length });
}
