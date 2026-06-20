import { useState, useRef, useEffect, useCallback } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { 
  Paperclip, ArrowUp, Plus, Home, Users, MessageSquare, ChevronLeft, Landmark, 
  Coins, FileClock, ShieldAlert, PanelLeftClose, PanelLeftOpen, Search, 
  FolderKanban, Sparkles, Code, Sliders, SlidersHorizontal, Handshake 
} from "lucide-react";
import { CLIENTS } from "@/lib/mockData";
import TopNav from "@/components/TopNav";
import UserMessage from "@/components/ui/UserMessage";
import { ClientCardSection } from "@/components/ui/ClientCard";

const clientIdToRepoId = {
  "005511": "005511_LimWeiMing",
  "005512": "005512_SarahTan",
  "005513": "005513_AhmadRazif",
  "005514": "005514_JenniferKoh",
  "005515": "005515_DavidNg",
  "005516": "005516_RosnahYusof",
};

const QUICK_ACTIONS = [
  { icon: ShieldAlert, label: "Analyze client risk profile" },
  { icon: Landmark, label: "Review retirement timeline" },
  { icon: Coins, label: "Identify tax saving strategies" },
  { icon: FileClock, label: "Verify policy coverage details" },
];

function renderMarkdown(text) {
  if (!text) return "";
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/```(\w+)?\n?([\s\S]*?)```/g, (_, lang, code) => `<pre style="background:#F2F5F3;padding:12px;border-radius:8px;font-size:13px;overflow-x:auto;color:#101411;margin:8px 0;border:1px solid #E4EBE6;"><code>${code.trim()}</code></pre>`)
    .replace(/`([^`]+)`/g, '<code style="background:#E4EBE6;padding:2px 5px;border-radius:4px;font-size:13px;color:#08872B;">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/^### (.+)$/gm, '<h3 style="font-size:14px;margin:10px 0 5px;font-weight:600;color:#101411;">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="font-size:16px;margin:12px 0 6px;font-weight:600;color:#101411;">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="font-size:18px;margin:14px 0 8px;font-weight:700;color:#101411;">$1</h1>')
    .replace(/^\d+\. (.+)$/gm, '<li style="margin-left:16px;font-size:14px;color:#101411;margin-bottom:3px;">$1</li>')
    .replace(/^[-*] (.+)$/gm, '<li style="margin-left:16px;font-size:14px;color:#101411;margin-bottom:3px;">$1</li>')
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br/>");
  return `<p style="margin:0 0 10px;color:#101411;line-height:1.65;">${html}</p>`;
}

export default function ChatbotPage() {
  const router = useRouter();

  const [selectedClientId, setSelectedClientId] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [error, setError] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [showContextList, setShowContextList] = useState(false);
  const [contextSearchQuery, setContextSearchQuery] = useState("");

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("chatbot_sidebar_collapsed");
    if (saved === "true") setIsSidebarCollapsed(true);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("chatbot_sidebar_collapsed", String(next));
      return next;
    });
  };

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const contextSelectorRef = useRef(null);

  const activeClient = CLIENTS.find((c) => c.id === selectedClientId);
  const hasMessages = messages.length > 0;

  const clearChat = useCallback(() => {
    setMessages([]);
    setSessionId(null);
    setActiveSessionId(null);
    setError(null);
  }, []);

  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch("/api/chat/session");
      const data = await res.json();
      setSessions(data.sessions || []);
    } catch {}
  }, []);

  const selectSession = useCallback(async (id) => {
    setActiveSessionId(id);
    setSessionId(id);
    try {
      const res = await fetch(`/api/chat/session?sessionId=${id}`);
      const data = await res.json();
      if (data.session) setMessages(data.session.messages || []);
    } catch {}
  }, []);

  const createNewSession = useCallback(async () => {
    try {
      const res = await fetch("/api/chat/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: selectedClientId || undefined }),
      });
      const data = await res.json();
      setSessionId(data.sessionId);
      setActiveSessionId(data.sessionId);
      setMessages([]);
      setError(null);
      fetchSessions();
    } catch {}
  }, [selectedClientId, fetchSessions]);

  // Load session from URL params (coming from widget maximize)
  useEffect(() => {
    if (!router.isReady) return;
    const { sessionId: sid, clientId: cid } = router.query;
    if (cid) setSelectedClientId(cid);
    if (sid) {
      setSessionId(sid);
      setActiveSessionId(sid);
      fetch(`/api/chat/session?sessionId=${sid}`)
        .then((r) => r.json())
        .then((d) => { if (d.session) setMessages(d.session.messages || []); })
        .catch(() => {});
    }
  }, [router.isReady]);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "28px";
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, [input]);

  useEffect(() => {
    const handler = (e) => {
      if (contextSelectorRef.current && !contextSelectorRef.current.contains(e.target)) {
        setShowContextList(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleFileUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedFile(file);
      setFilePreview({ name: file.name, dataUrl: e.target.result });
    };
    reader.readAsDataURL(file);
  };

  const sendMessage = useCallback(async (overrideInput) => {
    const text = (typeof overrideInput === "string" ? overrideInput : input).trim();
    if (!text && !uploadedFile) return;
    if (isLoading) return;

    const userMsg = { 
      role: "user", 
      content: text, 
      file: (uploadedFile && filePreview) ? { 
        name: uploadedFile.name,
        type: uploadedFile.type,
        dataUrl: filePreview.dataUrl
      } : null 
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    const fileToSend = uploadedFile;
    const previewToSend = filePreview;
    setUploadedFile(null);
    setFilePreview(null);
    setIsLoading(true);
    setError(null);

    try {
      let filePayload = null;
      if (fileToSend && previewToSend) {
        filePayload = { data: previewToSend.dataUrl.split(",")[1], mimeType: fileToSend.type };
      }
      const res = await fetch("/api/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          sessionId,
          clientId: selectedClientId || undefined,
          topK: 5,
          threshold: 0.3,
          file: filePayload,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!sessionId && data.sessionId) {
        setSessionId(data.sessionId);
        setActiveSessionId(data.sessionId);
        fetchSessions();
      }
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply,
          sources: data.sources,
          relevantClients: data.relevantClients,
        },
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [input, uploadedFile, filePreview, isLoading, sessionId, selectedClientId, fetchSessions]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Minimize: go back to dashboard, tell widget to re-open with the current session
  const handleMinimize = useCallback(() => {
    const params = new URLSearchParams({ openChat: "1" });
    if (sessionId) params.set("sessionId", sessionId);
    if (selectedClientId) params.set("clientId", selectedClientId);
    router.push(`/dashboard?${params.toString()}`);
  }, [router, sessionId, selectedClientId]);

  // ── Shared input card ──────────────────────────────────────
  const InputCard = (
    <div className="input-card">
      {filePreview && (
        <div className="file-bar">
          <span 
            className="file-preview-name-clickable" 
            onClick={() => setPreviewFile({ name: filePreview.name, dataUrl: filePreview.dataUrl, type: uploadedFile?.type })}
            title="Click to preview file"
          >
            📄 {filePreview.name} (Preview)
          </span>
          <button onClick={() => { setUploadedFile(null); setFilePreview(null); }}>✕</button>
        </div>
      )}

      <textarea
        ref={textareaRef}
        className="chat-textarea"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="How can I help you today?"
        disabled={isLoading}
        rows={1}
      />

      <div className="input-toolbar">
        {/* Left */}
        <div className="toolbar-left">
          <button className="toolbar-icon-btn" onClick={() => fileInputRef.current?.click()} disabled={isLoading} title="Upload proposal file">
            <Paperclip size={16} />
          </button>
          <input ref={fileInputRef} type="file" accept=".pdf,.txt" style={{ display: "none" }} onChange={(e) => handleFileUpload(e.target.files[0])} />
        </div>

        {/* Right */}
        <div className="toolbar-right" ref={contextSelectorRef}>
          {hasMessages && (
            <button className="reset-btn" onClick={clearChat}>
              Reset
            </button>
          )}

          <div className="scope-pill-container">
            <button className={`context-btn ${activeClient ? "selected" : ""}`} onClick={() => setShowContextList(!showContextList)}>
              <Plus size={14} />
              <span>{activeClient ? `Client: ${activeClient.name.split("/")[1] || activeClient.name}` : "Client"}</span>
            </button>

            {showContextList && (
              <div className="scope-popover">
                <div className="sp-search">
                  <input type="text" placeholder="Search clients..." value={contextSearchQuery} onChange={(e) => setContextSearchQuery(e.target.value)} autoFocus className="sp-input" />
                </div>
                <div className="sp-options">
                  <button className={`sp-item ${!selectedClientId ? "active" : ""}`} onClick={() => { setSelectedClientId(""); setShowContextList(false); setContextSearchQuery(""); clearChat(); }}>
                    🌐 Global Search
                  </button>
                  <div className="sp-divider">Clients</div>
                  {CLIENTS.filter((c) => c.name.toLowerCase().includes(contextSearchQuery.toLowerCase())).map((c) => (
                    <button key={c.id} className={`sp-item ${selectedClientId === c.id ? "active" : ""}`} onClick={() => { setSelectedClientId(c.id); setShowContextList(false); setContextSearchQuery(""); clearChat(); }}>
                      👤 {c.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            className={`send-btn ${(input.trim() || uploadedFile) ? "active" : ""}`}
            disabled={(!input.trim() && !uploadedFile) || isLoading}
            onClick={() => sendMessage()}
          >
            <ArrowUp size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Head><title>IntelliBot — AdvisorOS</title></Head>
      <TopNav />

      <div className="workspace">
        {/* ── SIDEBAR (Claude-style collapsible) ── */}
        <aside className={`sidebar ${isSidebarCollapsed ? "collapsed" : ""}`}>
          {isSidebarCollapsed ? (
            /* Collapsed Sidebar Content */
            <div className="sidebar-collapsed-content">
              <button className="collapsed-toggle-btn" onClick={toggleSidebar} title="Expand sidebar">
                <PanelLeftOpen size={18} />
              </button>
              
              <button className="collapsed-new-chat-btn" onClick={createNewSession} title="New chat">
                <Plus size={18} />
              </button>

              <div className="collapsed-nav-items">
                <button className="collapsed-nav-btn active" onClick={createNewSession} title="Chats">
                  <MessageSquare size={18} />
                </button>
                <button className="collapsed-nav-btn" title="Clients">
                  <Users size={18} />
                </button>
                <button className="collapsed-nav-btn" title="Artifacts">
                  <Sparkles size={18} />
                </button>
                <button className="collapsed-nav-btn" title="Partners">
                  <Handshake size={18} />
                </button>
                <button className="collapsed-nav-btn" title="Customize">
                  <Sliders size={18} />
                </button>
              </div>

              <div className="collapsed-bottom">
                <button className="collapsed-nav-btn" onClick={handleMinimize} title="Back to widget">
                  <ChevronLeft size={18} />
                </button>
              </div>
            </div>
          ) : (
            /* Expanded Sidebar Content */
            <div className="sidebar-expanded-content">
              {/* Brand Header */}
              <div className="sb-header">
                <span className="sb-brand-name">IntelliBot</span>
                <div className="sb-header-actions">
                  <button className="sb-header-btn" title="Search chats">
                    <Search size={16} />
                  </button>
                  <button className="sb-header-btn" onClick={toggleSidebar} title="Collapse sidebar">
                    <PanelLeftClose size={16} />
                  </button>
                </div>
              </div>

              {/* New chat */}
              <button className="new-chat-btn" onClick={createNewSession}>
                <Plus size={16} strokeWidth={2.2} />
                New chat
              </button>

              {/* Main Navigation */}
              <nav className="sb-main-nav">
                <button className="sb-nav-link active" onClick={createNewSession}>
                  <MessageSquare size={16} />
                  <span>Chats</span>
                </button>
                <button className="sb-nav-link">
                  <Users size={16} />
                  <span>Clients</span>
                </button>
                <button className="sb-nav-link">
                  <Sparkles size={16} />
                  <span>Artifacts</span>
                </button>
                <button className="sb-nav-link">
                  <Handshake size={16} />
                  <span>Partners</span>
                </button>
                <button className="sb-nav-link">
                  <Sliders size={16} />
                  <span>Customize</span>
                </button>
              </nav>

              {/* Recents Section */}
              <div className="sb-recents">
                <div className="sb-recents-header">
                  <span className="sb-recents-label">Recents</span>
                  <button className="sb-recents-config-btn" title="Recents options">
                    <SlidersHorizontal size={12} />
                  </button>
                </div>
                <div className="sb-recents-list">
                  {sessions.length === 0 ? (
                    <div className="sb-recents-empty">No sessions yet</div>
                  ) : (
                    [...sessions].reverse().map((s) => (
                      <button
                        key={s.id}
                        className={`sb-session-item ${activeSessionId === s.id ? "active" : ""}`}
                        onClick={() => selectSession(s.id)}
                      >
                        {s.messages?.[0]?.content?.slice(0, 38) || "Empty chat"}
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Bottom */}
              <div className="sb-bottom">
                <button className="sb-minimize-btn" onClick={handleMinimize}>
                  <ChevronLeft size={15} />
                  Back to widget
                </button>
              </div>
            </div>
          )}
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="main">
          {!hasMessages ? (
            /* ── WELCOME VIEW ── */
            <div className="welcome-view">
              <div className="welcome-center">
                <h1 className="welcome-heading">What can I help you check?</h1>
                <p className="welcome-sub">
                  Search client memories, check risk goals, or upload a proposal to analyse against client records.
                </p>

                <div className="welcome-input-wrap">
                  {InputCard}
                </div>

                {/* Action pills */}
                <div className="action-pills">
                  {QUICK_ACTIONS.map((a) => {
                    const IconComponent = a.icon;
                    return (
                      <button key={a.label} className="action-pill" onClick={() => sendMessage(a.label)}>
                        <IconComponent size={14} />
                        <span>{a.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* ── CHAT VIEW ── */
            <>
              <div className="messages-area">
                <div className="messages-inner">
                  {messages.map((msg, idx) => {
                    if (msg.role === "user") {
                      return (
                        <UserMessage
                          key={idx}
                          content={msg.content}
                          file={msg.file}
                          onFileClick={(f) => {
                            if (f.dataUrl) setPreviewFile(f);
                          }}
                        />
                      );
                    }

                    return (
                      <div key={idx} className="msg-row assistant">
                        <div className="ai-avatar">✦</div>

                        <div className="bubble assistant">
                          {/* Markdown text */}
                          <div dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />

                          {/* Raw sources collapsible (keep for power users) */}
                          {msg.sources && msg.sources.length > 0 && (
                            <details style={{ marginTop: "10px", borderTop: "1px dashed rgba(0,0,0,0.1)", paddingTop: "8px" }}>
                              <summary style={{ fontSize: "12px", color: "#0FBF3E", cursor: "pointer", fontWeight: 600, outline: "none" }}>
                                🔍 {msg.sources.length} matching memory sources
                              </summary>
                              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "8px" }}>
                                {msg.sources.map((s, sIdx) => {
                                  const repoSlug = clientIdToRepoId[s.clientId] || "005511_LimWeiMing";
                                  const tabParam = (s.sourceType === "document" || s.sourceType === "proposal") ? "photo" : "info";
                                  return (
                                    <a key={sIdx} href={`/client/${repoSlug}?tab=${tabParam}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "block" }}>
                                      <div style={{ background: "#f6f8fa", border: "1px solid #d0d7de", padding: "8px 10px", borderRadius: "8px", fontSize: "12px" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px", fontWeight: 600, color: "#57606a" }}>
                                          <span>{s.clientName} ({s.sourceType?.replace("_", " ")})</span>
                                          <span style={{ color: "#0FBF3E" }}>{(s.score * 100).toFixed(0)}%</span>
                                        </div>
                                        <div style={{ fontStyle: "italic", color: "#57606a", marginBottom: "3px" }}>&ldquo;{s.content.slice(0, 100)}...&rdquo;</div>
                                        <div style={{ fontSize: "10px", color: "#0FBF3E", textAlign: "right", fontWeight: 600 }}>View Repo ({tabParam} tab) ↗</div>
                                      </div>
                                    </a>
                                  );
                                })}
                              </div>
                            </details>
                          )}

                          {/* Clickable client cards — parsed from response text + RAG data */}
                          <ClientCardSection
                            text={msg.content}
                            relevantClients={msg.relevantClients}
                            sources={msg.sources}
                            compact={false}
                          />
                        </div>
                      </div>
                    );
                  })}

                  {isLoading && (
                    <div className="msg-row assistant">
                      <div className="ai-avatar">✦</div>
                      <div className="bubble assistant loading-bubble">
                        <span className="dot" /><span className="dot" /><span className="dot" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="error-bar">
                  <span>⚠️ {error}</span>
                  <button onClick={() => setError(null)}>✕</button>
                </div>
              )}

              {/* Input pinned at bottom in chat view */}
              <div className="chat-input-wrap">
                {InputCard}
              </div>
            </>
          )}
        </main>
      </div>

      {/* File Preview Modal */}
      {previewFile && (
        <div className="preview-modal-overlay" onClick={() => setPreviewFile(null)}>
          <div className="preview-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="preview-modal-header">
              <span className="preview-modal-title">File Preview: {previewFile.name}</span>
              <button className="preview-modal-close" onClick={() => setPreviewFile(null)}>✕</button>
            </div>
            <div className="preview-modal-body">
              {previewFile.type === "application/pdf" || previewFile.name.endsWith(".pdf") ? (
                <iframe src={previewFile.dataUrl} className="preview-iframe" title="PDF Preview" />
              ) : (
                <pre className="preview-text-block">
                  {(() => {
                    try {
                      const base64Data = previewFile.dataUrl.split(",")[1];
                      return decodeURIComponent(escape(atob(base64Data)));
                    } catch (err) {
                      return "Could not decode text file contents.";
                    }
                  })()}
                </pre>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        /* Root workspace below TopNav */
        .workspace {
          display: flex;
          height: calc(100vh - 44px);
          overflow: hidden;
          background: #ffffff;
        }

        /* ── Sidebar (Claude-style collapsible) ── */
        .sidebar {
          width: 256px;
          flex-shrink: 0;
          background: #F2F5F3;
          border-right: 1px solid #E4EBE6;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition: width 0.2s ease-in-out;
        }

        .sidebar.collapsed {
          width: 64px;
        }

        /* Sidebar Expanded Content */
        .sidebar-expanded-content {
          display: flex;
          flex-direction: column;
          height: 100%;
          width: 256px;
          padding: 0;
        }

        .sb-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 16px 12px;
          flex-shrink: 0;
        }

        .sb-brand-name {
          font-size: 16px;
          font-weight: 700;
          color: #101411;
          font-family: serif;
          letter-spacing: -0.2px;
        }

        .sb-header-actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .sb-header-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          color: #909692;
          padding: 4px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.12s, color 0.12s;
        }

        .sb-header-btn:hover {
          background-color: #E4EBE6;
          color: #101411;
        }

        .new-chat-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0 12px 14px;
          padding: 8px 12px;
          background: #ffffff;
          border: 1px solid #E4EBE6;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          color: #101411;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.12s, border-color 0.12s;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
        }

        .new-chat-btn:hover {
          background: #F2F5F3;
          border-color: #B6BFB8;
        }

        .sb-main-nav {
          display: flex;
          flex-direction: column;
          gap: 1px;
          padding: 0 12px;
          flex-shrink: 0;
        }

        .sb-nav-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 7px 10px;
          border-radius: 8px;
          font-size: 14px;
          color: #909692;
          text-decoration: none;
          border: none;
          background: none;
          cursor: pointer;
          font-family: inherit;
          text-align: left;
          transition: background 0.1s, color 0.1s;
          width: 100%;
          position: relative;
        }

        .sb-nav-link:hover {
          background: #E4EBE6;
          color: #101411;
        }

        .sb-nav-link.active {
          background: #E4EBE6;
          color: #101411;
          font-weight: 500;
        }

        .upgrade-badge {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 10px;
          font-weight: 600;
          color: #08872B;
          background: #BFFFD1;
          border: 1px solid #8CF2A6;
          padding: 1px 6px;
          border-radius: 10px;
        }

        .sb-recents {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          margin-top: 14px;
          padding: 0 12px;
          border-top: 1px solid #E4EBE6;
        }

        .sb-recents-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 10px 6px;
          flex-shrink: 0;
        }

        .sb-recents-label {
          font-size: 11px;
          font-weight: 600;
          color: #909692;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .sb-recents-config-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          color: #909692;
          padding: 2px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .sb-recents-config-btn:hover {
          background-color: #E4EBE6;
          color: #101411;
        }

        .sb-recents-list {
          flex: 1;
          overflow-y: auto;
          padding-bottom: 12px;
        }

        .sb-recents-list::-webkit-scrollbar { width: 3px; }
        .sb-recents-list::-webkit-scrollbar-thumb { background: #E4EBE6; border-radius: 2px; }

        .sb-recents-empty {
          padding: 12px 10px;
          font-size: 12.5px;
          color: #909692;
        }

        .sb-session-item {
          display: block;
          width: 100%;
          padding: 7px 10px;
          border-radius: 8px;
          font-size: 13px;
          color: #101411;
          border: none;
          background: none;
          cursor: pointer;
          font-family: inherit;
          text-align: left;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: background 0.1s;
          margin-bottom: 1px;
        }

        .sb-session-item:hover { background: #E4EBE6; }
        .sb-session-item.active { background: #E4EBE6; font-weight: 500; }

        .sb-bottom {
          padding: 10px 12px 14px;
          flex-shrink: 0;
        }

        .sb-minimize-btn {
          display: flex;
          align-items: center;
          gap: 7px;
          width: 100%;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 13.5px;
          font-weight: 500;
          color: #909692;
          border: 1px solid #E4EBE6;
          background: #ffffff;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.12s;
          box-shadow: 0 1px 2px rgba(0,0,0,0.02);
        }

        .sb-minimize-btn:hover { background: #F2F5F3; color: #101411; border-color: #B6BFB8; }

        /* Sidebar Collapsed Content */
        .sidebar-collapsed-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100%;
          width: 64px;
          padding: 14px 0;
        }

        .collapsed-toggle-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          color: #909692;
          padding: 6px;
          border-radius: 6px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.12s, color 0.12s;
        }

        .collapsed-toggle-btn:hover {
          background-color: #E4EBE6;
          color: #101411;
        }

        .collapsed-new-chat-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          background: #ffffff;
          border: 1px solid #E4EBE6;
          border-radius: 50%;
          color: #101411;
          cursor: pointer;
          transition: all 0.12s;
          box-shadow: 0 1px 2px rgba(0,0,0,0.02);
          margin-bottom: 24px;
        }

        .collapsed-new-chat-btn:hover {
          background: #F2F5F3;
          border-color: #B6BFB8;
          transform: scale(1.05);
        }

        .collapsed-nav-items {
          display: flex;
          flex-direction: column;
          gap: 12px;
          align-items: center;
          flex: 1;
          width: 100%;
        }

        .collapsed-nav-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          color: #909692;
          width: 38px;
          height: 38px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.12s, color 0.12s;
        }

        .collapsed-nav-btn:hover {
          background-color: #E4EBE6;
          color: #101411;
        }

        .collapsed-nav-btn.active {
          background-color: #E4EBE6;
          color: #101411;
        }

        .collapsed-bottom {
          width: 100%;
          display: flex;
          justify-content: center;
        }

        /* ── Main content ── */
        .main {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: #ffffff;
          min-width: 0;
        }

        /* Welcome view */
        .welcome-view {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow-y: auto;
          padding: 40px 24px 32px;
        }

        .welcome-center {
          width: 100%;
          max-width: 680px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .welcome-heading {
          font-size: 36px;
          font-weight: 700;
          color: #101411;
          margin: 0 0 12px;
          letter-spacing: -0.6px;
          text-align: center;
        }

        .welcome-sub {
          font-size: 15px;
          color: #909692;
          text-align: center;
          max-width: 480px;
          line-height: 1.6;
          margin: 0 0 28px;
        }

        .welcome-input-wrap { width: 100%; margin-bottom: 18px; }

        /* Action pills (GitHub Light style) */
        .action-pills {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .action-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: #F2F5F3;
          border: 1px solid #E4EBE6;
          border-radius: 9999px;
          font-size: 13.5px;
          color: #101411;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.12s ease-in-out;
          white-space: nowrap;
        }

        .action-pill:hover {
          border-color: #B6BFB8;
          background: #E4EBE6;
          color: #101411;
        }

        /* Messages area */
        .messages-area {
          flex: 1;
          overflow-y: auto;
          background: #ffffff;
        }

        .messages-area::-webkit-scrollbar { width: 4px; }
        .messages-area::-webkit-scrollbar-thumb { background: #E4EBE6; border-radius: 2px; }

        .messages-inner {
          max-width: 720px;
          margin: 0 auto;
          padding: 28px 20px 12px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        /* Message rows */
        .msg-row { display: flex; align-items: flex-start; gap: 12px; }
        .msg-row.user { flex-direction: row-reverse; }

        .ai-avatar {
          width: 30px;
          height: 30px;
          flex-shrink: 0;
          border-radius: 50%;
          background: #ffffff;
          border: 1px solid #E4EBE6;
          color: #101411;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          box-shadow: 0 1px 2px rgba(0,0,0,0.02);
        }

        .bubble {
          max-width: 75%;
          padding: 12px 16px;
          border-radius: 16px;
          font-size: 14.5px;
          line-height: 1.6;
        }

        .bubble.user {
          background: #0FBF3E;
          color: white;
          border-bottom-right-radius: 4px;
        }

        .bubble.assistant {
          background: #ffffff;
          border: 1px solid #E4EBE6;
          color: #101411;
          border-bottom-left-radius: 4px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.03);
        }

        .loading-bubble {
          display: flex;
          gap: 5px;
          align-items: center;
          padding: 14px 18px;
        }

        .dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #E4EBE6;
          animation: dotAnim 1.2s infinite ease-in-out;
        }

        .dot:nth-child(2) { animation-delay: 0.2s; }
        .dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes dotAnim {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
          40% { transform: scale(1.15); opacity: 1; background: #0FBF3E; }
        }

        /* Error */
        .error-bar {
          max-width: 720px;
          width: 100%;
          margin: 0 auto;
          padding: 8px 20px;
          background: rgba(207,34,46,0.06);
          border-top: 1px solid rgba(207,34,46,0.2);
          font-size: 13px;
          color: #cf222e;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-shrink: 0;
        }

        .error-bar button { border: none; background: none; color: #cf222e; cursor: pointer; font-size: 16px; }

        /* Input wrapper in chat mode */
        .chat-input-wrap {
          flex-shrink: 0;
          padding: 12px 20px 20px;
          max-width: 720px;
          width: 100%;
          margin: 0 auto;
          align-self: center;
          box-sizing: border-box;
        }

        /* ── Shared input card (GitHub Light Theme) ── */
        :global(.input-card) {
          background: #ffffff;
          border: 1px solid #E4EBE6;
          border-radius: 14px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          overflow: visible;
          transition: border-color 0.12s, box-shadow 0.12s;
        }

        :global(.input-card:focus-within) {
          border-color: #0FBF3E;
          box-shadow: 0 0 0 3px rgba(15, 191, 62, 0.3);
        }

        :global(.file-bar) {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 14px;
          background: #F2F5F3;
          border-bottom: 1px solid #E4EBE6;
          font-size: 12.5px;
          color: #101411;
          border-radius: 14px 14px 0 0;
        }

        :global(.file-preview-name-clickable) {
          cursor: pointer;
          color: #08872B;
          font-weight: 500;
        }

        :global(.file-preview-name-clickable:hover) {
          text-decoration: underline;
        }

        :global(.file-bar button) { border: none; background: none; color: #cf222e; cursor: pointer; font-weight: bold; }

        :global(.chat-textarea) {
          display: block;
          width: 100%;
          min-height: 28px;
          max-height: 180px;
          padding: 14px 16px 6px;
          border: none;
          outline: none;
          resize: none;
          font-size: 15px;
          font-family: inherit;
          color: #101411;
          background: transparent;
          box-sizing: border-box;
          line-height: 1.6;
          overflow-y: auto;
        }

        :global(.chat-textarea::placeholder) { color: #909692; }

        :global(.input-toolbar) {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 10px 10px;
          gap: 8px;
        }

        :global(.toolbar-left) {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        :global(.toolbar-right) {
          display: flex;
          align-items: center;
          gap: 8px;
          position: relative;
        }

        :global(.toolbar-icon-btn) {
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: none;
          color: #909692;
          cursor: pointer;
          padding: 6px;
          border-radius: 7px;
          transition: color 0.12s, background-color 0.12s;
        }

        :global(.toolbar-icon-btn:hover:not(:disabled)) { color: #101411; background-color: #F2F5F3; }
        :global(.toolbar-icon-btn:disabled) { opacity: 0.3; cursor: not-allowed; }

        /* Scope/Client Button */
        :global(.scope-pill-container) { position: relative; }

        :global(.context-btn) {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 8px;
          border: 1px dashed #B6BFB8;
          background: #F2F5F3;
          cursor: pointer;
          font-family: inherit;
          font-size: 12.5px;
          font-weight: 500;
          color: #101411;
          transition: all 0.15s;
          white-space: nowrap;
        }

        :global(.context-btn:hover) {
          background-color: #E4EBE6;
          color: #101411;
          border-color: #909692;
        }

        :global(.context-btn.selected) {
          border: 1px solid #E4EBE6;
          background: #E4EBE6;
          color: #101411;
        }

        /* Scope popover (GitHub Style) */
        :global(.scope-popover) {
          position: absolute;
          bottom: calc(100% + 8px);
          right: 0;
          width: 240px;
          background: #ffffff;
          border: 1px solid #E4EBE6;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(140, 149, 159, 0.2);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          z-index: 200;
        }

        :global(.sp-search) { padding: 8px; border-bottom: 1px solid #E4EBE6; }

        :global(.sp-input) {
          width: 100%;
          padding: 6px 10px;
          border-radius: 6px;
          border: 1px solid #E4EBE6;
          font-size: 12.5px;
          outline: none;
          font-family: inherit;
          color: #101411;
          background: #ffffff;
          box-sizing: border-box;
        }

        :global(.sp-input:focus) {
          border-color: #0FBF3E;
          box-shadow: 0 0 0 2px rgba(15, 191, 62, 0.2);
        }

        :global(.sp-options) { max-height: 200px; overflow-y: auto; padding: 5px; display: flex; flex-direction: column; gap: 2px; }
        :global(.sp-options::-webkit-scrollbar) { width: 3px; }
        :global(.sp-options::-webkit-scrollbar-thumb) { background: #E4EBE6; border-radius: 2px; }

        :global(.sp-item) {
          width: 100%;
          padding: 7px 12px;
          border: none;
          background: transparent;
          border-radius: 6px;
          cursor: pointer;
          text-align: left;
          font-family: inherit;
          font-size: 13px;
          color: #101411;
          transition: background 0.1s, color 0.1s;
        }

        :global(.sp-item:hover) { background: #F2F5F3; }
        :global(.sp-item.active) { background: #0FBF3E; color: #ffffff; font-weight: 600; }

        :global(.sp-divider) { font-size: 10px; font-weight: 600; color: #909692; text-transform: uppercase; padding: 5px 12px 3px; letter-spacing: 0.4px; }

        /* Reset Button */
        :global(.reset-btn) {
          border: none;
          background: transparent;
          cursor: pointer;
          font-size: 12.5px;
          color: #909692;
          font-weight: 500;
          padding: 6px 8px;
          font-family: inherit;
          transition: color 0.12s;
        }

        :global(.reset-btn:hover) { color: #cf222e; }

        /* Send button (GitHub Green Theme) */
        :global(.send-btn) {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: none;
          background: #E4EBE6;
          color: #909692;
          cursor: not-allowed;
          transition: all 0.12s ease-in-out;
          border-radius: 50%;
          flex-shrink: 0;
        }

        :global(.send-btn.active) {
          background: #0FBF3E;
          color: #ffffff;
          cursor: pointer;
          box-shadow: 0 1px 0 rgba(27,31,36,0.1);
        }

        :global(.send-btn.active:hover) { background: #08872B; transform: scale(1.04); }

        /* ── File Preview Modal overlay ── */
        .preview-modal-overlay {
          position: fixed;
          top: 0;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(27, 31, 36, 0.4);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(1px);
        }

        .preview-modal-container {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #E4EBE6;
          box-shadow: 0 8px 24px rgba(140, 149, 159, 0.2);
          width: 80%;
          max-width: 800px;
          height: 80%;
          max-height: 600px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: modalAppear 0.15s ease-out;
        }

        @keyframes modalAppear {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }

        .preview-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 18px;
          border-bottom: 1px solid #E4EBE6;
          background: #F2F5F3;
        }

        .preview-modal-title {
          font-size: 14px;
          font-weight: 600;
          color: #101411;
        }

        .preview-modal-close {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          color: #909692;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 6px;
        }

        .preview-modal-close:hover {
          background-color: rgba(0, 0, 0, 0.05);
          color: #cf222e;
        }

        .preview-modal-body {
          flex: 1;
          overflow: hidden;
          padding: 16px;
          background: #F2F5F3;
        }

        .preview-iframe {
          width: 100%;
          height: 100%;
          border: 1px solid #E4EBE6;
          border-radius: 6px;
          background: #ffffff;
        }

        .preview-text-block {
          white-space: pre-wrap;
          word-break: break-word;
          font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace;
          font-size: 13px;
          color: #101411;
          background: #ffffff;
          padding: 16px;
          border-radius: 6px;
          border: 1px solid #E4EBE6;
          overflow: auto;
          margin: 0;
          height: 100%;
          box-sizing: border-box;
        }
      `}</style>
    </>
  );
}
