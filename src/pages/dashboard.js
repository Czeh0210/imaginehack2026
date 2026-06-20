import { useState } from "react";
import Head from "next/head";
import Link from "next/link";

export default function Dashboard() {
  // Mock data for repositories/clients
  const [repos, setRepos] = useState([
    { id: 1, name: "005511/LimWeiMing", type: "Private", lastActive: "2h ago" },
    { id: 2, name: "005512/SarahTan", type: "Public", lastActive: "5h ago" },
    { id: 3, name: "005513/AhmadRazif", type: "Private", lastActive: "3d ago" },
    { id: 4, name: "005514/JenniferKoh", type: "Private", lastActive: "1d ago" },
    { id: 5, name: "005515/DavidNg", type: "Private", lastActive: "2d ago" },
    { id: 6, name: "005516/RosnahYusof", type: "Private", lastActive: "4d ago" },
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
      repo: "005511/LimWeiMing",
      title: "Updated Living Trust Document",
      description: "Added new clauses regarding digital assets and cryptocurrency holdings.",
      time: "2 hours ago",
      tags: ["Draft", "Legal"],
    },
    {
      id: 2,
      repo: "005515/DavidNg",
      title: "Board Meeting Notes Uploaded",
      description: "Summary of succession planning decisions from Q3 board meeting.",
      time: "Yesterday",
      tags: ["Corporate"],
    },
  ];

  // Mock data for calendar meetings
  const meetings = [
    { id: 1, time: "10:00 AM", client: "005515/DavidNg", title: "FIRE Strategy Review", type: "Zoom" },
    { id: 2, time: "01:30 PM", client: "005514/JenniferKoh", title: "Trust Fund Signing", type: "In-person" },
    { id: 3, time: "04:00 PM", client: "005511/LimWeiMing", title: "Estate Exit Update", type: "Teams" },
  ];

  return (
    <div className="dashboard-root">
      <Head>
        <title>Dashboard — ImagineHack</title>
      </Head>

      <div className="dashboard-container">
        {/* ── LEFT SIDEBAR (REPOSITORIES) ── */}
        <aside className="sidebar-left">
          <div className="repo-header">
            <h2 className="repo-title">Top repositories</h2>
            <button
              className="btn-primary"
              onClick={() => setIsCreatingNew(!isCreatingNew)}
            >
              <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" fill="currentColor">
                <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"></path>
              </svg>
              New
            </button>
          </div>

          <div className="repo-search-container">
            <input
              type="text"
              className="repo-search-input"
              placeholder="Find a repository..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {isCreatingNew && (
            <form className="new-repo-form" onSubmit={handleCreateRepo}>
              <input
                type="text"
                autoFocus
                className="new-repo-input"
                placeholder="Repository name..."
                value={newRepoName}
                onChange={(e) => setNewRepoName(e.target.value)}
              />
              <div className="new-repo-actions">
                <button type="submit" className="btn-primary btn-small">Create</button>
                <button type="button" className="btn-secondary btn-small" onClick={() => setIsCreatingNew(false)}>Cancel</button>
              </div>
            </form>
          )}

          <ul className="repo-list">
            {filteredRepos.map((repo) => {
              const urlSafeName = repo.name.replace("/", "_");
              return (
                <li key={repo.id} className="repo-item">
                  <div className="repo-avatar"></div>
                  <Link href={`/client/${urlSafeName}`} className="repo-link">
                    {repo.name}
                  </Link>
                </li>
              );
            })}
          </ul>
          <button className="show-more-btn">Show more</button>
        </aside>

        {/* ── MAIN CENTER AREA ── */}
        <main className="main-content">
          <h1 className="page-title">Home</h1>

          <div className="copilot-input-box">
            <div className="input-wrapper">
              <input
                type="text"
                className="copilot-input"
                placeholder="Ask anything or type @ to add context"
              />
            </div>
            <div className="input-actions">
              <div className="action-group">
                <button className="action-btn">
                  <span className="icon">💬</span> Ask ▾
                </button>
                <button className="action-btn">
                  <span className="icon">📂</span> All repositories ▾
                </button>
                <button className="action-btn icon-only">+</button>
              </div>
              <div className="action-group">
                <button className="action-btn">Auto ▾</button>
                <button className="submit-btn">➤</button>
              </div>
            </div>
            
            <div className="quick-actions">
              <button className="quick-btn">🤖 Agent</button>
              <button className="quick-btn">⊙ Create issue</button>
              <button className="quick-btn">✨ Spark</button>
              <button className="quick-btn">🌿 Git ▾</button>
              <button className="quick-btn">⑂ Pull requests ▾</button>
            </div>
          </div>

          <div className="feed-section">
            <div className="feed-header">
              <h2 className="feed-title">Feed</h2>
              <button className="filter-btn">≡ Filter</button>
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
