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
      height: "44px",
      backgroundColor: "#f3f4f6",
      borderBottom: "1px solid #e5e7eb",
      zIndex: 100,
      boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
    }}>
      {/* Inner container mirrors the page layout: max-w-[1440px] mx-auto px-8 */}
      <div style={{
        maxWidth: "1440px",
        margin: "0 auto",
        padding: "0 32px",
        height: "100%",
        display: "flex",
        alignItems: "center",
        gap: "16px",
      }}>
        {/* Left: Brand + context breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginRight: "auto" }}>
          <Link href="/dashboard" style={{
            fontWeight: 600,
            fontSize: "15px",
            color: "#111827",
            textDecoration: "none",
            letterSpacing: "-0.2px",
            whiteSpace: "nowrap",
          }}>
            AdvisorOS
          </Link>

          {isClientPage && extractedId && (
            <nav style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "14px", color: "#111827" }}>
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
          backgroundColor: "#ffffff",
          border: "1px solid #d1d5db",
          borderRadius: "7px",
          padding: "0 10px",
          height: "30px",
          width: "280px",
          gap: "7px",
          flexShrink: 0,
        }}>
          <Search size={13} color="#9ca3af" />
          <input
            type="text"
            placeholder="Search..."
            style={{
              border: "none",
              background: "transparent",
              outline: "none",
              fontSize: "13px",
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
            backgroundColor: "#f3f4f6",
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
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          {/* Bell with notification dot */}
          <button style={{
            position: "relative",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#6b7280",
            display: "flex",
            alignItems: "center",
            padding: "5px",
            borderRadius: "6px",
          }}>
            <Bell size={17} />
            <span style={{
              position: "absolute",
              top: "4px",
              right: "4px",
              width: "7px",
              height: "7px",
              backgroundColor: "#ef4444",
              borderRadius: "50%",
              border: "1.5px solid #f3f4f6",
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
            padding: "5px",
            borderRadius: "6px",
          }}>
            <Plus size={17} />
            <ChevronDown size={13} />
          </button>

          {/* Avatar */}
          <img
            src={MOCK_AVATAR}
            alt="Profile"
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              border: "1px solid #d1d5db",
              cursor: "pointer",
              objectFit: "cover",
              marginLeft: "2px",
            }}
          />
        </div>
      </div>
    </header>
  );
}
