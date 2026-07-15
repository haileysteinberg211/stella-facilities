export default function Header({ activeTab, setActiveTab }) {
  const tabs = [
    { id: "dashboard", label: "Dashboard" },
    { id: "units", label: "Unit Board" },
    { id: "leads", label: "Demand" },
    { id: "roi", label: "ROI" },
  ];

  return (
    <header style={{
      background: "rgba(8, 12, 20, 0.72)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(255,255,255,0.08)",
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
            background: "linear-gradient(135deg, #5BBFB5, #3A9E96)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>S</span>
          </div>
          <span style={{ fontWeight: 700, fontSize: 17, color: "#E8E4DC", fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic" }}>Stella</span>
          <span style={{ color: "#252B3B", fontSize: 13 }}>·</span>
          <span style={{ color: "#8B8FA8", fontSize: 13, fontFamily: "'Inter', -apple-system, system-ui, sans-serif" }}>Maplewood Senior Living</span>
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
                borderBottom: activeTab === t.id ? "2px solid #5BBFB5" : "2px solid transparent",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: activeTab === t.id ? 600 : 400,
                background: "transparent",
                color: activeTab === t.id ? "#5BBFB5" : "#8B8FA8",
                transition: "all 0.15s",
                fontFamily: "'Inter', -apple-system, system-ui, sans-serif",
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
