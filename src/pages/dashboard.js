import { useState, useCallback, useRef } from "react";
import { useState, useRef, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";

export default function Dashboard() {
  // Mock data for repositories/clients
  const [repos, setRepos] = useState([
    { id: 1, name: "AcmeCorp/estate-plan", type: "Private", lastActive: "2h ago" },
    { id: 2, name: "Globex/wealth-trust", type: "Public", lastActive: "5h ago" },
    { id: 3, name: "SmithFamily/will-draft", type: "Private", lastActive: "1d ago" },
    { id: 4, name: "WayneEnterprises/succession", type: "Private", lastActive: "2d ago" },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newRepoName, setNewRepoName] = useState("");

  const handleCreateRepo = (e) => {
    e.preventDefault();
    if (!newRepoName.trim()) return;
    
    setRepos([
      {
        id: Date.now(),
        name: newRepoName.trim(),
        type: "Private",
        lastActive: "Just now",
      },
      ...repos,
    ]);
    setNewRepoName("");
    setIsCreatingNew(false);
  };

  const filteredRepos = repos.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Mock data for feed
  const feedItems = [
    {
      id: 1,
      repo: "AcmeCorp/estate-plan",
      title: "Updated Living Trust Document",
      description: "Added new clauses regarding digital assets and cryptocurrency holdings.",
      time: "2 hours ago",
      tags: ["Draft", "Legal"],
    },
    {
      id: 2,
      repo: "WayneEnterprises/succession",
      title: "Board Meeting Notes Uploaded",
      description: "Summary of succession planning decisions from Q3 board meeting.",
      time: "Yesterday",
      tags: ["Corporate"],
    },
  ];

  // Mock data for calendar meetings
  const meetings = [
    { id: 1, time: "10:00 AM", client: "Bruce Wayne", title: "Succession Review", type: "Zoom" },
    { id: 2, time: "01:30 PM", client: "John Smith", title: "Will Signing", type: "In-person" },
    { id: 3, time: "04:00 PM", client: "Acme Corp Board", title: "Quarterly Estate Update", type: "Teams" },
  ];

  return (
    <aside className="hidden md:block w-[280px] shrink-0 sticky top-[45px] h-[calc(100vh-45px)] overflow-y-auto pb-8 text-sm bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-gray-900 font-semibold text-[13px] tracking-wide">Top repositories</h2>
        <button
          onClick={() => setIsCreatingNew(!isCreatingNew)}
          className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-2.5 py-1 rounded-md transition-colors"
        >
          <Book size={12} />
          New
        </button>
      </div>

      {/* Search */}
      <div className="mb-3">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Find a repository…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-300 text-gray-900 rounded-md pl-8 pr-3 py-1.5 text-[13px] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Create new form */}
      {isCreatingNew && (
        <form onSubmit={onCreateRepo} className="mb-3 flex flex-col gap-2 p-3 bg-gray-50 border border-gray-200 rounded-md">
          <input
            type="text"
            autoFocus
            placeholder="Repository name…"
            value={newRepoName}
            onChange={(e) => setNewRepoName(e.target.value)}
            className="w-full bg-white border border-gray-300 text-gray-900 rounded-md px-3 py-1.5 text-[13px] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
          <div className="flex gap-2">
            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-3 py-1.5 rounded-md transition-colors">
              Create
            </button>
            <button type="button" onClick={() => setIsCreatingNew(false)} className="bg-white hover:bg-gray-50 text-gray-600 text-xs font-semibold px-3 py-1.5 rounded-md border border-gray-300 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Repo list */}
      <ul className="flex flex-col gap-0.5">
        {visibleRepos.map((repo) => {
          const urlSafeName = repo.name.replace("/", "_");
          const av = avatarColor(repo.name);
          const init = clientInitial(repo.name);
          return (
            <li key={repo.id}>
              <Link
                href={`/client/${urlSafeName}`}
                className="flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-gray-100 transition-colors group"
              >
                <span
                  className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center text-[9px] font-bold"
                  style={{ background: av.bg, color: av.text }}
                >
                  {init}
                </span>
                <span className="text-gray-700 font-medium group-hover:text-blue-600 truncate text-[13px]">
                  {repo.name}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      {hasMore && (
        <button
          onClick={() => setShowAll(true)}
          className="mt-2 ml-1 text-gray-500 hover:text-blue-600 text-xs font-medium transition-colors"
        >
          Show {repos.length - INITIAL_VISIBLE} more →
        </button>
      )}
    </aside>
  );
}

// ── ActivityCard ─────────────────────────────────────────────────────────────
function ActivityCard({ item }) {
  const urlSafeName = item.actor.replace("/", "_");
  const av = avatarColor(item.actor);
  const init = clientInitial(item.actor);

  return (
    <Link
      href={`/client/${urlSafeName}`}
      className="block bg-white border border-gray-200 rounded-lg p-4 no-underline hover:border-blue-300 hover:shadow-md transition-all duration-150 group"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)" }}
    >
      {/* Actor row */}
      <div className="flex items-center gap-2.5 mb-3">
        <span
          className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
          style={{ background: av.bg, color: av.text }}
        >
          {init}
        </span>
        <span className="text-[13px] font-semibold text-gray-500 group-hover:text-blue-600 transition-colors">
          {item.actor}
        </span>
        <ExternalLink size={12} className="ml-auto text-gray-300 group-hover:text-blue-400 flex-shrink-0 transition-colors" />
      </div>

      {/* Title + description */}
      <h3 className="text-[15px] font-semibold text-gray-900 mb-1 leading-snug">{item.title}</h3>
      <p className="text-[13px] text-gray-500 leading-relaxed mb-3">{item.description}</p>

      {/* Tags + time */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 flex-wrap">
          {item.tags.map((tag) => {
            const s = TAG_STYLES[tag] ?? TAG_DEFAULT;
            return (
              <span
                key={tag}
                className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}
              >
                {tag}
              </span>
            );
          })}
        </div>
        <span className="text-gray-400 text-[12px] flex-shrink-0 ml-3">{item.time}</span>
      </div>
    </Link>
  );
}

// ── Feed ─────────────────────────────────────────────────────────────────────
function Feed({ activity }) {
  const [query, setQuery]               = useState("");
  const [scope, setScope]               = useState("all");
  const [showScopeMenu, setShowScopeMenu] = useState(false);
  const [messages, setMessages]         = useState([]);
  const [sessionId, setSessionId]       = useState(null);
  const [isLoading, setIsLoading]       = useState(false);
  const messagesContainerRef = useRef(null);
  const inputRef             = useRef(null);

  const scopeLabel = SCOPE_OPTIONS.find((o) => o.value === scope)?.label ?? "All clients";

  useEffect(() => {
    const el = messagesContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isLoading]);

  const sendMessage = async (text = query) => {
    const q = text.trim();
    if (!q || isLoading) return;
    setQuery("");
    const userMsg = { role: "user", content: q };
    const next = [...messages, userMsg];
    setMessages(next);
    setIsLoading(true);
    try {
      const res = await fetch("/api/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: q,
          sessionId: sessionId || undefined,
          clientId: scope !== "all" ? scope : undefined,
          topK: 5,
          threshold: 0.25,
        }),
      });
      const data = await res.json();
      if (data.sessionId) setSessionId(data.sessionId);
      setMessages([...next, {
        role: "assistant",
        content: data.reply || "No response received.",
        sources: data.sources,
        relevantClients: data.relevantClients,
      }]);
    } catch {
      setMessages([...next, { role: "assistant", content: "Something went wrong. Please try again." }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const clearChat = () => { setMessages([]); setSessionId(null); };

  const canSend = query.trim().length > 0 && !isLoading;

  return (
    <main className="flex-1 w-full max-w-[800px]">
      <h1 className="text-2xl font-semibold text-gray-900 mb-5 tracking-tight">Home</h1>

      {/* ── IntelliBot inline chat ── */}
      <div className="bg-white border border-gray-200 rounded-xl mb-6 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)" }}>

        {/* Messages */}
        {messages.length > 0 && (
          <div
            ref={messagesContainerRef}
            className="max-h-[340px] overflow-y-auto p-4 border-b border-gray-100 flex flex-col gap-3"
          >
            {messages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                <div className={`max-w-[80%] px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-xl rounded-br-sm"
                    : "bg-[#f0f2f4] text-gray-900 rounded-xl rounded-bl-sm border border-gray-200"
                }`}>
                  {msg.content}
                </div>
                {msg.role === "assistant" && (
                  <div className="w-full mt-1">
                    <ClientCardSection
                      text={msg.content}
                      relevantClients={msg.relevantClients}
                      sources={msg.sources}
                      compact={true}
                    />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[#f0f2f4] border border-gray-200 rounded-xl rounded-bl-sm px-4 py-2.5 flex gap-1.5 items-center">
                  {[0, 1, 2].map((d) => (
                    <span
                      key={d}
                      style={{ animationDelay: `${d * 0.18}s` }}
                      className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Input area */}
        <div className="p-4">
          <div className="flex items-start gap-2 mb-3">
            <textarea
              ref={inputRef}
              rows={1}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={messages.length === 0
                ? "Ask anything about your clients or type @ to add context"
                : "Follow up…"}
              className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-400 resize-none text-[15px] leading-snug"
              style={{ minHeight: "28px", maxHeight: "96px" }}
            />
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="text-gray-400 hover:text-red-500 text-xs font-medium transition-colors shrink-0 mt-0.5"
              >
                Clear
              </button>
            )}
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Scope selector */}
              <div className="relative">
                <button
                  onClick={() => setShowScopeMenu((v) => !v)}
                  className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors"
                >
                  <Users size={13} />
                  <span>{scopeLabel}</span>
                  <ChevronDown size={12} />
                </button>
                {showScopeMenu && (
                  <div className="absolute left-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-lg py-1 min-w-[200px]" style={{ boxShadow: "0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -1px rgba(0,0,0,0.06)" }}>
                    {SCOPE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { setScope(opt.value); setShowScopeMenu(false); }}
                        className={`w-full text-left px-3 py-1.5 text-[13px] transition-colors ${
                          scope === opt.value
                            ? "bg-blue-50 text-blue-700 font-semibold"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button className="text-gray-400 hover:text-gray-600 p-1.5 border border-transparent hover:border-gray-200 rounded-md transition-colors">
                <Plus size={15} />
              </button>
            </div>
            
            <div className="quick-actions">
              <button className="quick-btn">🤖 Agent</button>
              <button className="quick-btn">⊙ Create issue</button>
              <button className="quick-btn">✨ Spark</button>
              <button className="quick-btn">🌿 Git ▾</button>
              <button className="quick-btn">⑂ Pull requests ▾</button>
            </div>
          </div>

          {/* Quick action chips */}
          <div className="flex items-center gap-1.5 mt-3 flex-wrap">
            {[
              { icon: Search,        label: "Client summary",  color: "text-blue-600",   prompt: "Summarise the latest activity across all clients" },
              { icon: FileText,      label: "Pending reviews", color: "text-gray-600",   prompt: "Which clients have pending document reviews or expiring policies?" },
              { icon: AlertTriangle, label: "Risk flags",      color: "text-amber-600",  prompt: "Which clients have high financial risk exposure or flagged concerns?" },
              { icon: Calendar,      label: "Milestones",      color: "text-green-600",  prompt: "List clients with upcoming estate or retirement milestones" },
              { icon: Users,         label: "Prioritise",      color: "text-purple-600", prompt: "Which clients should I prioritise contacting this week?" },
            ].map(({ icon: Icon, label, color, prompt }) => (
              <button
                key={label}
                onClick={() => sendMessage(prompt)}
                className={`flex items-center gap-1.5 ${color} bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-full px-2.5 py-1 text-[12px] font-medium transition-colors`}
              >
                <Icon size={12} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

            <div className="feed-list">
              <div className="feed-category-title">
                📈 Recent client activity
              </div>
              
              {feedItems.map((item) => {
                const urlSafeName = item.repo.replace("/", "_");
                return (
                  <div key={item.id} className="feed-card">
                    <div className="feed-card-header">
                      <div className="repo-avatar small"></div>
                      <Link href={`/client/${urlSafeName}`} className="feed-repo-name">
                        {item.repo}
                      </Link>
                    </div>
                    <p className="feed-card-title">{item.title}</p>
                    <p className="feed-card-desc">{item.description}</p>
                    <div className="feed-card-footer">
                      <div className="feed-tags">
                        {item.tags.map(t => <span key={t} className="feed-tag">{t}</span>)}
                      </div>
                      <span className="feed-time">{item.time}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>

        {/* ── RIGHT SIDEBAR (CALENDAR) ── */}
        <aside className="sidebar-right">
          <div className="calendar-widget">
            <div className="calendar-header">
              <h3 className="calendar-title">Today's Schedule</h3>
              <span className="current-date">
                {new Date().toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
            </div>

            <div className="meeting-list">
              {meetings.map((m) => (
                <div key={m.id} className="meeting-item">
                  <div className="meeting-time">
                    <span className="time-text">{m.time.split(" ")[0]}</span>
                    <span className="time-ampm">{m.time.split(" ")[1]}</span>
                  </div>
                  <div className="meeting-details">
                    <p className="meeting-title">{m.title}</p>
                    <p className="meeting-client">👤 {m.client}</p>
                    <span className="meeting-type">{m.type}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="view-calendar-btn">Open full calendar</button>
          </div>

          <div className="promo-card">
            <h4>Client Portal Analytics</h4>
            <p>3 clients viewed their estate plans today.</p>
            <a href="#">View report →</a>
          </div>
        </aside>
      </div>

      <style jsx>{`
        .dashboard-root {
          min-height: 100vh;
          background-color: #f6f8fa;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
          color: #1F2328;
        }

        .dashboard-container {
          max-width: 1400px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 296px 1fr 320px;
          gap: 24px;
          padding: 24px;
        }

        /* BUTTONS & INPUTS */
        .btn-primary {
          background-color: #1f883d;
          color: #ffffff;
          border: 1px solid rgba(31, 35, 40, 0.15);
          border-radius: 6px;
          padding: 5px 12px;
          font-size: 14px;
          font-weight: 600;
          line-height: 20px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 1px 0 rgba(27, 31, 36, 0.1);
        }
        .btn-primary:hover {
          background-color: #1a7f37;
        }

        .btn-secondary {
          background-color: #f6f8fa;
          color: #24292f;
          border: 1px solid rgba(31, 35, 40, 0.15);
          border-radius: 6px;
          padding: 5px 12px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
        }
        .btn-secondary:hover {
          background-color: #f3f4f6;
        }

        .btn-small {
          padding: 3px 8px;
          font-size: 12px;
        }

        /* ── LEFT SIDEBAR ── */
        .sidebar-left {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .repo-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .repo-title {
          font-size: 16px;
          font-weight: 600;
          margin: 0;
        }

        .repo-search-input, .new-repo-input {
          width: 100%;
          padding: 5px 12px;
          font-size: 14px;
          line-height: 20px;
          color: #1f2328;
          background-color: #ffffff;
          border: 1px solid #d0d7de;
          border-radius: 6px;
          box-shadow: inset 0 1px 0 rgba(208, 215, 222, 0.2);
        }
        .repo-search-input:focus, .new-repo-input:focus {
          border-color: #0969da;
          outline: none;
          box-shadow: inset 0 0 0 1px #0969da;
        }

        .new-repo-form {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 12px;
          background: #ffffff;
          border: 1px solid #d0d7de;
          border-radius: 6px;
        }
        .new-repo-actions {
          display: flex;
          gap: 8px;
        }

        .repo-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .repo-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .repo-avatar {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background-color: #d0d7de;
        }
        .repo-avatar.small {
          width: 14px;
          height: 14px;
        }
        
        .repo-link {
          font-size: 14px;
          font-weight: 600;
          color: #1f2328;
          text-decoration: none;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .repo-link:hover {
          color: #0969da;
          text-decoration: underline;
        }

        .show-more-btn {
          background: none;
          border: none;
          color: #656d76;
          font-size: 12px;
          text-align: left;
          padding: 0;
          cursor: pointer;
        }
        .show-more-btn:hover {
          color: #0969da;
        }

        /* ── MAIN CONTENT ── */
        .main-content {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        
        .page-title {
          font-size: 20px;
          font-weight: 600;
          margin: 0;
        }

        .copilot-input-box {
          background: #ffffff;
          border: 1px solid #d0d7de;
          border-radius: 6px;
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          box-shadow: 0 1px 3px rgba(31,35,40,0.04);
        }

        .copilot-input {
          width: 100%;
          border: none;
          font-size: 16px;
          padding: 8px;
          color: #1f2328;
          outline: none;
        }
        .copilot-input::placeholder {
          color: #656d76;
        }

        .input-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 4px;
        }
        .action-group {
          display: flex;
          gap: 6px;
          align-items: center;
        }
        .action-btn {
          background: #ffffff;
          border: 1px solid #d0d7de;
          color: #24292f;
          padding: 4px 10px;
          font-size: 12px;
          font-weight: 500;
          border-radius: 20px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .action-btn:hover {
          background: #f3f4f6;
        }
        .action-btn.icon-only {
          padding: 4px 8px;
          border-radius: 50%;
        }

        .submit-btn {
          background: transparent;
          border: none;
          font-size: 16px;
          cursor: pointer;
          color: #656d76;
        }

        .quick-actions {
          display: flex;
          gap: 8px;
          margin-top: 4px;
          padding: 0 4px 4px;
          flex-wrap: wrap;
        }
        .quick-btn {
          background: #f6f8fa;
          border: 1px solid transparent;
          color: #24292f;
          padding: 4px 12px;
          font-size: 13px;
          font-weight: 500;
          border-radius: 20px;
          cursor: pointer;
        }
        .quick-btn:hover {
          background: #eaeef2;
        }

        .feed-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .feed-title {
          font-size: 16px;
          font-weight: 600;
          margin: 0;
        }
        .filter-btn {
          background: #f6f8fa;
          border: 1px solid #d0d7de;
          border-radius: 6px;
          padding: 4px 12px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }

        .feed-category-title {
          font-size: 14px;
          color: #656d76;
          margin-bottom: 12px;
        }

        .feed-card {
          background: #ffffff;
          border: 1px solid #d0d7de;
          border-radius: 6px;
          padding: 16px;
          margin-bottom: 16px;
        }
        .feed-card-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }
        .feed-repo-name {
          font-size: 14px;
          font-weight: 600;
          color: #656d76;
          text-decoration: none;
        }
        .feed-card-title {
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 4px;
        }
        .feed-card-desc {
          font-size: 14px;
          color: #1f2328;
          margin: 0 0 16px;
        }
        .feed-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .feed-tags {
          display: flex;
          gap: 8px;
        }
        .feed-tag {
          font-size: 12px;
          color: #656d76;
          background: #f6f8fa;
          padding: 2px 8px;
          border-radius: 12px;
          border: 1px solid #d0d7de;
        }
        .feed-time {
          font-size: 12px;
          color: #656d76;
        }

        /* ── RIGHT SIDEBAR (CALENDAR) ── */
        .sidebar-right {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .calendar-widget {
          background: #ffffff;
          border: 1px solid #d0d7de;
          border-radius: 6px;
          padding: 16px;
          box-shadow: 0 1px 3px rgba(31,35,40,0.04);
        }
        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 16px;
          border-bottom: 1px solid #eaeef2;
          padding-bottom: 12px;
        }
        .calendar-title {
          font-size: 14px;
          font-weight: 600;
          margin: 0;
        }
        .current-date {
          font-size: 12px;
          color: #656d76;
          font-weight: 500;
        }

        .meeting-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .meeting-item {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }
        .meeting-time {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          min-width: 55px;
        }
        .time-text {
          font-size: 14px;
          font-weight: 600;
          color: #1f2328;
        }
        .time-ampm {
          font-size: 11px;
          color: #656d76;
          font-weight: 500;
        }

        .meeting-details {
          flex: 1;
          background: #f6f8fa;
          padding: 10px 12px;
          border-radius: 6px;
          border-left: 3px solid #0969da;
        }
        .meeting-title {
          font-size: 14px;
          font-weight: 600;
          margin: 0 0 4px;
          color: #1f2328;
        }
        .meeting-client {
          font-size: 12px;
          color: #656d76;
          margin: 0 0 6px;
        }
        .meeting-type {
          display: inline-block;
          font-size: 10px;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 12px;
          background: #ddf4ff;
          color: #0969da;
          text-transform: uppercase;
        }

        .view-calendar-btn {
          width: 100%;
          margin-top: 16px;
          background: transparent;
          border: 1px solid #d0d7de;
          color: #24292f;
          padding: 6px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
        }
        .view-calendar-btn:hover {
          background: #f3f4f6;
        }

        .promo-card {
          background: #ffffff;
          border: 1px solid #d0d7de;
          border-radius: 6px;
          padding: 16px;
          box-shadow: 0 1px 3px rgba(31,35,40,0.04);
        }
        .promo-card h4 {
          margin: 0 0 8px;
          font-size: 14px;
        }
        .promo-card p {
          font-size: 12px;
          color: #656d76;
          margin: 0 0 12px;
        }
        .promo-card a {
          font-size: 12px;
          color: #0969da;
          text-decoration: none;
          font-weight: 500;
        }
        .promo-card a:hover {
          text-decoration: underline;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .dashboard-container {
            grid-template-columns: 240px 1fr;
          }
          .sidebar-right {
            grid-column: 1 / -1;
            display: grid;
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 768px) {
          .dashboard-container {
            grid-template-columns: 1fr;
          }
          .sidebar-left, .sidebar-right {
            display: none; /* simple mobile hide for now */
          }
        }
      `}</style>
    </div>
  );
}
