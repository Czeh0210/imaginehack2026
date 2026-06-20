import { useState, useRef, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import TopNav from "@/components/TopNav";
import { ClientCardSection } from "@/components/ui/ClientCard";
import {
  Plus,
  ChevronDown,
  Book,
  History,
  MoreHorizontal,
  User,
  Search,
  FileText,
  AlertTriangle,
  Calendar,
  Users,
  ArrowUp,
  ExternalLink,
} from "lucide-react";

// ── Design tokens ────────────────────────────────────────────────────────────
const TAG_STYLES = {
  Risk:       { bg: "#fffbeb", text: "#d97706", border: "#fde68a" },
  FIRE:       { bg: "#fffbeb", text: "#d97706", border: "#fde68a" },
  Draft:      { bg: "#f3f4f6", text: "#6b7280", border: "#e5e7eb" },
  Legal:      { bg: "#eff6ff", text: "#2563eb", border: "#bfdbfe" },
  Corporate:  { bg: "#f3f4f6", text: "#6b7280", border: "#e5e7eb" },
  Portfolio:  { bg: "#eff6ff", text: "#2563eb", border: "#bfdbfe" },
  Estate:     { bg: "#f5f3ff", text: "#7c3aed", border: "#ddd6fe" },
  Education:  { bg: "#ecfdf5", text: "#16a34a", border: "#bbf7d0" },
  Planning:   { bg: "#ecfdf5", text: "#16a34a", border: "#bbf7d0" },
  Retirement: { bg: "#ecfdf5", text: "#16a34a", border: "#bbf7d0" },
  Insurance:  { bg: "#eff6ff", text: "#2563eb", border: "#bfdbfe" },
};
const TAG_DEFAULT = { bg: "#f3f4f6", text: "#6b7280", border: "#e5e7eb" };

const AVATAR_PALETTE = [
  { bg: "#dbeafe", text: "#1d4ed8" },
  { bg: "#dcfce7", text: "#15803d" },
  { bg: "#fef3c7", text: "#b45309" },
  { bg: "#ede9fe", text: "#7c3aed" },
  { bg: "#fce7f3", text: "#be185d" },
  { bg: "#ffedd5", text: "#c2410c" },
];

function avatarColor(name = "") {
  return AVATAR_PALETTE[(name.charCodeAt(0) || 0) % AVATAR_PALETTE.length];
}

function clientInitial(actor = "") {
  return actor.split("/")[1]?.[0]?.toUpperCase() ?? "?";
}

// ── Data ─────────────────────────────────────────────────────────────────────
const TOP_REPOSITORIES = [
  { id: 1,  name: "AcmeCorp/estate-plan" },
  { id: 2,  name: "Globex/wealth-trust" },
  { id: 3,  name: "SmithFamily/will-draft" },
  { id: 4,  name: "WayneEnterprises/succession" },
  { id: 5,  name: "LimWeiMing/retirement-plan" },
  { id: 6,  name: "SarahTan/portfolio-growth" },
  { id: 7,  name: "AhmadRazif/education-trust" },
  { id: 8,  name: "JenniferKoh/family-estate" },
  { id: 9,  name: "DavidNg/fire-strategy" },
  { id: 10, name: "RosnahYusof/income-plan" },
];

const INITIAL_VISIBLE = 6;

const ADVISOR_ACTIVITY = [
  {
    id: 1,
    actor: "AcmeCorp/estate-plan",
    title: "Living Trust Document Updated",
    description: "Added new clauses on digital assets and cryptocurrency holdings. Pending legal sign-off.",
    tags: ["Draft", "Legal"],
    time: "2 hours ago",
  },
  {
    id: 2,
    actor: "WayneEnterprises/succession",
    title: "Board Meeting Notes Uploaded",
    description: "Summary of succession planning decisions from Q3 board meeting. Next review: Dec 2026.",
    tags: ["Corporate"],
    time: "5 hours ago",
  },
  {
    id: 3,
    actor: "Globex/wealth-trust",
    title: "Portfolio Risk Profile Revised",
    description: "Equity allocation increased from 60% to 75% following RM 2.4M liquidity event from tech exit.",
    tags: ["Portfolio", "Risk"],
    time: "Yesterday",
  },
  {
    id: 4,
    actor: "SmithFamily/will-draft",
    title: "Children's Trust Fund Executed",
    description: "Trust deed signed for two beneficiaries (ages 8 and 11). Initial contribution of RM 500,000.",
    tags: ["Legal", "Estate"],
    time: "2 days ago",
  },
  {
    id: 5,
    actor: "AhmadRazif/education-trust",
    title: "Education Fund Shortfall Identified",
    description: "Revised university projections for 2027 and 2029 intakes. Funding gap of RM 80,000 flagged for top-up.",
    tags: ["Education", "Planning"],
    time: "3 days ago",
  },
  {
    id: 6,
    actor: "RosnahYusof/income-plan",
    title: "Retirement Income Strategy Drafted",
    description: "EPF drawdown schedule combined with dividend income targeting RM 8,000/month post-retirement.",
    tags: ["Retirement", "Draft"],
    time: "4 days ago",
  },
  {
    id: 7,
    actor: "LimWeiMing/retirement-plan",
    title: "Annual Policy Review Completed",
    description: "Term life and critical illness coverage reviewed. Recommended increasing CI sum assured to RM 1M.",
    tags: ["Insurance"],
    time: "5 days ago",
  },
  {
    id: 8,
    actor: "DavidNg/fire-strategy",
    title: "FIRE Strategy Projection Updated",
    description: "Monte Carlo simulation run at 4% withdrawal rate. 92% success probability over 30-year horizon.",
    tags: ["FIRE", "Portfolio"],
    time: "6 days ago",
  },
];

const SCHEDULE = [
  { time: "10:00 AM", title: "FIRE Strategy Review",  client: "DavidNg/fire-strategy",      type: "ZOOM"      },
  { time: "01:30 PM", title: "Trust Fund Signing",    client: "SmithFamily/will-draft",      type: "IN-PERSON" },
  { time: "04:00 PM", title: "Estate Exit Update",    client: "LimWeiMing/retirement-plan",  type: "TEAMS"     },
];

const SCOPE_OPTIONS = [
  { value: "all",               label: "All clients" },
  { value: "acmecorp",          label: "AcmeCorp / estate-plan" },
  { value: "globex",            label: "Globex / wealth-trust" },
  { value: "smithfamily",       label: "SmithFamily / will-draft" },
  { value: "wayneenterprises",  label: "WayneEnterprises / succession" },
  { value: "limweiming",        label: "LimWeiMing / retirement-plan" },
  { value: "sarahtan",          label: "SarahTan / portfolio-growth" },
  { value: "ahmadrazif",        label: "AhmadRazif / education-trust" },
  { value: "jenniferkoh",       label: "JenniferKoh / family-estate" },
  { value: "davidng",           label: "DavidNg / fire-strategy" },
  { value: "rosnahyusof",       label: "RosnahYusof / income-plan" },
];

const TYPE_STYLES = {
  ZOOM:        { bg: "#ddf4ff", text: "#0969da", border: "#b6e3ff", dot: "#0969da" },
  "IN-PERSON": { bg: "#dafbe1", text: "#1a7f37", border: "#aceebb", dot: "#1a7f37" },
  TEAMS:       { bg: "#fff8c5", text: "#9a6700", border: "#f0d800", dot: "#9a6700" },
};

// ── LeftSidebar ───────────────────────────────────────────────────────────────
function LeftSidebar({ repos, searchQuery, setSearchQuery, isCreatingNew, setIsCreatingNew, newRepoName, setNewRepoName, onCreateRepo }) {
  const [showAll, setShowAll] = useState(false);
  const isSearching = searchQuery.trim().length > 0;
  const visibleRepos = isSearching || showAll ? repos : repos.slice(0, INITIAL_VISIBLE);
  const hasMore = !isSearching && repos.length > INITIAL_VISIBLE;

  return (
    <aside className="hidden md:block w-[280px] shrink-0 sticky top-[45px] h-[calc(100vh-45px)] overflow-y-auto pb-8 text-sm bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
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

// ── ActivityCard ──────────────────────────────────────────────────────────────
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

      <h3 className="text-[15px] font-semibold text-gray-900 mb-1 leading-snug">{item.title}</h3>
      <p className="text-[13px] text-gray-500 leading-relaxed mb-3">{item.description}</p>

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

// ── Feed ──────────────────────────────────────────────────────────────────────
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

      {/* Search */}
      <div
        className="bg-white border border-gray-200 rounded-xl mb-6 overflow-hidden"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)" }}
      >
        {messages.length > 0 && (
          <div
            ref={messagesContainerRef}
            className="max-h-[340px] overflow-y-auto p-4 border-b border-gray-100 flex flex-col gap-3"
          >
            {messages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                <div className={`max-w-[80%] px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-[#0FBF3E] text-white rounded-xl rounded-br-sm"
                    : "bg-[#F2F5F3] text-gray-900 rounded-xl rounded-bl-sm border border-[#E4EBE6]"
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
                <div className="bg-[#F2F5F3] border border-[#E4EBE6] rounded-xl rounded-bl-sm px-4 py-2.5 flex gap-1.5 items-center">
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

          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
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
                  <div
                    className="absolute left-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-lg py-1 min-w-[200px]"
                    style={{ boxShadow: "0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -1px rgba(0,0,0,0.06)" }}
                  >
                    {SCOPE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { setScope(opt.value); setShowScopeMenu(false); }}
                        className={`w-full text-left px-3 py-1.5 text-[13px] transition-colors ${
                          scope === opt.value
                            ? "bg-[#BFFFD1] text-[#08872B] font-semibold"
                            : "text-gray-700 hover:bg-[#F2F5F3]"
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

            <button
              onClick={() => sendMessage()}
              disabled={!canSend}
              className="flex items-center justify-center rounded-lg p-1.5 transition-colors"
              style={{
                background: canSend ? "#0FBF3E" : "#E4EBE6",
                color: canSend ? "#ffffff" : "#909692",
                cursor: canSend ? "pointer" : "not-allowed",
              }}
            >
              <ArrowUp size={16} />
            </button>
          </div>

          {/* Quick action chips */}
          <div className="flex items-center gap-1.5 mt-3 flex-wrap">
            {[
              { icon: Search,        label: "Client summary",  prompt: "Summarise the latest activity across all clients" },
              { icon: FileText,      label: "Pending reviews", prompt: "Which clients have pending document reviews or expiring policies?" },
              { icon: AlertTriangle, label: "Risk flags",      prompt: "Which clients have high financial risk exposure or flagged concerns?" },
              { icon: Calendar,      label: "Milestones",      prompt: "List clients with upcoming estate or retirement milestones" },
              { icon: Users,         label: "Prioritise",      prompt: "Which clients should I prioritise contacting this week?" },
            ].map(({ icon: Icon, label, prompt }) => (
              <button
                key={label}
                onClick={() => sendMessage(prompt)}
                className="flex items-center gap-1.5 text-[#909692] bg-white hover:bg-[#F2F5F3] hover:text-[#0FBF3E] border border-[#E4EBE6] hover:border-[#0FBF3E] rounded-full px-2.5 py-1 text-[12px] font-medium transition-colors"
              >
                <Icon size={12} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Feed header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-gray-900">Feed</h2>
          <span className="flex items-center gap-1 text-gray-400 text-[13px]">
            <History size={13} />
            Recent activity
          </span>
        </div>
        <button
          className="flex items-center gap-1 bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors"
          style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}
        >
          <MoreHorizontal size={14} /> Filter
        </button>
      </div>

      <div className="flex flex-col gap-3 pb-8">
        {activity.map((item) => (
          <ActivityCard key={item.id} item={item} />
        ))}
      </div>
    </main>
  );
}

// ── RightSidebar ──────────────────────────────────────────────────────────────
function RightSidebar({ schedule }) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <aside className="hidden lg:flex flex-col gap-4 w-[300px] shrink-0 sticky top-[45px] h-[calc(100vh-45px)] overflow-y-auto pl-2 text-sm">

      {/* Today's Schedule */}
      <div
        className="bg-white border border-gray-200 rounded-xl p-5"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)" }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-gray-900 font-semibold text-[14px]">Today&apos;s Schedule</h2>
          <span className="text-gray-400 text-[12px] font-medium">{today}</span>
        </div>

        <div className="relative">
          <div style={{ position: "absolute", left: "7px", top: "10px", bottom: "10px", width: "1.5px", background: "#e5e7eb", borderRadius: "2px" }} />
          <div className="flex flex-col gap-5">
            {schedule.map((item, idx) => {
              const s = TYPE_STYLES[item.type] ?? TYPE_STYLES.ZOOM;
              return (
                <div key={idx} className="flex gap-3.5 relative">
                  <div style={{
                    flexShrink: 0,
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: "#fff",
                    border: `2.5px solid ${s.dot}`,
                    boxShadow: `0 0 0 3px ${s.bg}`,
                    marginTop: "2px",
                    zIndex: 1,
                  }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] text-gray-400 font-medium mb-1">{item.time}</div>
                    <div className="font-semibold text-gray-900 text-[13.5px] mb-1 leading-snug">{item.title}</div>
                    <div className="flex items-center gap-1 text-gray-400 text-[12px] mb-2">
                      <User size={11} className="flex-shrink-0" />
                      <span className="truncate">{item.client}</span>
                    </div>
                    <span
                      className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}`, letterSpacing: "0.04em" }}
                    >
                      {item.type}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button className="w-full mt-5 bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 rounded-md px-4 py-2 text-[13px] font-medium transition-colors flex items-center justify-between">
          Open full calendar
          <ExternalLink size={13} className="text-gray-400" />
        </button>
      </div>

      {/* Client Portal Analytics */}
      <div
        className="bg-white border border-gray-200 rounded-xl p-4"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)" }}
      >
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-gray-900 font-semibold text-[14px]">Portal Analytics</h2>
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: "#ecfdf5", color: "#16a34a", border: "1px solid #bbf7d0" }}
          >
            Live
          </span>
        </div>
        <p className="text-gray-500 text-[13px] mb-3 leading-relaxed">
          3 clients viewed their estate plans today.
        </p>
        <a href="#" className="text-blue-600 hover:text-blue-700 text-[13px] font-medium flex items-center gap-1 transition-colors">
          View report <ChevronDown size={13} className="-rotate-90" />
        </a>
      </div>
    </aside>
  );
}

// ── Dashboard page ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [repos, setRepos] = useState(TOP_REPOSITORIES);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newRepoName, setNewRepoName] = useState("");

  const handleCreateRepo = (e) => {
    e.preventDefault();
    if (!newRepoName.trim()) return;
    setRepos([{ id: Date.now(), name: newRepoName.trim() }, ...repos]);
    setNewRepoName("");
    setIsCreatingNew(false);
  };

  const filteredRepos = repos.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      <Head>
        <title>Dashboard — AdvisorOS</title>
      </Head>

      <TopNav />

      <div className="max-w-[1440px] mx-auto px-4 md:px-8 pt-6 flex justify-center gap-6 lg:gap-8">
        <LeftSidebar
          repos={filteredRepos}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isCreatingNew={isCreatingNew}
          setIsCreatingNew={setIsCreatingNew}
          newRepoName={newRepoName}
          setNewRepoName={setNewRepoName}
          onCreateRepo={handleCreateRepo}
        />
        <Feed activity={ADVISOR_ACTIVITY} />
        <RightSidebar schedule={SCHEDULE} />
      </div>
    </div>
  );
}
