import React, { useState } from "react";
import { useRouter } from "next/router";

export default function TopNav() {
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

  // Determine current page context
  const isClientPage = router.pathname.startsWith("/client");
  const extractedId = router.query.id || "005511"; // simple fallback
  
  const clientMap = {
    "005511": "LimWeiMing",
    "005512": "SarahTan",
    "005513": "AhmadRazif",
    "005514": "JenniferKoh",
    "005515": "DavidNg",
    "005516": "RosnahYusof"
  };
  const fullName = clientMap[extractedId] || "ClientName";

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        width: "100%",
        height: "56px",
        backgroundColor: "var(--color-bg-default)", 
        borderBottom: "var(--border-thin) solid var(--color-border-default)",
        zIndex: "var(--z-sticky, 100)",
        display: "flex",
        alignItems: "center",
        padding: "0 var(--space-4)",
        gap: "var(--space-4)",
      }}
    >
      <div style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          marginRight: "auto"
      }}>
        {/* Menu Icon Placeholder */}
        <div style={{ 
          color: "var(--color-fg-muted)", 
          cursor: "pointer", 
          display: "flex", 
          alignItems: "center",
          padding: "6px",
          border: "var(--border-thin) solid var(--color-border-default)",
          borderRadius: "var(--radius-sm)"
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </div>

        {/* AdvisorOS Logo replacement */}
        <div 
          onClick={() => router.push('/')}
          style={{ 
            fontFamily: "'Inter', sans-serif",
            fontSize: "18px",
            fontWeight: 700,
            color: "var(--color-fg-default)",
            letterSpacing: "-0.5px",
            cursor: "pointer"
        }}>
          AdvisorOS
        </div>

        {/* Dynamic Context Navlink */}
        <nav style={{ display: "flex", alignItems: "center", marginLeft: "4px" }}>
          {!isClientPage ? (
            <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-fg-default)", cursor: "pointer", padding: "4px 8px", borderRadius: "var(--radius-sm)" }}>
              Dashboard
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "16px", fontFamily: "var(--font-sans)", color: "var(--color-fg-default)" }}>
              <span style={{ fontWeight: 400 }}>{extractedId}</span>
              <span style={{ color: "var(--color-fg-muted)", fontWeight: 300 }}>/</span>
              <span style={{ fontWeight: 600 }}>{fullName}</span>
              <span style={{ fontSize: "10px", marginLeft: "4px", color: "var(--color-fg-default)", cursor: "pointer" }}>▼</span>
            </div>
          )}
        </nav>
      </div>

      {/* Right side tools */}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          backgroundColor: "var(--color-bg-default)",
          border: "var(--border-thin) solid var(--color-border-default)",
          borderRadius: "var(--radius-md)",
          padding: "0 var(--space-2)",
          height: "32px",
          width: "240px"
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-fg-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "8px" }}>
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            placeholder="Type / to search" 
            style={{
              border: "none",
              backgroundColor: "transparent",
              color: "var(--color-fg-default)",
              fontSize: "var(--text-sm)",
              width: "100%",
              outline: "none"
            }}
          />
        </div>
        
        <div style={{ display: "flex", gap: "12px", color: "var(--color-fg-muted)", alignItems: "center", cursor: "pointer" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
        </div>

        <div style={{
          width: "32px", height: "32px",
          borderRadius: "var(--radius-full)",
          backgroundColor: "var(--color-border-default)",  // Neutral base color
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontWeight: "bold",
          fontSize: "12px",
          cursor: "pointer",
          marginLeft: "8px"
        }}></div>
      </div>
    </header>
  );
}
