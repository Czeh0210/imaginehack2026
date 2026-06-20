import { useState, useRef, useEffect, useCallback } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { CLIENTS } from "@/lib/mockData";
import Layout from '@/components/Layout';

// Dynamically import PDF viewer 
const PdfAnalysisViewer = dynamic(
  () => import("../components/PdfAnalysisViewer"),
  { ssr: false, loading: () => <div style={{padding:"24px",color:"var(--color-fg-muted)",fontSize:"var(--text-sm)"}}>Loading PDF viewer…</div> }
);

function renderMarkdown(text) {
  if (!text) return "";
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/```(\w+)?\n?([\s\S]*?)```/g, (_, lang, code) => `<pre style="background:var(--color-bg-inset);padding:var(--space-3);border-radius:var(--radius-md);font-size:var(--text-code);overflow-x:auto;color:var(--color-fg-default);margin:var(--space-2) 0;"><code>${code.trim()}</code></pre>`)
    .replace(/`([^`]+)`/g, '<code style="background:var(--color-bg-inset);padding:2px 4px;border-radius:4px;font-size:var(--text-code-inline);color:var(--color-fg-accent);"> $1 </code>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong style='font-weight:var(--weight-semibold)'>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/^### (.+)$/gm, '<h3 style="font-size:var(--text-lg);margin:var(--space-3) 0 var(--space-2);font-weight:var(--weight-semibold);color:var(--color-fg-default);">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="font-size:var(--text-xl);margin:var(--space-4) 0 var(--space-2);font-weight:var(--weight-semibold);color:var(--color-fg-default);">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="font-size:var(--text-2xl);margin:var(--space-5) 0 var(--space-3);font-weight:var(--weight-semibold);color:var(--color-fg-default);">$1</h1>')
    .replace(/^\d+\. (.+)$/gm, '<li style="margin-left:var(--space-4);font-size:var(--text-md);">$1</li>')
    .replace(/^[-*] (.+)$/gm, '<li style="margin-left:var(--space-4);font-size:var(--text-md);">$1</li>')
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br/>");
  return `<p style="margin:0 0 var(--space-2);">${html}</p>`;
}

export default function ChatbotPage() {
  const router = useRouter();
  const { c: clientParam } = router.query;
  const [selectedClientId, setSelectedClientId] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // Session history
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);

  useEffect(() => {
    if (router.isReady && clientParam) {
      setSelectedClientId(clientParam);
    }
  }, [router.isReady, clientParam]);

  useEffect(() => {
    if (router.isReady) {
      const { sessionId, clientId } = router.query;
      if (sessionId) {
        setActiveSessionId(sessionId);
        setSessionId(sessionId);
        selectSessionById(sessionId);
      }
      if (clientId) setSelectedClientId(clientId);
    }
  }, [router.isReady]);

  useEffect(() => {
    fetchSessions();
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

  const selectSessionById = async (id) => {
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
    await selectSessionById(id);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => scrollToBottom(), [messages]);

  const resizeTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  useEffect(() => { resizeTextarea(); }, [input]);

  const sendMessage = async (e) => {
    if (e) e.preventDefault();
    if ((!input.trim() && !uploadedFile) || isLoading) return;

    const userMsgText = input.trim();
    const currentInput = userMsgText;
    const currentFile = uploadedFile;
    const currentPreview = filePreview;
    
    setInput("");
    setUploadedFile(null);
    setFilePreview(null);
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    const userMessage = {
      role: "user",
      content: currentInput,
      filePreview: currentPreview,
      fileName: currentFile?.name
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      let fileBase64 = null;
      let mimeType = null;
      
      if (currentFile) {
        fileBase64 = currentPreview.split(",")[1];
        mimeType = currentFile.type;
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: currentInput,
          clientId: selectedClientId || null,
          sessionId,
          searchScope: "global",
          file: fileBase64 ? { data: fileBase64, mimeType } : null
        }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      
      if (!sessionId && data.sessionId) {
        setSessionId(data.sessionId);
      }

      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.reply,
        sources: data.sources || [],
        clientRanking: data.clientRanking || []
      }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Error: Could not connect to AI. Please ensure API keys are set."
      }]);
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

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <Layout>
      <Head>
        <title>Copilot Chat - Workspace</title>
      </Head>

      <div style={{
        display: "flex",
        width: "100%",
        maxWidth: "1000px",
        margin: "0 auto",
        height: "calc(100vh - 100px)",
        border: "var(--border-thin) solid var(--color-border-default)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        backgroundColor: "var(--color-bg-default)"
      }}>
        
        {/* Left Sidebar - Session History */}
        <aside style={{
          width: "240px",
          flexShrink: 0,
          borderRight: "var(--border-thin) solid var(--color-border-default)",
          backgroundColor: "var(--color-bg-muted)",
          display: "flex",
          flexDirection: "column",
          height: "100%"
        }}>
          <div style={{
            padding: "var(--space-3)",
            borderBottom: "var(--border-thin) solid var(--color-border-default)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-fg-default)" }}>Chat History</span>
            <button
              onClick={createNewSession}
              style={{
                background: "var(--color-bg-accent-emphasis)",
                color: "var(--color-fg-on-emphasis)",
                border: "none",
                borderRadius: "var(--radius-md)",
                padding: "var(--space-1) var(--space-2)",
                fontSize: "var(--text-xs)",
                cursor: "pointer",
                fontWeight: 500,
                lineHeight: 1.4
              }}
            >
              + New
            </button>
          </div>
          <div style={{
            flex: 1,
            overflowY: "auto",
            padding: "var(--space-2)"
          }}>
            {sessions.length === 0 ? (
              <div style={{
                textAlign: "center",
                color: "var(--color-fg-muted)",
                fontSize: "var(--text-sm)",
                padding: "var(--space-4)"
              }}>
                No sessions yet
              </div>
            ) : (
              [...sessions].reverse().map(s => (
                <div
                  key={s.id}
                  onClick={() => selectSession(s.id)}
                  style={{
                    padding: "var(--space-2) var(--space-3)",
                    borderRadius: "var(--radius-md)",
                    cursor: "pointer",
                    marginBottom: "var(--space-1)",
                    backgroundColor: activeSessionId === s.id ? "var(--color-bg-accent-muted)" : "transparent",
                    border: activeSessionId === s.id ? "1px solid var(--color-border-accent)" : "1px solid transparent",
                    transition: "background-color 0.15s"
                  }}
                  onMouseOver={e => { if (activeSessionId !== s.id) e.currentTarget.style.backgroundColor = "var(--color-bg-neutral-muted)"; }}
                  onMouseOut={e => { if (activeSessionId !== s.id) e.currentTarget.style.backgroundColor = "transparent"; }}
                >
                  <div style={{
                    fontSize: "var(--text-sm)",
                    color: "var(--color-fg-default)",
                    fontWeight: activeSessionId === s.id ? 600 : 400,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    marginBottom: "2px"
                  }}>
                    {s.messages?.[0]?.content?.slice(0, 30) || "Empty chat"}
                  </div>
                  <div style={{
                    fontSize: "var(--text-xs)",
                    color: "var(--color-fg-muted)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}>
                    <span>{s.messageCount || 0} msgs</span>
                    <span>{s.createdAt ? new Date(s.createdAt).toLocaleDateString() : ""}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Main Chat Area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%" }}>
          <header style={{ 
            padding: "var(--space-3) var(--space-4)", 
            borderBottom: "var(--border-thin) solid var(--color-border-default)",
            backgroundColor: "var(--color-bg-muted)",
            display: "flex", justifyContent: "space-between", alignItems: "center"
          }}>
            <strong style={{ fontSize: "var(--text-md)", color: "var(--color-fg-default)" }}>ImagineHack 2026 Chat</strong>
            {activeSessionId && (
              <button
                onClick={() => deleteSession(activeSessionId)}
                style={{
                  background: "none",
                  border: "1px solid var(--color-border-danger)",
                  color: "var(--color-fg-danger)",
                  borderRadius: "var(--radius-md)",
                  padding: "var(--space-1) var(--space-2)",
                  fontSize: "var(--text-xs)",
                  cursor: "pointer"
                }}
              >
                Delete session
              </button>
            )}
          </header>

          <div style={{ flex: 1, overflowY: "auto", padding: "var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: "center", color: "var(--color-fg-muted)", marginTop: "auto", marginBottom: "auto" }}>
                <p>Welcome! Ask anything or upload a file to get started.</p>
              </div>
            ) : (
              messages.map((m, idx) => (
                <div key={idx} style={{ 
                  display: "flex", 
                  flexDirection: m.role === "user" ? "row-reverse" : "row",
                  gap: "var(--space-3)" 
                }}>
                  <div style={{ 
                    maxWidth: "80%",
                    padding: "var(--space-3)",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: m.role === "user" ? "var(--color-bg-neutral)" : "transparent",
                    border: m.role === "assistant" ? "none" : "1px solid var(--color-border-default)",
                    color: "var(--color-fg-default)",
                    fontSize: "var(--text-md)"
                  }}>
                    {m.filePreview && <p style={{fontSize: "var(--text-sm)", color: "var(--color-fg-muted)", marginBottom: "var(--space-2)"}}>📎 {m.fileName}</p>}
                    <div dangerouslySetInnerHTML={{ __html: renderMarkdown(m.content) }} />
                  </div>
                </div>
              ))
            )}
            {isLoading && <div style={{ color: "var(--color-fg-muted)", fontSize: "var(--text-sm)" }}>Thinking...</div>}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{ padding: "var(--space-4)", borderTop: "var(--border-thin) solid var(--color-border-default)" }}>
            <form onSubmit={sendMessage} style={{ 
              display: "flex", gap: "var(--space-2)", 
              border: "var(--border-thin) solid var(--color-border-default)", 
              borderRadius: "var(--radius-md)", 
              padding: "var(--space-2)",
              backgroundColor: "var(--color-bg-default)",
              alignItems: "flex-end"
            }}>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: "none" }} />
              <button type="button" onClick={() => fileInputRef.current.click()} style={{
                background: "none", border: "none", cursor: "pointer", padding: "var(--space-2)", alignSelf: "center", fontSize: "16px"
              }}>
                📎
              </button>
              
              <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                {filePreview && (
                  <div style={{ fontSize: "var(--text-sm)", color: "var(--color-fg-accent)", marginBottom: "var(--space-2)" }}>
                    {uploadedFile.name} <button type="button" onClick={() => setFilePreview(null)} style={{background:"none",border:"none",color:"var(--color-fg-danger)",cursor:"pointer"}}>x</button>
                  </div>
                )}
                <textarea 
                  ref={textareaRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything or search..."
                  style={{
                    width: "100%", border: "none", outline: "none", resize: "none",
                    maxHeight: "150px", fontSize: "var(--text-md)", backgroundColor: "transparent",
                    color: "var(--color-fg-default)", fontFamily: "inherit"
                  }}
                  rows={1}
                />
              </div>

              <button type="submit" disabled={isLoading} style={{
                backgroundColor: "var(--color-bg-primary)", color: "var(--color-fg-on-emphasis)",
                border: "none", borderRadius: "var(--radius-md)", padding: "var(--space-1) var(--space-3)", cursor: "pointer", fontWeight: "var(--weight-medium)",
                alignSelf: "center"
              }}>
                Send
              </button>
            </form>
          </div>
        </div>

      </div>

    </Layout>
  );
}
