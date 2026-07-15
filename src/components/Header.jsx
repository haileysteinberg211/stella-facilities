export default function Header({ activeTab, setActiveTab }) {
  const tabs = [
    { id: "dashboard", label: "Dashboard" },
    { id: "units", label: "Unit Board" },
    { id: "leads", label: "Demand" },
    { id: "roi", label: "ROI" },
  ];

  return (
    <header style={{
      background: "#fff",
      borderBottom: "1px solid #e8e9eb",
      position: "sticky",
      top: 0,
      zIndex: 50,
    }}>
      <div style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "0 24px",
        height: 52,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 28, height: 28,
            borderRadius: 8,
            background: "linear-gradient(135deg, #7c3aed, #5b21b6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>S</span>
          </div>
          <span style={{ fontWeight: 600, fontSize: 14, color: "#111" }}>Stella</span>
          <span style={{ color: "#d1d5db", fontSize: 13 }}>·</span>
          <span style={{ color: "#6b7280", fontSize: 13 }}>Maplewood Senior Living</span>
        </div>
        <nav style={{ display: "flex", gap: 2 }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                padding: "5px 14px",
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: activeTab === t.id ? 600 : 400,
                background: activeTab === t.id ? "#f3f0ff" : "transparent",
                color: activeTab === t.id ? "#6d28d9" : "#6b7280",
                transition: "all 0.15s",
              }}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
