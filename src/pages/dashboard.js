import { useState, useRef, useEffect, useCallback } from "react";
import Head from "next/head";
import Link from "next/link";
import TopNav from "@/components/TopNav";
import {
  Plus,
  ChevronDown,
  Book,
  Star,
  History,
  MoreHorizontal,
  User,
  Search,
  FileText,
  AlertTriangle,
  Calendar,
  Users,
} from "lucide-react";


const TOP_REPOSITORIES = [
  { id: 1,  name: "005511/LimWeiMing" },
  { id: 2,  name: "005512/SarahTan" },
  { id: 3,  name: "005513/AhmadRazif" },
  { id: 4,  name: "005514/JenniferKoh" },
  { id: 5,  name: "005515/DavidNg" },
  { id: 6,  name: "005516/RosnahYusof" },
  { id: 7,  name: "005517/NurulAin" },
  { id: 8,  name: "005518/TanCheeKong" },
  { id: 9,  name: "005519/PriyaKrishnan" },
  { id: 10, name: "005520/MohdFaizal" },
  { id: 11, name: "005521/ChanSiewLing" },
  { id: 12, name: "005522/RajendraMuthu" },
  { id: 13, name: "005523/NorhaizumMahmud" },
  { id: 14, name: "005524/YapKokWai" },
  { id: 15, name: "005525/SitiNorhaliza" },
  { id: 16, name: "005526/LeeChongWei" },
  { id: 17, name: "005527/FatimaZahraOmar" },
  { id: 18, name: "005528/VijayaratnamPillai" },
  { id: 19, name: "005529/NgBoonHuat" },
  { id: 20, name: "005530/ZulaikhaBakar" },
];

const INITIAL_VISIBLE = 6;

const ADVISOR_ACTIVITY = [
  {
    id: 1,
    actor: "005511/LimWeiMing",
    title: "Living Trust Document Updated",
    description: "Added new clauses on digital assets and cryptocurrency holdings. Pending legal sign-off.",
    tags: ["Draft", "Legal"],
    time: "2 hours ago",
  },
  {
    id: 2,
    actor: "005515/DavidNg",
    title: "Board Meeting Notes Uploaded",
    description: "Summary of succession planning decisions from Q3 board meeting. Next review: Dec 2026.",
    tags: ["Corporate"],
    time: "5 hours ago",
  },
  {
    id: 3,
    actor: "005512/SarahTan",
    title: "Portfolio Risk Profile Revised",
    description: "Equity allocation increased from 60% to 75% following RM 2.4M liquidity event from tech exit.",
    tags: ["Portfolio", "Risk"],
    time: "Yesterday",
  },
  {
    id: 4,
    actor: "005514/JenniferKoh",
    title: "Children's Trust Fund Executed",
    description: "Trust deed signed for two beneficiaries (ages 8 and 11). Initial contribution of RM 500,000.",
    tags: ["Legal", "Estate"],
    time: "2 days ago",
  },
  {
    id: 5,
    actor: "005513/AhmadRazif",
    title: "Education Fund Shortfall Identified",
    description: "Revised university projections for 2027 and 2029 intakes. Funding gap of RM 80,000 flagged for top-up.",
    tags: ["Education", "Planning"],
    time: "3 days ago",
  },
  {
    id: 6,
    actor: "005516/RosnahYusof",
    title: "Retirement Income Strategy Drafted",
    description: "EPF drawdown schedule combined with dividend income targeting RM 8,000/month post-retirement.",
    tags: ["Retirement", "Draft"],
    time: "4 days ago",
  },
  {
    id: 7,
    actor: "005511/LimWeiMing",
    title: "Annual Policy Review Completed",
    description: "Term life and critical illness coverage reviewed. Recommended increasing CI sum assured to RM 1M.",
    tags: ["Insurance"],
    time: "5 days ago",
  },
  {
    id: 8,
    actor: "005515/DavidNg",
    title: "FIRE Strategy Projection Updated",
    description: "Monte Carlo simulation run at 4% withdrawal rate. 92% success probability over 30-year horizon.",
    tags: ["FIRE", "Portfolio"],
    time: "6 days ago",
  },
];

const SCHEDULE = [
  {
    time: "10:00 AM",
    title: "FIRE Strategy Review",
    client: "005515/DavidNg",
    type: "ZOOM",
  },
  {
    time: "01:30 PM",
    title: "Trust Fund Signing",
    client: "005514/JenniferKoh",
    type: "IN-PERSON",
  },
  {
    time: "04:00 PM",
    title: "Estate Exit Update",
    client: "005511/LimWeiMing",
    type: "TEAMS",
  },
];

function LeftSidebar({ repos, searchQuery, setSearchQuery, isCreatingNew, setIsCreatingNew, newRepoName, setNewRepoName, onCreateRepo }) {
  const [showAll, setShowAll] = useState(false);

  // When searching, always show all matches; otherwise respect the toggle
  const isSearching = searchQuery.trim().length > 0;
  const visibleRepos = isSearching || showAll ? repos : repos.slice(0, INITIAL_VISIBLE);
  const hasMore = !isSearching && repos.length > INITIAL_VISIBLE;

  return (
    <aside className="hidden md:block w-[280px] shrink-0 sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto pb-8 pr-4 text-sm bg-gray-50/50 p-4 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-gray-900 font-semibold">Top repositories</h2>
        <button
          onClick={() => setIsCreatingNew(!isCreatingNew)}
          className="bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-3 py-1.5 rounded-md flex items-center gap-1 transition-colors shadow-sm"
        >
          <Book size={14} />
          New
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Find a repository..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-gray-300 text-gray-900 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm"
        />
      </div>

      {isCreatingNew && (
        <form onSubmit={onCreateRepo} className="mb-4 flex flex-col gap-2 p-3 bg-white border border-gray-300 rounded-md shadow-sm">
          <input
            type="text"
            autoFocus
            placeholder="Repository name..."
            value={newRepoName}
            onChange={(e) => setNewRepoName(e.target.value)}
            className="w-full bg-white border border-gray-300 text-gray-900 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <div className="flex gap-2">
            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-3 py-1.5 rounded-md transition-colors">
              Create
            </button>
            <button type="button" onClick={() => setIsCreatingNew(false)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-md border border-gray-300 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      <ul className="flex flex-col gap-1">
        {visibleRepos.map((repo) => {
          const urlSafeName = repo.name.replace("/", "_");
          return (
            <li key={repo.id} className="flex items-center gap-2 group cursor-pointer px-2 py-1.5 hover:bg-gray-100 rounded-md transition-colors">
              <span className="w-4 h-4 rounded-full bg-gray-300 border border-gray-400 flex-shrink-0"></span>
              <Link href={`/client/${urlSafeName}`} className="text-gray-700 font-medium hover:text-blue-600 truncate">
                {repo.name}
              </Link>
            </li>
          );
        })}
      </ul>

      {hasMore && (
        <div className="mt-2 px-2">
          <button
            onClick={() => setShowAll(true)}
            className="text-gray-500 hover:text-blue-600 text-xs transition-colors font-medium"
          >
            Show more
          </button>
        </div>
      )}
    </aside>
  );
}

function ActivityCard({ item }) {
  const urlSafeName = item.actor.replace("/", "_");
  return (
    <Link
      href={`/client/${urlSafeName}`}
      className="block bg-white border border-gray-200 rounded-lg p-4 shadow-sm text-sm no-underline hover:border-blue-300 hover:shadow-md transition-all duration-150 cursor-pointer"
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="w-5 h-5 rounded-full bg-gray-300 border border-gray-400 flex-shrink-0"></span>
        <span className="font-semibold text-gray-900 group-hover:text-blue-600">
          {item.actor}
        </span>
      </div>
      <h3 className="text-base font-semibold text-gray-900 mb-1">{item.title}</h3>
      <p className="text-gray-600 mb-3">{item.description}</p>
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          {item.tags.map((tag, idx) => (
            <span key={idx} className="bg-gray-100 text-gray-600 border border-gray-300 rounded-full px-2.5 py-0.5 text-xs font-medium">
              {tag}
            </span>
          ))}
        </div>
        <span className="text-gray-500 text-xs">{item.time}</span>
      </div>
    </Link>
  );
}

const SCOPE_OPTIONS = [
  { value: "all",    label: "All clients" },
  { value: "005511", label: "005511 / LimWeiMing" },
  { value: "005512", label: "005512 / SarahTan" },
  { value: "005513", label: "005513 / AhmadRazif" },
  { value: "005514", label: "005514 / JenniferKoh" },
  { value: "005515", label: "005515 / DavidNg" },
  { value: "005516", label: "005516 / RosnahYusof" },
];

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

  // Scroll only the messages container — never the whole page
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

  return (
    <main className="flex-1 w-full max-w-[800px]">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">Home</h1>

      {/* ── Inline Chatbot Box ── */}
      <div className="bg-white border border-gray-200 rounded-lg mb-6 shadow-sm overflow-hidden">

        {/* Messages area — only shown when conversation has started */}
        {messages.length > 0 && (
          <div
            ref={messagesContainerRef}
            className="max-h-[340px] overflow-y-auto p-4 border-b border-gray-100 flex flex-col gap-3"
          >
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-br-sm"
                    : "bg-gray-100 text-gray-800 rounded-bl-sm border border-gray-200"
                }`}>
                  {msg.content}
                  {/* Source pills — link to the relevant client repo */}
                  {msg.sources?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {msg.sources.slice(0, 3).map((s, si) => {
                        const slug = (s.clientId || "").replace("/", "_");
                        const href = slug ? `/client/${slug}` : "#";
                        return (
                          <Link
                            key={si}
                            href={href}
                            className="inline-block bg-white/20 text-xs px-1.5 py-0.5 rounded-full border border-white/30 hover:bg-white/30 transition-colors cursor-pointer no-underline"
                          >
                            {s.clientName} · {(s.score * 100).toFixed(0)}%
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 border border-gray-200 rounded-xl rounded-bl-sm px-4 py-2.5 flex gap-1.5 items-center">
                  {[0, 1, 2].map((d) => (
                    <span key={d} style={{ animationDelay: `${d * 0.18}s` }}
                      className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Input area */}
        <div className="p-4">
          {/* Text input */}
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
              className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-400 resize-none text-base leading-snug"
              style={{ minHeight: "28px", maxHeight: "96px" }}
            />
            {messages.length > 0 && (
              <button onClick={clearChat} className="text-gray-400 hover:text-red-500 text-xs font-medium transition-colors shrink-0 mt-0.5">
                Clear
              </button>
            )}
          </div>

          {/* Toolbar row */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Scope dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowScopeMenu((v) => !v)}
                  className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
                >
                  <Users size={14} /> {scopeLabel} <ChevronDown size={13} />
                </button>
                {showScopeMenu && (
                  <div className="absolute left-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[200px]">
                    {SCOPE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { setScope(opt.value); setShowScopeMenu(false); }}
                        className={`w-full text-left px-3 py-1.5 text-sm transition-colors ${
                          scope === opt.value ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button className="text-gray-400 hover:text-gray-600 p-1.5 border border-transparent hover:border-gray-300 rounded-md transition-colors">
                <Plus size={16} />
              </button>
            </div>

            {/* Send button */}
            <button
              onClick={() => sendMessage()}
              disabled={!query.trim() || isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-md p-1.5 transition-colors"
            >
              <ChevronDown size={18} className="-rotate-90" />
            </button>
          </div>

          {/* Quick action pills */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <button
              onClick={() => sendMessage("Summarise the latest activity across all clients")}
              className="flex items-center gap-1 text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200 rounded-md px-2 py-1 text-sm font-medium transition-colors"
            >
              <Search size={13} /> Client summary
            </button>
            <button
              onClick={() => sendMessage("Which clients have pending document reviews or expiring policies?")}
              className="flex items-center gap-1 text-gray-600 hover:bg-gray-100 border border-transparent hover:border-gray-300 rounded-md px-2 py-1 text-sm font-medium transition-colors"
            >
              <FileText size={13} /> Pending reviews
            </button>
            <button
              onClick={() => sendMessage("Which clients have high financial risk exposure or flagged concerns?")}
              className="flex items-center gap-1 text-yellow-600 hover:bg-yellow-50 border border-transparent hover:border-yellow-200 rounded-md px-2 py-1 text-sm font-medium transition-colors"
            >
              <AlertTriangle size={13} /> Risk flags
            </button>
            <button
              onClick={() => sendMessage("List clients with upcoming estate or retirement milestones")}
              className="flex items-center gap-1 text-green-600 hover:bg-green-50 border border-transparent hover:border-green-200 rounded-md px-2 py-1 text-sm font-medium transition-colors"
            >
              <Calendar size={13} /> Milestones
            </button>
            <button
              onClick={() => sendMessage("Which clients should I prioritise contacting this week?")}
              className="flex items-center gap-1 text-purple-600 hover:bg-purple-50 border border-transparent hover:border-purple-200 rounded-md px-2 py-1 text-sm font-medium transition-colors"
            >
              <Users size={13} /> Prioritise <ChevronDown size={11} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Feed Section ── */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Feed</h2>
        <button className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-md px-3 py-1.5 text-sm font-medium flex items-center gap-1 transition-colors shadow-sm">
          <MoreHorizontal size={16} /> Filter
        </button>
      </div>

      <div className="flex items-center gap-2 text-gray-500 mb-4 text-sm font-medium">
        <History size={16} className="text-red-500" /> Recent client activity
      </div>

      <div className="flex flex-col gap-4 pb-8">
        {activity.map((item) => (
          <ActivityCard key={item.id} item={item} />
        ))}
      </div>
    </main>
  );
}

function RightSidebar({ schedule }) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <aside className="hidden lg:flex flex-col gap-6 w-[320px] shrink-0 sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto pl-4 text-sm">
      {/* Today's Schedule */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-gray-900 font-semibold">Today&apos;s Schedule</h2>
          <span className="text-gray-500 text-sm">{today}</span>
        </div>
        <div className="flex flex-col gap-4 relative">
          <div className="absolute left-[71px] top-2 bottom-2 w-0.5 bg-blue-100 z-0"></div>

          {schedule.map((item, idx) => (
            <div key={idx} className="flex gap-4 relative z-10">
              <div className="w-[60px] text-right text-gray-500 font-medium pt-1">
                {item.time}
              </div>
              <div className="flex-1 bg-blue-50 border border-blue-100 rounded-lg p-3 shadow-sm relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-lg"></div>
                <h3 className="text-gray-900 font-semibold mb-1 pl-2">{item.title}</h3>
                <div className="flex items-center gap-1 text-gray-600 text-sm mb-2 pl-2">
                  <User size={14} /> {item.client}
                </div>
                <span className="ml-2 inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  {item.type}
                </span>
              </div>
            </div>
          ))}
        </div>
        <button className="w-full mt-4 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-md px-4 py-2 text-sm font-medium transition-colors shadow-sm">
          Open full calendar
        </button>
      </div>

      {/* Client Portal Analytics */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <h2 className="text-gray-900 font-semibold mb-3">Client Portal Analytics</h2>
        <p className="text-gray-600 mb-4">3 clients viewed their estate plans today.</p>
        <a href="#" className="text-blue-600 hover:underline text-sm font-medium flex items-center gap-1">
          View report <ChevronDown size={14} className="-rotate-90" />
        </a>
      </div>
    </aside>
  );
}

export default function Dashboard() {
  const [repos, setRepos] = useState(TOP_REPOSITORIES);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newRepoName, setNewRepoName] = useState("");

  const handleCreateRepo = (e) => {
    e.preventDefault();
    if (!newRepoName.trim()) return;
    setRepos([
      { id: Date.now(), name: newRepoName.trim() },
      ...repos,
    ]);
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

      <div className="max-w-[1440px] mx-auto px-4 md:px-8 pt-6 flex justify-center gap-6 lg:gap-8 relative">
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

        {/* Floating Action Button */}
        <button className="fixed bottom-8 right-8 bg-white text-gray-900 p-3 rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors z-50">
          <Star size={20} fill="currentColor" className="text-gray-900" />
        </button>
      </div>
    </div>
  );
}
