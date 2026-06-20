import { useState, useCallback, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import { GoogleMap, useJsApiLoader, DirectionsRenderer, Marker } from "@react-google-maps/api";

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
    { id: 1, time: "10:00 AM", client: "Bruce Wayne",     title: "Succession Review",       type: "Zoom",       durationMins: 60 },
    { id: 2, time: "01:30 PM", client: "John Smith",      title: "Will Signing",            type: "In-person",  durationMins: 60 },
    { id: 3, time: "04:00 PM", client: "Acme Corp Board", title: "Quarterly Estate Update", type: "Teams",      durationMins: 90 },
  ];

  // Build a Google Calendar "add event" URL (no API key needed)
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
                    <div className="meeting-footer">
                      <span className="meeting-type">{m.type}</span>
                      <div className="meeting-actions">
                        <a
                          href={buildGCalUrl(m)}
                          target="_blank"
                          rel="noreferrer"
                          className="cal-btn"
                          id={`cal-btn-${m.id}`}
                          title="Add to Google Calendar"
                        >
                          <svg height="11" viewBox="0 0 24 24" width="11" fill="currentColor"><path d="M19 3h-1V1h-2v2H8V1H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg>
                          + Calendar
                        </a>
                        <button
                          className="route-btn"
                          id={`route-btn-${m.id}`}
                          onClick={handleOpenMap}
                          title="View best route"
                        >
                          📍 Route
                        </button>
                      </div>
                    </div>
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

        /* meeting footer row */
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

        /* + Calendar button */
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

        /* Route button (compact) */
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

        /* Meeting footer with route button */
        .meeting-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
          margin-top: 2px;
        }
        .route-btn {
          background: linear-gradient(135deg, #0969da, #1f883d);
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 3px 9px;
          font-size: 10px;
          font-weight: 700;
          cursor: pointer;
          letter-spacing: 0.01em;
          transition: opacity 0.15s, transform 0.12s;
          white-space: nowrap;
        }
        .route-btn:hover {
          opacity: 0.88;
          transform: scale(1.04);
        }

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
