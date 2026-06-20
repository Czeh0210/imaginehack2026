import React from "react";
import TopNav from "./TopNav";

export default function Layout({ children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <TopNav />
      {/* Page Shell */}
      <div 
        style={{
          display: "flex",
          flex: 1,
          maxWidth: "1280px",
          width: "100%",
          margin: "0 auto",
          padding: "var(--space-6)",
          gap: "var(--space-6)" // Space between columns
        }}
      >
        {children}
      </div>
    </div>
  );
}
