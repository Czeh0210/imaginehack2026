/**
 * pages/test.js
 * Visual test dashboard to verify semantic search + RAG are working.
 * Open http://localhost:3000/test in your browser.
 */

import { useState } from 'react';

const CLIENTS = [
  { id: 'c1-lim-wei-ming',  name: 'Lim Wei Ming' },
  { id: 'c2-sarah-tan',     name: 'Sarah Tan Hui Ling' },
  { id: 'c3-ahmad-razif',   name: 'Ahmad Razif bin Hamid' },
  { id: 'c4-jennifer-koh',  name: 'Jennifer Koh Mei Lin' },
  { id: 'c5-david-ng',      name: 'David Ng Jia Hao' },
  { id: 'c6-rosnah-yusof',  name: 'Puan Rosnah binti Yusof' },
];

const DEMO_QUERIES = [
  'retirement concerns',
  'passive income',
  'education fund for children',
  'worried about savings being enough',
  'single parent financial planning',
  'aggressive growth investing',
  'halal Shariah products',
  'market volatility fear',
];

export default function TestPage() {
  // ── Seed state ────────────────────────────────────────────────────────────
  const [seedStatus, setSeedStatus] = useState(null);
  const [seeding, setSeeding] = useState(false);

  // ── Search state ──────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('retirement concerns');
  const [searchClientId, setSearchClientId] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);

  // ── Chat state ────────────────────────────────────────────────────────────
  const [chatMessage, setChatMessage] = useState('What are this client\'s retirement concerns and long-term financial goals?');
  const [chatClientId, setChatClientId] = useState('c1-lim-wei-ming');
  const [chatResult, setChatResult] = useState(null);
  const [chatting, setChatting] = useState(false);

  // ── Actions ───────────────────────────────────────────────────────────────
  async function handleSeed() {
    setSeeding(true);
    setSeedStatus(null);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();
      setSeedStatus({ ok: res.ok, data });
    } catch (e) {
      setSeedStatus({ ok: false, data: { error: e.message } });
    }
    setSeeding(false);
  }

  async function handleSearch() {
    setSearching(true);
    setSearchResults(null);
    try {
      const body = {
        query: searchQuery,
        topK: 5,
        threshold: 0.3,
        includeClientRanking: !searchClientId,
      };
      if (searchClientId) body.clientId = searchClientId;
      const res = await fetch('/api/memory/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      setSearchResults(await res.json());
    } catch (e) {
      setSearchResults({ error: e.message });
    }
    setSearching(false);
  }

  async function handleChat() {
    setChatting(true);
    setChatResult(null);
    try {
      const body = { message: chatMessage };
      if (chatClientId) body.clientId = chatClientId;
      const res = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      setChatResult(await res.json());
    } catch (e) {
      setChatResult({ error: e.message });
    }
    setChatting(false);
  }

  // ── Styles ────────────────────────────────────────────────────────────────
  const s = {
    page: { fontFamily: 'system-ui,sans-serif', maxWidth: 900, margin: '0 auto', padding: '24px 16px', background: '#0f1117', minHeight: '100vh', color: '#e2e8f0' },
    h1: { fontSize: 26, fontWeight: 700, marginBottom: 4, color: '#fff' },
    sub: { color: '#94a3b8', marginBottom: 32, fontSize: 14 },
    card: { background: '#1e2533', border: '1px solid #2d3748', borderRadius: 12, padding: 24, marginBottom: 24 },
    cardTitle: { fontSize: 17, fontWeight: 600, marginBottom: 16, color: '#60a5fa', display: 'flex', alignItems: 'center', gap: 8 },
    btn: { background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 600, cursor: 'pointer', fontSize: 14 },
    btnGreen: { background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 600, cursor: 'pointer', fontSize: 14 },
    btnDisabled: { background: '#374151', color: '#6b7280', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 600, cursor: 'not-allowed', fontSize: 14 },
    input: { width: '100%', background: '#111827', border: '1px solid #374151', borderRadius: 8, padding: '10px 12px', color: '#e2e8f0', fontSize: 14, marginBottom: 12, boxSizing: 'border-box' },
    select: { background: '#111827', border: '1px solid #374151', borderRadius: 8, padding: '10px 12px', color: '#e2e8f0', fontSize: 14, marginBottom: 12, width: '100%' },
    label: { display: 'block', fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' },
    row: { display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' },
    tag: (score) => ({
      display: 'inline-block', padding: '2px 8px', borderRadius: 9999, fontSize: 12, fontWeight: 700,
      background: score > 0.65 ? '#064e3b' : score > 0.5 ? '#1e3a5f' : '#1f2937',
      color: score > 0.65 ? '#34d399' : score > 0.5 ? '#60a5fa' : '#9ca3af',
    }),
    resultCard: { background: '#111827', border: '1px solid #1f2937', borderRadius: 8, padding: 14, marginBottom: 10 },
    resultHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap', gap: 6 },
    resultContent: { fontSize: 13, color: '#cbd5e1', lineHeight: 1.6 },
    clientBadge: { background: '#1e3a5f', color: '#93c5fd', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600 },
    aiReply: { background: '#0c1a0c', border: '1px solid #14532d', borderRadius: 8, padding: 16, fontSize: 13, lineHeight: 1.8, color: '#d1fae5', whiteSpace: 'pre-wrap' },
    pill: { display: 'inline-flex', alignItems: 'center', gap: 4, background: '#1f2937', borderRadius: 6, padding: '4px 10px', fontSize: 11, color: '#94a3b8', cursor: 'pointer', border: '1px solid #374151' },
    pillRow: { display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
    stepNum: { background: '#1d4ed8', color: '#fff', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 },
    successBox: { background: '#064e3b', border: '1px solid #065f46', borderRadius: 8, padding: 12, color: '#6ee7b7', fontSize: 13 },
    errorBox: { background: '#450a0a', border: '1px solid #7f1d1d', borderRadius: 8, padding: 12, color: '#fca5a5', fontSize: 13 },
  };

  return (
    <div style={s.page}>
      <h1 style={s.h1}>🧠 Semantic Search &amp; RAG — Live Test Dashboard</h1>
      <p style={s.sub}>Verify that embeddings + semantic search + AI chat are working correctly</p>

      {/* ── STEP 1: SEED ─────────────────────────────────────────────────── */}
      <div style={s.card}>
        <div style={s.cardTitle}>
          <span style={s.stepNum}>1</span>
          Seed the Knowledge Base
        </div>
        <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 16, marginTop: 0 }}>
          Generates Gemini embeddings for all 28 synthetic memories (6 clients) and stores them.
          Run this <strong style={{ color: '#fff' }}>once</strong> before testing search.
          Safe to re-run — it clears and re-seeds.
        </p>
        <button
          style={seeding ? s.btnDisabled : s.btnGreen}
          onClick={handleSeed}
          disabled={seeding}
          id="btn-seed"
        >
          {seeding ? '⏳ Generating embeddings… (takes ~15s)' : '🌱 Seed Knowledge Base'}
        </button>

        {seedStatus && (
          <div style={{ marginTop: 14, ...(seedStatus.ok ? s.successBox : s.errorBox) }}>
            {seedStatus.ok ? (
              <>
                ✅ <strong>Seed complete!</strong>&nbsp;
                Clients: {seedStatus.data.inserted?.clients} &nbsp;|&nbsp;
                Memories embedded: {seedStatus.data.inserted?.memories} &nbsp;|&nbsp;
                Mode: {seedStatus.data.stats?.storeMode}
              </>
            ) : (
              <>❌ Error: {seedStatus.data.error}</>
            )}
          </div>
        )}
      </div>

      {/* ── STEP 2: SEMANTIC SEARCH ───────────────────────────────────────── */}
      <div style={s.card}>
        <div style={s.cardTitle}>
          <span style={s.stepNum}>2</span>
          Test Semantic Search (no keyword matching)
        </div>
        <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 12, marginTop: 0 }}>
          The key proof: queries find relevant memories <strong style={{ color: '#fbbf24' }}>even when the exact words don't appear</strong> in the stored text.
        </p>

        {/* Demo query pills */}
        <div style={s.pillRow}>
          {DEMO_QUERIES.map(q => (
            <span key={q} style={s.pill} onClick={() => setSearchQuery(q)}>
              {q}
            </span>
          ))}
        </div>

        <div style={s.row}>
          <div style={{ flex: 2, minWidth: 200 }}>
            <label style={s.label}>Query</label>
            <input
              id="search-query"
              style={s.input}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Type any natural language query…"
            />
          </div>
          <div style={{ flex: 1, minWidth: 180 }}>
            <label style={s.label}>Filter by Client (optional)</label>
            <select
              id="search-client"
              style={s.select}
              value={searchClientId}
              onChange={e => setSearchClientId(e.target.value)}
            >
              <option value="">— Global (all clients) —</option>
              {CLIENTS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <button
              id="btn-search"
              style={searching ? s.btnDisabled : s.btn}
              onClick={handleSearch}
              disabled={searching}
            >
              {searching ? '⏳ Searching…' : '🔍 Search'}
            </button>
          </div>
        </div>

        {searchResults && (
          <div style={{ marginTop: 16 }}>
            {searchResults.error ? (
              <div style={s.errorBox}>❌ {searchResults.error}</div>
            ) : (
              <>
                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 10 }}>
                  Found <strong style={{ color: '#fff' }}>{searchResults.total}</strong> results &nbsp;·&nbsp;
                  Mode: <strong style={{ color: '#fff' }}>{searchResults.mode}</strong>
                </div>

                {searchResults.results?.map((r, i) => (
                  <div key={r.id || i} style={s.resultCard}>
                    <div style={s.resultHeader}>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={s.clientBadge}>{r.clientName}</span>
                        <span style={{ fontSize: 11, color: '#6b7280' }}>{r.sourceType} · {r.metadata?.date}</span>
                      </div>
                      <span style={s.tag(r.score)}>
                        {(r.score * 100).toFixed(1)}% match
                      </span>
                    </div>
                    <div style={s.resultContent}>"{r.content}"</div>
                  </div>
                ))}

                {searchResults.clientRanking && (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Client Relevance Ranking
                    </div>
                    {searchResults.clientRanking.map((c, i) => (
                      <div key={c.clientId} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <span style={{ color: '#6b7280', fontSize: 12, width: 16 }}>#{i + 1}</span>
                        <span style={{ fontSize: 13, color: '#e2e8f0', flex: 1 }}>{c.clientName}</span>
                        <div style={{ background: '#1f2937', borderRadius: 4, height: 8, width: 120, overflow: 'hidden' }}>
                          <div style={{ background: '#3b82f6', height: '100%', width: `${c.maxScore * 100}%`, borderRadius: 4 }} />
                        </div>
                        <span style={{ fontSize: 11, color: '#60a5fa', width: 40, textAlign: 'right' }}>{(c.maxScore * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* ── STEP 3: RAG CHAT ─────────────────────────────────────────────── */}
      <div style={s.card}>
        <div style={s.cardTitle}>
          <span style={s.stepNum}>3</span>
          Test AI Chat with Memory Retrieval (RAG)
        </div>
        <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 12, marginTop: 0 }}>
          The AI retrieves relevant memories, then generates a contextual, cited response.
          Leave client blank for cross-client global mode.
        </p>

        <div>
          <label style={s.label}>Question</label>
          <textarea
            id="chat-message"
            style={{ ...s.input, minHeight: 60, resize: 'vertical' }}
            value={chatMessage}
            onChange={e => setChatMessage(e.target.value)}
          />
          <label style={s.label}>Client (optional — blank = global search)</label>
          <select
            id="chat-client"
            style={s.select}
            value={chatClientId}
            onChange={e => setChatClientId(e.target.value)}
          >
            <option value="">— No filter (cross-client) —</option>
            {CLIENTS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button
            id="btn-chat"
            style={chatting ? s.btnDisabled : s.btn}
            onClick={handleChat}
            disabled={chatting}
          >
            {chatting ? '⏳ AI thinking… (takes ~5–10s)' : '💬 Ask AI'}
          </button>
        </div>

        {chatResult && (
          <div style={{ marginTop: 16 }}>
            {chatResult.error ? (
              <div style={s.errorBox}>❌ {chatResult.error}</div>
            ) : (
              <>
                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 10 }}>
                  Mode: <strong style={{ color: '#fff' }}>{chatResult.usage?.mode}</strong> &nbsp;·&nbsp;
                  Memories retrieved: <strong style={{ color: '#fff' }}>{chatResult.usage?.memoriesRetrieved}</strong> &nbsp;·&nbsp;
                  Embedding dim: <strong style={{ color: '#fff' }}>{chatResult.usage?.embeddingDim}</strong>
                </div>

                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  AI Reply
                </div>
                <div style={s.aiReply}>{chatResult.reply}</div>

                {chatResult.sources?.length > 0 && (
                  <div style={{ marginTop: 14 }}>
                    <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Retrieved Memories Used ({chatResult.sources.length})
                    </div>
                    {chatResult.sources.map((s2, i) => (
                      <div key={i} style={s.resultCard}>
                        <div style={s.resultHeader}>
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                            <span style={s.clientBadge}>{s2.clientName}</span>
                            <span style={{ fontSize: 11, color: '#6b7280' }}>{s2.sourceType} · {s2.metadata?.date}</span>
                          </div>
                          <span style={s.tag(s2.score)}>{(s2.score * 100).toFixed(1)}% match</span>
                        </div>
                        <div style={s.resultContent}>"{s2.content.slice(0, 160)}…"</div>
                      </div>
                    ))}
                  </div>
                )}

                {chatResult.relevantClients?.length > 0 && (
                  <div style={{ marginTop: 14 }}>
                    <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Relevant Clients Found
                    </div>
                    {chatResult.relevantClients.map((c, i) => (
                      <div key={c.clientId} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <span style={{ color: '#6b7280', fontSize: 12, width: 16 }}>#{i + 1}</span>
                        <span style={{ fontSize: 13, color: '#e2e8f0', flex: 1 }}>{c.clientName}</span>
                        <div style={{ background: '#1f2937', borderRadius: 4, height: 8, width: 120, overflow: 'hidden' }}>
                          <div style={{ background: '#10b981', height: '100%', width: `${c.maxScore * 100}%`, borderRadius: 4 }} />
                        </div>
                        <span style={{ fontSize: 11, color: '#34d399', width: 40, textAlign: 'right' }}>{(c.maxScore * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
