import { useState, useCallback, useRef } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import { GoogleMap, useJsApiLoader, DirectionsRenderer, Marker } from "@react-google-maps/api";

export default function ClientRepo() {
  const router = useRouter();
  const { id } = router.query;
  const displayId = id ? id.replace(/_/g, "/") : "Loading...";
  const [activeTab, setActiveTab] = useState("info");

  // ── GOOGLE MAPS STATE ──
  const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const { isLoaded: mapsLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  // Selangor stops — real addresses in Selangor, Malaysia
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
      name: "IOI City Mall",
      address: "IOI Resort City, 62502 Putrajaya, Selangor",
      lat: 2.9723,
      lng: 101.7229,
      color: "#1f883d",
    },
    {
      id: 3,
      label: "Stop 3",
      name: "Shah Alam Convention Centre (SACC)",
      address: "Persiaran Perbandaran, Seksyen 14, 40000 Shah Alam, Selangor",
      lat: 3.0778,
      lng: 101.5183,
      color: "#9a3412",
    },
  ];

  // Advisor starting point (Kuala Lumpur City Centre)
  const advisorOrigin = {
    name: "Advisor Office (KLCC)",
    address: "Kuala Lumpur City Centre, 50088 Kuala Lumpur",
    lat: 3.1578,
    lng: 101.7123,
  };

  const [directionsResult, setDirectionsResult] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState("");
  const [selectedStop, setSelectedStop] = useState(null);
  const mapRef = useRef(null);

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const mapCenter = { lat: 3.0738, lng: 101.6010 };

  const handleShowRoute = useCallback(() => {
    if (!mapsLoaded) return;
    setRouteLoading(true);
    setRouteError("");
    const directionsService = new window.google.maps.DirectionsService();
    const waypoints = stops.slice(0, 2).map(s => ({
      location: { lat: s.lat, lng: s.lng },
      stopover: true,
    }));
    directionsService.route(
      {
        origin: { lat: advisorOrigin.lat, lng: advisorOrigin.lng },
        destination: { lat: stops[2].lat, lng: stops[2].lng },
        waypoints,
        optimizeWaypoints: true,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        setRouteLoading(false);
        if (status === "OK") {
          setDirectionsResult(result);
        } else {
          setRouteError(`Could not get directions: ${status}`);
        }
      }
    );
  }, [mapsLoaded]);

  const handleStopClick = (stop) => {
    setSelectedStop(stop);
    handleShowRoute();
  };

  // Mock data for partners
  const [partners, setPartners] = useState([
    { id: 1, name: "TaxCorp Advisory", role: "Tax Consultant" },
  ]);
  const [isAddingPartner, setIsAddingPartner] = useState(false);
  const [newPartnerName, setNewPartnerName] = useState("");

  const handleAddPartner = (e) => {
    e.preventDefault();
    if (!newPartnerName.trim()) return;
    setPartners([
      ...partners,
      { id: Date.now(), name: newPartnerName, role: "Partner" },
    ]);
    setNewPartnerName("");
    setIsAddingPartner(false);
  };

  return (
    <div className="repo-root">
      <Head>
        <title>{displayId} — Client Repository</title>
      </Head>

      {/* ── TOP HEADER / BREADCRUMBS ── */}
      <header className="repo-header">
        <div className="header-container">
          <div className="breadcrumb">
            <Link href="/dashboard" className="back-link">
              <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" fill="currentColor">
                <path d="M11.28 3.22a.75.75 0 0 0-1.06 0L5.47 7.97a.75.75 0 0 0 0 1.06l4.75 4.75a.75.75 0 0 0 1.06-1.06L7.06 8l4.22-4.22a.75.75 0 0 0 0-1.06Z"></path>
              </svg>
              Dashboard
            </Link>
            <span className="separator">/</span>
            <span className="repo-name">{displayId}</span>
            <span className="badge">Public</span>
          </div>
          <div className="repo-actions">
            <button className="action-btn">
              <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" fill="currentColor"><path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm6.5-5.5a.75.75 0 0 1 .75.75v4.25h4.25a.75.75 0 0 1 0 1.5h-5a.75.75 0 0 1-.75-.75v-5a.75.75 0 0 1 .75-.75Z"></path></svg>
              Watch <span className="count">1</span>
            </button>
            <button className="action-btn">
              <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" fill="currentColor"><path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z"></path></svg>
              Fork <span className="count">0</span>
            </button>
            <button className="action-btn">
              <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" fill="currentColor"><path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"></path></svg>
              Star <span className="count">4</span>
            </button>
          </div>
        </div>

        {/* ── TABS ── */}
        <nav className="repo-tabs">
          <ul className="tab-list">
            <li>
              <button 
                className={`tab-item ${activeTab === "info" ? "active" : ""}`}
                onClick={() => setActiveTab("info")}
              >
                <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" fill="currentColor"><path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm6.5-.25A.75.75 0 0 1 7.25 7h1a.75.75 0 0 1 .75.75v2.75h.25a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1 0-1.5h.25v-2h-.25a.75.75 0 0 1-.75-.75ZM8 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"></path></svg>
                Info
              </button>
            </li>
            <li>
              <button 
                className={`tab-item ${activeTab === "partners" ? "active" : ""}`}
                onClick={() => setActiveTab("partners")}
              >
                <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" fill="currentColor"><path d="M10.561 8.073a6.005 6.005 0 0 1 3.432 5.142.75.75 0 1 1-1.498.07 4.5 4.5 0 0 0-8.99 0 .75.75 0 0 1-1.498-.07 6.004 6.004 0 0 1 3.431-5.142 3.999 3.999 0 1 1 5.123 0ZM10.5 5a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0Z"></path></svg>
                Partners
              </button>
            </li>
            <li>
              <button 
                className={`tab-item ${activeTab === "photo" ? "active" : ""}`}
                onClick={() => setActiveTab("photo")}
              >
                <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" fill="currentColor"><path d="M1.75 2.5a.25.25 0 0 0-.25.25v10.5c0 .138.112.25.25.25h.94a.76.76 0 0 1 .03-.028 10.098 10.098 0 0 1 5.28-1.472 10.098 10.098 0 0 1 5.28 1.472.748.748 0 0 1 .03.028h.94a.25.25 0 0 0 .25-.25V2.75a.25.25 0 0 0-.25-.25H1.75Zm12.5 11c-.538-.724-1.282-1.341-2.204-1.785a8.598 8.598 0 0 0-4.046-.965 8.598 8.598 0 0 0-4.046.965c-.922.444-1.666 1.061-2.204 1.785H1.75A1.75 1.75 0 0 1 0 13.25V2.75C0 1.784.784 1 1.75 1h12.5C15.216 1 16 1.784 16 2.75v10.5A1.75 1.75 0 0 1 13.25 15h-.002a2.228 2.228 0 0 0-.05-.043 11.59 11.59 0 0 0-6.198-1.707A11.59 11.59 0 0 0 1.802 14.96a2.25 2.25 0 0 0-.05.042H1.75v-1.5h12.5v1.5ZM5.75 7.5a1.75 1.75 0 1 1 0-3.5 1.75 1.75 0 0 1 0 3.5ZM7 5.75a1.25 1.25 0 1 0-2.5 0 1.25 1.25 0 0 0 2.5 0Z"></path></svg>
                Photo
              </button>
            </li>
            <li>
              <button 
                className={`tab-item ${activeTab === "location" ? "active" : ""}`}
                onClick={() => setActiveTab("location")}
              >
                <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" fill="currentColor"><path d="M8 0a5.53 5.53 0 0 0-5.5 5.5c0 3.16 4.69 9.38 5.06 9.87a.55.55 0 0 0 .88 0C8.81 14.88 13.5 8.66 13.5 5.5A5.53 5.53 0 0 0 8 0Zm0 8a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z"></path></svg>
                Location
              </button>
            </li>
          </ul>
        </nav>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="repo-content">
        <div className="content-container">
          
          {/* TAB 1: INFO */}
          {activeTab === "info" && (
            <div className="tab-pane info-tab">
              <div className="box">
                <div className="box-header">
                  <h3 className="box-title">Meeting Recording Summary</h3>
                </div>
                <div className="box-body blank-slate">
                  <svg aria-hidden="true" height="24" viewBox="0 0 24 24" version="1.1" width="24" fill="#656d76" style={{marginBottom: 16}}>
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2ZM11 19.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.22.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93Zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39Z"></path>
                  </svg>
                  <h4>No recordings summarized yet</h4>
                  <p>When you record a client meeting, the AI will automatically generate a summary of the action items and discussion points here.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PARTNERS */}
          {activeTab === "partners" && (
            <div className="tab-pane partners-tab">
              <div className="action-bar">
                <p className="tab-description">Manage consulting partners and tax advisors for this client.</p>
                <button className="btn-primary" onClick={() => setIsAddingPartner(!isAddingPartner)}>
                  Add Partner
                </button>
              </div>

              {isAddingPartner && (
                <form className="add-partner-form" onSubmit={handleAddPartner}>
                  <div className="form-group">
                    <label>Partner Name</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. John Doe, CPA"
                      value={newPartnerName}
                      onChange={(e) => setNewPartnerName(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn-primary">Save</button>
                    <button type="button" className="btn-secondary" onClick={() => setIsAddingPartner(false)}>Cancel</button>
                  </div>
                </form>
              )}

              <div className="box">
                <div className="box-header">
                  <h3 className="box-title">Active Partners</h3>
                </div>
                <div className="box-body no-padding">
                  <ul className="partner-list">
                    {partners.map(p => (
                      <li key={p.id} className="partner-item">
                        <div className="partner-avatar"></div>
                        <div className="partner-info">
                          <span className="partner-name">{p.name}</span>
                          <span className="partner-role">{p.role}</span>
                        </div>
                        <button className="btn-secondary btn-small">Remove</button>
                      </li>
                    ))}
                    {partners.length === 0 && (
                      <li className="partner-item blank-slate-small">No partners assigned to this client.</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PHOTO */}
          {activeTab === "photo" && (
            <div className="tab-pane photo-tab">
              <div className="box upload-box">
                <div className="upload-icon">
                  <svg aria-hidden="true" height="32" viewBox="0 0 16 16" version="1.1" width="32" fill="#656d76">
                    <path d="M2.75 2.5a.25.25 0 0 0-.25.25v10.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25V2.75a.25.25 0 0 0-.25-.25H2.75Zm-1.75.25C1 1.784 1.784 1 2.75 1h10.5C14.216 1 15 1.784 15 2.75v10.5A1.75 1.75 0 0 1 13.25 15H2.75A1.75 1.75 0 0 1 1 13.25V2.75ZM8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path>
                    <path d="M7 2.5h2v3H7v-3Z"></path>
                  </svg>
                </div>
                <h3>Attach receipt or physical document</h3>
                <p>Drag and drop an image, or click to upload</p>
                <label className="btn-secondary file-upload-btn">
                  Choose File
                  <input type="file" accept="image/*" style={{display: 'none'}} />
                </label>
              </div>

              <div className="recent-photos">
                <h4>Recent Uploads</h4>
                <div className="blank-slate-small" style={{marginTop: 8}}>
                  No photos uploaded yet.
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LOCATION */}
          {activeTab === "location" && (
            <div className="tab-pane location-tab">
              <div className="location-header">
                <div>
                  <h2 className="location-title">Client Visit Locations</h2>
                  <p className="location-subtitle">Click a stop to see the best driving route from your office (KLCC) through all stops.</p>
                </div>
              </div>

              {/* Origin card */}
              <div className="origin-card">
                <div className="origin-icon">🏢</div>
                <div className="origin-info">
                  <span className="origin-label">Starting Point — Advisor Office</span>
                  <span className="origin-address">{advisorOrigin.address}</span>
                </div>
              </div>

              {/* Stop cards */}
              <div className="stops-grid">
                {stops.map((stop) => (
                  <button
                    key={stop.id}
                    id={`stop-btn-${stop.id}`}
                    className={`stop-card ${selectedStop?.id === stop.id ? "stop-card--active" : ""}`}
                    onClick={() => handleStopClick(stop)}
                    style={{ "--stop-color": stop.color }}
                  >
                    <div className="stop-badge" style={{ background: stop.color }}>
                      {stop.label}
                    </div>
                    <div className="stop-body">
                      <div className="stop-name">{stop.name}</div>
                      <div className="stop-address">{stop.address}</div>
                    </div>
                    <div className="stop-cta">
                      <svg height="14" viewBox="0 0 16 16" width="14" fill="currentColor"><path d="M8 0a5.53 5.53 0 0 0-5.5 5.5c0 3.16 4.69 9.38 5.06 9.87a.55.55 0 0 0 .88 0C8.81 14.88 13.5 8.66 13.5 5.5A5.53 5.53 0 0 0 8 0Zm0 8a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z"></path></svg>
                      View Route
                    </div>
                  </button>
                ))}
              </div>

              {/* Map section */}
              <div className="map-wrapper">
                {!mapsLoaded && (
                  <div className="map-placeholder">
                    <div className="map-spinner"></div>
                    <p>Loading Google Maps…</p>
                  </div>
                )}
                {mapsLoaded && !directionsResult && !routeLoading && (
                  <div className="map-placeholder map-idle">
                    <svg height="48" viewBox="0 0 24 24" width="48" fill="#d0d7de"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5Z"/></svg>
                    <p>Click any stop above to display the route on the map</p>
                  </div>
                )}
                {mapsLoaded && routeLoading && (
                  <div className="map-placeholder">
                    <div className="map-spinner"></div>
                    <p>Calculating best route…</p>
                  </div>
                )}
                {routeError && (
                  <div className="map-placeholder map-error">
                    <p>⚠️ {routeError}</p>
                  </div>
                )}
                {mapsLoaded && directionsResult && (
                  <GoogleMap
                    mapContainerStyle={{ width: "100%", height: "480px", borderRadius: "0 0 6px 6px" }}
                    center={mapCenter}
                    zoom={11}
                    onLoad={onMapLoad}
                    options={{
                      streetViewControl: false,
                      mapTypeControl: false,
                      fullscreenControl: true,
                      styles: [
                        { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
                      ],
                    }}
                  >
                    {/* Origin marker */}
                    <Marker
                      position={{ lat: advisorOrigin.lat, lng: advisorOrigin.lng }}
                      label={{ text: "🏢", fontSize: "20px" }}
                      title={advisorOrigin.name}
                    />
                    {/* Stop markers */}
                    {stops.map((stop) => (
                      <Marker
                        key={stop.id}
                        position={{ lat: stop.lat, lng: stop.lng }}
                        label={{ text: stop.label, color: "#fff", fontWeight: "bold", fontSize: "11px" }}
                        title={stop.name}
                        icon={{
                          path: window.google.maps.SymbolPath.CIRCLE,
                          scale: 18,
                          fillColor: stop.color,
                          fillOpacity: 1,
                          strokeColor: "#fff",
                          strokeWeight: 2,
                        }}
                      />
                    ))}
                    <DirectionsRenderer
                      directions={directionsResult}
                      options={{
                        suppressMarkers: true,
                        polylineOptions: { strokeColor: "#0969da", strokeWeight: 5, strokeOpacity: 0.85 },
                      }}
                    />
                  </GoogleMap>
                )}
              </div>

              {/* Route summary */}
              {directionsResult && (
                <div className="route-summary">
                  <h4 className="summary-title">📍 Route Summary</h4>
                  <div className="summary-legs">
                    {directionsResult.routes[0].legs.map((leg, i) => (
                      <div key={i} className="summary-leg">
                        <div className="leg-index">{i + 1}</div>
                        <div className="leg-info">
                          <div className="leg-from">{leg.start_address}</div>
                          <div className="leg-arrow">↓ {leg.distance.text} · {leg.duration.text}</div>
                          <div className="leg-to">{leg.end_address}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      <style jsx>{`
        .repo-root {
          min-height: 100vh;
          background-color: #ffffff;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif;
          color: #1F2328;
        }

        /* ── HEADER ── */
        .repo-header {
          background-color: #f6f8fa;
          border-bottom: 1px solid #d0d7de;
          padding-top: 16px;
        }
        .header-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .breadcrumb {
          display: flex;
          align-items: center;
          font-size: 20px;
          gap: 8px;
        }
        .back-link {
          color: #0969da;
          text-decoration: none;
          font-size: 16px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .back-link:hover {
          text-decoration: underline;
        }
        .separator {
          color: #656d76;
        }
        .repo-name {
          font-weight: 600;
          color: #0969da;
        }
        .badge {
          font-size: 12px;
          color: #656d76;
          border: 1px solid #d0d7de;
          border-radius: 2em;
          padding: 2px 8px;
          font-weight: 500;
          margin-left: 8px;
        }

        .repo-actions {
          display: flex;
          gap: 8px;
        }
        .action-btn {
          background: #f6f8fa;
          border: 1px solid #d0d7de;
          color: #24292f;
          padding: 3px 12px;
          font-size: 12px;
          font-weight: 500;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .action-btn:hover {
          background: #f3f4f6;
          border-color: rgba(27,31,36,0.15);
        }
        .action-btn .count {
          background: #ffffff;
          padding: 0 6px;
          border-radius: 12px;
          font-weight: 600;
          border: 1px solid #d0d7de;
        }

        /* ── TABS ── */
        .repo-tabs {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
        }
        .tab-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          gap: 8px;
        }
        .tab-item {
          background: transparent;
          border: none;
          padding: 8px 16px;
          font-size: 14px;
          color: #1f2328;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .tab-item:hover {
          background: rgba(208,215,222,0.32);
          border-radius: 6px 6px 0 0;
        }
        .tab-item.active {
          font-weight: 600;
          border-bottom: 2px solid #fd8c73;
        }
        .tab-item svg {
          color: #656d76;
        }
        .tab-item.active svg {
          color: #1f2328;
        }

        /* ── MAIN CONTENT ── */
        .repo-content {
          padding: 24px 0;
        }
        .content-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* BUTTONS */
        .btn-primary {
          background-color: #1f883d;
          color: #ffffff;
          border: 1px solid rgba(31, 35, 40, 0.15);
          border-radius: 6px;
          padding: 5px 16px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }
        .btn-primary:hover {
          background-color: #1a7f37;
        }
        .btn-secondary {
          background-color: #f6f8fa;
          color: #24292f;
          border: 1px solid rgba(31, 35, 40, 0.15);
          border-radius: 6px;
          padding: 5px 16px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
        }
        .btn-secondary:hover {
          background-color: #f3f4f6;
        }
        .btn-small {
          padding: 3px 12px;
          font-size: 12px;
        }

        /* BOXES */
        .box {
          border: 1px solid #d0d7de;
          border-radius: 6px;
          background: #ffffff;
          overflow: hidden;
          margin-bottom: 24px;
        }
        .box-header {
          background: #f6f8fa;
          border-bottom: 1px solid #d0d7de;
          padding: 12px 16px;
        }
        .box-title {
          font-size: 14px;
          font-weight: 600;
          margin: 0;
        }
        .box-body {
          padding: 16px;
        }
        .box-body.no-padding {
          padding: 0;
        }
        .blank-slate {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 16px;
          text-align: center;
        }
        .blank-slate h4 {
          margin: 0 0 8px;
          font-size: 16px;
        }
        .blank-slate p {
          color: #656d76;
          font-size: 14px;
          max-width: 400px;
          margin: 0;
        }
        .blank-slate-small {
          padding: 24px;
          text-align: center;
          color: #656d76;
          font-size: 14px;
        }

        /* PARTNERS TAB */
        .action-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .tab-description {
          color: #656d76;
          font-size: 14px;
          margin: 0;
        }
        .add-partner-form {
          background: #f6f8fa;
          border: 1px solid #d0d7de;
          border-radius: 6px;
          padding: 16px;
          margin-bottom: 24px;
        }
        .form-group {
          margin-bottom: 16px;
        }
        .form-group label {
          display: block;
          font-weight: 600;
          font-size: 14px;
          margin-bottom: 8px;
        }
        .form-input {
          width: 100%;
          max-width: 400px;
          padding: 5px 12px;
          font-size: 14px;
          border: 1px solid #d0d7de;
          border-radius: 6px;
        }
        .form-actions {
          display: flex;
          gap: 8px;
        }

        .partner-list {
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .partner-item {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid #d0d7de;
        }
        .partner-item:last-child {
          border-bottom: none;
        }
        .partner-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #d0d7de;
          margin-right: 12px;
        }
        .partner-info {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .partner-name {
          font-weight: 600;
          font-size: 14px;
        }
        .partner-role {
          font-size: 12px;
          color: #656d76;
        }

        /* PHOTO TAB */
        .upload-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 16px;
          border: 2px dashed #d0d7de;
          background: #fafbfc;
          text-align: center;
        }
        .upload-box:hover {
          border-color: #0969da;
          background: #f3f8ff;
        }
        .upload-icon {
          margin-bottom: 16px;
        }
        .upload-box h3 {
          margin: 0 0 8px;
          font-size: 16px;
        }
        .upload-box p {
          color: #656d76;
          font-size: 14px;
          margin: 0 0 24px;
        }
        .file-upload-btn {
          display: inline-block;
        }

        /* ── LOCATION TAB ── */
        .location-tab {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .location-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        .location-title {
          font-size: 18px;
          font-weight: 700;
          margin: 0 0 4px;
          color: #1f2328;
        }
        .location-subtitle {
          font-size: 13px;
          color: #656d76;
          margin: 0;
        }

        /* Origin card */
        .origin-card {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #f0f6ff;
          border: 1px solid #b6d4fe;
          border-radius: 8px;
          padding: 14px 18px;
        }
        .origin-icon {
          font-size: 28px;
          flex-shrink: 0;
        }
        .origin-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .origin-label {
          font-size: 13px;
          font-weight: 700;
          color: #0550ae;
        }
        .origin-address {
          font-size: 13px;
          color: #444;
        }

        /* Stop cards grid */
        .stops-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 14px;
        }
        .stop-card {
          text-align: left;
          background: #fff;
          border: 1px solid #d0d7de;
          border-radius: 8px;
          padding: 0;
          cursor: pointer;
          transition: box-shadow 0.18s, border-color 0.18s, transform 0.15s;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          border-left: 4px solid var(--stop-color, #0969da);
        }
        .stop-card:hover {
          box-shadow: 0 4px 16px rgba(0,0,0,0.10);
          transform: translateY(-2px);
          border-color: var(--stop-color, #0969da);
        }
        .stop-card--active {
          box-shadow: 0 0 0 3px var(--stop-color, #0969da)40;
          border-color: var(--stop-color, #0969da);
        }
        .stop-badge {
          color: #fff;
          font-size: 11px;
          font-weight: 700;
          padding: 4px 12px;
          display: inline-block;
          width: fit-content;
          border-radius: 0 0 8px 0;
        }
        .stop-body {
          padding: 12px 14px 8px;
          flex: 1;
        }
        .stop-name {
          font-size: 14px;
          font-weight: 700;
          color: #1f2328;
          margin-bottom: 4px;
        }
        .stop-address {
          font-size: 12px;
          color: #656d76;
          line-height: 1.5;
        }
        .stop-cta {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          font-weight: 600;
          color: var(--stop-color, #0969da);
          padding: 8px 14px 12px;
        }

        /* Map */
        .map-wrapper {
          border: 1px solid #d0d7de;
          border-radius: 6px;
          overflow: hidden;
          min-height: 220px;
          background: #f6f8fa;
        }
        .map-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 220px;
          gap: 16px;
          color: #656d76;
          font-size: 14px;
        }
        .map-placeholder p { margin: 0; }
        .map-idle svg { opacity: 0.5; }
        .map-error p { color: #d1242f; }
        .map-spinner {
          width: 36px;
          height: 36px;
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
          border-radius: 6px;
          padding: 16px;
        }
        .summary-title {
          font-size: 14px;
          font-weight: 700;
          margin: 0 0 14px;
          color: #1f2328;
        }
        .summary-legs {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .summary-leg {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }
        .leg-index {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #0969da;
          color: #fff;
          font-size: 12px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .leg-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
          font-size: 13px;
        }
        .leg-from, .leg-to {
          color: #1f2328;
          font-weight: 500;
        }
        .leg-arrow {
          color: #0969da;
          font-size: 12px;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
