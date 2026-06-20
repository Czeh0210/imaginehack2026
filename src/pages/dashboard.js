import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import TopNav from "@/components/TopNav";
import {
  Plus,
  ChevronDown,
  Book,
  Star,
  GitFork,
  Circle,
  History,
  Smile,
  MoreHorizontal,
  User,
} from "lucide-react";


const TOP_REPOSITORIES = [
  { id: 1, name: "005511/LimWeiMing" },
  { id: 2, name: "005512/SarahTan" },
  { id: 3, name: "005513/AhmadRazif" },
  { id: 4, name: "005514/JenniferKoh" },
  { id: 5, name: "005515/DavidNg" },
  { id: 6, name: "005516/RosnahYusof" },
];

const ADVISOR_ACTIVITY = [
  {
    id: 1,
    actor: "005511/LimWeiMing",
    actorAvatar: "https://i.pravatar.cc/150?u=LimWeiMing",
    title: "Updated Living Trust Document",
    description:
      "Added new clauses regarding digital assets and cryptocurrency holdings.",
    tags: ["Draft", "Legal"],
    time: "2 hours ago",
  },
  {
    id: 2,
    actor: "005515/DavidNg",
    actorAvatar: "https://i.pravatar.cc/150?u=DavidNg",
    title: "Board Meeting Notes Uploaded",
    description:
      "Summary of succession planning decisions from Q3 board meeting.",
    tags: ["Corporate"],
    time: "Yesterday",
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
        {repos.map((repo) => {
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

      <div className="mt-2 px-2">
        <a href="#" className="text-gray-500 hover:text-blue-600 text-xs transition-colors font-medium">
          Show more
        </a>
      </div>
    </aside>
  );
}

function ActivityCard({ item }) {
  const urlSafeName = item.actor.replace("/", "_");
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm text-sm">
      <div className="flex items-center gap-3 mb-3">
        <span className="w-5 h-5 rounded-full bg-gray-300 border border-gray-400 flex-shrink-0"></span>
        <Link href={`/client/${urlSafeName}`} className="font-semibold text-gray-900 hover:text-blue-600">
          {item.actor}
        </Link>
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
    </div>
  );
}

function Feed({ activity }) {
  return (
    <main className="flex-1 w-full max-w-[800px]">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">Home</h1>

      {/* Ask Box */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
        <input
          type="text"
          placeholder="Ask anything or type @ to add context"
          className="w-full bg-transparent border-none outline-none text-gray-900 placeholder-gray-500 text-lg mb-4"
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <button className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 rounded-md px-3 py-1.5 text-sm font-medium transition-colors">
              <Smile size={16} /> Ask <ChevronDown size={14} />
            </button>
            <button className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 rounded-md px-3 py-1.5 text-sm font-medium transition-colors">
              <Book size={16} /> All repositories <ChevronDown size={14} />
            </button>
            <button className="text-gray-500 hover:text-gray-700 p-1.5 border border-transparent hover:border-gray-300 rounded-md transition-colors">
              <Plus size={18} />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 rounded-md px-3 py-1.5 text-sm font-medium transition-colors">
              Auto <ChevronDown size={14} />
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-md p-1.5 transition-colors">
              <ChevronDown size={18} className="-rotate-90" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4 flex-wrap">
          <button className="flex items-center gap-1 text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200 rounded-md px-2 py-1 text-sm font-medium transition-colors">
            <Smile size={14} /> Agent
          </button>
          <button className="flex items-center gap-1 text-gray-600 hover:bg-gray-100 border border-transparent hover:border-gray-300 rounded-md px-2 py-1 text-sm font-medium transition-colors">
            <Circle size={14} /> Create issue
          </button>
          <button className="flex items-center gap-1 text-yellow-600 hover:bg-yellow-50 border border-transparent hover:border-yellow-200 rounded-md px-2 py-1 text-sm font-medium transition-colors">
            <Star size={14} /> Spark
          </button>
          <button className="flex items-center gap-1 text-green-600 hover:bg-green-50 border border-transparent hover:border-green-200 rounded-md px-2 py-1 text-sm font-medium transition-colors">
            <GitFork size={14} /> Git <ChevronDown size={12} />
          </button>
          <button className="flex items-center gap-1 text-purple-600 hover:bg-purple-50 border border-transparent hover:border-purple-200 rounded-md px-2 py-1 text-sm font-medium transition-colors">
            <GitFork size={14} className="rotate-90" /> Pull requests <ChevronDown size={12} />
          </button>
        </div>
      </div>

      {/* Feed Section */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Feed</h2>
        <button className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-md px-3 py-1.5 text-sm font-medium flex items-center gap-1 transition-colors shadow-sm">
          <MoreHorizontal size={16} /> Filter
        </button>
      </div>

      <div className="flex items-center gap-2 text-gray-500 mb-4 text-sm font-medium">
        <History size={16} className="text-red-500" /> Recent client activity
      </div>

      <div className="flex flex-col gap-4">
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
