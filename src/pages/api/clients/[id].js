/**
 * GET /api/clients/[id]
 * Returns a single client profile by ID.
 */
import { CLIENTS, MEMORIES } from '@/lib/mockData.js';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const client = CLIENTS.find((c) => c.id === id);

  if (!client) {
    return res.status(404).json({ error: `Client '${id}' not found` });
  }

  // Include the raw (un-embedded) memories for this client
  const memories = MEMORIES.filter((m) => m.clientId === id).map(
    ({ clientId, clientName, ...rest }) => rest
  );

  return res.status(200).json({ client, memories, memoryCount: memories.length });
}
