import { useRouter } from "next/router";
import Link from "next/link";
import { Bell, Plus, ChevronDown, Search } from "lucide-react";

const MOCK_AVATAR = "https://i.pravatar.cc/150?u=AdvisorOS";

const CLIENT_MAP = {
  "005511": "LimWeiMing",
  "005512": "SarahTan",
  "005513": "AhmadRazif",
  "005514": "JenniferKoh",
  "005515": "DavidNg",
  "005516": "RosnahYusof",
};

export default function TopNav() {
  const router = useRouter();

  const isClientPage = router.pathname.startsWith("/client");
  const extractedId = router.query.id?.split("_")[0] || "";
  const fullName = CLIENT_MAP[extractedId] || "";

  return (
    <header style={{
      position: "sticky",
      top: 0,
      width: "100%",
      height: "56px",
      backgroundColor: "#ffffff",
      borderBottom: "1px solid #e5e7eb",
      zIndex: 100,
      display: "flex",
      alignItems: "center",
      padding: "0 24px",
      gap: "16px",
      boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
    }}>
      {/* Left: Brand + context breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginRight: "auto" }}>
        <Link href="/dashboard" style={{
          fontWeight: 700,
          fontSize: "20px",
          color: "#111827",
          textDecoration: "none",
          letterSpacing: "-0.3px",
          whiteSpace: "nowrap",
        }}>
          AdvisorOS
        </Link>

        {isClientPage && extractedId && (
          <nav style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "15px", color: "#111827" }}>
            <span style={{ color: "#9ca3af" }}>/</span>
            <span style={{ color: "#6b7280", fontWeight: 400 }}>{extractedId}</span>
            <span style={{ color: "#9ca3af" }}>/</span>
            <span style={{ fontWeight: 600 }}>{fullName}</span>
          </nav>
        )}
      </div>

      {/* Center: Search bar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        backgroundColor: "#f3f4f6",
        border: "1px solid #d1d5db",
        borderRadius: "8px",
        padding: "0 10px",
        height: "36px",
        width: "320px",
        gap: "8px",
        flexShrink: 0,
      }}>
        <Search size={14} color="#9ca3af" />
        <input
          type="text"
          placeholder="Search..."
          style={{
            border: "none",
            background: "transparent",
            outline: "none",
            fontSize: "14px",
            color: "#111827",
            width: "100%",
          }}
        />
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid #d1d5db",
          borderRadius: "4px",
          padding: "1px 5px",
          backgroundColor: "#ffffff",
          color: "#9ca3af",
          fontSize: "11px",
          fontFamily: "monospace",
          userSelect: "none",
          flexShrink: 0,
        }}>
          /
        </div>
      </div>

      {/* Right: Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {/* Bell with notification dot */}
        <button style={{
          position: "relative",
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#6b7280",
          display: "flex",
          alignItems: "center",
          padding: "6px",
          borderRadius: "6px",
        }}>
          <Bell size={20} />
          <span style={{
            position: "absolute",
            top: "5px",
            right: "5px",
            width: "8px",
            height: "8px",
            backgroundColor: "#ef4444",
            borderRadius: "50%",
            border: "2px solid #ffffff",
          }} />
        </button>

        {/* + with chevron */}
        <button style={{
          display: "flex",
          alignItems: "center",
          gap: "2px",
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#6b7280",
          padding: "6px",
          borderRadius: "6px",
        }}>
          <Plus size={20} />
          <ChevronDown size={14} />
        </button>

        {/* Avatar */}
        <img
          src={MOCK_AVATAR}
          alt="Profile"
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            border: "1px solid #d1d5db",
            cursor: "pointer",
            objectFit: "cover",
          }}
        />
      </div>
    </header>
  );
}
