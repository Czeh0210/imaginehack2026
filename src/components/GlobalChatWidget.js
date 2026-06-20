import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { CLIENTS } from "@/lib/mockData";

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
    .replace(/```(\w+)?\n?([\s\S]*?)```/g, (_, lang, code) => `<pre style="background:#f1f5f9;padding:8px;border-radius:6px;font-size:12px;overflow-x:auto;color:#0f172a;margin:6px 0;"><code>${code.trim()}</code></pre>`)
    .replace(/`([^`]+)`/g, '<code style="background:#f1f5f9;padding:2px 4px;border-radius:4px;font-size:12px;color:#c97c3a;">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/^### (.+)$/gm, '<h3 style="font-size:13px;margin:8px 0 4px;font-weight:600;color:#111;">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="font-size:14px;margin:10px 0 6px;font-weight:600;color:#111;">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="font-size:15px;margin:12px 0 8px;font-weight:700;color:#111;">$1</h1>')
    .replace(/^\d+\. (.+)$/gm, '<li style="margin-left:14px;font-size:13px;">$1</li>')
    .replace(/^[-*] (.+)$/gm, '<li style="margin-left:14px;font-size:13px;">$1</li>')
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br/>");
  return `<p style="margin:0 0 8px;">${html}</p>`;
}

export default function GlobalChatWidget() {
  const router = useRouter();

  // Do not show widget on the full chatbot workspace page
  if (router.pathname === "/chatbot") return null;

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

  // Size states (anchored bottom-right, resizable top-left)
  const [width, setWidth] = useState(700);
  const [height, setHeight] = useState(600);
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

  return (
    <>
      {/* 💬 FLOATING TOGGLE BUTTON */}
      <button
        className={`floating-chat-bubble ${isOpen ? "chat-open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Open ImagineHack 2026"
        aria-label="Toggle ImagineHack 2026"
      >
        {isOpen ? (
          <span className="close-bubble-icon">×</span>
        ) : (
          <span className="chat-bubble-icon">✦</span>
        )}
      </button>

      {/* 💻 RESIZABLE CHATBOX WIDGET */}
      {isOpen && (
        <div
          className="widget-chatbox-container"
          style={{ width: `${width}px`, height: `${height}px` }}
        >
          {/* Resize handles */}
          <div className="resize-handle handle-left" onMouseDown={(e) => startResize("left", e)} />
          <div className="resize-handle handle-top" onMouseDown={(e) => startResize("top", e)} />
          <div className="resize-handle handle-corner" onMouseDown={(e) => startResize("both", e)} />

          {/* Header */}
          <header className="widget-header" onDoubleClick={() => { setWidth(380); setHeight(500); }}>
            <div className="widget-header-title">
              <span className="header-icon">✦</span>
              <span className="header-title">
                {selectedClientId && CLIENTS.find((c) => c.id === selectedClientId)
                  ? CLIENTS.find((c) => c.id === selectedClientId).name
                  : "ImagineHack 2026"}
              </span>
            </div>

            <div className="widget-header-actions">
              {/* Expand to full workspace */}
              <Link
                href={`/chatbot?clientId=${selectedClientId || ""}${sessionId ? `&sessionId=${sessionId}` : ""}`}
                className="expand-page-link"
                title="Expand to dedicated workspace"
              >
                ↗
              </Link>
              <button className="minimize-btn" onClick={() => setIsOpen(false)} title="Minimize">
                ×
              </button>
            </div>
          </header>

          {/* Context Selector Popover */}
          <div className="widget-selector-bar" ref={contextSelectorRef}>
            {(() => {
              const activeClient = CLIENTS.find((c) => c.id === selectedClientId);
              return (
                <div className="widget-context-container">
                  <button
                    className="widget-context-trigger"
                    onClick={() => setShowContextList(!showContextList)}
                  >
                    <span className="trigger-icon">{activeClient ? "👤" : "🌐"}</span>
                    <span className="trigger-text">
                      {activeClient ? activeClient.name : "Global"}
                    </span>
                    <span className="trigger-chevron">▾</span>
                  </button>

                  {showContextList && (
                    <div className="widget-context-popover">
                      <div className="widget-popover-search">
                        <input
                          type="text"
                          placeholder="Search..."
                          value={contextSearchQuery}
                          onChange={(e) => setContextSearchQuery(e.target.value)}
                          className="widget-popover-search-input"
                          autoFocus
                        />
                      </div>
                      
                      <div className="widget-popover-options">
                        <button
                          className={`widget-popover-option-item ${!selectedClientId ? "active" : ""}`}
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
                        
                        <div className="widget-popover-divider">Clients</div>
                        
                        {CLIENTS.filter(c =>
                          c.name.toLowerCase().includes(contextSearchQuery.toLowerCase())
                        ).map(c => (
                          <button
                            key={c.id}
                            className={`widget-popover-option-item ${selectedClientId === c.id ? "active" : ""}`}
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
              );
            })()}

            {messages.length > 0 && (
              <button className="widget-clear-btn" onClick={clearChat} title="Reset chat">
                🗑 Reset
              </button>
            )}
          </div>

          {/* Main Content Area */}
          <div className="widget-main-content">
            {/* Session Sidebar */}
            <div className="widget-sidebar">
              <div className="widget-sidebar-header">
                <span className="widget-sidebar-title">History</span>
                <button className="widget-sidebar-new-btn" onClick={createNewSession}>
                  + New
                </button>
              </div>
              <div className="widget-sidebar-list">
                {sessions.length === 0 ? (
                  <div className="widget-sidebar-empty">No sessions yet</div>
                ) : (
                  [...sessions].reverse().map(s => (
                    <div
                      key={s.id}
                      className={`widget-sidebar-item ${activeSessionId === s.id ? "active" : ""}`}
                      onClick={() => selectSession(s.id)}
                    >
                      <div className="widget-sidebar-item-title">
                        {s.messages?.[0]?.content?.slice(0, 22) || "Empty chat"}
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

            {/* Chat Column */}
            <div className="widget-chat-column">
              {/* Messages Area */}
              <div className="widget-body">
                {messages.length === 0 ? (
                  <div className="widget-welcome">
                    <span className="welcome-icon">✦</span>
                    <h5>ImagineHack 2026</h5>
                    <p>
                      Search embedded client memories, check risk goals, or upload a proposal to analyze against client records.
                    </p>
                    <div className="widget-pills">
                      <button className="widget-pill" onClick={() => setInput("What are their retirement concerns?")}>
                        👵 Retirement concerns?
                      </button>
                      <button className="widget-pill" onClick={() => setInput("Summarize passive income streams")}>
                        📈 Passive income?
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
                            <div style={{ fontSize: "11px", background: "rgba(0,0,0,0.05)", padding: "4px 8px", borderRadius: "4px", marginBottom: "4px" }}>
                              📄 {msg.file.name}
                            </div>
                          )}
                          {msg.systemNotice && (
                            <div style={{ fontSize: "11px", background: "#f0fdf4", color: "#16a34a", padding: "4px 8px", borderRadius: "4px", marginBottom: "6px", fontWeight: 500 }}>
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
                                <details style={{ marginTop: "8px", borderTop: "1px dashed #e2e8f0", paddingTop: "6px" }}>
                                  <summary style={{ fontSize: "11px", color: "#c97c3a", cursor: "pointer", fontWeight: "600", outline: "none" }}>
                                    🔍 {msg.sources.length} matching sources
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
                                          <div style={{ background: "#fff", border: "1px solid #e2e8f0", padding: "6px", borderRadius: "6px", fontSize: "11px", cursor: "pointer" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px", fontWeight: "600", color: "#64748b" }}>
                                              <span>{s.clientName} ({s.sourceType?.replace("_", " ")})</span>
                                              <span style={{ color: "#c97c3a" }}>{(s.score * 100).toFixed(0)}%</span>
                                            </div>
                                            <div style={{ fontStyle: "italic", color: "#64748b", marginBottom: "3px" }}>&ldquo;{s.content.slice(0, 80)}...&rdquo;</div>
                                            <div style={{ fontSize: "9px", color: "#c97c3a", textAlign: "right", fontWeight: "600" }}>View Repo ({tabParam} tab) ↗</div>
                                          </div>
                                        </a>
                                      );
                                    })}
                                  </div>
                                </details>
                              )}
                              
                              {/* Relevance Ranking */}
                              {msg.relevantClients && msg.relevantClients.length > 0 && (
                                <div style={{ marginTop: "8px", borderTop: "1px dashed #e2e8f0", paddingTop: "6px" }}>
                                  <span style={{ fontSize: "11px", fontWeight: "600", color: "#64748b", display: "block", marginBottom: "4px" }}>👥 Matching Clients (Click to view Repo):</span>
                                  {msg.relevantClients.map((rc, rIdx) => {
                                    const repoSlug = clientIdToRepoId[rc.clientId] || "005511_LimWeiMing";
                                    const linkUrl = `/client/${repoSlug}`;
                                    return (
                                      <a
                                        key={rIdx}
                                        href={linkUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ textDecoration: "none", color: "inherit", display: "block" }}
                                      >
                                        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", marginBottom: "4px", cursor: "pointer", padding: "4px", borderRadius: "4px" }}>
                                          <span style={{ width: "90px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 550 }}>{rc.clientName}</span>
                                          <div style={{ flex: 1, height: "4px", background: "#e2e8f0", borderRadius: "2px", overflow: "hidden" }}>
                                            <div style={{ height: "100%", background: "#c97c3a", width: `${rc.maxScore * 100}%` }} />
                                          </div>
                                          <span style={{ width: "24px", textAlign: "right" }}>{(rc.maxScore * 100).toFixed(0)}%</span>
                                          <span style={{ color: "#94a3b8", fontSize: "10px" }}>↗</span>
                                        </div>
                                      </a>
                                    );
                                  })}
                                </div>
                              )}
                            </>
                          ) : (
                            <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{msg.content}</p>
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
                  <button onClick={() => setError(null)}>×</button>
                </div>
              )}

              {/* Footer Input */}
              <div className="widget-input-area">
                {filePreview && (
                  <div style={{ padding: "4px 8px", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", borderRadius: "6px", fontSize: "11px", marginBottom: "4px" }}>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "200px" }}>📄 {filePreview.name}</span>
                    <button style={{ border: "none", background: "none", color: "#ef4444", cursor: "pointer", fontWeight: "bold" }} onClick={() => { setUploadedFile(null); setFilePreview(null); }}>×</button>
                  </div>
                )}
                <div className="widget-input-row">
                  <button
                    className="widget-act-btn"
                    title={selectedClientId ? "Upload proposal PDF" : "Select client context first"}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading || !selectedClientId}
                  >
                    📎
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.txt"
                    style={{ display: "none" }}
                    onChange={(e) => handleFileUpload(e.target.files[0])}
                  />
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
        </div>
      )}

      {/* Styled JSX (scoped to widget) */}
      <style jsx>{`
        /* Bubble Button */
        .floating-chat-bubble {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 56px;
          height: 56px;
          border-radius: var(--radius-full);
          background: var(--color-surface);
          border: var(--border-thin) solid var(--color-border);
          box-shadow: 0 4px 12px rgba(0,0,0,0.5);
          color: var(--color-on-surface);
          cursor: pointer;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .floating-chat-bubble:hover {
          transform: scale(1.05) translateY(-2px);
          background: var(--color-primary);
          border-color: var(--color-primary-hover);
        }

        .floating-chat-bubble.chat-open {
          background: var(--color-surface);
          border-color: var(--color-border);
          transform: rotate(90deg);
        }

        .chat-bubble-icon {
          font-size: 24px;
          line-height: 1;
        }

        .close-bubble-icon {
          font-size: 28px;
          line-height: 1;
        }

        /* Resizable Chat Container */
        .widget-chatbox-container {
          position: fixed;
          bottom: 84px;
          right: 24px;
          background: var(--color-neutral);
          border: var(--border-thin) solid var(--color-border);
          box-shadow: 0 16px 48px rgba(0,0,0,0.5);
          border-radius: var(--radius-lg);
          display: flex;
          flex-direction: column;
          z-index: 1000;
          overflow: hidden;
          font-family: var(--font-sans);
          animation: slideUpWidget 0.2s ease-out;
        }

        @keyframes slideUpWidget {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* Resizers */
        .resize-handle {
          position: absolute;
          z-index: 1001;
        }

        .handle-left {
          left: 0;
          top: 0;
          bottom: 0;
          width: 6px;
          cursor: ew-resize;
        }

        .handle-top {
          top: 0;
          left: 0;
          right: 0;
          height: 6px;
          cursor: ns-resize;
        }

        .handle-corner {
          top: 0;
          left: 0;
          width: 12px;
          height: 12px;
          cursor: nwse-resize;
        }

        /* Header */
        .widget-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 14px;
          background: var(--color-surface);
          border-bottom: var(--border-thin) solid var(--color-border);
          cursor: move;
        }

        .widget-header-title {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .header-icon {
          color: var(--color-primary);
          font-weight: 700;
        }

        .header-title {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--color-on-surface);
        }

        .widget-header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .expand-page-link {
          text-decoration: none;
          color: var(--color-muted);
          font-size: 14px;
          transition: color 0.15s;
          padding: 2px;
        }

        .expand-page-link:hover {
          color: var(--color-tertiary);
        }

        .minimize-btn {
          background: none;
          border: none;
          color: var(--color-muted);
          font-size: 20px;
          cursor: pointer;
          line-height: 1;
          padding: 2px;
          transition: color 0.15s;
        }

        .minimize-btn:hover {
          color: var(--color-error);
        }

        /* Selector Bar */
        .widget-selector-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding: 8px 12px;
          background: rgba(0, 0, 0, 0.02);
          border-bottom: 1px solid rgba(0, 0, 0, 0.04);
        }

        .widget-context-container {
          position: relative;
          z-index: 100;
        }

        .widget-context-trigger {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          cursor: pointer;
          font-family: inherit;
          font-size: 11px;
          font-weight: 600;
          color: #475569;
          transition: all 0.15s ease;
          outline: none;
        }

        .widget-context-trigger:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }

        .widget-context-trigger .trigger-icon {
          font-size: 11px;
        }

        .widget-context-trigger .trigger-chevron {
          font-size: 8.5px;
          color: #94a3b8;
        }

        .widget-context-popover {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          width: 200px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .widget-popover-search {
          padding: 6px;
          border-bottom: 1px solid #f1f5f9;
        }

        .widget-popover-search-input {
          width: 100%;
          padding: 4px 8px;
          border-radius: 4px;
          border: 1px solid #e2e8f0;
          font-size: 11px;
          outline: none;
          font-family: inherit;
        }

        .widget-popover-options {
          max-height: 180px;
          overflow-y: auto;
          padding: 3px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .widget-popover-option-item {
          width: 100%;
          padding: 5px 8px;
          border: none;
          background: transparent;
          border-radius: 4px;
          cursor: pointer;
          text-align: left;
          font-family: inherit;
          font-size: 11px;
          color: #475569;
          transition: all 0.12s ease;
        }

        .widget-popover-option-item:hover {
          background: #f1f5f9;
          color: #1e293b;
        }

        .widget-popover-option-item.active {
          background: rgba(201, 124, 58, 0.08);
          color: #c97c3a;
          font-weight: 600;
        }

        .widget-popover-divider {
          font-size: 9px;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          padding: 4px 8px 2px;
          letter-spacing: 0.3px;
        }

        .widget-clear-btn {
          border: none;
          background: none;
          cursor: pointer;
          font-size: 11.5px;
          color: #ef4444;
          font-weight: 500;
          padding: 4px 8px;
          border-radius: 6px;
          background: rgba(239, 68, 68, 0.08);
          transition: all 0.15s;
        }

        .widget-clear-btn:hover {
          background: rgba(239, 68, 68, 0.15);
        }

        /* Main Content Layout (sidebar + chat column) */
        .widget-main-content {
          display: flex;
          flex-direction: row;
          flex: 1;
          min-height: 0;
          overflow: hidden;
        }

        /* Sidebar */
        .widget-sidebar {
          width: 190px;
          flex-shrink: 0;
          border-right: 1px solid #e2e8f0;
          background: rgba(0,0,0,0.01);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .widget-sidebar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 10px;
          border-bottom: 1px solid #e2e8f0;
        }

        .widget-sidebar-title {
          font-size: 11px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .widget-sidebar-new-btn {
          border: none;
          background: #c97c3a;
          color: white;
          border-radius: 4px;
          padding: 2px 8px;
          font-size: 10px;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.15s;
        }

        .widget-sidebar-new-btn:hover {
          background: #b06d32;
        }

        .widget-sidebar-list {
          flex: 1;
          overflow-y: auto;
          padding: 4px;
        }

        .widget-sidebar-empty {
          text-align: center;
          padding: 16px 8px;
          font-size: 11px;
          color: #94a3b8;
        }

        .widget-sidebar-item {
          padding: 6px 8px;
          border-radius: 4px;
          cursor: pointer;
          margin-bottom: 2px;
          transition: background 0.12s;
          border: 1px solid transparent;
        }

        .widget-sidebar-item:hover {
          background: #f1f5f9;
        }

        .widget-sidebar-item.active {
          background: rgba(201, 124, 58, 0.08);
          border-color: rgba(201, 124, 58, 0.25);
        }

        .widget-sidebar-item-title {
          font-size: 11px;
          font-weight: 600;
          color: #334155;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-bottom: 1px;
        }

        .widget-sidebar-item.active .widget-sidebar-item-title {
          color: #c97c3a;
        }

        .widget-sidebar-item-meta {
          font-size: 9px;
          color: #94a3b8;
          display: flex;
          justify-content: space-between;
        }

        /* Chat Column (right panel) */
        .widget-chat-column {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-width: 0;
        }

        /* Body & Welcome */
        .widget-body {
          flex: 1;
          overflow-y: auto;
          padding: 12px;
        }

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
          font-size: 32px;
          color: #c97c3a;
          margin-bottom: 10px;
        }

        .widget-welcome h5 {
          margin: 0 0 6px;
          font-size: 14px;
          font-weight: 600;
          color: #1e293b;
        }

        .widget-welcome p {
          margin: 0 0 16px;
          font-size: 12px;
          color: #64748b;
          line-height: 1.5;
        }

        .widget-pills {
          display: flex;
          flex-direction: column;
          gap: 6px;
          width: 100%;
        }

        .widget-pill {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 8px 10px;
          font-size: 11.5px;
          color: #475569;
          cursor: pointer;
          text-align: left;
          font-family: inherit;
          transition: all 0.15s;
        }

        .widget-pill:hover {
          background: #f8fafc;
          border-color: #c97c3a55;
          color: #c97c3a;
        }

        /* Message List */
        .widget-msg-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .widget-msg-wrapper {
          display: flex;
          width: 100%;
        }

        .widget-msg-wrapper.user {
          justify-content: flex-end;
        }

        .widget-msg-bubble {
          max-width: 85%;
          padding: 10px 12px;
          border-radius: 12px;
          font-size: 12.5px;
          line-height: 1.5;
        }

        .user .widget-msg-bubble {
          background: var(--bgColor-accent-emphasis);
          color: var(--fgColor-onEmphasis);
          border-bottom-right-radius: var(--borderRadius-small);
        }

        .assistant .widget-msg-bubble {
          background: var(--bgColor-muted);
          border: var(--borderWidth-thin) solid var(--borderColor-default);
          color: var(--fgColor-default);
          border-bottom-left-radius: var(--borderRadius-small);
        }

        /* Loading */
        .widget-msg-bubble.loading {
          display: flex;
          gap: 4px;
          align-items: center;
          padding: 10px 14px;
        }

        .widget-msg-bubble.loading .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #cbd5e1;
          animation: loadingDot 1.2s infinite ease-in-out;
        }

        .widget-msg-bubble.loading .dot:nth-child(2) { animation-delay: 0.2s; }
        .widget-msg-bubble.loading .dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes loadingDot {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
          40% { transform: scale(1.2); opacity: 1; background: #c97c3a; }
        }

        /* Error */
        .widget-error-banner {
          background: #fef2f2;
          border-top: 1px solid #fca5a5;
          padding: 8px 12px;
          font-size: 11.5px;
          color: #ef4444;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .widget-error-banner button {
          border: none;
          background: none;
          color: #ef4444;
          font-size: 14px;
          cursor: pointer;
        }

        /* Input Area */
        .widget-input-area {
          padding: 10px 12px;
          background: rgba(255, 255, 255, 0.9);
          border-top: 1px solid rgba(0, 0, 0, 0.05);
        }

        .widget-input-row {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .widget-act-btn {
          border: none;
          background: none;
          font-size: 16px;
          cursor: pointer;
          opacity: 0.5;
          transition: opacity 0.15s;
          padding: 4px;
        }

        .widget-act-btn:hover:not(:disabled) {
          opacity: 1;
        }

        .widget-act-btn:disabled {
          opacity: 0.2;
          cursor: not-allowed;
        }

        .widget-textarea {
          flex: 1;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 6px 10px;
          font-size: 12.5px;
          font-family: inherit;
          resize: none;
          outline: none;
          max-height: 120px;
          background: white;
          color: #334155;
        }

        .widget-textarea:focus {
          border-color: #c97c3a99;
        }

        .widget-send-btn {
          border: none;
          background: none;
          font-size: 16px;
          color: #cbd5e1;
          cursor: pointer;
          transition: color 0.15s, transform 0.15s;
          padding: 4px;
        }

        .widget-send-btn.active {
          color: #c97c3a;
        }

        .widget-send-btn.active:hover {
          transform: scale(1.1);
        }
      `}</style>
    </>
  );
}
