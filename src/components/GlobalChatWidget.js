import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Paperclip, Clock, Maximize2 } from "lucide-react";
import { CLIENTS } from "@/lib/mockData";
import { ClientCardSection } from "@/components/ui/ClientCard";

const clientIdToRepoId = {
  "005511": "005511_LimWeiMing",
  "005512": "005512_SarahTan",
  "005513": "005513_AhmadRazif",
  "005514": "005514_JenniferKoh",
  "005515": "005515_DavidNg",
  "005516": "005516_RosnahYusof"
};

// Simple markdown-like renderer (scoped inside widget)
function renderMarkdown(text) {
  if (!text) return "";
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/```(\w+)?\n?([\s\S]*?)```/g, (_, lang, code) => `<pre style="background:#f0f2f4;padding:8px;border-radius:6px;font-size:12px;overflow-x:auto;color:#24292f;margin:6px 0;border:1px solid #d0d7de;"><code>${code.trim()}</code></pre>`)
    .replace(/`([^`]+)`/g, '<code style="background:#eaecef;padding:2px 4px;border-radius:4px;font-size:12px;color:#c97c3a;">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/^### (.+)$/gm, '<h3 style="font-size:13px;margin:8px 0 4px;font-weight:600;color:#24292f;">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="font-size:14px;margin:10px 0 6px;font-weight:600;color:#24292f;">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="font-size:15px;margin:12px 0 8px;font-weight:700;color:#1c2128;">$1</h1>')
    .replace(/^\d+\. (.+)$/gm, '<li style="margin-left:14px;font-size:13px;color:#24292f;">$1</li>')
    .replace(/^[-*] (.+)$/gm, '<li style="margin-left:14px;font-size:13px;color:#24292f;">$1</li>')
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br/>");
  return `<p style="margin:0 0 8px;color:#24292f;">${html}</p>`;
}

export default function GlobalChatWidget() {
  const router = useRouter();

  // All hooks must be called unconditionally before any early return
  const [isOpen, setIsOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState(null);

  // Session history
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);

  const [activePageClient, setActivePageClient] = useState(null);
  const [searchScope, setSearchScope] = useState("global"); // "client" or "global"
  const [showContextList, setShowContextList] = useState(false);
  const [contextSearchQuery, setContextSearchQuery] = useState("");

  // History sidebar toggle — hidden by default
  const [showHistory, setShowHistory] = useState(false);

  // Size states (anchored bottom-right, resizable top-left)
  const COMPACT_W = 400;
  const COMPACT_H = 520;
  const [width, setWidth] = useState(COMPACT_W);
  const [height, setHeight] = useState(COMPACT_H);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeMode, setResizeMode] = useState(null); // 'left', 'top', 'both'

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const contextSelectorRef = useRef(null);

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
    setUploadedFile(null);
    setFilePreview(null);
    setSessionId(null);
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/chat/session');
      const data = await res.json();
      setSessions(data.sessions || []);
    } catch (e) {
      console.error('Failed to fetch sessions', e);
    }
  };

  const createNewSession = async () => {
    try {
      const res = await fetch('/api/chat/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: selectedClientId || undefined }),
      });
      const data = await res.json();
      setSessionId(data.sessionId);
      setActiveSessionId(data.sessionId);
      setMessages([]);
      fetchSessions();
    } catch (e) {
      console.error('Failed to create session', e);
    }
  };

  const deleteSession = async (id) => {
    try {
      await fetch(`/api/chat/session?sessionId=${id}`, { method: 'DELETE' });
      if (activeSessionId === id) {
        setSessionId(null);
        setActiveSessionId(null);
        setMessages([]);
      }
      fetchSessions();
    } catch (e) {
      console.error('Failed to delete session', e);
    }
  };

  const selectSession = async (id) => {
    setActiveSessionId(id);
    setSessionId(id);
    try {
      const res = await fetch(`/api/chat/session?sessionId=${id}`);
      const data = await res.json();
      if (data.session) {
        setMessages(data.session.messages || []);
      }
    } catch (e) {
      console.error('Failed to load session', e);
    }
  };

  // Close context dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (contextSelectorRef.current && !contextSelectorRef.current.contains(event.target)) {
        setShowContextList(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync active page client context based on router pathname
  useEffect(() => {
    if (!router.isReady) return;

    const repoToClientId = {
      "005511_LimWeiMing": "005511",
      "005512_SarahTan": "005512",
      "005513_AhmadRazif": "005513",
      "005514_JenniferKoh": "005514",
      "005515_DavidNg": "005515",
      "005516_RosnahYusof": "005516"
    };

    const isClientPage = router.pathname.startsWith("/client/");
    const clientRepoId = isClientPage ? router.query.id : null;
    const activePageClientId = clientRepoId ? repoToClientId[clientRepoId] : null;
    const client = activePageClientId ? CLIENTS.find(c => c.id === activePageClientId) : null;

    setActivePageClient(client);

    if (client) {
      setSearchScope("client");
      setSelectedClientId(client.id);
    } else {
      setSearchScope("global");
      setSelectedClientId("");
    }
    clearChat();
  }, [router.isReady, router.pathname, router.query.id, clearChat]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, isOpen]);

  useEffect(() => {
    if (isOpen) fetchSessions();
  }, [isOpen]);

  // Auto-open and restore session when navigating back from /chatbot
  useEffect(() => {
    if (!router.isReady) return;
    if (router.query.openChat !== "1") return;

    setIsOpen(true);

    const sid = router.query.sessionId;
    const cid = router.query.clientId;
    if (cid) setSelectedClientId(cid);
    if (sid) {
      setSessionId(sid);
      setActiveSessionId(sid);
      fetch(`/api/chat/session?sessionId=${sid}`)
        .then((r) => r.json())
        .then((d) => { if (d.session) setMessages(d.session.messages || []); })
        .catch(() => {});
    }

    // Strip the helper params from the URL cleanly
    router.replace(router.pathname, undefined, { shallow: true });
  }, [router.isReady, router.query.openChat]);

  // Adjust textarea height inside widget
  const adjustTextarea = useCallback(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
    }
  }, []);

  useEffect(() => {
    adjustTextarea();
  }, [input, adjustTextarea]);

  // Mouse drag handler for resizing
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e) => {
      // Anchored at bottom-right corner, so:
      // Pinned right position: window.innerWidth - rightOffset
      // Pinned bottom position: window.innerHeight - bottomOffset
      // New Width = window.innerWidth - mouseX - rightOffset
      // New Height = window.innerHeight - mouseY - bottomOffset

      const minW = 300;
      const maxW = window.innerWidth * 0.9;
      const minH = 380;
      const maxH = window.innerHeight * 0.85;

      if (resizeMode === "left" || resizeMode === "both") {
        const computedWidth = window.innerWidth - e.clientX - 24;
        setWidth(Math.max(minW, Math.min(maxW, computedWidth)));
      }
      if (resizeMode === "top" || resizeMode === "both") {
        const computedHeight = window.innerHeight - e.clientY - 84;
        setHeight(Math.max(minH, Math.min(maxH, computedHeight)));
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeMode(null);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, resizeMode]);

  const startResize = (mode, e) => {
    e.preventDefault();
    setIsResizing(true);
    setResizeMode(mode);
    document.body.style.userSelect = "none";
    document.body.style.cursor = mode === "both" ? "nwse-resize" : mode === "left" ? "ew-resize" : "ns-resize";
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    if (!selectedClientId) {
      setError("Please select a specific client context first.");
      return;
    }

    const allowedTypes = ["application/pdf", "text/plain", "image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Invalid file type. Upload PDF, text, or image.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result.split(",")[1];
      setUploadedFile({
        name: file.name,
        mimeType: file.type,
        base64,
        size: file.size,
        rawFile: file
      });
      setFilePreview({
        name: file.name,
        type: file.type,
        isImage: file.type.startsWith("image/"),
        url: file.type.startsWith("image/") ? e.target.result : null,
      });
    };
    reader.readAsDataURL(file);
    setError(null);
  };

  const sendMessage = async (messageText = input) => {
    if ((!messageText.trim() && !uploadedFile) || isLoading) return;

    setIsLoading(true);
    setError(null);

    const currentInput = messageText.trim();
    const currentFile = uploadedFile;
    const currentFilePreview = filePreview;

    setInput("");
    setUploadedFile(null);
    setFilePreview(null);

    let systemNoticeText = null;

    try {
      // 1. Process document upload first if there is a PDF/TXT
      if (currentFile && (currentFile.mimeType === "application/pdf" || currentFile.mimeType === "text/plain")) {
        if (!selectedClientId) {
          throw new Error("Select a client context to upload and index document.");
        }

        const selectedClient = CLIENTS.find(c => c.id === selectedClientId);
        const clientName = selectedClient ? selectedClient.name : "005511/LimWeiMing";

        const formData = new FormData();
        formData.append("file", currentFile.rawFile);
        formData.append("clientId", selectedClientId);
        formData.append("clientName", clientName);
        formData.append("store", "true");
        formData.append("sourceRef", currentFile.name);

        const uploadRes = await fetch("/api/upload/document", {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          throw new Error(uploadData.error || "Failed to process and index document.");
        }

        systemNoticeText = `Successfully indexed "${currentFile.name}" into client repository.`;
      }

      // 2. Setup user message
      const userMessage = {
        id: Date.now(),
        role: "user",
        content: currentInput,
        file: currentFilePreview,
        systemNotice: systemNoticeText,
      };

      const newMessages = [...messages, userMessage];
      setMessages(newMessages);

      // 3. Make RAG pipeline chat request
      const response = await fetch("/api/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: currentInput || `Summarize the uploaded file ${currentFile.name}`,
          sessionId: sessionId || undefined,
          clientId: selectedClientId || undefined,
          topK: 5,
          threshold: 0.25,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to retrieve RAG response.");
      }

      if (data.sessionId) {
        setSessionId(data.sessionId);
        setActiveSessionId(data.sessionId);
      }

      fetchSessions();

      // Add assistant response
      setMessages([
        ...newMessages,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: data.reply,
          sources: data.sources,
          relevantClients: data.relevantClients,
          usage: data.usage,
        },
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const activeClient = CLIENTS.find((c) => c.id === selectedClientId);

  // Widget is hidden on the dedicated chatbot workspace page
  if (router.pathname === "/chatbot") return null;

  return (
    <>
      {/* Pulsing ring behind the button */}
      <span className="chat-bubble-pulse" aria-hidden="true" />

      {/* FLOATING TOGGLE BUTTON */}
      <button
        className={`floating-chat-bubble ${isOpen ? "chat-open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Open IntelliBot"
        aria-label="Toggle IntelliBot"
      >
        {isOpen ? (
          <span className="close-bubble-icon">✕</span>
        ) : (
          <span className="chat-bubble-icon">✦</span>
        )}
      </button>

      {/* RESIZABLE CHATBOX WIDGET */}
      {isOpen && (
        <div
          className="widget-chatbox-container"
          style={{ width: `${width}px`, height: `${height}px` }}
        >
          {/* Resize handles */}
          <div className="resize-handle handle-left" onMouseDown={(e) => startResize("left", e)} />
          <div className="resize-handle handle-top" onMouseDown={(e) => startResize("top", e)} />
          <div className="resize-handle handle-corner" onMouseDown={(e) => startResize("both", e)} />

          {/* Header — always shows ImagineHack 2026 */}
          <header className="widget-header" onDoubleClick={() => { setWidth(COMPACT_W); setHeight(COMPACT_H); }}>
            <div className="widget-header-title">
              <span className="header-icon">✦</span>
              <span className="header-title">IntelliBot</span>
              <span className="header-online-dot" title="Online" />
            </div>

            <div className="widget-header-actions">
              {/* History sidebar toggle */}
              <button
                className={`header-action-btn ${showHistory ? "header-action-btn--active" : ""}`}
                onClick={() => setShowHistory((v) => !v)}
                title={showHistory ? "Hide history" : "Show history"}
              >
                <Clock size={14} />
              </button>

              {/* Collapse to default size — only visible when resized larger */}
              {(width > COMPACT_W || height > COMPACT_H) && (
                <button
                  className="header-action-btn"
                  onClick={() => { setWidth(COMPACT_W); setHeight(COMPACT_H); }}
                  title="Collapse to default size"
                >
                  ⊡
                </button>
              )}
              {/* Expand to full workspace */}
              <Link
                href={`/chatbot?clientId=${selectedClientId || ""}${sessionId ? `&sessionId=${sessionId}` : ""}`}
                className="header-action-btn header-maximize-btn"
                title="Open full workspace"
              >
                <Maximize2 size={13} />
              </Link>
              <button className="header-close-btn" onClick={() => setIsOpen(false)} title="Minimize">
                ✕
              </button>
            </div>
          </header>

          {/* Main Content Area — history view XOR chat view */}
          <div className="widget-main-content">

            {/* ── HISTORY VIEW (full panel) ── */}
            {showHistory ? (
              <div className="widget-history-full">
                <div className="widget-sidebar-header">
                  <span className="widget-sidebar-title">HISTORY</span>
                  <button
                    className="widget-sidebar-new-btn"
                    onClick={() => { createNewSession(); setShowHistory(false); }}
                  >
                    + New chat
                  </button>
                </div>
                <div className="widget-sidebar-list">
                  {sessions.length === 0 ? (
                    <div className="widget-sidebar-empty">No sessions yet.<br/>Start a conversation to save history.</div>
                  ) : (
                    [...sessions].reverse().map(s => (
                      <div
                        key={s.id}
                        className={`widget-sidebar-item ${activeSessionId === s.id ? "active" : ""}`}
                        onClick={() => { selectSession(s.id); setShowHistory(false); }}
                      >
                        <div className="widget-sidebar-item-title">
                          {s.messages?.[0]?.content?.slice(0, 30) || "Empty chat"}
                        </div>
                        <div className="widget-sidebar-item-meta">
                          <span>{s.messageCount || 0} msgs</span>
                          <span>{s.createdAt ? new Date(s.createdAt).toLocaleDateString() : ""}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (

            /* ── CHAT VIEW (full panel) ── */
            <div className="widget-chat-column">
              {/* Messages Area */}
              <div className="widget-body">
                {messages.length === 0 ? (
                  <div className="widget-welcome">
                    <span className="welcome-icon">✦</span>
                    <h5 className="welcome-heading">IntelliBot</h5>
                    <p className="welcome-subtitle">
                      Search embedded client memories, check risk goals, or upload a proposal to analyze against client records.
                    </p>
                    <div className="widget-pills">
                      <button className="widget-pill" onClick={() => setInput("What are their retirement concerns?")}>
                        Retirement concerns?
                      </button>
                      <button className="widget-pill" onClick={() => setInput("Summarise passive income streams")}>
                        Summarise passive income
                      </button>
                      <button className="widget-pill" onClick={() => setInput("Which clients have pending policy reviews?")}>
                        Pending policy reviews
                      </button>
                      <button className="widget-pill" onClick={() => setInput("Which clients have high financial risk exposure?")}>
                        High risk clients
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="widget-msg-list">
                    {messages.map((msg, index) => (
                      <div
                        key={index}
                        className={`widget-msg-wrapper ${msg.role === "user" ? "user" : "assistant"}`}
                      >
                        <div className="widget-msg-bubble">
                          {msg.file && (
                            <div style={{ fontSize: "11px", background: "rgba(255,255,255,0.25)", padding: "4px 8px", borderRadius: "4px", marginBottom: "4px", color: "rgba(255,255,255,0.85)" }}>
                              📄 {msg.file.name}
                            </div>
                          )}
                          {msg.systemNotice && (
                            <div style={{ fontSize: "11px", background: "rgba(22,163,74,0.1)", color: "#16a34a", padding: "4px 8px", borderRadius: "4px", marginBottom: "6px", fontWeight: 500, border: "1px solid rgba(22,163,74,0.25)" }}>
                              💾 {msg.systemNotice}
                            </div>
                          )}

                          {msg.role === "assistant" ? (
                            <>
                              <div
                                className="widget-markdown-content"
                                dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                              />

                              {/* Collapsible sources list */}
                              {msg.sources && msg.sources.length > 0 && (
                                <details style={{ marginTop: "8px", borderTop: "1px dashed rgba(0,0,0,0.1)", paddingTop: "6px" }}>
                                  <summary style={{ fontSize: "11px", color: "#c97c3a", cursor: "pointer", fontWeight: "600", outline: "none" }}>
                                    🔍 {msg.sources.length} memory sources
                                  </summary>
                                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "6px" }}>
                                    {msg.sources.map((s, sIdx) => {
                                      const repoSlug = clientIdToRepoId[s.clientId] || "005511_LimWeiMing";
                                      const tabParam = (s.sourceType === "document" || s.sourceType === "proposal") ? "photo" : "info";
                                      const linkUrl = `/client/${repoSlug}?tab=${tabParam}`;
                                      return (
                                        <a
                                          key={sIdx}
                                          href={linkUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          style={{ textDecoration: "none", color: "inherit", display: "block" }}
                                        >
                                          <div style={{ background: "#f6f8fa", border: "1px solid #d0d7de", padding: "6px", borderRadius: "6px", fontSize: "11px", cursor: "pointer" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px", fontWeight: "600", color: "#57606a" }}>
                                              <span>{s.clientName} ({s.sourceType?.replace("_", " ")})</span>
                                              <span style={{ color: "#c97c3a" }}>{(s.score * 100).toFixed(0)}%</span>
                                            </div>
                                            <div style={{ fontStyle: "italic", color: "#57606a", marginBottom: "3px" }}>&ldquo;{s.content.slice(0, 80)}...&rdquo;</div>
                                            <div style={{ fontSize: "9px", color: "#c97c3a", textAlign: "right", fontWeight: "600" }}>View Repo ({tabParam} tab) ↗</div>
                                          </div>
                                        </a>
                                      );
                                    })}
                                  </div>
                                </details>
                              )}

                              {/* Compact clickable client cards */}
                              <ClientCardSection
                                text={msg.content}
                                relevantClients={msg.relevantClients}
                                sources={msg.sources}
                                compact={true}
                              />
                            </>
                          ) : (
                            <p style={{ margin: 0, whiteSpace: "pre-wrap", color: "white" }}>{msg.content}</p>
                          )}
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="widget-msg-wrapper assistant">
                        <div className="widget-msg-bubble loading">
                          <span className="dot"></span>
                          <span className="dot"></span>
                          <span className="dot"></span>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Error Banner */}
              {error && (
                <div className="widget-error-banner">
                  <span>⚠️ {error}</span>
                  <button onClick={() => setError(null)}>✕</button>
                </div>
              )}

              {/* Footer Input */}
              <div className="widget-input-area">
                {/* File preview bar */}
                {filePreview && (
                  <div style={{ padding: "4px 8px", background: "rgba(0,0,0,0.03)", border: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between", borderRadius: "6px", fontSize: "11px", marginBottom: "6px", color: "#57606a" }}>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "200px" }}>📄 {filePreview.name}</span>
                    <button style={{ border: "none", background: "none", color: "#cf222e", cursor: "pointer", fontWeight: "bold" }} onClick={() => { setUploadedFile(null); setFilePreview(null); }}>✕</button>
                  </div>
                )}

                {/* Textarea */}
                <textarea
                  ref={textareaRef}
                  className="widget-textarea"
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything about clients…"
                  disabled={isLoading}
                />

                {/* Bottom toolbar row */}
                <div className="widget-input-row">
                  {/* Left: scope pill + reset */}
                  <div className="widget-input-left" ref={contextSelectorRef}>
                    <div className="scope-pill-container">
                      <button
                        className="scope-pill"
                        onClick={() => setShowContextList(!showContextList)}
                      >
                        <span className="scope-pill-icon">{activeClient ? "👤" : "🌐"}</span>
                        <span className="scope-pill-text">
                          {activeClient
                            ? activeClient.name.length > 12
                              ? activeClient.name.slice(0, 12) + "…"
                              : activeClient.name
                            : "Global"}
                        </span>
                        <span className="scope-pill-chevron">▾</span>
                      </button>

                      {showContextList && (
                        <div className="scope-popover">
                          <div className="scope-popover-search">
                            <input
                              type="text"
                              placeholder="Search..."
                              value={contextSearchQuery}
                              onChange={(e) => setContextSearchQuery(e.target.value)}
                              className="scope-popover-input"
                              autoFocus
                            />
                          </div>
                          <div className="scope-popover-options">
                            <button
                              className={`scope-popover-item ${!selectedClientId ? "active" : ""}`}
                              onClick={() => {
                                setSelectedClientId("");
                                setSearchScope("global");
                                setShowContextList(false);
                                setContextSearchQuery("");
                                clearChat();
                              }}
                            >
                              🌐 Global Search (Cross-client)
                            </button>
                            <div className="scope-popover-divider">Clients</div>
                            {CLIENTS.filter(c =>
                              c.name.toLowerCase().includes(contextSearchQuery.toLowerCase())
                            ).map(c => (
                              <button
                                key={c.id}
                                className={`scope-popover-item ${selectedClientId === c.id ? "active" : ""}`}
                                onClick={() => {
                                  setSelectedClientId(c.id);
                                  setSearchScope("client");
                                  setShowContextList(false);
                                  setContextSearchQuery("");
                                  clearChat();
                                }}
                              >
                                👤 {c.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {messages.length > 0 && (
                      <button className="reset-btn" onClick={clearChat} title="Reset chat">
                        Reset
                      </button>
                    )}
                  </div>

                  {/* Right: paperclip + send */}
                  <div className="widget-input-right">
                    <button
                      className="widget-act-btn"
                      title={selectedClientId ? "Upload proposal PDF" : "Select client context first"}
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading || !selectedClientId}
                    >
                      <Paperclip size={15} />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.txt"
                      style={{ display: "none" }}
                      onChange={(e) => handleFileUpload(e.target.files[0])}
                    />
                    <button
                      className={`widget-send-btn ${input.trim() || uploadedFile ? "active" : ""}`}
                      disabled={(!input.trim() && !uploadedFile) || isLoading}
                      onClick={() => sendMessage()}
                    >
                      ➤
                    </button>
                  </div>
                </div>
              </div>
            </div>
            )} {/* end showHistory ternary */}
          </div>
        </div>
      )}

      {/* Styled JSX (scoped to widget) */}
      <style jsx>{`
        /* Pulse ring — GitHub dark subtle */
        .chat-bubble-pulse {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: rgba(36, 41, 47, 0.18);
          z-index: 999;
          pointer-events: none;
          animation: githubPulse 2.6s ease-out infinite;
        }

        @keyframes githubPulse {
          0% { transform: scale(1); opacity: 0.7; }
          70% { transform: scale(1.6); opacity: 0; }
          100% { transform: scale(1.6); opacity: 0; }
        }

        /* Floating button — GitHub dark */
        .floating-chat-bubble {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #24292f;
          border: none;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25), 0 1px 3px rgba(0, 0, 0, 0.15);
          color: white;
          cursor: pointer;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s ease, background 0.15s ease, box-shadow 0.2s ease;
        }

        .floating-chat-bubble:hover {
          transform: scale(1.07) translateY(-2px);
          background: #32383f;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3), 0 2px 6px rgba(0, 0, 0, 0.15);
        }

        .floating-chat-bubble.chat-open {
          background: #32383f;
        }

        .chat-bubble-icon {
          font-size: 20px;
          line-height: 1;
        }

        .close-bubble-icon {
          font-size: 16px;
          line-height: 1;
        }

        /* Widget container — light mode */
        .widget-chatbox-container {
          position: fixed;
          bottom: 84px;
          right: 24px;
          background: #ffffff;
          border: 1px solid #d0d7de;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06);
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          z-index: 1000;
          overflow: hidden;
          font-family: var(--font-sans, system-ui, sans-serif);
          animation: slideUpWidget 0.22s ease-out;
        }

        @keyframes slideUpWidget {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* Resize handles */
        .resize-handle { position: absolute; z-index: 1001; }
        .handle-left { left: 0; top: 0; bottom: 0; width: 6px; cursor: ew-resize; }
        .handle-top { top: 0; left: 0; right: 0; height: 6px; cursor: ns-resize; }
        .handle-corner { top: 0; left: 0; width: 12px; height: 12px; cursor: nwse-resize; }

        /* Header — GitHub light */
        .widget-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 14px;
          background: #f6f8fa;
          border-bottom: 1px solid #d0d7de;
          cursor: move;
          flex-shrink: 0;
        }

        .widget-header-title { display: flex; align-items: center; gap: 7px; }

        .header-icon { color: #c97c3a; font-weight: 700; font-size: 14px; }

        .header-title { font-size: 13px; font-weight: 600; color: #24292f; }

        .header-online-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #1a7f37;
          box-shadow: 0 0 4px rgba(26, 127, 55, 0.5);
          animation: onlinePulse 2s ease-in-out infinite;
          flex-shrink: 0;
        }

        @keyframes onlinePulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.55; }
        }

        .widget-header-actions { display: flex; align-items: center; gap: 2px; }

        .header-action-btn {
          background: none;
          border: none;
          color: #57606a;
          font-size: 14px;
          cursor: pointer;
          line-height: 1;
          padding: 5px 6px;
          transition: color 0.15s, background 0.15s;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
        }

        .header-action-btn:hover {
          color: #24292f;
          background: rgba(0, 0, 0, 0.06);
        }

        .header-action-btn--active {
          color: #c97c3a;
          background: rgba(201, 124, 58, 0.1);
        }

        .header-action-btn--active:hover {
          color: #c97c3a;
          background: rgba(201, 124, 58, 0.16);
        }

        .header-maximize-btn {
          color: #57606a;
        }

        .header-close-btn {
          background: none;
          border: none;
          color: #57606a;
          font-size: 14px;
          cursor: pointer;
          line-height: 1;
          padding: 5px 6px;
          border-radius: 6px;
          transition: color 0.15s, background 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .header-close-btn:hover {
          color: #cf222e;
          background: rgba(207, 34, 46, 0.08);
        }

        /* Main layout */
        .widget-main-content {
          display: flex;
          flex-direction: row;
          flex: 1;
          min-height: 0;
          overflow: hidden;
        }

        /* Full-width history panel */
        .widget-history-full {
          width: 100%;
          flex: 1;
          background: #f6f8fa;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .widget-sidebar {
          width: 190px;
          flex-shrink: 0;
          border-right: 1px solid #d0d7de;
          background: #f6f8fa;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .widget-sidebar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          border-bottom: 1px solid #d0d7de;
          flex-shrink: 0;
        }

        .widget-sidebar-title {
          font-size: 10px;
          font-weight: 600;
          color: #57606a;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .widget-sidebar-new-btn {
          border: 1px solid #d0d7de;
          background: #ffffff;
          color: #24292f;
          border-radius: 6px;
          padding: 3px 10px;
          font-size: 11px;
          font-weight: 500;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.12s, border-color 0.12s;
        }

        .widget-sidebar-new-btn:hover {
          background: #f3f4f6;
          border-color: #c97c3a;
          color: #c97c3a;
        }

        .widget-sidebar-list {
          flex: 1;
          overflow-y: auto;
          padding: 6px;
        }

        .widget-sidebar-list::-webkit-scrollbar { width: 3px; }
        .widget-sidebar-list::-webkit-scrollbar-track { background: transparent; }
        .widget-sidebar-list::-webkit-scrollbar-thumb { background: #d0d7de; border-radius: 2px; }

        .widget-sidebar-empty {
          text-align: center;
          padding: 20px 10px;
          font-size: 11px;
          color: #57606a;
          line-height: 1.5;
        }

        .widget-sidebar-item {
          padding: 7px 10px;
          border-radius: 6px;
          cursor: pointer;
          margin-bottom: 2px;
          transition: background 0.12s;
          border-left: 2px solid transparent;
        }

        .widget-sidebar-item:hover { background: #eaecef; }

        .widget-sidebar-item.active {
          background: rgba(201, 124, 58, 0.08);
          border-left-color: #c97c3a;
        }

        .widget-sidebar-item-title {
          font-size: 11.5px;
          font-weight: 500;
          color: #24292f;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-bottom: 2px;
        }

        .widget-sidebar-item.active .widget-sidebar-item-title { color: #c97c3a; }

        .widget-sidebar-item-meta {
          font-size: 9px;
          color: #57606a;
          display: flex;
          justify-content: space-between;
        }

        /* Chat column */
        .widget-chat-column {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-width: 0;
          background: #ffffff;
        }

        /* Body */
        .widget-body { flex: 1; overflow-y: auto; padding: 12px; }
        .widget-body::-webkit-scrollbar { width: 3px; }
        .widget-body::-webkit-scrollbar-track { background: transparent; }
        .widget-body::-webkit-scrollbar-thumb { background: #d0d7de; border-radius: 2px; }

        /* Welcome screen */
        .widget-welcome {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 24px 12px;
          justify-content: center;
          height: 100%;
          box-sizing: border-box;
        }

        .welcome-icon {
          font-size: 30px;
          color: #c97c3a;
          margin-bottom: 10px;
        }

        .welcome-heading {
          margin: 0 0 6px;
          font-size: 15px;
          font-weight: 700;
          color: #24292f;
        }

        .welcome-subtitle {
          margin: 0 0 18px;
          font-size: 12px;
          color: #57606a;
          line-height: 1.55;
        }

        .widget-pills { display: flex; flex-direction: column; gap: 5px; width: 100%; }

        .widget-pill {
          background: #f6f8fa;
          border: 1px solid #d0d7de;
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 11.5px;
          color: #57606a;
          cursor: pointer;
          text-align: left;
          font-family: inherit;
          transition: all 0.15s;
        }

        .widget-pill:hover {
          background: rgba(201, 124, 58, 0.06);
          border-color: rgba(201, 124, 58, 0.4);
          color: #c97c3a;
        }

        /* Messages */
        .widget-msg-list { display: flex; flex-direction: column; gap: 10px; }
        .widget-msg-wrapper { display: flex; width: 100%; }
        .widget-msg-wrapper.user { justify-content: flex-end; }

        .widget-msg-bubble {
          max-width: 85%;
          padding: 9px 12px;
          border-radius: 12px;
          font-size: 12.5px;
          line-height: 1.55;
        }

        .user .widget-msg-bubble {
          background: #c97c3a;
          color: white;
          border-bottom-right-radius: 4px;
        }

        .assistant .widget-msg-bubble {
          background: #f6f8fa;
          border: 1px solid #d0d7de;
          color: #24292f;
          border-bottom-left-radius: 4px;
        }

        .widget-markdown-content { color: #24292f; }

        /* Loading dots */
        .widget-msg-bubble.loading { display: flex; gap: 5px; align-items: center; padding: 12px 16px; }

        .widget-msg-bubble.loading .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #d0d7de;
          animation: loadingDot 1.2s infinite ease-in-out;
        }

        .widget-msg-bubble.loading .dot:nth-child(2) { animation-delay: 0.2s; }
        .widget-msg-bubble.loading .dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes loadingDot {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
          40% { transform: scale(1.2); opacity: 1; background: #c97c3a; }
        }

        /* Error banner */
        .widget-error-banner {
          background: rgba(207, 34, 46, 0.06);
          border-top: 1px solid rgba(207, 34, 46, 0.2);
          padding: 8px 12px;
          font-size: 11.5px;
          color: #cf222e;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-shrink: 0;
        }

        .widget-error-banner button {
          border: none;
          background: none;
          color: #cf222e;
          font-size: 14px;
          cursor: pointer;
          padding: 0 2px;
          opacity: 0.7;
          transition: opacity 0.15s;
        }

        .widget-error-banner button:hover { opacity: 1; }

        /* Input area */
        .widget-input-area {
          padding: 10px 12px;
          background: #f6f8fa;
          border-top: 1px solid #d0d7de;
          flex-shrink: 0;
        }

        .widget-textarea {
          width: 100%;
          border: 1px solid #d0d7de;
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 12.5px;
          font-family: inherit;
          resize: none;
          outline: none;
          max-height: 120px;
          background: #ffffff;
          color: #24292f;
          box-sizing: border-box;
          transition: border-color 0.15s, box-shadow 0.15s;
          margin-bottom: 8px;
        }

        .widget-textarea::placeholder { color: #8c959f; }

        .widget-textarea:focus {
          border-color: #c97c3a;
          box-shadow: 0 0 0 3px rgba(201, 124, 58, 0.12);
        }

        /* Bottom toolbar */
        .widget-input-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
        }

        .widget-input-left {
          display: flex;
          align-items: center;
          gap: 6px;
          position: relative;
          z-index: 100;
        }

        .widget-input-right { display: flex; align-items: center; gap: 4px; }

        /* Scope pill */
        .scope-pill-container { position: relative; }

        .scope-pill {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 9px;
          border-radius: 20px;
          border: 1px solid #d0d7de;
          background: #ffffff;
          cursor: pointer;
          font-family: inherit;
          font-size: 11px;
          font-weight: 500;
          color: #57606a;
          transition: all 0.15s;
          white-space: nowrap;
        }

        .scope-pill:hover {
          border-color: #c97c3a;
          color: #c97c3a;
          background: rgba(201, 124, 58, 0.06);
        }

        .scope-pill-icon { font-size: 11px; }
        .scope-pill-text { max-width: 90px; overflow: hidden; text-overflow: ellipsis; }
        .scope-pill-chevron { font-size: 8px; color: #8c959f; }

        /* Scope popover */
        .scope-popover {
          position: absolute;
          bottom: calc(100% + 6px);
          left: 0;
          width: 210px;
          background: #ffffff;
          border: 1px solid #d0d7de;
          border-radius: 10px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .scope-popover-search { padding: 6px; border-bottom: 1px solid #eaecef; }

        .scope-popover-input {
          width: 100%;
          padding: 5px 8px;
          border-radius: 6px;
          border: 1px solid #d0d7de;
          font-size: 11px;
          outline: none;
          font-family: inherit;
          color: #24292f;
          background: #ffffff;
          box-sizing: border-box;
        }

        .scope-popover-options {
          max-height: 180px;
          overflow-y: auto;
          padding: 4px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .scope-popover-item {
          width: 100%;
          padding: 6px 10px;
          border: none;
          background: transparent;
          border-radius: 6px;
          cursor: pointer;
          text-align: left;
          font-family: inherit;
          font-size: 11.5px;
          color: #24292f;
          transition: all 0.12s;
        }

        .scope-popover-item:hover { background: #f6f8fa; }

        .scope-popover-item.active {
          background: rgba(201, 124, 58, 0.08);
          color: #c97c3a;
          font-weight: 600;
        }

        .scope-popover-divider {
          font-size: 9px;
          font-weight: 600;
          color: #57606a;
          text-transform: uppercase;
          padding: 5px 10px 2px;
          letter-spacing: 0.4px;
        }

        /* Reset button */
        .reset-btn {
          border: 1px solid rgba(207, 34, 46, 0.3);
          background: rgba(207, 34, 46, 0.06);
          cursor: pointer;
          font-size: 11px;
          color: #cf222e;
          font-weight: 500;
          padding: 4px 9px;
          border-radius: 20px;
          font-family: inherit;
          transition: all 0.15s;
          white-space: nowrap;
        }

        .reset-btn:hover {
          background: rgba(207, 34, 46, 0.1);
          border-color: rgba(207, 34, 46, 0.5);
        }

        /* Paperclip */
        .widget-act-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: none;
          color: #57606a;
          cursor: pointer;
          opacity: 0.8;
          transition: opacity 0.15s, color 0.15s;
          padding: 5px;
          border-radius: 6px;
        }

        .widget-act-btn:hover:not(:disabled) { opacity: 1; color: #c97c3a; }
        .widget-act-btn:disabled { opacity: 0.3; cursor: not-allowed; }

        /* Send button */
        .widget-send-btn {
          border: none;
          background: #eaecef;
          font-size: 14px;
          color: #8c959f;
          cursor: not-allowed;
          transition: all 0.15s;
          padding: 6px 10px;
          border-radius: 8px;
          line-height: 1;
          opacity: 0.6;
        }

        .widget-send-btn.active {
          background: #24292f;
          color: white;
          cursor: pointer;
          opacity: 1;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
        }

        .widget-send-btn.active:hover {
          background: #32383f;
          transform: scale(1.05);
        }
      `}</style>
    </>
  );
}
