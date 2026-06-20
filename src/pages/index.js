import { useState, useRef, useEffect, useCallback } from "react";
import Head from "next/head";
import Link from "next/link";
import TopNav from "@/components/TopNav";
import { GoogleMap, useJsApiLoader, DirectionsRenderer, Marker } from "@react-google-maps/api";
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
  { time: "10:00 AM", title: "Succession Review",        client: "Bruce Wayne",     type: "ZOOM",      durationMins: 60 },
  { time: "01:30 PM", title: "Will Signing",             client: "John Smith",      type: "IN-PERSON", durationMins: 60 },
  { time: "04:00 PM", title: "Quarterly Estate Update",  client: "Acme Corp Board", type: "TEAMS",      durationMins: 90 },
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
function RightSidebar({ schedule, onOpenMap }) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const buildGCalUrl = (meeting) => {
    const today = new Date();
    const [time, ampm] = meeting.time.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (ampm === "PM" && hours !== 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;

    const pad = (n) => String(n).padStart(2, "0");
    const ymd = `${today.getFullYear()}${pad(today.getMonth() + 1)}${pad(today.getDate())}`;
    const startTime = `${pad(hours)}${pad(minutes)}00`;

    // Calculate end time
    const totalMins = hours * 60 + minutes + (meeting.durationMins || 60);
    const endH = Math.floor(totalMins / 60) % 24;
    const endM = totalMins % 60;
    const endTime = `${pad(endH)}${pad(endM)}00`;

    const start = `${ymd}T${startTime}`;
    const end   = `${ymd}T${endTime}`;
    const text  = encodeURIComponent(`${meeting.title} — ${meeting.client}`);
    const details = encodeURIComponent(`Client: ${meeting.client}\nMeeting type: ${meeting.type}`);

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${start}/${end}&details=${details}`;
  };

  return (
    <aside className="hidden lg:flex flex-col gap-4 w-[300px] shrink-0 sticky top-[45px] h-[calc(100vh-45px)] overflow-y-auto pl-2 text-sm">

      {/* Today's Schedule */}
      <div
        className="bg-white border border-gray-200 rounded-xl p-5"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)" }}
      >
        <div className="flex items-center justify-between mb-5 border-b border-gray-100 pb-2">
          <h2 className="text-gray-900 font-semibold text-[14px]">Today&apos;s Schedule</h2>
          <span className="text-gray-400 text-[12px] font-medium">{today}</span>
        </div>

        <div className="meeting-list">
          {schedule.map((item, idx) => {
            const s = TYPE_STYLES[item.type] ?? TYPE_STYLES.ZOOM;
            return (
              <div key={idx} className="meeting-item">
                <div className="meeting-time">
                  <span className="time-text">{item.time.split(" ")[0]}</span>
                  <span className="time-ampm">{item.time.split(" ")[1]}</span>
                </div>
                <div className="meeting-details">
                  <p className="meeting-title">{item.title}</p>
                  <p className="meeting-client">
                    <User size={11} className="inline-block mr-1 align-text-bottom text-gray-400" />
                    {item.client}
                  </p>
                  <div className="meeting-footer">
                    <span
                      className="meeting-type"
                      style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}
                    >
                      {item.type}
                    </span>
                    <div className="meeting-actions">
                      <a
                        href={buildGCalUrl(item)}
                        target="_blank"
                        rel="noreferrer"
                        className="cal-btn"
                        id={`cal-btn-${idx}`}
                        title="Add to Google Calendar"
                      >
                        <svg height="11" viewBox="0 0 24 24" width="11" fill="currentColor" style={{ marginRight: '4px' }}><path d="M19 3h-1V1h-2v2H8V1H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg>
                        + Calendar
                      </a>
                      <button
                        className="route-btn"
                        id={`route-btn-${idx}`}
                        onClick={onOpenMap}
                        title="View best route"
                      >
                        📍 Route
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button className="view-calendar-btn">Open full calendar</button>
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

      <style jsx>{`
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
          text-transform: uppercase;
        }
        .meeting-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 4px;
          margin-top: 6px;
          flex-wrap: wrap;
        }
        .meeting-actions {
          display: flex;
          align-items: center;
          gap: 5px;
          flex-shrink: 0;
        }
        .cal-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: #1f883d;
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 3px 8px;
          font-size: 10px;
          font-weight: 700;
          cursor: pointer;
          text-decoration: none;
          white-space: nowrap;
          transition: background 0.14s, transform 0.12s;
          line-height: 1.4;
        }
        .cal-btn:hover {
          background: #1a7f37;
          transform: scale(1.04);
        }
        .route-btn {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          background: linear-gradient(135deg, #0969da, #1f883d);
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 3px 8px;
          font-size: 10px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          transition: opacity 0.14s, transform 0.12s;
        }
        .route-btn:hover {
          opacity: 0.88;
          transform: scale(1.04);
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
          transition: background 0.12s;
        }
        .view-calendar-btn:hover {
          background: #f3f4f6;
        }
      `}</style>
    </aside>
  );
}

// ── Home page ────────────────────────────────────────────────────────────
export default function Home() {
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

  // ── GOOGLE MAPS ──
  const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const { isLoaded: mapsLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  // 3 real Selangor addresses the advisor visits
  const stops = [
    {
      id: 1,
      label: "Stop 1",
      name: "Ara Damansara Medical Centre",
      address: "Jalan Lapangan Terbang Subang, Ara Damansara, 47820 Petaling Jaya, Selangor",
      lat: 3.1132,
      lng: 101.5744,
      color: "#0969da",
    },
    {
      id: 2,
      label: "Stop 2",
      name: "IOI City Mall Putrajaya",
      address: "IOI Resort City, 62502 Putrajaya, Selangor",
      lat: 2.9723,
      lng: 101.7229,
      color: "#1f883d",
    },
    {
      id: 3,
      label: "Stop 3",
      name: "Shah Alam Convention Centre",
      address: "Persiaran Perbandaran, Seksyen 14, 40000 Shah Alam, Selangor",
      lat: 3.0778,
      lng: 101.5183,
      color: "#9a3412",
    },
  ];

  const advisorOrigin = {
    name: "Advisor Office (KLCC)",
    address: "Kuala Lumpur City Centre, 50088 Kuala Lumpur",
    lat: 3.1578,
    lng: 101.7123,
  };

  const mapCenter = { lat: 3.0738, lng: 101.601 };

  const [showMapModal, setShowMapModal] = useState(false);
  const [directionsResult, setDirectionsResult] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState("");
  const [selectedStop, setSelectedStop] = useState(null);
  const mapRef = useRef(null);
  const onMapLoad = useCallback((map) => { mapRef.current = map; }, []);

  const fetchRoute = useCallback(() => {
    if (!mapsLoaded) return;
    setRouteLoading(true);
    setRouteError("");
    const svc = new window.google.maps.DirectionsService();
    svc.route(
      {
        origin: { lat: advisorOrigin.lat, lng: advisorOrigin.lng },
        destination: { lat: stops[2].lat, lng: stops[2].lng },
        waypoints: stops.slice(0, 2).map((s) => ({ location: { lat: s.lat, lng: s.lng }, stopover: true })),
        optimizeWaypoints: true,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        setRouteLoading(false);
        if (status === "OK") setDirectionsResult(result);
        else setRouteError(`Directions failed: ${status}`);
      }
    );
  }, [mapsLoaded]);

  const handleOpenMap = () => {
    setShowMapModal(true);
    setDirectionsResult(null);
    setSelectedStop(null);
    fetchRoute();
  };

  const handleStopClick = (stop) => {
    setSelectedStop(stop);
    fetchRoute();
  };

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
        <RightSidebar schedule={SCHEDULE} onOpenMap={handleOpenMap} />
      </div>

      {/* ── MAP MODAL ── */}
      {showMapModal && (
        <div className="map-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowMapModal(false); }}>
          <div className="map-modal">
            {/* Modal header */}
            <div className="map-modal-header">
              <div>
                <h2 className="map-modal-title">📍 Today's Visit Route</h2>
                <p className="map-modal-subtitle">Best driving route through all 3 client stops in Selangor</p>
              </div>
              <button className="map-modal-close" onClick={() => setShowMapModal(false)}>✕</button>
            </div>

            <div className="map-modal-body">
              {/* Origin */}
              <div className="route-origin">
                <span className="route-origin-icon">🏢</span>
                <div>
                  <div className="route-origin-label">Starting Point — Advisor Office</div>
                  <div className="route-origin-addr">{advisorOrigin.address}</div>
                </div>
              </div>

              {/* Stop cards */}
              <div className="route-stops">
                {stops.map((stop) => (
                  <button
                    key={stop.id}
                    id={`modal-stop-${stop.id}`}
                    className={`route-stop-card ${selectedStop?.id === stop.id ? 'rsc--active' : ''}`}
                    style={{ '--sc': stop.color }}
                    onClick={() => handleStopClick(stop)}
                  >
                    <span className="rsc-badge" style={{ background: stop.color }}>{stop.label}</span>
                    <div className="rsc-body">
                      <div className="rsc-name">{stop.name}</div>
                      <div className="rsc-addr">{stop.address}</div>
                    </div>
                    <span className="rsc-cta">View ↗</span>
                  </button>
                ))}
              </div>

              {/* Map */}
              <div className="map-area">
                {!mapsLoaded && (
                  <div className="map-placeholder">
                    <div className="map-spin"></div><p>Loading Google Maps…</p>
                  </div>
                )}
                {mapsLoaded && routeLoading && (
                  <div className="map-placeholder">
                    <div className="map-spin"></div><p>Calculating best route…</p>
                  </div>
                )}
                {routeError && (
                  <div className="map-placeholder map-err"><p>⚠️ {routeError}</p></div>
                )}
                {mapsLoaded && !routeLoading && !directionsResult && !routeError && (
                  <div className="map-placeholder">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="#d0d7de"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5Z"/></svg>
                    <p>Click a stop to load the route</p>
                  </div>
                )}
                {mapsLoaded && directionsResult && (
                  <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '380px', borderRadius: '0 0 8px 8px' }}
                    center={mapCenter}
                    zoom={11}
                    onLoad={onMapLoad}
                    options={{ streetViewControl: false, mapTypeControl: false, fullscreenControl: true }}
                  >
                    <Marker
                      position={{ lat: advisorOrigin.lat, lng: advisorOrigin.lng }}
                      title={advisorOrigin.name}
                      label={{ text: '🏢', fontSize: '20px' }}
                    />
                    {stops.map((s) => (
                      <Marker
                        key={s.id}
                        position={{ lat: s.lat, lng: s.lng }}
                        title={s.name}
                        label={{ text: s.label, color: '#fff', fontWeight: 'bold', fontSize: '10px' }}
                        icon={{
                          path: window.google.maps.SymbolPath.CIRCLE,
                          scale: 18,
                          fillColor: s.color,
                          fillOpacity: 1,
                          strokeColor: '#fff',
                          strokeWeight: 2,
                        }}
                      />
                    ))}
                    <DirectionsRenderer
                      directions={directionsResult}
                      options={{
                        suppressMarkers: true,
                        polylineOptions: { strokeColor: '#0969da', strokeWeight: 5, strokeOpacity: 0.85 },
                      }}
                    />
                  </GoogleMap>
                )}
              </div>

              {/* Route summary */}
              {directionsResult && (
                <div className="route-summary">
                  <p className="rs-title">📋 Route Summary</p>
                  <div className="rs-legs">
                    {directionsResult.routes[0].legs.map((leg, i) => (
                      <div key={i} className="rs-leg">
                        <div className="rs-num">{i + 1}</div>
                        <div className="rs-info">
                          <div className="rs-from">{leg.start_address}</div>
                          <div className="rs-arrow">↓ {leg.distance.text} · {leg.duration.text}</div>
                          <div className="rs-to">{leg.end_address}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        /* ── MAP MODAL ── */
        .map-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.55);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          backdrop-filter: blur(3px);
          animation: fadeIn 0.18s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .map-modal {
          background: #fff;
          border-radius: 12px;
          width: 100%;
          max-width: 820px;
          max-height: 92vh;
          overflow-y: auto;
          box-shadow: 0 24px 64px rgba(0,0,0,0.28);
          animation: slideUp 0.22s ease;
        }
        @keyframes slideUp { from { transform: translateY(24px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        .map-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 20px 24px 16px;
          border-bottom: 1px solid #eaeef2;
          position: sticky;
          top: 0;
          background: #fff;
          z-index: 1;
          border-radius: 12px 12px 0 0;
        }
        .map-modal-title {
          font-size: 18px;
          font-weight: 700;
          margin: 0 0 2px;
          color: #1f2328;
        }
        .map-modal-subtitle {
          font-size: 13px;
          color: #656d76;
          margin: 0;
        }
        .map-modal-close {
          background: #f6f8fa;
          border: 1px solid #d0d7de;
          border-radius: 6px;
          width: 32px;
          height: 32px;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: background 0.12s;
        }
        .map-modal-close:hover { background: #eaeef2; }

        .map-modal-body {
          padding: 20px 24px 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        /* Origin */
        .route-origin {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #f0f6ff;
          border: 1px solid #b6d4fe;
          border-radius: 8px;
          padding: 12px 16px;
        }
        .route-origin-icon { font-size: 26px; flex-shrink: 0; }
        .route-origin-label { font-size: 12px; font-weight: 700; color: #0550ae; }
        .route-origin-addr { font-size: 12px; color: #444; margin-top: 2px; }

        /* Stop cards */
        .route-stops {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }
        .route-stop-card {
          text-align: left;
          background: #fff;
          border: 1.5px solid #d0d7de;
          border-left: 4px solid var(--sc, #0969da);
          border-radius: 8px;
          padding: 0;
          cursor: pointer;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: box-shadow 0.15s, transform 0.12s;
        }
        .route-stop-card:hover {
          box-shadow: 0 4px 14px rgba(0,0,0,0.10);
          transform: translateY(-2px);
        }
        .rsc--active {
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--sc, #0969da) 30%, transparent);
        }
        .rsc-badge {
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          padding: 3px 10px;
          display: inline-block;
          width: fit-content;
          border-radius: 0 0 6px 0;
        }
        .rsc-body { padding: 8px 10px 4px; flex: 1; }
        .rsc-name { font-size: 12px; font-weight: 700; color: #1f2328; margin-bottom: 3px; }
        .rsc-addr { font-size: 11px; color: #656d76; line-height: 1.5; }
        .rsc-cta { font-size: 11px; font-weight: 700; color: var(--sc, #0969da); padding: 6px 10px 10px; }

        /* Map area */
        .map-area {
          border: 1px solid #d0d7de;
          border-radius: 8px;
          overflow: hidden;
          min-height: 200px;
          background: #f6f8fa;
        }
        .map-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 200px;
          gap: 14px;
          color: #656d76;
          font-size: 13px;
        }
        .map-placeholder p { margin: 0; }
        .map-err p { color: #d1242f; }
        .map-spin {
          width: 32px; height: 32px;
          border: 3px solid #d0d7de;
          border-top-color: #0969da;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Route summary */
        .route-summary {
          background: #f6f8fa;
          border: 1px solid #d0d7de;
          border-radius: 8px;
          padding: 14px 16px;
        }
        .rs-title { font-size: 13px; font-weight: 700; color: #1f2328; margin: 0 0 12px; }
        .rs-legs { display: flex; flex-direction: column; gap: 10px; }
        .rs-leg { display: flex; gap: 10px; align-items: flex-start; }
        .rs-num {
          width: 22px; height: 22px;
          border-radius: 50%;
          background: #0969da; color: #fff;
          font-size: 11px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; margin-top: 2px;
        }
        .rs-info { display: flex; flex-direction: column; gap: 1px; font-size: 12px; }
        .rs-from, .rs-to { color: #1f2328; font-weight: 500; }
        .rs-arrow { color: #0969da; font-size: 11px; font-weight: 600; }
      `}</style>
    </div>
  );
}
