import Link from "next/link";
import { ArrowUpRight, User } from "lucide-react";
import { CLIENTS } from "@/lib/mockData";

/** Map from 6-digit clientId -> URL slug */
const CLIENT_ID_TO_SLUG = {
  "005511": "005511_LimWeiMing",
  "005512": "005512_SarahTan",
  "005513": "005513_AhmadRazif",
  "005514": "005514_JenniferKoh",
  "005515": "005515_DavidNg",
  "005516": "005516_RosnahYusof",
};

/** Risk profile badge colours */
const RISK_COLORS = {
  Conservative:          { bg: "#ddf4ff", text: "#0969da", border: "#b6e3ff" },
  Moderate:              { bg: "#fff8c5", text: "#9a6700", border: "#f0d800" },
  "Moderate-Aggressive": { bg: "#fff3cd", text: "#856404", border: "#ffda6a" },
  Aggressive:            { bg: "#ffebe9", text: "#cf222e", border: "#ffcecb" },
};

/**
 * Extract all client IDs mentioned in a piece of text.
 * Looks for patterns like:  005511, 005511/LimWeiMing, 005511_LimWeiMing
 */
export function extractMentionedClientIds(text = "") {
  const found = new Set();
  const pattern = /\b(005511|005512|005513|005514|005515|005516)\b/g;
  let m;
  while ((m = pattern.exec(text)) !== null) {
    found.add(m[1]);
  }
  return [...found];
}

/**
 * A single clickable client card.
 *
 * Props:
 *   clientId  – 6-digit id  (required if clientData not passed)
 *   clientData – CLIENTS entry (optional, will be looked up if omitted)
 *   score      – relevance score 0-1 (optional)
 *   tab        – "info"|"photo"  (default "info")
 *   compact    – boolean, renders a slimmer pill-style card
 */
export default function ClientCard({ clientId, clientData, score, tab = "info", compact = false }) {
  const client = clientData || CLIENTS.find((c) => c.id === clientId);
  if (!client) return null;

  const slug = CLIENT_ID_TO_SLUG[client.id] || `${client.id}`;
  const href = `/client/${slug}${tab !== "info" ? `?tab=${tab}` : ""}`;
  const riskColor = RISK_COLORS[client.riskProfile] || RISK_COLORS["Moderate"];
  const initials = client.name.split("/")[1]?.[0] || "C";
  const displayName = client.name; // e.g. "005511/LimWeiMing"

  if (compact) {
    // Slim pill used in the dashboard widget
    return (
      <Link href={href} style={{ textDecoration: "none", display: "block" }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "7px 10px",
          background: "#f6f8fa",
          border: "1px solid #d0d7de",
          borderRadius: "8px",
          cursor: "pointer",
          transition: "border-color 0.15s, box-shadow 0.15s",
          fontSize: "12px",
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "#0969da"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(9,105,218,0.12)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "#d0d7de"; e.currentTarget.style.boxShadow = "none"; }}
        >
          {/* Avatar */}
          <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#e8f0fe", border: "1.5px solid #c8d8f8", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 11, color: "#1a56db", flexShrink: 0 }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, color: "#24292f", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{displayName}</div>
            <div style={{ color: "#57606a", fontSize: 10, marginTop: 1 }}>{client.riskProfile} · {client.age}y</div>
          </div>
          {score != null && (
            <span style={{ fontSize: 10, fontWeight: 600, color: "#57606a", background: "#eaecef", borderRadius: 4, padding: "1px 5px", flexShrink: 0 }}>
              {(score * 100).toFixed(0)}%
            </span>
          )}
          <ArrowUpRight size={13} style={{ color: "#57606a", flexShrink: 0 }} />
        </div>
      </Link>
    );
  }

  // Full card used in chatbot.js
  return (
    <Link href={href} style={{ textDecoration: "none", display: "block" }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "10px",
          padding: "10px 12px",
          background: "#ffffff",
          border: "1px solid #d0d7de",
          borderRadius: "10px",
          cursor: "pointer",
          transition: "border-color 0.15s, box-shadow 0.15s, transform 0.1s",
          fontSize: "12.5px",
          position: "relative",
          overflow: "hidden",
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "#0969da"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(9,105,218,0.12)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "#d0d7de"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}
      >
        {/* Left accent bar */}
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: "#0969da", borderRadius: "10px 0 0 10px" }} />

        {/* Avatar */}
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #1a56db, #0969da)", border: "2px solid #c8d8f8", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "white", flexShrink: 0, marginLeft: 8 }}>
          {initials}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
            <span style={{ fontWeight: 700, color: "#0969da", fontSize: 13 }}>{displayName}</span>
            {score != null && (
              <span style={{ fontSize: 10, fontWeight: 600, color: "#57606a", background: "#eaecef", borderRadius: 4, padding: "1px 5px" }}>
                {(score * 100).toFixed(0)}% match
              </span>
            )}
          </div>
          <div style={{ color: "#57606a", fontSize: 11.5, marginBottom: 4, lineHeight: 1.4 }}>
            {client.summary?.slice(0, 90)}{client.summary?.length > 90 ? "…" : ""}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            <span style={{ fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 20, background: riskColor.bg, color: riskColor.text, border: `1px solid ${riskColor.border}` }}>
              {client.riskProfile}
            </span>
            <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 20, background: "#f6f8fa", color: "#57606a", border: "1px solid #d0d7de" }}>
              Age {client.age}
            </span>
            {client.goals?.slice(0, 1).map((g, i) => (
              <span key={i} style={{ fontSize: 10, padding: "1px 6px", borderRadius: 20, background: "#f6f8fa", color: "#57606a", border: "1px solid #d0d7de", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 140 }}>
                {g}
              </span>
            ))}
          </div>
        </div>

        {/* Arrow */}
        <ArrowUpRight size={15} style={{ color: "#0969da", flexShrink: 0, marginTop: 2 }} />
      </div>
    </Link>
  );
}

/**
 * A section rendered below the AI reply showing clickable client cards
 * for every client mentioned in the response (parsed from text + relevantClients).
 */
export function ClientCardSection({ text = "", relevantClients = [], sources = [], compact = false }) {
  // Merge: clients from relevantClients array + clients mentioned by ID in text
  const allIds = new Set();

  // From the RAG relevantClients list
  const rcMap = {};
  (relevantClients || []).forEach((rc) => {
    allIds.add(rc.clientId);
    rcMap[rc.clientId] = rc.maxScore;
  });

  // From text mention scanning
  extractMentionedClientIds(text).forEach((id) => allIds.add(id));

  // Also scan sources
  (sources || []).forEach((s) => { if (s.clientId) allIds.add(s.clientId); });

  if (allIds.size === 0) return null;

  const cards = [...allIds]
    .map((id) => ({ id, score: rcMap[id] }))
    .filter(({ id }) => CLIENTS.find((c) => c.id === id)); // only known clients

  if (cards.length === 0) return null;

  return (
    <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px dashed rgba(0,0,0,0.1)" }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: "#57606a", display: "block", marginBottom: 7, letterSpacing: "0.02em" }}>
        📂 Open client repository
      </span>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {cards.map(({ id, score }) => (
          <ClientCard key={id} clientId={id} score={score} compact={compact} />
        ))}
      </div>
    </div>
  );
}
