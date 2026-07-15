import { t } from "../theme.js";

export default function Header({ activeTab, setActiveTab }) {
  const tabs = [
    { id: "dashboard", label: "Dashboard" },
    { id: "units", label: "Unit Board" },
    { id: "leads", label: "Demand" },
    { id: "roi", label: "ROI" },
  ];

  return (
    <header style={{
      background: t.navy,
      position: "sticky",
      top: 0,
      zIndex: 50,
      width: "100%",
      boxShadow: t.shadow,
    }}>
      <div style={{
        maxWidth: 1160,
        margin: "0 auto",
        padding: "16px 22px",
        display: "flex",
        alignItems: "center",
        gap: 16,
      }}>
        {/* Brandmark: coral dot + Stella wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{
            width: 26,
            height: 26,
            borderRadius: "50%",
            background: t.coral,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: t.display,
            fontWeight: 600,
            fontSize: 15,
            color: t.white,
            flexShrink: 0,
          }}>S</span>
          <span style={{
            fontFamily: t.display,
            fontWeight: 600,
            fontSize: 20,
            color: t.white,
          }}>Stella</span>
        </div>

        {/* Muted separator */}
        <span aria-hidden="true" style={{
          width: 1,
          height: 20,
          background: "rgba(198, 214, 224, 0.3)",
          flexShrink: 0,
        }} />

        {/* Community */}
        <span style={{
          fontFamily: t.sans,
          fontSize: 14,
          color: "#C6D6E0",
        }}>Maplewood Senior Living</span>

        {/* Nav links, right-aligned */}
        <nav style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 20 }}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: "transparent",
                  border: "none",
                  borderBottom: `2px solid ${isActive ? t.coral : "transparent"}`,
                  padding: "6px 2px",
                  cursor: "pointer",
                  fontFamily: t.sans,
                  fontWeight: 600,
                  fontSize: 14,
                  lineHeight: 1.4,
                  color: isActive ? t.white : "#C6D6E0",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
