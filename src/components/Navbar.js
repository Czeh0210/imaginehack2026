import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { CLIENTS } from "@/lib/mockData";

export default function Navbar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [filteredClients, setFilteredClients] = useState([]);
  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);

  // Keyboard shortcut listener for "/"
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "/" && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handle client searching
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredClients([]);
      return;
    }
    const filtered = CLIENTS.filter(c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.includes(searchQuery)
    );
    setFilteredClients(filtered);
  }, [searchQuery]);

  // Handle outside click to close search dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Check if there is an exact or first match client
    const match = CLIENTS.find(c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.includes(searchQuery)
    );

    if (match) {
      const urlSafeName = match.name.replace("/", "_");
      router.push(`/client/${urlSafeName}`);
      setShowSearchResults(false);
      setSearchQuery("");
      searchInputRef.current?.blur();
    } else {
      // Otherwise, open global chat widget with this query
      window.postMessage({ type: "OPEN_GLOBAL_CHAT", query: searchQuery }, "*");
    }
  };

  // Determine active breadcrumb/navlink based on path
  const renderBreadcrumb = () => {
    const isClientPage = router.pathname.startsWith("/client/");
    const isChatbotPage = router.pathname.startsWith("/chatbot");

    if (isClientPage && router.query.id) {
      const id = router.query.id; // e.g. 005511_LimWeiMing
      const displayId = id.replace(/_/g, "/");
      const [clientIdVal, clientNameVal] = displayId.split("/");

      return (
        <div className="breadcrumb-nav">
          <span className="owner-link">
            <Link href="/dashboard">{clientIdVal}</Link>
          </span>
          <span className="separator">/</span>
          <span className="repo-link">
            <Link href={`/client/${id}`}>
              <span className="lock-icon">🔒</span>
              <strong>{clientNameVal}</strong>
            </Link>
          </span>
          <span className="chevron">▾</span>
        </div>
      );
    }

    if (isChatbotPage) {
      const qClientId = router.query.clientId;
      const matchedClient = qClientId ? CLIENTS.find(c => c.id === qClientId) : null;

      if (matchedClient) {
        const urlSafeName = matchedClient.name.replace("/", "_");
        const [clientIdVal, clientNameVal] = matchedClient.name.split("/");
        return (
          <div className="breadcrumb-nav">
            <span className="owner-link">
              <Link href="/dashboard">{clientIdVal}</Link>
            </span>
            <span className="separator">/</span>
            <span className="repo-link">
              <Link href={`/client/${urlSafeName}`}>
                <span className="lock-icon">🔒</span>
                {clientNameVal}
              </Link>
            </span>
            <span className="separator">/</span>
            <span className="sub-link">
              <Link href={router.asPath}>
                <strong>ImagineHack 2026</strong>
              </Link>
            </span>
          </div>
        );
      }

      return (
        <div className="breadcrumb-nav">
          <span className="owner-link">
            <Link href="/dashboard">ImagineHack 2026</Link>
          </span>
          <span className="separator">/</span>
          <span className="sub-link active">
            <Link href={router.asPath}>
              <strong>Chat Workspace</strong>
            </Link>
          </span>
        </div>
      );
    }

    // Default or Dashboard
    return (
      <div className="breadcrumb-nav">
        <Link href="/dashboard" className="home-link">
          Dashboard
        </Link>
      </div>
    );
  };

  return (
    <header className="global-navbar">
      {/* Left side */}
      <div className="nav-left">
        <button className="hamburger-btn" aria-label="Global navigation menu">
          <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" fill="currentColor">
            <path d="M1 2.75A.75.75 0 0 1 1.75 2h12.5a.75.75 0 0 1 0 1.5H1.75A.75.75 0 0 1 1 2.75Zm0 5A.75.75 0 0 1 1.75 7h12.5a.75.75 0 0 1 0 1.5H1.75A.75.75 0 0 1 1 7.75ZM1.75 12h12.5a.75.75 0 0 1 0 1.5H1.75a.75.75 0 0 1 0-1.5Z"></path>
          </svg>
        </button>

        <div className="logo-section">
          <Link href="/dashboard" className="logo-link">
            <span className="logo-name">AdvisorOS</span>
          </Link>
        </div>

        {renderBreadcrumb()}
      </div>

      {/* Right side */}
      <div className="nav-right">
        {/* Search form */}
        <div className="search-container" ref={searchContainerRef}>
          <form onSubmit={handleSearchSubmit} className="search-form">
            <span className="search-icon">
              <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" fill="currentColor">
                <path d="M10.68 11.74a6 6 0 0 1-7.922-8.982 6 6 0 0 1 8.982 7.922l3.018 3.018a.75.75 0 0 1-1.06 1.06l-3.018-3.018Zm-4.68 1.01a4.75 4.75 0 1 0 0-9.5 4.75 4.75 0 0 0 0 9.5Z"></path>
              </svg>
            </span>
            <input
              ref={searchInputRef}
              type="text"
              className="navbar-search-input"
              placeholder="Type / to search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSearchResults(true)}
            />
            <span className="search-badge">/</span>
          </form>

          {showSearchResults && filteredClients.length > 0 && (
            <div className="search-dropdown">
              <div className="dropdown-title">Filter clients ({filteredClients.length})</div>
              {filteredClients.map(c => {
                const urlSafeName = c.name.replace("/", "_");
                return (
                  <button
                    key={c.id}
                    className="dropdown-item"
                    onClick={() => {
                      router.push(`/client/${urlSafeName}`);
                      setShowSearchResults(false);
                      setSearchQuery("");
                    }}
                  >
                    <span className="item-icon">👤</span>
                    <div className="item-text">
                      <span className="item-name">{c.name}</span>
                      <span className="item-meta">{c.age} y/o · {c.riskProfile} risk</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick action buttons */}
        <div className="nav-actions">
          {/* plus menu */}
          <button className="action-icon-btn plus-btn" title="Create new repository">
            <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" fill="currentColor">
              <path d="M7.75 2a.75.75 0 0 1 .75.75V7h4.25a.75.75 0 0 1 0 1.5H8.5v4.25a.75.75 0 0 1-1.5 0V8.5H2.75a.75.75 0 0 1 0-1.5H7V2.75A.75.75 0 0 1 7.75 2Z"></path>
            </svg>
            <span className="arrow">▾</span>
          </button>

          {/* issues */}
          <button className="action-icon-btn" title="Issues">
            <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" fill="currentColor">
              <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"></path>
              <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z"></path>
            </svg>
          </button>

          {/* pull requests */}
          <button className="action-icon-btn" title="Pull requests">
            <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" fill="currentColor">
              <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z"></path>
            </svg>
          </button>

          {/* inbox / notifications */}
          <button className="action-icon-btn notification-btn" title="Notifications">
            <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" fill="currentColor">
              <path d="M8 16a2 2 0 0 1-2-2h4a2 2 0 0 1-2 2ZM8 1.918l-.797.161A4.002 4.002 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4.002 4.002 0 0 0-3.203-3.92L8 1.917ZM14.25 12c.62 0 .963.693.573 1.178A.75.75 0 0 1 14.25 13.5H1.75a.75.75 0 0 1-.573-1.232c.39-.485.733-1.178 1.373-1.178h11.7Z"></path>
            </svg>
            <span className="dot-unread"></span>
          </button>

          {/* user avatar */}
          <div className="nav-profile-avatar" title="Advisor Profile">
            AD
          </div>
        </div>
      </div>

      <style jsx>{`
        .global-navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 56px;
          padding: 0 16px;
          background-color: var(--bgColor-default);
          border-bottom: var(--borderWidth-thin) solid var(--borderColor-muted);
          font-family: var(--fontStack-system);
          z-index: var(--zIndex-sticky);
          position: sticky;
          top: 0;
        }

        .nav-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .hamburger-btn {
          background: transparent;
          border: var(--borderWidth-thin) solid var(--borderColor-default);
          border-radius: var(--borderRadius-medium);
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--fgColor-muted);
          transition: background-color var(--motion-transition-hover);
        }

        .hamburger-btn:hover {
          background-color: var(--control-bgColor-hover);
          color: var(--fgColor-default);
        }

        .logo-section {
          display: flex;
          align-items: center;
        }

        .logo-link {
          text-decoration: none;
          display: flex;
          align-items: center;
        }

        .logo-name {
          font-family: "Inter", var(--fontStack-sansSerif);
          font-weight: var(--base-text-weight-semibold);
          font-size: 15px;
          color: var(--fgColor-default);
        }

        /* Breadcrumb styling matching GitHub */
        .breadcrumb-nav {
          display: flex;
          align-items: center;
          font-size: 14px;
          gap: 6px;
          margin-left: 8px;
          padding-left: 12px;
          border-left: 1px solid var(--borderColor-default);
          height: 20px;
        }

        .breadcrumb-nav :global(a) {
          color: var(--fgColor-muted);
          text-decoration: none;
          transition: color var(--motion-duration-fast);
        }

        .breadcrumb-nav :global(a:hover) {
          color: var(--fgColor-link);
        }

        .breadcrumb-nav :global(strong) {
          color: var(--fgColor-default);
          font-weight: var(--base-text-weight-semibold);
        }

        .separator {
          color: var(--fgColor-muted);
          font-weight: 300;
          font-size: 13px;
        }

        .lock-icon {
          font-size: 12px;
          margin-right: 4px;
        }

        .chevron {
          font-size: 10px;
          color: var(--fgColor-muted);
          margin-left: -2px;
        }

        .home-link {
          font-weight: var(--base-text-weight-semibold);
          color: var(--fgColor-default) !important;
        }

        /* Right side */
        .nav-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        /* Search input bar styling matching GitHub header */
        .search-container {
          position: relative;
        }

        .search-form {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 8px;
          color: var(--fgColor-muted);
          display: flex;
          align-items: center;
          pointer-events: none;
        }

        .navbar-search-input {
          width: 240px;
          height: 32px;
          padding: 0 32px 0 28px;
          border: var(--borderWidth-thin) solid var(--borderColor-default);
          border-radius: var(--borderRadius-medium);
          background-color: var(--bgColor-muted);
          color: var(--fgColor-default);
          font-size: 13px;
          font-family: inherit;
          outline: none;
          transition: background-color var(--motion-duration-normal) var(--motion-easing-default), 
                      width var(--motion-duration-normal) var(--motion-easing-default);
        }

        .navbar-search-input:focus {
          background-color: var(--bgColor-default);
          border-color: var(--borderColor-accent);
          box-shadow: 0 0 0 1px var(--borderColor-accent);
          width: 320px;
        }

        .search-badge {
          position: absolute;
          right: 8px;
          width: 18px;
          height: 18px;
          border: var(--borderWidth-thin) solid var(--borderColor-default);
          border-radius: var(--borderRadius-small);
          background-color: var(--bgColor-default);
          color: var(--fgColor-muted);
          font-size: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 500;
          pointer-events: none;
        }

        .navbar-search-input:focus + .search-badge {
          display: none;
        }

        /* Search Dropdown */
        .search-dropdown {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          width: 320px;
          background: var(--bgColor-default);
          border: var(--borderWidth-thin) solid var(--borderColor-muted);
          border-radius: var(--borderRadius-medium);
          box-shadow: var(--shadow-floating-medium);
          padding: 8px 4px;
          z-index: var(--zIndex-dropdown);
        }

        .dropdown-title {
          font-size: 11px;
          font-weight: var(--base-text-weight-semibold);
          color: var(--fgColor-muted);
          padding: 4px 8px 6px;
          border-bottom: var(--borderWidth-thin) solid var(--borderColor-muted);
          margin-bottom: 4px;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 6px 8px;
          background: transparent;
          border: none;
          border-radius: var(--borderRadius-medium);
          cursor: pointer;
          text-align: left;
          font-family: inherit;
          color: var(--fgColor-default);
          transition: background-color var(--motion-duration-fast);
        }

        .dropdown-item:hover {
          background-color: var(--control-bgColor-hover);
        }

        .item-icon {
          font-size: 14px;
        }

        .item-text {
          display: flex;
          flex-direction: column;
        }

        .item-name {
          font-size: 12.5px;
          font-weight: var(--base-text-weight-medium);
        }

        .item-meta {
          font-size: 10.5px;
          color: var(--fgColor-muted);
        }

        /* Nav actions block */
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .action-icon-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          color: var(--fgColor-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          border-radius: var(--borderRadius-medium);
          position: relative;
          transition: background-color var(--motion-duration-fast), color var(--motion-duration-fast);
        }

        .action-icon-btn:hover {
          background-color: var(--control-bgColor-hover);
          color: var(--fgColor-default);
        }

        .plus-btn {
          border: var(--borderWidth-thin) solid var(--borderColor-default);
          padding: 4px 8px;
          gap: 2px;
          height: 28px;
        }

        .plus-btn .arrow {
          font-size: 10px;
          color: var(--fgColor-muted);
        }

        .notification-btn {
          position: relative;
        }

        .dot-unread {
          position: absolute;
          top: 3px;
          right: 3px;
          width: 7px;
          height: 7px;
          border-radius: var(--borderRadius-full);
          background-color: var(--fgColor-accent);
          border: 1px solid var(--bgColor-default);
        }

        .nav-profile-avatar {
          width: 24px;
          height: 24px;
          border-radius: var(--borderRadius-full);
          background: linear-gradient(135deg, #1f883d, #238636);
          color: white;
          font-size: 11px;
          font-weight: var(--base-text-weight-semibold);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border: 1px solid var(--borderColor-success);
        }
      `}</style>
    </header>
  );
}
