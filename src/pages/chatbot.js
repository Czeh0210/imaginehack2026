import { useState, useRef, useEffect, useCallback } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { CLIENTS } from "@/lib/mockData";

// Dynamically import PDF viewer (avoids SSR issues with pdfjs-dist)
const PdfAnalysisViewer = dynamic(
  () => import("../components/PdfAnalysisViewer"),
  { ssr: false, loading: () => <div style={{padding:"24px",color:"#888",fontSize:"13px"}}>Loading PDF viewer…</div> }
);

// Simple markdown-like renderer
function renderMarkdown(text) {
  if (!text) return "";

  let html = text
    // Escape HTML first
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    // Code blocks (must come before inline code)
    .replace(
      /```(\w+)?\n?([\s\S]*?)```/g,
      (_, lang, code) =>
        `<pre class="code-block"><code class="lang-${lang || "text"}">${code.trim()}</code></pre>`
    )
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
    // Bold
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    // Italic
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    // Headers
    .replace(/^### (.+)$/gm, '<h3 class="md-h3">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="md-h2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="md-h1">$1</h1>')
    // Numbered lists
    .replace(/^\d+\. (.+)$/gm, '<li class="md-li-num">$1</li>')
    // Bullet lists
    .replace(/^[-*] (.+)$/gm, '<li class="md-li">$1</li>')
    // Wrap consecutive li items
    .replace(
      /(<li class="md-li">.*<\/li>\n?)+/g,
      (match) => `<ul class="md-ul">${match}</ul>`
    )
    .replace(
      /(<li class="md-li-num">.*<\/li>\n?)+/g,
      (match) => `<ol class="md-ol">${match}</ol>`
    )
    // Line breaks (not inside block elements)
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br/>");

  return `<p>${html}</p>`;
}

/** Extract and parse the structured analysis JSON from the AI response */
function parseAnalysis(text) {
  try {
    // Match ```json ... ``` block
    const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (!match) return null;
    const parsed = JSON.parse(match[1].trim());
    if (parsed?.type === "analysis" && Array.isArray(parsed.improvements)) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

/** Render the analysis result as improvement cards */
function AnalysisCards({ analysis }) {
  const SEVERITY_COLORS = [
    { bg: "#fff7ed", border: "#c97c3a", badge: "#c97c3a", label: "Improvement" },
    { bg: "#eff6ff", border: "#3b82f6", badge: "#3b82f6", label: "Suggestion" },
    { bg: "#f0fdf4", border: "#22c55e", badge: "#22c55e", label: "Enhancement" },
  ];

  return (
    <div className="analysis-root">
      {/* Summary banner */}
      <div className="analysis-summary">
        <span className="analysis-summary-icon">📊</span>
        <p className="analysis-summary-text">{analysis.summary}</p>
      </div>

      <p className="analysis-count">
        {analysis.improvements.length} area{analysis.improvements.length !== 1 ? "s" : ""} identified
      </p>

      {/* Improvement cards */}
      {analysis.improvements.map((item, idx) => {
        const color = SEVERITY_COLORS[idx % SEVERITY_COLORS.length];
        return (
          <div
            key={idx}
            className="improvement-card"
            style={{ background: color.bg, borderLeft: `3px solid ${color.border}` }}
          >
            {/* Badge + Highlight */}
            <div className="improvement-header">
              <span className="improvement-badge" style={{ background: color.badge }}>
                #{idx + 1} {color.label}
              </span>
            </div>

            {/* Highlighted quote */}
            <blockquote className="improvement-highlight">
              <span className="highlight-mark" style={{ background: `${color.border}30`, borderColor: color.border }}>
                &ldquo;{item.highlight}&rdquo;
              </span>
            </blockquote>

            {/* Issue */}
            <div className="improvement-section">
              <span className="section-label">⚠ Issue</span>
              <p className="section-text">{item.issue}</p>
            </div>

            {/* Suggestion */}
            <div className="improvement-section">
              <span className="section-label">💡 Suggestion</span>
              <p className="section-text">{item.suggestion}</p>
            </div>

            {/* Resources */}
            {item.resources?.length > 0 && (
              <div className="improvement-resources">
                <span className="section-label">📎 Resources</span>
                <div className="resource-links">
                  {item.resources.map((r, ri) => (
                    <a
                      key={ri}
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="resource-chip"
                    >
                      <span className="resource-icon">↗</span>
                      {r.title}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

const SUGGESTIONS = [
  { icon: "👵", label: "Retirement", prompt: "What are this client's retirement concerns and goals?" },
  { icon: "📈", label: "Passive Income", prompt: "Summarize passive income options for this client" },
  { icon: "🎓", label: "Education Fund", prompt: "How should we plan for the children's education costs?" },
  { icon: "🛡️", label: "Risk Tolerance", prompt: "Explain this client's behavioral patterns and risk tolerance" },
];

export default function Chatbot() {
  const router = useRouter();
  const { clientId } = router.query;

  const [selectedClientId, setSelectedClientId] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState(null);
  const [greeting, setGreeting] = useState("Hello");
  const [activeModel, setActiveModel] = useState("gemini-2.0-flash-lite");

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // Sync URL query parameters (clientId and sessionId)
  useEffect(() => {
    if (!router.isReady) return;

    if (clientId) {
      setSelectedClientId(clientId);
    }

    const querySessionId = router.query.sessionId;
    if (querySessionId) {
      setSessionId(querySessionId);
      setIsLoading(true);
      fetch(`/api/chat/session?sessionId=${querySessionId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.session && data.session.messages) {
            const mapped = data.session.messages.map((m, idx) => ({
              id: idx,
              role: m.role,
              content: m.content,
              sources: m.sources,
            }));
            setMessages(mapped);
          }
        })
        .catch((err) => console.error("Failed to load session history:", err))
        .finally(() => setIsLoading(false));
    }
  }, [router.isReady, clientId, router.query.sessionId]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const adjustTextarea = useCallback(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = Math.min(ta.scrollHeight, 200) + "px";
    }
  }, []);

  useEffect(() => {
    adjustTextarea();
  }, [input, adjustTextarea]);

  const handleFileUpload = async (file) => {
    if (!file) return;

    if (!selectedClientId) {
      setError("Please select a specific client context from the top dropdown before uploading a proposal document.");
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "text/plain",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Please upload a PDF, text, or image file.");
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

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const sendMessage = async (messageText = input) => {
    if ((!messageText.trim() && !uploadedFile) || isLoading) return;

    setIsLoading(true);
    setError(null);

    const currentInput = messageText.trim();
    const currentFile = uploadedFile;
    const currentFilePreview = filePreview;

    // Reset inputs immediately
    setInput("");
    setUploadedFile(null);
    setFilePreview(null);

    let systemNoticeText = null;

    try {
      // 1. Process document upload first if there is a PDF/TXT
      if (currentFile && (currentFile.mimeType === "application/pdf" || currentFile.mimeType === "text/plain")) {
        if (!selectedClientId) {
          throw new Error("A client must be selected to upload and index proposal documents.");
        }

        const selectedClient = CLIENTS.find(c => c.id === selectedClientId);
        const clientName = selectedClient ? selectedClient.name : "Lim Wei Ming";

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

        systemNoticeText = `Successfully processed and indexed "${currentFile.name}" into ${clientName}'s repository. Created ${uploadData.chunkCount} memory blocks using vector embeddings.`;
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
          message: currentInput || (systemNoticeText ? `Summarize the uploaded file ${currentFile.name}` : ""),
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

      if (data.sessionId) setSessionId(data.sessionId);

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

  const clearChat = () => {
    setMessages([]);
    setError(null);
    setUploadedFile(null);
    setFilePreview(null);
    setSessionId(null);
  };

  const hasMessages = messages.length > 0;

  return (
    <>
      <Head>
        <title>AI Assistant — ImagineHack 2026</title>
        <meta name="description" content="Your intelligent AI assistant powered by Google Gemini. Chat, ask questions, and analyze documents." />
      </Head>

      <div className="chatbot-root">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <div className="logo-mark">✦</div>
            <span className="logo-text">AI Assistant</span>
          </div>

          <button id="new-chat-btn" className="new-chat-btn" onClick={clearChat}>
            <span className="new-chat-icon">+</span>
            New chat
          </button>

          <nav className="sidebar-nav">
            {hasMessages && (
              <div className="chat-history-section">
                <p className="history-label">Today</p>
                <div className="history-item active">
                  <span className="history-icon">💬</span>
                  <span className="history-title">
                    {messages[0]?.content?.slice(0, 30) || "New conversation"}
                    {messages[0]?.content?.length > 30 ? "…" : ""}
                  </span>
                </div>
              </div>
            )}
          </nav>

          <div className="sidebar-footer">
            <div className="model-badge">
              <span className="model-dot"></span>
              {activeModel}
            </div>
          </div>
        </aside>

        {/* Main Chat Area */}
        <main className="chat-main">
          {/* Top bar */}
          <header className="chat-header">
            <div className="header-left">
              <div className="header-model-selector">
                <span className="model-name">{activeModel}</span>
                <span className="model-chevron">▾</span>
              </div>
              
              <div className="header-client-selector">
                <span className="client-selector-label">Context:</span>
                <select
                  id="client-context-select"
                  className="client-select"
                  value={selectedClientId}
                  onChange={(e) => {
                    setSelectedClientId(e.target.value);
                    clearChat();
                  }}
                >
                  <option value="">🌐 Global (All Clients)</option>
                  {CLIENTS.map((c) => (
                    <option key={c.id} value={c.id}>
                      👤 {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {hasMessages && (
              <button id="clear-chat-btn" className="clear-btn" onClick={clearChat} title="Clear conversation">
                🗑 Clear
              </button>
            )}
          </header>

          {/* Messages or Welcome */}
          <div className="messages-container">
            {!hasMessages ? (
              <div className="welcome-screen">
                <div className="welcome-logo">✦</div>
                <h1 className="welcome-title">
                  {greeting}, I&apos;m your AI
                </h1>
                <p className="welcome-subtitle">
                  Ask me anything, upload a document for analysis, or explore the suggestions below.
                </p>

                <div className="suggestion-grid">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s.label}
                      id={`suggestion-${s.label.toLowerCase()}`}
                      className="suggestion-card"
                      onClick={() => setInput(s.prompt)}
                    >
                      <span className="suggestion-icon">{s.icon}</span>
                      <span className="suggestion-label">{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="messages-list">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`message-wrapper ${msg.role === "user" ? "user-wrapper" : "assistant-wrapper"}${msg.pdfBase64 ? " pdf-analysis-wrapper" : ""}`}
                  >
                    {msg.role === "assistant" && !msg.pdfBase64 && (
                      <div className="assistant-avatar">✦</div>
                    )}
                    <div className={`message-bubble ${msg.role === "user" ? "user-bubble" : msg.pdfBase64 ? "analysis-bubble" : "assistant-bubble"}`}>
                      {/* File attachment preview in message */}
                      {msg.file && (
                        <div className="message-file-preview">
                          {msg.file.isImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={msg.file.url} alt={msg.file.name} className="message-file-img" />
                          ) : (
                            <div className="message-file-info">
                              <span className="file-type-icon">
                                {msg.file.type === "application/pdf" ? "📄" : "📝"}
                              </span>
                              <span className="file-name">{msg.file.name}</span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {msg.content && (
                        msg.role === "assistant" ? (
                          <>
                            {msg.isAnalysis ? (
                              (() => {
                                const analysis = parseAnalysis(msg.content);
                                if (analysis) {
                                  if (msg.pdfBase64) {
                                    return (
                                      <PdfAnalysisViewer
                                        pdfBase64={msg.pdfBase64}
                                        analysis={analysis}
                                      />
                                    );
                                  }
                                  return <AnalysisCards analysis={analysis} />;
                                }
                                return null;
                              })()
                            ) : (
                              <div
                                className="markdown-content"
                                dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                              />
                            )}

                            {/* Retrieved memories (sources) list */}
                            {msg.sources && msg.sources.length > 0 && (
                              <div className="sources-wrapper">
                                <details className="sources-details">
                                  <summary className="sources-summary">
                                    🔍 Retrieved {msg.sources.length} matching memories
                                  </summary>
                                  <div className="sources-list">
                                    {msg.sources.map((src, sIdx) => (
                                      <div key={sIdx} className="source-item">
                                        <div className="source-item-header">
                                          <div className="source-item-meta">
                                            <span className="source-badge-client">{src.clientName}</span>
                                            <span className="source-badge-type">{src.sourceType?.replace("_", " ")}</span>
                                            {src.metadata?.date && <span className="source-item-date">{src.metadata.date}</span>}
                                          </div>
                                          <span className="source-badge-score">
                                            {(src.score * 100).toFixed(1)}% match
                                          </span>
                                        </div>
                                        <blockquote className="source-item-content">
                                          &ldquo;{src.content}&rdquo;
                                        </blockquote>
                                      </div>
                                    ))}
                                  </div>
                                </details>
                              </div>
                            )}

                            {/* Relevant clients found (ranking) */}
                            {msg.relevantClients && msg.relevantClients.length > 0 && (
                              <div className="relevant-clients-wrapper">
                                <span className="relevant-title">👥 Top Relevant Clients</span>
                                <div className="relevant-list">
                                  {msg.relevantClients.map((rc, rIdx) => (
                                    <div key={rIdx} className="relevant-item">
                                      <span className="relevant-name">{rc.clientName}</span>
                                      <div className="relevant-bar-container">
                                        <div className="relevant-bar-fill" style={{ width: `${rc.maxScore * 100}%` }} />
                                      </div>
                                      <span className="relevant-score">{(rc.maxScore * 100).toFixed(0)}%</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            {msg.systemNotice && (
                              <div className="system-notice">
                                <span className="system-notice-icon">💾</span>
                                <span className="system-notice-text">{msg.systemNotice}</span>
                              </div>
                            )}
                            <p className="user-text">{msg.content}</p>
                          </>
                        )
                      )}
                    </div>
                  </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="message-wrapper assistant-wrapper">
                    <div className="assistant-avatar">✦</div>
                    <div className="message-bubble assistant-bubble loading-bubble">
                      <div className="loading-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Error message */}
          {error && (
            <div className="error-banner">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
              <button className="error-close" onClick={() => setError(null)}>×</button>
            </div>
          )}

          {/* Input Area */}
          <div
            className={`input-area ${isDragOver ? "drag-over" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
          >
            <div className="input-box">
              {/* File preview */}
              {filePreview && (
                <div className="file-preview-strip">
                  <div className="file-chip">
                    {filePreview.isImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={filePreview.url} alt={filePreview.name} className="file-chip-img" />
                    ) : (
                      <span className="file-chip-icon">
                        {filePreview.type === "application/pdf" ? "📄" : "📝"}
                      </span>
                    )}
                    <span className="file-chip-name">{filePreview.name}</span>
                    <button
                      className="file-chip-remove"
                      onClick={() => { setUploadedFile(null); setFilePreview(null); }}
                      aria-label="Remove file"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}

              <textarea
                ref={textareaRef}
                id="chat-input"
                className="chat-textarea"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isDragOver ? "Drop your file here…" : "Ask anything, or drop a file here…"}
                rows={1}
                disabled={isLoading}
              />

              <div className="input-actions">
                {/* File upload button */}
                <button
                  id="upload-file-btn"
                  className="action-btn upload-btn"
                  onClick={() => fileInputRef.current?.click()}
                  title={selectedClientId ? "Upload PDF or image" : "Select client context first"}
                  disabled={isLoading || !selectedClientId}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt,image/jpeg,image/png,image/webp"
                  className="hidden-input"
                  onChange={(e) => handleFileUpload(e.target.files[0])}
                />

                {/* Send button */}
                <button
                  id="send-message-btn"
                  className={`action-btn send-btn ${(input.trim() || uploadedFile) && !isLoading ? "send-active" : ""}`}
                  onClick={() => sendMessage()}
                  disabled={(!input.trim() && !uploadedFile) || isLoading}
                  aria-label="Send message"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                  </svg>
                </button>
              </div>
            </div>

            <p className="input-hint">
              Press <kbd>Enter</kbd> to send · <kbd>Shift+Enter</kbd> for new line · {selectedClientId ? "Supports PDF, images" : "Select client context to upload files"}
            </p>
          </div>
        </main>

        {/* Client Profile Details Panel */}
        {selectedClientId && (() => {
          const selectedClient = CLIENTS.find((c) => c.id === selectedClientId);
          if (!selectedClient) return null;
          return (
            <aside className="client-profile-panel">
              <div className="panel-header">
                <h3>Client Profile Context</h3>
              </div>
              <div className="panel-body">
                <div className="profile-hero">
                  <div className="profile-avatar-large">
                    {selectedClient.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <h4>{selectedClient.name}</h4>
                  <span className="profile-meta">{selectedClient.age} years old · {selectedClient.gender}</span>
                </div>

                <div className="profile-section">
                  <span className="section-title">Risk Profile</span>
                  <span className={`risk-badge risk-${selectedClient.riskProfile.toLowerCase().replace(" ", "-")}`}>
                    {selectedClient.riskProfile}
                  </span>
                </div>

                <div className="profile-section">
                  <span className="section-title">Executive Summary</span>
                  <p className="section-desc">{selectedClient.summary}</p>
                </div>

                <div className="profile-section">
                  <span className="section-title">Goals</span>
                  <div className="tag-cloud">
                    {selectedClient.goals.map((g, idx) => (
                      <span key={idx} className="tag-pill goal-pill">{g}</span>
                    ))}
                  </div>
                </div>

                <div className="profile-section">
                  <span className="section-title">Services Needed</span>
                  <div className="tag-cloud">
                    {selectedClient.servicesNeeded.map((s, idx) => (
                      <span key={idx} className="tag-pill service-pill">{s}</span>
                    ))}
                  </div>
                </div>

                <div className="profile-section">
                  <span className="section-title">Behavior Patterns</span>
                  <div className="tag-cloud">
                    {selectedClient.behaviourTags.map((t, idx) => (
                      <span key={idx} className="tag-pill behavior-pill">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          );
        })()}
      </div>

      <style jsx>{`
        /* ==============================
           ROOT & LAYOUT
        ============================== */
        .chatbot-root {
          display: flex;
          height: 100vh;
          width: 100%;
          background: #ffffff;
          color: #1a1a1a;
          font-family: 'Inter', sans-serif;
          overflow: hidden;
        }

        /* ==============================
           SIDEBAR
        ============================== */
        .sidebar {
          width: 260px;
          min-width: 260px;
          background: #f7f7f8;
          border-right: 1px solid #e5e5e8;
          display: flex;
          flex-direction: column;
          padding: 16px 12px;
          gap: 8px;
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          margin-bottom: 4px;
        }

        .logo-mark {
          font-size: 20px;
          color: #c97c3a;
          line-height: 1;
        }

        .logo-text {
          font-size: 15px;
          font-weight: 600;
          color: #111111;
          letter-spacing: -0.02em;
        }

        .new-chat-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 10px 14px;
          background: transparent;
          border: 1px solid #e0e0e4;
          border-radius: 10px;
          color: #444444;
          font-size: 14px;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.15s ease;
          text-align: left;
        }

        .new-chat-btn:hover {
          background: #eeeeef;
          border-color: #c8c8cc;
          color: #111111;
        }

        .new-chat-icon {
          font-size: 18px;
          font-weight: 300;
          color: #aaaaaa;
        }

        .sidebar-nav {
          flex: 1;
          overflow-y: auto;
          margin-top: 8px;
        }

        .chat-history-section {
          margin-top: 4px;
        }

        .history-label {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #aaaaaa;
          padding: 4px 10px;
          margin-bottom: 4px;
        }

        .history-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 10px;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.15s;
        }

        .history-item.active {
          background: #eeeef0;
        }

        .history-icon {
          font-size: 14px;
          opacity: 0.6;
        }

        .history-title {
          font-size: 13px;
          color: #555555;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .sidebar-footer {
          padding: 12px 10px 4px;
          border-top: 1px solid #e5e5e8;
          margin-top: 8px;
        }

        .model-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #888888;
        }

        .model-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #4ade80;
          box-shadow: 0 0 6px #4ade80;
        }

        /* ==============================
           MAIN CHAT AREA
        ============================== */
        .chat-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          position: relative;
        }

        .chat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 24px;
          border-bottom: 1px solid #ebebed;
          background: #ffffff;
        }

        .header-model-selector {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.15s;
        }

        .header-model-selector:hover {
          background: #f0f0f2;
        }

        .model-name {
          font-size: 13px;
          font-weight: 500;
          color: #444444;
        }

        .model-chevron {
          font-size: 10px;
          color: #aaaaaa;
        }

        .clear-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          background: transparent;
          border: 1px solid #e0e0e4;
          border-radius: 8px;
          color: #888888;
          font-size: 13px;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.15s;
        }

        .clear-btn:hover {
          background: #fef2f2;
          color: #dc2626;
          border-color: #fca5a5;
        }

        /* ==============================
           MESSAGES AREA
        ============================== */
        .messages-container {
          flex: 1;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: #d8d8d8 transparent;
        }

        .messages-container::-webkit-scrollbar {
          width: 4px;
        }

        .messages-container::-webkit-scrollbar-thumb {
          background: #d8d8d8;
          border-radius: 4px;
        }

        /* ==============================
           WELCOME SCREEN
        ============================== */
        .welcome-screen {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100%;
          padding: 48px 24px;
          text-align: center;
          animation: fadeIn 0.4s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .welcome-logo {
          font-size: 40px;
          color: #c97c3a;
          margin-bottom: 24px;
          animation: pulse 3s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.85; }
        }

        .welcome-title {
          font-size: 32px;
          font-weight: 600;
          color: #111111;
          margin: 0 0 12px;
          letter-spacing: -0.03em;
          line-height: 1.2;
        }

        .welcome-subtitle {
          font-size: 15px;
          color: #888888;
          max-width: 480px;
          line-height: 1.6;
          margin: 0 0 40px;
        }

        .suggestion-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          width: 100%;
          max-width: 560px;
        }

        .suggestion-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 18px 12px;
          background: #f7f7f8;
          border: 1px solid #e5e5e8;
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
          color: #444444;
        }

        .suggestion-card:hover {
          background: #ffffff;
          border-color: #c97c3a55;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.08);
          color: #111111;
        }

        .suggestion-icon {
          font-size: 22px;
        }

        .suggestion-label {
          font-size: 13px;
          font-weight: 500;
        }

        /* ==============================
           MESSAGE LIST
        ============================== */
        .messages-list {
          padding: 24px 0;
          max-width: 760px;
          margin: 0 auto;
          width: 100%;
        }

        .message-wrapper {
          display: flex;
          gap: 14px;
          padding: 12px 24px;
          animation: slideUp 0.25s ease;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .user-wrapper {
          flex-direction: row-reverse;
        }

        .assistant-avatar {
          width: 32px;
          height: 32px;
          min-width: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #c97c3a, #e8a55a);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          color: white;
          flex-shrink: 0;
          margin-top: 4px;
        }

        .message-bubble {
          max-width: 80%;
          padding: 14px 18px;
          border-radius: 18px;
          line-height: 1.65;
          font-size: 14.5px;
        }

        .user-bubble {
          background: #c97c3a;
          color: #fff;
          border-bottom-right-radius: 4px;
        }

        .assistant-bubble {
          background: #f7f7f8;
          border: 1px solid #e5e5e8;
          color: #1a1a1a;
          border-bottom-left-radius: 4px;
        }

        /* Full-width wrapper for PDF analysis messages */
        .pdf-analysis-wrapper {
          padding: 8px 0;
        }

        .analysis-bubble {
          max-width: 100% !important;
          width: 100%;
          background: transparent;
          border: none;
          padding: 0;
          border-radius: 0;
        }

        .user-text {
          margin: 0;
          white-space: pre-wrap;
          word-break: break-word;
        }

        /* ==============================
           MARKDOWN CONTENT
        ============================== */
        .markdown-content :global(p) {
          margin: 0 0 10px;
        }

        .markdown-content :global(p:last-child) {
          margin-bottom: 0;
        }

        .markdown-content :global(strong) {
          color: #111111;
          font-weight: 600;
        }

        .markdown-content :global(.md-h1),
        .markdown-content :global(.md-h2),
        .markdown-content :global(.md-h3) {
          color: #111111;
          font-weight: 600;
          margin: 16px 0 8px;
        }

        .markdown-content :global(.md-h1) { font-size: 18px; }
        .markdown-content :global(.md-h2) { font-size: 16px; }
        .markdown-content :global(.md-h3) { font-size: 14.5px; }

        .markdown-content :global(.md-ul),
        .markdown-content :global(.md-ol) {
          padding-left: 20px;
          margin: 8px 0;
        }

        .markdown-content :global(.md-li),
        .markdown-content :global(.md-li-num) {
          margin-bottom: 4px;
        }

        .markdown-content :global(.code-block) {
          background: #f3f4f6;
          border: 1px solid #e0e0e4;
          border-radius: 10px;
          padding: 14px 16px;
          margin: 12px 0;
          overflow-x: auto;
          font-family: 'Geist Mono', 'Fira Code', monospace;
          font-size: 13px;
          line-height: 1.6;
          color: #1a5c1a;
        }

        .markdown-content :global(.inline-code) {
          background: #f0f0f2;
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 1px 6px;
          font-family: monospace;
          font-size: 13px;
          color: #b45309;
        }

        /* ==============================
           LOADING ANIMATION
        ============================== */
        .loading-bubble {
          padding: 16px 20px;
        }

        .loading-dots {
          display: flex;
          gap: 5px;
          align-items: center;
        }

        .loading-dots span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #cccccc;
          animation: bounce 1.2s ease-in-out infinite;
        }

        .loading-dots span:nth-child(2) { animation-delay: 0.2s; }
        .loading-dots span:nth-child(3) { animation-delay: 0.4s; }

        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
          40% { transform: scale(1.1); opacity: 1; background: #c97c3a; }
        }

        /* ==============================
           FILE PREVIEW IN MESSAGES
        ============================== */
        .message-file-preview {
          margin-bottom: 10px;
        }

        .message-file-img {
          max-width: 240px;
          max-height: 180px;
          border-radius: 10px;
          object-fit: cover;
        }

        .message-file-info {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: rgba(255,255,255,0.1);
          border-radius: 8px;
          font-size: 13px;
        }

        .file-name {
          font-weight: 500;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 200px;
        }

        /* ==============================
           ERROR BANNER
        ============================== */
        .error-banner {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0 24px 12px;
          padding: 12px 16px;
          background: #fef2f2;
          border: 1px solid #fca5a5;
          border-radius: 10px;
          font-size: 13px;
          color: #dc2626;
          animation: slideUp 0.2s ease;
        }

        .error-icon {
          font-size: 16px;
        }

        .error-close {
          margin-left: auto;
          background: transparent;
          border: none;
          color: #dc2626;
          font-size: 18px;
          cursor: pointer;
          padding: 0 4px;
          line-height: 1;
        }

        /* ==============================
           INPUT AREA
        ============================== */
        .input-area {
          padding: 12px 24px 16px;
          background: #ffffff;
          transition: background 0.2s;
        }

        .input-area.drag-over {
          background: #f0f4ff;
        }

        .input-box {
          display: flex;
          flex-direction: column;
          max-width: 760px;
          margin: 0 auto;
          background: #ffffff;
          border: 1.5px solid #e0e0e4;
          border-radius: 16px;
          transition: border-color 0.2s, box-shadow 0.2s;
          overflow: hidden;
        }

        .input-box:focus-within {
          border-color: #c97c3a66;
          box-shadow: 0 0 0 3px rgba(201, 124, 58, 0.08);
        }

        .input-area.drag-over .input-box {
          border-color: #c97c3a;
          box-shadow: 0 0 0 4px rgba(201, 124, 58, 0.15);
        }

        /* File preview strip */
        .file-preview-strip {
          padding: 12px 14px 0;
        }

        .file-chip {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 10px;
          background: #f0f0f2;
          border: 1px solid #ddd;
          border-radius: 8px;
          max-width: 280px;
        }

        .file-chip-img {
          width: 32px;
          height: 32px;
          object-fit: cover;
          border-radius: 4px;
        }

        .file-chip-icon {
          font-size: 20px;
        }

        .file-chip-name {
          font-size: 12px;
          color: #555555;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 180px;
        }

        .file-chip-remove {
          background: none;
          border: none;
          color: #666;
          font-size: 16px;
          cursor: pointer;
          padding: 0 2px;
          line-height: 1;
          transition: color 0.15s;
          flex-shrink: 0;
        }

        .file-chip-remove:hover {
          color: #f87171;
        }

        /* Textarea */
        .chat-textarea {
          width: 100%;
          background: transparent;
          border: none;
          outline: none;
          resize: none;
          padding: 16px 16px 8px;
          font-size: 15px;
          font-family: inherit;
          color: #1a1a1a;
          line-height: 1.6;
          max-height: 200px;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: #d8d8d8 transparent;
          box-sizing: border-box;
        }

        .chat-textarea::placeholder {
          color: #aaaaaa;
        }

        .chat-textarea:disabled {
          opacity: 0.5;
        }

        /* Input actions */
        .input-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px 12px;
        }

        .action-btn {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
          font-family: inherit;
        }

        .upload-btn {
          background: transparent;
          color: #aaaaaa;
        }

        .upload-btn:hover:not(:disabled) {
          background: #f0f0f2;
          color: #c97c3a;
        }

        .upload-btn:disabled {
          opacity: 0.3;
          cursor: default;
        }

        .send-btn {
          background: #ebebed;
          color: #aaaaaa;
        }

        .send-btn.send-active {
          background: #c97c3a;
          color: #fff;
          box-shadow: 0 4px 12px rgba(201, 124, 58, 0.35);
        }

        .send-btn.send-active:hover {
          background: #d98a47;
          transform: scale(1.05);
        }

        .send-btn:disabled:not(.send-active) {
          cursor: default;
        }

        .hidden-input {
          display: none;
        }

        .input-hint {
          text-align: center;
          font-size: 11px;
          color: #aaaaaa;
          margin: 8px 0 0;
        }

        .input-hint kbd {
          display: inline-block;
          padding: 1px 5px;
          background: #f0f0f2;
          border: 1px solid #ddd;
          border-radius: 3px;
          font-size: 10px;
          font-family: inherit;
          color: #888888;
        }

        /* ==============================
           RESPONSIVE
        ============================== */
        @media (max-width: 640px) {
          .sidebar {
            display: none;
          }

          .suggestion-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .welcome-title {
            font-size: 24px;
          }

          .messages-list {
            padding: 16px 0;
          }

          .message-wrapper {
            padding: 8px 16px;
          }
        }

        /* ==============================
           ANALYSIS CARDS
        ============================== */
        .analysis-root {
          display: flex;
          flex-direction: column;
          gap: 14px;
          width: 100%;
        }

        .analysis-summary {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          padding: 14px 16px;
          background: #f7f7f8;
          border: 1px solid #e5e5e8;
          border-radius: 12px;
        }

        .analysis-summary-icon {
          font-size: 20px;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .analysis-summary-text {
          margin: 0;
          font-size: 13.5px;
          line-height: 1.65;
          color: #444444;
        }

        .analysis-count {
          margin: 0;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          color: #aaaaaa;
        }

        .improvement-card {
          border-radius: 12px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          animation: slideUp 0.3s ease both;
        }

        .improvement-header {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .improvement-badge {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          color: #fff;
          letter-spacing: 0.02em;
        }

        .improvement-highlight {
          margin: 0;
          padding: 0;
        }

        .highlight-mark {
          display: inline;
          padding: 3px 8px;
          border-radius: 6px;
          border: 1px solid;
          font-size: 13px;
          font-style: italic;
          color: #333333;
          line-height: 1.7;
          word-break: break-word;
        }

        .improvement-section {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .section-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          color: #999999;
        }

        .section-text {
          margin: 0;
          font-size: 13.5px;
          line-height: 1.6;
          color: #333333;
        }

        .improvement-resources {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .resource-links {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .resource-chip {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 12px;
          background: #eef2ff;
          border: 1px solid #c7d2fe;
          border-radius: 20px;
          font-size: 12px;
          color: #4361c2;
          text-decoration: none;
          transition: all 0.15s ease;
          white-space: nowrap;
        }

        .resource-chip:hover {
          background: #e0e7ff;
          border-color: #818cf8;
          color: #3730a3;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
        }

        .resource-icon {
          font-size: 11px;
          opacity: 0.7;
        }

        /* ==============================
           RAG & CONTEXT STYLES
        ============================== */
        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .header-client-selector {
          display: flex;
          align-items: center;
          gap: 8px;
          border-left: 1px solid #ebebed;
          padding-left: 16px;
        }

        .client-selector-label {
          font-size: 12px;
          font-weight: 500;
          color: #888888;
        }

        .client-select {
          background: #f7f7f8;
          border: 1px solid #e5e5e8;
          border-radius: 8px;
          padding: 6px 12px;
          font-size: 13px;
          font-family: inherit;
          color: #444444;
          cursor: pointer;
          outline: none;
          transition: all 0.15s;
        }

        .client-select:hover {
          background: #eeeeef;
          border-color: #c8c8cc;
        }

        .client-select:focus {
          border-color: #c97c3a;
          box-shadow: 0 0 0 2px rgba(201, 124, 58, 0.15);
        }

        .system-notice {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 8px;
          font-size: 12.5px;
          color: #15803d;
          margin-bottom: 10px;
        }

        .system-notice-icon {
          font-size: 16px;
        }

        .system-notice-text {
          font-weight: 500;
        }

        /* Retrieved Memories / Sources */
        .sources-wrapper {
          margin-top: 12px;
          border-top: 1px dashed #e5e5e8;
          padding-top: 12px;
        }

        .sources-details {
          width: 100%;
        }

        .sources-summary {
          font-size: 12.5px;
          font-weight: 600;
          color: #c97c3a;
          cursor: pointer;
          user-select: none;
          outline: none;
          padding: 2px 0;
          transition: color 0.15s;
        }

        .sources-summary:hover {
          color: #d98a47;
        }

        .sources-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 10px;
          animation: fadeIn 0.2s ease;
        }

        .source-item {
          background: #ffffff;
          border: 1px solid #e5e5e8;
          border-radius: 8px;
          padding: 10px 12px;
        }

        .source-item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
          flex-wrap: wrap;
          gap: 6px;
        }

        .source-item-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .source-badge-client {
          background: #eff6ff;
          color: #1d4ed8;
          font-size: 11px;
          font-weight: 600;
          padding: 1px 6px;
          border-radius: 4px;
        }

        .source-badge-type {
          background: #f3f4f6;
          color: #4b5563;
          font-size: 11px;
          font-weight: 600;
          padding: 1px 6px;
          border-radius: 4px;
          text-transform: capitalize;
        }

        .source-item-date {
          font-size: 11px;
          color: #888888;
        }

        .source-badge-score {
          font-size: 11px;
          font-weight: 700;
          color: #16a34a;
          background: #f0fdf4;
          padding: 1px 6px;
          border-radius: 4px;
        }

        .source-item-content {
          margin: 0;
          font-size: 12.5px;
          line-height: 1.5;
          color: #555555;
          font-style: italic;
          word-break: break-word;
        }

        /* Relevant Clients Ranking */
        .relevant-clients-wrapper {
          margin-top: 12px;
          border-top: 1px dashed #e5e5e8;
          padding-top: 12px;
        }

        .relevant-title {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: #666666;
          margin-bottom: 8px;
        }

        .relevant-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .relevant-item {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .relevant-name {
          font-size: 12.5px;
          font-weight: 500;
          color: #333333;
          width: 120px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .relevant-bar-container {
          flex: 1;
          height: 6px;
          background: #e5e5e8;
          border-radius: 3px;
          overflow: hidden;
        }

        .relevant-bar-fill {
          height: 100%;
          background: #c97c3a;
          border-radius: 3px;
          transition: width 0.3s ease;
        }

        .relevant-score {
          font-size: 11.5px;
          font-weight: 600;
          color: #c97c3a;
          width: 36px;
          text-align: right;
        }

        /* Client Profile Side Panel */
        .client-profile-panel {
          width: 320px;
          min-width: 320px;
          background: #f7f7f8;
          border-left: 1px solid #e5e5e8;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          animation: slideLeft 0.3s ease;
        }

        @keyframes slideLeft {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .panel-header {
          padding: 16px 20px;
          border-bottom: 1px solid #e5e5e8;
        }

        .panel-header h3 {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: #111;
        }

        .panel-body {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .profile-hero {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding-bottom: 16px;
          border-bottom: 1px solid #e5e5e8;
        }

        .profile-avatar-large {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, #c97c3a, #e8a55a);
          color: white;
          font-size: 18px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
        }

        .profile-hero h4 {
          margin: 0 0 4px;
          font-size: 15px;
          font-weight: 600;
          color: #111;
        }

        .profile-meta {
          font-size: 11.5px;
          color: #888;
        }

        .profile-section {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .section-title {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #999;
        }

        .section-desc {
          margin: 0;
          font-size: 12.5px;
          color: #444;
          line-height: 1.5;
        }

        .risk-badge {
          display: inline-block;
          align-self: flex-start;
          padding: 3px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
        }

        .risk-moderate {
          background: #eff6ff;
          color: #2563eb;
          border: 1px solid #bfdbfe;
        }

        .risk-aggressive {
          background: #fdf2f8;
          color: #db2777;
          border: 1px solid #fbcfe8;
        }

        .risk-conservative {
          background: #f0fdf4;
          color: #16a34a;
          border: 1px solid #bbf7d0;
        }

        .risk-moderate-aggressive {
          background: #faf5ff;
          color: #7c3aed;
          border: 1px solid #e9d5ff;
        }

        .tag-cloud {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .tag-pill {
          font-size: 11px;
          padding: 3px 8px;
          border-radius: 6px;
          font-weight: 500;
        }

        .goal-pill {
          background: #fff7ed;
          color: #c97c3a;
          border: 1px solid #ffedd5;
        }

        .service-pill {
          background: #f0fdfa;
          color: #0d9488;
          border: 1px solid #ccfbf1;
        }

        .behavior-pill {
          background: #f8fafc;
          color: #475569;
          border: 1px solid #e2e8f0;
        }
      `}</style>
    </>
  );
}
